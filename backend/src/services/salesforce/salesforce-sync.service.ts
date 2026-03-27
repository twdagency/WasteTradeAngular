/* eslint-disable @typescript-eslint/no-explicit-any */

import { BindingScope, inject, injectable } from '@loopback/core';
import { repository } from '@loopback/repository';
import { SalesforceBindings } from '../../keys/salesforce';
import { Companies, SalesforceSyncLog } from '../../models';
import {
    CompaniesRepository,
    UserRepository,
    ListingsRepository,
    MaterialUsersRepository,
    CompanyLocationsRepository,
    SalesforceSyncLogRepository,
    OffersRepository,
    CompanyDocumentsRepository,
    CompanyLocationDocumentsRepository,
    ListingDocumentsRepository,
    CompanyUsersRepository,
    HaulageOffersRepository,
    HaulageLoadsRepository,
} from '../../repositories';
import { SalesforceService } from './salesforce.service';
import { CompanyStatus } from '../../enum/company.enum';
import { CompanyUserStatusEnum } from '../../enum/company-users.enum';
import { OfferStatusEnum } from '../../enum/offer.enum';
import { SyncResult, BulkSyncResult } from '../../types/salesforce';
import { ListingType, ListingStatus } from '../../enum/listing.enum';
import {
    SalesforceErrorHandler,
    SalesforceLogger,
    SalesforceConfigUtils,
    SalesforceCircuitBreaker,
    SyncMetricsCollector,
    SyncableRecord,
    filterRecordsNeedingSync,
} from '../../utils/salesforce/salesforce-sync.utils';

// Import utility functions
import {
    formatErrorMessage,
    isCustomFieldError,
    cleanSalesforceData,
    addEnvironmentPrefixToExternalId,
    ENV_PREFIX_PATTERN,
    getEnvironmentPrefix,
    needsSync,
    escapeSoql,
} from '../../utils/salesforce/salesforce-sync.utils';
import {
    mapCompanyToAccount,
    mapUserToLead,
    mapListingToSalesListing,
    mapOfferToSalesforceOffer,
    mapCompanyDocumentToSalesforceDocument,
    mapLocationDocumentToSalesforceDocument,
    mapListingToWantedListing,
    mapCompanyUserToContact,
    mapHaulageOfferToSalesforce,
    mapHaulageLoadToSalesforce,
} from '../../utils/salesforce/salesforce-object-mappers.utils';
import { getOutboundFields, MAPPING_SCHEMA_VERSION } from '../../utils/salesforce/salesforce-field-mapping.utils';
import {
    mapCompanyRole,
    mapCompanyUserStatus,
    mapCompanyStatus,
    mapHaulageOfferStatus,
    mapTransportProvider,
    mapCustomsClearance,
    mapOfferStatus,
    mapListingStatus,
} from '../../utils/salesforce/salesforce-bidirectional-mapping.utils';
import {
    AccountFields,
    LeadFields,
    ContactFields,
    HaulageOffersFields,
    SalesListingFields,
    WantedListingFields,
    OffersFields,
    HaulageLoadsFields,
} from '../../utils/salesforce/generated';

@injectable({ scope: BindingScope.TRANSIENT })
export class SalesforceSyncService {
    private circuitBreaker = SalesforceCircuitBreaker.getInstance();
    private metricsCollector = SyncMetricsCollector.getInstance();


    constructor(
        @inject(SalesforceBindings.SERVICE)
        private salesforceService: SalesforceService,
        @repository(CompaniesRepository)
        private companiesRepository: CompaniesRepository,
        @repository(UserRepository)
        private userRepository: UserRepository,
        @repository(ListingsRepository)
        private listingsRepository: ListingsRepository,
        @repository(MaterialUsersRepository)
        private materialUsersRepository: MaterialUsersRepository,
        @repository(CompanyLocationsRepository)
        private companyLocationsRepository: CompanyLocationsRepository,
        @repository(SalesforceSyncLogRepository)
        private syncLogRepository: SalesforceSyncLogRepository,
        @repository(OffersRepository)
        private offersRepository: OffersRepository,
        @repository(CompanyDocumentsRepository)
        private companyDocumentsRepository: CompanyDocumentsRepository,
        @repository(CompanyLocationDocumentsRepository)
        private companyLocationDocumentsRepository: CompanyLocationDocumentsRepository,
        @repository(ListingDocumentsRepository)
        private listingDocumentsRepository: ListingDocumentsRepository,
        @repository(CompanyUsersRepository)
        private companyUsersRepository: CompanyUsersRepository,
        @repository(HaulageOffersRepository)
        private haulageOffersRepository: HaulageOffersRepository,
        @repository(HaulageLoadsRepository)
        private haulageLoadsRepository: HaulageLoadsRepository,
    ) {}

    /**
     * Check if Salesforce connection is available before syncing
     */
    async checkSalesforceConnection(): Promise<boolean> {
        // Check circuit breaker first
        if (this.circuitBreaker.isCircuitOpen()) {
            SalesforceLogger.warn('Salesforce circuit breaker is open, skipping connection check');
            return false;
        }

        try {
            const isConnected = await this.salesforceService.isConnected();
            if (isConnected) {
                this.circuitBreaker.recordSuccess();
            } else {
                this.circuitBreaker.recordFailure();
            }
            return isConnected;
        } catch (error) {
            this.circuitBreaker.recordFailure();
            SalesforceLogger.error('Failed to check Salesforce connection', error);
            return false;
        }
    }

    /**
     * Get circuit breaker status
     */
    getCircuitBreakerStatus(): { isOpen: boolean; failures: number; lastFailureTime: Date | null } {
        return this.circuitBreaker.getStatus();
    }

    /**
     * Get sync metrics summary
     */
    getMetricsSummary(): Record<string, unknown> {
        return this.metricsCollector.getSummary();
    }

    /**
     * Reset circuit breaker (for manual recovery)
     */
    resetCircuitBreaker(): void {
        this.circuitBreaker.reset();
        SalesforceLogger.warn('Circuit breaker manually reset');
    }

    /**
     * Utility function to chunk array into batches
     */
    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * Process items in parallel batches with controlled concurrency and retry failed items
     * Only logs final results to avoid duplicate logs during retries
     */
    // Max records per entity per cron retry run — prevents long-running syncs
    static readonly MAX_RETRY_ITEMS = 50;

    private async processBatches<T extends SyncableRecord>(
        items: T[],
        processor: (item: T) => Promise<SyncResult>,
        objectType: string,
        maxAttempts = 5,
        suppressErrorLog = false,
    ): Promise<BulkSyncResult> {
        // Check circuit breaker before processing
        if (this.circuitBreaker.isCircuitOpen()) {
            SalesforceLogger.warn(`Circuit breaker open, skipping batch processing for ${objectType}`);
            return {
                total: items.length,
                successful: 0,
                failed: items.length,
                skipped: 0,
                errors: [{ recordId: 'all', error: 'Circuit breaker is open - Salesforce unavailable' }],
            };
        }

        const startTime = Date.now();
        let toProcess = [...items];
        let attempt = 0;
        const processedIds = new Set<string | number>();
        // Track last error for each record (not cumulative)
        const lastErrorByRecord = new Map<string | number, string>();
        const finalState = new Map<string | number, 'success' | 'skipped' | 'failed'>();
        // Track if custom object is missing (to avoid retrying)
        let customObjectMissing = false;
        const everFailedIds = new Set<string | number>();
        const eventuallySucceededIds = new Set<string | number>();

        while (toProcess.length > 0 && attempt < maxAttempts && !customObjectMissing) {
            attempt++;
            const batchSize = SalesforceConfigUtils.getBatchSize();
            const batchDelay = SalesforceConfigUtils.getBatchDelay();
            const batches = this.chunkArray(toProcess, batchSize);

            if (toProcess.length > 100 && attempt === 1) {
                SalesforceLogger.warn('Processing large batch - this may take a while', {
                    objectType,
                    totalItems: toProcess.length,
                    batchCount: batches.length,
                });
            }

            const failedItems: T[] = [];

            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                try {
                    const batchPromises = batch.map(async (item) => {
                        try {
                            const result = await processor(item);
                            // Record success/failure for circuit breaker
                            if (result.success && !result.skipped) {
                                this.circuitBreaker.recordSuccess();
                            }
                            return result;
                        } catch (error) {
                            this.circuitBreaker.recordFailure();
                            return {
                                success: false,
                                error: SalesforceErrorHandler.extractErrorMessage(error),
                            };
                        }
                    });

                    const batchResults = await Promise.allSettled(batchPromises);

                    batchResults.forEach((promiseResult, index) => {
                        const item = batch[index];
                        const itemId = item?.id ?? index;
                        if (promiseResult.status === 'fulfilled') {
                            const syncResult = promiseResult.value;
                            if (syncResult.skipped) {
                                finalState.set(itemId, 'skipped');
                                processedIds.add(itemId);
                            } else if (syncResult.success) {
                                finalState.set(itemId, 'success');
                                processedIds.add(itemId);
                                if (everFailedIds.has(itemId)) {
                                    eventuallySucceededIds.add(itemId);
                                }
                            } else {
                                finalState.set(itemId, 'failed');
                                const errMsg = syncResult.error ?? 'Unknown error';
                                // Only track last error per record
                                lastErrorByRecord.set(itemId, errMsg);
                                failedItems.push(item);
                                everFailedIds.add(itemId);

                                // Check if custom object is missing - stop retrying if so
                                if ((syncResult as any).isCustomObjectMissing || errMsg.includes('does not exist')) {
                                    customObjectMissing = true;
                                }
                            }
                        } else {
                            finalState.set(itemId, 'failed');
                            const errMsg = promiseResult.reason?.message ?? 'Promise rejected';
                            lastErrorByRecord.set(itemId, errMsg);
                            failedItems.push(item);
                            everFailedIds.add(itemId);
                        }
                    });

                    if (i < batches.length - 1 && batchDelay > 0) {
                        await new Promise((resolve) => setTimeout(resolve, batchDelay));
                    }
                } catch (error) {
                    this.circuitBreaker.recordFailure();
                    batch.forEach((item, index) => {
                        const itemId = item?.id ?? index;
                        finalState.set(itemId, 'failed');
                        const errMsg = SalesforceErrorHandler.extractErrorMessage(error);
                        lastErrorByRecord.set(itemId, errMsg);
                        failedItems.push(item);
                        everFailedIds.add(itemId);
                    });
                }

                // Check circuit breaker after each batch
                if (this.circuitBreaker.isCircuitOpen()) {
                    SalesforceLogger.warn(`Circuit breaker opened during batch processing, stopping ${objectType}`);
                    break;
                }
            }

            // Stop if circuit breaker is open
            if (this.circuitBreaker.isCircuitOpen()) {
                break;
            }

            toProcess = failedItems.filter((item) => {
                const itemId = item?.id;
                return itemId !== undefined && !processedIds.has(itemId);
            });

            if (toProcess.length > 0 && attempt < maxAttempts && !customObjectMissing) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }

        // Count final states
        let successful = 0;
        let failed = 0;
        let skipped = 0;
        finalState.forEach((state) => {
            if (state === 'success') successful++;
            else if (state === 'failed') failed++;
            else if (state === 'skipped') skipped++;
        });

        const overallResults: BulkSyncResult = {
            total: items.length,
            successful,
            failed,
            skipped,
            errors: [],
        };

        // Build error summary from final failed records only (not retried ones)
        const errorSummary: Map<string, { count: number; recordIds: Array<string | number> }> = new Map();
        finalState.forEach((state, itemId) => {
            if (state === 'failed') {
                const errMsg = lastErrorByRecord.get(itemId) ?? 'Unknown error';
                if (!errorSummary.has(errMsg)) {
                    errorSummary.set(errMsg, { count: 1, recordIds: [itemId] });
                } else {
                    const entry = errorSummary.get(errMsg)!;
                    entry.count++;
                    entry.recordIds.push(itemId);
                }
            }
        });

        // Log summary of errors if any remain
        if (failed > 0 && errorSummary.size > 0) {
            // Check if it's a custom object missing error - log once clearly
            const objectMissingError = Array.from(errorSummary.keys()).find(
                (err) => err.includes('does not exist') || err.includes('resource does not exist'),
            );

            if (objectMissingError) {
                SalesforceLogger.error(
                    `❌ SALESFORCE OBJECT MISSING: "${objectType}" does not exist in Salesforce`,
                    undefined,
                    {
                        objectType,
                        failedCount: failed,
                        action: 'Please create this custom object in Salesforce Setup before syncing',
                    },
                );
                overallResults.errors.push({
                    recordId: 'all',
                    error: `Custom object "${objectType}" does not exist in Salesforce. Please create it in Salesforce Setup.`,
                });
            } else {
                // Log other errors grouped by type
                errorSummary.forEach((entry, errMsg) => {
                    SalesforceLogger.error(`Batch sync failed: ${errMsg}`, undefined, {
                        objectType,
                        failedCount: entry.count,
                        sampleRecordIds: entry.recordIds.slice(0, 5),
                    });
                    overallResults.errors.push({
                        recordId: entry.recordIds.slice(0, 5).join(','),
                        error: `${errMsg} (${entry.count} records)`,
                    });
                });
            }
        }

        // Record metrics
        const duration = Date.now() - startTime;
        this.metricsCollector.recordBatch(objectType, overallResults);

        // Add extended stats
        (overallResults as any).totalErrorRecords = everFailedIds.size;
        (overallResults as any).retriedAndSucceeded = eventuallySucceededIds.size;
        (overallResults as any).stillFailedAfterRetry = toProcess.length;
        (overallResults as any).durationMs = duration;
        (overallResults as any).customObjectMissing = customObjectMissing;

