import { BindingScope, inject, injectable, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import {
    ApprovalActionType,
    ApprovalInstructionPayload,
    isInboundWritable,
    isInboundWritableForObject,
    MAPPING_SCHEMA_VERSION,
} from '../../utils/salesforce/salesforce-field-mapping.utils';
import {
    CompanyDocumentStatus,
    CompanyStatus,
    CompanyUserStatusEnum,
    HaulageOfferStatus,
    UserStatus,
    TransportProvider,
    ExpectedTransitTime,
    ECurrency,
    ListingStatus,
    OfferStatusEnum,
} from '../../enum';
import { NotificationType } from '../../enum/notification.enum';
import { SalesforceBindings } from '../../keys/salesforce';
import { HaulageOfferDocuments } from '../../models';
import {
    CompaniesRepository,
    CompanyDocumentsRepository,
    CompanyLocationDocumentsRepository,
    CompanyLocationsRepository,
    CompanyUsersRepository,
    HaulageLoadsRepository,
    HaulageOfferDocumentsRepository,
    HaulageOffersRepository,
    SalesforceSyncLogRepository,
    UserRepository,
    ListingsRepository,
    OffersRepository,
} from '../../repositories';
import { EmailService } from '../email.service';
import { SalesforceSyncService } from './salesforce-sync.service';
import { SalesforceLogger, ENV_PREFIX_PATTERN } from '../../utils/salesforce/salesforce-sync.utils';
import { WasteTradeNotificationsService } from '../waste-trade-notifications.service';
import {
    mapCompanyRole,
    mapCompanyStatus,
    mapCompanyUserStatus,
    mapHaulageOfferStatus,
    mapTransportProvider,
    mapExpectedTransitTime,
    mapCustomsClearance,
    mapCurrency,
    mapListingStatus,
    mapOfferStatus,
    mapLoadStatus,
} from '../../utils/salesforce/salesforce-bidirectional-mapping.utils';
import { HaulageLoadsLoadStatusValues } from '../../utils/salesforce/generated';

const SF_LOAD_STATUS = HaulageLoadsLoadStatusValues;

/**
 * Service to handle Salesforce webhook notifications
 * Implements inbound sync (Salesforce → WasteTrade) for CRM Alignment
 */
@injectable({ scope: BindingScope.TRANSIENT })
export class SalesforceWebhookService {
    constructor(
        @repository(HaulageOffersRepository)
        public haulageOffersRepository: HaulageOffersRepository,
        @repository(HaulageOfferDocumentsRepository)
        public haulageOfferDocumentsRepository: HaulageOfferDocumentsRepository,
        @repository(CompaniesRepository)
        public companiesRepository: CompaniesRepository,
        @repository(UserRepository)
        public userRepository: UserRepository,
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,
        @repository(SalesforceSyncLogRepository)
        public syncLogRepository: SalesforceSyncLogRepository,
        @repository(HaulageLoadsRepository)
        public haulageLoadsRepository: HaulageLoadsRepository,
        @repository(CompanyDocumentsRepository)
        public companyDocumentsRepository: CompanyDocumentsRepository,
        @repository(CompanyLocationDocumentsRepository)
        public companyLocationDocumentsRepository: CompanyLocationDocumentsRepository,
        @repository(CompanyLocationsRepository)
        public companyLocationsRepository: CompanyLocationsRepository,
        @repository(ListingsRepository)
        public listingsRepository: ListingsRepository,
        @repository(OffersRepository)
        public offersRepository: OffersRepository,
        @service(EmailService)
        public emailService: EmailService,
        @service(WasteTradeNotificationsService)
        public wasteTradeNotificationsService: WasteTradeNotificationsService,
        @inject(SalesforceBindings.SYNC_SERVICE, { optional: true })
        private salesforceSyncService?: SalesforceSyncService,
    ) {}

    /**
     * Stamp updateData with inbound sync fields.
     * Tells SyncAwareCrudRepository to NOT mark the record dirty
     * (data originates from SF, no need to push back).
     */
    private markAsSynced(updateData: Record<string, unknown>): void {
        updateData.isSyncedSalesForce = true;
        updateData.lastSyncedSalesForceDate = new Date();
    }

    /** Parse and validate an ISO timestamp from SF payload. Returns null if invalid. */
    private parseSfTimestamp(value: string | undefined): Date | null {
        if (!value) return null;
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }

    /**
     * Helper to log inbound webhook operations
     */
    private async logInbound(
        recordId: string,
        objectType: string,
        operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPSERT',
        status: 'SUCCESS' | 'FAILED' | 'PENDING',
        salesforceId?: string,
        errorMessage?: string,
        fieldsUpdated?: string,
    ): Promise<void> {
        try {
            await this.syncLogRepository.create({
                recordId,
                objectType,
                operation,
                direction: 'INBOUND',
                status,
                salesforceId,
                errorMessage: fieldsUpdated ? `${errorMessage || ''} Fields: ${fieldsUpdated}`.trim() : errorMessage,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            if (errorMsg.includes('Only absolute URLs are supported')) {
                return;
            }
            SalesforceLogger.error('Failed to log inbound webhook', error, { direction: 'inbound', objectType });
        }
    }

    /**
     * Process haulage offer documents received from Salesforce webhook
     */
    async processHaulageDocuments(
        haulageOfferId: number,
        documents: Array<{
            title: string;
            url: string;
            salesforceDocumentId: string;
        }>,
    ): Promise<{ documentsCreated: number; haulageOfferId: number }> {
        const startTime = Date.now();
        let documentsCreated = 0;
        const errors: string[] = [];

        try {
            // Validate haulage offer exists
            const haulageOffer = await this.haulageOffersRepository.findById(haulageOfferId);
            if (!haulageOffer) {
                throw new HttpErrors.NotFound(`Haulage offer with ID ${haulageOfferId} not found`);
            }

            // Validate haulage offer is in correct status for documents
            const validStatuses = [
                HaulageOfferStatus.ACCEPTED,
                HaulageOfferStatus.PARTIALLY_SHIPPED,
                HaulageOfferStatus.SHIPPED,
            ];

            if (!validStatuses.includes(haulageOffer.status)) {
                throw new HttpErrors.BadRequest(
                    `Haulage offer must be ACCEPTED, PARTIALLY_SHIPPED, or SHIPPED to receive documents. Current status: ${haulageOffer.status}`,
                );
            }

            // Validate documents array
            if (!documents || documents.length === 0) {
                throw new HttpErrors.BadRequest('No documents provided in webhook payload');
            }

            // Process each document
            for (const doc of documents) {
                try {
                    // Check if document already exists (prevent duplicates)
                    const existingDoc = await this.haulageOfferDocumentsRepository.findOne({
                        where: {
                            haulageOfferId,
                            salesforceId: doc.salesforceDocumentId,
                        },
                    });

                    if (existingDoc) {
                        SalesforceLogger.info('Document already exists, skipping', { direction: 'inbound', entity: 'HaulageOfferDocument', haulageOfferId, salesforceDocumentId: doc.salesforceDocumentId });
                        continue;
                    }

                    // Create new document record
                    const newDocument = new HaulageOfferDocuments({
                        haulageOfferId,
                        documentTitle: doc.title,
                        documentUrl: doc.url,
                        salesforceId: doc.salesforceDocumentId,
                    });

                    await this.haulageOfferDocumentsRepository.create(newDocument);
                    documentsCreated++;

                    // Log successful document sync
                    await this.syncLogRepository.create({
                        recordId: haulageOfferId.toString(),
                        objectType: 'HaulageOfferDocument',
                        operation: 'CREATE',
                        direction: 'INBOUND',
                        status: 'SUCCESS',
                        salesforceId: doc.salesforceDocumentId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                } catch (docError) {
                    const errorMsg = docError instanceof Error ? docError.message : 'Unknown error';
                    errors.push(`Document ${doc.salesforceDocumentId}: ${errorMsg}`);

                    // Log failed document sync
                    await this.syncLogRepository.create({
                        recordId: haulageOfferId.toString(),
                        objectType: 'HaulageOfferDocument',
                        operation: 'CREATE',
                        direction: 'INBOUND',
                        status: 'FAILED',
                        salesforceId: doc.salesforceDocumentId,
                        errorMessage: errorMsg,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
            }

            // Log overall webhook processing
            const duration = Date.now() - startTime;
            await this.syncLogRepository.create({
                recordId: haulageOfferId.toString(),
                objectType: 'HaulageOfferDocuments',
                operation: 'UPSERT',
                direction: 'INBOUND',
                status: errors.length === 0 ? 'SUCCESS' : 'FAILED',
                errorMessage: errors.length > 0 ? errors.join('; ') : undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            SalesforceLogger.warn('Processed haulage offer documents', { direction: 'inbound', entity: 'HaulageOfferDocuments', haulageOfferId, documentsCreated, durationMs: duration });

            return { documentsCreated, haulageOfferId };
        } catch (error) {
            // Log failed webhook
            await this.syncLogRepository.create({
                recordId: haulageOfferId.toString(),
                objectType: 'HaulageOfferDocuments',
                operation: 'UPSERT',
                direction: 'INBOUND',
                status: 'FAILED',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            throw error;
        }
    }

    /**
     * Get documents for a haulage offer (helper method)
     */
    async getDocumentsForHaulageOffer(haulageOfferId: number): Promise<HaulageOfferDocuments[]> {
        return this.haulageOfferDocumentsRepository.find({
            where: { haulageOfferId },
            order: ['createdAt DESC'],
        });
    }

    /**
     * Delete document by Salesforce ID (for cleanup/testing)
     */
    async deleteDocumentBySalesforceId(salesforceId: string): Promise<void> {
        const document = await this.haulageOfferDocumentsRepository.findOne({
            where: { salesforceId },
        });

        if (document) {
            await this.haulageOfferDocumentsRepository.deleteById(document.id);
            SalesforceLogger.warn('Deleted document by Salesforce ID', { direction: 'inbound', entity: 'HaulageOfferDocument', salesforceId });
        }
    }

    /**
     * Process haulage offer status update from Salesforce webhook
     * Implements bidirectional sync as per AC 6.5.1.4
     * Syncs ALL 35 mapped fields from CSV
     */
    async processHaulageOfferStatusUpdate(payload: {
        haulageOfferId: number;
        salesforceId?: string;
        status: string;
        rejectionReason?: string;
        customRejectionReason?: string;
        adminMessage?: string;
        suggestedCollectionDate?: string;
        transportProvider?: string;
        trailerContainerType?: string;
        completingCustomsClearance?: boolean;
        expectedTransitTime?: string;
        demurrageAtDestination?: number;
        haulageCostPerLoad?: number;
        haulageTotal?: number;
        currency?: string;
        shippedLoads?: number;
        shippedDate?: string;
        // Additional fields from CSV (35 fields total)
        notes?: string;
        numberOfLoads?: number;
        quantityPerLoad?: number;
        customsFee?: number;
        incoterms?: string;
        earliestDeliveryDate?: string;
        latestDeliveryDate?: string;
        // Haulier carrier info (fc = first carrier)
        fcFirstName?: string;
        fcSecondName?: string;
        fcCompanyName?: string;
        // Flags
        offerAccepted?: boolean;
        offerRejected?: boolean;
        destinationCharges?: string;
        haulageExtras?: string;
        soDetails?: string;
        updatedAt: string;
        updatedBy?: string;
        originMarker?: string;
    }): Promise<{
        success: boolean;
        message: string;
        updated: boolean;
        reason?: string;
    }> {
        try {
            if (payload.originMarker?.startsWith('WT_')) {
                SalesforceLogger.warn('Ignoring haulage offer update with WasteTrade origin marker (loop prevention)', { direction: 'inbound', entity: 'HaulageOffer', haulageOfferId: payload.haulageOfferId, originMarker: payload.originMarker });
                return {
                    success: true,
                    message: 'Update ignored - originated from WasteTrade',
                    updated: false,
                    reason: 'loop_prevention',
                };
            }

            // Validate haulage offer exists
            const haulageOffer = await this.haulageOffersRepository.findById(payload.haulageOfferId);
            if (!haulageOffer) {
                throw new HttpErrors.NotFound(`Haulage offer with ID ${payload.haulageOfferId} not found`);
            }

            // Validate Salesforce ID matches if provided
            if (payload.salesforceId && haulageOffer.salesforceId !== payload.salesforceId) {
                SalesforceLogger.warn('Rejecting haulage offer update - Salesforce ID mismatch', { direction: 'inbound', entity: 'HaulageOffer', haulageOfferId: payload.haulageOfferId, payloadSfId: payload.salesforceId, dbSfId: haulageOffer.salesforceId });
                return {
                    success: false,
                    message: 'Salesforce ID mismatch',
                    updated: false,
                    reason: 'salesforce_id_mismatch',
                };
            }

            // Check timestamp - reject stale updates
            const salesforceUpdateTime = this.parseSfTimestamp(payload.updatedAt);
            if (!salesforceUpdateTime) {
                return { success: false, message: 'Invalid or missing updatedAt timestamp', updated: false, reason: 'invalid_timestamp' };
            }
            const wasteTradeUpdateTime = haulageOffer.updatedAt ? new Date(haulageOffer.updatedAt) : new Date(0);

            if (salesforceUpdateTime <= wasteTradeUpdateTime) {
                SalesforceLogger.warn('Rejecting stale update for haulage offer', { direction: 'inbound', entity: 'HaulageOffer', haulageOfferId: payload.haulageOfferId, sfTimestamp: salesforceUpdateTime.toISOString(), wtTimestamp: wasteTradeUpdateTime.toISOString() });
                return {
                    success: false,
                    message: 'Stale update - WasteTrade has newer data',
                    updated: false,
                    reason: 'stale_event',
                };
            }

            // Check for duplicate event (same-second detection)
            if (haulageOffer.lastSyncedSalesForceDate) {
                const lastSyncTime = new Date(haulageOffer.lastSyncedSalesForceDate);
                if (Math.abs(salesforceUpdateTime.getTime() - lastSyncTime.getTime()) < 1000) {
                    return {
                        success: true,
                        message: 'Duplicate event - no changes applied',
                        updated: false,
                        reason: 'duplicate_event',
                    };
                }
            }

            // Map status from SF to WT using bidirectional mapper (pass current status to preserve approved/accepted distinction)
            const wtStatus = mapHaulageOfferStatus(payload.status, true, haulageOffer.status);
            if (!wtStatus || !Object.values(HaulageOfferStatus).includes(wtStatus as HaulageOfferStatus)) {
                SalesforceLogger.warn('Rejecting haulage offer update - invalid status', { direction: 'inbound', entity: 'HaulageOffer', haulageOfferId: payload.haulageOfferId, rawStatus: payload.status, mappedStatus: wtStatus });
                return {
                    success: false,
                    message: `Invalid status: ${payload.status}`,
                    updated: false,
                    reason: 'invalid_status',
                };
            }

            // Validate state transition is allowed
            const currentStatus = haulageOffer.status;
            const newStatus = wtStatus as HaulageOfferStatus;

            // Define invalid transitions (key = current status, value = statuses that cannot be transitioned TO)
            const invalidTransitions: Record<string, string[]> = {
                [HaulageOfferStatus.APPROVED]: [HaulageOfferStatus.PENDING],
                [HaulageOfferStatus.ACCEPTED]: [HaulageOfferStatus.PENDING],
                [HaulageOfferStatus.WITHDRAWN]: [
                    HaulageOfferStatus.PENDING,
                    HaulageOfferStatus.ACCEPTED,
                    HaulageOfferStatus.PARTIALLY_SHIPPED,
                ],
                [HaulageOfferStatus.SHIPPED]: [
                    HaulageOfferStatus.PENDING,
                    HaulageOfferStatus.ACCEPTED,
                    HaulageOfferStatus.REJECTED, // Cannot reject an already shipped offer
                ],
                [HaulageOfferStatus.PARTIALLY_SHIPPED]: [HaulageOfferStatus.PENDING],
                [HaulageOfferStatus.REJECTED]: [
                    HaulageOfferStatus.PENDING,
                    HaulageOfferStatus.ACCEPTED,
                    HaulageOfferStatus.PARTIALLY_SHIPPED,
                    HaulageOfferStatus.SHIPPED,
                ],
            };

            if (invalidTransitions[currentStatus]?.includes(newStatus)) {
                SalesforceLogger.warn('Rejecting haulage offer update - invalid state transition', { direction: 'inbound', entity: 'HaulageOffer', haulageOfferId: payload.haulageOfferId, fromStatus: currentStatus, toStatus: newStatus });
                return {
                    success: false,
                    message: `Invalid state transition from ${currentStatus} to ${newStatus}`,
                    updated: false,
                    reason: 'invalid_state_transition',
                };
            }

            // Build update data
            const updateData: Partial<typeof haulageOffer> = {
                status: newStatus,
            };

            // Map and add all optional fields using bidirectional mappers
            if (payload.rejectionReason !== undefined) {
                updateData.rejectionReason = payload.rejectionReason;
            }
            if (payload.customRejectionReason !== undefined) {
                updateData.customRejectionReason = payload.customRejectionReason;
            }
            if (payload.adminMessage !== undefined) {
                updateData.adminMessage = payload.adminMessage;
            }
            if (payload.suggestedCollectionDate !== undefined) {
                updateData.suggestedCollectionDate = new Date(payload.suggestedCollectionDate);
            }
            if (payload.transportProvider !== undefined) {
                const wtProvider = mapTransportProvider(payload.transportProvider, true);
                if (wtProvider) {
                    updateData.transportProvider = wtProvider as TransportProvider;
                }
            }
            if (payload.trailerContainerType !== undefined) {
                updateData.trailerContainerType = payload.trailerContainerType;
            }
            if (payload.completingCustomsClearance !== undefined) {
                const wtCustoms = mapCustomsClearance(payload.completingCustomsClearance, true);
                updateData.completingCustomsClearance = wtCustoms as boolean;
            }
            if (payload.expectedTransitTime !== undefined) {
                const wtTransit = mapExpectedTransitTime(payload.expectedTransitTime, true);
                if (wtTransit) {
                    updateData.expectedTransitTime = wtTransit as ExpectedTransitTime;
                }
            }
            if (payload.demurrageAtDestination !== undefined) {
                updateData.demurrageAtDestination = payload.demurrageAtDestination;
            }
            if (payload.haulageCostPerLoad !== undefined) {
                // SF field haulage__c is string type, need to parse
                const cost =
                    typeof payload.haulageCostPerLoad === 'string'
                        ? parseFloat(payload.haulageCostPerLoad)
                        : payload.haulageCostPerLoad;
                if (!isNaN(cost)) {
                    updateData.haulageCostPerLoad = cost;
                    // Recalculate haulageTotal: use payload values when available, fallback to DB
                    const loads = payload.numberOfLoads ?? haulageOffer.numberOfLoads ?? 0;
                    const customs = payload.customsFee ?? haulageOffer.customsFee ?? 0;
                    updateData.haulageTotal = cost * loads + customs;
                }
            }
            if (payload.haulageTotal !== undefined && updateData.haulageTotal === undefined) {
                // Only use SF haulageTotal if not already recalculated from haulageCostPerLoad
                // SF field haulage_total__c is string type, need to parse
                const total =
                    typeof payload.haulageTotal === 'string' ? parseFloat(payload.haulageTotal) : payload.haulageTotal;
                if (!isNaN(total)) {
                    updateData.haulageTotal = total;
                }
            }
            if (payload.currency !== undefined) {
                const wtCurrency = mapCurrency(payload.currency, true);
                if (wtCurrency) {
                    updateData.currency = wtCurrency as ECurrency;
                }
            }
            if (payload.shippedLoads !== undefined) {
                updateData.shippedLoads = payload.shippedLoads;
            }
            if (payload.shippedDate !== undefined) {
                updateData.shippedDate = new Date(payload.shippedDate);
            }

            // Additional fields from CSV
            if (payload.notes !== undefined) {
                updateData.notes = payload.notes;
            }
            if (payload.numberOfLoads !== undefined) {
                updateData.numberOfLoads = payload.numberOfLoads;
            }
            if (payload.quantityPerLoad !== undefined) {
                updateData.quantityPerLoad = payload.quantityPerLoad;
            }
            if (payload.customsFee !== undefined) {
                updateData.customsFee = payload.customsFee;
            }

            if (payload.destinationCharges !== undefined) {
                updateData.destinationCharges = payload.destinationCharges;
            }
            if (payload.haulageExtras !== undefined) {
                updateData.haulageExtras = payload.haulageExtras;
            }
            if (payload.soDetails !== undefined) {
                updateData.soDetails = payload.soDetails;
            }

            // Mark as synced to prevent outbound sync loop
            this.markAsSynced(updateData as Record<string, unknown>);

            // Update the haulage offer
            await this.haulageOffersRepository.updateById(payload.haulageOfferId, updateData);

            SalesforceLogger.warn('Updated haulage offer status via Salesforce webhook', { direction: 'inbound', entity: 'HaulageOffer', haulageOfferId: payload.haulageOfferId, fromStatus: currentStatus, toStatus: newStatus });

            // Log successful update
            await this.logInbound(
                payload.haulageOfferId.toString(),
                'HaulageOffer',
                'UPDATE',
                'SUCCESS',
                payload.salesforceId,
            );

            return {
                success: true,
                message: `Successfully updated haulage offer status to ${newStatus}`,
                updated: true,
            };
        } catch (error) {
            SalesforceLogger.error('Error processing haulage offer status update', error, { direction: 'inbound', entity: 'HaulageOffer', haulageOfferId: payload.haulageOfferId });

            // Log failed update
            await this.logInbound(
                payload.haulageOfferId?.toString() || 'unknown',
                'HaulageOffer',
                'UPDATE',
                'FAILED',
                payload.salesforceId,
                error instanceof Error ? error.message : 'Unknown error',
            );

            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                updated: false,
                reason: 'processing_error',
            };
        }
    }

    /**
     * Extract WasteTrade ID from Salesforce external ID
     * Removes environment prefix (DEV_, UAT_, PROD_)
     */
    private extractWasteTradeId(externalId: string): number | null {
        if (!externalId) return null;
        const id = externalId.replace(ENV_PREFIX_PATTERN, '');
        const parsed = parseInt(id, 10);
        return isNaN(parsed) ? null : parsed;
    }

    /**
     * Log inbound webhook operation to database
     */
    private async logInboundSync(
        recordId: string,
        objectType: string,
        operation: 'UPDATE',
        success: boolean,
        salesforceId?: string,
        errorMessage?: string,
    ): Promise<void> {
        try {
            await this.syncLogRepository.create({
                recordId,
                objectType,
                operation,
                direction: 'INBOUND',
                status: success ? 'SUCCESS' : 'FAILED',
                salesforceId,
                errorMessage,
                retryCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } catch (error) {
            SalesforceLogger.error('Error logging inbound webhook operation', error, { direction: 'inbound', objectType, salesforceId });
        }
    }

    /**
     * Alias for logInboundSync (for compatibility)
     */
    private async logSyncOperation(
        objectType: string,
        operation: 'UPDATE',
        success: boolean,
        salesforceId?: string,
        errorMessage?: string | null,
        additionalInfo?: string,
    ): Promise<void> {
        return this.logInboundSync(
            salesforceId || 'unknown',
            objectType,
            operation,
            success,
            salesforceId,
            errorMessage || undefined,
        );
    }

    /**
     * Process Lead update from Salesforce webhook (Push Haulier Data - 6.5.1.1)
     * Updates User in WasteTrade when Lead is updated in Salesforce
     */
    async processLeadUpdate(payload: {
        leadId: string;
        externalId?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        company?: string;
        status?: string;
        updatedAt: string;
        updatedBy?: string;
        originMarker?: string;
    }): Promise<{
        success: boolean;
        message: string;
        updated: boolean;
        reason?: string;
    }> {
        try {
            // Check for loop prevention - ignore updates that originated from WasteTrade
            if (payload.originMarker?.startsWith('WT_')) {
                SalesforceLogger.warn('Ignoring lead update with WasteTrade origin marker (loop prevention)', { direction: 'inbound', entity: 'Lead', leadId: payload.leadId, originMarker: payload.originMarker });
                await this.logInboundSync(payload.externalId || payload.leadId, 'Lead', 'UPDATE', true, payload.leadId);
                return {
                    success: true,
                    message: 'Update ignored - originated from WasteTrade',
                    updated: false,
                    reason: 'loop_prevention',
                };
            }

            // Extract user ID from external ID
            const userId = payload.externalId ? this.extractWasteTradeId(payload.externalId) : null;
            if (!userId) {
                await this.logInboundSync('unknown', 'Lead', 'UPDATE', false, payload.leadId, 'Missing external ID');
                return {
                    success: false,
                    message: 'Missing or invalid externalId (WasteTrade_User_Id__c)',
                    updated: false,
                    reason: 'missing_external_id',
                };
            }

            // Find user
            const user = await this.userRepository.findById(userId).catch(() => null);
            if (!user) {
                await this.logInboundSync(userId.toString(), 'Lead', 'UPDATE', false, payload.leadId, 'User not found');
                return {
                    success: false,
                    message: `User ${userId} not found in WasteTrade`,
                    updated: false,
                    reason: 'user_not_found',
                };
            }

            // Check timestamp - reject stale updates
            const salesforceUpdateTime = this.parseSfTimestamp(payload.updatedAt);
            if (!salesforceUpdateTime) {
                return { success: false, message: 'Invalid or missing updatedAt timestamp', updated: false, reason: 'invalid_timestamp' };
            }
            const wasteTradeUpdateTime = user.updatedAt ? new Date(user.updatedAt) : new Date(0);

            if (salesforceUpdateTime <= wasteTradeUpdateTime) {
                SalesforceLogger.warn('Rejecting stale lead update', { direction: 'inbound', entity: 'Lead', leadId: payload.leadId, userId });
                await this.logInboundSync(userId.toString(), 'Lead', 'UPDATE', false, payload.leadId, 'Stale event');
                return {
                    success: false,
                    message: 'Stale update - WasteTrade has newer data',
                    updated: false,
                    reason: 'stale_event',
                };
            }

            // Build update data - only update fields that are provided
            const updateData: Record<string, unknown> = {};

            if (payload.firstName !== undefined && payload.firstName !== user.firstName) {
                updateData.firstName = payload.firstName;
            }
            if (payload.lastName !== undefined && payload.lastName !== user.lastName) {
                updateData.lastName = payload.lastName;
            }
            if (payload.phone !== undefined && payload.phone !== user.phoneNumber) {
                updateData.phoneNumber = payload.phone;
            }

            // Store Lead ID if not already stored, but skip if user is already converted to Contact
            if (payload.leadId && payload.leadId !== user.salesforceLeadId && !(user.salesforceId && !user.salesforceLeadId)) {
                updateData.salesforceLeadId = payload.leadId;
            }

            // Only update if there are changes
            if (Object.keys(updateData).length === 0) {
                await this.logInboundSync(userId.toString(), 'Lead', 'UPDATE', true, payload.leadId);
                return {
                    success: true,
                    message: 'No changes to apply',
                    updated: false,
                    reason: 'no_changes',
                };
            }

            // Update the user — mark as synced, data originates from SF
            this.markAsSynced(updateData);
            await this.userRepository.updateById(userId, updateData);

            SalesforceLogger.warn('Updated user from Salesforce Lead', { direction: 'inbound', entity: 'Lead', leadId: payload.leadId, userId });
            await this.logInboundSync(userId.toString(), 'Lead', 'UPDATE', true, payload.leadId);

            return {
                success: true,
                message: `Successfully updated user ${userId}`,
                updated: true,
            };
        } catch (error) {
            SalesforceLogger.error('Error processing lead update', error, { direction: 'inbound', entity: 'Lead', leadId: payload.leadId, externalId: payload.externalId });
            await this.logInboundSync(
                payload.externalId || 'unknown',
                'Lead',
                'UPDATE',
                false,
                payload.leadId,
                error instanceof Error ? error.message : 'Unknown error',
            );

            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                updated: false,
                reason: 'processing_error',
            };
        }
    }

    async processAccountUpdate(payload: {
        accountId: string;
        externalId?: string;
        name?: string;
        billingStreet?: string;
        billingCity?: string;
        billingPostalCode?: string;
        billingCountry?: string;
        billingState?: string;
        phone?: string;
        website?: string;
        accountStatus?: string;
        vatNumber?: string;
        registrationNumber?: string;
        // Bidirectional fields (config-declared, previously missing from webhook)
        email?: string;
        mobileNumber?: string;
        fax?: string;
        // Haulier-specific fields
        fleetType?: string;
        areasCovered?: string;
        euCountries?: string;
        containerTypes?: string;
        updatedAt: string;
        updatedBy?: string;
        originMarker?: string;
        mappingVersion?: string;
        fieldsUpdated?: string[]; // List of Salesforce fields that were updated
    }): Promise<{
        success: boolean;
        message: string;
        updated: boolean;
        reason?: string;
    }> {
        try {
            // Validate schema version if provided
            if (payload.mappingVersion && payload.mappingVersion !== MAPPING_SCHEMA_VERSION) {
                const errorMsg = `Mapping version ${payload.mappingVersion} is not supported. Expected ${MAPPING_SCHEMA_VERSION}`;
                await this.logInboundSync(
                    payload.externalId ?? 'unknown',
                    'Account',
                    'UPDATE',
                    false,
                    payload.accountId,
                    `Mapping version mismatch: expected ${MAPPING_SCHEMA_VERSION}, got ${payload.mappingVersion}`,
                );
                throw new HttpErrors.BadRequest(errorMsg);
            }

            // Check for loop prevention - ignore updates that originated from WasteTrade
            if (payload.originMarker?.startsWith('WT_')) {
                SalesforceLogger.warn('Ignoring account update with WasteTrade origin marker (loop prevention)', { direction: 'inbound', entity: 'Account', accountId: payload.accountId, originMarker: payload.originMarker });
                await this.logInboundSync(
                    payload.externalId || payload.accountId,
                    'Account',
                    'UPDATE',
                    true,
                    payload.accountId,
                );
                return {
                    success: true,
                    message: 'Update ignored - originated from WasteTrade',
                    updated: false,
                    reason: 'loop_prevention',
                };
            }

            // Filter out non-writable fields (log but don't reject the entire update)
            const fieldsToUpdate = payload.fieldsUpdated || [];
            const invalidFields = fieldsToUpdate.filter((field) => !isInboundWritable(field, 'Account'));
            if (invalidFields.length > 0) {
                SalesforceLogger.warn('Ignoring non-writable fields in account update', {
                    direction: 'inbound', entity: 'Account', accountId: payload.accountId,
                    ignoredFields: invalidFields,
                });
            }

            // Extract company ID from external ID
            const companyId = payload.externalId ? this.extractWasteTradeId(payload.externalId) : null;
            if (!companyId) {
                await this.logInboundSync(
                    'unknown',
                    'Account',
                    'UPDATE',
                    false,
                    payload.accountId,
                    'Missing external ID',
                );
                // Skip gracefully — Account may not have WasteTrade external ID yet (e.g. created by Lead conversion)
                return {
                    success: false,
                    message: 'Missing or invalid externalId (WasteTrade_Company_Id__c)',
                    updated: false,
                    reason: 'missing_external_id',
                };
            }

            // Find company - try by ID first, then by Salesforce ID
            let company = await this.companiesRepository.findById(companyId).catch(() => null);

            // If not found by ID, try lookup by Salesforce ID
            if (!company && payload.accountId) {
                const companies = await this.companiesRepository.find({
                    where: { salesforceId: payload.accountId },
                    limit: 1,
                });
                company = companies.length > 0 ? companies[0] : null;
            }

            if (!company) {
                await this.logInboundSync(
                    companyId.toString(),
                    'Account',
                    'UPDATE',
                    false,
                    payload.accountId,
                    'Company not found',
                );
                throw new HttpErrors.NotFound(`Company ${companyId} not found in WasteTrade`);
            }

            // Check timestamp - reject stale updates
            const salesforceUpdateTime = this.parseSfTimestamp(payload.updatedAt);
            if (!salesforceUpdateTime) {
                return { success: false, message: 'Invalid or missing updatedAt timestamp', updated: false, reason: 'invalid_timestamp' };
            }
            const wasteTradeUpdateTime = company.updatedAt ? new Date(company.updatedAt) : new Date(0);

            if (salesforceUpdateTime <= wasteTradeUpdateTime) {
                SalesforceLogger.warn('Rejecting stale account update', { direction: 'inbound', entity: 'Account', accountId: payload.accountId, companyId });
                await this.logInboundSync(
                    companyId.toString(),
                    'Account',
                    'UPDATE',
                    false,
                    payload.accountId,
                    'Stale event',
                );
                return {
                    success: false,
                    message: 'Stale update - WasteTrade has newer data',
                    updated: false,
                    reason: 'stale_event',
                };
            }

            // Check for duplicate event (same timestamp and same fields)
            // This is a simple check - in production, you might want to track processed events
            if (company.lastSyncedSalesForceDate) {
                const lastSyncTime = new Date(company.lastSyncedSalesForceDate);
                if (Math.abs(salesforceUpdateTime.getTime() - lastSyncTime.getTime()) < 1000) {
                    // Same second - likely duplicate
                    SalesforceLogger.warn('Possible duplicate event for company', { direction: 'inbound', entity: 'Account', accountId: payload.accountId, companyId });
                    await this.logInboundSync(
                        companyId.toString(),
                        'Account',
                        'UPDATE',
                        true,
                        payload.accountId,
                        'duplicate_event',
                    );
                    return {
                        success: true,
                        message: 'Duplicate event - no changes applied',
                        updated: false,
                        reason: 'duplicate_event',
                    };
                }
            }

            // Build update data - only update fields that are provided and are inbound-writable
            const updateData: Record<string, unknown> = {};
            const fieldsUpdated: string[] = [];

            // Map Salesforce fields to WasteTrade fields using field mapping config
            if (payload.name !== undefined && isInboundWritable('Name', 'Account')) {
                const cleanName = payload.name.replace(ENV_PREFIX_PATTERN, '');
                if (cleanName !== company.name) {
                    updateData.name = cleanName;
                    fieldsUpdated.push('name');
                }
            }
            if (payload.billingStreet !== undefined && isInboundWritable('BillingStreet', 'Account')) {
                if (payload.billingStreet !== company.addressLine1) {
                    updateData.addressLine1 = payload.billingStreet;
                    fieldsUpdated.push('addressLine1');
                }
            }
            if (payload.billingCity !== undefined && isInboundWritable('BillingCity', 'Account')) {
                if (payload.billingCity !== company.city) {
                    updateData.city = payload.billingCity;
                    fieldsUpdated.push('city');
                }
            }
            if (payload.billingPostalCode !== undefined && isInboundWritable('BillingPostalCode', 'Account')) {
                if (payload.billingPostalCode !== company.postalCode) {
                    updateData.postalCode = payload.billingPostalCode;
                    fieldsUpdated.push('postalCode');
                }
            }
            if (payload.billingCountry !== undefined && isInboundWritable('BillingCountry', 'Account')) {
                if (payload.billingCountry !== company.country) {
                    updateData.country = payload.billingCountry;
                    fieldsUpdated.push('country');
                }
            }
            if (payload.billingState !== undefined && isInboundWritable('BillingState', 'Account')) {
                if (payload.billingState !== company.stateProvince) {
                    updateData.stateProvince = payload.billingState;
                    fieldsUpdated.push('stateProvince');
                }
            }
            if (payload.phone !== undefined && isInboundWritable('Phone', 'Account')) {
                if (payload.phone !== company.phoneNumber) {
                    updateData.phoneNumber = payload.phone;
                    fieldsUpdated.push('phoneNumber');
                }
            }
            if (payload.website !== undefined && isInboundWritable('Website', 'Account')) {
                if (payload.website !== company.website) {
                    updateData.website = payload.website;
                    fieldsUpdated.push('website');
                }
            }
            if (payload.accountStatus && isInboundWritable('Account_Status__c', 'Account')) {
                const mappedStatus = mapCompanyStatus(payload.accountStatus, true);
                // Only update if mapping succeeded (undefined = unknown SF value, skip)
                if (mappedStatus && mappedStatus !== company.status) {
                    updateData.status = mappedStatus;
                    fieldsUpdated.push('status');
                }
            }
            // VAT and Registration Number - bidirectional sync
            if (payload.vatNumber !== undefined && isInboundWritable('Company_VAT_Number__c', 'Account')) {
                if (payload.vatNumber !== company.vatNumber) {
                    updateData.vatNumber = payload.vatNumber;
                    fieldsUpdated.push('vatNumber');
                }
            }
            if (
                payload.registrationNumber !== undefined &&
                isInboundWritable('Company_Registration_Number__c', 'Account')
            ) {
                if (payload.registrationNumber !== company.registrationNumber) {
                    updateData.registrationNumber = payload.registrationNumber;
                    fieldsUpdated.push('registrationNumber');
                }
            }
            // Email (Email__c) - bidirectional
            if (payload.email !== undefined && isInboundWritable('Email__c', 'Account')) {
                if (payload.email !== company.email) {
                    updateData.email = payload.email;
                    fieldsUpdated.push('email');
                }
            }
            // Note: Type (SF Account category) NOT synced inbound — different classification from WT CompanyType
            // SF Type = Customer/Supplier/Haulier; WT companyType = recycler/broker/waste_producer
            // Mobile Number (Mobile) - bidirectional
            if (payload.mobileNumber !== undefined && isInboundWritable('Mobile', 'Account')) {
                if (payload.mobileNumber !== company.mobileNumber) {
                    updateData.mobileNumber = payload.mobileNumber;
                    fieldsUpdated.push('mobileNumber');
                }
            }
            // Fax → mobileNumber (SF Fax field stores secondary mobile in outbound)
            // Only apply if mobileNumber not already set above
            if (payload.fax !== undefined && isInboundWritable('Fax', 'Account') && !updateData.mobileNumber) {
                if (payload.fax !== company.mobileNumber) {
                    updateData.mobileNumber = payload.fax;
                    fieldsUpdated.push('mobileNumber');
                }
            }
            // Haulier-specific fields (bidirectional)
            if (payload.fleetType !== undefined) {
                const fleetMap: Record<string, string> = {
                    'Freight Forwarder': 'freight_forwarder',
                    'Own Fleet': 'own_fleet',
                };
                const mapped = fleetMap[payload.fleetType] ?? payload.fleetType;
                if (mapped !== company.fleetType) {
                    updateData.fleetType = mapped;
                    fieldsUpdated.push('fleetType');
                }
            }
            if (payload.areasCovered !== undefined || payload.euCountries !== undefined) {
                // Reconstruct areasCovered array from SF picklist values
                const newAreas: string[] = [];
                if (payload.areasCovered) {
                    const areaMap: Record<string, string> = {
                        'UK Only': 'uk_only',
                        'Worldwide': 'worldwide',
                    };
                    if (areaMap[payload.areasCovered]) {
                        newAreas.push(areaMap[payload.areasCovered]);
                    }
                }
                if (payload.euCountries) {
                    // EU_Countries__c is semicolon-delimited: "Cyprus;Germany;Greece"
                    const countries = payload.euCountries.split(';').map((c: string) =>
                        c.trim().toLowerCase().replace(/\s+/g, '_'),
                    );
                    newAreas.push(...countries);
                }
                if (newAreas.length > 0) {
                    const current = JSON.stringify(company.areasCovered ?? []);
                    if (JSON.stringify(newAreas) !== current) {
                        updateData.areasCovered = newAreas;
                        fieldsUpdated.push('areasCovered');
                    }
                }
            }
            if (payload.containerTypes !== undefined) {
                // WT_Container_Types__c is semicolon-delimited: "Curtain Sider;Walking Floor"
                const newTypes = payload.containerTypes ? payload.containerTypes.split(';').map((t: string) => t.trim()) : [];
                const current = JSON.stringify(company.containerTypes ?? []);
                if (JSON.stringify(newTypes) !== current) {
                    updateData.containerTypes = newTypes;
                    fieldsUpdated.push('containerTypes');
                }
            }

            // Only update if there are changes
            if (Object.keys(updateData).length === 0) {
                await this.logInboundSync(companyId.toString(), 'Account', 'UPDATE', true, payload.accountId);
                return {
                    success: true,
                    message: 'No changes to apply',
                    updated: false,
                    reason: 'no_changes',
                };
            }

            // Store Salesforce ID if not already stored (merge into single DB update)
            if (payload.accountId && payload.accountId !== company.salesforceId) {
                updateData.salesforceId = payload.accountId;
                fieldsUpdated.push('salesforceId');
            }

            // Update the company — mark as synced, data originates from SF
            this.markAsSynced(updateData);
            await this.companiesRepository.updateById(companyId, updateData);

            SalesforceLogger.warn('Updated company from Salesforce Account', { direction: 'inbound', entity: 'Account', accountId: payload.accountId, companyId, fieldsUpdated });

            // Log successful update with fields updated
            await this.logInbound(
                companyId.toString(),
                'Account',
                'UPDATE',
                'SUCCESS',
                payload.accountId,
                undefined,
                fieldsUpdated.join(', '),
            );

            return {
                success: true,
                message: `Successfully updated company ${companyId} (${fieldsUpdated.length} fields)`,
                updated: true,
            };
        } catch (error) {
            SalesforceLogger.error('Error processing account update', error, { direction: 'inbound', entity: 'Account', accountId: payload.accountId, externalId: payload.externalId });

            // Log failed update
            await this.logInbound(
                payload.externalId || 'unknown',
                'Account',
                'UPDATE',
                'FAILED',
                payload.accountId,
                error instanceof Error ? error.message : 'Unknown error',
            );

            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                updated: false,
                reason: 'processing_error',
            };
        }
    }

    async processContactUpdate(payload: {
        contactId: string;
        externalId?: string;
        accountId?: string;
        accountExternalId?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        companyRole?: string;
        isPrimaryContact?: boolean;
        memberStatus?: string;
        // Bidirectional fields (config-declared, previously missing from webhook)
        mobilePhone?: string;
        salutation?: string;
        // Outbound-only fields sent by Apex but previously unhandled
        title?: string;
        jobTitle?: string;
        updatedAt: string;
        updatedBy?: string;
        originMarker?: string;
        mappingVersion?: string;
        fieldsUpdated?: string[]; // List of Salesforce fields that were updated
    }): Promise<{
        success: boolean;
        message: string;
        updated: boolean;
        reason?: string;
    }> {
        try {
            // Validate schema version if provided
            if (payload.mappingVersion && payload.mappingVersion !== MAPPING_SCHEMA_VERSION) {
                const errorMsg = `Mapping version ${payload.mappingVersion} is not supported. Expected ${MAPPING_SCHEMA_VERSION}`;
                await this.logInboundSync(
                    payload.externalId ?? 'unknown',
                    'Contact',
                    'UPDATE',
                    false,
                    payload.contactId,
                    `Mapping version mismatch: expected ${MAPPING_SCHEMA_VERSION}, got ${payload.mappingVersion}`,
                );
                throw new HttpErrors.BadRequest(errorMsg);
            }

            // Check for loop prevention
            if (payload.originMarker?.startsWith('WT_')) {
                SalesforceLogger.warn('Ignoring contact update with WasteTrade origin marker (loop prevention)', { direction: 'inbound', entity: 'Contact', contactId: payload.contactId, originMarker: payload.originMarker });
                await this.logInboundSync(
                    payload.externalId || payload.contactId,
                    'Contact',
                    'UPDATE',
                    true,
                    payload.contactId,
                );
                return {
                    success: true,
                    message: 'Update ignored - originated from WasteTrade',
                    updated: false,
                    reason: 'loop_prevention',
                };
            }

            // Filter out non-writable fields (log but don't reject the entire update)
            const fieldsToUpdate = payload.fieldsUpdated || [];
            const invalidFields = fieldsToUpdate.filter((field) => !isInboundWritable(field, 'Contact'));
            if (invalidFields.length > 0) {
                SalesforceLogger.warn('Ignoring non-writable fields in contact update', {
                    direction: 'inbound', entity: 'Contact', contactId: payload.contactId,
                    ignoredFields: invalidFields,
                });
            }

            // Extract user ID from external ID
            const userId = payload.externalId ? this.extractWasteTradeId(payload.externalId) : null;
            if (!userId) {
                await this.logInboundSync(
                    'unknown',
                    'Contact',
                    'UPDATE',
                    false,
                    payload.contactId,
                    'Missing external ID',
                );
                return {
                    success: false,
                    message: 'Missing or invalid externalId (WasteTrade_User_Id__c)',
                    updated: false,
                    reason: 'missing_external_id',
                };
            }

            // Find user - try by ID first, then by email if provided
            let user = await this.userRepository.findById(userId).catch(() => null);

            // If not found by ID, try lookup by email
            if (!user && payload.email) {
                const users = await this.userRepository.find({
                    where: { email: payload.email },
                    limit: 1,
                });
                user = users.length > 0 ? users[0] : null;
            }

            if (!user) {
                await this.logInboundSync(
                    userId.toString(),
                    'Contact',
                    'UPDATE',
                    false,
                    payload.contactId,
                    'User not found',
                );
                throw new HttpErrors.NotFound(`User ${userId} not found in WasteTrade`);
            }

            // Check timestamp - reject stale updates
            const salesforceUpdateTime = this.parseSfTimestamp(payload.updatedAt);
            if (!salesforceUpdateTime) {
                return { success: false, message: 'Invalid or missing updatedAt timestamp', updated: false, reason: 'invalid_timestamp' };
            }
            const wasteTradeUpdateTime = user.updatedAt ? new Date(user.updatedAt) : new Date(0);

            if (salesforceUpdateTime <= wasteTradeUpdateTime) {
                SalesforceLogger.warn('Rejecting stale contact update', { direction: 'inbound', entity: 'Contact', contactId: payload.contactId, userId });
                await this.logInboundSync(
                    userId.toString(),
                    'Contact',
                    'UPDATE',
                    false,
                    payload.contactId,
                    'Stale event',
                );
                return {
                    success: false,
                    message: 'Stale update - WasteTrade has newer data',
                    updated: false,
                    reason: 'stale_event',
                };
            }

            // Check for duplicate event
            if (user.lastSyncedSalesForceDate) {
                const lastSyncTime = new Date(user.lastSyncedSalesForceDate);
                if (Math.abs(salesforceUpdateTime.getTime() - lastSyncTime.getTime()) < 1000) {
                    SalesforceLogger.warn('Possible duplicate event for user', { direction: 'inbound', entity: 'Contact', contactId: payload.contactId, userId });
                    await this.logInboundSync(
                        userId.toString(),
                        'Contact',
                        'UPDATE',
                        true,
                        payload.contactId,
                        'duplicate_event',
                    );
                    return {
                        success: true,
                        message: 'Duplicate event - no changes applied',
                        updated: false,
                        reason: 'duplicate_event',
                    };
                }
            }

            let userUpdated = false;
            let companyUserUpdated = false;
            const fieldsUpdated: string[] = [];

            // Update user basic info if provided and inbound-writable
            const userUpdateData: Record<string, unknown> = {};
            if (
                payload.firstName !== undefined &&
                isInboundWritable('FirstName', 'Contact') &&
                payload.firstName !== user.firstName
            ) {
                userUpdateData.firstName = payload.firstName;
                fieldsUpdated.push('firstName');
            }
            if (
                payload.lastName !== undefined &&
                isInboundWritable('LastName', 'Contact') &&
                payload.lastName !== user.lastName
            ) {
                userUpdateData.lastName = payload.lastName;
                fieldsUpdated.push('lastName');
            }
            if (
                payload.phone !== undefined &&
                isInboundWritable('Phone', 'Contact') &&
                payload.phone !== user.phoneNumber
            ) {
                userUpdateData.phoneNumber = payload.phone;
                fieldsUpdated.push('phoneNumber');
            }
            // Mobile Phone (MobilePhone) - bidirectional
            if (
                payload.mobilePhone !== undefined &&
                isInboundWritable('MobilePhone', 'Contact') &&
                payload.mobilePhone !== user.mobileNumber
            ) {
                userUpdateData.mobileNumber = payload.mobilePhone;
                fieldsUpdated.push('mobileNumber');
            }
            // Salutation - bidirectional
            if (
                payload.salutation !== undefined &&
                isInboundWritable('Salutation', 'Contact') &&
                payload.salutation !== user.prefix
            ) {
                userUpdateData.prefix = payload.salutation;
                fieldsUpdated.push('prefix');
            }
            // Title (prefix) - WT→SF only in config, but Apex sends it; accept inbound for consistency
            if (payload.title !== undefined && payload.title !== user.prefix && !userUpdateData.prefix) {
                userUpdateData.prefix = payload.title;
                fieldsUpdated.push('prefix');
            }
            // Job Title - WT→SF only in config, but Apex sends it; accept inbound
            if (payload.jobTitle !== undefined && payload.jobTitle !== user.jobTitle) {
                userUpdateData.jobTitle = payload.jobTitle;
                fieldsUpdated.push('jobTitle');
            }

            if (Object.keys(userUpdateData).length > 0) {
                // Mark as synced to prevent outbound sync loop (data originated from SF)
                this.markAsSynced(userUpdateData);
                await this.userRepository.updateById(userId, userUpdateData);
                userUpdated = true;
            }

            // Update CompanyUsers if role/status/isPrimaryContact changed
            if (
                payload.companyRole !== undefined ||
                payload.isPrimaryContact !== undefined ||
                payload.memberStatus !== undefined
            ) {
                // Get company ID from accountExternalId
                const companyId = payload.accountExternalId
                    ? this.extractWasteTradeId(payload.accountExternalId)
                    : null;

                if (companyId) {
                    // Find the company user record
                    const companyUser = await this.companyUsersRepository.findOne({
                        where: { userId, companyId },
                    });

                    if (companyUser) {
                        const companyUserUpdateData: Record<string, unknown> = {};

                        if (
                            payload.companyRole !== undefined &&
                            isInboundWritable('Company_Role__c', 'Contact')
                        ) {
                            // Map SF UPPERCASE to WT lowercase
                            const mappedRole = mapCompanyRole(payload.companyRole, true);
                            if (mappedRole && mappedRole !== companyUser.companyRole) {
                                companyUserUpdateData.companyRole = mappedRole;
                                fieldsUpdated.push('companyRole');
                            }
                        }
                        if (
                            payload.isPrimaryContact !== undefined &&
                            isInboundWritable('Is_Primary_Contact__c', 'Contact') &&
                            payload.isPrimaryContact !== companyUser.isPrimaryContact
                        ) {
                            companyUserUpdateData.isPrimaryContact = payload.isPrimaryContact;
                            fieldsUpdated.push('isPrimaryContact');
                        }
                        if (
                            payload.memberStatus !== undefined &&
                            isInboundWritable('Company_User_Status__c', 'Contact')
                        ) {
                            // Map SF UPPERCASE to WT lowercase
                            const mappedStatus = mapCompanyUserStatus(payload.memberStatus, true);
                            if (mappedStatus && mappedStatus !== companyUser.status) {
                                const oldStatus = companyUser.status;
                                companyUserUpdateData.status = mappedStatus;
                                fieldsUpdated.push('status');

                                // Send notification when status changes to active or rejected from SF
                                if (
                                    mappedStatus === CompanyUserStatusEnum.ACTIVE &&
                                    oldStatus === CompanyUserStatusEnum.PENDING
                                ) {
                                    // User approved from SF - send welcome notification
                                    try {
                                        await this.wasteTradeNotificationsService.createNotification(
                                            userId,
                                            NotificationType.ACCOUNT_VERIFIED,
                                            { message: 'Your account has been approved. You can now access all features.' },
                                        );
                                    } catch (notifError) {
                                        SalesforceLogger.warn('Failed to send approval notification', { direction: 'inbound', entity: 'Contact', contactId: payload.contactId, userId });
                                    }
                                } else if (
                                    mappedStatus === CompanyUserStatusEnum.REJECTED &&
                                    oldStatus === CompanyUserStatusEnum.PENDING
                                ) {
                                    // User rejected from SF - send rejection notification
                                    try {
                                        await this.wasteTradeNotificationsService.createNotification(
                                            userId,
                                            NotificationType.ACCOUNT_REJECTED,
                                            { message: 'Your account application has been rejected.' },
                                        );
                                    } catch (notifError) {
                                        SalesforceLogger.warn('Failed to send rejection notification', { direction: 'inbound', entity: 'Contact', contactId: payload.contactId, userId });
                                    }
                                }
                            }
                        }

                        // Merge salesforceId into main update (single DB call)
                        if (payload.contactId && payload.contactId !== companyUser.salesforceId) {
                            companyUserUpdateData.salesforceId = payload.contactId;
                            fieldsUpdated.push('salesforceId');
                        }

                        if (Object.keys(companyUserUpdateData).length > 0) {
                            this.markAsSynced(companyUserUpdateData);
                            await this.companyUsersRepository.updateById(companyUser.id, companyUserUpdateData);
                            companyUserUpdated = true;
                        }
                    } else {
                        SalesforceLogger.warn('CompanyUser not found, skipping role/status update', { direction: 'inbound', entity: 'Contact', contactId: payload.contactId, userId, companyId });
                    }
                }
            }

            if (!userUpdated && !companyUserUpdated) {
                await this.logInboundSync(userId.toString(), 'Contact', 'UPDATE', true, payload.contactId);
                return {
                    success: true,
                    message: 'No changes to apply',
                    updated: false,
                    reason: 'no_changes',
                };
            }

            SalesforceLogger.warn('Updated user from Salesforce Contact', { direction: 'inbound', entity: 'Contact', contactId: payload.contactId, userId, fieldsUpdated });

            // Log successful update with fields updated
            await this.logInbound(
                userId.toString(),
                'Contact',
                'UPDATE',
                'SUCCESS',
                payload.contactId,
                undefined,
                fieldsUpdated.join(', '),
            );

            return {
                success: true,
                message: `Successfully updated user ${userId} (${fieldsUpdated.length} fields)`,
                updated: true,
            };
        } catch (error) {
            SalesforceLogger.error('Error processing contact update', error, { direction: 'inbound', entity: 'Contact', contactId: payload.contactId, externalId: payload.externalId });

            // Log failed update
            await this.logInbound(
                payload.externalId || 'unknown',
                'Contact',
                'UPDATE',
                'FAILED',
                payload.contactId,
                error instanceof Error ? error.message : 'Unknown error',
            );

            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                updated: false,
                reason: 'processing_error',
            };
        }
    }

    /**
     * Handle load update from Salesforce webhook
     */
    async handleLoadUpdate(payload: {
        loadId?: number;
        salesforceId?: string;
        haulageOfferId?: number;
        loadNumber?: string;
        collectionDate?: string;
        grossWeight?: string;
        palletWeight?: string;
        loadStatus?: string;
        updatedAt: string;
        originMarker?: string;
    }): Promise<{
        status: string;
        message: string;
        updated: boolean;
        reason?: string;
    }> {
        try {
            // Check for loop prevention marker
            if (payload.originMarker?.startsWith('WT_')) {
                return {
                    status: 'success',
                    message: 'Update ignored - originated from WasteTrade',
                    updated: false,
                    reason: 'loop_prevention',
                };
            }

            // Find load by multiple methods (priority: loadId > salesforceId > haulageOfferId+loadNumber)
            let load;
            let foundBy = '';

            // 1. Try by loadId (WasteTrade ID)
            if (payload.loadId) {
                try {
                    load = await this.haulageLoadsRepository.findById(payload.loadId);
                    foundBy = 'loadId';
                } catch {
                    // Not found by loadId
                }
            }

            // 2. Try by salesforceId
            if (!load && payload.salesforceId) {
                const loads = await this.haulageLoadsRepository.find({
                    where: { salesforceId: payload.salesforceId },
                });
                if (loads.length > 0) {
                    load = loads[0];
                    foundBy = 'salesforceId';
                }
            }

            // 3. Try by haulageOfferId + loadNumber
            if (!load && payload.haulageOfferId && payload.loadNumber) {
                const loads = await this.haulageLoadsRepository.find({
                    where: {
                        haulageOfferId: payload.haulageOfferId,
                        loadNumber: payload.loadNumber,
                    },
                });
                if (loads.length > 0) {
                    load = loads[0];
                    foundBy = 'haulageOfferId+loadNumber';
                }
            }

            if (!load) {
                const errorMsg = `Load not found. Tried: loadId=${payload.loadId}, salesforceId=${payload.salesforceId}, haulageOfferId=${payload.haulageOfferId}, loadNumber=${payload.loadNumber}`;
                throw new HttpErrors.NotFound(errorMsg);
            }

            // Check for stale updates
            const payloadTimestamp = this.parseSfTimestamp(payload.updatedAt);
            if (!payloadTimestamp) {
                return { status: 'error', message: 'Invalid or missing updatedAt timestamp', updated: false, reason: 'invalid_timestamp' };
            }
            if (load.updatedAt && new Date(load.updatedAt) > payloadTimestamp) {
                await this.logInboundSync(
                    load.id?.toString() || 'unknown',
                    'Haulage_Loads__c',
                    'UPDATE',
                    false,
                    payload.salesforceId,
                    'Stale update - WasteTrade has newer data',
                );

                return {
                    status: 'error',
                    message: 'Stale update - WasteTrade has newer data',
                    updated: false,
                    reason: 'stale_event',
                };
            }

            // Check for duplicate event (same-second detection)
            if (load.lastSyncedSalesForceDate) {
                const lastSyncTime = new Date(load.lastSyncedSalesForceDate);
                if (Math.abs(payloadTimestamp.getTime() - lastSyncTime.getTime()) < 1000) {
                    return {
                        status: 'success',
                        message: 'Duplicate event - no changes applied',
                        updated: false,
                        reason: 'duplicate_event',
                    };
                }
            }

            // Update load fields — mark as synced, data originates from SF
            const updateData: Record<string, unknown> = {};
            this.markAsSynced(updateData);
            if (payload.collectionDate) updateData.collectionDate = new Date(payload.collectionDate);
            if (payload.grossWeight) {
                const parsed = parseFloat(payload.grossWeight);
                if (!isNaN(parsed)) updateData.grossWeight = parsed;
            }
            if (payload.palletWeight) {
                const parsed = parseFloat(payload.palletWeight);
                if (!isNaN(parsed)) updateData.palletWeight = parsed;
            }
            // Map SF status to WT format (e.g. "Delivered" → "delivered")
            const mappedLoadStatus = payload.loadStatus ? mapLoadStatus(payload.loadStatus, true) : undefined;
            if (mappedLoadStatus) updateData.loadStatus = mappedLoadStatus;
            updateData.updatedAt = new Date();

            const haulageOfferId = load.haulageOfferId;

            if (load.id) {
                await this.haulageLoadsRepository.updateById(load.id, updateData);

                // If load status changed to delivered, update parent offer's shippedLoads count
                if (mappedLoadStatus === SF_LOAD_STATUS.Delivered && load.loadStatus !== SF_LOAD_STATUS.Delivered) {
                    // Get haulage offer
                    const haulageOffer = await this.haulageOffersRepository.findById(haulageOfferId);

                    // Count all delivered loads for this offer
                    const deliveredLoads = await this.haulageLoadsRepository.count({
                        haulageOfferId,
                        loadStatus: SF_LOAD_STATUS.Delivered,
                    });

                    // Update offer's shippedLoads and status — mark as synced since data originates from SF
                    const offerUpdateData: Record<string, unknown> = {
                        shippedLoads: deliveredLoads.count,
                        updatedAt: new Date(),
                    };

                    // Update status based on delivered count
                    if (deliveredLoads.count >= haulageOffer.numberOfLoads) {
                        offerUpdateData.status = HaulageOfferStatus.SHIPPED;
                        offerUpdateData.shippedDate = new Date();
                    } else if (deliveredLoads.count > 0) {
                        offerUpdateData.status = HaulageOfferStatus.PARTIALLY_SHIPPED;
                    }

                    // Mark as synced to prevent outbound sync loop (data originated from SF)
                    this.markAsSynced(offerUpdateData);
                    await this.haulageOffersRepository.updateById(haulageOfferId, offerUpdateData);
                }

                // No sync back to SF — data originated from SF, pushing back creates a loop
            }

            // Log successful update
            if (load.id) {
                await this.logInbound(load.id.toString(), 'HaulageLoad', 'UPDATE', 'SUCCESS', payload.salesforceId);

                return {
                    status: 'success',
                    message: `Successfully updated load ${load.id}`,
                    updated: true,
                };
            } else {
                throw new HttpErrors.InternalServerError('Load ID is missing');
            }
        } catch (error) {
            // Log failed update
            await this.logInbound(
                payload.loadId?.toString() || 'unknown',
                'HaulageLoad',
                'UPDATE',
                'FAILED',
                payload.salesforceId,
                error instanceof Error ? error.message : 'Unknown error',
            );

            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error',
                updated: false,
                reason: 'processing_error',
            };
        }
    }

    async processApprovalInstruction(payload: ApprovalInstructionPayload): Promise<{
        success: boolean;
        message: string;
        approved: boolean;
        reason?: string;
        resultingStatus?: string;
    }> {
        try {
            // Validate schema version if provided
            if (payload.mappingVersion && payload.mappingVersion !== MAPPING_SCHEMA_VERSION) {
                const errorMsg = `Mapping version ${payload.mappingVersion} is not supported. Expected ${MAPPING_SCHEMA_VERSION}`;
                await this.logInboundSync(
                    payload.userId?.toString() ?? payload.externalId ?? 'unknown',
                    'ApprovalInstruction',
                    'UPDATE',
                    false,
                    payload.contactId,
                    errorMsg,
                );
                throw new HttpErrors.BadRequest(errorMsg);
            }

            // Validate action type
            const validActions: ApprovalActionType[] = ['approve_user', 'reject_user', 'request_info'];
            if (!validActions.includes(payload.actionType)) {
                const errorMsg = `Unsupported action type: ${payload.actionType}. Valid values: ${validActions.join(', ')}`;
                await this.logInboundSync(
                    payload.userId?.toString() ?? payload.externalId ?? 'unknown',
                    'ApprovalInstruction',
                    'UPDATE',
                    false,
                    payload.contactId,
                    errorMsg,
                );
                throw new HttpErrors.BadRequest(errorMsg);
            }

            // Extract user ID from payload
            let userId: number | undefined = payload.userId;
            if (!userId && payload.externalId) {
                const extractedId = this.extractWasteTradeId(payload.externalId);
                userId = extractedId ?? undefined;
            }

            if (!userId) {
                await this.logInboundSync(
                    'unknown',
                    'ApprovalInstruction',
                    'UPDATE',
                    false,
                    payload.contactId,
                    'Missing user ID or external ID',
                );
                throw new HttpErrors.NotFound('Missing or invalid userId or externalId (WasteTrade_User_Id__c)');
            }

            // Find user
            const user = await this.userRepository.findById(userId).catch(() => null);
            if (!user) {
                await this.logInboundSync(
                    userId.toString(),
                    'ApprovalInstruction',
                    'UPDATE',
                    false,
                    payload.contactId,
                    'User not found',
                );
                throw new HttpErrors.NotFound(`User ${userId} not found in WasteTrade`);
            }

            // Check timestamp - reject stale instructions
            const instructionTime = this.parseSfTimestamp(payload.timestamp);
            if (!instructionTime) {
                await this.logInboundSync(
                    userId.toString(),
                    'ApprovalInstruction',
                    'UPDATE',
                    false,
                    payload.contactId,
                    'Invalid or missing timestamp',
                );
                throw new HttpErrors.BadRequest('Invalid or missing timestamp in approval instruction');
            }
            const userUpdateTime = user.updatedAt ? new Date(user.updatedAt) : new Date(0);

            if (instructionTime < userUpdateTime) {
                await this.logInboundSync(
                    userId.toString(),
                    'ApprovalInstruction',
                    'UPDATE',
                    false,
                    payload.contactId,
                    'Stale instruction',
                );
                throw new HttpErrors.Conflict('Stale instruction - WasteTrade has newer data');
            }

            // Handle approval action
            if (payload.actionType === 'approve_user') {
                return await this.handleApprovalAction(userId, payload);
            } else if (payload.actionType === 'reject_user') {
                return await this.handleRejectionAction(userId, payload);
            } else if (payload.actionType === 'request_info') {
                return await this.handleRequestInfoAction(userId, payload);
            }

            // Should not reach here
            throw new HttpErrors.BadRequest(`Unsupported action type: ${payload.actionType}`);
        } catch (error) {
            SalesforceLogger.error('Error processing approval instruction', error, { direction: 'inbound', entity: 'ApprovalInstruction', contactId: payload.contactId, actionType: payload.actionType });

            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                approved: false,
                reason: 'processing_error',
            };
        }
    }

    private async handleApprovalAction(
        userId: number,
        payload: ApprovalInstructionPayload,
    ): Promise<{
        success: boolean;
        message: string;
        approved: boolean;
        reason?: string;
        resultingStatus?: string;
    }> {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new HttpErrors.NotFound(`User ${userId} not found`);
            }

            // Check if user is already approved (idempotent)
            if (user.status === UserStatus.ACTIVE) {
                await this.logInboundSync(
                    userId.toString(),
                    'ApprovalInstruction',
                    'UPDATE',
                    true,
                    payload.contactId,
                    'User already approved - idempotent operation',
                );
                return {
                    success: true,
                    message: 'User already approved - no changes applied',
                    approved: false,
                    reason: 'already_approved',
                    resultingStatus: UserStatus.ACTIVE,
                };
            }

            // Check state conflict - user must be in a state that allows approval
            if (user.status === UserStatus.REJECTED) {
                throw new HttpErrors.Conflict('Cannot approve a rejected user. User must be in PENDING status.');
            }

            const date = new Date();

            // Execute approval workflow (same as adminRequestAction)
            // Mark all updates as synced — data originates from SF, prevent outbound re-sync
            const userUpdate: Record<string, unknown> = { status: UserStatus.ACTIVE };
            this.markAsSynced(userUpdate);
            await this.userRepository.updateById(userId, userUpdate);

            // Find CompanyUser — use accountId from payload to resolve correct company for multi-company users
            let companyUserWhere: Record<string, unknown> = { userId };
            if (payload.accountId) {
                const company = await this.companiesRepository.findOne({ where: { salesforceId: payload.accountId } });
                if (company?.id) {
                    companyUserWhere = { userId, companyId: company.id };
                }
            }
            const companyUser = await this.companyUsersRepository.findOne({ where: companyUserWhere });

            if (!companyUser) {
                throw new HttpErrors.BadRequest('User is not associated with a company');
            }

            const cuUpdate: Record<string, unknown> = { status: CompanyUserStatusEnum.ACTIVE };
            this.markAsSynced(cuUpdate);
            await this.companyUsersRepository.updateById(companyUser.id, cuUpdate);
            const companyUpdate: Record<string, unknown> = { status: CompanyStatus.ACTIVE, verifiedAt: date };
            this.markAsSynced(companyUpdate);
            await this.companiesRepository.updateById(companyUser.companyId, companyUpdate);

            // Update company documents
            await this.companyDocumentsRepository.updateAll(
                {
                    status: CompanyDocumentStatus.ACTIVE,
                    reviewedAt: date,
                },
                { companyId: companyUser.companyId },
            );

            // Update company location documents
            const companyLocations = await this.companyLocationsRepository.find({
                where: { companyId: companyUser.companyId },
            });

            await Promise.all(
                companyLocations.map((location) =>
                    this.companyLocationDocumentsRepository.updateAll(
                        {
                            status: CompanyDocumentStatus.ACTIVE,
                            reviewedAt: date,
                        },
                        {
                            companyLocationId: location.id,
                        },
                    ),
                ),
            );

            // Send notifications (same as admin approval)
            await Promise.all([
                this.emailService.sendAccountVerificationApprovedEmail(user),
                this.wasteTradeNotificationsService.createNotification(
                    user.id ?? 0,
                    NotificationType.ACCOUNT_VERIFIED,
                    {},
                ),
            ]);

            // Convert Lead to Contact in Salesforce (if not already done) and sync status
            if (this.salesforceSyncService) {
                try {
                    const conversionResult = await this.salesforceSyncService.convertLeadToAccountContact(userId, 'webhook');
                    if (conversionResult.success && companyUser?.companyId) {
                        // Sync company after conversion to push status and all mapped fields
                        await this.salesforceSyncService.syncCompany(companyUser.companyId, true, false, 'webhook');

                        const allCompanyUsers = await this.companyUsersRepository.find({
                            where: {
                                companyId: companyUser.companyId,
                                status: CompanyUserStatusEnum.ACTIVE,
                            },
                        });

                        for (const cu of allCompanyUsers) {
                            if (!cu.id) continue;
                            try {
                                await this.salesforceSyncService.syncCompanyUser(cu.id, true, false, 'webhook');
                            } catch (cuError) {
                                SalesforceLogger.error('Sync failed for company user during inbound approval', cuError, { entity: 'CompanyUser', companyUserId: cu.id, action: 'webhook_approve' });
                            }
                        }
                    }

                    // Sync user/contact to push status update
                    const updatedUser = await this.userRepository.findById(userId);
                    if (updatedUser && companyUser && companyUser.id) {
                        // Sync as Contact (after conversion) to push status
                        await this.salesforceSyncService.syncCompanyUser(companyUser.id, true, false, 'webhook');
                    }
                } catch (syncError) {
                    SalesforceLogger.error('Sync failed during inbound approval webhook', syncError, { entity: 'User', userId, action: 'webhook_approve' });
                    // Don't fail approval if sync fails - will be retried by cronjob
                }
            }

            // Log successful approval
            await this.logInboundSync(
                userId.toString(),
                'ApprovalInstruction',
                'UPDATE',
                true,
                payload.contactId,
                `User approved via Salesforce. Approver: ${payload.approverIdentity ?? 'unknown'}`,
            );

            SalesforceLogger.warn('User approved via Salesforce approval instruction', { direction: 'inbound', entity: 'ApprovalInstruction', contactId: payload.contactId, userId, approver: payload.approverIdentity ?? 'unknown' });

            return {
                success: true,
                message: `User ${userId} approved successfully`,
                approved: true,
                resultingStatus: UserStatus.ACTIVE,
            };
        } catch (error) {
            await this.logInboundSync(
                userId.toString(),
                'ApprovalInstruction',
                'UPDATE',
                false,
                payload.contactId,
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    }

    private async handleRejectionAction(
        userId: number,
        payload: ApprovalInstructionPayload,
    ): Promise<{
        success: boolean;
        message: string;
        approved: boolean;
        reason?: string;
        resultingStatus?: string;
    }> {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new HttpErrors.NotFound(`User ${userId} not found`);
            }

            // Check if user is already rejected (idempotent)
            if (user.status === UserStatus.REJECTED) {
                await this.logInboundSync(
                    userId.toString(),
                    'ApprovalInstruction',
                    'UPDATE',
                    true,
                    payload.contactId,
                    'User already rejected - idempotent operation',
                );
                return {
                    success: true,
                    message: 'User already rejected - no changes applied',
                    approved: false,
                    reason: 'already_rejected',
                    resultingStatus: UserStatus.REJECTED,
                };
            }

            // Check state conflict - cannot reject an already approved user
            if (user.status === UserStatus.ACTIVE) {
                throw new HttpErrors.Conflict('Cannot reject an approved user. User must be in PENDING status.');
            }

            const date = new Date();
            const rejectReason = payload.reason ?? 'Rejected via Salesforce';

            // Execute rejection workflow (same as adminRequestAction)
            // Mark all updates as synced — data originates from SF, prevent outbound re-sync
            const userUpdate: Record<string, unknown> = { status: UserStatus.REJECTED };
            this.markAsSynced(userUpdate);
            await this.userRepository.updateById(userId, userUpdate);

            // Find CompanyUser — use accountId from payload to resolve correct company for multi-company users
            let companyUserWhere: Record<string, unknown> = { userId };
            if (payload.accountId) {
                const company = await this.companiesRepository.findOne({ where: { salesforceId: payload.accountId } });
                if (company?.id) {
                    companyUserWhere = { userId, companyId: company.id };
                }
            }
            const companyUser = await this.companyUsersRepository.findOne({ where: companyUserWhere });

            if (!companyUser) {
                throw new HttpErrors.BadRequest('User is not associated with a company');
            }

            const cuUpdate: Record<string, unknown> = { status: CompanyUserStatusEnum.REJECTED };
            this.markAsSynced(cuUpdate);
            await this.companyUsersRepository.updateById(companyUser.id, cuUpdate);
            const companyUpdate: Record<string, unknown> = { status: CompanyStatus.REJECTED, rejectionReason: rejectReason };
            this.markAsSynced(companyUpdate);
            await this.companiesRepository.updateById(companyUser.companyId, companyUpdate);

            // Update company documents
            await this.companyDocumentsRepository.updateAll(
                {
                    status: CompanyDocumentStatus.REJECTED,
                    reviewedAt: date,
                    rejectionReason: rejectReason,
                },
                { companyId: companyUser.companyId },
            );

            // Update company location documents
            const companyLocations = await this.companyLocationsRepository.find({
                where: { companyId: companyUser.companyId },
            });

            await Promise.all(
                companyLocations.map((location) =>
                    this.companyLocationDocumentsRepository.updateAll(
                        {
                            status: CompanyDocumentStatus.REJECTED,
                            reviewedAt: date,
                            rejectionReason: rejectReason,
                        },
                        {
                            companyLocationId: location.id,
                        },
                    ),
                ),
            );

            // Send notifications (same as admin rejection)
            await Promise.all([
                this.emailService.sendCompanyRejectedEmail(user, rejectReason),
                this.wasteTradeNotificationsService.createNotification(
                    user.id ?? 0,
                    NotificationType.ACCOUNT_REJECTED,
                    {
                        rejectionReason: rejectReason,
                    },
                ),
            ]);

            // Sync status to Salesforce
            if (this.salesforceSyncService) {
                try {
                    if (companyUser?.companyId) {
                        // Sync company to push status
                        await this.salesforceSyncService.syncCompany(companyUser.companyId, true, false, 'webhook');
                    }
                    if (companyUser?.id) {
                        // Sync contact to push status
                        await this.salesforceSyncService.syncCompanyUser(companyUser.id, true, false, 'webhook');
                    }
                } catch (syncError) {
                    SalesforceLogger.error('Sync failed during inbound rejection webhook', syncError, { entity: 'User', userId, action: 'webhook_reject' });
                    // Don't fail rejection if sync fails
                }
            }

            // Log successful rejection
            await this.logInboundSync(
                userId.toString(),
                'ApprovalInstruction',
                'UPDATE',
                true,
                payload.contactId,
                `User rejected via Salesforce. Approver: ${payload.approverIdentity ?? 'unknown'}, Reason: ${rejectReason}`,
            );

            SalesforceLogger.warn('User rejected via Salesforce approval instruction', { direction: 'inbound', entity: 'ApprovalInstruction', contactId: payload.contactId, userId, approver: payload.approverIdentity ?? 'unknown', rejectReason });

            return {
                success: true,
                message: `User ${userId} rejected successfully`,
                approved: false,
                reason: rejectReason,
                resultingStatus: UserStatus.REJECTED,
            };
        } catch (error) {
            await this.logInboundSync(
                userId.toString(),
                'ApprovalInstruction',
                'UPDATE',
                false,
                payload.contactId,
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    }

    private async handleRequestInfoAction(
        userId: number,
        payload: ApprovalInstructionPayload,
    ): Promise<{
        success: boolean;
        message: string;
        approved: boolean;
        reason?: string;
        resultingStatus?: string;
    }> {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new HttpErrors.NotFound(`User ${userId} not found`);
            }

            // Check state conflict - cannot request info from approved/rejected users
            if (user.status === UserStatus.ACTIVE) {
                throw new HttpErrors.Conflict('Cannot request information from an approved user.');
            }
            if (user.status === UserStatus.REJECTED) {
                throw new HttpErrors.Conflict('Cannot request information from a rejected user.');
            }

            const date = new Date();
            const adminMessage = payload.message ?? 'Additional information required';

            // Find CompanyUser — use accountId from payload to resolve correct company for multi-company users
            let companyUserWhere: Record<string, unknown> = { userId };
            if (payload.accountId) {
                const company = await this.companiesRepository.findOne({ where: { salesforceId: payload.accountId } });
                if (company?.id) {
                    companyUserWhere = { userId, companyId: company.id };
                }
            }
            const companyUser = await this.companyUsersRepository.findOne({ where: companyUserWhere });

            if (!companyUser) {
                throw new HttpErrors.BadRequest('User is not associated with a company');
            }

            // Execute request_info workflow (same as adminRequestAction)
            // Mark all updates as synced — data originates from SF, prevent outbound re-sync
            const userUpdate: Record<string, unknown> = { status: UserStatus.REQUEST_INFORMATION };
            this.markAsSynced(userUpdate);
            await this.userRepository.updateById(userId, userUpdate);
            const cuUpdate: Record<string, unknown> = { status: CompanyUserStatusEnum.REQUEST_INFORMATION };
            this.markAsSynced(cuUpdate);
            await this.companyUsersRepository.updateById(companyUser.id, cuUpdate);
            const companyUpdate: Record<string, unknown> = { status: CompanyStatus.REQUEST_INFORMATION, adminMessage };
            this.markAsSynced(companyUpdate);
            await this.companiesRepository.updateById(companyUser.companyId, companyUpdate);

            // Update company documents
            await this.companyDocumentsRepository.updateAll(
                {
                    status: CompanyDocumentStatus.REQUEST_INFORMATION,
                },
                { companyId: companyUser.companyId },
            );

            // Update company location documents
            const companyLocations = await this.companyLocationsRepository.find({
                where: { companyId: companyUser.companyId },
            });

            await Promise.all(
                companyLocations.map((location) =>
                    this.companyLocationDocumentsRepository.updateAll(
                        {
                            status: CompanyDocumentStatus.REQUEST_INFORMATION,
                            reviewedAt: date,
                        },
                        {
                            companyLocationId: location.id,
                        },
                    ),
                ),
            );

            // Send notifications (same as admin request_info)
            await this.emailService.sendCompanyRequestInformationEmail(user, adminMessage);

            // Sync status to Salesforce
            if (this.salesforceSyncService) {
                try {
                    if (companyUser?.companyId) {
                        // Sync company to push status
                        await this.salesforceSyncService.syncCompany(companyUser.companyId, true, false, 'webhook');
                    }
                    if (companyUser?.id) {
                        // Sync contact to push status
                        await this.salesforceSyncService.syncCompanyUser(companyUser.id, true, false, 'webhook');
                    }
                } catch (syncError) {
                    SalesforceLogger.error('Sync failed during inbound request_info webhook', syncError, { entity: 'User', userId, action: 'webhook_request_info' });
                    // Don't fail request_info if sync fails
                }
            }

            // Log successful request_info
            await this.logInboundSync(
                userId.toString(),
                'ApprovalInstruction',
                'UPDATE',
                true,
                payload.contactId,
                `Information requested via Salesforce. Approver: ${payload.approverIdentity ?? 'unknown'}, Message: ${adminMessage}`,
            );

            SalesforceLogger.warn('Information requested for user via Salesforce approval instruction', { direction: 'inbound', entity: 'ApprovalInstruction', contactId: payload.contactId, userId, approver: payload.approverIdentity ?? 'unknown' });

            return {
                success: true,
                message: `Information request sent successfully for user ${userId}`,
                approved: false,
                reason: adminMessage,
                resultingStatus: CompanyStatus.REQUEST_INFORMATION,
            };
        } catch (error) {
            await this.logInboundSync(
                userId.toString(),
                'ApprovalInstruction',
                'UPDATE',
                false,
                payload.contactId,
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    }

    /**
     * Process Listing update from Salesforce webhook (6.5.1.4)
     * Syncs ALL mapped fields bidirectionally per BA confirmation
     */
    async processListingStatusUpdate(payload: {
        listingId?: number;
        externalId?: string;
        salesforceId?: string;
        status?: string;
        rejectionReason?: string;
        // Additional fields from CSV mapping
        description?: string;
        materialWeight?: number;
        numberOfLoads?: number;
        packagingType?: string;
        storageType?: string;
        availableFromDate?: string;
        currency?: string;
        // NEW fields from CSV checklist
        materialType?: string;
        materialGroup?: string;
        material?: string;
        pricePerTonne?: number;
        indicatedPrice?: number;
        materialLocation?: string;
        updatedAt: string;
        updatedBy?: string;
        originMarker?: string;
    }): Promise<{
        success: boolean;
        message: string;
        updated: boolean;
        reason?: string;
    }> {
        try {
            // Loop prevention
            if (payload.originMarker?.startsWith('WT_')) {
                return {
                    success: true,
                    message: 'Update ignored - originated from WasteTrade',
                    updated: false,
                    reason: 'loop_prevention',
                };
            }

            // Find listing by ID or external ID
            let listingId = payload.listingId;
            if (!listingId && payload.externalId) {
                listingId = this.extractWasteTradeId(payload.externalId) ?? undefined;
            }

            if (!listingId) {
                await this.logInbound(
                    'unknown',
                    'Sales_Listing__c',
                    'UPDATE',
                    'FAILED',
                    payload.salesforceId,
                    'Missing listing ID',
                );
                return {
                    success: false,
                    message: 'Missing or invalid listingId or externalId',
                    updated: false,
                    reason: 'missing_id',
                };
            }

            const listing = await this.listingsRepository.findById(listingId).catch(() => null);
            if (!listing) {
                await this.logInbound(
                    listingId.toString(),
                    'Sales_Listing__c',
                    'UPDATE',
                    'FAILED',
                    payload.salesforceId,
                    'Listing not found',
                );
                return {
                    success: false,
                    message: `Listing ${listingId} not found`,
                    updated: false,
                    reason: 'not_found',
                };
            }

            // Check timestamp - reject stale updates
            const sfUpdateTime = this.parseSfTimestamp(payload.updatedAt);
            if (!sfUpdateTime) {
                return { success: false, message: 'Invalid or missing updatedAt timestamp', updated: false, reason: 'invalid_timestamp' };
            }
            const wtUpdateTime = listing.updatedAt ? new Date(listing.updatedAt) : new Date(0);
            if (sfUpdateTime <= wtUpdateTime) {
                await this.logInbound(
                    listingId.toString(),
                    'Sales_Listing__c',
                    'UPDATE',
                    'FAILED',
                    payload.salesforceId,
                    'Stale event',
                );
                return {
                    success: false,
                    message: 'Stale update - WasteTrade has newer data',
                    updated: false,
                    reason: 'stale_event',
                };
            }

            // Check for duplicate event (same-second detection)
            if (listing.lastSyncedSalesForceDate) {
                const lastSyncTime = new Date(listing.lastSyncedSalesForceDate);
                if (Math.abs(sfUpdateTime.getTime() - lastSyncTime.getTime()) < 1000) {
                    return {
                        success: true,
                        message: 'Duplicate event - no changes applied',
                        updated: false,
                        reason: 'duplicate_event',
                    };
                }
            }

            // Build update data with all mapped fields
            const updateData: Record<string, unknown> = { updatedAt: new Date() };
            this.markAsSynced(updateData);
            const fieldsUpdated: string[] = [];

            // Status field
            if (payload.status !== undefined) {
                const wtStatus = mapListingStatus(payload.status, true);
                if (wtStatus && Object.values(ListingStatus).includes(wtStatus as ListingStatus)) {
                    const currentStatus = listing.status;
                    const newStatus = wtStatus as ListingStatus;

                    // Validate state transition
                    const invalidTransitions: Record<string, string[]> = {
                        [ListingStatus.SOLD]: [ListingStatus.PENDING, ListingStatus.AVAILABLE],
                        [ListingStatus.EXPIRED]: [ListingStatus.PENDING],
                    };

                    if (!invalidTransitions[currentStatus]?.includes(newStatus)) {
                        updateData.status = newStatus;
                        fieldsUpdated.push('status');
                    }
                }
            }

            // Rejection reason
            if (payload.rejectionReason !== undefined) {
                updateData.rejectionReason = payload.rejectionReason;
                fieldsUpdated.push('rejectionReason');
            }

            // Description (Description__c)
            if (payload.description !== undefined) {
                updateData.description = payload.description;
                fieldsUpdated.push('description');
            }

            // Material Weight (Material_Weight__c)
            if (payload.materialWeight !== undefined) {
                updateData.materialWeight = payload.materialWeight;
                fieldsUpdated.push('materialWeight');
            }

            // Number of Loads (Number_of_Loads__c)
            if (payload.numberOfLoads !== undefined) {
                updateData.numberOfLoads = payload.numberOfLoads;
                fieldsUpdated.push('numberOfLoads');
            }

            // Packaging Type (Packaging_Type__c) -> materialPacking
            if (payload.packagingType && typeof payload.packagingType === 'string') {
                updateData.materialPacking = payload.packagingType.toLowerCase();
                fieldsUpdated.push('materialPacking');
            }

            // Storage Type (Storage_Type__c) -> wasteStoration
            if (payload.storageType && typeof payload.storageType === 'string') {
                updateData.wasteStoration = payload.storageType.toLowerCase();
                fieldsUpdated.push('wasteStoration');
            }

            // Available From Date (Available_From_Date__c) -> startDate
            if (payload.availableFromDate !== undefined) {
                updateData.startDate = new Date(payload.availableFromDate);
                fieldsUpdated.push('startDate');
            }

            // Currency (CurrencyIsoCode)
            if (payload.currency !== undefined) {
                const wtCurrency = mapCurrency(payload.currency, true);
                if (wtCurrency) {
                    updateData.currency = wtCurrency;
                    fieldsUpdated.push('currency');
                }
            }

            // Material Type (Material_Type__c / Material_Group__c / Group__c)
            if (payload.materialType && typeof payload.materialType === 'string') {
                updateData.materialType = payload.materialType.toLowerCase();
                fieldsUpdated.push('materialType');
            } else if (payload.materialGroup && typeof payload.materialGroup === 'string') {
                updateData.materialType = payload.materialGroup.toLowerCase();
                fieldsUpdated.push('materialType');
            }

            // Material Item (Material__c picklist)
            if (payload.material !== undefined) {
                updateData.materialItem = payload.material;
                fieldsUpdated.push('materialItem');
            }

            // Price Per Tonne (Price_Per_Tonne__c / Indicated_Price__c)
            if (payload.pricePerTonne !== undefined) {
                updateData.pricePerMetricTonne = payload.pricePerTonne;
                fieldsUpdated.push('pricePerMetricTonne');
            } else if (payload.indicatedPrice !== undefined) {
                updateData.pricePerMetricTonne = payload.indicatedPrice;
                fieldsUpdated.push('pricePerMetricTonne');
            }

            // Material Location (Material_Location__c) -> locationId
            // Note: This requires mapping location name to ID - skip if can't resolve
            if (payload.materialLocation !== undefined && payload.materialLocation !== '') {
                // Try to find location by name for this company
                try {
                    const location = await this.companyLocationsRepository.findOne({
                        where: {
                            companyId: listing.companyId,
                            locationName: payload.materialLocation,
                        },
                    });
                    if (location) {
                        updateData.locationId = location.id;
                        fieldsUpdated.push('locationId');
                    }
                } catch (locError) {
                    SalesforceLogger.warn('Could not resolve material location for listing', { direction: 'inbound', entity: 'Sales_Listing__c', listingId, materialLocation: payload.materialLocation });
                }
            }

            // Only update if there are changes
            if (fieldsUpdated.length === 0) {
                return {
                    success: true,
                    message: 'No changes to apply',
                    updated: false,
                    reason: 'no_changes',
                };
            }

            // Update listing
            await this.listingsRepository.updateById(listingId, updateData);

            SalesforceLogger.warn('Updated listing via Salesforce webhook', { direction: 'inbound', entity: 'Sales_Listing__c', listingId, salesforceId: payload.salesforceId, fieldsUpdated });

            await this.logInbound(
                listingId.toString(),
                'Sales_Listing__c',
                'UPDATE',
                'SUCCESS',
                payload.salesforceId,
                undefined,
                fieldsUpdated.join(','),
            );

            return {
                success: true,
                message: `Successfully updated listing ${listingId} fields: ${fieldsUpdated.join(', ')}`,
                updated: true,
            };
        } catch (error) {
            SalesforceLogger.error('Error processing listing update', error, { direction: 'inbound', entity: 'Sales_Listing__c', listingId: payload.listingId, externalId: payload.externalId });
            await this.logInbound(
                payload.listingId?.toString() || payload.externalId || 'unknown',
                'Sales_Listing__c',
                'UPDATE',
                'FAILED',
                payload.salesforceId,
                error instanceof Error ? error.message : 'Unknown error',
            );

            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                updated: false,
                reason: 'processing_error',
            };
        }
    }

    /**
     * Process Offer (Bid) update from Salesforce webhook (6.5.1.4)
     * Syncs ALL mapped fields bidirectionally per BA confirmation
     */
    async processOfferStatusUpdate(payload: {
        offerId?: number;
        externalId?: string;
        salesforceId?: string;
        status?: string;
        rejectionReason?: string;
        // Additional fields from CSV mapping
        offeredPricePerUnit?: number;
        currency?: string;
        incoterms?: string;
        numberOfLoadsBidOn?: number;
        materialWeight?: number;
        quantity?: number;
        totalPrice?: number;
        earliestDeliveryDate?: string;
        latestDeliveryDate?: string;
        // Location fields from CSV checklist
        buyerLocation?: string;
        sellerLocation?: string;
        updatedAt: string;
        updatedBy?: string;
        originMarker?: string;
    }): Promise<{
        success: boolean;
        message: string;
        updated: boolean;
        reason?: string;
    }> {
        try {
            // Loop prevention
            if (payload.originMarker?.startsWith('WT_')) {
                return {
                    success: true,
                    message: 'Update ignored - originated from WasteTrade',
                    updated: false,
                    reason: 'loop_prevention',
                };
            }

            // Find offer by ID or external ID
            let offerId = payload.offerId;
            if (!offerId && payload.externalId) {
                offerId = this.extractWasteTradeId(payload.externalId) ?? undefined;
            }

            if (!offerId) {
                await this.logInbound(
                    'unknown',
                    'Offers__c',
                    'UPDATE',
                    'FAILED',
                    payload.salesforceId,
                    'Missing offer ID',
                );
                return {
                    success: false,
                    message: 'Missing or invalid offerId or externalId',
                    updated: false,
                    reason: 'missing_id',
                };
            }

            const offer = await this.offersRepository.findById(offerId).catch(() => null);
            if (!offer) {
                await this.logInbound(
                    offerId.toString(),
                    'Offers__c',
                    'UPDATE',
                    'FAILED',
                    payload.salesforceId,
                    'Offer not found',
                );
                return {
                    success: false,
                    message: `Offer ${offerId} not found`,
                    updated: false,
                    reason: 'not_found',
                };
            }

            // Check timestamp - reject stale updates
            const sfUpdateTime = this.parseSfTimestamp(payload.updatedAt);
            if (!sfUpdateTime) {
                return { success: false, message: 'Invalid or missing updatedAt timestamp', updated: false, reason: 'invalid_timestamp' };
            }
            const wtUpdateTime = offer.updatedAt ? new Date(offer.updatedAt) : new Date(0);
            if (sfUpdateTime <= wtUpdateTime) {
                await this.logInbound(
                    offerId.toString(),
                    'Offers__c',
                    'UPDATE',
                    'FAILED',
                    payload.salesforceId,
                    'Stale event',
                );
                return {
                    success: false,
                    message: 'Stale update - WasteTrade has newer data',
                    updated: false,
                    reason: 'stale_event',
                };
            }

            // Check for duplicate event (same-second detection)
            if (offer.lastSyncedSalesForceDate) {
                const lastSyncTime = new Date(offer.lastSyncedSalesForceDate);
                if (Math.abs(sfUpdateTime.getTime() - lastSyncTime.getTime()) < 1000) {
                    return {
                        success: true,
                        message: 'Duplicate event - no changes applied',
                        updated: false,
                        reason: 'duplicate_event',
                    };
                }
            }

            // Build update data with all mapped fields
            const updateData: Record<string, unknown> = {
                updatedAt: new Date(),
            };
            const fieldsUpdated: string[] = [];

            // Status field (bid_status__c)
            if (payload.status !== undefined) {
                const wtStatus = mapOfferStatus(payload.status, true);
                if (wtStatus && Object.values(OfferStatusEnum).includes(wtStatus as OfferStatusEnum)) {
                    const currentStatus = offer.status || OfferStatusEnum.PENDING;
                    const newStatus = wtStatus as OfferStatusEnum;

                    // Validate state transition (key = current status, value = statuses that cannot be transitioned TO)
                    const invalidTransitions: Record<string, string[]> = {
                        [OfferStatusEnum.ACCEPTED]: [OfferStatusEnum.PENDING],
                        [OfferStatusEnum.REJECTED]: [OfferStatusEnum.PENDING, OfferStatusEnum.ACCEPTED],
                        [OfferStatusEnum.SHIPPED]: [
                            OfferStatusEnum.PENDING,
                            OfferStatusEnum.REJECTED,
                            OfferStatusEnum.ACCEPTED, // Cannot revert shipped offer
                        ],
                        [OfferStatusEnum.PARTIALLY_SHIPPED]: [OfferStatusEnum.PENDING],
                    };

                    if (!invalidTransitions[currentStatus]?.includes(newStatus)) {
                        updateData.status = newStatus;
                        fieldsUpdated.push('status');

                        if (newStatus === OfferStatusEnum.ACCEPTED) {
                            updateData.acceptedAt = new Date();
                        }
                    }
                }
            }

            // Rejection reason
            if (payload.rejectionReason !== undefined) {
                updateData.rejectionReason = payload.rejectionReason;
                fieldsUpdated.push('rejectionReason');
            }

            // Offered Price Per Unit (Offered_Price_Per_Unit__c)
            if (payload.offeredPricePerUnit !== undefined) {
                updateData.offeredPricePerUnit = payload.offeredPricePerUnit;
                fieldsUpdated.push('offeredPricePerUnit');
            }

            // Currency (Currency__c)
            if (payload.currency !== undefined) {
                const wtCurrency = mapCurrency(payload.currency, true);
                if (wtCurrency) {
                    updateData.currency = wtCurrency;
                    fieldsUpdated.push('currency');
                }
            }

            // Incoterms (Incoterms__c)
            if (payload.incoterms !== undefined) {
                updateData.incoterms = payload.incoterms;
                fieldsUpdated.push('incoterms');
            }

            // Number of Loads Bid On (number_of_loads_bid_on__c) -> quantity
            if (payload.numberOfLoadsBidOn !== undefined) {
                updateData.quantity = payload.numberOfLoadsBidOn;
                fieldsUpdated.push('quantity');
            }

            // Quantity (Quantity__c) - alternative field
            if (payload.quantity !== undefined && !fieldsUpdated.includes('quantity')) {
                updateData.quantity = payload.quantity;
                fieldsUpdated.push('quantity');
            }

            // Total Price (Total_Price__c)
            if (payload.totalPrice !== undefined) {
                updateData.totalPrice = payload.totalPrice;
                fieldsUpdated.push('totalPrice');
            }

            // Earliest Delivery Date (Earliest_Delivery_Date__c)
            if (payload.earliestDeliveryDate !== undefined) {
                updateData.earliestDeliveryDate = new Date(payload.earliestDeliveryDate);
                fieldsUpdated.push('earliestDeliveryDate');
            }

            // Latest Delivery Date (Latest_Delivery_Date__c)
            if (payload.latestDeliveryDate !== undefined) {
                updateData.latestDeliveryDate = new Date(payload.latestDeliveryDate);
                fieldsUpdated.push('latestDeliveryDate');
            }

            // Buyer Location (Buyer_Location__c) -> buyerLocationId
            if (payload.buyerLocation !== undefined && payload.buyerLocation !== '') {
                try {
                    const location = await this.companyLocationsRepository.findOne({
                        where: { locationName: payload.buyerLocation },
                    });
                    if (location) {
                        updateData.buyerLocationId = location.id;
                        fieldsUpdated.push('buyerLocationId');
                    }
                } catch (locError) {
                    SalesforceLogger.warn('Could not resolve buyer location for offer', { direction: 'inbound', entity: 'Offers__c', offerId, buyerLocation: payload.buyerLocation });
                }
            }

            // Seller Location (Seller_Location__c) -> sellerLocationId
            if (payload.sellerLocation !== undefined && payload.sellerLocation !== '') {
                try {
                    const location = await this.companyLocationsRepository.findOne({
                        where: { locationName: payload.sellerLocation },
                    });
                    if (location) {
                        updateData.sellerLocationId = location.id;
                        fieldsUpdated.push('sellerLocationId');
                    }
                } catch (locError) {
                    SalesforceLogger.warn('Could not resolve seller location for offer', { direction: 'inbound', entity: 'Offers__c', offerId, sellerLocation: payload.sellerLocation });
                }
            }

            // Only update if there are changes
            if (fieldsUpdated.length === 0) {
                return {
                    success: true,
                    message: 'No changes to apply',
                    updated: false,
                    reason: 'no_changes',
                };
            }

            // Update offer — mark as synced, data originates from SF
            this.markAsSynced(updateData);
            await this.offersRepository.updateById(offerId, updateData);

            SalesforceLogger.warn('Updated offer via Salesforce webhook', { direction: 'inbound', entity: 'Offers__c', offerId, salesforceId: payload.salesforceId, fieldsUpdated });

            await this.logInbound(
                offerId.toString(),
                'Offers__c',
                'UPDATE',
                'SUCCESS',
                payload.salesforceId,
                undefined,
                fieldsUpdated.join(','),
            );

            return {
                success: true,
                message: `Successfully updated offer ${offerId} fields: ${fieldsUpdated.join(', ')}`,
                updated: true,
            };
        } catch (error) {
            SalesforceLogger.error('Error processing offer update', error, { direction: 'inbound', entity: 'Offers__c', offerId: payload.offerId, externalId: payload.externalId });
            await this.logInbound(
                payload.offerId?.toString() || payload.externalId || 'unknown',
                'Offers__c',
                'UPDATE',
                'FAILED',
                payload.salesforceId,
                error instanceof Error ? error.message : 'Unknown error',
            );

            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                updated: false,
                reason: 'processing_error',
            };
        }
    }

    /**
     * Process Wanted Listing update from Salesforce webhook (6.5.1.4)
     * Syncs ALL mapped fields bidirectionally per BA confirmation
     */
    async processWantedListingStatusUpdate(payload: {
        listingId?: number;
        externalId?: string;
        salesforceId?: string;
        status?: string;
        rejectionReason?: string;
        // Additional fields from CSV mapping
        quantity?: number;
        mfiRange?: string;
        packagingType?: string;
        storageType?: string;
        comments?: string;
        availableFrom?: string;
        // NEW fields from CSV checklist
        materialType?: string;
        materialGroup?: string;
        locationOfWaste?: string;
        updatedAt: string;
        updatedBy?: string;
        originMarker?: string;
    }): Promise<{
        success: boolean;
        message: string;
        updated: boolean;
        reason?: string;
    }> {
        try {
            // Loop prevention
            if (payload.originMarker?.startsWith('WT_')) {
                return {
                    success: true,
                    message: 'Update ignored - originated from WasteTrade',
                    updated: false,
                    reason: 'loop_prevention',
                };
            }

            // Find listing by ID or external ID
            let listingId = payload.listingId;
            if (!listingId && payload.externalId) {
                listingId = this.extractWasteTradeId(payload.externalId) ?? undefined;
            }

            if (!listingId) {
                await this.logInbound(
                    'unknown',
                    'Wanted_Listings__c',
                    'UPDATE',
                    'FAILED',
                    payload.salesforceId,
                    'Missing listing ID',
                );
                return {
                    success: false,
                    message: 'Missing or invalid listingId or externalId',
                    updated: false,
                    reason: 'missing_id',
                };
            }

            const listing = await this.listingsRepository.findById(listingId).catch(() => null);
            if (!listing) {
                await this.logInbound(
                    listingId.toString(),
                    'Wanted_Listings__c',
                    'UPDATE',
                    'FAILED',
                    payload.salesforceId,
                    'Listing not found',
                );
                return {
                    success: false,
                    message: `Wanted Listing ${listingId} not found`,
                    updated: false,
                    reason: 'not_found',
                };
            }

            // Check timestamp - reject stale updates
            const sfUpdateTime = this.parseSfTimestamp(payload.updatedAt);
            if (!sfUpdateTime) {
                return { success: false, message: 'Invalid or missing updatedAt timestamp', updated: false, reason: 'invalid_timestamp' };
            }
            const wtUpdateTime = listing.updatedAt ? new Date(listing.updatedAt) : new Date(0);
            if (sfUpdateTime <= wtUpdateTime) {
                await this.logInbound(
                    listingId.toString(),
                    'Wanted_Listings__c',
                    'UPDATE',
                    'FAILED',
                    payload.salesforceId,
                    'Stale event',
                );
                return {
                    success: false,
                    message: 'Stale update - WasteTrade has newer data',
                    updated: false,
                    reason: 'stale_event',
                };
            }

            // Check for duplicate event (same-second detection)
            if (listing.lastSyncedSalesForceDate) {
                const lastSyncTime = new Date(listing.lastSyncedSalesForceDate);
                if (Math.abs(sfUpdateTime.getTime() - lastSyncTime.getTime()) < 1000) {
                    return {
                        success: true,
                        message: 'Duplicate event - no changes applied',
                        updated: false,
                        reason: 'duplicate_event',
                    };
                }
            }

            // Build update data with all mapped fields
            const updateData: Record<string, unknown> = { updatedAt: new Date() };
            this.markAsSynced(updateData);
            const fieldsUpdated: string[] = [];

            // Status field (Listing_Status__c)
            if (payload.status !== undefined) {
                const wtStatus = mapListingStatus(payload.status, true);
                if (wtStatus && Object.values(ListingStatus).includes(wtStatus as ListingStatus)) {
                    updateData.status = wtStatus as ListingStatus;
                    fieldsUpdated.push('status');
                }
            }

            // Rejection reason
            if (payload.rejectionReason !== undefined) {
                updateData.rejectionReason = payload.rejectionReason;
                fieldsUpdated.push('rejectionReason');
            }

            // Quantity (Quantity__c) -> materialWeightWanted
            if (payload.quantity !== undefined) {
                updateData.materialWeightWanted = payload.quantity;
                fieldsUpdated.push('materialWeightWanted');
            }

            // MFI Range (MFI_Range__c) -> materialFlowIndex
            if (payload.mfiRange) {
                // Map SF MFI values to WT enum
                const mfiMap: Record<string, string> = {
                    'Low (0.1-10)': 'low',
                    'Medium (10-40)': 'medium',
                    'High (40+)': 'high',
                };
                const wtMfi = mfiMap[payload.mfiRange] || payload.mfiRange.toLowerCase();
                updateData.materialFlowIndex = wtMfi;
                fieldsUpdated.push('materialFlowIndex');
            }

            // How its packaged (How_its_packaged__c) -> materialPacking
            if (payload.packagingType) {
                updateData.materialPacking = payload.packagingType.toLowerCase();
                fieldsUpdated.push('materialPacking');
            }

            // How its Stored (How_its_Stored__c) -> wasteStoration
            if (payload.storageType) {
                updateData.wasteStoration = payload.storageType.toLowerCase();
                fieldsUpdated.push('wasteStoration');
            }

            // Comments (Comments__c) -> additionalNotes
            if (payload.comments !== undefined) {
                updateData.additionalNotes = payload.comments;
                fieldsUpdated.push('additionalNotes');
            }

            // Available From (Available_From__c) -> startDate
            if (payload.availableFrom !== undefined) {
                updateData.startDate = new Date(payload.availableFrom);
                fieldsUpdated.push('startDate');
            }

            // Material Type (Material_Type__c / Material_Group__c)
            if (payload.materialType) {
                updateData.materialType = payload.materialType.toLowerCase();
                fieldsUpdated.push('materialType');
            } else if (payload.materialGroup) {
                updateData.materialType = payload.materialGroup.toLowerCase();
                fieldsUpdated.push('materialType');
            }

            // Location of Waste (Location_of_Waste__c) -> locationId
            if (payload.locationOfWaste !== undefined && payload.locationOfWaste !== '') {
                try {
                    const location = await this.companyLocationsRepository.findOne({
                        where: {
                            companyId: listing.companyId,
                            locationName: payload.locationOfWaste,
                        },
                    });
                    if (location) {
                        updateData.locationId = location.id;
                        fieldsUpdated.push('locationId');
                    }
                } catch (locError) {
                    SalesforceLogger.warn('Could not resolve location of waste for wanted listing', { direction: 'inbound', entity: 'Wanted_Listings__c', listingId, locationOfWaste: payload.locationOfWaste });
                }
            }

            // Only update if there are changes
            if (fieldsUpdated.length === 0) {
                return {
                    success: true,
                    message: 'No changes to apply',
                    updated: false,
                    reason: 'no_changes',
                };
            }

            // Update listing
            await this.listingsRepository.updateById(listingId, updateData);

            SalesforceLogger.warn('Updated wanted listing via Salesforce webhook', { direction: 'inbound', entity: 'Wanted_Listings__c', listingId, salesforceId: payload.salesforceId, fieldsUpdated });

            // No sync back to SF — data originated from SF, pushing back creates a loop

            await this.logInbound(
                listingId.toString(),
                'Wanted_Listings__c',
                'UPDATE',
                'SUCCESS',
                payload.salesforceId,
                undefined,
                fieldsUpdated.join(','),
            );

            return {
                success: true,
                message: `Successfully updated wanted listing ${listingId} fields: ${fieldsUpdated.join(', ')}`,
                updated: true,
            };
        } catch (error) {
            SalesforceLogger.error('Error processing wanted listing update', error, { direction: 'inbound', entity: 'Wanted_Listings__c', listingId: payload.listingId, externalId: payload.externalId });
            await this.logInbound(
                payload.listingId?.toString() || payload.externalId || 'unknown',
                'Wanted_Listings__c',
                'UPDATE',
                'FAILED',
                payload.salesforceId,
                error instanceof Error ? error.message : 'Unknown error',
            );

            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                updated: false,
                reason: 'processing_error',
            };
        }
    }
}
