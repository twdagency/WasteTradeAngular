/* eslint-disable @typescript-eslint/no-explicit-any */
import { BindingScope, injectable, inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { get } from 'lodash';
import { MyUserProfile } from '../authentication-strategies/type';
import { EU_ISO_CODES, REST_ISO_CODES, UK_ISO_CODE, COUNTRIES_LIST } from '../constants/country';
import { EMAIL_BLOCK_REGEX, PHONE_BLOCK_REGEX, URL_BLOCK_REGEX } from '../constants/regexp';
import { messages } from '../constants/messages';
import {
    CompanyStatus,
    ECurrency,
    HaulageOfferStatus,
    HaulageBidAction,
    HaulageBidRejectionReason,
    NotificationType,
    UserRoleEnum,
    CompanyUserStatusEnum,
    OfferStatusEnum,
} from '../enum';
import {
    CreateHaulageOffer,
    HaulageOffers,
    UpdateHaulageOffer,
    HaulageBidActionRequest,
    HaulageOfferDocuments,
} from '../models';
import {
    CompaniesRepository,
    CompanyLocationsRepository,
    HaulageOffersRepository,
    HaulageOfferDocumentsRepository,
    ListingsRepository,
    OffersRepository,
    UserRepository,
    CompanyUsersRepository,
    HaulageLoadsRepository,
    SalesforceSyncLogRepository,
} from '../repositories';
import { IDataResponse, PaginationList } from '../types/common';
import { EmailService } from './email.service';
import { StatusService } from './status.service';
import { WasteTradeNotificationsService } from './waste-trade-notifications.service';
import { ListingHelper } from '../helpers/listing.helper';
import { AuthHelper } from '../helpers/auth.helper';
import { SalesforceService } from './salesforce/salesforce.service';
import { SalesforceSyncService } from './salesforce/salesforce-sync.service';
import { SalesforceBindings } from '../keys/salesforce';
import { SalesforceLogger } from '../utils/salesforce/salesforce-sync.utils';

@injectable({ scope: BindingScope.TRANSIENT })
export class HaulageOfferService {
    constructor(
        @repository(HaulageOffersRepository)
        public haulageOffersRepository: HaulageOffersRepository,
        @repository(HaulageOfferDocumentsRepository)
        public haulageOfferDocumentsRepository: HaulageOfferDocumentsRepository,
        @repository(OffersRepository)
        public offersRepository: OffersRepository,
        @repository(CompaniesRepository)
        public companiesRepository: CompaniesRepository,
        @repository(UserRepository)
        public userRepository: UserRepository,
        @repository(CompanyLocationsRepository)
        public companyLocationsRepository: CompanyLocationsRepository,
        @repository(ListingsRepository)
        public listingsRepository: ListingsRepository,
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,
        @repository(HaulageLoadsRepository)
        public haulageLoadsRepository: HaulageLoadsRepository,
        @repository(SalesforceSyncLogRepository)
        public salesforceSyncLogRepository: SalesforceSyncLogRepository,
        @inject('services.EmailService')
        public emailService: EmailService,
        @inject('services.WasteTradeNotificationsService')
        public notificationService: WasteTradeNotificationsService,
        @inject('services.StatusService')
        public statusService: StatusService,
        @inject(SalesforceBindings.SERVICE, { optional: true })
        private salesforceService?: SalesforceService,
        @inject(SalesforceBindings.SYNC_SERVICE, { optional: true })
        private salesforceSyncService?: SalesforceSyncService,
    ) {}

    private validateInternalNotes(notes?: string): void {
        if (!notes) return;
        if (PHONE_BLOCK_REGEX.test(notes)) {
            throw new HttpErrors[422](messages.additionalNotesContainsPhone);
        }
        if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(notes) || EMAIL_BLOCK_REGEX.test(notes)) {
            throw new HttpErrors[422](messages.additionalNotesContainsEmail);
        }
        if (URL_BLOCK_REGEX.test(notes) || /(https?:\/\/[^\s]+)|([w]{3}\.[^\s]+\.[^\s]+)/i.test(notes)) {
            throw new HttpErrors[422](messages.additionalNotesContainsUrl);
        }
        if (notes.length > 32000) {
            throw new HttpErrors[422]('Notes is too long');
        }
    }

    /**
     * Sync haulage offer documents from Salesforce to WasteTrade DB
     */
    async syncHaulageOfferDocumentsFromSalesforce(haulageOfferId: number): Promise<void> {
        if (!this.salesforceService) {
            return;
        }

        const startTime = Date.now();
        let docsCreated = 0;
        let docsUpdated = 0;
        const errors: string[] = [];

        try {
            // Build external ID with environment prefix
            const envPrefix = process.env.ENVIRONMENT || 'DEV';
            const externalId = `${envPrefix}_${haulageOfferId}`;

            // Query documents from Salesforce
            const sfDocs = await this.salesforceService.queryHaulageOfferDocuments(externalId);
            if (!sfDocs || sfDocs.length === 0) {
                // Log successful sync with 0 documents
                await this.salesforceSyncLogRepository.create({
                    recordId: haulageOfferId.toString(),
                    objectType: 'HaulageOfferDocuments',
                    operation: 'UPSERT',
                    direction: 'INBOUND',
                    status: 'SUCCESS',
                    errorMessage: 'No documents found in Salesforce',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                return;
            }

            // Upsert documents to WasteTrade DB
            for (const doc of sfDocs) {
                try {
                    const downloadUrl = this.salesforceService.buildDocumentDownloadUrl(doc.Id);

                    // Check if document already exists
                    const existing = await this.haulageOfferDocumentsRepository.findOne({
                        where: { salesforceId: doc.Id },
                    });

                    if (existing) {
                        // Update existing document
                        await this.haulageOfferDocumentsRepository.updateById(existing.id, {
                            documentTitle: doc.Title,
                            documentUrl: downloadUrl,
                            updatedAt: new Date(),
                        });
                        docsUpdated++;
                    } else {
                        // Create new document
                        await this.haulageOfferDocumentsRepository.create({
                            haulageOfferId,
                            documentTitle: doc.Title,
                            documentUrl: downloadUrl,
                            salesforceId: doc.Id,
                        });
                        docsCreated++;
                    }
                } catch (docError) {
                    const errorMsg = docError instanceof Error ? docError.message : 'Unknown error';
                    errors.push(`Doc ${doc.Id}: ${errorMsg}`);
                }
            }

            // Log sync result
            const duration = Date.now() - startTime;
            await this.salesforceSyncLogRepository.create({
                recordId: haulageOfferId.toString(),
                objectType: 'HaulageOfferDocuments',
                operation: 'UPSERT',
                direction: 'INBOUND',
                status: errors.length === 0 ? 'SUCCESS' : 'FAILED',
                errorMessage:
                    errors.length > 0
                        ? `Created: ${docsCreated}, Updated: ${docsUpdated}, Errors: ${errors.join('; ')}`
                        : `Created: ${docsCreated}, Updated: ${docsUpdated}`,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } catch (error) {
            // Log failed sync only

            // Log failed sync
            await this.salesforceSyncLogRepository.create({
                recordId: haulageOfferId.toString(),
                objectType: 'HaulageOfferDocuments',
                operation: 'UPSERT',
                direction: 'INBOUND',
                status: 'FAILED',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }

    /**
     * Sync haulage load updates from Salesforce to WasteTrade DB
     * Pulls weight, collection date, and status updates from SF
     * Uses salesforceId from WT loads to query SF directly
     */
    async syncHaulageLoadsFromSalesforce(haulageOfferId: number, forceSync = false): Promise<void> {
        if (!this.salesforceService) {
            return;
        }

        try {
            // Get local loads that have salesforceId
            const localLoads = await this.haulageLoadsRepository.find({
                where: { haulageOfferId },
            });

            // Filter loads with salesforceId, get max 100 only
            const loadsWithSfId = localLoads.filter((l) => l.salesforceId);

            if (loadsWithSfId.length === 0 || loadsWithSfId?.length > 100) {
                return;
            }

            // Get SF IDs
            const sfIds = loadsWithSfId.map((l) => l.salesforceId).filter(Boolean) as string[];

            // Query SF loads by IDs
            const sfLoads = await this.salesforceService.queryHaulageLoadsByIds(sfIds);

            if (!sfLoads || sfLoads.length === 0) {
                return;
            }

            // Create map of SF loads by Id
            const sfLoadMap = new Map(sfLoads.map((l: any) => [l.Id, l]));

            let updatedCount = 0;
            for (const localLoad of loadsWithSfId) {
                if (!localLoad.salesforceId || !localLoad.id) continue;

                const sfLoad = sfLoadMap.get(localLoad.salesforceId);
                if (!sfLoad) {
                    continue;
                }

                // Build update data from SF fields
                const updateData: Record<string, unknown> = {};

                if (sfLoad.collection_date__c) {
                    updateData.collectionDate = new Date(sfLoad.collection_date__c);
                }
                if (sfLoad.gross_weight__c) {
                    updateData.grossWeight = sfLoad.gross_weight__c;
                }
                if (sfLoad.pallet_weight__c) {
                    updateData.palletWeight = sfLoad.pallet_weight__c;
                }
                if (sfLoad.load_status__c) {
                    updateData.loadStatus = sfLoad.load_status__c;
                }
                updateData.updatedAt = new Date();

                await this.haulageLoadsRepository.updateById(localLoad.id, updateData);
                updatedCount++;
            }
        } catch (error) {
            // Silent fail - errors logged elsewhere
        }
    }

    /**
     * Get approved hauliers in current user's company for team bidding
     */
    public async getCompanyHauliers(currentUser: MyUserProfile, search?: string): Promise<IDataResponse<unknown[]>> {
        const company = await this.companiesRepository.findById(currentUser.companyId);
        if (!company.isHaulier) {
            throw new HttpErrors.Forbidden('Only haulier companies can access this endpoint');
        }

        // Get approved company users
        const companyUsers = await this.companyUsersRepository.find({
            where: {
                companyId: currentUser.companyId,
                status: CompanyUserStatusEnum.ACTIVE,
            },
        });

        const userIds = companyUsers.map((cu) => cu.userId);
        if (userIds.length === 0) {
            return {
                status: 'success',
                message: 'No approved hauliers found',
                data: [],
            };
        }

        // Build search filter
        const where: any = { id: { inq: userIds } };
        if (search) {
            where.or = [
                { firstName: { ilike: `%${search}%` } },
                { lastName: { ilike: `%${search}%` } },
                { email: { ilike: `%${search}%` } },
                { username: { ilike: `%${search}%` } },
            ];
        }

        const users = await this.userRepository.find({
            where,
            fields: ['id', 'firstName', 'lastName', 'email', 'username'],
            order: ['firstName ASC', 'lastName ASC'],
        });

        return {
            status: 'success',
            message: 'Approved hauliers retrieved successfully',
            data: users,
        };
    }

    /**
     * Create a new haulage offer
     */
    public async createHaulageOffer(
        data: CreateHaulageOffer,
        currentUser: MyUserProfile,
    ): Promise<IDataResponse<HaulageOffers>> {
        // Verify the user is a haulier
        const company = await this.companiesRepository.findById(currentUser.companyId);
        if (!company.isHaulier) {
            throw new HttpErrors.Forbidden('Only hauliers can make haulage offers');
        }

        // Verify the haulier is approved
        if (company.status !== CompanyStatus.ACTIVE) {
            throw new HttpErrors.Forbidden(
                'Your account is being verified by an administrator. You will be unable to make an offer until approved.',
            );
        }

        // Verify the offer exists and get details
        const offer = await this.offersRepository.findById(data.offerId);
        if (!offer) {
            throw new HttpErrors.NotFound('Offer not found');
        }

        // Verify the offer status is accepted (seller has accepted the buyer's offer)
        if (offer.status !== OfferStatusEnum.ACCEPTED) {
            throw new HttpErrors.BadRequest('Haulage offers can only be made on accepted buyer offers');
        }

        // Check if suggested collection date is within buyer's delivery window
        const suggestedDate = new Date(data.suggestedCollectionDate);
        if (offer.earliestDeliveryDate && suggestedDate < new Date(offer.earliestDeliveryDate)) {
            throw new HttpErrors.BadRequest('Suggested collection date must be within the buyer delivery window');
        }
        if (offer.latestDeliveryDate && suggestedDate > new Date(offer.latestDeliveryDate)) {
            throw new HttpErrors.BadRequest('Suggested collection date must be within the buyer delivery window');
        }

        // Validate demurrage is at least 21 days
        if (data.demurrageAtDestination < 21) {
            throw new HttpErrors.BadRequest('Demurrage must be at least 21 days');
        }

        // Validate container type is in haulier's profile
        if (company.containerTypes && !company.containerTypes.includes(data.trailerContainerType)) {
            throw new HttpErrors.BadRequest('Selected container type is not associated with your haulier profile');
        }

        // Calculate customs fee based on currency
        let customsFee = 0;
        if (!data.completingCustomsClearance) {
            // Fixed fee of £200 or currency equivalent
            switch (data.currency) {
                case ECurrency.GBP:
                    customsFee = 200;
                    break;
                case ECurrency.EUR:
                    customsFee = 230; // Approximate conversion
                    break;
                case ECurrency.USD:
                    customsFee = 250; // Approximate conversion
                    break;
            }
        }

        // Determine quantity per load
        // Prefer value provided in request; treat 0 as missing and fallback to listing's weightPerLoad or materialWeightPerUnit
        const listing = await this.listingsRepository.findById(offer.listingId);
        const quantityPerLoad = data.quantityPerLoad || listing?.weightPerLoad || listing?.materialWeightPerUnit || 0;

        // Determine haulier user ID
        // Any company member can select an approved haulier from their company
        let haulierUserId = currentUser.id;
        if (data.haulierUserId) {
            // If selecting themselves, skip the check
            if (data.haulierUserId !== currentUser.id) {
                // Verify the selected user belongs to the same company and is approved
                const companyUser = await this.companyUsersRepository.findOne({
                    where: {
                        companyId: currentUser.companyId,
                        userId: data.haulierUserId,
                        status: CompanyUserStatusEnum.ACTIVE,
                    },
                });
                if (!companyUser) {
                    throw new HttpErrors.BadRequest('Selected haulier is not an approved member of your company');
                }
            }

            haulierUserId = data.haulierUserId;
        }

        // Calculate haulage total
        const haulageTotal = data.haulageCostPerLoad * offer.quantity + customsFee;

        // Create haulage offer
        const haulageOffer = await this.haulageOffersRepository.create({
            offerId: data.offerId,
            haulierCompanyId: currentUser.companyId,
            haulierUserId: haulierUserId,
            trailerContainerType: data.trailerContainerType,
            completingCustomsClearance: data.completingCustomsClearance,
            numberOfLoads: offer.quantity,
            quantityPerLoad: quantityPerLoad,
            haulageCostPerLoad: data.haulageCostPerLoad,
            currency: data.currency,
            customsFee: customsFee,
            haulageTotal: haulageTotal,
            transportProvider: data.transportProvider,
            suggestedCollectionDate: new Date(data.suggestedCollectionDate),
            expectedTransitTime: data.expectedTransitTime,
            demurrageAtDestination: data.demurrageAtDestination,
            notes: data.notes,
            status: HaulageOfferStatus.PENDING,
        });

        // Sync to Salesforce
        if (this.salesforceSyncService && haulageOffer.id) {
            this.salesforceSyncService.syncHaulageOffer(haulageOffer.id, true, false, 'createHaulageOffer').catch((syncError) => {
                SalesforceLogger.error('Sync failed after haulage offer creation', syncError, { entity: 'HaulageOffer', haulageOfferId: haulageOffer.id, action: 'create' });
            });
        }

        return {
            status: 'success',
            message: 'Haulage offer created successfully',
            data: haulageOffer,
        };
    }

    public async adminCreateHaulageOfferOnBehalf(
        data: {
            offerId: number;
            haulierCompanyId: number;
            haulierUserId: number;
            trailerContainerType: string;
            completingCustomsClearance?: boolean;
            haulageCostPerLoad: number;
            quantityPerLoad?: number;
            currency: ECurrency;
            transportProvider: string;
            suggestedCollectionDate: Date;
            expectedTransitTime: string;
            demurrageAtDestination: number;
            notes?: string;
        },
        currentUser: MyUserProfile,
    ): Promise<IDataResponse<HaulageOffers>> {
        AuthHelper.validateAdmin(currentUser.globalRole as UserRoleEnum);

        const [company, user] = await Promise.all([
            this.companiesRepository.findById(data.haulierCompanyId),
            this.userRepository.findById(data.haulierUserId),
        ]);

        if (!company?.isHaulier) {
            throw new HttpErrors.BadRequest('Selected company is not a haulier');
        }
        if (company.status !== CompanyStatus.ACTIVE) {
            throw new HttpErrors.BadRequest('Selected haulier is not approved');
        }

        const companyUser = await this.companyUsersRepository.findOne({
            where: { companyId: data.haulierCompanyId, userId: data.haulierUserId },
        });
        if (!companyUser) {
            throw new HttpErrors.BadRequest('Selected user does not belong to the haulier company');
        }

        const offer = await this.offersRepository.findById(data.offerId);
        if (!offer) {
            throw new HttpErrors.NotFound('Offer not found');
        }

        if (offer.status !== OfferStatusEnum.ACCEPTED) {
            throw new HttpErrors.BadRequest('Offer is not eligible for haulage offers');
        }

        const listing = await this.listingsRepository.findById(offer.listingId);

        const suggestedDate = new Date(data.suggestedCollectionDate);
        if (offer.earliestDeliveryDate && suggestedDate < new Date(offer.earliestDeliveryDate)) {
            throw new HttpErrors.BadRequest('Suggested collection date must be within the buyer delivery window');
        }
        if (offer.latestDeliveryDate && suggestedDate > new Date(offer.latestDeliveryDate)) {
            throw new HttpErrors.BadRequest('Suggested collection date must be within the buyer delivery window');
        }

        if (data.demurrageAtDestination < 21) {
            throw new HttpErrors.BadRequest('Demurrage must be at least 21 days');
        }

        if (company.containerTypes && !company.containerTypes.includes(data.trailerContainerType)) {
            throw new HttpErrors.BadRequest('Selected container type is not associated with the haulier profile');
        }

        const existingOffer = await this.haulageOffersRepository.findOne({
            where: { offerId: data.offerId, haulierCompanyId: data.haulierCompanyId },
        });
        if (existingOffer) {
            throw new HttpErrors.Conflict('Haulage offer already exists for this offer and haulier');
        }

        this.validateInternalNotes(data.notes);

        let customsFee = 0;
        if (!data.completingCustomsClearance) {
            switch (data.currency) {
                case ECurrency.GBP:
                    customsFee = 200;
                    break;
                case ECurrency.EUR:
                    customsFee = 230;
                    break;
                case ECurrency.USD:
                    customsFee = 250;
                    break;
            }
        }

        const quantityPerLoad = data.quantityPerLoad || listing?.weightPerLoad || listing?.materialWeightPerUnit || 0;
        const haulageTotal = data.haulageCostPerLoad * offer.quantity + customsFee;

        const haulageOffer = await this.haulageOffersRepository.create({
            offerId: data.offerId,
            haulierCompanyId: data.haulierCompanyId,
            haulierUserId: data.haulierUserId,
            trailerContainerType: data.trailerContainerType,
            completingCustomsClearance: data.completingCustomsClearance,
            numberOfLoads: offer.quantity,
            quantityPerLoad: quantityPerLoad,
            haulageCostPerLoad: data.haulageCostPerLoad,
            currency: data.currency,
            customsFee: customsFee,
            haulageTotal: haulageTotal,
            transportProvider: data.transportProvider as any,
            suggestedCollectionDate: new Date(data.suggestedCollectionDate),
            expectedTransitTime: data.expectedTransitTime as any,
            demurrageAtDestination: data.demurrageAtDestination,
            notes: data.notes,
            status: HaulageOfferStatus.PENDING,
        });

        // Sync to Salesforce
        if (this.salesforceSyncService && haulageOffer.id) {
            this.salesforceSyncService.syncHaulageOffer(haulageOffer.id, true, false, 'createHaulageOffer').catch((syncError) => {
                SalesforceLogger.error('Sync failed after haulage offer creation', syncError, { entity: 'HaulageOffer', haulageOfferId: haulageOffer.id, action: 'create' });
            });
        }

        return {
            status: 'success',
            message: 'Haulage offer created successfully',
            data: haulageOffer,
        };
    }

    public async getApprovedHauliersForAdmin(
        currentUser: MyUserProfile,
        filter?: { skip?: number; limit?: number; search?: string },
    ): Promise<IDataResponse<PaginationList<unknown>>> {
        AuthHelper.validateAdmin(currentUser.globalRole as UserRoleEnum);

        const skip = Number(get(filter, 'skip', 0));
        const limit = Number(get(filter, 'limit', 20));
        const search = String(get(filter, 'search', '') ?? '').trim();

        const whereConditions: string[] = [`cu.status = 'active'`, `c.is_haulier = true`, `c.status = $1`];
        const params: any[] = [CompanyStatus.ACTIVE];
        let paramIndex = 2;

        if (search) {
            whereConditions.push(`(
                u.id::text ILIKE $${paramIndex} OR
                u.email ILIKE $${paramIndex} OR
                u.username ILIKE $${paramIndex} OR
                u.first_name ILIKE $${paramIndex} OR
                u.last_name ILIKE $${paramIndex} OR
                CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramIndex} OR
                c.name ILIKE $${paramIndex}
            )`);
            params.push(`%${search}%`);
            paramIndex += 1;
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const countSql = `
            SELECT COUNT(*)::int AS "totalCount"
            FROM company_users cu
            INNER JOIN companies c ON cu.company_id = c.id
            INNER JOIN users u ON cu.user_id = u.id
            ${whereClause}
        `;

        const sql = `
            SELECT
                u.id as "userId",
                u.username as "username",
                u.first_name as "firstName",
                u.last_name as "lastName",
                u.email as "email",
                c.id as "companyId",
                c.name as "companyName",
                c.container_types as "containerTypes"
            FROM company_users cu
            INNER JOIN companies c ON cu.company_id = c.id
            INNER JOIN users u ON cu.user_id = u.id
            ${whereClause}
            ORDER BY u.last_name ASC NULLS LAST, u.first_name ASC NULLS LAST, u.id ASC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const [countResult, dataResult] = await Promise.all([
            this.companyUsersRepository.dataSource.execute(countSql, params),
            this.companyUsersRepository.dataSource.execute(sql, [...params, limit, skip]),
        ]);

        const totalCount = Number(countResult?.[0]?.totalCount ?? 0);
        const results = (dataResult ?? []).map((row: any) => ({
            userId: row.userId,
            username: row.username,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            companyId: row.companyId,
            companyName: row.companyName,
            containerTypes: row.containerTypes ?? [],
        }));

        return {
            status: 'success',
            message: 'Approved hauliers retrieved successfully',
            data: {
                results,
                totalCount,
            },
        };
    }

    /**
     * Get haulage offers for current haulier
     */
    public async getMyHaulageOffers(
        currentUser: MyUserProfile,
        filter?: any,
    ): Promise<IDataResponse<PaginationList<any>>> {
        const skip: number = get(filter, 'skip', 0);
        const limit: number = get(filter, 'limit', 10);

        // Build SQL query to get haulage offers with seller/buyer/material details
        const query = `
            SELECT 
                ho.*,
                o.id as "offer_id",
                o.quantity as "offer_quantity",
                o.earliest_delivery_date as "earliest_delivery_date",
                o.latest_delivery_date as "latest_delivery_date",
                o.offered_price_per_unit as "offered_price_per_unit",
                o.currency as "offer_currency",
                l.id as "listing_id",
                l.material_type as "material_type",
                l.material_item as "material_item",
                l.material_form as "material_form",
                l.material_grading as "material_grading",
                l.material_color as "material_color",
                l.material_finishing as "material_finishing",
                l.material_packing as "material_packing",
                l.material_weight_per_unit as "material_weight_per_unit",
                sc.id as "seller_company_id",
                sc.name as "seller_company_name",
                sc.country as "seller_company_country",
                bc.id as "buyer_company_id",
                bc.name as "buyer_company_name",
                bc.country as "buyer_company_country",
                sl.id as "seller_location_id",
                sl.address_line as "seller_address_line",
                sl.street as "seller_street",
                sl.city as "seller_city",
                sl.country as "seller_location_country",
                sl.postcode as "seller_postcode",
                sl.state_province as "seller_state_province",
                sl.container_type as "seller_container_type",
                bl.id as "buyer_location_id",
                bl.address_line as "buyer_address_line",
                bl.street as "buyer_street",
                bl.city as "buyer_city",
                bl.country as "buyer_location_country",
                bl.postcode as "buyer_postcode",
                bl.state_province as "buyer_state_province",
                bl.container_type as "buyer_container_type"
            FROM haulage_offers ho
            INNER JOIN offers o ON ho.offer_id = o.id
            INNER JOIN listings l ON o.listing_id = l.id
            LEFT JOIN companies sc ON o.seller_company_id = sc.id
            LEFT JOIN companies bc ON o.buyer_company_id = bc.id
            LEFT JOIN company_locations sl ON o.seller_location_id = sl.id
            LEFT JOIN company_locations bl ON o.buyer_location_id = bl.id
            WHERE ho.haulier_company_id = ${currentUser.companyId}
            ${filter?.where?.status ? `AND ho.status = '${filter.where.status}'` : ''}
            ORDER BY ho.created_at DESC
            LIMIT ${limit} OFFSET ${skip}
        `;

        const countQuery = `
            SELECT COUNT(*) as total
            FROM haulage_offers ho
            WHERE ho.haulier_company_id = ${currentUser.companyId}
            ${filter?.where?.status ? `AND ho.status = '${filter.where.status}'` : ''}
        `;

        const [results, countResult] = await Promise.all([
            this.haulageOffersRepository.execute(query),
            this.haulageOffersRepository.execute(countQuery),
        ]);

        const total = parseInt(countResult[0]?.total || '0', 10);

        // Format results - match Available Loads structure
        const formattedResults = results.map((row: any) => ({
            id: row.id,
            offerId: row.offer_id,
            listingId: row.listing_id,
            haulierCompanyId: row.haulier_company_id,
            haulierUserId: row.haulier_user_id,
            trailerContainerType: row.trailer_container_type,
            completingCustomsClearance: row.completing_customs_clearance,
            numberOfLoads: row.number_of_loads,
            quantityPerLoad: row.quantity_per_load || Number(row.material_weight_per_unit) || 0,
            haulageCostPerLoad: row.haulage_cost_per_load,
            currency: row.currency,
            customsFee: row.customs_fee,
            haulageTotal: row.haulage_total,
            transportProvider: row.transport_provider,
            suggestedCollectionDate: row.suggested_collection_date,
            expectedTransitTime: row.expected_transit_time,
            demurrageAtDestination: row.demurrage_at_destination,
            notes: row.notes,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            // Material details - match Available Loads
            materialType: row.material_type,
            materialItem: row.material_item,
            materialForm: row.material_form,
            materialGrading: row.material_grading,
            materialColor: row.material_color,
            materialFinishing: row.material_finishing,
            materialPacking: row.material_packing,
            materialName:
                row.material_type && row.material_item
                    ? `${row.material_type}-${row.material_item}`
                    : row.material_type || 'N/A',
            // Pickup location (seller location) - match Available Loads structure
            pickupLocation: row.seller_location_id
                ? {
                      id: row.seller_location_id,
                      addressLine: row.seller_address_line,
                      street: row.seller_street,
                      city: row.seller_city,
                      country: row.seller_location_country,
                      postcode: row.seller_postcode,
                      stateProvince: row.seller_state_province,
                      containerType: row.seller_container_type,
                  }
                : null,
            // Destination (buyer location) - match Available Loads structure
            destination: row.buyer_location_id
                ? {
                      id: row.buyer_location_id,
                      addressLine: row.buyer_address_line,
                      street: row.buyer_street,
                      city: row.buyer_city,
                      country: row.buyer_location_country,
                      postcode: row.buyer_postcode,
                      stateProvince: row.buyer_state_province,
                      containerType: row.buyer_container_type,
                  }
                : null,
            // Seller details (keep for backward compatibility)
            seller: {
                companyId: row.seller_company_id,
                companyName: row.seller_company_name,
                country: row.seller_company_country,
                location: row.seller_location_id
                    ? {
                          id: row.seller_location_id,
                          addressLine: row.seller_address_line,
                          street: row.seller_street,
                          city: row.seller_city,
                          country: row.seller_location_country,
                          postcode: row.seller_postcode,
                          stateProvince: row.seller_state_province,
                          containerType: row.seller_container_type,
                      }
                    : null,
            },
            // Buyer details (keep for backward compatibility)
            buyer: {
                companyId: row.buyer_company_id,
                companyName: row.buyer_company_name,
                country: row.buyer_company_country,
                location: row.buyer_location_id
                    ? {
                          id: row.buyer_location_id,
                          addressLine: row.buyer_address_line,
                          street: row.buyer_street,
                          city: row.buyer_city,
                          country: row.buyer_location_country,
                          postcode: row.buyer_postcode,
                          stateProvince: row.buyer_state_province,
                          containerType: row.buyer_container_type,
                      }
                    : null,
            },
            // Delivery window details
            earliestDeliveryDate: row.earliest_delivery_date,
            latestDeliveryDate: row.latest_delivery_date,
            numOfLoadBidOn: row.offer_quantity,
            desiredDeliveryWindow:
                row.earliest_delivery_date && row.latest_delivery_date
                    ? `${new Date(row.earliest_delivery_date).toLocaleDateString()} - ${new Date(row.latest_delivery_date).toLocaleDateString()}`
                    : null,
        }));

        return {
            status: 'success',
            message: 'Haulage offers retrieved successfully',
            data: {
                results: formattedResults,
                totalCount: total,
            },
        };
    }

    /**
     * Get haulage offer details
     */
    public async getHaulageOfferById(id: number, currentUser: MyUserProfile): Promise<IDataResponse<any>> {
        // Use SQL query to get all details in one go
        const query = `
            SELECT 
                ho.*,
                o.id as "offer_id",
                o.quantity as "offer_quantity",
                o.buyer_user_id as "buyer_user_id",
                o.seller_user_id as "seller_user_id",
                o.earliest_delivery_date as "earliest_delivery_date",
                o.latest_delivery_date as "latest_delivery_date",
                o.offered_price_per_unit as "offered_price_per_unit",
                o.currency as "offer_currency",
                o.total_price as "offer_total_price",
                o.incoterms as "offer_incoterms",
                l.id as "listing_id",
                l.title as "listing_title",
                l.material_type as "material_type",
                l.material_item as "material_item",
                l.material_form as "material_form",
                l.material_grading as "material_grading",
                l.material_color as "material_color",
                l.material_finishing as "material_finishing",
                l.material_packing as "material_packing",
                l.material_weight_per_unit as "material_weight_per_unit",
                l.weight_per_load as "weight_per_load",
                l.waste_storation as "waste_storation",
                sc.id as "seller_company_id",
                sc.name as "seller_company_name",
                sc.country as "seller_company_country",
                sc.address_line_1 as "seller_address_line_1",
                sc.city as "seller_city",
                sc.postal_code as "seller_postal_code",
                bc.id as "buyer_company_id",
                bc.name as "buyer_company_name",
                bc.country as "buyer_company_country",
                bc.address_line_1 as "buyer_address_line_1",
                bc.city as "buyer_city",
                bc.postal_code as "buyer_postal_code",
                sl.id as "seller_location_id",
                sl.address_line as "seller_address_line",
                sl.street as "seller_street",
                sl.city as "seller_location_city",
                sl.country as "seller_location_country",
                sl.postcode as "seller_postcode",
                sl.state_province as "seller_state_province",
                sl.container_type as "seller_container_type",
                sl.office_open_time as "seller_office_open_time",
                sl.office_close_time as "seller_office_close_time",
                sl.access_restrictions as "seller_access_restrictions",
                bl.id as "buyer_location_id",
                bl.address_line as "buyer_address_line",
                bl.street as "buyer_street",
                bl.city as "buyer_location_city",
                bl.country as "buyer_location_country",
                bl.postcode as "buyer_postcode",
                bl.state_province as "buyer_state_province",
                bl.container_type as "buyer_container_type",
                bl.office_open_time as "buyer_office_open_time",
                bl.office_close_time as "buyer_office_close_time",
                bl.access_restrictions as "buyer_access_restrictions",
                su.username as "seller_username",
                bu.username as "buyer_username"
            FROM haulage_offers ho
            INNER JOIN offers o ON ho.offer_id = o.id
            INNER JOIN listings l ON o.listing_id = l.id
            LEFT JOIN companies sc ON o.seller_company_id = sc.id
            LEFT JOIN companies bc ON o.buyer_company_id = bc.id
            LEFT JOIN company_locations sl ON o.seller_location_id = sl.id
            LEFT JOIN company_locations bl ON o.buyer_location_id = bl.id
            LEFT JOIN users su ON o.seller_user_id = su.id
            LEFT JOIN users bu ON o.buyer_user_id = bu.id
            WHERE ho.id = ${id}
        `;

        const results = await this.haulageOffersRepository.execute(query);

        if (!results || results.length === 0) {
            throw new HttpErrors.NotFound('Haulage offer not found');
        }

        const row = results[0];

        // Verify ownership
        if (row.haulier_company_id !== currentUser.companyId) {
            throw new HttpErrors.Forbidden('You can only view your own haulage offers');
        }

        // Format response
        const formattedData = {
            id: row.id,
            offerId: row.offer_id,
            haulierCompanyId: row.haulier_company_id,
            haulierUserId: row.haulier_user_id,
            trailerContainerType: row.trailer_container_type,
            completingCustomsClearance: row.completing_customs_clearance,
            numberOfLoads: row.number_of_loads,
            quantityPerLoad:
                row.quantity_per_load || Number(row.material_weight_per_unit) || Number(row.weight_per_load) || 0,
            haulageCostPerLoad: row.haulage_cost_per_load,
            currency: row.currency,
            customsFee: row.customs_fee,
            haulageTotal: row.haulage_total,
            transportProvider: row.transport_provider,
            suggestedCollectionDate: row.suggested_collection_date,
            expectedTransitTime: row.expected_transit_time,
            demurrageAtDestination: row.demurrage_at_destination,
            notes: row.notes,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            // Material details
            materialName:
                row.material_type && row.material_item
                    ? `${row.material_type}-${row.material_item}`
                    : row.material_type || 'N/A',
            material: {
                type: row.material_type,
                item: row.material_item,
                form: row.material_form,
                grading: row.material_grading,
                color: row.material_color,
                finishing: row.material_finishing,
                packing: row.material_packing,
                weightPerUnit: row.material_weight_per_unit,
                wasteStoration: row.waste_storation,
            },
            // Listing details
            listing: {
                id: row.listing_id,
                title: row.listing_title,
            },
            // Seller details (pickup location)
            seller: {
                userId: row.seller_user_id,
                username: row.seller_username,
                companyId: row.seller_company_id,
                companyName: row.seller_company_name,
                country: row.seller_company_country,
                addressLine1: row.seller_address_line_1,
                city: row.seller_city,
                postalCode: row.seller_postal_code,
                loadingTimes:
                    row.seller_location_id && (row.seller_office_open_time || row.seller_office_close_time)
                        ? {
                              openTime: row.seller_office_open_time,
                              closeTime: row.seller_office_close_time,
                          }
                        : null,
                siteRestrictions: row.seller_access_restrictions || null,
                averageWeightPerLoad: row.weight_per_load || null,
                location: row.seller_location_id
                    ? {
                          id: row.seller_location_id,
                          addressLine: row.seller_address_line,
                          street: row.seller_street,
                          city: row.seller_location_city,
                          country: row.seller_location_country,
                          postcode: row.seller_postcode,
                          stateProvince: row.seller_state_province,
                          containerType: row.seller_container_type,
                      }
                    : null,
            },
            // Buyer details (destination location)
            buyer: {
                userId: row.buyer_user_id,
                username: row.buyer_username,
                companyId: row.buyer_company_id,
                companyName: row.buyer_company_name,
                country: row.buyer_company_country,
                addressLine1: row.buyer_address_line_1,
                city: row.buyer_city,
                postalCode: row.buyer_postal_code,
                loadingTimes:
                    row.buyer_location_id && (row.buyer_office_open_time || row.buyer_office_close_time)
                        ? {
                              openTime: row.buyer_office_open_time,
                              closeTime: row.buyer_office_close_time,
                          }
                        : null,
                siteRestrictions: row.buyer_access_restrictions || null,
                location: row.buyer_location_id
                    ? {
                          id: row.buyer_location_id,
                          addressLine: row.buyer_address_line,
                          street: row.buyer_street,
                          city: row.buyer_location_city,
                          country: row.buyer_location_country,
                          postcode: row.buyer_postcode,
                          stateProvince: row.buyer_state_province,
                          containerType: row.buyer_container_type,
                      }
                    : null,
            },
            // Offer details
            offer: {
                id: row.offer_id,
                quantity: row.offer_quantity,
                earliestDeliveryDate: row.earliest_delivery_date,
                latestDeliveryDate: row.latest_delivery_date,
                offeredPricePerUnit: row.offered_price_per_unit,
                currency: row.offer_currency,
                totalPrice: row.offer_total_price,
                incoterms: row.offer_incoterms,
            },
            // Calculated fields
            numOfLoadBidOn: row.offer_quantity,
            desiredDeliveryWindow:
                row.earliest_delivery_date && row.latest_delivery_date
                    ? `${new Date(row.earliest_delivery_date).toLocaleDateString()} - ${new Date(row.latest_delivery_date).toLocaleDateString()}`
                    : null,
        };

        return {
            status: 'success',
            message: 'Haulage offer retrieved successfully',
            data: formattedData,
        };
    }

    /**
     * Update haulage offer (restricted once approved/accepted)
     */
    public async updateHaulageOffer(
        id: number,
        data: UpdateHaulageOffer,
        currentUser: MyUserProfile,
    ): Promise<IDataResponse<HaulageOffers>> {
        const haulageOffer = await this.haulageOffersRepository.findById(id);

        // Verify ownership
        if (haulageOffer.haulierCompanyId !== currentUser.companyId) {
            throw new HttpErrors.Forbidden('You can only update your own haulage offers');
        }

        // Cannot update if approved or accepted (final states)
        if (
            haulageOffer.status === HaulageOfferStatus.APPROVED ||
            haulageOffer.status === HaulageOfferStatus.ACCEPTED
        ) {
            throw new HttpErrors.BadRequest('Cannot update haulage offers that have been approved or accepted');
        }

        // Validate demurrage if provided
        if (data.demurrageAtDestination !== undefined && data.demurrageAtDestination < 21) {
            throw new HttpErrors.BadRequest('Demurrage must be at least 21 days');
        }

        // Recalculate totals if relevant fields changed
        let customsFee = haulageOffer.customsFee;
        let haulageTotal = haulageOffer.haulageTotal;

        if (data.completingCustomsClearance !== undefined || data.currency !== undefined) {
            const currency = data.currency ?? haulageOffer.currency;
            const completingCustoms = data.completingCustomsClearance ?? haulageOffer.completingCustomsClearance;

            customsFee = 0;
            if (!completingCustoms) {
                switch (currency) {
                    case ECurrency.GBP:
                        customsFee = 200;
                        break;
                    case ECurrency.EUR:
                        customsFee = 230;
                        break;
                    case ECurrency.USD:
                        customsFee = 250;
                        break;
                }
            }
        }

        if (data.haulageCostPerLoad !== undefined || customsFee !== haulageOffer.customsFee) {
            const costPerLoad = data.haulageCostPerLoad ?? haulageOffer.haulageCostPerLoad;
            haulageTotal = costPerLoad * haulageOffer.numberOfLoads + customsFee;
        }

        // If status is withdrawn, reset to pending when user edits
        const newStatus = haulageOffer.status === HaulageOfferStatus.WITHDRAWN ? HaulageOfferStatus.PENDING : undefined;

        // Update the offer
        await this.haulageOffersRepository.updateById(id, {
            ...data,
            customsFee,
            haulageTotal,
            ...(newStatus && { status: newStatus }),
            suggestedCollectionDate: data.suggestedCollectionDate ? new Date(data.suggestedCollectionDate) : undefined,
            updatedAt: new Date(),
        });

        const updatedOffer = await this.haulageOffersRepository.findById(id);

        // Sync to Salesforce
        if (this.salesforceSyncService && updatedOffer.id) {
            this.salesforceSyncService.syncHaulageOffer(updatedOffer.id, true, false, 'updateHaulageOffer').catch((syncError) => {
                SalesforceLogger.error('Sync failed after haulage offer update', syncError, { entity: 'HaulageOffer', haulageOfferId: updatedOffer.id, action: 'update' });
            });
        }

        return {
            status: 'success',
            message: 'Haulage offer updated successfully',
            data: updatedOffer,
        };
    }

    /**
     * Withdraw haulage offer
     */
    public async withdrawHaulageOffer(id: number, currentUser: MyUserProfile): Promise<IDataResponse<HaulageOffers>> {
        const haulageOffer = await this.haulageOffersRepository.findById(id);

        // Verify ownership
        if (haulageOffer.haulierCompanyId !== currentUser.companyId) {
            throw new HttpErrors.Forbidden('You can only withdraw your own haulage offers');
        }

        // Can only withdraw if not accepted
        if (haulageOffer.status === HaulageOfferStatus.ACCEPTED) {
            throw new HttpErrors.BadRequest(
                'Cannot withdraw an offer that has already been accepted. Please contact support@wastetrade.com',
            );
        }

        // Update status to withdrawn
        await this.haulageOffersRepository.updateById(id, {
            status: HaulageOfferStatus.WITHDRAWN,
            updatedAt: new Date(),
        });

        const updatedOffer = await this.haulageOffersRepository.findById(id);

        // Sync to Salesforce
        if (this.salesforceSyncService && updatedOffer.id) {
            this.salesforceSyncService.syncHaulageOffer(updatedOffer.id, true, false, 'withdrawOffer').catch((syncError) => {
                SalesforceLogger.error('Sync failed after haulage offer withdrawal', syncError, { entity: 'HaulageOffer', haulageOfferId: updatedOffer.id, action: 'withdraw' });
            });
        }

        return {
            status: 'success',
            message: 'Haulage offer withdrawn successfully',
            data: updatedOffer,
        };
    }

    public async getAvailableLoads(
        currentUser: MyUserProfile,
        params?: {
            skip?: number;
            limit?: number;
            textSearch?: string;
            materialType?: string;
            materialItem?: string;
            materialPacking?: string;
            pickupCountry?: string;
            destinationCountry?: string;
            deliveryDateFrom?: string;
            deliveryDateTo?: string;
        },
    ): Promise<PaginationList<unknown>> {
        // Verify the user is a haulier
        const company = await this.companiesRepository.findById(currentUser.companyId);
        if (!company.isHaulier) {
            throw new HttpErrors.Forbidden(messages.forbidden);
        }

        // Extract parameters with defaults
        const skip: number = params?.skip ?? 0;
        const limit: number = params?.limit ?? 10;
        const textSearch = params?.textSearch?.toLowerCase() ?? null;
        const materialType = params?.materialType?.toLowerCase() ?? null;
        const materialItem = params?.materialItem?.toLowerCase() ?? null;
        const materialPacking = params?.materialPacking?.toLowerCase() ?? null;
        const pickupCountry = params?.pickupCountry?.toLowerCase() ?? null;
        const destinationCountry = params?.destinationCountry?.toLowerCase() ?? null;
        const deliveryDateFrom = params?.deliveryDateFrom ?? null;
        const deliveryDateTo = params?.deliveryDateTo ?? null;

        // Build WHERE conditions - base conditions for available loads
        const conditions: string[] = [
            `o.status = '${OfferStatusEnum.ACCEPTED}'`,
            "l.listing_type = 'sell'",
            // "l.state = 'approved'",
            // "l.status = 'available'",
        ];

        // Search filter (free text search)
        if (textSearch) {
            const searchTerm = textSearch.trim().toLowerCase();

            // Add ISO code search if country names matched
            const isoCodesList = [`'${searchTerm}'`];
            for (const country of COUNTRIES_LIST) {
                // Check if country name matches the search term
                if (country.name.toLowerCase().includes(searchTerm)) {
                    isoCodesList.push(`'${country?.isoCode?.toLowerCase()}'`);
                }
            }
            const countrySearchConditions = `
                LOWER(pickup_loc.country) IN (${isoCodesList?.join(',')}) OR
                LOWER(dest_loc.country) IN (${isoCodesList?.join(',')})`;

            conditions.push(`(
                LOWER(l.material_item) LIKE '%${searchTerm}%' OR
                LOWER(l.material_type) LIKE '%${searchTerm}%' OR
                LOWER(l.material_form) LIKE '%${searchTerm}%' OR
                LOWER(l.material_grading) LIKE '%${searchTerm}%' OR
                LOWER(l.material_color) LIKE '%${searchTerm}%' OR
                LOWER(l.material_finishing) LIKE '%${searchTerm}%' OR
                LOWER(l.material_packing) LIKE '%${searchTerm}%' OR
                LOWER(pickup_loc.address_line) LIKE '%${searchTerm}%' OR
                LOWER(pickup_loc.street) LIKE '%${searchTerm}%' OR
                LOWER(pickup_loc.postcode) LIKE '%${searchTerm}%' OR
                LOWER(pickup_loc.city) LIKE '%${searchTerm}%' OR
                ${countrySearchConditions} OR
                LOWER(pickup_loc.state_province) LIKE '%${searchTerm}%' OR
                LOWER(pickup_loc.container_type::text) LIKE '%${searchTerm}%' OR
                LOWER(dest_loc.address_line) LIKE '%${searchTerm}%' OR
                LOWER(dest_loc.street) LIKE '%${searchTerm}%' OR
                LOWER(dest_loc.postcode) LIKE '%${searchTerm}%' OR
                LOWER(dest_loc.city) LIKE '%${searchTerm}%' OR
                LOWER(dest_loc.state_province) LIKE '%${searchTerm}%' OR
                LOWER(dest_loc.container_type::text) LIKE '%${searchTerm}%'
            )`);
        }

        // Material type filter
        if (materialType) {
            const materialTypes = materialType.split(',');
            conditions.push(`l.material_type IN (${materialTypes.map((type) => `'${type.trim()}'`).join(',')})`);
        }

        // Material item filter (depends on material type)
        if (materialItem) {
            conditions.push(`l.material_item = '${materialItem.trim()}'`);
        }

        // Packaging filter
        if (materialPacking) {
            conditions.push(`l.material_packing = '${materialPacking.trim()}'`);
        }

        // Pickup location filter
        if (pickupCountry) {
            const country = pickupCountry.trim().toUpperCase();
            if (country === 'UK') {
                conditions.push(`pickup_loc.country = '${UK_ISO_CODE}'`);
            } else if (country === 'EU') {
                const euCodes = EU_ISO_CODES.map((code) => `'${code}'`).join(',');
                conditions.push(`pickup_loc.country IN (${euCodes})`);
            } else {
                const restCodes = REST_ISO_CODES.map((code) => `'${code}'`).join(',');
                conditions.push(`pickup_loc.country IN (${restCodes})`);
            }
        }

        // Destination filter
        if (destinationCountry) {
            const country = destinationCountry.trim().toUpperCase();
            if (country === 'UK') {
                conditions.push(`dest_loc.country = '${UK_ISO_CODE}'`);
            } else if (country === 'EU') {
                const euCodes = EU_ISO_CODES.map((code) => `'${code}'`).join(',');
                conditions.push(`dest_loc.country IN (${euCodes})`);
            } else {
                const restCodes = REST_ISO_CODES.map((code) => `'${code}'`).join(',');
                conditions.push(`dest_loc.country IN (${restCodes})`);
            }
        }

        // Delivery window filter (date range picker)
        if (deliveryDateFrom) {
            conditions.push(`o.latest_delivery_date >= '${deliveryDateFrom}'`);
        }
        if (deliveryDateTo) {
            conditions.push(`o.earliest_delivery_date <= '${deliveryDateTo}'`);
        }

        const whereClause = `WHERE ${conditions.join(' AND ')}`;

        // Count query
        const countQuery = `
            SELECT COUNT(DISTINCT o.id) as total
            FROM offers o
            INNER JOIN listings l ON o.listing_id = l.id
            LEFT JOIN company_locations pickup_loc ON o.seller_location_id = pickup_loc.id
            LEFT JOIN company_locations dest_loc ON o.buyer_location_id = dest_loc.id
            ${whereClause}
        `;

        const countResult = await this.offersRepository.execute(countQuery);
        const total = parseInt(countResult[0]?.total || '0', 10);

        // Main query - only select fields needed for response
        const query = `
            SELECT
                o.id as "offerId",
                o.listing_id as "listingId",
                o.quantity as "numberOfLoads",
                o.earliest_delivery_date as "earliestDeliveryDate",
                o.latest_delivery_date as "latestDeliveryDate",
                o.expires_at as "expiresAt",
                l.material_item as "materialItem",
                l.material_type as "materialType",
                l.material_form as "materialForm",
                l.material_grading as "materialGrading",
                l.material_color as "materialColor",
                l.material_finishing as "materialFinishing",
                l.material_packing as "materialPacking",
                l.material_weight_per_unit as "quantityPerLoad",
                pickup_loc.id as "pickupLocationId",
                pickup_loc.address_line as "pickupAddressLine",
                pickup_loc.street as "pickupStreet",
                pickup_loc.postcode as "pickupPostcode",
                pickup_loc.city as "pickupCity",
                pickup_loc.country as "pickupCountry",
                pickup_loc.state_province as "pickupStateProvince",
                pickup_loc.container_type as "pickupContainerType",
                dest_loc.id as "destinationLocationId",
                dest_loc.address_line as "destinationAddressLine",
                dest_loc.street as "destinationStreet",
                dest_loc.postcode as "destinationPostcode",
                dest_loc.city as "destinationCity",
                dest_loc.country as "destinationCountry",
                dest_loc.state_province as "destinationStateProvince",
                dest_loc.container_type as "destinationContainerType"
            FROM offers o
            INNER JOIN listings l ON o.listing_id = l.id
            LEFT JOIN company_locations pickup_loc ON o.seller_location_id = pickup_loc.id
            LEFT JOIN company_locations dest_loc ON o.buyer_location_id = dest_loc.id
            ${whereClause}
            ORDER BY o.created_at DESC
            LIMIT ${limit} OFFSET ${skip}
        `;

        const results = await this.offersRepository.execute(query);

        // Format results - only return fields needed for table display per AC
        const formattedResults = results.map((row: any) => ({
            offerId: row.offerId,
            listingId: row.listingId,
            materialType: row.materialType,
            materialItem: row.materialItem,
            materialForm: row.materialForm,
            materialGrading: row.materialGrading,
            materialColor: row.materialColor,
            materialFinishing: row.materialFinishing,
            materialPacking: row.materialPacking,
            pickupLocation: {
                id: row.pickupLocationId,
                addressLine: row.pickupAddressLine,
                street: row.pickupStreet,
                postcode: row.pickupPostcode,
                city: row.pickupCity,
                country: row.pickupCountry,
                stateProvince: row.pickupStateProvince,
                containerType: row.pickupContainerType,
            },
            destination: {
                id: row.destinationLocationId,
                addressLine: row.destinationAddressLine,
                street: row.destinationStreet,
                postcode: row.destinationPostcode,
                city: row.destinationCity,
                country: row.destinationCountry,
                stateProvince: row.destinationStateProvince,
                containerType: row.destinationContainerType,
            },
            numberOfLoads: Number(row.numberOfLoads) || 0,
            quantityPerLoad: Number(row.quantityPerLoad) || 0,
            earliestDeliveryDate: row.earliestDeliveryDate,
            latestDeliveryDate: row.latestDeliveryDate,
            expiresAt: row.expiresAt,
        }));

        return {
            results: formattedResults,
            totalCount: total,
        };
    }

    /**
     * Handle haulage bid approval actions
     * Task: BE - 6.4.1.15. Haulier Bid Approval Actions
     */
    public async handleBidAction(
        id: number,
        actionRequest: HaulageBidActionRequest,
        currentUser: MyUserProfile,
    ): Promise<IDataResponse<HaulageOffers>> {
        // Get the haulage offer
        const haulageOffer = await this.haulageOffersRepository.findById(id);
        if (!haulageOffer) {
            throw new HttpErrors.NotFound('Haulage offer not found');
        }

        // Get the related offer and listing for context
        const offer = await this.offersRepository.findById(haulageOffer.offerId);
        if (!offer) {
            throw new HttpErrors.NotFound('Related offer not found');
        }

        const listing = await this.listingsRepository.findById(offer.listingId);
        if (!listing) {
            throw new HttpErrors.NotFound('Related listing not found');
        }

        // Verify that the current user has admin authority to take action on this offer
        AuthHelper.validateAdmin(currentUser.globalRole as UserRoleEnum);

        // Verify the haulage offer is in a valid state for actions
        if (
            haulageOffer.status !== HaulageOfferStatus.PENDING &&
            haulageOffer.status !== HaulageOfferStatus.INFORMATION_REQUESTED
        ) {
            throw new HttpErrors.BadRequest(
                `Cannot perform action on haulage offer with status: ${haulageOffer.status}`,
            );
        }

        // Get the haulier user for email notifications
        const haulierUser = await this.userRepository.findById(haulageOffer.haulierUserId);
        if (!haulierUser) {
            throw new HttpErrors.NotFound('Haulier user not found');
        }

        // Get the seller user for notifications (when bids are approved)
        const [sellerUser, sellerLocation, buyerLocation] = await Promise.all([
            this.userRepository.findById(listing.createdByUserId),
            this.companyLocationsRepository.findById(offer.sellerLocationId),
            this.companyLocationsRepository.findById(offer.buyerLocationId),
        ]);
        const pickupLocation = sellerLocation
            ? {
                  id: sellerLocation.id,
                  addressLine: sellerLocation.addressLine,
                  street: sellerLocation.street,
                  postcode: sellerLocation.postcode,
                  city: sellerLocation.city,
                  country: sellerLocation.country,
              }
            : null;
        const destinationLocation = buyerLocation
            ? {
                  id: buyerLocation.id,
                  addressLine: buyerLocation.addressLine,
                  street: buyerLocation.street,
                  postcode: buyerLocation.postcode,
                  city: buyerLocation.city,
                  country: buyerLocation.country,
              }
            : null;

        let newStatus: HaulageOfferStatus;
        let rejectionReason: string = '';

        switch (actionRequest.action) {
            case HaulageBidAction.APPROVE:
                newStatus = HaulageOfferStatus.ACCEPTED;

                await Promise.all([
                    this.emailService.sendHaulageOfferApprovedEmail(haulierUser, pickupLocation, destinationLocation),
                    this.notificationService.createNotification(
                        haulierUser.id ?? 0,
                        NotificationType.HAULAGE_OFFER_APPROVED,
                        {
                            haulageOfferId: haulageOffer.id,
                            offerId: offer.id,
                            listingId: listing.id,
                            listingType: listing.listingType,
                            listingTitle: ListingHelper.getListingTitle(listing),
                            pickupLocation: pickupLocation,
                            destinationLocation: destinationLocation,
                        },
                    ),
                    this.emailService.sendOfferApprovedEmail(sellerUser, ListingHelper.getListingTitle(listing)),
                    this.notificationService.createNotification(sellerUser.id ?? 0, NotificationType.OFFER_APPROVED, {
                        haulageOfferId: haulageOffer.id,
                        offerId: offer.id,
                        listingId: listing.id,
                        listingType: listing.listingType,
                        listingTitle: ListingHelper.getListingTitle(listing),
                    }),
                ]);

                // Generate loads after approval
                await this.generateLoadsForHaulageOffer(haulageOffer.id);

                break;

            case HaulageBidAction.REJECT:
                newStatus = HaulageOfferStatus.REJECTED;
                rejectionReason =
                    actionRequest.customRejectionReason ?? this.getRejectionReasonText(actionRequest.rejectionReason);

                await Promise.all([
                    this.emailService.sendHaulageOfferRejectedEmail(
                        haulierUser,
                        pickupLocation,
                        destinationLocation,
                        rejectionReason,
                    ),
                    this.notificationService.createNotification(
                        haulierUser.id ?? 0,
                        NotificationType.HAULAGE_OFFER_REJECTED,
                        {
                            haulageOfferId: haulageOffer.id,
                            offerId: offer.id,
                            listingId: listing.id,
                            listingType: listing.listingType,
                            listingTitle: ListingHelper.getListingTitle(listing),
                            pickupLocation: pickupLocation,
                            destinationLocation: destinationLocation,
                            rejectionReason: rejectionReason,
                        },
                    ),
                ]);

                break;

            case HaulageBidAction.REQUEST_INFORMATION:
                newStatus = HaulageOfferStatus.INFORMATION_REQUESTED;
                if (!actionRequest.message) {
                    throw new HttpErrors.BadRequest('Message is required when requesting more information');
                }

                await Promise.all([
                    this.emailService.sendHaulageOfferRequestInformationEmail(
                        haulierUser,
                        pickupLocation,
                        destinationLocation,
                        actionRequest.message,
                    ),
                    this.notificationService.createNotification(
                        haulierUser.id ?? 0,
                        NotificationType.HAULAGE_OFFER_REQUEST_INFORMATION,
                        {
                            haulageOfferId: haulageOffer.id,
                            offerId: offer.id,
                            listingId: listing.id,
                            listingType: listing.listingType,
                            listingTitle: ListingHelper.getListingTitle(listing),
                            pickupLocation: pickupLocation,
                            destinationLocation: destinationLocation,
                            message: actionRequest.message,
                        },
                    ),
                ]);

                break;

            default:
                throw new HttpErrors.BadRequest(`Invalid action: ${actionRequest.action}`);
        }

        // Build update data with status and optional rejection fields
        const updateData: Partial<HaulageOffers> = {
            status: newStatus,
            updatedAt: new Date(), // Ensure sync picks up the change
        };

        // Save rejection reason and custom reason if action is reject
        if (actionRequest.action === HaulageBidAction.REJECT) {
            updateData.rejectionReason = actionRequest.rejectionReason;
            updateData.customRejectionReason = actionRequest.customRejectionReason;
        }

        // Save admin message if action is request_information
        if (actionRequest.action === HaulageBidAction.REQUEST_INFORMATION && actionRequest.message) {
            updateData.adminMessage = actionRequest.message;
        }

        // Update the haulage offer
        await this.haulageOffersRepository.updateById(id, updateData);

        // Get the updated haulage offer
        const updatedHaulageOffer = await this.haulageOffersRepository.findById(id);

        // Sync to Salesforce
        if (this.salesforceSyncService && updatedHaulageOffer.id) {
            this.salesforceSyncService.syncHaulageOffer(updatedHaulageOffer.id, true, false, 'bidAction').catch((syncError) => {
                SalesforceLogger.error('Sync failed after haulage bid action', syncError, { entity: 'HaulageOffer', haulageOfferId: updatedHaulageOffer.id, action: 'bid_action' });
            });
        }

        return {
            status: 'success',
            message: `Haulage bid ${actionRequest.action} completed successfully`,
            data: updatedHaulageOffer,
        };
    }

    /**
     * Helper method to get user-friendly rejection reason text
     */
    private getRejectionReasonText(reason?: HaulageBidRejectionReason): string {
        switch (reason) {
            case HaulageBidRejectionReason.INCOMPLETE_DOCUMENTATION:
                return 'Incomplete documentation';
            case HaulageBidRejectionReason.INVALID_COMPANY_REGISTRATION:
                return 'Invalid company registration';
            case HaulageBidRejectionReason.DUPLICATE_ACCOUNT:
                return 'Duplicate account';
            case HaulageBidRejectionReason.UNVERIFIED_CONTACT_INFO:
                return 'Unverified contact information';
            case HaulageBidRejectionReason.OTHER:
                return 'Other reason';
            default:
                return 'Bid does not meet current requirements';
        }
    }

    /**
     * Helper method to format full address from location parts
     */
    private formatFullAddress(
        addressLine?: string,
        city?: string,
        state?: string,
        country?: string,
        postalCode?: string,
    ): string {
        const parts = [addressLine, city, state, postalCode, country].filter((part) => part && part.trim() !== '');
        return parts.join(', ') || '';
    }

    /**
     * Admin: Get all haulage bids for admin dashboard
     * Task: 6.4.1.12. View Haulage Bids
     */
    public async getHaulageBidsForAdmin(
        currentUser: MyUserProfile,
        filters: {
            skip?: number;
            limit?: number;
            status?: string;
            haulierUserIds?: number[];
            state?: string;
            materialType?: string;
            textSearch?: string;
            haulierCompany?: string;
            buyerCompany?: string;
            sellerCompany?: string;
            dateFrom?: string;
            dateTo?: string;
            offerId?: number;
        },
    ): Promise<IDataResponse<PaginationList<unknown>>> {
        // Extract filter values with defaults
        const skip: number = get(filters, 'skip', 0);
        const limit: number = get(filters, 'limit', 20);
        const status = filters.status;
        const state = filters.state;
        const materialType = filters.materialType;
        const textSearch = filters.textSearch;
        const haulierCompany = filters.haulierCompany;
        const buyerCompany = filters.buyerCompany;
        const sellerCompany = filters.sellerCompany;
        const dateFrom = filters.dateFrom;
        const dateTo = filters.dateTo;
        const offerId = filters.offerId;

        // Build where conditions
        const whereConditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        // Filter by offer ID if provided
        if (offerId) {
            whereConditions.push(`ho.offer_id = $${paramIndex++}`);
            params.push(offerId);
        }

        // Always include status filter
        if (status) {
            whereConditions.push(`ho.status = $${paramIndex++}`);
            params.push(status);
        }

        // Filter by haulier user IDs (for Unverified/Verified tabs)
        if (filters.haulierUserIds && filters.haulierUserIds.length > 0) {
            whereConditions.push(`ho.haulier_user_id = ANY($${paramIndex++}::int[])`);
            params.push(filters.haulierUserIds);
        } else if (filters.haulierUserIds && filters.haulierUserIds.length === 0) {
            // No matching users — return empty result immediately
            whereConditions.push('FALSE');
        }

        if (state) {
            whereConditions.push(`o.state = $${paramIndex++}`);
            params.push(state);
        }

        if (materialType) {
            whereConditions.push(`l.material_type = $${paramIndex++}`);
            params.push(materialType);
        }

        if (textSearch) {
            const tokens = textSearch
                .split(/\s+/)
                .map((t) => t.trim())
                .filter((t) => t !== '');

            const tokenGroups = tokens.map(() => {
                const placeholder = `$${paramIndex++}`;
                return `(
                    l.material_item ILIKE ${placeholder} OR
                    l.material_type ILIKE ${placeholder} OR
                    l.material_form ILIKE ${placeholder} OR
                    l.material_grading ILIKE ${placeholder} OR
                    l.material_color ILIKE ${placeholder} OR
                    l.material_finishing ILIKE ${placeholder} OR
                    l.material_packing ILIKE ${placeholder} OR
                    CONCAT_WS(' ', l.material_type, l.material_item, l.material_form, l.material_grading, l.material_color, l.material_finishing, l.material_packing) ILIKE ${placeholder} OR
                    hc.name ILIKE ${placeholder} OR
                    buyer_c.name ILIKE ${placeholder} OR
                    seller_c.name ILIKE ${placeholder} OR
                    haulier_u.id::text ILIKE ${placeholder} OR
                    haulier_u.email ILIKE ${placeholder} OR
                    haulier_u.first_name ILIKE ${placeholder} OR
                    haulier_u.last_name ILIKE ${placeholder} OR
                    CONCAT(haulier_u.first_name, ' ', haulier_u.last_name) ILIKE ${placeholder} OR
                    buyer_u.id::text ILIKE ${placeholder} OR
                    buyer_u.email ILIKE ${placeholder} OR
                    buyer_u.first_name ILIKE ${placeholder} OR
                    buyer_u.last_name ILIKE ${placeholder} OR
                    CONCAT(buyer_u.first_name, ' ', buyer_u.last_name) ILIKE ${placeholder} OR
                    seller_u.id::text ILIKE ${placeholder} OR
                    seller_u.email ILIKE ${placeholder} OR
                    seller_u.first_name ILIKE ${placeholder} OR
                    seller_u.last_name ILIKE ${placeholder} OR
                    CONCAT(seller_u.first_name, ' ', seller_u.last_name) ILIKE ${placeholder} OR
                    pickup_loc.country ILIKE ${placeholder} OR
                    dest_loc.country ILIKE ${placeholder}
                )`;
            });

            if (tokenGroups.length > 0) {
                whereConditions.push(`(${tokenGroups.join(' AND ')})`);
                for (const token of tokens) {
                    params.push(`%${token}%`);
                }
            }
        }

        if (haulierCompany) {
            whereConditions.push(`hc.name ILIKE $${paramIndex++}`);
            params.push(`%${haulierCompany}%`);
        }

        if (buyerCompany) {
            whereConditions.push(`buyer_c.name ILIKE $${paramIndex++}`);
            params.push(`%${buyerCompany}%`);
        }

        if (sellerCompany) {
            whereConditions.push(`seller_c.name ILIKE $${paramIndex++}`);
            params.push(`%${sellerCompany}%`);
        }

        if (dateFrom && dateTo) {
            const start = new Date(dateFrom);
            const endExclusive = new Date(dateTo);
            endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

            whereConditions.push(`(
                (ho.created_at >= $${paramIndex} AND ho.created_at < $${paramIndex + 1}) OR
                (o.earliest_delivery_date < $${paramIndex + 1} AND o.latest_delivery_date >= $${paramIndex})
            )`);
            params.push(start.toISOString(), endExclusive.toISOString());
            paramIndex += 2;
        } else if (dateFrom) {
            const start = new Date(dateFrom);

            whereConditions.push(`(
                ho.created_at >= $${paramIndex} OR
                o.latest_delivery_date >= $${paramIndex}
            )`);
            params.push(start.toISOString());
            paramIndex += 1;
        } else if (dateTo) {
            const endExclusive = new Date(dateTo);
            endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

            whereConditions.push(`(
                ho.created_at < $${paramIndex} OR
                o.earliest_delivery_date < $${paramIndex}
            )`);
            params.push(endExclusive.toISOString());
            paramIndex += 1;
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const countQuery = `
            SELECT COUNT(*) as total
            FROM haulage_offers ho
            INNER JOIN offers o ON ho.offer_id = o.id
            INNER JOIN listings l ON o.listing_id = l.id
            LEFT JOIN companies hc ON ho.haulier_company_id = hc.id
            LEFT JOIN companies buyer_c ON o.buyer_company_id = buyer_c.id
            LEFT JOIN companies seller_c ON l.company_id = seller_c.id
            LEFT JOIN users haulier_u ON ho.haulier_user_id = haulier_u.id
            LEFT JOIN users buyer_u ON o.buyer_user_id = buyer_u.id
            LEFT JOIN users seller_u ON l.created_by_user_id = seller_u.id
            LEFT JOIN company_locations pickup_loc ON l.location_id = pickup_loc.id
            LEFT JOIN company_locations dest_loc ON o.buyer_location_id = dest_loc.id
            LEFT JOIN users aa ON (ho.assign_admin->>'assignedAdminId')::int = aa.id
            ${whereClause}
        `;

        const countResult = await this.haulageOffersRepository.execute(countQuery, params);
        const total = Number(countResult[0]?.total || 0);

        const query = `
            SELECT
                ho.id as "haulageOfferId",
                ho.created_at as "bidDate",
                ho.status as "status",
                ho.admin_note as "adminNote",
                ho.assign_admin as "assignAdmin",
                ho.number_of_loads as "numberOfLoads",
                ho.quantity_per_load as "quantityPerLoad",
                ho.haulage_total as "haulageTotal",
                ho.currency as "currency",
                ho.expected_transit_time as "expectedTransitTime",
                ho.transport_provider as "transportProvider",
                hc.id as "haulierCompanyId",
                hc.name as "haulierCompanyName",
                haulier_u.id as "haulierUserId",
                haulier_u.username as "haulierUsername",
                haulier_u.first_name as "haulierFirstName",
                haulier_u.last_name as "haulierLastName",
                buyer_c.id as "buyerCompanyId",
                buyer_c.name as "buyerCompanyName",
                buyer_u.id as "buyerUserId",
                buyer_u.username as "buyerUsername",
                buyer_u.first_name as "buyerFirstName",
                buyer_u.last_name as "buyerLastName",
                seller_c.id as "sellerCompanyId",
                seller_c.name as "sellerCompanyName",
                seller_u.id as "sellerUserId",
                seller_u.username as "sellerUsername",
                seller_u.first_name as "sellerFirstName",
                seller_u.last_name as "sellerLastName",
                l.id as "listingId",
                l.material_item as "materialItem",
                l.material_type as "materialType",
                l.material_form as "materialForm",
                l.material_finishing as "materialFinishing",
                l.material_grading as "materialGrading",
                l.material_packing as "materialPacking",
                l.incoterms as "incoterms",
                l.location_id as "sellerLocationId",
                o.quantity as "offerQuantity",
                o.offered_price_per_unit as "pricePerMetricTonne",
                o.currency as "offerCurrency",
                o.buyer_location_id as "buyerLocationId",
                o.earliest_delivery_date as "earliestDeliveryDate",
                o.latest_delivery_date as "latestDeliveryDate",
                pickup_loc.address_line as "pickupLocation",
                pickup_loc.country as "pickupLocation_country",
                dest_loc.address_line as "destinationLocation",
                dest_loc.country as "destinationLocation_country",
                aa.id as "assignedAdminId",
                aa.first_name as "assignedAdminFirstName",
                aa.last_name as "assignedAdminLastName",
                aa.email as "assignedAdminEmail",
                aa.global_role as "assignedAdminGlobalRole"
            FROM haulage_offers ho
            INNER JOIN offers o ON ho.offer_id = o.id
            INNER JOIN listings l ON o.listing_id = l.id
            LEFT JOIN companies hc ON ho.haulier_company_id = hc.id
            LEFT JOIN companies buyer_c ON o.buyer_company_id = buyer_c.id
            LEFT JOIN companies seller_c ON l.company_id = seller_c.id
            LEFT JOIN users haulier_u ON ho.haulier_user_id = haulier_u.id
            LEFT JOIN users buyer_u ON o.buyer_user_id = buyer_u.id
            LEFT JOIN users seller_u ON l.created_by_user_id = seller_u.id
            LEFT JOIN company_locations pickup_loc ON l.location_id = pickup_loc.id
            LEFT JOIN company_locations dest_loc ON o.buyer_location_id = dest_loc.id
            LEFT JOIN users aa ON (ho.assign_admin->>'assignedAdminId')::int = aa.id
            ${whereClause}
            ORDER BY
                CASE
                    WHEN ho.status = '${HaulageOfferStatus.PENDING}' THEN 1
                    WHEN ho.status = '${HaulageOfferStatus.INFORMATION_REQUESTED}' THEN 2
                    WHEN ho.status = '${HaulageOfferStatus.OPEN_FOR_EDITS}' THEN 3
                    WHEN ho.status = '${HaulageOfferStatus.APPROVED}' THEN 4
                    WHEN ho.status = '${HaulageOfferStatus.ACCEPTED}' THEN 5
                    WHEN ho.status = '${HaulageOfferStatus.PARTIALLY_SHIPPED}' THEN 6
                    WHEN ho.status = '${HaulageOfferStatus.SHIPPED}' THEN 7
                    WHEN ho.status = '${HaulageOfferStatus.REJECTED}' THEN 8
                    WHEN ho.status = '${HaulageOfferStatus.WITHDRAWN}' THEN 9
                    ELSE 10
                END ASC,
                ho.created_at DESC NULLS LAST,
                ho.id DESC
            LIMIT ${limit} OFFSET ${skip}
        `;

        const results = await this.haulageOffersRepository.execute(query, params);

        const formattedResults = results.map((row: any) => {
            const totalLoads = Number(row.numberOfLoads) || 0;
            const shippedLoads = Number(row.shippedLoads) || 0;
            const totalWeight = totalLoads * (Number(row.quantityPerLoad) || 0);
            const pricePerMT = Number(row.pricePerMetricTonne) || 0;
            const haulageTotal = Number(row.haulageTotal) || 0;
            const offerCurrency = row.offerCurrency || ECurrency.GBP;

            // Calculate bid total with 2% markup if currency ≠ GBP (per spec 6.4.1.12)
            let bidAmount = totalWeight * pricePerMT;
            if (offerCurrency !== ECurrency.GBP) {
                bidAmount = bidAmount * 1.02; // Apply 2% markup for non-GBP
            }

            // Apply 2% markup on haulage total if non-GBP
            let adjustedHaulageTotal = haulageTotal;
            if (row.currency !== ECurrency.GBP) {
                adjustedHaulageTotal = haulageTotal * 1.02;
            }

            const isPERNEligible =
                row.pickupLocation_country === UK_ISO_CODE &&
                row.destinationLocation_country &&
                row.destinationLocation_country !== UK_ISO_CODE &&
                row.materialType === 'plastic';

            // PERN fee = £5/MT if eligible
            const pernFee = isPERNEligible ? 5 * totalWeight : 0;

            // Final seller total = Bid total - Haulage total + PERN (if eligible)
            // Per spec: Final seller total (GBP) = PRN-eligible: PERN total + Bid total − Haulage total
            //           Not PRN-eligible: Bid total − Haulage total
            const finalSellerTotal = bidAmount - adjustedHaulageTotal + pernFee;
            const sellerOfferPerMT = totalWeight > 0 ? finalSellerTotal / totalWeight : 0;

            return {
                haulageOfferId: row.haulageOfferId,
                bidDate: row.bidDate,
                status: row.status,
                formattedStatus: this.statusService.getShippingStatus(row.status, totalLoads, shippedLoads),
                statusColor: this.statusService.getStatusColor(row.status),
                adminNote: row.adminNote
                    ? typeof row.adminNote === 'string'
                        ? JSON.parse(row.adminNote)
                        : row.adminNote
                    : null,
                assignAdmin: (() => {
                    const assignAdminData = row.assignAdmin
                        ? typeof row.assignAdmin === 'string'
                            ? JSON.parse(row.assignAdmin)
                            : row.assignAdmin
                        : null;
                    return assignAdminData
                        ? {
                              ...assignAdminData,
                              assignedAdmin: row.assignedAdminId
                                  ? {
                                        id: row.assignedAdminId,
                                        firstName: row.assignedAdminFirstName ?? '',
                                        lastName: row.assignedAdminLastName ?? '',
                                        email: row.assignedAdminEmail ?? '',
                                        globalRole: row.assignedAdminGlobalRole ?? '',
                                    }
                                  : null,
                          }
                        : null;
                })(),
                numberOfLoads: totalLoads,
                quantityPerLoad: Number(row.quantityPerLoad) || 0,
                haulageTotal: haulageTotal,
                currency: row.currency,
                expectedTransitTime: row.expectedTransitTime,
                transportProvider: row.transportProvider,
                materialForm: row.materialForm,
                materialFinishing: row.materialFinishing,
                materialGrading: row.materialGrading,
                financial: {
                    totalWeight,
                    bidTotal: bidAmount,
                    currency: offerCurrency,
                    isPERNEligible,
                    pernFee,
                    finalSellerTotal,
                    buyerOffer: {
                        bidValuePerMT: pricePerMT,
                        currency: offerCurrency,
                    },
                    sellerOffer: {
                        offerPerMT: sellerOfferPerMT,
                        total: finalSellerTotal,
                    },
                },
            };
        });

        formattedResults.forEach((result: any, index: number) => {
            const row = results[index];
            result.haulier = {
                id: row.haulierUserId || null,
                username: row.haulierUsername || '',
                companyId: row.haulierCompanyId || null,
                companyName: row.haulierCompanyName || 'Unknown Company',
                firstName: row.haulierFirstName || '',
                lastName: row.haulierLastName || '',
            };
            result.buyer = {
                id: row.buyerUserId || null,
                username: row.buyerUsername || '',
                companyId: row.buyerCompanyId || null,
                companyName: row.buyerCompanyName || 'Unknown Company',
                firstName: row.buyerFirstName || '',
                lastName: row.buyerLastName || '',
                locationId: row.buyerLocationId || null,
            };
            result.seller = {
                id: row.sellerUserId || null,
                username: row.sellerUsername || '',
                companyId: row.sellerCompanyId || null,
                companyName: row.sellerCompanyName || 'Unknown Company',
                firstName: row.sellerFirstName || '',
                lastName: row.sellerLastName || '',
                locationId: row.sellerLocationId || null,
            };
            result.listing = {
                id: row.listingId || null,
                materialItem: row.materialItem || '',
                materialType: row.materialType || '',
                materialPacking: row.materialPacking || '',
                incoterms: row.incoterms || '',
                pickupLocation: row.pickupLocation || '',
                destinationLocation: row.destinationLocation || '',
            };
            result.offer = {
                quantity: Number(row.offerQuantity) || 0,
                pricePerMetricTonne: Number(row.pricePerMetricTonne) || 0,
                currency: row.offerCurrency || '',
                earliestDeliveryDate: row.earliestDeliveryDate || null,
                latestDeliveryDate: row.latestDeliveryDate || null,
            };
        });

        return {
            status: 'success',
            message: 'Haulage bids retrieved successfully',
            data: {
                results: formattedResults,
                totalCount: total,
            },
        };
    }

    /**
     * Admin: Get detailed haulage bid information
     * Task: 6.4.1.14. View Haulage Bid Details
     */
    public async getHaulageBidDetailsForAdmin(id: number, currentUser: MyUserProfile): Promise<IDataResponse<unknown>> {
        try {
            // First check if haulage offer exists
            const haulageOffer = await this.haulageOffersRepository.findById(id);
            if (!haulageOffer) {
                throw new HttpErrors.NotFound(`Haulage offer with ID ${id} not found`);
            }

            const query = `
                SELECT
                    ho.id,
                    ho.created_at,
                    ho.status,
                    ho.haulier_company_id,
                    ho.haulier_user_id,
                    ho.offer_id,
                    ho.trailer_container_type,
                    ho.number_of_loads,
                    ho.quantity_per_load,
                    ho.currency as "haulageCurrency",
                    o.offered_price_per_unit,
                    ho.haulage_cost_per_load,
                    ho.haulage_total,
                    ho.transport_provider,
                    ho.suggested_collection_date,
                    ho.expected_transit_time,
                    ho.demurrage_at_destination,
                    ho.notes,
                    ho.shipped_loads,
                    ho.shipped_date,
                    hc.name as "haulierCompanyName",
                    haulier_u.username as "haulierUsername",
                    haulier_u.first_name as "haulierFirstName",
                    haulier_u.last_name as "haulierLastName",
                    haulier_u.email as "haulierEmail",
                    buyer_c.name as "buyerCompanyName",
                    buyer_c.id as "buyerCompanyId",
                    buyer_u.id as "buyerUserId",
                    buyer_u.username as "buyerUsername",
                    buyer_u.first_name as "buyerFirstName",
                    buyer_u.last_name as "buyerLastName",
                    buyer_u.email as "buyerEmail",
                    seller_c.name as "sellerCompanyName",
                    seller_c.id as "sellerCompanyId",
                    seller_u.id as "sellerUserId",
                    seller_u.username as "sellerUsername",
                    seller_u.first_name as "sellerFirstName",
                    seller_u.last_name as "sellerLastName",
                    seller_u.email as "sellerEmail",
                    l.id as "listingId",
                    l.material_item,
                    l.material_type,
                    l.material_form,
                    l.material_grading,
                    l.material_color,
                    l.material_finishing,
                    l.material_packing,
                    l.material_weight_per_unit,
                    l.weight_per_load,
                    l.incoterms,
                    l.remaining_quantity as loads_remaining,
                    l.location_id as "sellerLocationId",
                    o.quantity as "offerQuantity",
                    o.currency as "offerCurrency",
                    o.earliest_delivery_date,
                    o.latest_delivery_date,
                    o.buyer_company_id,
                    o.buyer_user_id,
                    o.buyer_location_id as "buyerLocationId",
                    pickup_loc.address_line as "pickupLocation_address_line",
                    pickup_loc.city as "pickupLocation_city",
                    pickup_loc.state_province as "pickupLocation_state",
                    pickup_loc.country as "pickupLocation_country",
                    pickup_loc.postcode as "pickupLocation_postal_code",
                    dest_loc.address_line as "destinationLocation_address_line",
                    dest_loc.city as "destinationLocation_city",
                    dest_loc.state_province as "destinationLocation_state",
                    dest_loc.country as "destinationLocation_country",
                    dest_loc.postcode as "destinationLocation_postal_code"
                FROM haulage_offers ho
                INNER JOIN offers o ON ho.offer_id = o.id
                INNER JOIN listings l ON o.listing_id = l.id
                LEFT JOIN companies hc ON ho.haulier_company_id = hc.id
                LEFT JOIN companies buyer_c ON o.buyer_company_id = buyer_c.id
                LEFT JOIN companies seller_c ON l.company_id = seller_c.id
                LEFT JOIN users haulier_u ON ho.haulier_user_id = haulier_u.id
                LEFT JOIN users buyer_u ON o.buyer_user_id = buyer_u.id
                LEFT JOIN users seller_u ON l.created_by_user_id = seller_u.id
                LEFT JOIN company_locations pickup_loc ON l.location_id = pickup_loc.id
                LEFT JOIN company_locations dest_loc ON o.buyer_location_id = dest_loc.id
                WHERE ho.id = $1
            `;

            const results = await this.haulageOffersRepository.execute(query, [id]);

            if (!results || results.length === 0) {
                throw new HttpErrors.NotFound('Haulage bid not found');
            }

            const haulageBid = results[0];

            const totalWeight = (haulageBid.number_of_loads || 0) * (haulageBid.quantity_per_load || 0);
            const pricePerMT = haulageBid.offered_price_per_unit || 0;
            const offerCurrency = haulageBid.offerCurrency || ECurrency.GBP;
            const haulageCurrency = haulageBid.haulageCurrency || ECurrency.GBP;
            const haulageTotal = haulageBid.haulage_total || 0;

            // Calculate bid total with 2% markup if currency ≠ GBP (per spec 6.4.1.12)
            let bidTotal = pricePerMT * totalWeight;
            if (offerCurrency !== ECurrency.GBP) {
                bidTotal = bidTotal * 1.02; // Apply 2% markup for non-GBP
            }

            // Apply 2% markup on haulage total if non-GBP
            let adjustedHaulageTotal = haulageTotal;
            if (haulageCurrency !== ECurrency.GBP) {
                adjustedHaulageTotal = haulageTotal * 1.02;
            }

            const isPERNEligible =
                haulageBid.pickupLocation_country === UK_ISO_CODE &&
                haulageBid.destinationLocation_country &&
                haulageBid.destinationLocation_country !== UK_ISO_CODE &&
                haulageBid.material_type === 'plastic';

            // PERN fee = £5/MT if eligible
            const pernFee = isPERNEligible ? 5 * totalWeight : 0;

            // Final seller total = Bid total - Haulage total + PERN (if eligible)
            const finalSellerTotal = bidTotal - adjustedHaulageTotal + pernFee;

            const formattedStatus = this.statusService.getShippingStatus(
                haulageBid.status,
                haulageBid.number_of_loads,
                haulageBid.shipped_loads,
            );

            const formattedBid = {
                haulageOfferId: haulageBid.id,
                bidDate: haulageBid.created_at,
                status: haulageBid.status,
                formattedStatus: formattedStatus,
                statusColor: this.statusService.getStatusColor(haulageBid.status),
                summary: {
                    numberOfLoads: haulageBid.number_of_loads,
                    currency: haulageCurrency, // Use haulage offer currency, not offer currency
                    haulageBidAmount: haulageBid.haulage_cost_per_load,
                    quantityPerLoad: haulageBid.quantity_per_load,
                    haulageTotal: haulageBid.haulage_total,
                    status: haulageBid.status,
                },
                seller: {
                    id: haulageBid.sellerUserId,
                    username: haulageBid.sellerUsername,
                    companyId: haulageBid.sellerCompanyId,
                    firstName: haulageBid.sellerFirstName,
                    lastName: haulageBid.sellerLastName,
                    companyName: haulageBid.sellerCompanyName,
                    email: haulageBid.sellerEmail,
                    locationId: haulageBid.sellerLocationId,
                    pricePerMetricTonne: totalWeight > 0 ? finalSellerTotal / totalWeight : 0,
                    totalPrice: finalSellerTotal,
                    pickupLocation: this.formatFullAddress(
                        haulageBid.pickupLocation_address_line,
                        haulageBid.pickupLocation_city,
                        haulageBid.pickupLocation_state,
                        haulageBid.pickupLocation_country,
                        haulageBid.pickupLocation_postal_code,
                    ),
                },
                buyer: {
                    id: haulageBid.buyerUserId,
                    username: haulageBid.buyerUsername,
                    companyId: haulageBid.buyerCompanyId,
                    firstName: haulageBid.buyerFirstName,
                    lastName: haulageBid.buyerLastName,
                    companyName: haulageBid.buyerCompanyName,
                    email: haulageBid.buyerEmail,
                    locationId: haulageBid.buyerLocationId,
                    pricePerMetricTonne: pricePerMT,
                    bidAmount: bidTotal,
                    destination: this.formatFullAddress(
                        haulageBid.destinationLocation_address_line,
                        haulageBid.destinationLocation_city,
                        haulageBid.destinationLocation_state,
                        haulageBid.destinationLocation_country,
                        haulageBid.destinationLocation_postal_code,
                    ),
                    deliveryWindow: {
                        earliest: haulageBid.earliest_delivery_date,
                        latest: haulageBid.latest_delivery_date,
                    },
                },
                haulier: {
                    id: haulageBid.haulier_user_id,
                    username: haulageBid.haulierUsername,
                    companyId: haulageBid.haulier_company_id,
                    firstName: haulageBid.haulierFirstName,
                    lastName: haulageBid.haulierLastName,
                    companyName: haulageBid.haulierCompanyName,
                    email: haulageBid.haulierEmail,
                    trailerContainerType: haulageBid.trailer_container_type,
                    numberOfLoads: haulageBid.number_of_loads,
                    quantityPerLoad: haulageBid.quantity_per_load,
                    haulageCostPerLoad: haulageBid.haulage_cost_per_load,
                    haulageTotal: haulageBid.haulage_total,
                    transportProvider: haulageBid.transport_provider,
                    suggestedCollectionDate: haulageBid.suggested_collection_date,
                    expectedTransitTime: haulageBid.expected_transit_time,
                    demurrageAtDestination: haulageBid.demurrage_at_destination,
                    notes: haulageBid.notes,
                },
                material: {
                    name: haulageBid.material_item,
                    type: haulageBid.material_type,
                    form: haulageBid.material_form,
                    grading: haulageBid.material_grading,
                    color: haulageBid.material_color,
                    finishing: haulageBid.material_finishing,
                    packing: haulageBid.material_packing,
                    incoterms: haulageBid.incoterms,
                    loadsRemaining: haulageBid.loads_remaining,
                    avgWeightPerLoad: Number(haulageBid.weight_per_load) || Number(haulageBid.quantity_per_load) || 0,
                },
                financial: {
                    totalWeight,
                    bidTotal,
                    currency: offerCurrency,
                    isPERNEligible,
                    pernFee,
                    finalSellerTotal,
                    buyerOffer: {
                        bidValuePerMT: pricePerMT,
                        currency: offerCurrency,
                    },
                    sellerOffer: {
                        offerPerMT: totalWeight > 0 ? finalSellerTotal / totalWeight : 0,
                        total: finalSellerTotal,
                    },
                },
                loadDetails:
                    haulageBid.status === HaulageOfferStatus.ACCEPTED ||
                    haulageBid.status === HaulageOfferStatus.PARTIALLY_SHIPPED ||
                    haulageBid.status === HaulageOfferStatus.SHIPPED
                        ? {
                              totalLoads: haulageBid.number_of_loads,
                              shippedLoads: haulageBid.shipped_loads || 0,
                              shippedDate: haulageBid.shipped_date,
                          }
                        : null,
            };

            return {
                status: 'success',
                message: 'Haulage bid details retrieved successfully',
                data: formattedBid,
            };
        } catch (error) {
            // If it's already an HttpError, re-throw it
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }
            // For any other error, log and throw a generic 500
            console.error('Error in getHaulageBidDetailsForAdmin:', error);
            throw new HttpErrors.InternalServerError('Failed to fetch haulage bid details');
        }
    }

    /**
     * Mark a haulage offer as shipped (admin only)
     */
    public async markAsShipped(
        id: number,
        currentUser: MyUserProfile,
        loadId: number,
    ): Promise<IDataResponse<HaulageOffers>> {
        // Verify the haulage offer exists
        const haulageOffer = await this.haulageOffersRepository.findById(id);
        if (!haulageOffer) {
            throw new HttpErrors.NotFound('Haulage offer not found');
        }

        // Check if the offer is in ACCEPTED status
        if (
            haulageOffer.status !== HaulageOfferStatus.ACCEPTED &&
            haulageOffer.status !== HaulageOfferStatus.APPROVED &&
            haulageOffer.status !== HaulageOfferStatus.PARTIALLY_SHIPPED
        ) {
            throw new HttpErrors.BadRequest(
                'Only accepted haulage offers can be marked as shipped. ' +
                    'Please ensure the offer has been approved before marking as shipped.',
            );
        }

        // Find the specific load
        const load = await this.haulageLoadsRepository.findById(loadId);
        if (!load) {
            throw new HttpErrors.NotFound('Load not found');
        }

        // Verify load belongs to this haulage offer
        if (load.haulageOfferId !== id) {
            throw new HttpErrors.BadRequest('Load does not belong to this haulage offer');
        }

        // Check if already shipped
        if (load.shippedDate) {
            throw new HttpErrors.BadRequest('This load has already been shipped');
        }

        // Update the specific load
        const now = new Date();
        await this.haulageLoadsRepository.updateById(loadId, {
            shippedDate: now,
            loadStatus: 'Delivered',
            updatedAt: now,
        });

        // Sync load to Salesforce
        if (this.salesforceService) {
            try {
                const updatedLoad = await this.haulageLoadsRepository.findById(loadId);
                if (updatedLoad.salesforceId) {
                    await this.salesforceService.updateRecord('Haulage_Loads__c', updatedLoad.salesforceId, {
                        load_status__c: 'Delivered',
                        Last_Sync_Origin__c: 'WasteTrade',
                    });
                }
            } catch (syncError) {
                // Silent fail - logged elsewhere
            }
        }

        // Calculate new shipped count
        const newShippedLoads = (haulageOffer.shippedLoads || 0) + 1;

        // Determine new status
        let newStatus: HaulageOfferStatus;
        if (newShippedLoads >= haulageOffer.numberOfLoads) {
            newStatus = HaulageOfferStatus.SHIPPED;
        } else {
            newStatus = HaulageOfferStatus.PARTIALLY_SHIPPED;
        }

        // Update the haulage offer
        const updateData: Partial<HaulageOffers> = {
            status: newStatus,
            shippedLoads: newShippedLoads,
            shippedDate: now,
            updatedAt: now,
        };

        await this.haulageOffersRepository.updateById(id, updateData);
        const updatedOffer = await this.haulageOffersRepository.findById(id);

        // Sync to Salesforce
        if (this.salesforceSyncService && updatedOffer.id) {
            this.salesforceSyncService.syncHaulageOffer(updatedOffer.id, true, false, 'markShipped').catch((syncError) => {
                SalesforceLogger.error('Sync failed after marking haulage offer shipped', syncError, { entity: 'HaulageOffer', haulageOfferId: updatedOffer.id, action: 'mark_shipped' });
            });
        }

        return {
            status: 'success',
            message: `Successfully marked load as shipped. Status updated to ${newStatus}.`,
            data: updatedOffer,
        };
    }

    /**
     * Get documents for accepted haulage offer
     * Task: 6.2.3.4. View Documents for Accepted Haulage Offers
     */
    public async getHaulageOfferDocuments(
        haulageOfferId: number,
        currentUser: MyUserProfile,
    ): Promise<IDataResponse<HaulageOfferDocuments[]>> {
        // Get haulage offer
        const haulageOffer = await this.haulageOffersRepository.findById(haulageOfferId);
        if (!haulageOffer) {
            throw new HttpErrors.NotFound('Haulage offer not found');
        }

        // Verify this is the haulier's company or an admin
        const user = await this.userRepository.findById(currentUser.id);
        const isAdmin = AuthHelper.isAdmin(user.globalRole);

        if (!isAdmin && haulageOffer.haulierCompanyId !== currentUser.companyId) {
            throw new HttpErrors.Forbidden('You do not have permission to view documents for this haulage offer');
        }

        // Only show documents for accepted offers
        if (
            haulageOffer.status !== HaulageOfferStatus.ACCEPTED &&
            haulageOffer.status !== HaulageOfferStatus.PARTIALLY_SHIPPED &&
            haulageOffer.status !== HaulageOfferStatus.SHIPPED
        ) {
            throw new HttpErrors.BadRequest('Documents are only available for accepted haulage offers');
        }

        // Get documents from repository
        const documents = await this.haulageOfferDocumentsRepository.find({
            where: { haulageOfferId },
            order: ['createdAt DESC'],
        });

        return {
            status: 'success',
            message: 'Documents retrieved successfully',
            data: documents,
        };
    }

    /**
     * Force update haulage offer status (Admin only - for testing/fixing data)
     */
    public async forceUpdateStatus(
        id: number,
        newStatus: string,
        currentUser: MyUserProfile,
    ): Promise<IDataResponse<HaulageOffers>> {
        // Validate status value
        const validStatuses = Object.values(HaulageOfferStatus);
        if (!validStatuses.includes(newStatus as HaulageOfferStatus)) {
            throw new HttpErrors.BadRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        // Get haulage offer
        const haulageOffer = await this.haulageOffersRepository.findById(id);
        if (!haulageOffer) {
            throw new HttpErrors.NotFound('Haulage offer not found');
        }

        // Update status
        const updatedOffer = await this.haulageOffersRepository.updateById(id, {
            status: newStatus as HaulageOfferStatus,
            updatedAt: new Date(),
        });

        // Get updated offer to return
        const result = await this.haulageOffersRepository.findById(id);

        // Sync to Salesforce if observer is available
        if (this.salesforceSyncService && result.id) {
            this.salesforceSyncService.syncHaulageOffer(result.id, true, false, 'forceStatus').catch((syncError) => {
                SalesforceLogger.error('Sync failed after haulage offer status update', syncError, { entity: 'HaulageOffer', haulageOfferId: result.id, action: 'force_status_update' });
            });
        }

        return {
            status: 'success',
            message: `Haulage offer status updated to ${newStatus}`,
            data: result,
        };
    }

    /**
     * Generate loads for accepted haulage offer
     */
    async generateLoadsForHaulageOffer(haulageOfferId: number): Promise<void> {
        const haulageOffer = await this.haulageOffersRepository.findById(haulageOfferId);

        // Check if loads already exist
        const existingLoads = await this.haulageLoadsRepository.find({
            where: { haulageOfferId },
        });

        if (existingLoads.length > 0) {
            return;
        }

        // Generate loads based on numberOfLoads
        const numberOfLoads = haulageOffer.numberOfLoads || 1;
        const loads = [];

        for (let i = 1; i <= numberOfLoads; i++) {
            const load = await this.haulageLoadsRepository.create({
                haulageOfferId,
                loadNumber: `${i} of ${numberOfLoads}`,
                loadStatus: 'Awaiting Collection',
                isSyncedSalesForce: false,
            });
            loads.push(load);
        }

        // Sync loads to Salesforce sequentially to avoid connection contention
        if (this.salesforceSyncService) {
            for (const load of loads) {
                try {
                    await this.salesforceSyncService.syncHaulageLoad(load.id!, false, true, 'generateLoads');
                } catch (error) {
                    SalesforceLogger.error('Sync failed for haulage load', error, { entity: 'HaulageLoad', loadId: load.id, action: 'generate_loads' });
                }
            }
        }
    }

    /**
     * Get loads for haulage offer
     */
    async getLoadsForHaulageOffer(haulageOfferId: number): Promise<IDataResponse<unknown[]>> {
        const loads = await this.haulageLoadsRepository.find({
            where: { haulageOfferId },
            order: ['loadNumber ASC'],
            limit: 100,
        });

        return {
            status: 'success',
            message: `Found ${loads.length} loads`,
            data: loads,
        };
    }
}