        return overallResults;
    }

    /**
     * Execute Salesforce operation (simplified - no field retry needed since all fields exist)
     */
    private async executeOperation(
        objectType: string,
        operation: () => Promise<{ success: boolean; salesforceId?: string; error?: string }>,
        suppressErrorLog = false,
    ): Promise<SyncResult> {
        try {
            const result = await operation();

            if (!result.success) {
                // Suppress "Only absolute URLs are supported" error - it's a known issue with relative URLs
                const isUrlError = result.error?.includes('Only absolute URLs are supported');
                if (!suppressErrorLog && !isUrlError) {
                    SalesforceLogger.error('Sync operation failed', result.error, { objectType });
                }
                throw new Error(result.error);
            }

            return {
                success: result.success,
                salesforceId: result.salesforceId,
            };
        } catch (error: unknown) {
            const errorMessage = SalesforceErrorHandler.extractErrorMessage(error);
            const errorObj = error as { errorCode?: string; message?: string; name?: string };

            // Suppress "Only absolute URLs are supported" error - it's a known issue with relative URLs
            const isUrlError = errorMessage.includes('Only absolute URLs are supported');
            if (isUrlError) {
                return {
                    success: false,
                    error: errorMessage,
                };
            }

            // Check if this is a NOT_FOUND error (custom object doesn't exist)
            const isObjectMissing =
                errorObj.errorCode === 'NOT_FOUND' ||
                errorObj.name === 'NOT_FOUND' ||
                errorMessage.includes('does not exist') ||
                errorMessage.includes('The requested resource does not exist');

            if (isObjectMissing) {
                // Only log once per object type, not for every record
                if (!suppressErrorLog) {
                    SalesforceLogger.error(
                        `Custom object "${objectType}" does not exist in Salesforce. Please create it first.`,
                        null,
                        {
                            objectType,
                            hint: 'This custom object needs to be created manually in Salesforce Setup',
                        },
                    );
                }
                return {
                    success: false,
                    error: `Custom object "${objectType}" does not exist in Salesforce`,
                    isCustomObjectMissing: true,
                };
            }

            if (!suppressErrorLog) {
                SalesforceLogger.error('Error in sync operation', error, { objectType });
            }

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Update sync tracking fields after successful sync
     */
    private async updateSyncTracking(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        repositoryInstance: { updateById: (id: number, data: Record<string, unknown>) => Promise<void>; findById: (id: number) => Promise<any> },
        recordId: number,
        success: boolean,
        salesforceId?: string,
    ): Promise<void> {
        try {
            const updateData: Record<string, unknown> = {};

            if (success) {
                updateData.isSyncedSalesForce = true;
                updateData.lastSyncedSalesForceDate = new Date();
                if (salesforceId) {
                    updateData.salesforceId = salesforceId;
                }
            } else {
                // Only mark as unsynced if record was never successfully synced.
                // Prevents a failed duplicate call from overwriting a previous success.
                const existing = await repositoryInstance.findById(recordId);
                if (!existing.salesforceId) {
                    updateData.isSyncedSalesForce = false;
                }
            }

            if (Object.keys(updateData).length > 0) {
                await repositoryInstance.updateById(recordId, updateData);
            }
        } catch (error) {
            SalesforceLogger.error(`Error updating sync tracking for record ${recordId}`, error, { recordId });
        }
    }

    /**
     * Log sync operation - reduced logging for batch operations
     */
    async logSync(
        recordId: string,
        objectType: string,
        operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'CONVERT' | 'UPSERT',
        result: SyncResult,
        direction: 'OUTBOUND' | 'INBOUND' = 'OUTBOUND',
        retryCount = 0,
        source?: string,
    ): Promise<void> {
        try {
            // Skip logging "Only absolute URLs are supported" errors - known jsforce issue
            if (!result.success) {
                const isUrlError = result.error?.includes('Only absolute URLs are supported');
                if (isUrlError) {
                    return;
                }
            }

            // Skip logging skipped operations (no changes needed)
            if (result.skipped) {
                return;
            }

            await this.syncLogRepository.create({
                recordId,
                objectType,
                operation,
                direction,
                status: result.success ? 'SUCCESS' : 'FAILED',
                salesforceId: result.salesforceId,
                errorMessage: result.error,
                source,
                retryCount,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } catch (error) {
            // Only log database errors (not common, indicates potential issues)
            SalesforceLogger.error('Error logging sync operation', error, { recordId, objectType, operation });
        }
    }

    /**
     * Get sync logs for a specific record
     */
    async getSyncLogs(objectType?: string): Promise<SalesforceSyncLog[]> {
        const where: Record<string, unknown> = {};
        if (objectType) {
            where.objectType = objectType;
        }

        return this.syncLogRepository.find({
            where,
            order: ['createdAt DESC'],
            fields: ['objectType', 'id', 'status', 'salesforceId', 'errorMessage'],
            skip: 0,
            limit: 100,
        });
    }

    /**
     * Get failed sync operations that need retry
     */
    async getFailedSyncs(maxRetries = 3): Promise<SalesforceSyncLog[]> {
        return this.syncLogRepository.find({
            where: {
                status: 'FAILED',
                retryCount: { lt: maxRetries },
                createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) }, // 24 hours ago
            },
            order: ['createdAt DESC'],
            fields: ['objectType', 'id', 'status', 'salesforceId', 'errorMessage'],
        });
    }

    /**
     * Clear all failed sync logs
     */
    async clearFailedSyncs(): Promise<{ count: number }> {
        const result = await this.syncLogRepository.deleteAll({
            status: 'FAILED',
        });
        return { count: result.count };
    }

    /**
     * Map WasteTrade company to Salesforce Account
     */

    /**
     * Map WasteTrade user to Salesforce Lead (for new registrations)
     */

    /**
     * Map WasteTrade user to Salesforce Contact (after verification)
     */

    /**
     * Map WasteTrade listing to Salesforce Sales Listing (custom object)
     */
    /**
     * Map WasteTrade listing to Salesforce Sales Listing (custom object)
     * Only mapping to fields that actually exist in Salesforce Sales_Listing__c
     */

    /**
     * Sync company to Salesforce Account
     */
    async syncCompany(companyId: number, forceSync = false, suppressErrorLog = false, caller = 'unknown'): Promise<SyncResult> {
        try {
            const company = await this.companiesRepository.findById(companyId);

            // Only sync ACTIVE companies to SF Account — non-approved companies stay as Leads only.
            // Lead → Account conversion happens exclusively in adminRequestAction('approve')
            // and handleApprovalAction('approve_user').
            if (company.status !== CompanyStatus.ACTIVE) {
                return {
                    success: true,
                    skipped: true,
                    error: `Company not active (status: ${company.status}) - skipping Account sync`,
                };
            }

            // Check if sync is needed (unless forced)
            if (!forceSync && !needsSync(company)) {
                return {
                    success: true,
                    skipped: true,
                    error: 'Company already synced, no changes detected',
                };
            }

            // Log VAT number debugging information
            if (!suppressErrorLog && company.vatNumber) {
                SalesforceLogger.info(`Syncing company ${companyId} with VAT number: ${company.vatNumber}`, {
                    companyId,
                    vatNumber: company.vatNumber,
                    registrationNumber: company.registrationNumber,
                    companyName: company.name,
                });
            }

            // Get company locations for address mapping
            const locations = await this.companyLocationsRepository.find({
                where: { companyId },
            });

            // Get primary user for fallback contact info
            let primaryUser;
            try {
                const primaryCompanyUser = await this.companyUsersRepository.findOne({
                    where: { companyId, isPrimaryContact: true },
                    include: [{ relation: 'user' }],
                });
                if (primaryCompanyUser?.user) {
                    primaryUser = primaryCompanyUser.user;
                } else {
                    // Fallback: get first user
                    const firstCompanyUser = await this.companyUsersRepository.findOne({
                        where: { companyId },
                        include: [{ relation: 'user' }],
                    });
                    primaryUser = firstCompanyUser?.user;
                }
            } catch (error) {
                // Ignore error, primaryUser will be undefined
            }

            const accountData = mapCompanyToAccount(company, locations, primaryUser);

            // Log the mapped account data for debugging VAT number sync
            if (!suppressErrorLog && company.vatNumber) {
                SalesforceLogger.info(`Mapped account data for company ${companyId}`, {
                    companyId,
                    vatNumberMapped: accountData[AccountFields.Company_VAT_Number__c],
                    registrationNumberMapped: accountData[AccountFields.Company_Registration_Number__c],
                    emailMapped: accountData[AccountFields.Email__c],
                    websiteMapped: accountData[AccountFields.Website],
                    locationsMapped: !!locations?.length,
                });
            }

            // Log site location data for debugging
            if (!suppressErrorLog && locations && locations.length > 0) {
                const primaryLocation = locations[0];
                SalesforceLogger.info(`Site location data for company ${companyId}`, {
                    companyId,
                    locationCount: locations.length,
                    primaryLocationData: {
                        locationName: primaryLocation.locationName,
                        sitePointContact: primaryLocation.sitePointContact,
                        phoneNumber: primaryLocation.phoneNumber,
                        addressLine: primaryLocation.addressLine,
                        city: primaryLocation.city,
                        country: primaryLocation.country,
                        postcode: primaryLocation.postcode,
                        stateProvince: primaryLocation.stateProvince,
                        officeOpenTime: primaryLocation.officeOpenTime,
                        officeCloseTime: primaryLocation.officeCloseTime,
                        loadingRamp: primaryLocation.loadingRamp,
                        weighbridge: primaryLocation.weighbridge,
                        selfLoadUnLoadCapability: primaryLocation.selfLoadUnLoadCapability,
                        mainLocation: primaryLocation.mainLocation,
                        containerTypes: primaryLocation.containerType?.length || 0,
                        acceptedMaterials: primaryLocation.acceptedMaterials?.length || 0,
                    },
                    mappedSiteFields: {
                        primarySiteLocation: accountData[AccountFields.Primary_Location_Name__c],
                        sitePointContact: accountData[AccountFields.Site_Point_Contact__c],
                        sitePhone: accountData[AccountFields.Site_Contact_Phone__c],
                        operatingHours: accountData[AccountFields.Operating_Hours__c],
                        hasLoadingRamp: accountData[AccountFields.Has_Loading_Ramp__c],
                        hasWeighBridge: accountData[AccountFields.Has_Weigh_Bridge__c],
                        selfLoadUnload: accountData[AccountFields.Self_Load_Unload__c],
                        accessRestrictions: accountData[AccountFields.Access_Restrictions__c],
                        containerTypes: accountData[AccountFields.Container_Types__c],
                        acceptedMaterials: accountData[AccountFields.Site_Accepted_Materials__c],
                        siteContactFirstName: accountData[AccountFields.Site_Contact_First_Name__c],
                        siteContactLastName: accountData[AccountFields.Site_Contact_Last_Name__c],
                        siteContactPosition: accountData[AccountFields.Site_Contact_Position__c],
                    },
                });
            }

            // If Salesforce ID is missing, perform one-time lookup by WasteTrade User ID or email
            let salesforceId = company.salesforceId;
            if (!salesforceId) {
                try {
                    const externalId = addEnvironmentPrefixToExternalId(companyId.toString());
                    const existingAccount = await this.salesforceService.findByExternalId(
                        'Account',
                        'WasteTrade_Company_Id__c',
                        externalId,
                        suppressErrorLog,
                    );
                    if (existingAccount?.Id) {
                        salesforceId = existingAccount.Id;
                        // Store the found Salesforce ID
                        await this.companiesRepository.updateById(companyId, { salesforceId });
                        SalesforceLogger.info(`Re-established linkage for company ${companyId}`, {
                            companyId,
                            salesforceId,
                        });
                    }
                } catch (lookupError) {
                    // Lookup failed - continue with upsert (will create new record)
                    if (!suppressErrorLog) {
                        SalesforceLogger.warn(`Could not lookup Account for company ${companyId}`, {
                            companyId,
                            error: SalesforceErrorHandler.extractErrorMessage(lookupError),
                        });
                    }
                }
            }

            // Remove null/undefined values to prevent clearing existing Salesforce values
            // Only include fields that have actual values
            const filteredAccountData = cleanSalesforceData(accountData);

            SalesforceLogger.info('[Outbound] Syncing Account', { direction: 'outbound', entity: 'Account', companyId, action: 'upsert' });

            // Use WasteTrade_Company_Id__c external ID for upsert to prevent duplicates
            const result = await this.executeOperation('Account', () =>
                this.salesforceService.upsertRecord(
                    'Account',
                    'WasteTrade_Company_Id__c',
                    filteredAccountData,
                    suppressErrorLog,
                ),
            );

            // If custom fields are missing, log the error
            if (!result.success && isCustomFieldError(result)) {
                if (!suppressErrorLog) {
                    SalesforceLogger.error(`Missing custom fields detected for company ${companyId}`, {
                        companyId,
                        error: result.error,
                        hasVatNumber: !!company.vatNumber,
                        message: 'Custom fields need to be created manually in Salesforce',
                    });
                }
            }

            // Log final result for VAT number debugging
            if (!suppressErrorLog && company.vatNumber) {
                SalesforceLogger.info(`Company sync result for ${companyId}`, {
                    direction: 'outbound',
                    companyId,
                    success: result.success,
                    salesforceId: result.salesforceId,
                    error: result.error,
                    hasVatNumber: !!company.vatNumber,
                });
            }

            // Update sync tracking fields
            await this.updateSyncTracking(this.companiesRepository, companyId, result.success, result.salesforceId);

            // Enhanced logging with fields updated
            const outboundFields = getOutboundFields('Account');
            const fieldsSynced = outboundFields
                .map((f: any) => f.salesforceField)
                .filter((field: string) => filteredAccountData[field] !== undefined)
                .join(', ');

            await this.logSync(companyId.toString(), 'Account', 'UPSERT', result, 'OUTBOUND', 0, `syncCompany:success:${caller}`);

            if (result.success && !suppressErrorLog) {
                SalesforceLogger.info(`✅ Synced company ${companyId} to Salesforce Account`, {
                    direction: 'outbound',
                    companyId,
                    salesforceId: result.salesforceId,
                    fieldsSynced: fieldsSynced || 'all mapped fields',
                    mappingVersion: MAPPING_SCHEMA_VERSION,
                });
            }

            return result;
        } catch (error) {
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error syncing company ${companyId}`, error, { companyId });
            }
            const result: SyncResult = {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };

            // Update sync tracking to mark as failed
            await this.updateSyncTracking(this.companiesRepository, companyId, false);

            await this.logSync(companyId.toString(), 'Account', 'UPSERT', result, 'OUTBOUND', 0, `syncCompany:error:${caller}`);
            return result;
        }
    }

    /**
     * Sync user to Salesforce Lead (for new registrations)
     */
    async syncUserAsLead(userId: number, forceSync = false, suppressErrorLog = false, caller = 'unknown'): Promise<SyncResult> {
        try {
            const user = await this.userRepository.findById(userId);

            // Skip if user is already converted to Contact (no Lead ID, but has Contact/salesforceId)
            if (!user.salesforceLeadId && user.salesforceId) {
                return { success: true, skipped: true, error: 'User already converted to Contact' };
            }

            // Check if sync is needed (unless forced)
            if (!forceSync && !needsSync(user)) {
                return {
                    success: true,
                    skipped: true,
                    error: 'User already synced, no changes detected',
                };
            }

            // Try to find the user's company through company_users table
            let company: Companies | undefined;
            try {
                const companyUsers = await this.userRepository.execute(
                    'SELECT cu.company_id FROM company_users cu WHERE cu.user_id = $1 LIMIT 1',
                    [userId],
                );
                if (companyUsers.length > 0) {
                    company = await this.companiesRepository.findById(companyUsers[0].company_id);
                }
            } catch (error) {
                if (!suppressErrorLog) {
                    SalesforceLogger.warn('Could not find company for user', {
                        userId,
                        error: SalesforceErrorHandler.extractErrorMessage(error),
                    });
                }
            }

            const leadData = await mapUserToLead(user, company, this.materialUsersRepository);
            const cleanedLeadData = cleanSalesforceData(leadData);

            // If Salesforce ID is missing, perform one-time lookup by WasteTrade User ID or email
            let salesforceId = user.salesforceLeadId;
            if (!salesforceId) {
                try {
                    // Try lookup by external ID first
                    const externalId = addEnvironmentPrefixToExternalId(userId.toString());
                    try {
                        const existingLead = await this.salesforceService.findByExternalId(
                            'Lead',
                            'WasteTrade_User_Id__c',
                            externalId,
                            suppressErrorLog,
                        );
                        if (existingLead?.Id) {
                            salesforceId = existingLead.Id;
                            await this.userRepository.updateById(userId, { salesforceLeadId: salesforceId });
                            SalesforceLogger.info(`Re-established linkage for user ${userId}`, {
                                userId,
                                salesforceId,
                            });
                        }
                    } catch (externalIdError) {
                        // If external ID lookup fails, try by email
                        if (user.email) {
                            try {
                                const query = `SELECT Id FROM Lead WHERE Email = '${escapeSoql(user.email)}' LIMIT 1`;
                                const queryResult = await this.salesforceService.query(query);
                                if (queryResult.records && queryResult.records.length > 0) {
                                    salesforceId = queryResult.records[0].Id as string;
                                    await this.userRepository.updateById(userId, { salesforceLeadId: salesforceId });
                                    SalesforceLogger.info(`Re-established linkage for user ${userId} by email`, {
                                        userId,
                                        salesforceId,
                                    });
                                }
                            } catch (emailError) {
                                // Both lookups failed - continue with upsert
                            }
                        }
                    }
                } catch (lookupError) {
                    // Lookup failed - continue with upsert (will create new record)
                    if (!suppressErrorLog) {
                        SalesforceLogger.warn(`Could not lookup Lead for user ${userId}`, {
                            userId,
                            error: SalesforceErrorHandler.extractErrorMessage(lookupError),
                        });
                    }
                }
            }

            // Remove null/undefined values to prevent clearing existing Salesforce values
            const filteredLeadData: Record<string, any> = {};
            Object.keys(cleanedLeadData).forEach((key) => {
                const value = cleanedLeadData[key];
                if (value !== null && value !== undefined && value !== '') {
                    filteredLeadData[key] = value;
                }
            });

            SalesforceLogger.info('[Outbound] Syncing Lead', { direction: 'outbound', entity: 'Lead', userId, action: 'upsert' });

            // Use upsert operation with WasteTrade User ID as external ID to avoid duplicates
            let result = await this.executeOperation('Lead', () =>
                this.salesforceService.upsertRecord(
                    'Lead',
                    'WasteTrade_User_Id__c',
                    filteredLeadData,
                    suppressErrorLog,
                ),
            );

            // If upsert fails due to missing external ID field, fall back:
            // - Has salesforceLeadId → update existing SF record (prevents duplicates)
            // - No salesforceLeadId  → create new SF record
            const errorMessage = result.error ?? '';
            if (
                !result.success &&
                (errorMessage.includes('METHOD_NOT_ALLOWED') || errorMessage.includes('INVALID_FIELD'))
            ) {
                result = user.salesforceLeadId
                    ? await this.executeOperation('Lead', () =>
                        this.salesforceService.updateRecord('Lead', user.salesforceLeadId!, cleanedLeadData, suppressErrorLog),
                    )
                    : await this.executeOperation('Lead', () =>
                        this.salesforceService.createRecord('Lead', cleanedLeadData, suppressErrorLog),
                    );
            }

            // If custom fields are missing, log the error
            if (!result.success && isCustomFieldError(result)) {
                if (!suppressErrorLog) {
                    SalesforceLogger.error(`Missing custom fields detected for user ${userId}`, {
                        userId,
                        error: result.error,
                        message: 'Custom fields need to be created manually in Salesforce',
                    });
                }
            }

            // Update sync tracking fields
            await this.updateSyncTracking(this.userRepository, userId, result.success, result.salesforceId);

            // Enhanced logging with fields updated
            const outboundFields = getOutboundFields('Contact'); // Use Contact mapping for Lead fields
            const fieldsSynced = outboundFields
                .map((f: any) => f.salesforceField)
                .filter((field: string) => filteredLeadData[field] !== undefined)
                .join(', ');

            await this.logSync(userId.toString(), 'Lead', 'UPSERT', result, 'OUTBOUND', 0, `syncUserAsLead:success:${caller}`);

            if (result.success && !suppressErrorLog) {
                SalesforceLogger.info(`✅ Synced user ${userId} to Salesforce Lead`, {
                    direction: 'outbound',
                    userId,
                    salesforceId: result.salesforceId,
                    fieldsSynced: fieldsSynced || 'all mapped fields',
                    mappingVersion: MAPPING_SCHEMA_VERSION,
                });
            }

            return result;
        } catch (error) {
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error syncing user ${userId} as lead`, error, { userId });
            }
            const result: SyncResult = {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };

            // Update sync tracking to mark as failed
            await this.updateSyncTracking(this.userRepository, userId, false);

            await this.logSync(userId.toString(), 'Lead', 'UPSERT', result, 'OUTBOUND', 0, `syncUserAsLead:error:${caller}`);
            return result;
        }
    }

    /**
     * Convert Lead to Account and Contact (on verification)
     */
    async convertLeadToAccountContact(userId: number, caller = 'unknown'): Promise<SyncResult> {
        try {
            const user = await this.userRepository.findById(userId);

            // Try to find the Lead record by email first (most reliable)
            let leadRecord;
            try {
                const leadQuery = `SELECT Id, Email, FirstName, LastName FROM Lead WHERE Email = '${escapeSoql(user.email)}'  LIMIT 1`;
                const leadResults = await this.salesforceService.query(leadQuery);

                if (leadResults.records && leadResults.records.length > 0) {
                    leadRecord = leadResults.records[0];
                } else {
                    // If no Lead found by email, try by external ID if available
                    try {
                        leadRecord = await this.salesforceService.findByExternalId(
                            'Lead',
                            'WasteTrade_User_Id__c',
                            addEnvironmentPrefixToExternalId(userId.toString()),
                            true,
                        );
                    } catch (externalIdError) {
                        // Could not find Lead by external ID, continue with email-based search
                    }
                }
            } catch (queryError) {
                SalesforceLogger.warn('Error querying Lead records', { userId, error: formatErrorMessage(queryError) });
            }

            // Get user's company information (needed for both conversion paths)
            let company: Companies | undefined;
            try {
                const companyUsers = await this.userRepository.execute(
                    'SELECT cu.company_id FROM company_users cu WHERE cu.user_id = $1 LIMIT 1',
                    [userId],
                );
                if (companyUsers.length > 0) {
                    company = await this.companiesRepository.findById(companyUsers[0].company_id);
                }
            } catch (error) {
                SalesforceLogger.warn('Could not find company for user during lead conversion', {
                    userId,
                    error: SalesforceErrorHandler.extractErrorMessage(error),
                });
            }

            if (!leadRecord) {
                // Lead might have been already converted by SF automation — check for converted Lead
                try {
                    const convertedQuery = `SELECT Id, ConvertedAccountId, ConvertedContactId FROM Lead WHERE Email = '${escapeSoql(user.email)}'  AND IsConverted = true LIMIT 1`;
                    const convertedResults = await this.salesforceService.query(convertedQuery);
                    if (convertedResults.records?.length > 0) {
                        const converted = convertedResults.records[0];
                        const convertedAccountId = (converted.ConvertedAccountId as string) ?? undefined;
                        const convertedContactId = (converted.ConvertedContactId as string) ?? undefined;
                        SalesforceLogger.info(`Lead already converted by SF for user ${userId}`, {
                            userId,
                            accountId: convertedAccountId,
                            contactId: convertedContactId,
                        });

                        // Set external ID on converted Account so syncCompany can find it
                        if (convertedAccountId && company?.id) {
                            try {
                                const externalId = addEnvironmentPrefixToExternalId(company.id.toString());
                                await this.salesforceService.updateRecord('Account', convertedAccountId, {
                                    WasteTrade_Company_Id__c: externalId,
                                });
                            } catch (exIdErr) {
                                SalesforceLogger.warn(`Failed to set external ID on pre-converted Account ${convertedAccountId}`, {
                                    error: formatErrorMessage(exIdErr),
                                });
                            }
                            await this.updateSyncTracking(this.companiesRepository, company.id, true, convertedAccountId);
                        }
                        if (convertedContactId) {
                            await this.updateSyncTracking(this.userRepository, userId, true, convertedContactId);
                            await this.userRepository.updateById(userId, { salesforceLeadId: '' });
                        }

                        return {
                            success: true,
                            skipped: true,
                            accountId: convertedAccountId,
                            contactId: convertedContactId,
                            error: 'Lead already converted by Salesforce',
                        };
                    }
                } catch {
                    // Query failed, fall through to error
                }

                return {
                    success: false,
                    error: `Lead not found in Salesforce for user ${user.email}. Please sync user as Lead first.`,
                };
            }
            // Look up existing Account by company external ID to prevent duplicate creation
            let existingAccountId: string | undefined;
            if (company?.id) {
                try {
                    const companyExternalId = addEnvironmentPrefixToExternalId(company.id.toString());
                    const existingAccount = await this.salesforceService.findByExternalId(
                        'Account',
                        'WasteTrade_Company_Id__c',
                        companyExternalId,
                        true,
                    );
                    if (existingAccount?.Id) {
                        existingAccountId = existingAccount.Id;
                        SalesforceLogger.info(`Found existing Account for company ${company.id}, will link during conversion`, {
                            companyId: company.id,
                            accountId: existingAccountId,
                        });
                    }
                } catch {
                    // No existing Account found — conversion will create a new one
                }
            }

            // Look up existing Contact by email + same env prefix to reuse during conversion
            // Only merge into Contact from the SAME environment; ignore Contacts from other envs
            let existingContactId: string | undefined;
            try {
                const envPrefix = getEnvironmentPrefix();
                const contactQuery = `SELECT Id, WasteTrade_User_Id__c FROM Contact WHERE Email = '${escapeSoql(user.email)}' AND WasteTrade_User_Id__c LIKE '${envPrefix}_%' LIMIT 1`;
                const contactResults = await this.salesforceService.query(contactQuery);
                if (contactResults.records?.length > 0) {
                    existingContactId = contactResults.records[0].Id as string;
                    SalesforceLogger.info(`Found existing Contact (same env) for user ${userId}, will merge during conversion`, {
                        userId,
                        contactId: existingContactId,
                        existingExternalId: contactResults.records[0].WasteTrade_User_Id__c,
                    });
                }
            } catch {
                // No existing Contact found — conversion will create a new one
            }

            SalesforceLogger.info('[Outbound] Syncing Lead (convert)', { direction: 'outbound', entity: 'Lead', userId, action: 'upsert' });

            // Convert Lead to Account and Contact (pass existing IDs to prevent duplicates)
            const conversionResult = await this.salesforceService.convertLead(leadRecord.Id, existingAccountId, existingContactId);

            if (conversionResult.success) {
                // Update sync tracking for user
                await this.updateSyncTracking(this.userRepository, userId, true, conversionResult.contactId);

                // Clear salesforceLeadId so downstream code knows user is now a Contact, not a Lead
                await this.userRepository.updateById(userId, { salesforceLeadId: '' });

                // If company exists and conversion created an Account, update company sync tracking AND set external ID
                if (company && conversionResult.accountId) {
                    // Update Account with external ID so future syncs can find it
                    try {
                        const externalId = addEnvironmentPrefixToExternalId(company.id!.toString());
                        await this.salesforceService.updateRecord('Account', conversionResult.accountId, {
                            WasteTrade_Company_Id__c: externalId,
                        });
                        SalesforceLogger.info(
                            `✅ Set external ID on Account ${conversionResult.accountId} for company ${company.id}`,
                            {
                                accountId: conversionResult.accountId,
                                companyId: company.id,
                                externalId,
                            },
                        );
                    } catch (externalIdError) {
                        SalesforceLogger.warn(`⚠️ Failed to set external ID on Account ${conversionResult.accountId}`, {
                            accountId: conversionResult.accountId,
                            companyId: company.id,
                            error: formatErrorMessage(externalIdError),
                        });
                    }

                    await this.updateSyncTracking(
                        this.companiesRepository,
                        company.id!,
                        true,
                        conversionResult.accountId,
                    );
                }
            }

            await this.logSync(userId.toString(), 'Lead', 'CONVERT', conversionResult, 'OUTBOUND', 0, `convertLead:success:${caller}`);
            if (conversionResult.success) {
                SalesforceLogger.info('[Outbound] Sync result for Lead (convert)', { direction: 'outbound', entity: 'Lead', userId, success: conversionResult.success, salesforceId: conversionResult.salesforceId });
            }
            return conversionResult;
        } catch (error) {
            SalesforceLogger.error(`Error converting lead for user ${userId}`, error, { userId });
            const result: SyncResult = {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };
            await this.logSync(userId.toString(), 'Lead', 'CONVERT', result, 'OUTBOUND', 0, `convertLead:error:${caller}`);
            return result;
        }
    }

    /**
     * Sync CompanyUser (membership) to Salesforce Contact
     * Creates or updates a Contact linked to the Company's Account
     */
    async syncCompanyUser(companyUserId: number, forceSync = false, suppressErrorLog = false, caller = 'unknown'): Promise<SyncResult> {
        try {
            // Get CompanyUser with related User and Company data
            const companyUser = await this.companyUsersRepository.findById(companyUserId, {
                include: ['user', 'company'],
            });

            if (!companyUser.user || !companyUser.company) {
                return {
                    success: false,
                    error: 'CompanyUser missing user or company relation',
                };
            }

            // Only sync ACTIVE company users as Contacts (AC: Contact only created when ACTIVE)
            if (companyUser.status !== CompanyUserStatusEnum.ACTIVE) {
                return {
                    success: true,
                    skipped: true,
                    error: `CompanyUser is not active (status: ${companyUser.status}), skipping Contact sync`,
                };
            }

            // Only sync if company is ACTIVE
            if (companyUser.company.status !== CompanyStatus.ACTIVE) {
                return {
                    success: true,
                    skipped: true,
                    error: `Company is not active (status: ${companyUser.company.status}), skipping Contact sync`,
                };
            }

            // Check if sync is needed (unless forced)
            if (!forceSync && !needsSync(companyUser)) {
                return {
                    success: true,
                    skipped: true,
                    error: 'CompanyUser already synced, no changes detected',
                };
            }

            // Find Account in Salesforce by company external ID
            const companyExternalId = addEnvironmentPrefixToExternalId(companyUser.companyId.toString());
            let accountId: string | undefined;

            try {
                const account = await this.salesforceService.findByExternalId(
                    'Account',
                    'WasteTrade_Company_Id__c',
                    companyExternalId,
                    suppressErrorLog,
                );
                accountId = account?.Id;
            } catch (error) {
                if (!suppressErrorLog) {
                    SalesforceLogger.warn(`Account not found by external ID for company ${companyUser.companyId}`, {
                        companyId: companyUser.companyId,
                        error: formatErrorMessage(error),
                    });
                }
            }

            // Fallback: use company's stored salesforceId if external ID lookup failed
            if (!accountId && companyUser.company.salesforceId) {
                accountId = companyUser.company.salesforceId;
            }

            if (!accountId) {
                return {
                    success: false,
                    error: `Account not found in Salesforce for company ${companyUser.companyId}. Sync company first.`,
                };
            }

            // Map CompanyUser to Contact
            let primaryLocation;
            try {
                const locations = await this.companyLocationsRepository.find({
                    where: { companyId: companyUser.companyId, mainLocation: true },
                    limit: 1,
                });
                primaryLocation = locations[0];
            } catch (error) {
                // Continue without location if fetch fails
                primaryLocation = undefined;
            }

            // Map CompanyUser to Contact with location data
            const contactData = mapCompanyUserToContact(companyUser.user, companyUser, accountId, primaryLocation);
            const cleanedContactData = cleanSalesforceData(contactData);

            SalesforceLogger.info('[Outbound] Syncing Contact', { direction: 'outbound', entity: 'Contact', companyUserId, action: 'upsert' });

            // Upsert Contact by WasteTrade_User_Id__c
            const result = await this.executeOperation('Contact', () =>
                this.salesforceService.upsertRecord(
                    'Contact',
                    'WasteTrade_User_Id__c',
                    cleanedContactData,
                    suppressErrorLog,
                ),
            );

            // Update sync tracking fields
            await this.updateSyncTracking(
                this.companyUsersRepository,
                companyUserId,
                result.success,
                result.salesforceId,
            );

            await this.logSync(companyUserId.toString(), 'Contact', 'UPSERT', result, 'OUTBOUND', 0, `syncCompanyUser:success:${caller}`);
            if (result.success && !suppressErrorLog) {
                SalesforceLogger.info('[Outbound] Sync result for Contact', { direction: 'outbound', entity: 'Contact', companyUserId, success: result.success, salesforceId: result.salesforceId });
            }
            return result;
        } catch (error) {
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error syncing company user ${companyUserId}`, error, { companyUserId });
            }
            const result: SyncResult = {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };

            // Update sync tracking to mark as failed
            await this.updateSyncTracking(this.companyUsersRepository, companyUserId, false);

            await this.logSync(companyUserId.toString(), 'Contact', 'UPSERT', result, 'OUTBOUND', 0, `syncCompanyUser:error:${caller}`);
            return result;
        }
    }

    /**
     * Sync listing to Salesforce
     */
    async syncListing(listingId: number, forceSync = false, suppressErrorLog = false, caller = 'unknown'): Promise<SyncResult> {
        try {
            const listing = await this.listingsRepository.findById(listingId);
            // Check if sync is needed (unless forced)
            if (!forceSync && !needsSync(listing)) {
                return {
                    success: true,
                    skipped: true,
                    error: 'Listing already synced, no changes detected',
                };
            }

            // Fetch listing documents for image mapping
            const listingDocuments = await this.listingDocumentsRepository.find({
                where: { listingId },
            });

            let location;
            if (listing.locationId) {
                try {
                    location = await this.companyLocationsRepository.findById(listing.locationId);
                } catch (error) {
                    SalesforceLogger.warn(`Location ${listing.locationId} not found for listing ${listingId}`);
                }
            }

            const salesListingData = await mapListingToSalesListing(listing, listingDocuments, location);

            SalesforceLogger.info('[Outbound] Syncing Sales_Listing__c', { direction: 'outbound', entity: 'Sales_Listing__c', listingId, action: 'upsert' });

            // Use upsert operation with listing ID as external ID to avoid duplicates
            let result = await this.executeOperation('Sales_Listing__c', () =>
                this.salesforceService.upsertRecord(
                    'Sales_Listing__c',
                    'WasteTrade_Listing_Id__c',
                    salesListingData,
                    suppressErrorLog,
                ),
            );

            // If upsert fails due to missing external ID field, fall back:
            // - Has salesforceId → update existing SF record (prevents duplicates)
            // - No salesforceId  → create new SF record
            const errorMessage = result.error ?? '';
            if (
                !result.success &&
                (errorMessage.includes('METHOD_NOT_ALLOWED') || errorMessage.includes('INVALID_FIELD'))
            ) {
                result = listing.salesforceId
                    ? await this.executeOperation('Sales_Listing__c', () =>
                        this.salesforceService.updateRecord('Sales_Listing__c', listing.salesforceId!, salesListingData, suppressErrorLog),
                    )
                    : await this.executeOperation('Sales_Listing__c', () =>
                        this.salesforceService.createRecord('Sales_Listing__c', salesListingData, suppressErrorLog),
                    );
            }

            await this.updateSyncTracking(this.listingsRepository, listingId, result.success, result.salesforceId);
            await this.logSync(listingId.toString(), 'Sales_Listing__c', 'UPSERT', result, 'OUTBOUND', 0, `syncListing:success:${caller}`);
            if (result.success && !suppressErrorLog) {
                SalesforceLogger.info('[Outbound] Sync result for Sales_Listing__c', { direction: 'outbound', entity: 'Sales_Listing__c', listingId, success: result.success, salesforceId: result.salesforceId });
            }
            return result;
        } catch (error) {
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error syncing listing ${listingId}`, error, { listingId });
            }
            const result: SyncResult = {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };

            // Update sync tracking to mark as failed
            await this.updateSyncTracking(this.listingsRepository, listingId, false);

            await this.logSync(listingId.toString(), 'Sales_Listing__c', 'UPSERT', result, 'OUTBOUND', 0, `syncListing:error:${caller}`);
            return result;
        }
    }

    /**
     * Bulk sync all companies with parallel processing
     */
    async bulkSyncCompanies(forceSync = false, limit?: number): Promise<BulkSyncResult> {
        const findOptions: any = {};
        if (limit) {
            findOptions.limit = limit;
        }
        const companies = await this.companiesRepository.find(findOptions);

        return this.processBatches(
            companies,
            async (company) => {
                if (!company.id) {
                    return { success: false, error: 'Company ID is missing' };
                }
                return this.syncCompany(company.id, forceSync, true, 'bulkSync');
            },
            'Account',
            3,
            true,
        );
    }

    /**
     * Bulk sync all users as leads with parallel processing
     */
    async bulkSyncUsersAsLeads(forceSync = false, limit?: number): Promise<BulkSyncResult> {
        const findOptions: any = {};
        if (limit) {
            findOptions.limit = limit;
        }
        const users = await this.userRepository.find(findOptions);

        return this.processBatches(
            users,
            async (user) => {
                if (!user.id) {
                    return { success: false, error: 'User ID is missing' };
                }
                return this.syncUserAsLead(user.id, forceSync, true, 'bulkSync');
            },
            'Lead',
            3,
            true,
        );
    }

    /**
     * Map WasteTrade offer to Salesforce custom Offers__c object
     */

    /**
     * Sync offer to Salesforce custom Offers__c object
     */
    async syncOffer(offerId: number, forceSync = false, suppressErrorLog = false, caller = 'unknown'): Promise<SyncResult> {
        try {
            const offer = await this.offersRepository.findById(offerId);

            // Check if sync is needed (unless forced)
            if (!forceSync && !needsSync(offer)) {
                return {
                    success: true,
                    skipped: true,
                    error: 'Offer already synced, no changes detected',
                };
            }

            // Try to sync to custom Offers__c object first
            const offerData = await mapOfferToSalesforceOffer(offer, {
                listingsRepository: this.listingsRepository,
                userRepository: this.userRepository,
                companiesRepository: this.companiesRepository,
                companyLocationsRepository: this.companyLocationsRepository,
            });
            const cleanedOfferData = cleanSalesforceData(offerData);
            SalesforceLogger.info('[Outbound] Syncing Offers__c', { direction: 'outbound', entity: 'Offers__c', offerId, action: 'upsert' });
            const result = await this.executeOperation('Offers__c', () =>
                this.salesforceService.upsertRecord(
                    'Offers__c',
                    'WasteTrade_Offer_Id__c',
                    cleanedOfferData,
                    suppressErrorLog,
                ),
            );

            // If custom object/fields are missing, log the error
            if (!result.success && (isCustomFieldError(result) || result.error?.includes('does not exist'))) {
                if (!suppressErrorLog) {
                    SalesforceLogger.error(`Missing custom fields detected for offer ${offerId}`, {
                        offerId,
                        error: result.error,
                        message: 'Custom fields need to be created manually in Salesforce',
                    });
                }
            }

            // Update sync tracking fields
            await this.updateSyncTracking(this.offersRepository, offerId, result.success, result.salesforceId);

            await this.logSync(offerId.toString(), 'Offers__c', 'UPSERT', result, 'OUTBOUND', 0, `syncOffer:success:${caller}`);
            if (result.success && !suppressErrorLog) {
                SalesforceLogger.info('[Outbound] Sync result for Offers__c', { direction: 'outbound', entity: 'Offers__c', offerId, success: result.success, salesforceId: result.salesforceId });
            }
            return result;
        } catch (error) {
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error syncing offer ${offerId}`, error, { offerId });
            }
            const result: SyncResult = {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };

            // Update sync tracking to mark as failed
            await this.updateSyncTracking(this.offersRepository, offerId, false);

            await this.logSync(offerId.toString(), 'Offers__c', 'UPSERT', result, 'OUTBOUND', 0, `syncOffer:error:${caller}`);
            return result;
        }
    }

    /**
     * Bulk sync all offers with parallel processing
     */
    async syncAllOffers(forceSync = false, limit?: number): Promise<BulkSyncResult> {
        const findOptions: any = {};
        if (limit) {
            findOptions.limit = limit;
        }
        const offers = await this.offersRepository.find(findOptions);

        return this.processBatches(
            offers,
            async (offer) => {
                if (!offer.id) {
                    return { success: false, error: 'Offer ID is missing' };
                }
                return this.syncOffer(offer.id, forceSync, true, 'bulkSync');
            },
            'Offers__c',
            3,
            true,
        );
    }

    /**
     * Sync haulage offer to Salesforce custom Haulage_Offers__c object
     */
    async syncHaulageOffer(haulageOfferId: number, forceSync = false, suppressErrorLog = false, caller = 'unknown'): Promise<SyncResult> {
        try {
            const haulageOffer = await this.haulageOffersRepository.findById(haulageOfferId);

            // Check if sync is needed (unless forced)
            if (!forceSync && !needsSync(haulageOffer)) {
                return {
                    success: true,
                    skipped: true,
                    error: 'Haulage offer already synced, no changes detected',
                };
            }

            // Map haulage offer to Salesforce object
            const haulageOfferData = await mapHaulageOfferToSalesforce(haulageOffer, {
                offersRepository: this.offersRepository,
                listingsRepository: this.listingsRepository,
                userRepository: this.userRepository,
                companiesRepository: this.companiesRepository,
                companyLocationsRepository: this.companyLocationsRepository,
            });
            const cleanedHaulageOfferData = cleanSalesforceData(haulageOfferData);
            SalesforceLogger.info('[Outbound] Syncing Haulage_Offers__c', { direction: 'outbound', entity: 'Haulage_Offers__c', haulageOfferId, action: 'upsert' });
            const result = await this.executeOperation('Haulage_Offers__c', () =>
                this.salesforceService.upsertRecord(
                    'Haulage_Offers__c',
                    'WasteTrade_Haulage_Offers_ID__c',
                    cleanedHaulageOfferData,
                    suppressErrorLog,
                ),
            );

            // If custom object/fields are missing, log the error
            if (!result.success && (isCustomFieldError(result) || result.error?.includes('does not exist'))) {
                if (!suppressErrorLog) {
                    SalesforceLogger.error(`Missing custom fields detected for haulage offer ${haulageOfferId}`, {
                        haulageOfferId,
                        error: result.error,
                        message: 'Custom fields need to be created manually in Salesforce',
                    });
                }
            }

            // Update sync tracking fields
            await this.updateSyncTracking(
                this.haulageOffersRepository,
                haulageOfferId,
                result.success,
                result.salesforceId,
            );

            await this.logSync(haulageOfferId.toString(), 'Haulage_Offers__c', 'UPSERT', result, 'OUTBOUND', 0, `syncHaulageOffer:success:${caller}`);
            if (result.success && !suppressErrorLog) {
                SalesforceLogger.info('[Outbound] Sync result for Haulage_Offers__c', { direction: 'outbound', entity: 'Haulage_Offers__c', haulageOfferId, success: result.success, salesforceId: result.salesforceId });
            }
            return result;
        } catch (error) {
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error syncing haulage offer ${haulageOfferId}`, error, { haulageOfferId });
            }
            const result: SyncResult = {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };

            // Update sync tracking to mark as failed
            await this.updateSyncTracking(this.haulageOffersRepository, haulageOfferId, false);

            await this.logSync(haulageOfferId.toString(), 'Haulage_Offers__c', 'UPSERT', result, 'OUTBOUND', 0, `syncHaulageOffer:error:${caller}`);
            return result;
        }
    }

    /**
     * Bulk sync all haulage offers with parallel processing
     */
    async syncAllHaulageOffers(forceSync = false, limit?: number): Promise<BulkSyncResult> {
        const findOptions: any = {};
        if (limit) {
            findOptions.limit = limit;
        }
        const haulageOffers = await this.haulageOffersRepository.find(findOptions);

        return this.processBatches(
            haulageOffers,
            async (haulageOffer) => {
                if (!haulageOffer.id) {
                    return { success: false, error: 'Haulage offer ID is missing' };
                }
                return this.syncHaulageOffer(haulageOffer.id, forceSync, true, 'bulkSync');
            },
            'Haulage_Offers__c',
            3,
            true,
        );
    }

    /**
     * Sync haulage offers by filter with parallel processing
     */
    public async syncHaulageOffersByFilter(where: Record<string, unknown>, forceSync = false): Promise<BulkSyncResult> {
        const haulageOffers = await this.haulageOffersRepository.find({ where, order: ['updatedAt DESC'], limit: SalesforceSyncService.MAX_RETRY_ITEMS });

        return this.processBatches(
            haulageOffers,
            async (haulageOffer) => {
                if (!haulageOffer.id) {
                    return { success: false, error: 'Haulage offer ID is missing' };
                }
                return this.syncHaulageOffer(haulageOffer.id, forceSync, true, 'cronRetry');
            },
            'Haulage_Offers__c',
            3,
            true,
        );
    }

    /**
     * Sync haulage load to Salesforce Haulage_Loads__c object
     */
    async syncHaulageLoad(loadId: number, forceSync = false, suppressErrorLog = false, caller = 'unknown'): Promise<SyncResult> {
        try {
            const load = await this.haulageLoadsRepository.findById(loadId);

            // Check if sync is needed (unless forced)
            if (!forceSync && !needsSync(load)) {
                return {
                    success: true,
                    skipped: true,
                    error: 'Haulage load already synced, no changes detected',
                };
            }

            // Get parent haulage offer for Salesforce ID
            const haulageOffer = await this.haulageOffersRepository.findById(load.haulageOfferId);

            // Map load to Salesforce object
            const loadData = mapHaulageLoadToSalesforce(load, haulageOffer);
            const cleanedLoadData = cleanSalesforceData(loadData);

            SalesforceLogger.info('[Outbound] Syncing Haulage_Loads__c', { direction: 'outbound', entity: 'Haulage_Loads__c', loadId, action: 'upsert' });

            const result = await this.executeOperation('Haulage_Loads__c', () =>
                this.salesforceService.upsertRecord(
                    'Haulage_Loads__c',
                    HaulageLoadsFields.WasteTrade_Load_Id__c,
                    cleanedLoadData,
                    suppressErrorLog,
                ),
            );

            // Update sync tracking fields
            await this.updateSyncTracking(this.haulageLoadsRepository, loadId, result.success, result.salesforceId);

            await this.logSync(loadId.toString(), 'Haulage_Loads__c', 'UPSERT', result, 'OUTBOUND', 0, `syncHaulageLoad:success:${caller}`);
            if (result.success && !suppressErrorLog) {
                SalesforceLogger.info('[Outbound] Sync result for Haulage_Loads__c', { direction: 'outbound', entity: 'Haulage_Loads__c', loadId, success: result.success, salesforceId: result.salesforceId });
            }
            return result;
        } catch (error) {
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error syncing haulage load ${loadId}`, error, { loadId });
            }
            const result: SyncResult = {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };

            await this.updateSyncTracking(this.haulageLoadsRepository, loadId, false);
            await this.logSync(loadId.toString(), 'Haulage_Loads__c', 'UPSERT', result, 'OUTBOUND', 0, `syncHaulageLoad:error:${caller}`);
            return result;
        }
    }

    /**
     * Sync haulage loads by filter with parallel processing
     */
    public async syncHaulageLoadsByFilter(where: Record<string, unknown>, forceSync = false): Promise<BulkSyncResult> {
        const loads = await this.haulageLoadsRepository.find({ where, order: ['updatedAt DESC'], limit: SalesforceSyncService.MAX_RETRY_ITEMS });

        return this.processBatches(
            loads,
            async (load) => {
                if (!load.id) {
                    return { success: false, error: 'Load ID is missing' };
                }
                return this.syncHaulageLoad(load.id, forceSync, true, 'cronRetry');
            },
            'Haulage_Loads__c',
            3,
            true,
        );
    }

    /**
     * Delete all haulage loads from WT database and Salesforce.
     * SF records are deleted in batches of 200 using SOQL query + destroy.
     * Uses environment prefix to scope deletion to current environment.
     */
    async deleteAllHaulageLoads(): Promise<{
        db: { deleted: number; created: number };
        sf: { deleted: number; errors: number };
        offersUpdated: number;
    }> {
        const prefix = getEnvironmentPrefix();
        SalesforceLogger.info('[Cleanup] Starting haulage loads cleanup', { prefix });

        // Step 1: Count existing loads
        SalesforceLogger.info('[Cleanup] Step 1: Counting records...');
        const countRows = await this.haulageLoadsRepository.execute(
            `SELECT COUNT(*) AS total FROM haulage_loads`,
        );
        const totalLoads = parseInt(countRows[0]?.total ?? '0', 10);
        SalesforceLogger.info('[Cleanup] Step 1 done', { totalLoads });

        // Step 2: Delete ALL loads from DB
        SalesforceLogger.info('[Cleanup] Step 2: Deleting all loads from DB...');
        await this.haulageLoadsRepository.execute(`DELETE FROM haulage_loads`);
        SalesforceLogger.info(`[Cleanup] Step 2 done: ${totalLoads} loads deleted`);

        // Step 3: Update all haulage offers' numberOfLoads to 1
        SalesforceLogger.info('[Cleanup] Step 3: Updating haulage offers to numberOfLoads=1...');
        const offersResult = await this.haulageOffersRepository.updateAll({ numberOfLoads: 1 });
        SalesforceLogger.info(`[Cleanup] Step 3 done: ${offersResult.count} offers updated`);

        // Step 4: Recreate 1 load per offer via bulk INSERT
        SalesforceLogger.info('[Cleanup] Step 4: Recreating 1 load per offer...');
        await this.haulageLoadsRepository.execute(
            `INSERT INTO haulage_loads (haulage_offer_id, load_number, load_status, is_synced_salesforce, created_at, updated_at)
             SELECT id, '1 of 1', 'Awaiting Collection', false, NOW(), NOW()
             FROM haulage_offers`,
        );
        const createdRows = await this.haulageLoadsRepository.execute(
            `SELECT COUNT(*) AS total FROM haulage_loads`,
        );
        const created = parseInt(createdRows[0]?.total ?? '0', 10);
        SalesforceLogger.info(`[Cleanup] Step 4 done: ${created} loads created`);

        // Step 5: Delete all Haulage_Loads__c from SF matching env prefix (batched)
        SalesforceLogger.info('[Cleanup] Step 5: Deleting SF records with prefix...', { prefix });
        const sfResult = await this.salesforceService.bulkDeleteByQuery(
            'Haulage_Loads__c',
            `WasteTrade_Load_Id__c LIKE '${prefix}_%'`,
        );
        SalesforceLogger.info('[Cleanup] Step 5 done', { sfDeleted: sfResult.deleted, sfErrors: sfResult.errors });

        SalesforceLogger.info('[Cleanup] Haulage loads cleanup complete');

        return {
            db: { deleted: totalLoads, created },
            sf: sfResult,
            offersUpdated: offersResult.count,
        };
    }

    /**
     * Sync company document to Salesforce
     */
    async syncCompanyDocument(documentId: number, forceSync = false, suppressErrorLog = false, caller = 'unknown'): Promise<SyncResult> {
        try {
            const document = await this.companyDocumentsRepository.findById(documentId);

            if (!forceSync && !needsSync(document)) {
                return {
                    success: true,
                    skipped: true,
                    error: 'Company document already synced, no changes detected',
                };
            }

            const documentData = mapCompanyDocumentToSalesforceDocument(document);
            const cleanedDocumentData = cleanSalesforceData(documentData);

            SalesforceLogger.info('[Outbound] Syncing Company_Document__c', { direction: 'outbound', entity: 'Company_Document__c', documentId, action: 'upsert' });

            const result = await this.executeOperation('Document__c', () =>
                this.salesforceService.upsertRecord(
                    'Document__c',
                    'WasteTrade_Document_Id__c',
                    cleanedDocumentData,
                    suppressErrorLog,
                ),
            );

            if (!result.success && !suppressErrorLog) {
                SalesforceLogger.error('Document sync failed', result.error, { documentId });
            }

            await this.updateSyncTracking(
                this.companyDocumentsRepository,
                documentId,
                result.success,
                result.salesforceId,
            );

            await this.logSync(documentId.toString(), 'Document__c', 'UPSERT', result, 'OUTBOUND', 0, `syncCompanyDoc:success:${caller}`);
            if (result.success && !suppressErrorLog) {
                SalesforceLogger.info('[Outbound] Sync result for Company_Document__c', { direction: 'outbound', entity: 'Company_Document__c', documentId, success: result.success, salesforceId: result.salesforceId });
            }
            return result;
        } catch (error) {
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error syncing company document ${documentId}`, error, { documentId });
            }
            const result: SyncResult = {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };

            await this.updateSyncTracking(this.companyDocumentsRepository, documentId, false);
            await this.logSync(documentId.toString(), 'Document__c', 'UPSERT', result, 'OUTBOUND', 0, `syncCompanyDoc:error:${caller}`);
            return result;
        }
    }

    /**
     * Bulk sync all company documents with parallel processing
     */
    async syncAllCompanyDocuments(forceSync = false, limit?: number): Promise<BulkSyncResult> {
        const findOptions: any = {};
        if (limit) {
            findOptions.limit = limit;
        }
        const documents = await this.companyDocumentsRepository.find(findOptions);

        return this.processBatches(
            documents,
            async (document) => {
                if (!document.id) {
                    return { success: false, error: 'Document ID is missing' };
                }
                return this.syncCompanyDocument(document.id, forceSync, true, 'bulkSync');
            },
            'Document__c',
            3,
            true,
        );
    }

    /**
     * Sync location document to Salesforce Document object
     */
    async syncLocationDocument(documentId: number, forceSync = false, suppressErrorLog = false, caller = 'unknown'): Promise<SyncResult> {
        try {
            const document = await this.companyLocationDocumentsRepository.findById(documentId);

            if (!forceSync && !needsSync(document)) {
                return {
                    success: true,
                    skipped: true,
                    error: 'Document already synced, no changes detected',
                };
            }

            const documentData = mapLocationDocumentToSalesforceDocument(document);
            const cleanedDocumentData = cleanSalesforceData(documentData);

            SalesforceLogger.info('[Outbound] Syncing Location_Document__c', { direction: 'outbound', entity: 'Location_Document__c', documentId, action: 'upsert' });

            const result = await this.executeOperation('Document__c', () =>
                this.salesforceService.upsertRecord(
                    'Document__c',
                    'WasteTrade_Document_Id__c',
                    cleanedDocumentData,
                    suppressErrorLog,
                ),
            );

            await this.updateSyncTracking(
                this.companyLocationDocumentsRepository,
                documentId,
                result.success,
                result.salesforceId,
            );
            await this.logSync(documentId.toString(), 'Document__c', 'UPSERT', result, 'OUTBOUND', 0, `syncLocationDoc:success:${caller}`);
            if (result.success && !suppressErrorLog) {
                SalesforceLogger.info('[Outbound] Sync result for Location_Document__c', { direction: 'outbound', entity: 'Location_Document__c', documentId, success: result.success, salesforceId: result.salesforceId });
            }
            return result;
        } catch (error) {
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error syncing location document ${documentId}`, error, { documentId });
            }
            const result: SyncResult = {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };

            await this.updateSyncTracking(this.companyLocationDocumentsRepository, documentId, false);
            await this.logSync(documentId.toString(), 'Document__c', 'UPSERT', result, 'OUTBOUND', 0, `syncLocationDoc:error:${caller}`);
            return result;
        }
    }

    /**
     * Bulk sync all location documents with parallel processing
     */
    async syncAllLocationDocuments(forceSync = false, limit?: number): Promise<BulkSyncResult> {
        const findOptions: any = {};
        if (limit) {
            findOptions.limit = limit;
        }
        const documents = await this.companyLocationDocumentsRepository.find(findOptions);

        return this.processBatches(
            documents,
            async (document) => {
                if (!document.id) {
                    return { success: false, error: 'Document ID is missing' };
                }
                return this.syncLocationDocument(document.id, forceSync, true, 'bulkSync');
            },
            'Document__c',
            3,
            true,
        );
    }

    /**
     * Sync wanted listing to Salesforce
     */
    async syncWantedListing(listingId: number, forceSync = false, suppressErrorLog = false, caller = 'unknown'): Promise<SyncResult> {
        try {
            const listing = await this.listingsRepository.findById(listingId);
            // Check if sync is needed (unless forced)
            if (!forceSync && !needsSync(listing)) {
                return {
                    success: true,
                    skipped: true,
                    error: 'Wanted listing already synced, no changes detected',
                };
            }

            // Only sync if this is a wanted listing (you may need to add a field to distinguish)
            const wantedListingData = mapListingToWantedListing(listing);

            SalesforceLogger.info('[Outbound] Syncing Wanted_Listing__c', { direction: 'outbound', entity: 'Wanted_Listing__c', listingId, action: 'upsert' });

            let result = await this.executeOperation('Wanted_Listings__c', () =>
                this.salesforceService.upsertRecord(
                    'Wanted_Listings__c',
                    'WasteTrade_Listing_Id__c',
                    wantedListingData,
                    suppressErrorLog,
                ),
            );

            // If custom object doesn't exist, return a graceful message
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (!result.success && (result.error?.includes('INVALID_TYPE') || result.isCustomObjectMissing)) {
                result = {
                    success: false,
                    error: `Wanted_Listings__c custom object not found in Salesforce - please create the custom object first`,
                };
            }

            await this.updateSyncTracking(this.listingsRepository, listingId, result.success, result.salesforceId);
            await this.logSync(listingId.toString(), 'Wanted_Listings__c', 'UPSERT', result, 'OUTBOUND', 0, `syncWantedListing:success:${caller}`);
            if (result.success && !suppressErrorLog) {
                SalesforceLogger.info('[Outbound] Sync result for Wanted_Listing__c', { direction: 'outbound', entity: 'Wanted_Listing__c', listingId, success: result.success, salesforceId: result.salesforceId });
            }
            return result;
        } catch (error) {
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error syncing wanted listing ${listingId}`, error, { listingId });
            }
            const result: SyncResult = {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };

            // Update sync tracking to mark as failed
            await this.updateSyncTracking(this.listingsRepository, listingId, false);

            await this.logSync(listingId.toString(), 'Wanted_Listings__c', 'UPSERT', result, 'OUTBOUND', 0, `syncWantedListing:error:${caller}`);
            return result;
        }
    }

    /**
     * Bulk sync all listings (both regular and wanted listings) with parallel processing
     */
    async syncAllListings(forceSync = false, limit?: number): Promise<BulkSyncResult> {
        const findOptions: any = {};
        if (limit) {
            findOptions.limit = limit;
        }
        const listings = await this.listingsRepository.find(findOptions);

        return this.processBatches(
            listings,
            async (listing) => {
                if (!listing.id) {
                    return { success: false, error: 'Listing ID is missing' };
                }

                const isWantedListing = listing.listingType === ListingType.WANTED;
                return isWantedListing
                    ? this.syncWantedListing(listing.id, forceSync, true, 'bulkSync')
                    : this.syncListing(listing.id, forceSync, true, 'bulkSync');
            },
            'Sales_Listing__c',
            3,
            true,
        );
    }

    /**
     * Bulk sync all wanted listings only with parallel processing
     */
    async syncAllWantedListings(forceSync = false, limit?: number): Promise<BulkSyncResult> {
        const findOptions: any = {
            where: {
                listingType: ListingType.WANTED,
            },
        };
        if (limit) {
            findOptions.limit = limit;
        }
        const wantedListings = await this.listingsRepository.find(findOptions);

        return this.processBatches(
            wantedListings,
            async (listing) => {
                if (!listing.id) {
                    return { success: false, error: 'Listing ID is missing' };
                }
                return this.syncWantedListing(listing.id, forceSync, true, 'bulkSync');
            },
            'Wanted_Listings__c',
            3,
            true,
        );
    }

    /**
     * Sync records modified after a specific date
     */
    async syncRecordsModifiedAfter(
        modifiedAfter: Date,
        recordType:
            | 'companies'
            | 'users'
            | 'listings'
            | 'offers'
            | 'company_documents'
            | 'location_documents' = 'companies',
        forceSync = false,
    ): Promise<BulkSyncResult> {
        // Starting intelligent sync for records modified after date

        // Build a more intelligent filter that avoids syncing records multiple times
        const where = {
            or: [
                // Never synced records
                { isSyncedSalesForce: false },
                // Records with null sync date
                { lastSyncedSalesForceDate: null },
                // Recently updated records that haven't been synced since the update
                // We'll handle this logic in the filter methods to properly compare dates
                { updatedAt: { gte: modifiedAfter } },
            ],
        };

        switch (recordType) {
            case 'companies':
                return this.syncCompaniesByFilter(where, forceSync);
            case 'users':
                return this.syncUsersByFilter(where, forceSync);
            case 'listings':
                return this.syncListingsByFilter(where, forceSync);
            case 'offers':
                return this.syncOffersByFilter(where, forceSync);
            case 'company_documents':
                return this.syncCompanyDocumentsByFilter(where, forceSync);
            case 'location_documents':
                return this.syncLocationDocumentsByFilter(where, forceSync);
            default:
                throw new Error(`Unsupported record type: ${recordType}`);
        }
    }

    /**
     * Sync companies by filter with parallel processing
     */
    public async syncCompaniesByFilter(where: Record<string, unknown>, forceSync = false): Promise<BulkSyncResult> {
        const companies = await this.companiesRepository.find({ where, order: ['updatedAt DESC'], limit: SalesforceSyncService.MAX_RETRY_ITEMS });

        // Use shared filter function to eliminate duplication
        const filteredCompanies = filterRecordsNeedingSync(companies, forceSync);

        return this.processBatches(
            filteredCompanies,
            async (company) => {
                if (!company.id) {
                    return { success: false, error: 'Company ID is missing' };
                }
                return this.syncCompany(company.id, forceSync, true, 'cronRetry');
            },
            'Account',
            3,
            true,
        );
    }

    /**
     * Sync users by filter with parallel processing
     */
    public async syncUsersByFilter(where: Record<string, unknown>, forceSync = false): Promise<BulkSyncResult> {
        const users = await this.userRepository.find({ where, order: ['updatedAt DESC'], limit: SalesforceSyncService.MAX_RETRY_ITEMS });

        // Use shared filter function to eliminate duplication
        const filteredUsers = filterRecordsNeedingSync(users, forceSync);

        return this.processBatches(
            filteredUsers,
            async (user) => {
                if (!user.id) {
                    return { success: false, error: 'User ID is missing' };
                }
                return this.syncUserAsLead(user.id, forceSync, true, 'cronRetry');
            },
            'Lead',
            3,
            true,
        );
    }

    /**
     * Sync listings by filter with parallel processing
     */
    public async syncListingsByFilter(where: Record<string, unknown>, forceSync = false): Promise<BulkSyncResult> {
        const listings = await this.listingsRepository.find({ where, order: ['updatedAt DESC'], limit: SalesforceSyncService.MAX_RETRY_ITEMS });

        // Use shared filter function to eliminate duplication
        const filteredListings = filterRecordsNeedingSync(listings, forceSync);

        return this.processBatches(
            filteredListings,
            async (listing) => {
                if (!listing.id) {
                    return { success: false, error: 'Listing ID is missing' };
                }

                const isWantedListing = listing.listingType === ListingType.WANTED;
                return isWantedListing
                    ? this.syncWantedListing(listing.id, forceSync, true, 'cronRetry')
                    : this.syncListing(listing.id, forceSync, true, 'cronRetry');
            },
            'Sales_Listing__c',
            3,
            true,
        );
    }

    /**
     * Sync offers by filter with parallel processing
     */
    public async syncOffersByFilter(where: Record<string, unknown>, forceSync = false): Promise<BulkSyncResult> {
        const offers = await this.offersRepository.find({ where, order: ['updatedAt DESC'], limit: SalesforceSyncService.MAX_RETRY_ITEMS });

        // Use shared filter function to eliminate duplication
        const filteredOffers = filterRecordsNeedingSync(offers, forceSync);

        return this.processBatches(
            filteredOffers,
            async (offer) => {
                if (!offer.id) {
                    return { success: false, error: 'Offer ID is missing' };
                }
                return this.syncOffer(offer.id, forceSync, true, 'cronRetry');
            },
            'Offers__c',
            3,
            true,
        );
    }

    /**
     * Sync company users (Contacts) by filter with parallel processing
     * Only syncs ACTIVE company users (AC: Contact only created when ACTIVE)
     */
    public async syncCompanyUsersByFilter(where: Record<string, unknown>, forceSync = false): Promise<BulkSyncResult> {
        const filterWithStatus = {
            ...where,
            status: CompanyUserStatusEnum.ACTIVE,
        };
        const companyUsers = await this.companyUsersRepository.find({
            where: filterWithStatus,
            include: ['company'],
            order: ['updatedAt DESC'],
            limit: SalesforceSyncService.MAX_RETRY_ITEMS,
        });

        // Use shared filter function to eliminate duplication
        const filteredCompanyUsers = filterRecordsNeedingSync(companyUsers, forceSync);

        return this.processBatches(
            filteredCompanyUsers,
            async (companyUser) => {
                if (!companyUser.id) {
                    return { success: false, error: 'CompanyUser ID is missing' };
                }
                return this.syncCompanyUser(companyUser.id, forceSync, true, 'cronRetry');
            },
            'Contact',
            3,
            true,
        );
    }

    /**
     * Sync company documents by filter with parallel processing
     */
    public async syncCompanyDocumentsByFilter(
        where: Record<string, unknown>,
        forceSync = false,
    ): Promise<BulkSyncResult> {
        const documents = await this.companyDocumentsRepository.find({ where, order: ['updatedAt DESC'], limit: SalesforceSyncService.MAX_RETRY_ITEMS });

        // Use shared filter function to eliminate duplication
        const filteredDocuments = filterRecordsNeedingSync(documents, forceSync);

        return this.processBatches(
            filteredDocuments,
            async (document) => {
                if (!document.id) {
                    return { success: false, error: 'Document ID is missing' };
                }
                return this.syncCompanyDocument(document.id, forceSync, true, 'cronRetry');
            },
            'Document__c',
            3,
            true,
        );
    }

    /**
     * Sync location documents by filter with parallel processing
     */
    public async syncLocationDocumentsByFilter(
        where: Record<string, unknown>,
        forceSync = false,
    ): Promise<BulkSyncResult> {
        const documents = await this.companyLocationDocumentsRepository.find({ where, order: ['updatedAt DESC'], limit: SalesforceSyncService.MAX_RETRY_ITEMS });

        // Use shared filter function to eliminate duplication
        const filteredDocuments = filterRecordsNeedingSync(documents, forceSync);

        return this.processBatches(
            filteredDocuments,
            async (document) => {
                if (!document.id) {
                    return { success: false, error: 'Document ID is missing' };
                }
                return this.syncLocationDocument(document.id, forceSync, true, 'cronRetry');
            },
            'Document__c',
            3,
            true,
        );
    }

    // All field creation methods removed - fields must be created manually in Salesforce

    /**
     * Map country code to full country name for Salesforce picklist
     */

    /**
     * Cleanup Accounts in Salesforce for companies that are still PENDING
     * These were created before the fix that prevents Account creation during registration
     */
    async cleanupPendingCompanyAccounts(): Promise<{
        found: number;
        deleted: number;
        failed: number;
        errors: string[];
    }> {
        let found = 0;
        let deleted = 0;
        let failed = 0;
        const errors: string[] = [];

        try {
            // Find all companies that are still PENDING but have Salesforce IDs
            const pendingCompanies = await this.companiesRepository.find({
                where: {
                    status: CompanyStatus.PENDING,
                    salesforceId: { neq: null as any },
                    isSyncedSalesForce: true,
                },
            });

            found = pendingCompanies.length;
            SalesforceLogger.info(`Found ${found} pending companies with Salesforce Accounts to cleanup`);

            for (const company of pendingCompanies) {
                try {
                    if (company.salesforceId) {
                        // Delete the Account in Salesforce
                        const deleteResult = await this.salesforceService.deleteRecord('Account', company.salesforceId);

                        if (deleteResult.success) {
                            // Clear Salesforce sync fields in WasteTrade
                            await this.companiesRepository.updateById(company.id!, {
                                salesforceId: undefined,
                                isSyncedSalesForce: false,
                                lastSyncedSalesForceDate: undefined,
                            });

                            deleted++;
                            SalesforceLogger.info(`Deleted Account for pending company ${company.id}`, {
                                companyId: company.id,
                                salesforceId: company.salesforceId,
                                companyName: company.name,
                            });
                        } else {
                            failed++;
                            const error = `Failed to delete Account for company ${company.id}: ${deleteResult.error}`;
                            errors.push(error);
                            SalesforceLogger.warn(error);
                        }
                    }
                } catch (error) {
                    failed++;
                    const errorMsg = `Error processing company ${company.id}: ${SalesforceErrorHandler.extractErrorMessage(error)}`;
                    errors.push(errorMsg);
                    SalesforceLogger.error(errorMsg, error);
                }
            }

            SalesforceLogger.info(`Cleanup completed: ${deleted} deleted, ${failed} failed out of ${found} found`);

            return {
                found,
                deleted,
                failed,
                errors: errors.slice(0, 10), // Limit to first 10 errors to avoid large responses
            };
        } catch (error) {
            SalesforceLogger.error('Error during pending company cleanup', error);
            throw error;
        }
    }

    /**
     * Pull single haulage offer from Salesforce and update WasteTrade
     */
    async pullSingleHaulageOfferFromSalesforce(
        haulageOfferId: number,
    ): Promise<{ success: boolean; error?: string; data?: Record<string, unknown> }> {
        try {
            const envPrefix = process.env.ENVIRONMENT ?? 'DEV';
            const externalId = `${envPrefix}_${haulageOfferId}`;

            const haulageOffer = await this.haulageOffersRepository.findById(haulageOfferId).catch(() => null);
            if (!haulageOffer) {
                return { success: false, error: `Haulage offer ${haulageOfferId} not found in WasteTrade` };
            }

            const query = `
                SELECT Id, WasteTrade_Haulage_Offers_ID__c, haulier_listing_status__c,
                       haulage_rejection_reason__c, haulage_notes__c, LastModifiedDate,
                       expected__c, Transport_Provider__c, container_type__c, trailer_type__c,
                       trailer_or_container__c, demurrage__c,
                       suggested_collection_date__c, haulage__c, haulage_total__c, Customs_Clearance__c
                FROM Haulage_Offers__c 
                WHERE WasteTrade_Haulage_Offers_ID__c = '${externalId}'
                LIMIT 1
            `;
            const result = await this.salesforceService.query(query);

            if (!result.records || result.records.length === 0) {
                return { success: false, error: `Haulage offer ${haulageOfferId} not found in Salesforce` };
            }

            const record = result.records[0];
            const updateData: Record<string, unknown> = {};

            // Status - map SF status to WT status
            if (record[HaulageOffersFields.haulier_listing_status__c]) {
                const mappedStatus = mapHaulageOfferStatus(record[HaulageOffersFields.haulier_listing_status__c] as string, true);
                if (mappedStatus && mappedStatus !== haulageOffer.status) {
                    updateData.status = mappedStatus;
                }
            }

            // Expected transit time - values are now 1:1 with SF
            if (record[HaulageOffersFields.expected__c]) {
                const sfValue = record[HaulageOffersFields.expected__c] as string;
                if (sfValue && sfValue !== haulageOffer.expectedTransitTime) {
                    updateData.expectedTransitTime = sfValue;
                }
            }

            // Transport provider
            if (record[HaulageOffersFields.Transport_Provider__c]) {
                const mappedValue = mapTransportProvider(record[HaulageOffersFields.Transport_Provider__c] as string, true);
                if (mappedValue && mappedValue !== haulageOffer.transportProvider) {
                    updateData.transportProvider = mappedValue;
                }
            }

            // Container type - values are now 1:1 with SF
            if (record[HaulageOffersFields.container_type__c]) {
                const sfValue = record[HaulageOffersFields.container_type__c] as string;
                if (sfValue && sfValue !== haulageOffer.trailerContainerType) {
                    updateData.trailerContainerType = sfValue;
                }
            }

            // Trailer type - pull if trailer_or_container is Trailer
            if (record[HaulageOffersFields.trailer_type__c] && record[HaulageOffersFields.trailer_or_container__c] === 'Trailer') {
                const sfValue = record[HaulageOffersFields.trailer_type__c] as string;
                if (sfValue && sfValue !== haulageOffer.trailerContainerType) {
                    updateData.trailerContainerType = sfValue;
                }
            }

            // Demurrage
            if (record[HaulageOffersFields.demurrage__c]) {
                const demurrageValue = parseInt(record[HaulageOffersFields.demurrage__c] as string, 10);
                if (!isNaN(demurrageValue) && demurrageValue !== haulageOffer.demurrageAtDestination) {
                    updateData.demurrageAtDestination = demurrageValue;
                }
            }

            // Suggested collection date
            if (record[HaulageOffersFields.suggested_collection_date__c]) {
                const sfDate = new Date(record[HaulageOffersFields.suggested_collection_date__c] as string);
                updateData.suggestedCollectionDate = sfDate;
            }

            // Customs clearance
            if (record[HaulageOffersFields.Customs_Clearance__c]) {
                const mappedValue = mapCustomsClearance(record[HaulageOffersFields.Customs_Clearance__c] as string, true);
                if (mappedValue !== undefined && mappedValue !== haulageOffer.completingCustomsClearance) {
                    updateData.completingCustomsClearance = mappedValue as boolean;
                }
            }

            // Notes
            if (record[HaulageOffersFields.haulage_notes__c] && record[HaulageOffersFields.haulage_notes__c] !== haulageOffer.notes) {
                updateData.notes = record[HaulageOffersFields.haulage_notes__c];
            }

            // Haulage cost per load (SF field is string type)
            if (record[HaulageOffersFields.haulage__c]) {
                const haulageCost = parseFloat(record[HaulageOffersFields.haulage__c] as string);
                if (!isNaN(haulageCost) && haulageCost !== haulageOffer.haulageCostPerLoad) {
                    updateData.haulageCostPerLoad = haulageCost;
                    // Recalculate haulage total when cost changes
                    updateData.haulageTotal = haulageCost * haulageOffer.numberOfLoads + (haulageOffer.customsFee || 0);
                }
            }

            // Haulage total (SF field is string type) - only update if not already recalculated above
            if (record[HaulageOffersFields.haulage_total__c] && !updateData.haulageTotal) {
                const haulageTotal = parseFloat(record[HaulageOffersFields.haulage_total__c] as string);
                if (!isNaN(haulageTotal) && haulageTotal !== haulageOffer.haulageTotal) {
                    updateData.haulageTotal = haulageTotal;
                }
            }

            if (Object.keys(updateData).length > 0) {
                updateData.updatedAt = new Date();
                updateData.isSyncedSalesForce = true; // Mark as synced to prevent retry cron from pushing back
                updateData.lastSyncedSalesForceDate = new Date();
                await this.haulageOffersRepository.updateById(haulageOfferId, updateData);
                return { success: true, data: { updated: updateData, sfRecord: record } };
            }

            return { success: true, data: { message: 'No changes detected', sfRecord: record } };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * Pull Lead updates from Salesforce (for unverified users)
     * Syncs Lead data back to User records in WasteTrade
     */
    async pullLeadUpdatesFromSalesforce(sinceMinutes = 15): Promise<{ updated: number; failed: number }> {
        const results = { updated: 0, failed: 0 };

        try {
            const sinceDate = new Date(Date.now() - sinceMinutes * 60 * 1000);
            const sinceDateStr = sinceDate.toISOString();

            const leadQuery = `
                SELECT Id, WasteTrade_User_Id__c, FirstName, LastName,
                       Phone, Email, Company, Status,
                       LastModifiedDate, Last_Sync_Origin__c
                FROM Lead
                WHERE WasteTrade_User_Id__c != null
                AND IsConverted = false
                AND LastModifiedDate >= ${sinceDateStr}
                ORDER BY LastModifiedDate DESC
                LIMIT 200
            `;

            const leadResult = await this.salesforceService.query(leadQuery);

            SalesforceLogger.info(`Pull Leads: Found ${leadResult.records.length} records from SF`);

            for (const record of leadResult.records) {
                try {
                    // NOTE: Removed Last_Sync_Origin__c check - using timestamp comparison instead
                    // This allows SF edits to sync back even after WT pushed the record

                    const userExternalId = record[LeadFields.WasteTrade_User_Id__c] as string;
                    if (!userExternalId) {
                        continue;
                    }

                    const userId = parseInt(userExternalId.replace(ENV_PREFIX_PATTERN, ''), 10);
                    if (isNaN(userId)) {
                        continue;
                    }

                    const user = await this.userRepository.findById(userId).catch(() => null);
                    if (!user) {
                        continue;
                    }

                    // Build update data by comparing field values (data-diff approach)
                    const updateData: Record<string, unknown> = {};
                    if (record[LeadFields.FirstName] && record[LeadFields.FirstName] !== user.firstName) {
                        updateData.firstName = record[LeadFields.FirstName];
                    }
                    if (record[LeadFields.LastName] && record[LeadFields.LastName] !== user.lastName) {
                        updateData.lastName = record[LeadFields.LastName];
                    }
                    if (record[LeadFields.Phone] && record[LeadFields.Phone] !== user.phoneNumber) {
                        updateData.phoneNumber = record[LeadFields.Phone];
                    }
                    if (record[LeadFields.Email] && record[LeadFields.Email] !== user.email) {
                        // Check if email already taken by another user to avoid unique constraint violation
                        const existingUser = await this.userRepository.findOne({ where: { email: record[LeadFields.Email] as string } });
                        if (!existingUser || existingUser.id === userId) {
                            updateData.email = record[LeadFields.Email];
                        } else {
                            SalesforceLogger.warn(`Pull Lead ${userId}: Skipping email update — "${record[LeadFields.Email]}" already used by user ${existingUser.id}`);
                        }
                    }

                    // Update salesforceLeadId if different
                    if (record[LeadFields.Id] && record[LeadFields.Id] !== user.salesforceLeadId) {
                        updateData.salesforceLeadId = record[LeadFields.Id];
                        updateData.isSyncedSalesForce = true;
                        updateData.lastSyncedSalesForceDate = new Date();
                    }

                    if (Object.keys(updateData).length === 0) continue;

                    // Skip if SF is older — avoid overwriting WT edits
                    const sfLastModified = new Date(record[LeadFields.LastModifiedDate] as string);
                    const wtLastModified = user.updatedAt ? new Date(user.updatedAt) : new Date(0);
                    if (sfLastModified <= wtLastModified) {
                        SalesforceLogger.info(
                            `📥 Pull Lead ${userId}: SF older (${sfLastModified.toISOString()} <= ${wtLastModified.toISOString()}), skipping [${Object.keys(updateData).join(',')}]`,
                        );
                        continue;
                    }

                    await this.userRepository.updateById(userId, updateData);
                    results.updated++;
                    SalesforceLogger.info(`Pull Lead ${userId}: Updated fields`, {
                        fields: Object.keys(updateData),
                    });
                } catch (err) {
                    results.failed++;
                    SalesforceLogger.warn(`Pull Lead failed`, {
                        error: SalesforceErrorHandler.extractErrorMessage(err),
                    });
                }
            }
        } catch (error) {
            SalesforceLogger.warn('Failed to pull Lead updates from Salesforce', {
                error: SalesforceErrorHandler.extractErrorMessage(error),
            });
        }

        return results;
    }

    /**
     * Pull updated records from Salesforce and sync to WasteTrade (Inbound Sync)
     * This queries SF for records updated since last sync and updates WT accordingly
     */
    async pullUpdatesFromSalesforce(
        sinceMinutes = 10080,
        forceAll = false,
    ): Promise<{
        accounts: { updated: number; failed: number };
        contacts: { updated: number; failed: number };
        haulageOffers: { updated: number; failed: number };
        leads: { updated: number; failed: number };
    }> {
        const results = {
            accounts: { updated: 0, failed: 0 },
            contacts: { updated: 0, failed: 0 },
            haulageOffers: { updated: 0, failed: 0 },
            leads: { updated: 0, failed: 0 },
        };

        try {
            const sinceDate = new Date(Date.now() - sinceMinutes * 60 * 1000);
            const sinceDateStr = sinceDate.toISOString();
            const dateFilter = forceAll ? '' : `AND LastModifiedDate >= ${sinceDateStr}`;

            // Pull Account updates
            try {
                const accountQuery = `
                    SELECT Id, WasteTrade_Company_Id__c, Name, Phone, Website,
                           BillingStreet, BillingCity, BillingPostalCode, BillingCountry, BillingState,
                           Account_Status__c, LastModifiedDate, Last_Sync_Origin__c
                    FROM Account
                    WHERE WasteTrade_Company_Id__c != null
                    ${dateFilter}
                    ORDER BY LastModifiedDate DESC
                    LIMIT 200
                `;
                const accountResult = await this.salesforceService.query(accountQuery);

                SalesforceLogger.info(`Pull Accounts: Found ${accountResult.records.length} records from SF`);

                for (const record of accountResult.records) {
                    try {
                        // NOTE: Removed Last_Sync_Origin__c check - using timestamp comparison instead
                        // This allows SF edits to sync back even after WT pushed the record

                        const externalId = record[AccountFields.WasteTrade_Company_Id__c] as string;
                        if (!externalId) continue;

                        const companyId = parseInt(externalId.replace(ENV_PREFIX_PATTERN, ''), 10);
                        if (isNaN(companyId)) continue;

                        const company = await this.companiesRepository.findById(companyId).catch(() => null);
                        if (!company) continue;

                        // Build update data by comparing field values
                        const updateData: Record<string, unknown> = {};
                        if (record[AccountFields.Name]) {
                            // Strip environment prefix before saving to local DB
                            const cleanName = (record[AccountFields.Name] as string).replace(ENV_PREFIX_PATTERN, '');
                            if (cleanName !== company.name) {
                                updateData.name = cleanName;
                            }
                        }
                        if (record[AccountFields.Phone] && record[AccountFields.Phone] !== company.phoneNumber) {
                            updateData.phoneNumber = record[AccountFields.Phone];
                        }
                        if (record[AccountFields.Website] && record[AccountFields.Website] !== company.website) {
                            updateData.website = record[AccountFields.Website];
                        }
                        if (record[AccountFields.BillingCity] && record[AccountFields.BillingCity] !== company.city) {
                            updateData.city = record[AccountFields.BillingCity];
                        }
                        if (record[AccountFields.BillingCountry] && record[AccountFields.BillingCountry] !== company.country) {
                            updateData.country = record[AccountFields.BillingCountry];
                        }
                        if (record[AccountFields.BillingStreet] && record[AccountFields.BillingStreet] !== company.addressLine1) {
                            updateData.addressLine1 = record[AccountFields.BillingStreet];
                        }
                        if (record[AccountFields.BillingPostalCode] && record[AccountFields.BillingPostalCode] !== company.postalCode) {
                            updateData.postalCode = record[AccountFields.BillingPostalCode];
                        }
                        if (record[AccountFields.BillingState] && record[AccountFields.BillingState] !== company.stateProvince) {
                            updateData.stateProvince = record[AccountFields.BillingState];
                        }

                        // NOTE: Status changes are NOT pulled here — they go through the webhook path
                        // (processAccountUpdate) which has proper validation and notification triggers.
                        // Pull sync only updates data fields (name, address, etc.).

                        // Skip if no actual data differences
                        if (Object.keys(updateData).length === 0) continue;

                        // Check if SF data is newer (skip if WT was updated more recently, unless data differs)
                        const sfLastModified = new Date(record[AccountFields.LastModifiedDate] as string);
                        const wtLastModified = company.updatedAt ? new Date(company.updatedAt) : new Date(0);

                        if (sfLastModified <= wtLastModified) {
                            // SF is older — skip to avoid overwriting WT edits
                            SalesforceLogger.info(
                                `📥 Pull Account ${companyId}: SF older (${sfLastModified.toISOString()} <= ${wtLastModified.toISOString()}), skipping [${Object.keys(updateData).join(',')}]`,
                            );
                            continue;
                        }

                        // Mark as synced to prevent retry cronjob from pushing back to SF
                        updateData.isSyncedSalesForce = true;
                        updateData.lastSyncedSalesForceDate = new Date();
                        await this.companiesRepository.updateById(companyId, updateData);
                        results.accounts.updated++;
                    } catch (err) {
                        results.accounts.failed++;
                        SalesforceLogger.warn('Pull Account update failed', {
                            sfId: record[AccountFields.Id],
                            externalId: record[AccountFields.WasteTrade_Company_Id__c],
                            error: SalesforceErrorHandler.extractErrorMessage(err),
                        });
                    }
                }
            } catch (err) {
                SalesforceLogger.warn('Failed to pull Account updates from Salesforce', {
                    error: SalesforceErrorHandler.extractErrorMessage(err),
                });
            }

            // Pull Contact updates
            try {
                const contactQuery = `
                    SELECT Id, WasteTrade_User_Id__c, Account.WasteTrade_Company_Id__c,
                           FirstName, LastName, Phone, Email,
                           Company_Role__c, Is_Primary_Contact__c, Company_User_Status__c,
                           LastModifiedDate, Last_Sync_Origin__c
                    FROM Contact
                    WHERE WasteTrade_User_Id__c != null
                    ${dateFilter}
                    ORDER BY LastModifiedDate DESC
                    LIMIT 200
                `;
                const contactResult = await this.salesforceService.query(contactQuery);

                SalesforceLogger.info(`Pull Contacts: Found ${contactResult.records.length} records from SF`);

                for (const record of contactResult.records) {
                    try {
                        const userExternalId = record[ContactFields.WasteTrade_User_Id__c] as string;
                        if (!userExternalId) continue;

                        const userId = parseInt(userExternalId.replace(ENV_PREFIX_PATTERN, ''), 10);
                        if (isNaN(userId)) continue;

                        const user = await this.userRepository.findById(userId).catch(() => null);
                        if (!user) continue;

                        // Build update data by comparing field values (data-diff approach)
                        const userUpdateData: Record<string, unknown> = {};
                        if (record[ContactFields.FirstName] && record[ContactFields.FirstName] !== user.firstName) {
                            userUpdateData.firstName = record[ContactFields.FirstName];
                        }
                        if (record[ContactFields.LastName] && record[ContactFields.LastName] !== user.lastName) {
                            userUpdateData.lastName = record[ContactFields.LastName];
                        }
                        if (record[ContactFields.Phone] && record[ContactFields.Phone] !== user.phoneNumber) {
                            userUpdateData.phoneNumber = record[ContactFields.Phone];
                        }
                        if (record[ContactFields.Email] && record[ContactFields.Email] !== user.email) {
                            // Check if email already taken by another user to avoid unique constraint violation
                            const existingUser = await this.userRepository.findOne({ where: { email: record[ContactFields.Email] as string } });
                            if (!existingUser || existingUser.id === userId) {
                                userUpdateData.email = record[ContactFields.Email];
                            } else {
                                SalesforceLogger.warn(`Pull Contact ${userId}: Skipping email update — "${record[ContactFields.Email]}" already used by user ${existingUser.id}`);
                            }
                        }

                        // Build CompanyUser update data
                        const accountRecord = record['Account'] as Record<string, unknown> | undefined;
                        const companyExternalId = accountRecord?.[AccountFields.WasteTrade_Company_Id__c] as string;
                        let cuUpdateData: Record<string, unknown> = {};
                        let companyUser: any = null;

                        if (companyExternalId) {
                            const companyId = parseInt(companyExternalId.replace(ENV_PREFIX_PATTERN, ''), 10);
                            if (!isNaN(companyId)) {
                                companyUser = await this.companyUsersRepository.findOne({
                                    where: { userId, companyId },
                                });
                                if (companyUser) {
                                    if (record[ContactFields.Company_Role__c]) {
                                        const mappedRole = mapCompanyRole(String(record[ContactFields.Company_Role__c]), true);
                                        if (mappedRole && mappedRole !== companyUser.companyRole) {
                                            cuUpdateData.companyRole = mappedRole;
                                        }
                                    }
                                    if (
                                        record[ContactFields.Is_Primary_Contact__c] !== undefined &&
                                        record[ContactFields.Is_Primary_Contact__c] !== companyUser.isPrimaryContact
                                    ) {
                                        cuUpdateData.isPrimaryContact = record[ContactFields.Is_Primary_Contact__c];
                                    }
                                    if (record[ContactFields.Company_User_Status__c]) {
                                        const mappedStatus = mapCompanyUserStatus(String(record[ContactFields.Company_User_Status__c]), true);
                                        if (mappedStatus && mappedStatus !== companyUser.status) {
                                            cuUpdateData.status = mappedStatus;
                                        }
                                    }
                                    if (record[ContactFields.Id] && record[ContactFields.Id] !== companyUser.salesforceId) {
                                        cuUpdateData.salesforceId = record[ContactFields.Id];
                                        cuUpdateData.isSyncedSalesForce = true;
                                        cuUpdateData.lastSyncedSalesForceDate = new Date();
                                    }
                                }
                            }
                        }

                        // Skip if no actual data differences anywhere
                        const hasUserChanges = Object.keys(userUpdateData).length > 0;
                        const hasCuChanges = Object.keys(cuUpdateData).length > 0;
                        if (!hasUserChanges && !hasCuChanges) continue;

                        // Skip if SF is older — avoid overwriting WT edits
                        const sfLastModified = new Date(record[ContactFields.LastModifiedDate] as string);
                        const wtLastModified = user.updatedAt ? new Date(user.updatedAt) : new Date(0);
                        if (sfLastModified <= wtLastModified) {
                            SalesforceLogger.info(
                                `📥 Pull Contact ${userId}: SF older (${sfLastModified.toISOString()} <= ${wtLastModified.toISOString()}), skipping [${[...Object.keys(userUpdateData), ...Object.keys(cuUpdateData)].join(',')}]`,
                            );
                            continue;
                        }

                        // Apply updates — mark as synced to prevent retry cronjob bounce
                        if (hasUserChanges) {
                            userUpdateData.isSyncedSalesForce = true;
                            userUpdateData.lastSyncedSalesForceDate = new Date();
                            await this.userRepository.updateById(userId, userUpdateData);
                        }
                        if (hasCuChanges && companyUser) {
                            await this.companyUsersRepository.updateById(companyUser.id!, cuUpdateData);
                        }

                        results.contacts.updated++;
                    } catch (err) {
                        results.contacts.failed++;
                        SalesforceLogger.warn('Pull Contact update failed', {
                            sfId: record[ContactFields.Id],
                            externalId: record[ContactFields.WasteTrade_User_Id__c],
                            error: SalesforceErrorHandler.extractErrorMessage(err),
                        });
                    }
                }
            } catch (err) {
                SalesforceLogger.warn('Failed to pull Contact updates from Salesforce', {
                    error: SalesforceErrorHandler.extractErrorMessage(err),
                });
            }

            // Pull Haulage Offer updates
            try {
                const haulageQuery = `
                    SELECT Id, WasteTrade_Haulage_Offers_ID__c, haulier_listing_status__c,
                           haulage_rejection_reason__c, haulage_notes__c, LastModifiedDate, Last_Sync_Origin__c,
                           expected__c, Transport_Provider__c, container_type__c, trailer_type__c,
                           trailer_or_container__c, demurrage__c,
                           suggested_collection_date__c, haulage__c, haulage_total__c, Customs_Clearance__c
                    FROM Haulage_Offers__c
                    WHERE WasteTrade_Haulage_Offers_ID__c != null
                    ${dateFilter}
                    ORDER BY LastModifiedDate DESC
                    LIMIT 200
                `;
                const haulageResult = await this.salesforceService.query(haulageQuery);
                SalesforceLogger.info(`Pull Haulage Offers: Found ${haulageResult.records.length} records from SF`);

                for (const record of haulageResult.records) {
                    try {
                        // NOTE: We removed the Last_Sync_Origin__c check here because:
                        // 1. We want to always pull latest data from SF regardless of origin
                        // 2. The single pull method works without this check
                        // 3. Loop prevention is handled by comparing actual field values

                        const externalId = record[HaulageOffersFields.WasteTrade_Haulage_Offers_ID__c] as string;
                        if (!externalId) continue;

                        const haulageOfferId = parseInt(externalId.replace(ENV_PREFIX_PATTERN, ''), 10);
                        if (isNaN(haulageOfferId)) continue;

                        const haulageOffer = await this.haulageOffersRepository
                            .findById(haulageOfferId)
                            .catch(() => null);
                        if (!haulageOffer) {
                            SalesforceLogger.warn(
                                `Pull Haulage Offer: WT record ${haulageOfferId} not found, skipping`,
                            );
                            continue;
                        }

                        // Update WT with SF data (skip timestamp check - always pull latest from SF)
                        const updateData: Record<string, unknown> = {};

                        // Status - map SF status to WT status
                        if (record[HaulageOffersFields.haulier_listing_status__c]) {
                            const mappedStatus = mapHaulageOfferStatus(record[HaulageOffersFields.haulier_listing_status__c] as string, true);
                            if (mappedStatus && mappedStatus !== haulageOffer.status) {
                                updateData.status = mappedStatus;
                            }
                        }

                        // Notes and rejection reason
                        if (record[HaulageOffersFields.haulage_notes__c] && record[HaulageOffersFields.haulage_notes__c] !== haulageOffer.notes) {
                            updateData.notes = record[HaulageOffersFields.haulage_notes__c];
                        }
                        if (
                            record[HaulageOffersFields.haulage_rejection_reason__c] &&
                            record[HaulageOffersFields.haulage_rejection_reason__c] !== haulageOffer.rejectionReason
                        ) {
                            updateData.rejectionReason = record[HaulageOffersFields.haulage_rejection_reason__c];
                        }

                        // Expected transit time - values are now 1:1 with SF
                        if (record[HaulageOffersFields.expected__c]) {
                            const sfValue = record[HaulageOffersFields.expected__c] as string;
                            if (sfValue && sfValue !== haulageOffer.expectedTransitTime) {
                                updateData.expectedTransitTime = sfValue;
                            }
                        }

                        // Transport provider (SF → WT mapping)
                        if (record[HaulageOffersFields.Transport_Provider__c]) {
                            const mappedValue = mapTransportProvider(record[HaulageOffersFields.Transport_Provider__c] as string, true);
                            if (mappedValue && mappedValue !== haulageOffer.transportProvider) {
                                updateData.transportProvider = mappedValue;
                            }
                        }

                        // Trailer type - WT only uses trailers, always pull from trailer_type__c
                        if (record[HaulageOffersFields.trailer_type__c]) {
                            const sfValue = record[HaulageOffersFields.trailer_type__c] as string;
                            if (sfValue && sfValue !== haulageOffer.trailerContainerType) {
                                updateData.trailerContainerType = sfValue;
                            }
                        }

                        // Demurrage (string to number)
                        if (record[HaulageOffersFields.demurrage__c]) {
                            const demurrageValue = parseInt(record[HaulageOffersFields.demurrage__c] as string, 10);
                            if (!isNaN(demurrageValue) && demurrageValue !== haulageOffer.demurrageAtDestination) {
                                updateData.demurrageAtDestination = demurrageValue;
                            }
                        }

                        // Suggested collection date
                        if (record[HaulageOffersFields.suggested_collection_date__c]) {
                            const sfDate = new Date(record[HaulageOffersFields.suggested_collection_date__c] as string);
                            const wtDate = haulageOffer.suggestedCollectionDate
                                ? new Date(haulageOffer.suggestedCollectionDate)
                                : null;
                            if (!wtDate || sfDate.toISOString().split('T')[0] !== wtDate.toISOString().split('T')[0]) {
                                updateData.suggestedCollectionDate = sfDate;
                            }
                        }

                        // Customs clearance (SF → WT mapping)
                        if (record[HaulageOffersFields.Customs_Clearance__c]) {
                            const mappedValue = mapCustomsClearance(record[HaulageOffersFields.Customs_Clearance__c] as string, true);
                            if (mappedValue !== undefined && mappedValue !== haulageOffer.completingCustomsClearance) {
                                updateData.completingCustomsClearance = mappedValue as boolean;
                            }
                        }

                        // Haulage cost per load (SF field is string type)
                        if (record[HaulageOffersFields.haulage__c]) {
                            const haulageCost = Math.round(parseFloat(record[HaulageOffersFields.haulage__c] as string) * 100) / 100;
                            if (!isNaN(haulageCost) && haulageCost !== Number(haulageOffer.haulageCostPerLoad)) {
                                updateData.haulageCostPerLoad = haulageCost;
                                // Recalculate haulage total when cost changes (round to 2 decimal places)
                                const total =
                                    haulageCost * haulageOffer.numberOfLoads + Number(haulageOffer.customsFee || 0);
                                updateData.haulageTotal = Math.round(total * 100) / 100;
                            }
                        }

                        // Haulage total (SF field is string type) - only update if not already recalculated above
                        if (record[HaulageOffersFields.haulage_total__c] && !updateData.haulageTotal) {
                            const haulageTotal =
                                Math.round(parseFloat(record[HaulageOffersFields.haulage_total__c] as string) * 100) / 100;
                            if (!isNaN(haulageTotal) && haulageTotal !== Number(haulageOffer.haulageTotal)) {
                                updateData.haulageTotal = haulageTotal;
                            }
                        }

                        if (Object.keys(updateData).length > 0) {
                            // Skip if SF is older — avoid overwriting WT edits
                            const sfLastModified = new Date(record[HaulageOffersFields.LastModifiedDate] as string);
                            const wtLastModified = haulageOffer.updatedAt ? new Date(haulageOffer.updatedAt) : new Date(0);
                            if (sfLastModified <= wtLastModified) {
                                SalesforceLogger.info(
                                    `📥 Pull Haulage Offer ${haulageOfferId}: SF older (${sfLastModified.toISOString()} <= ${wtLastModified.toISOString()}), skipping [${Object.keys(updateData).join(',')}]`,
                                );
                                continue;
                            }

                            updateData.updatedAt = new Date();
                            updateData.isSyncedSalesForce = true; // Mark as synced to prevent retry cron from pushing back
                            updateData.lastSyncedSalesForceDate = new Date();
                            await this.haulageOffersRepository.updateById(haulageOfferId, updateData);
                            SalesforceLogger.info(`Pull Haulage Offer ${haulageOfferId}: Updated fields`, {
                                fields: Object.keys(updateData),
                            });
                            results.haulageOffers.updated++;
                        } else {
                            SalesforceLogger.info(`Pull Haulage Offer ${haulageOfferId}: No changes detected`);
                        }
                    } catch (err) {
                        SalesforceLogger.warn(`Pull Haulage Offer failed`, {
                            error: SalesforceErrorHandler.extractErrorMessage(err),
                        });
                        results.haulageOffers.failed++;
                    }
                }
            } catch (err) {
                SalesforceLogger.warn('Failed to pull Haulage Offer updates from Salesforce', {
                    error: SalesforceErrorHandler.extractErrorMessage(err),
                });
            }

            // Pull Lead updates (for unverified users)
            try {
                const leadResults = await this.pullLeadUpdatesFromSalesforce(sinceMinutes);
                results.leads.updated = leadResults.updated;
                results.leads.failed = leadResults.failed;
            } catch (err) {
                SalesforceLogger.warn('Failed to pull Lead updates from Salesforce', {
                    error: SalesforceErrorHandler.extractErrorMessage(err),
                });
            }

            return results;
        } catch (error) {
            SalesforceLogger.error('Error pulling updates from Salesforce', error);
            return results;
        }
    }

    /**
     * Pull Listing status updates from Salesforce (6.5.1.4)
     * Only status changes are synced inbound
     */
    async pullListingStatusUpdatesFromSalesforce(sinceMinutes = 15): Promise<{ updated: number; failed: number }> {
        const results = { updated: 0, failed: 0 };

        try {
            const sinceDate = new Date(Date.now() - sinceMinutes * 60 * 1000);
            const sinceDateStr = sinceDate.toISOString();

            const query = `
                SELECT Id, WasteTrade_Listing_Id__c, Listing_Status__c,
                       LastModifiedDate, Last_Sync_Origin__c
                FROM Sales_Listing__c
                WHERE WasteTrade_Listing_Id__c != null
                AND LastModifiedDate >= ${sinceDateStr}
                ORDER BY LastModifiedDate DESC
                LIMIT 200
            `;
            const result = await this.salesforceService.query(query);

            for (const record of result.records) {
                try {
                    const externalId = record[SalesListingFields.WasteTrade_Listing_Id__c] as string;
                    if (!externalId) continue;

                    const listingId = parseInt(externalId.replace(ENV_PREFIX_PATTERN, ''), 10);
                    if (isNaN(listingId)) continue;

                    const listing = await this.listingsRepository.findById(listingId).catch(() => null);
                    if (!listing) continue;

                    // Map status and check if different (data-diff approach)
                    const sfStatus = record[SalesListingFields.Listing_Status__c] as string;
                    const wtStatus = mapListingStatus(sfStatus, true) as ListingStatus | undefined;
                    if (!wtStatus || wtStatus === listing.status) continue;

                    await this.listingsRepository.updateById(listingId, {
                        status: wtStatus,
                        updatedAt: new Date(),
                        isSyncedSalesForce: true,
                        lastSyncedSalesForceDate: new Date(),
                    });
                    results.updated++;
                } catch (err) {
                    results.failed++;
                    SalesforceLogger.warn('Pull Listing status update failed', {
                        sfId: record[SalesListingFields.Id],
                        externalId: record[SalesListingFields.WasteTrade_Listing_Id__c],
                        error: SalesforceErrorHandler.extractErrorMessage(err),
                    });
                }
            }
        } catch (error) {
            SalesforceLogger.warn('Failed to pull Listing status updates from Salesforce', {
                error: SalesforceErrorHandler.extractErrorMessage(error),
            });
        }

        return results;
    }

    /**
     * Pull Offer status updates from Salesforce (6.5.1.4)
     * Only status changes are synced inbound
     */
    async pullOfferStatusUpdatesFromSalesforce(sinceMinutes = 15): Promise<{ updated: number; failed: number }> {
        const results = { updated: 0, failed: 0 };

        try {
            const sinceDate = new Date(Date.now() - sinceMinutes * 60 * 1000);
            const sinceDateStr = sinceDate.toISOString();

            const query = `
                SELECT Id, WasteTrade_Offer_Id__c, bid_status__c, Offer_Status__c,
                       Rejection_Reason__c, LastModifiedDate, Last_Sync_Origin__c
                FROM Offers__c
                WHERE WasteTrade_Offer_Id__c != null
                AND LastModifiedDate >= ${sinceDateStr}
                ORDER BY LastModifiedDate DESC
                LIMIT 200
            `;
            const result = await this.salesforceService.query(query);

            for (const record of result.records) {
                try {
                    // NOTE: Loop prevention via timestamp comparison below
                    // Don't skip based on Last_Sync_Origin__c - user may have edited SF after WT sync

                    const externalId = record[OffersFields.WasteTrade_Offer_Id__c] as string;
                    if (!externalId) continue;

                    const offerId = parseInt(externalId.replace(ENV_PREFIX_PATTERN, ''), 10);
                    if (isNaN(offerId)) continue;

                    const offer = await this.offersRepository.findById(offerId).catch(() => null);
                    if (!offer) continue;

                    // Map status (data-diff approach - removed timestamp gate)
                    const sfStatus = (record[OffersFields.bid_status__c] || record[OffersFields.Offer_Status__c]) as string;
                    const wtStatus = mapOfferStatus(sfStatus, true);
                    if (!wtStatus || wtStatus === offer.status) continue;

                    const updateData: Record<string, unknown> = {
                        status: wtStatus,
                        updatedAt: new Date(),
                        isSyncedSalesForce: true,
                        lastSyncedSalesForceDate: new Date(),
                    };

                    if (wtStatus === OfferStatusEnum.REJECTED && record[OffersFields.Rejection_Reason__c]) {
                        updateData.rejectionReason = record[OffersFields.Rejection_Reason__c];
                    }
                    if (wtStatus === OfferStatusEnum.ACCEPTED) {
                        updateData.acceptedAt = new Date();
                    }

                    await this.offersRepository.updateById(offerId, updateData);
                    results.updated++;
                } catch (err) {
                    results.failed++;
                    SalesforceLogger.warn('Pull Offer status update failed', {
                        sfId: record[OffersFields.Id],
                        externalId: record[OffersFields.WasteTrade_Offer_Id__c],
                        error: SalesforceErrorHandler.extractErrorMessage(err),
                    });
                }
            }
        } catch (error) {
            SalesforceLogger.warn('Failed to pull Offer status updates from Salesforce', {
                error: SalesforceErrorHandler.extractErrorMessage(error),
            });
        }

        return results;
    }

    /**
     * Pull Wanted Listing status updates from Salesforce (6.5.1.4)
     * Only status changes are synced inbound
     */
    async pullWantedListingStatusUpdatesFromSalesforce(
        sinceMinutes = 15,
    ): Promise<{ updated: number; failed: number }> {
        const results = { updated: 0, failed: 0 };

        try {
            const sinceDate = new Date(Date.now() - sinceMinutes * 60 * 1000);
            const sinceDateStr = sinceDate.toISOString();

            const query = `
                SELECT Id, WasteTrade_Listing_Id__c, Listing_Status__c,
                       LastModifiedDate, Last_Sync_Origin__c
                FROM Wanted_Listings__c
                WHERE WasteTrade_Listing_Id__c != null
                AND LastModifiedDate >= ${sinceDateStr}
                ORDER BY LastModifiedDate DESC
                LIMIT 200
            `;
            const result = await this.salesforceService.query(query);

            for (const record of result.records) {
                try {
                    const externalId = record[WantedListingFields.WasteTrade_Listing_Id__c] as string;
                    if (!externalId) continue;

                    const listingId = parseInt(externalId.replace(ENV_PREFIX_PATTERN, ''), 10);
                    if (isNaN(listingId)) continue;

                    const listing = await this.listingsRepository.findById(listingId).catch(() => null);
                    if (!listing) continue;

                    // Map status and check if different (data-diff approach)
                    const sfStatus = record[WantedListingFields.Listing_Status__c] as string;
                    const wtStatus = mapListingStatus(sfStatus, true) as ListingStatus | undefined;
                    if (!wtStatus || wtStatus === listing.status) continue;

                    await this.listingsRepository.updateById(listingId, {
                        status: wtStatus,
                        updatedAt: new Date(),
                        isSyncedSalesForce: true,
                        lastSyncedSalesForceDate: new Date(),
                    });
                    results.updated++;
                } catch (err) {
                    results.failed++;
                    SalesforceLogger.warn('Pull Wanted Listing status update failed', {
                        sfId: record[WantedListingFields.Id],
                        externalId: record[WantedListingFields.WasteTrade_Listing_Id__c],
                        error: SalesforceErrorHandler.extractErrorMessage(err),
                    });
                }
            }
        } catch (error) {
            SalesforceLogger.warn('Failed to pull Wanted Listing status updates from Salesforce', {
                error: SalesforceErrorHandler.extractErrorMessage(error),
            });
        }

        return results;
    }

    /**
     * Sync company merge to Salesforce
     * - Archive merged Account (set Archived__c = true)
     * - Reparent Contacts from merged Account to master Account
     * Per CRM Alignment requirement 6.3.3.9
     */
    async syncCompanyMerge(
        masterCompanyId: number,
        mergedCompanyId: number,
        mergedCompanySalesforceId?: string,
    ): Promise<SyncResult> {
        try {
            // Get master company's Salesforce Account ID
            const masterCompany = await this.companiesRepository.findById(masterCompanyId);
            let masterAccountId = masterCompany.salesforceId;

            if (!masterAccountId) {
                // Try to find by external ID
                const externalId = addEnvironmentPrefixToExternalId(masterCompanyId.toString());
                const masterAccount = await this.salesforceService
                    .findByExternalId('Account', 'WasteTrade_Company_Id__c', externalId, true)
                    .catch(() => null);
                masterAccountId = masterAccount?.Id;
            }

            if (!masterAccountId) {
                return {
                    success: false,
                    error: `Master company ${masterCompanyId} not found in Salesforce`,
                };
            }

            // Get merged company's Salesforce Account ID
            let mergedAccountId = mergedCompanySalesforceId;
            if (!mergedAccountId) {
                const externalId = addEnvironmentPrefixToExternalId(mergedCompanyId.toString());
                const mergedAccount = await this.salesforceService
                    .findByExternalId('Account', 'WasteTrade_Company_Id__c', externalId, true)
                    .catch(() => null);
                mergedAccountId = mergedAccount?.Id;
            }

            if (!mergedAccountId) {
                // Merged company not in SF - nothing to do
                return {
                    success: true,
                    skipped: true,
                    error: `Merged company ${mergedCompanyId} not found in Salesforce, skipping`,
                };
            }

            SalesforceLogger.info('[Outbound] Syncing Account (merge)', { direction: 'outbound', entity: 'Account', masterCompanyId, mergedCompanyId, action: 'upsert' });

            // Step 1: Reparent all Contacts from merged Account to master Account
            const contactQuery = `SELECT Id FROM Contact WHERE AccountId = '${escapeSoql(mergedAccountId)}'`;
            const contactResult = await this.salesforceService.query(contactQuery);

            let reparentedCount = 0;
            for (const contact of contactResult.records || []) {
                try {
                    await this.salesforceService.updateRecord('Contact', contact.Id as string, {
                        AccountId: masterAccountId,
                        Last_Sync_Origin__c: `WT_MERGE_${Date.now()}`,
                    });
                    reparentedCount++;
                } catch (err) {
                    SalesforceLogger.warn(`Failed to reparent contact ${contact.Id}`, {
                        contactId: contact.Id,
                        error: SalesforceErrorHandler.extractErrorMessage(err),
                    });
                }
            }

            // Step 2: Archive merged Account (set Archived__c = true)
            const archiveResult = await this.salesforceService.updateRecord('Account', mergedAccountId, {
                Archived__c: true,
                Description: `[MERGED] This account was merged into master account. Original WasteTrade Company ID: ${mergedCompanyId}`,
                Last_Sync_Origin__c: `WT_MERGE_${Date.now()}`,
            });

            if (!archiveResult.success) {
                SalesforceLogger.warn(`Failed to archive merged Account ${mergedAccountId}`, {
                    error: archiveResult.error,
                });
            }

            SalesforceLogger.info(`Company merge synced to Salesforce`, {
                direction: 'outbound',
                masterCompanyId,
                mergedCompanyId,
                masterAccountId,
                mergedAccountId,
                reparentedContacts: reparentedCount,
                archived: archiveResult.success,
            });

            return {
                success: true,
                salesforceId: masterAccountId,
            };
        } catch (error) {
            SalesforceLogger.error('Error syncing company merge to Salesforce', error, {
                masterCompanyId,
                mergedCompanyId,
            });
            return {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };
        }
    }
}
