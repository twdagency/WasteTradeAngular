/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRepository } from './../repositories/user.repository';
//TODO: Change ListingStatus.PENDING to ListingStatus.APPROVED when admin approval is implemented
import { PaginationList } from './../types/common';
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { BindingScope, inject, injectable, service } from '@loopback/core';
import { Filter } from '@loopback/filter';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { get } from 'lodash';
import { EMAIL_BLOCK_REGEX, messages, PHONE_BLOCK_REGEX, URL_BLOCK_REGEX } from '../constants';
import {
    FibreGradings,
    FibreItems,
    ListingImageType,
    ListingRequestActionEnum,
    ListingSortBy,
    ListingState,
    ListingStatus,
    ListingType,
    MaterialFlowIndex,
    MaterialType,
    MetalItems,
    NotificationType,
    PlasticForms,
    PlasticGradings,
    PlasticItems,
    RenewalPeriod,
    RubberItems,
    WasteStoration,
} from '../enum';
import { OfferState, OfferStatusEnum } from '../enum/offer.enum';
import { AuthHelper, ListingHelper } from '../helpers';
import { CreateListing, ListingDocuments, Listings } from '../models';
import { SalesforceBindings } from '../keys/salesforce';
import {
    CompaniesRepository,
    CompanyLocationsRepository,
    CompanyUsersRepository,
    ListingDocumentsRepository,
    ListingsRepository,
    OffersRepository,
} from '../repositories';
import { IDataResponse } from '../types';
import { ListingWithDetails, ListingWithDocuments } from '../types/listing';
import { getMaterialRequirementStatus } from '../utils/common';
import { getCountryIsoCode, getAllMatchingCountryIsoCodes } from '../utils/country-mapping';
import { getMaterialCode } from '../utils/material-mapping';
import { SalesforceLogger } from '../utils/salesforce/salesforce-sync.utils';
import { EmailService } from './email.service';
import { ExchangeRateService } from './exchange-rate.service';
import { SalesforceSyncService } from './salesforce/salesforce-sync.service';
import { ListingExpiryService } from './listing-expiry.service';
import { WasteTradeNotificationsService } from './waste-trade-notifications.service';

/**
 * Sanitize input to prevent SQL injection
 */
function sanitizeInput(input: string): string {
    return input.replace(/'/g, "''").replace(/[\\]/g, '\\\\');
}

/**
 * Generate SQL conditions for wanted status filtering
 */
function generateWantedStatusSqlConditions(statuses: string[]): string[] {
    return statuses.map((status) => {
        switch (status) {
            case 'Pending':
                return `(l.status = 'pending' OR l.state = 'pending')`;
            case 'Rejected':
                return `(l.status = 'rejected' OR l.state = 'rejected')`;
            case 'Fulfilled':
                return `(l.status = 'sold' OR l.state = 'closed')`;
            case 'More Information Required':
                return `(l.rejection_reason = 'more_information_required' OR l.status = 'more_information_required')`;
            case 'Material Required':
                return `((l.status = 'available' OR l.state = 'active') AND (l.start_date IS NULL OR l.start_date <= CURRENT_DATE))`;
            default:
                // Handle "Material Required from DD/MM/YYYY" pattern
                if (status.startsWith('Material Required from ')) {
                    return `((l.status = 'available' OR l.state = 'active') AND l.start_date > CURRENT_DATE)`;
                }
                return 'FALSE'; // Invalid status
        }
    });
}

@injectable({ scope: BindingScope.TRANSIENT })
export class ListingService {
    constructor(
        @repository(ListingsRepository)
        public listingRepository: ListingsRepository,
        @repository(ListingDocumentsRepository)
        public listingDocumentsRepository: ListingDocumentsRepository,
        @repository(CompaniesRepository)
        public companyRepository: CompaniesRepository,
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,
        @repository(CompanyLocationsRepository)
        public companyLocationsRepository: CompanyLocationsRepository,
        @repository(UserRepository)
        public userRepository: UserRepository,
        @repository(OffersRepository)
        public offersRepository: OffersRepository,

        @service(EmailService)
        public emailService: EmailService,
        @service(ListingExpiryService)
        public listingExpiryService: ListingExpiryService,
        @service(ExchangeRateService)
        public exchangeRateService: ExchangeRateService,
        @service(WasteTradeNotificationsService)
        public wasteTradeNotificationsService: WasteTradeNotificationsService,

        @inject(SalesforceBindings.SYNC_SERVICE, { optional: true })
        private salesforceSyncService?: SalesforceSyncService,
    ) {}

    public async createListing(data: CreateListing, userId: string): Promise<IDataResponse> {
        const { documents, ...listingData } = data;

        this.validateDocuments(documents);
        this.validateMaterialTypeAndProperties(data);
        this.validateListingDetails(data);
        this.validateAdditionalNotes(data.additionalNotes);

        // Validate and sanitize numeric fields to prevent NaN values
        const sanitizeNumber = (value: any): number | undefined => {
            if (value === null || value === undefined || value === '') return undefined;
            const num = Number(value);
            return isNaN(num) ? undefined : num;
        };

        // Calculate endDate based on Phase 2 requirements:
        // - If listingRenewalPeriod is set (ongoing listing), endDate is not set (null)
        // - If no renewal period (non-ongoing), endDate is automatically 90 days from startDate
        let calculatedEndDate: Date | undefined = undefined;

        if (listingData.endDate) {
            // Use explicitly provided endDate
            calculatedEndDate = new Date(listingData.endDate);
        } else if (listingData.listingDuration) {
            // Backward compatibility: use listingDuration if provided
            calculatedEndDate = new Date(listingData.listingDuration);
        } else if (!listingData.listingRenewalPeriod) {
            // Phase 2: Non-ongoing listings default to 90 days from startDate
            const startDate = listingData.startDate ? new Date(listingData.startDate) : new Date();
            calculatedEndDate = new Date(startDate);
            calculatedEndDate.setDate(calculatedEndDate.getDate() + 90);
        }
        // If listingRenewalPeriod is set, calculatedEndDate remains undefined (ongoing listing)

        // Sanitize Phase 2 fields
        const numberOfLoads = sanitizeNumber(listingData.numberOfLoads);
        let totalWeight = sanitizeNumber(listingData.totalWeight);
        let weightPerLoad = sanitizeNumber(listingData.weightPerLoad);

        // Declare variables that will be used in sanitizedData
        const quantity = sanitizeNumber(listingData.quantity);
        const materialWeightPerUnit = sanitizeNumber(listingData.materialWeightPerUnit);
        const materialWeight = sanitizeNumber(listingData.materialWeight);
        const weightUnit = listingData.weightUnit;

        // Priority 1: Use explicit totalWeight if provided
        if (totalWeight) {
            // totalWeight already set, skip other calculations
        }
        // Priority 2: Convert materialWeight + weightUnit to totalWeight (Mt)
        else if (materialWeight && weightUnit) {
            // Convert materialWeight to Mt based on weightUnit
            // Conversion: 1 MT = 1000 Kgs = 2204.62263 Lbs
            switch (weightUnit.toLowerCase()) {
                case 'mt':
                    totalWeight = materialWeight;
                    break;
                case 'kg':
                    totalWeight = materialWeight / 1000;
                    break;
                case 'lbs':
                    totalWeight = materialWeight / 2204.62263;
                    break;
                default:
                    totalWeight = materialWeight; // Default to Mt
            }
        }
        // Priority 3: Calculate totalWeight from quantity * materialWeightPerUnit
        else if (quantity && materialWeightPerUnit) {
            totalWeight = quantity * materialWeightPerUnit;
        }

        // Calculate weightPerLoad if not provided (totalWeight / numberOfLoads)
        if (!weightPerLoad && totalWeight && numberOfLoads) {
            weightPerLoad = Number((totalWeight / numberOfLoads).toFixed(3));
        }

        const sanitizedData = {
            ...listingData,
            // Required numeric fields
            companyId: sanitizeNumber(listingData.companyId),
            createdByUserId: sanitizeNumber(userId),
            // Optional numeric fields
            locationId: sanitizeNumber(listingData.locationId),
            quantity,
            remainingQuantity: quantity || 0,
            pricePerMetricTonne: sanitizeNumber(listingData.pricePerMetricTonne),
            materialWeightPerUnit,
            materialWeightWanted: sanitizeNumber(listingData.materialWeightWanted),
            capacityPerMonth: sanitizeNumber(listingData.capacityPerMonth),
            viewCount: sanitizeNumber(listingData.viewCount),
            // Phase 2 fields
            numberOfLoads,
            totalWeight,
            weightPerLoad,
            materialWeight,
            weightUnit,
            incoterms: listingData.incoterms?.toUpperCase(), // Normalize to uppercase
            // Set status and state
            status: ListingStatus.PENDING,
            state: ListingState.PENDING,
            // Set calculated endDate
            endDate: calculatedEndDate,
        };

        // Validate required fields after sanitization
        if (!sanitizedData.companyId) {
            throw new HttpErrors[422]('Company ID is required and must be a valid number');
        }
        if (!sanitizedData.createdByUserId) {
            throw new HttpErrors[422]('User ID must be a valid number');
        }

        // Validate listing-type-specific fields (matches frontend form validation)
        const isWanted = listingData.listingType === ListingType.WANTED;
        if (isWanted) {
            // Frontend: materialWeightWanted is required, min(0), converted to MT via convertToTon()
            if (sanitizedData.materialWeightWanted == null || sanitizedData.materialWeightWanted < 0) {
                throw new HttpErrors[422]('Material weight wanted (MT) is required for wanted listings');
            }
            // Clear sell-only fields to prevent data inconsistency
            sanitizedData.quantity = undefined as any;
            sanitizedData.remainingQuantity = 0 as any;
        } else {
            // Frontend: quantity is required, min(1), max(1,000,000,000)
            if (!quantity || quantity < 1) {
                throw new HttpErrors[422]('Quantity is required for sell listings and must be at least 1');
            }
            // Clear wanted-only field to prevent data inconsistency
            sanitizedData.materialWeightWanted = undefined as any;
        }

        const createdListing = await this.listingRepository.create(sanitizedData);

        ListingHelper.sendNotificationNewListing(
            this.companyRepository,
            this.companyUsersRepository,
            this.wasteTradeNotificationsService,
            createdListing,
        ).catch((error) => {
            console.error(`Error sending notification new listing: ${error}`);
        });

        if (createdListing.id) {
            const listingDocuments = await this.createListingDocuments(documents, createdListing.id);

            // Trigger Salesforce sync after successful listing creation (fire-and-forget)
            if (this.salesforceSyncService && createdListing.id) {
                const syncFn = createdListing.listingType === ListingType.WANTED
                    ? this.salesforceSyncService.syncWantedListing(createdListing.id, true, false, 'createListing')
                    : this.salesforceSyncService.syncListing(createdListing.id, true, false, 'createListing');
                syncFn.catch((syncError) => {
                    SalesforceLogger.error('Sync failed after listing creation', syncError, { entity: 'Listing', listingId: createdListing.id, listingType: createdListing.listingType, action: 'create' });
                });
            }

            return {
                status: 'success',
                data: {
                    listing: createdListing,
                    documents: listingDocuments,
                },
                message: messages.listingCreated,
            };
        }
        throw new HttpErrors[400](messages.failedToCreateListing);
    }

    private validateDocuments(documents: CreateListing['documents']): void {
        for (const document of documents) {
            if (!document.documentType) {
                throw new HttpErrors[422](messages.missingDocumentType);
            }
            if (!document.documentUrl) {
                throw new HttpErrors[422](messages.missingDocumentUrl);
            }
            if (!Object.values(ListingImageType).includes(document.documentType as ListingImageType)) {
                throw new HttpErrors[422](messages.invalidDocumentType);
            }
        }
    }

    private validateMaterialTypeAndProperties(data: CreateListing): void {
        const materialValidators: Record<MaterialType, () => void> = {
            [MaterialType.EFW]: () => {
                if (data.materialForm || data.materialItem || data.materialGrading) {
                    throw new HttpErrors[422](messages.invalidMaterialTypeEFW);
                }
            },
            [MaterialType.METAL]: () => {
                if (data.materialForm || data.materialGrading) {
                    throw new HttpErrors[422](messages.invalidMaterialTypeMetal);
                }
                if (!Object.values(MetalItems).includes(data.materialItem as MetalItems)) {
                    throw new HttpErrors[422](messages.invalidMaterialTypeMetal);
                }
            },
            [MaterialType.RUBBER]: () => {
                if (data.materialForm || data.materialGrading) {
                    throw new HttpErrors[422](messages.invalidMaterialTypeRubber);
                }
                if (!Object.values(RubberItems).includes(data.materialItem as RubberItems)) {
                    throw new HttpErrors[422](messages.invalidMaterialTypeRubber);
                }
            },
            [MaterialType.FIBRE]: () => {
                if (data.materialForm) {
                    throw new HttpErrors[422](messages.invalidMaterialTypeFibre);
                }
                if (
                    !Object.values(FibreItems).includes(data.materialItem as FibreItems) ||
                    !Object.values(FibreGradings).includes(data.materialGrading as FibreGradings)
                ) {
                    throw new HttpErrors[422](messages.invalidMaterialTypeFibre);
                }
            },
            [MaterialType.PLASTIC]: () => {
                if (
                    !Object.values(PlasticItems).includes(data.materialItem as PlasticItems) ||
                    !Object.values(PlasticGradings).includes(data.materialGrading as PlasticGradings) ||
                    !Object.values(PlasticForms).includes(data.materialForm as PlasticForms)
                ) {
                    throw new HttpErrors[422](messages.invalidMaterialTypePlastic);
                }
            },
        };

        const validator = materialValidators[data.materialType];
        if (validator) {
            validator();
        }
    }

    private validateListingDetails(data: CreateListing): void {
        if (!data.capacityPerMonth && data.listingType === ListingType.WANTED) {
            throw new HttpErrors[422](messages.missingCapacityPerMonth);
        }
        if (
            (typeof data.capacityPerMonth !== 'number' || data.capacityPerMonth <= 0) &&
            data.listingType === ListingType.WANTED
        ) {
            throw new HttpErrors[422](messages.invalidCapacityPerMonth);
        }
        if (!data.materialFlowIndex && data.listingType === ListingType.WANTED) {
            throw new HttpErrors[422](messages.missingMaterialFlowIndex);
        }
        if (
            !Object.values(MaterialFlowIndex).includes(data.materialFlowIndex as MaterialFlowIndex) &&
            data.listingType === ListingType.WANTED
        ) {
            throw new HttpErrors[422](messages.invalidMaterialFlowIndex);
        }
        if (
            (typeof data.materialWeightWanted !== 'number' || data.materialWeightWanted <= 0) &&
            data.listingType === ListingType.WANTED
        ) {
            throw new HttpErrors[422](messages.invalidMaterialWeightWanted);
        }
        if (data.startDate && data.startDate < new Date()) {
            throw new HttpErrors[422](messages.invalidStartDate);
        }
        if (
            data.listingRenewalPeriod &&
            !Object.values(RenewalPeriod).includes(data.listingRenewalPeriod as RenewalPeriod)
        ) {
            throw new HttpErrors[422](messages.invalidListingRenewalPeriod);
        }
        // Phase 2: listingDuration is now read-only at 90 days, no custom validation needed
        // Keeping backward compatibility check for legacy API clients
        if (data.listingDuration && data.listingDuration < new Date()) {
            throw new HttpErrors[422](messages.invalidListingDuration);
        }

        // Phase 2: Validate new fields
        if (data.totalWeight !== undefined && data.totalWeight < 3) {
            throw new HttpErrors[422]('Total weight must be at least 3 metric tonnes');
        }
        if (data.numberOfLoads !== undefined && data.numberOfLoads < 1) {
            throw new HttpErrors[422]('Number of loads must be at least 1');
        }
        // Incoterms is optional string field, no enum validation needed
    }

    private validateAdditionalNotes(additionalNotes?: string): void {
        if (additionalNotes) {
            if (PHONE_BLOCK_REGEX.test(additionalNotes)) {
                throw new HttpErrors[422](messages.additionalNotesContainsPhone);
            }
            if (EMAIL_BLOCK_REGEX.test(additionalNotes)) {
                throw new HttpErrors[422](messages.additionalNotesContainsEmail);
            }
            if (URL_BLOCK_REGEX.test(additionalNotes)) {
                throw new HttpErrors[422](messages.additionalNotesContainsUrl);
            }
        }
    }

    private async createListingDocuments(
        documents: CreateListing['documents'],
        listingId: number,
    ): Promise<ListingDocuments[]> {
        const listingDocuments: ListingDocuments[] = [];
        for (const document of documents) {
            const listingDocument = await this.listingDocumentsRepository.create({
                documentType: document.documentType as ListingImageType,
                documentUrl: document.documentUrl,
                listingId,
            });
            listingDocuments.push(listingDocument);
        }
        return listingDocuments;
    }

    public async getListings(
        { filter }: { filter?: Filter<Listings> },
        userId?: number,
    ): Promise<PaginationList<ListingWithDocuments>> {
        const skip: number | null = get(filter, 'skip', 0);
        const limit: number | null = get(filter, 'limit', 10);
        const conditions = [];

        // Track if we need to join company_locations table
        let needsCompanyLocationJoin = false;

        if (userId) {
            conditions.push(`l.created_by_user_id = ${userId}`);
        }

        const searchTerm = get(filter?.where, 'searchTerm', null) as string | null;

        if (searchTerm) {
            const sanitizedSearchTerm = sanitizeInput(searchTerm);
            const countryIsoCode = getCountryIsoCode(searchTerm);

            // Try to get material codes from display names for better search results
            const materialTypeCode = getMaterialCode(searchTerm, 'type');
            const materialItemCode = getMaterialCode(searchTerm, 'item');
            const materialPackingCode = getMaterialCode(searchTerm, 'packing');

            needsCompanyLocationJoin = true;
            conditions.push(`(
                l.material_type ILIKE '%${sanitizedSearchTerm}%' OR
                l.material_type ILIKE '%${sanitizeInput(materialTypeCode)}%' OR
                l.material_item ILIKE '%${sanitizedSearchTerm}%' OR
                l.material_item ILIKE '%${sanitizeInput(materialItemCode)}%' OR
                l.material_packing ILIKE '%${sanitizedSearchTerm}%' OR
                l.material_packing ILIKE '%${sanitizeInput(materialPackingCode)}%' OR
                l.country ILIKE '%${sanitizedSearchTerm}%' OR
                l.country ILIKE '%${countryIsoCode}%' OR
                cl.country ILIKE '%${sanitizedSearchTerm}%' OR
                cl.country ILIKE '%${countryIsoCode}%' OR
                cl.location_name ILIKE '%${sanitizedSearchTerm}%' OR
                cl.city ILIKE '%${sanitizedSearchTerm}%' OR
                cl.address_line ILIKE '%${sanitizedSearchTerm}%' OR
                cl.street ILIKE '%${sanitizedSearchTerm}%' OR
                cl.postcode ILIKE '%${sanitizedSearchTerm}%' OR
                cl.state_province ILIKE '%${sanitizedSearchTerm}%'
            )`);
        }

        if (get(filter?.where, 'country')) {
            const country = get(filter?.where, 'country') as string | string[] | undefined;
            if (country) {
                const listingType = get(filter?.where, 'listingType') as ListingType;
                if (listingType === ListingType.SELL) {
                    needsCompanyLocationJoin = true;
                    // Handle both single country and array of countries
                    if (Array.isArray(country)) {
                        const countryConditions = country
                            .map((c) => {
                                const sanitizedCountry = sanitizeInput(c);
                                const isoCode = getCountryIsoCode(c);
                                return `(cl.country ILIKE '%${sanitizedCountry}%' OR cl.country ILIKE '%${isoCode}%')`;
                            })
                            .join(' OR ');
                        conditions.push(`(${countryConditions})`);
                    } else {
                        const sanitizedCountry = sanitizeInput(country);
                        const isoCode = getCountryIsoCode(country);
                        conditions.push(
                            `(cl.country ILIKE '%${sanitizedCountry}%' OR cl.country ILIKE '%${isoCode}%')`,
                        );
                    }
                } else {
                    // Handle both single country and array of countries
                    if (Array.isArray(country)) {
                        const countryConditions = country
                            .map((c) => {
                                const sanitizedCountry = sanitizeInput(c);
                                const isoCode = getCountryIsoCode(c);
                                return `(l.country ILIKE '%${sanitizedCountry}%' OR l.country ILIKE '%${isoCode}%')`;
                            })
                            .join(' OR ');
                        conditions.push(`(${countryConditions})`);
                    } else {
                        const sanitizedCountry = sanitizeInput(country);
                        const isoCode = getCountryIsoCode(country);
                        conditions.push(`(l.country ILIKE '%${sanitizedCountry}%' OR l.country ILIKE '%${isoCode}%')`);
                    }
                }
            }
        }

        if (get(filter?.where, 'materialType')) {
            const materialType = get(filter?.where, 'materialType') as string | string[] | undefined;
            if (materialType) {
                if (Array.isArray(materialType)) {
                    const typeList = materialType.map((t) => `'${sanitizeInput(t)}'`).join(',');
                    conditions.push(`l.material_type IN (${typeList})`);
                } else {
                    conditions.push(`l.material_type = '${sanitizeInput(materialType)}'`);
                }
            }
        }

        if (get(filter?.where, 'materialItem')) {
            const materialItem = get(filter?.where, 'materialItem') as string | string[] | undefined;
            if (materialItem) {
                if (Array.isArray(materialItem)) {
                    const itemList = materialItem.map((item) => `'${sanitizeInput(item)}'`).join(',');
                    conditions.push(`l.material_item IN (${itemList})`);
                } else {
                    conditions.push(`l.material_item = '${sanitizeInput(materialItem)}'`);
                }
            }
        }

        if (get(filter?.where, 'materialPacking')) {
            const materialPacking = get(filter?.where, 'materialPacking') as string | string[] | undefined;
            if (materialPacking) {
                if (Array.isArray(materialPacking)) {
                    const packingList = materialPacking.map((packing) => `'${sanitizeInput(packing)}'`).join(',');
                    conditions.push(`l.material_packing IN (${packingList})`);
                } else {
                    conditions.push(`l.material_packing = '${sanitizeInput(materialPacking)}'`);
                }
            }
        }

        if (get(filter?.where, 'listingType')) {
            const listingType = get(filter?.where, 'listingType');
            conditions.push(`l.listing_type = '${listingType}'`);
        }

        // Handle status filter (including neq operations) - this takes priority over showFullfilledListing
        const hasExplicitStatusFilter = get(filter?.where, 'status');
        if (hasExplicitStatusFilter) {
            const statusFilter = get(filter?.where, 'status');

            if (typeof statusFilter === 'string') {
                // Simple string filter: "status": "available"
                conditions.push(`l.status = '${statusFilter}'`);
            } else if (typeof statusFilter === 'object' && statusFilter !== null) {
                // Object filter: "status": {"neq": "sold"}

                const filterObj = statusFilter as any;
                if (filterObj.neq) {
                    conditions.push(`l.status != '${filterObj.neq}'`);
                }
                if (filterObj.eq) {
                    conditions.push(`l.status = '${filterObj.eq}'`);
                }
                if (filterObj.in && Array.isArray(filterObj.in)) {
                    const statusList = filterObj.in.map((s: string) => `'${s}'`).join(',');
                    conditions.push(`l.status IN (${statusList})`);
                }
                if (filterObj.nin && Array.isArray(filterObj.nin)) {
                    const statusList = filterObj.nin.map((s: string) => `'${s}'`).join(',');
                    conditions.push(`l.status NOT IN (${statusList})`);
                }
            }
        }

        // Filter by wantedStatus for wanted listings at database level
        const wantedStatusFilter = get(filter?.where, 'wantedStatus') as string | string[] | undefined;
        if (wantedStatusFilter) {
            const statusArray = Array.isArray(wantedStatusFilter) ? wantedStatusFilter : [wantedStatusFilter];
            const statusConditions = generateWantedStatusSqlConditions(statusArray);

            // Only apply this filter to wanted listings
            conditions.push(
                `(l.listing_type != 'wanted' OR (l.listing_type = 'wanted' AND (${statusConditions.join(' OR ')})))`,
            );
        }

        // Security: Only show approved listings to public, but owners can see their own pending listings
        if (userId) {
            // Owner can see all their own listings (including pending)
            // No additional status/state filter needed as userId filter is already applied above
        } else {
            // Public users can only see approved listings
            // For sell listings: state = 'approved' AND status = 'available' ( AND l.status = '${ListingStatus.AVAILABLE}' )
            // For wanted listings: state = 'approved' OR state = 'active' (both are considered approved for wanted)
            conditions.push(`(
                (l.listing_type = '${ListingType.SELL}' AND l.state = '${ListingState.APPROVED}') OR
                (l.listing_type = '${ListingType.WANTED}' AND l.state IN ('${ListingState.APPROVED}', 'active'))
            )`);
        }

        // Only apply showFullfilledListing logic if no explicit status filter is provided
        if (!hasExplicitStatusFilter) {
            const showFullfilledListing = get(filter?.where, 'showFullfilledListing');
            if (showFullfilledListing === true) {
                // Show all listings including sold ones (but still respect the security filter above)
                if (userId) {
                    conditions.push(
                        `l.status IN ('${ListingStatus.SOLD}', '${ListingStatus.PENDING}','${ListingStatus.AVAILABLE}')`,
                    );
                } else {
                    // For public, add sold to the approved listings
                    conditions[conditions.length - 1] = `(
                        (l.listing_type = '${ListingType.SELL}' AND l.state = '${ListingState.APPROVED}' AND l.status IN ('${ListingStatus.AVAILABLE}', '${ListingStatus.SOLD}')) OR
                        (l.listing_type = '${ListingType.WANTED}' AND l.state IN ('${ListingState.APPROVED}', 'active'))
                    )`;
                }
            } else {
                // Exclude sold listings by default (when showFullfilledListing is false or not set)
                if (userId) {
                    conditions.push(`l.status IN ('${ListingStatus.PENDING}', '${ListingStatus.AVAILABLE}')`);
                } else {
                    // For public, exclude sold from the approved listings
                    conditions[conditions.length - 1] = `(
                        (l.listing_type = '${ListingType.SELL}' AND l.state = '${ListingState.APPROVED}' AND l.status != '${ListingStatus.SOLD}') OR
                        (l.listing_type = '${ListingType.WANTED}' AND l.state IN ('${ListingState.APPROVED}', 'active'))
                    )`;
                }
            }
        }

        const wasteStoration = get(filter?.where, 'wasteStoration', null);
        if (wasteStoration !== null) {
            if (wasteStoration === WasteStoration.INDOOR) {
                conditions.push(`l.waste_storation IN ('${WasteStoration.INDOOR}', '${WasteStoration.BOTH}')`);
            } else if (wasteStoration === WasteStoration.OUTDOOR) {
                conditions.push(`l.waste_storation IN ('${WasteStoration.OUTDOOR}', '${WasteStoration.BOTH}')`);
            }
        }

        // Handle indoor/outdoor filters from the request
        const indoor = get(filter?.where, 'indoor', null) as boolean[] | boolean | null;
        const outdoor = get(filter?.where, 'outdoor', null) as boolean[] | boolean | null;

        if (indoor !== null || outdoor !== null) {
            const indoorEnabled = Array.isArray(indoor) ? indoor.includes(true) : indoor === true;
            const outdoorEnabled = Array.isArray(outdoor) ? outdoor.includes(true) : outdoor === true;

            if (indoorEnabled && outdoorEnabled) {
                // Both indoor and outdoor are enabled, show all
                // No additional filter needed
            } else if (indoorEnabled) {
                // Only indoor
                conditions.push(`l.waste_storation IN ('${WasteStoration.INDOOR}', '${WasteStoration.BOTH}')`);
            } else if (outdoorEnabled) {
                // Only outdoor
                conditions.push(`l.waste_storation IN ('${WasteStoration.OUTDOOR}', '${WasteStoration.BOTH}')`);
            }
        }

        const sortBy = get(filter?.where, 'sortBy', null);
        // Handle sortBy as array (frontend sends ["availableListingsAsc"]) or string
        const sortByValue = Array.isArray(sortBy) ? sortBy[0] : sortBy;
        let orderByClause = 'ORDER BY l.created_at DESC';

        if (sortByValue) {
            switch (sortByValue) {
                case ListingSortBy.CREATED_AT_ASC:
                    orderByClause = 'ORDER BY l.created_at ASC NULLS LAST';
                    break;
                case ListingSortBy.CREATED_AT_DESC:
                    orderByClause = 'ORDER BY l.created_at DESC NULLS LAST';
                    break;
                case ListingSortBy.MATERIAL_PACKING_ASC:
                    orderByClause = 'ORDER BY l.material_packing ASC NULLS LAST, l.created_at ASC';
                    break;
                case ListingSortBy.MATERIAL_PACKING_DESC:
                    orderByClause = 'ORDER BY l.material_packing DESC NULLS LAST, l.created_at DESC';
                    break;
                case ListingSortBy.MATERIAL_ITEM_ASC:
                    orderByClause = 'ORDER BY l.material_item ASC NULLS LAST, l.created_at ASC';
                    break;
                case ListingSortBy.MATERIAL_ITEM_DESC:
                    orderByClause = 'ORDER BY l.material_item DESC NULLS LAST, l.created_at DESC';
                    break;
                case ListingSortBy.MATERIAL_TYPE_ASC:
                    orderByClause = 'ORDER BY l.material_type ASC NULLS LAST, l.created_at ASC';
                    break;
                case ListingSortBy.MATERIAL_TYPE_DESC:
                    orderByClause = 'ORDER BY l.material_type DESC NULLS LAST, l.created_at DESC';
                    break;
                case ListingSortBy.COUNTRY_ASC:
                    needsCompanyLocationJoin = true;
                    orderByClause = `ORDER BY
                        CASE
                            WHEN l.listing_type = '${ListingType.SELL}' THEN cl.country
                            ELSE l.country
                        END ASC NULLS LAST,
                        l.created_at ASC`;
                    break;
                case ListingSortBy.COUNTRY_DESC:
                    needsCompanyLocationJoin = true;
                    orderByClause = `ORDER BY
                        CASE
                            WHEN l.listing_type = '${ListingType.SELL}' THEN cl.country
                            ELSE l.country
                        END DESC NULLS LAST,
                        l.created_at DESC`;
                    break;
                case ListingSortBy.AVAILABLE_LISTINGS_ASC:
                    orderByClause = `ORDER BY
                        CASE
                            WHEN l.status = '${ListingStatus.PENDING}' THEN 1
                            WHEN l.status = '${ListingStatus.AVAILABLE}' AND (l.remaining_quantity IS NOT NULL AND l.remaining_quantity < l.quantity) THEN 2
                            WHEN l.status = '${ListingStatus.AVAILABLE}' THEN 3
                            WHEN l.status = '${ListingStatus.EXPIRED}' THEN 4
                            WHEN l.status = '${ListingStatus.SOLD}' THEN 5
                            WHEN l.status = '${ListingStatus.REJECTED}' THEN 6
                            ELSE 7
                        END ASC,
                        CASE
                            WHEN l.end_date IS NOT NULL THEN l.end_date
                            ELSE l.created_at
                        END DESC NULLS LAST,
                        l.id ASC`;
                    break;
                case ListingSortBy.AVAILABLE_LISTINGS_DESC:
                    orderByClause = `ORDER BY
                        CASE
                            WHEN l.status = '${ListingStatus.SOLD}' THEN 1
                            WHEN l.status = '${ListingStatus.EXPIRED}' THEN 2
                            WHEN l.status = '${ListingStatus.REJECTED}' THEN 3
                            WHEN l.status = '${ListingStatus.AVAILABLE}' AND (l.remaining_quantity IS NULL OR l.remaining_quantity >= l.quantity) THEN 4
                            WHEN l.status = '${ListingStatus.AVAILABLE}' THEN 5
                            WHEN l.status = '${ListingStatus.PENDING}' THEN 6
                            ELSE 7
                        END ASC,
                        CASE
                            WHEN l.end_date IS NOT NULL THEN l.end_date
                            ELSE l.created_at
                        END ASC NULLS LAST,
                        l.id ASC`;
                    break;
                default:
                    // Default fallback for any unrecognized sort values
                    orderByClause = 'ORDER BY l.created_at DESC NULLS LAST';
                    break;
            }
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Build the JOIN clause for company_locations if needed
        const companyLocationJoin = needsCompanyLocationJoin
            ? 'LEFT JOIN company_locations cl ON l.location_id = cl.id'
            : '';

        const listingsQuery = `
            SELECT
                l.id,
                l.company_id as "companyId",
                l.location_id as "locationId",
                l.created_by_user_id as "createdByUserId",
                l.material_type as "materialType",
                l.material_item as "materialItem",
                l.material_form as "materialForm",
                l.material_grading as "materialGrading",
                l.material_color as "materialColor",
                l.material_finishing as "materialFinishing",
                l.material_packing as "materialPacking",
                l.listing_type as "listingType",
                l.title,
                l.description,
                l.quantity,
                l.remaining_quantity as "remainingQuantity",
                l.material_flow_index as "materialFlowIndex",
                l.material_weight_per_unit as "materialWeightPerUnit",
                l.material_remain_in_country as "materialRemainInCountry",
                l.currency,
                l.additional_notes as "additionalNotes",
                l.start_date as "startDate",
                l.end_date as "endDate",
                l.status,
                l.state,
                l.is_featured as "isFeatured",
                l.is_urgent as "isUrgent",
                l.capacity_per_month as "capacityPerMonth",
                l.material_weight_wanted as "materialWeightWanted",
                l.waste_storation as "wasteStoration",
                l.renewal_period as "listingRenewalPeriod",
                l.listing_duration as "listingDuration",
                l.view_count as "viewCount",
                l.rejection_reason as "rejectionReason",
                l.message,
                l.price_per_metric_tonne as "pricePerMetricTonne",
                l.location_other as "locationOther",
                l.created_at as "createdAt",
                l.updated_at as "updatedAt",
                CASE
                    WHEN l.listing_type = '${ListingType.SELL}' THEN cl.country
                    ELSE l.country
                END as country,
                -- Enhanced location details
                cl.location_name as "locationName",
                cl.site_point_contact as "sitePointContact",
                cl.phone_number as "locationPhoneNumber",
                cl.address_line as "addressLine",
                cl.street,
                cl.postcode,
                cl.city as "locationCity",
                cl.country as "locationCountry",
                cl.state_province as "stateProvince",
                cl.office_open_time as "officeOpenTime",
                cl.office_close_time as "officeCloseTime",
                cl.loading_ramp as "loadingRamp",
                cl.weighbridge,
                cl.self_load_unload_capability as "selfLoadUnLoadCapability",
                cl.container_type as "containerType",
                cl.accepted_materials as "acceptedMaterials",
                cl.site_specific_instructions as "siteSpecificInstructions",
                cl.access_restrictions as "accessRestrictions",
                cl.other_material as "otherMaterial",
                cl.main_location as "mainLocation",
                -- Check if listing has pending or approved offers
                -- ACCEPTED offers block editing regardless of state
                CASE
                    WHEN EXISTS (
                        SELECT 1 FROM offers o
                        WHERE o.listing_id = l.id
                        AND (
                            ((o.status = 'pending' OR o.status = 'approved') AND o.state != 'closed')
                            OR o.status = 'accepted'
                        )
                    ) THEN true
                    ELSE false
                END as "hasPendingOffer",
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', ld.id,
                        'documentType', ld.document_type,
                        'documentUrl', ld.document_url,
                        'listingId', ld.listing_id
                    )
                ) FILTER (WHERE ld.id IS NOT NULL) as documents
            FROM listings l
            LEFT JOIN listing_documents ld ON l.id = ld.listing_id
            LEFT JOIN company_locations cl ON l.location_id = cl.id
            ${whereClause}
            GROUP BY l.id, cl.country, cl.location_name, cl.site_point_contact, cl.phone_number, cl.address_line, cl.street, cl.postcode, cl.city, cl.state_province, cl.office_open_time, cl.office_close_time, cl.loading_ramp, cl.weighbridge, cl.self_load_unload_capability, cl.container_type, cl.accepted_materials, cl.site_specific_instructions, cl.access_restrictions, cl.other_material, cl.main_location
            ${orderByClause}
            LIMIT ${limit}
            OFFSET ${skip}
        `;

        const countQuery = `
            SELECT COUNT(DISTINCT l.id) as count
            FROM listings l
            ${companyLocationJoin}
            ${whereClause}
        `;

        const [listings, countResult] = await Promise.all([
            this.listingRepository.dataSource.execute(listingsQuery),
            this.listingRepository.dataSource.execute(countQuery),
        ]);

        // Add wantedStatus for wanted listings to show material requirement status

        const processedListings = await Promise.all(
            listings.map(async (listing: any) => {
                // Convert currency for listing data if applicable
                const convertedListing =
                    listing.pricePerMetricTonne && listing.currency
                        ? await this.exchangeRateService.convertListingToBaseCurrency({
                              pricePerMetricTonne: Number(listing.pricePerMetricTonne),
                              currency: listing.currency,
                          })
                        : listing;

                // Build location details if available
                const locationDetails =
                    listing.locationId && listing.locationName
                        ? {
                              address: {
                                  addressLine: listing.addressLine,
                                  street: listing.street,
                                  postcode: listing.postcode,
                                  city: listing.locationCity,
                                  country: listing.locationCountry,
                                  stateProvince: listing.stateProvince,
                              },
                          }
                        : null;

                // Add expiry information for active listings
                let expiryInfo = undefined;
                if (listing.status === ListingStatus.AVAILABLE || listing.status === ListingStatus.PENDING) {
                    // Create a Listings object from the raw listing data
                    const listingObj = {
                        ...listing,
                        createdAt: listing.createdAt,
                        endDate: listing.endDate,
                    } as Listings;
                    expiryInfo = this.listingExpiryService.calculateExpiryInfo(listingObj);
                }

                if (listing.listingType === ListingType.WANTED) {
                    return {
                        ...listing,
                        ...convertedListing,
                        locationDetails, // Add location details for wanted listings too
                        expiryInfo, // Add expiry information
                        wantedStatus: getMaterialRequirementStatus(
                            listing.status,
                            listing.state,
                            listing.startDate,
                            listing.rejectionReason,
                        ),
                    };
                }
                return {
                    ...listing,
                    ...convertedListing,
                    locationDetails, // Add location details for sell listings
                    expiryInfo, // Add expiry information
                };
            }),
        );

        return {
            totalCount: countResult[0].count,
            results: processedListings as ListingWithDocuments[],
        };
    }

    public async getListingById(id: number, userId?: number, isAdmin?: boolean): Promise<IDataResponse> {
        // For wanted listings, use enhanced query to get comprehensive information
        const listing = await this.listingRepository.findById(id);
        if (!listing) {
            throw new HttpErrors[404](messages.listingNotFound);
        }

        // Check visibility rules for pending/rejected listings
        // Admins can view all listings, bypass restrictions
        if (!isAdmin) {
            if (listing.state === ListingState.PENDING || listing.status === ListingStatus.PENDING) {
                // Only owner can see their own pending listings
                if (!userId || listing.createdByUserId !== userId) {
                    throw new HttpErrors[403]('You do not have permission to view this listing');
                }
            }

            if (listing.state === ListingState.REJECTED) {
                // Only owner can see their own rejected listings
                if (!userId || listing.createdByUserId !== userId) {
                    throw new HttpErrors[403]('You do not have permission to view this listing');
                }
            }
        }

        const documents = await this.listingDocumentsRepository.find({
            where: { listingId: listing.id },
        });

        // Check if listing has pending, approved, or accepted offers
        // For ACCEPTED offers, we don't check state because accepted offers should always block editing
        const pendingOffersCount = await this.offersRepository.count({
            listingId: id,
            or: [
                { status: OfferStatusEnum.PENDING, state: { neq: OfferState.CLOSED } },
                { status: OfferStatusEnum.APPROVED, state: { neq: OfferState.CLOSED } },
                { status: OfferStatusEnum.ACCEPTED }, // ACCEPTED offers block editing regardless of state
            ],
        });
        const hasPendingOffer = pendingOffersCount.count > 0;

        // Convert currency for listing data if applicable
        const convertedListing =
            listing.pricePerMetricTonne && listing.currency
                ? await this.exchangeRateService.convertListingToBaseCurrency({
                      pricePerMetricTonne: Number(listing.pricePerMetricTonne),
                      currency: listing.currency,
                  })
                : {};

        // Add wantedStatus for wanted listings to show material requirement status
        const processedListing =
            listing.listingType === ListingType.WANTED
                ? {
                      ...listing,
                      ...convertedListing,
                      wantedStatus: getMaterialRequirementStatus(
                          listing.status || 'available',
                          listing.state || 'active',
                          listing.startDate || null,
                          listing.rejectionReason || null,
                      ),
                  }
                : {
                      ...listing,
                      ...convertedListing,
                  };

        const listingWithDocuments = {
            ...processedListing,
            documents,
        };

        // Add expiry information for active listings
        let expiryInfo = undefined;
        if (listing.status === ListingStatus.AVAILABLE || listing.status === ListingStatus.PENDING) {
            expiryInfo = this.listingExpiryService.calculateExpiryInfo(listing);
        }

        const company = await this.companyRepository.findById(listing.companyId);

        if (!company) {
            throw new HttpErrors[404](messages.companyNotFound);
        }

        // For wanted listings, get comprehensive buyer and storage details
        if (listing.listingType === ListingType.WANTED) {
            let user = null;
            try {
                user = await this.userRepository.findById(listing.createdByUserId);
            } catch (error) {
                // User may have been deleted, continue without user details
            }
            let location = null;
            if (listing.locationId) {
                try {
                    location = await this.companyLocationsRepository.findById(listing.locationId);
                } catch (error) {
                    // If location is not found, continue without location details
                    location = null;
                }
            }

            return {
                status: 'success',
                data: {
                    listing: {
                        ...listingWithDocuments,
                        expiryInfo,
                        hasPendingOffer,
                    },
                    company,
                    // Enhanced buyer details for wanted listings
                    buyerDetails: {
                        companyName: company.name,
                        companyEmail: company.email,
                        companyPhone: company.phoneNumber,
                        companyMobile: company.mobileNumber,
                        companyWebsite: company.website,
                        companyDescription: company.description,
                        vatNumber: company.vatNumber,
                        registrationNumber: company.registrationNumber,
                        companyType: company.companyType,
                        companyInterest: company.companyInterest,
                        isBuyer: company.isBuyer,
                        isSeller: company.isSeller,
                        isHaulier: company.isHaulier,
                        favoriteMaterials: company.favoriteMaterials,
                        containerTypes: company.containerTypes,
                        areasCovered: company.areasCovered,
                        address: {
                            addressLine1: company.addressLine1,
                            addressLine2: company.addressLine2,
                            city: company.city,
                            country: company.country,
                            stateProvince: company.stateProvince,
                            postalCode: company.postalCode,
                        },
                        contactPerson: user
                            ? {
                                  fullName: `${user.firstName} ${user.lastName}`,
                                  firstName: user.firstName,
                                  lastName: user.lastName,
                                  email: user.email,
                                  username: user.username,
                                  phoneNumber: user.phoneNumber,
                              }
                            : null,
                    },
                    // Enhanced material information for wanted listings
                    materialInformation: {
                        materialName: listing.materialItem,
                        materialType: listing.materialType,
                        materialForm: listing.materialForm,
                        materialGrading: listing.materialGrading,
                        materialColor: listing.materialColor,
                        materialFinishing: listing.materialFinishing,
                        materialPacking: listing.materialPacking,
                        materialFlowIndex: listing.materialFlowIndex,
                        materialWeightPerUnit: listing.materialWeightPerUnit,
                        materialRemainInCountry: listing.materialRemainInCountry,
                        country: listing.country,
                        currency: listing.currency,
                        packaging: listing.materialPacking,
                        capacityPerMonth: listing.capacityPerMonth,
                        materialWeightWanted: listing.materialWeightWanted,
                        quantity: listing.quantity,
                        remainingQuantity: listing.remainingQuantity,
                        wasteStoration: listing.wasteStoration,
                        pricePerMetricTonne: listing.pricePerMetricTonne,
                    },
                    // Enhanced storage details for wanted listings
                    storageDetails: location
                        ? {
                              locationName: location.locationName,
                              sitePointContact: location.sitePointContact,
                              phoneNumber: location.phoneNumber,
                              address: {
                                  addressLine: location.addressLine,
                                  street: location.street,
                                  postcode: location.postcode,
                                  city: location.city,
                                  country: location.country,
                                  stateProvince: location.stateProvince,
                              },
                              operatingHours: {
                                  openTime: location.officeOpenTime,
                                  closeTime: location.officeCloseTime,
                              },
                              facilities: {
                                  loadingRamp: location.loadingRamp,
                                  weighbridge: location.weighbridge,
                                  selfLoadUnloadCapability: location.selfLoadUnLoadCapability,
                              },
                              containerTypes: location.containerType,
                              acceptedMaterials: location.acceptedMaterials,
                              siteSpecificInstructions: location.siteSpecificInstructions,
                              accessRestrictions: location.accessRestrictions,
                              otherMaterial: location.otherMaterial,
                              isMainLocation: location.mainLocation,
                          }
                        : null,
                },
                message: messages.listingRetrievedSuccessfully,
            };
        }

        // For sell listings, return standard response with location information
        let location = null;
        if (listing.locationId) {
            try {
                location = await this.companyLocationsRepository.findById(listing.locationId);
            } catch (error) {
                // If location is not found, continue without location details
                location = null;
            }
        }

        // Get user information for sell listings
        let user = null;
        try {
            user = await this.userRepository.findById(listing.createdByUserId);
        } catch (error) {
            // User may have been deleted, continue without user details
        }

        return {
            status: 'success',
            data: {
                listing: {
                    ...listingWithDocuments,
                    expiryInfo,
                    hasPendingOffer,
                },
                company: {
                    verifiedAt: company.verifiedAt,
                },
                // Include user information for sell listings
                createdBy: user
                    ? {
                          user: {
                              username: user.username,
                          },
                      }
                    : null,
                // Include location information for sell listings
                locationDetails: location
                    ? {
                          address: {
                              addressLine: location.addressLine,
                              street: location.street,
                              postcode: location.postcode,
                              city: location.city,
                              country: location.country,
                              stateProvince: location.stateProvince,
                          },
                      }
                    : null,
            },
            message: messages.listingRetrievedSuccessfully,
        };
    }

    public async getAdminListings({
        filter,
        listingType,
    }: {
        filter?: Filter<Listings>;
        listingType?: ListingType;
    }): Promise<PaginationList<ListingWithDetails>> {
        const skip: number | null = get(filter, 'skip', 0);
        const limit: number | null = get(filter, 'limit', 20);

        const searchTerm = get(filter?.where, 'searchTerm', null) as string | null;

        const conditions = [];

        if (searchTerm) {
            const tokens = searchTerm
                .split(/\s+/)
                .map((t) => sanitizeInput(t))
                .filter((t) => t && t.trim() !== '');

            const tokenGroups = tokens.map((token) => {
                const countryIsoCodes = getAllMatchingCountryIsoCodes(token);
                const materialTypeCode = getMaterialCode(token, 'type');
                const materialItemCode = getMaterialCode(token, 'item');
                const materialPackingCode = getMaterialCode(token, 'packing');

                // Build country search conditions for all matching ISO codes
                const countryIsoConditions = countryIsoCodes.length > 0
                    ? countryIsoCodes.map(code => sanitizeInput(code)).join("','")
                    : '';

                const sellLocationGroup =
                    listingType === ListingType.SELL
                        ? `cl.country ILIKE '%${token}%' ${countryIsoConditions ? `OR cl.country IN ('${countryIsoConditions}')` : ''} OR cl.location_name ILIKE '%${token}%' OR cl.city ILIKE '%${token}%' OR cl.address_line ILIKE '%${token}%' OR cl.street ILIKE '%${token}%' OR cl.postcode ILIKE '%${token}%' OR cl.state_province ILIKE '%${token}%'`
                        : `l.country ILIKE '%${token}%' ${countryIsoConditions ? `OR l.country IN ('${countryIsoConditions}')` : ''} OR cl.country ILIKE '%${token}%' ${countryIsoConditions ? `OR cl.country IN ('${countryIsoConditions}')` : ''} OR cl.location_name ILIKE '%${token}%' OR cl.city ILIKE '%${token}%' OR cl.address_line ILIKE '%${token}%' OR cl.street ILIKE '%${token}%' OR cl.postcode ILIKE '%${token}%' OR cl.state_province ILIKE '%${token}%'`;

                return `(
                    l.material_type ILIKE '%${token}%' OR
                    l.material_type ILIKE '%${sanitizeInput(materialTypeCode)}%' OR
                    l.material_item ILIKE '%${token}%' OR
                    l.material_item ILIKE '%${sanitizeInput(materialItemCode)}%' OR
                    l.material_form ILIKE '%${token}%' OR
                    l.material_grading ILIKE '%${token}%' OR
                    l.material_color ILIKE '%${token}%' OR
                    l.material_finishing ILIKE '%${token}%' OR
                    l.material_packing ILIKE '%${token}%' OR
                    l.material_packing ILIKE '%${sanitizeInput(materialPackingCode)}%' OR
                    CONCAT_WS(' ', l.material_type, l.material_item, l.material_form, l.material_grading, l.material_color, l.material_finishing, l.material_packing) ILIKE '%${token}%' OR
                    l.title ILIKE '%${token}%' OR
                    l.description ILIKE '%${token}%' OR
                    l.additional_notes ILIKE '%${token}%' OR
                    c.name ILIKE '%${token}%' OR
                    c.id::text ILIKE '%${token}%' OR
                    u.id::text ILIKE '%${token}%' OR
                    u.first_name ILIKE '%${token}%' OR
                    u.last_name ILIKE '%${token}%' OR
                    CONCAT(u.first_name, ' ', u.last_name) ILIKE '%${token}%' OR
                    u.email ILIKE '%${token}%' OR
                    ${sellLocationGroup}
                )`;
            });

            if (tokenGroups.length > 0) {
                conditions.push(`(${tokenGroups.join(' AND ')})`);
            }
        }

        if (get(filter?.where, 'dateRequireFrom')) {
            conditions.push(`l.start_date >= '${get(filter?.where, 'dateRequireFrom')}'`);
        }
        if (get(filter?.where, 'dateRequireTo')) {
            conditions.push(`l.start_date <= '${get(filter?.where, 'dateRequireTo')}'`);
        }

        if (get(filter?.where, 'materialType')) {
            const materialType = get(filter?.where, 'materialType') as string | string[] | undefined;
            if (materialType) {
                if (Array.isArray(materialType)) {
                    const typeList = materialType.map((t) => `'${sanitizeInput(t)}'`).join(',');
                    conditions.push(`l.material_type IN (${typeList})`);
                } else {
                    conditions.push(`l.material_type = '${sanitizeInput(materialType)}'`);
                }
            }
        }

        if (get(filter?.where, 'company')) {
            const company = get(filter?.where, 'company') as string | undefined;
            if (company) {
                conditions.push(`c.name ILIKE '%${company}%'`);
            }
        }

        if (get(filter?.where, 'country')) {
            const country = get(filter?.where, 'country') as string | string[] | undefined;
            if (country) {
                if (listingType === ListingType.SELL) {
                    // Handle both single country and array of countries
                    if (Array.isArray(country)) {
                        const countryConditions = country
                            .map((c) => {
                                const sanitizedCountry = sanitizeInput(c);
                                const isoCode = getCountryIsoCode(c);
                                return `(cl.country ILIKE '%${sanitizedCountry}%' OR cl.country ILIKE '%${isoCode}%')`;
                            })
                            .join(' OR ');
                        conditions.push(`(${countryConditions})`);
                    } else {
                        const sanitizedCountry = sanitizeInput(country);
                        const isoCode = getCountryIsoCode(country);
                        conditions.push(
                            `(cl.country ILIKE '%${sanitizedCountry}%' OR cl.country ILIKE '%${isoCode}%')`,
                        );
                    }
                } else {
                    // Handle both single country and array of countries
                    if (Array.isArray(country)) {
                        const countryConditions = country
                            .map((c) => {
                                const sanitizedCountry = sanitizeInput(c);
                                const isoCode = getCountryIsoCode(c);
                                return `(l.country ILIKE '%${sanitizedCountry}%' OR l.country ILIKE '%${isoCode}%')`;
                            })
                            .join(' OR ');
                        conditions.push(`(${countryConditions})`);
                    } else {
                        const sanitizedCountry = sanitizeInput(country);
                        const isoCode = getCountryIsoCode(country);
                        conditions.push(`(l.country ILIKE '%${sanitizedCountry}%' OR l.country ILIKE '%${isoCode}%')`);
                    }
                }
            }
        }

        const name = get(filter?.where, 'name', null) as string | null;
        if (name) {
            conditions.push(`(
                u.first_name ILIKE '%${name}%'
                OR u.last_name ILIKE '%${name}%'
                OR CONCAT(u.first_name, ' ', u.last_name) ILIKE '%${name}%'
            )`);
        }

        // Handle status filter (including neq operations) - reuse same logic as getListings
        const hasExplicitStatusFilter = get(filter?.where, 'status');
        if (hasExplicitStatusFilter) {
            const statusFilter = get(filter?.where, 'status');

            if (typeof statusFilter === 'string') {
                // Simple string filter: "status": "available"
                conditions.push(`l.status = '${statusFilter}'`);
            } else if (typeof statusFilter === 'object' && statusFilter !== null) {
                // Object filter: "status": {"neq": "sold"}

                const filterObj = statusFilter as any;
                if (filterObj.neq) {
                    conditions.push(`l.status != '${filterObj.neq}'`);
                }
                if (filterObj.eq) {
                    conditions.push(`l.status = '${filterObj.eq}'`);
                }
                if (filterObj.in && Array.isArray(filterObj.in)) {
                    const statusList = filterObj.in.map((s: string) => `'${s}'`).join(',');
                    conditions.push(`l.status IN (${statusList})`);
                }
                if (filterObj.nin && Array.isArray(filterObj.nin)) {
                    const statusList = filterObj.nin.map((s: string) => `'${s}'`).join(',');
                    conditions.push(`l.status NOT IN (${statusList})`);
                }
            }
        }

        // Handle state filter (including neq operations) - same logic as status
        const hasExplicitStateFilter = get(filter?.where, 'state');
        if (hasExplicitStateFilter) {
            const stateFilter = get(filter?.where, 'state');

            if (typeof stateFilter === 'string') {
                // Simple string filter: "state": "approved"
                conditions.push(`l.state = '${stateFilter}'`);
            } else if (typeof stateFilter === 'object' && stateFilter !== null) {
                // Object filter: "state": {"neq": "rejected"}

                const filterObj = stateFilter as any;
                if (filterObj.neq) {
                    conditions.push(`l.state != '${filterObj.neq}'`);
                }
                if (filterObj.eq) {
                    conditions.push(`l.state = '${filterObj.eq}'`);
                }
                if (filterObj.in && Array.isArray(filterObj.in)) {
                    const stateList = filterObj.in.map((s: string) => `'${s}'`).join(',');
                    conditions.push(`l.state IN (${stateList})`);
                }
                if (filterObj.nin && Array.isArray(filterObj.nin)) {
                    const stateList = filterObj.nin.map((s: string) => `'${s}'`).join(',');
                    conditions.push(`l.state NOT IN (${stateList})`);
                }
            }
        }

        if (listingType) {
            conditions.push(`l.listing_type = '${listingType}'`);
        }

        // Filter by wantedStatus for wanted listings at database level
        const wantedStatusFilterAdmin = get(filter?.where, 'wantedStatus') as string | string[] | undefined;
        if (wantedStatusFilterAdmin && listingType === ListingType.WANTED) {
            const statusArray = Array.isArray(wantedStatusFilterAdmin)
                ? wantedStatusFilterAdmin
                : [wantedStatusFilterAdmin];
            const statusConditions = generateWantedStatusSqlConditions(statusArray);

            conditions.push(`(${statusConditions.join(' OR ')})`);
        }

        const sortBy = get(filter?.where, 'sortBy');
        // Handle sortBy as array (frontend sends ["availableListingsAsc"]) or string
        const sortByValue = Array.isArray(sortBy) ? sortBy[0] : sortBy;
        let orderByClause = `ORDER BY
                        CASE
                            WHEN l.status = '${ListingStatus.PENDING}' THEN 1
                            WHEN l.status = '${ListingStatus.AVAILABLE}' AND (l.remaining_quantity IS NOT NULL AND l.remaining_quantity < l.quantity) THEN 2
                            WHEN l.status = '${ListingStatus.AVAILABLE}' THEN 3
                            WHEN l.status = '${ListingStatus.EXPIRED}' THEN 4
                            WHEN l.status = '${ListingStatus.SOLD}' THEN 5
                            WHEN l.status = '${ListingStatus.REJECTED}' THEN 6
                            ELSE 7
                        END ASC,
                        l.created_at DESC NULLS LAST,
                        l.id DESC`;

        if (sortByValue) {
            switch (sortByValue) {
                case ListingSortBy.CREATED_AT_ASC:
                    orderByClause = 'ORDER BY l.created_at ASC NULLS LAST';
                    break;
                case ListingSortBy.CREATED_AT_DESC:
                    orderByClause = 'ORDER BY l.created_at DESC NULLS LAST';
                    break;
                case ListingSortBy.COMPANY_NAME_ASC:
                    orderByClause = 'ORDER BY c.name ASC NULLS LAST, l.created_at ASC';
                    break;
                case ListingSortBy.COMPANY_NAME_DESC:
                    orderByClause = 'ORDER BY c.name DESC NULLS LAST, l.created_at DESC';
                    break;
                case ListingSortBy.MATERIAL_TYPE_ASC:
                    orderByClause = 'ORDER BY l.material_type ASC NULLS LAST, l.created_at ASC';
                    break;
                case ListingSortBy.MATERIAL_TYPE_DESC:
                    orderByClause = 'ORDER BY l.material_type DESC NULLS LAST, l.created_at DESC';
                    break;
                case ListingSortBy.COUNTRY_ASC:
                    if (listingType === ListingType.SELL) {
                        orderByClause = `ORDER BY cl.country ASC NULLS LAST, l.created_at ASC`;
                    } else {
                        orderByClause = `ORDER BY l.country ASC NULLS LAST, l.created_at ASC`;
                    }
                    break;
                case ListingSortBy.COUNTRY_DESC:
                    if (listingType === ListingType.SELL) {
                        orderByClause = `ORDER BY cl.country DESC NULLS LAST, l.created_at DESC`;
                    } else {
                        orderByClause = `ORDER BY l.country DESC NULLS LAST, l.created_at DESC`;
                    }
                    break;
                case ListingSortBy.STATUS_ASC:
                    orderByClause = 'ORDER BY l.status ASC NULLS LAST, l.created_at ASC';
                    break;
                case ListingSortBy.STATUS_DESC:
                    orderByClause = 'ORDER BY l.status DESC NULLS LAST, l.created_at DESC';
                    break;
                case ListingSortBy.STATE_ASC:
                    orderByClause = 'ORDER BY l.state ASC NULLS LAST, l.created_at ASC';
                    break;
                case ListingSortBy.STATE_DESC:
                    orderByClause = 'ORDER BY l.state DESC NULLS LAST, l.created_at DESC';
                    break;
                case ListingSortBy.AVAILABLE_LISTINGS_ASC:
                    orderByClause = `ORDER BY
                        CASE
                            WHEN l.status = '${ListingStatus.PENDING}' THEN 1
                            WHEN l.status = '${ListingStatus.AVAILABLE}' AND (l.remaining_quantity IS NOT NULL AND l.remaining_quantity < l.quantity) THEN 2
                            WHEN l.status = '${ListingStatus.AVAILABLE}' THEN 3
                            WHEN l.status = '${ListingStatus.EXPIRED}' THEN 4
                            WHEN l.status = '${ListingStatus.SOLD}' THEN 5
                            WHEN l.status = '${ListingStatus.REJECTED}' THEN 6
                            ELSE 7
                        END ASC,
                        CASE
                            WHEN l.end_date IS NOT NULL THEN l.end_date
                            ELSE l.created_at
                        END DESC NULLS LAST,
                        l.id ASC`;
                    break;
                case ListingSortBy.AVAILABLE_LISTINGS_DESC:
                    orderByClause = `ORDER BY
                        CASE
                            WHEN l.status = '${ListingStatus.SOLD}' THEN 1
                            WHEN l.status = '${ListingStatus.EXPIRED}' THEN 2
                            WHEN l.status = '${ListingStatus.REJECTED}' THEN 3
                            WHEN l.status = '${ListingStatus.AVAILABLE}' AND (l.remaining_quantity IS NULL OR l.remaining_quantity >= l.quantity) THEN 4
                            WHEN l.status = '${ListingStatus.AVAILABLE}' THEN 5
                            WHEN l.status = '${ListingStatus.PENDING}' THEN 6
                            ELSE 7
                        END ASC,
                        CASE
                            WHEN l.end_date IS NOT NULL THEN l.end_date
                            ELSE l.created_at
                        END ASC NULLS LAST,
                        l.id ASC`;
                    break;
                default:
                    // Default fallback: availability priority then newest first
                    break;
            }
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        /**
         * IMPORTANT: Location Mapping for Sell vs Wanted Listings
         *
         * The location field has different meanings depending on listing type:
         *
         * SELL LISTINGS:
         * - Location represents the seller's warehouse/pickup location
         * - Uses listings.location_id to join company_locations table
         * - This is the physical location where material is available for pickup
         *
         * WANTED LISTINGS:
         * - Location represents the buyer's company main office/headquarters
         * - Uses company's main_location flag to join company_locations table
         * - Does NOT use listings.location_id (which is always null for wanted listings)
         * - Query must select cl.id as company_main_location_id for the location ID
         *
         * WHY THIS MATTERS:
         * - listings.location_id is NULL for all wanted listings in the database
         * - Buyer location comes from the company's main location, not the listing itself
         * - The "Required In" country field (listings.country) is separate from buyer location
         *
         * RESPONSE MAPPING:
         * - For sell listings: location.id = row.location_id
         * - For wanted listings: location.id = row.company_main_location_id
         * - Use: row.company_main_location_id || row.location_id || null
         *
         * See functional requirements: Section 6.4.1.7 - View Wanted Listings Table
         */
        const baseQuery = `
            SELECT
                l.*,
                l.location_id as "locationId",
                l.admin_note,
                l.assign_admin,
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.username,
                c.id as company_id,
                c.name as company_name,
                aa.id as "assignedAdminId",
                aa.first_name as "assignedAdminFirstName",
                aa.last_name as "assignedAdminLastName",
                aa.email as "assignedAdminEmail",
                aa.global_role as "assignedAdminGlobalRole",
                EXISTS (
                    SELECT 1
                    FROM admin_notes an
                    WHERE an.record_id = l.id
                      AND an.record_type = CASE WHEN l.listing_type = 'wanted' THEN 'wanted_listing' ELSE 'listing' END
                      AND an.note_text <> ''
                ) as has_notes
        `;

        const sellTypeQuery = `
            ${baseQuery},
            cl.location_name,
            cl.country as location_country,
            cl.city as location_city,
            cl.address_line as location_address_line,
            cl.street as location_street,
            cl.postcode as location_postcode,
            cl.state_province as location_state_province,
            COUNT(o.id) FILTER (WHERE (o.state = 'active' AND o.status = 'approved') OR
                                     (o.state = 'closed' AND o.status = 'accepted') OR
                                     (o.state = 'closed' AND o.status = 'rejected' AND o.rejection_source = 'seller') OR
                                     (o.state = 'closed' AND o.status = 'rejected' AND o.rejection_source = 'system')) as number_of_offers,
            (SELECT o2.offered_price_per_unit FROM offers o2 WHERE o2.listing_id = l.id
                AND ((o2.state = 'active' AND o2.status = 'approved') OR
                     (o2.state = 'closed' AND o2.status = 'accepted') OR
                     (o2.state = 'closed' AND o2.status = 'rejected' AND o2.rejection_source = 'seller') OR
                     (o2.state = 'closed' AND o2.status = 'rejected' AND o2.rejection_source = 'system'))
                ORDER BY
                    CASE
                        WHEN LOWER(o2.currency) = 'gbp' THEN o2.offered_price_per_unit
                        WHEN LOWER(o2.currency) = 'usd' THEN o2.offered_price_per_unit / 1.27
                        WHEN LOWER(o2.currency) = 'eur' THEN o2.offered_price_per_unit / 1.17
                        ELSE o2.offered_price_per_unit
                    END DESC
                LIMIT 1) as best_offer,
            (SELECT o2.currency FROM offers o2 WHERE o2.listing_id = l.id
                AND ((o2.state = 'active' AND o2.status = 'approved') OR
                     (o2.state = 'closed' AND o2.status = 'accepted') OR
                     (o2.state = 'closed' AND o2.status = 'rejected' AND o2.rejection_source = 'seller') OR
                     (o2.state = 'closed' AND o2.status = 'rejected' AND o2.rejection_source = 'system'))
                ORDER BY
                    CASE
                        WHEN LOWER(o2.currency) = 'gbp' THEN o2.offered_price_per_unit
                        WHEN LOWER(o2.currency) = 'usd' THEN o2.offered_price_per_unit / 1.27
                        WHEN LOWER(o2.currency) = 'eur' THEN o2.offered_price_per_unit / 1.17
                        ELSE o2.offered_price_per_unit
                    END DESC
                LIMIT 1) as best_offer_currency
            FROM listings l
            LEFT JOIN users u ON l.created_by_user_id = u.id
            LEFT JOIN companies c ON l.company_id = c.id
            LEFT JOIN company_locations cl ON l.location_id = cl.id
            LEFT JOIN offers o ON l.id = o.listing_id
            LEFT JOIN users aa ON (l.assign_admin->>'assignedAdminId')::int = aa.id
        `;

        // WANTED LISTINGS: Join buyer's company MAIN LOCATION (not listings.location_id which is always null)
        const wantedTypeQuery = `
            ${baseQuery},
            cl.id as company_main_location_id,  /* CRITICAL: Buyer's main company location ID */
            cl.location_name,
            cl.country as location_country,
            cl.city as location_city,
            cl.address_line as location_address_line,
            cl.street as location_street,
            cl.postcode as location_postcode,
            cl.state_province as location_state_province,
            NULL as number_of_offers,
            NULL as best_offer,
            NULL as best_offer_currency
            FROM listings l
            LEFT JOIN users u ON l.created_by_user_id = u.id
            LEFT JOIN companies c ON l.company_id = c.id
            LEFT JOIN company_locations cl ON c.id = cl.company_id AND cl.main_location = true  /* Join buyer's main location */
            LEFT JOIN users aa ON (l.assign_admin->>'assignedAdminId')::int = aa.id
        `;

        const groupByClause = `
            GROUP BY
                l.id,
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.username,
                c.id,
                c.name,
                cl.id,
                cl.location_name,
                cl.country,
                cl.city,
                cl.address_line,
                cl.street,
                cl.postcode,
                cl.state_province,
                aa.id,
                aa.first_name,
                aa.last_name,
                aa.email,
                aa.global_role
        `;

        const query = `
            ${listingType === ListingType.SELL ? sellTypeQuery : wantedTypeQuery}
            ${whereClause}
            ${groupByClause}
            ${orderByClause}
            LIMIT ${limit}
            OFFSET ${skip}
        `;

        const countQuery = `
            SELECT COUNT(DISTINCT l.id) as total
            FROM listings l
            LEFT JOIN users u ON l.created_by_user_id = u.id
            LEFT JOIN companies c ON l.company_id = c.id
            ${
                listingType === ListingType.SELL
                    ? 'LEFT JOIN company_locations cl ON l.location_id = cl.id LEFT JOIN offers o ON l.id = o.listing_id'
                    : 'LEFT JOIN company_locations cl ON c.id = cl.company_id AND cl.main_location = true'
            }
            LEFT JOIN users aa ON (l.assign_admin->>'assignedAdminId')::int = aa.id
            ${whereClause}
        `;

        // const countQuery = `
        //     SELECT COUNT(*) as count
        //     FROM listings l
        //     ${whereClause}
        // `;

        const [listings, countResult] = await Promise.all([
            this.listingRepository.dataSource.execute(query),
            this.listingRepository.dataSource.execute(countQuery),
        ]);

        const listingsWithDetails = await Promise.all(
            listings.map(async (row: any) => {
                const {
                    number_of_offers,
                    best_offer,
                    best_offer_currency,
                    has_notes,
                    price_per_metric_tonne,
                    ...restRow
                } = row;

                // Convert currency for listing data if applicable
                const convertedListing =
                    price_per_metric_tonne && row.currency
                        ? await this.exchangeRateService.convertListingToBaseCurrency({
                              pricePerMetricTonne: Number(price_per_metric_tonne),
                              currency: row.currency,
                          })
                        : {};

                const assignAdminData = row.assign_admin
                    ? typeof row.assign_admin === 'string'
                        ? JSON.parse(row.assign_admin)
                        : row.assign_admin
                    : null;

                const assignAdmin = assignAdminData
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

                const baseResult = {
                    ...restRow,
                    ...convertedListing,
                    numberOfOffers: parseInt(number_of_offers) || 0,
                    bestOffer: best_offer,
                    bestOfferCurrency: best_offer_currency,
                    adminNote: row.admin_note
                        ? typeof row.admin_note === 'string'
                            ? JSON.parse(row.admin_note)
                            : row.admin_note
                        : null,
                    assignAdmin,
                    hasNotes: has_notes === true,
                    createdBy: {
                        user: {
                            id: row.user_id,
                            firstName: row.first_name,
                            lastName: row.last_name,
                            email: row.email,
                            username: row.username,
                        },
                        company: {
                            id: row.company_id,
                            name: row.company_name,
                        },
                        // Location mapping: company_main_location_id for wanted listings, location_id for sell listings
                        location: row.location_name
                            ? {
                                  id: row.company_main_location_id || row.location_id || null, // Use company main location ID for wanted, listing location ID for sell
                                  locationName: row.location_name,
                                  country: row.location_country,
                                  city: row.location_city,
                                  addressLine: row.location_address_line,
                                  street: row.location_street,
                                  postcode: row.location_postcode,
                                  stateProvince: row.location_state_province,
                              }
                            : null,
                    },
                };

                // Add wantedStatus for wanted listings to show material requirement status
                if (listingType === ListingType.WANTED) {
                    return {
                        ...baseResult,
                        wantedStatus: getMaterialRequirementStatus(
                            row.status,
                            row.state,
                            row.start_date,
                            row.rejection_reason,
                        ),
                    };
                }

                return baseResult;
            }),
        );

        return {
            totalCount: countResult[0].total,
            results: listingsWithDetails as ListingWithDetails[],
        };
    }

    public async deleteListing(id: number, userId: string): Promise<void> {
        const listing = await this.listingRepository.findById(id);
        if (!listing) {
            throw new HttpErrors[404](messages.listingNotFound);
        }
        if (listing.createdByUserId !== Number(userId)) {
            throw new HttpErrors[403](messages.forbidden);
        }

        // Cannot delete SOLD listings
        if (listing.status === ListingStatus.SOLD) {
            throw new HttpErrors[400]('Cannot delete a listing that has been marked as sold.');
        }

        // Check for accepted offers that prevent listing deletion
        const acceptedOffers = await this.offersRepository.find({
            where: {
                listingId: id,
                status: OfferStatusEnum.ACCEPTED,
            },
        });

        if (acceptedOffers.length > 0) {
            throw new HttpErrors[400](messages.cannotDeleteListingWithApprovedOffers);
        }

        // Check for pending or approved offers that prevent listing deletion
        const pendingOffersCount = await this.offersRepository.count({
            listingId: id,
            or: [{ status: OfferStatusEnum.PENDING }, { status: OfferStatusEnum.APPROVED }],
            state: { neq: OfferState.CLOSED },
        });

        if (pendingOffersCount.count > 0) {
            throw new HttpErrors[400](
                'Cannot delete listing with pending or approved offers. Please reject or accept all offers before deleting the listing.',
            );
        }

        // Delete related records first (cascade deletion)
        await Promise.all([
            // Delete all listing documents for this listing
            this.listingDocumentsRepository.deleteAll({ listingId: id }),
        ]);

        // Delete other related records using raw SQL for better performance
        const dataSource = this.listingRepository.dataSource;
        await Promise.all([
            dataSource.execute('DELETE FROM listing_requests WHERE listing_id = $1', [id]),
            // Note: We don't delete offers as they contain rejection history
            // Note: We don't delete transactions as they are permanent records
        ]);

        // Finally delete the listing itself
        await this.listingRepository.deleteById(id);
    }

    // Update/Edit a listing
    public async updateListing(
        id: number,
        userId: number,
        data: Partial<CreateListing>,
        currentUserProfile?: any,
    ): Promise<IDataResponse> {
        // Fetch the listing
        const existingListing = await this.listingRepository.findById(id);
        if (!existingListing) {
            throw new HttpErrors[404](messages.listingNotFound);
        }

        // Check ownership (allow admins to edit)
        const isAdmin = AuthHelper.isAdmin(currentUserProfile?.globalRole);
        if (existingListing.createdByUserId !== userId && !isAdmin) {
            throw new HttpErrors[403](messages.forbidden);
        }

        // Pending listings cannot be edited
        if (existingListing.status === ListingStatus.PENDING || existingListing.state === ListingState.PENDING) {
            throw new HttpErrors[400](messages.listingNotAvailable);
        }

        // Sold/Expired listings cannot be edited
        if (existingListing.status === ListingStatus.SOLD) {
            throw new HttpErrors[400](messages.listingAlreadySold);
        }

        if (existingListing.status === ListingStatus.EXPIRED) {
            throw new HttpErrors[400](messages.listingNotAvailable);
        }

        // Check for offers - cannot edit if there are any offers
        const offerCount = await this.offersRepository.count({ listingId: id });
        if (offerCount.count > 0) {
            throw new HttpErrors[400](messages.cannotEditListingWithOffers);
        }

        // Extract documents from data if present
        const { documents, ...listingData } = data as any;

        // Validate the update data
        if (listingData.materialType) {
            this.validateMaterialTypeAndProperties(data as CreateListing);
        }
        if (listingData.additionalNotes) {
            this.validateAdditionalNotes(listingData.additionalNotes);
        }

        // Sanitize numeric fields
        const sanitizeNumber = (value: any): number | undefined => {
            if (value === null || value === undefined || value === '') return undefined;
            const num = Number(value);
            return isNaN(num) ? undefined : num;
        };

        const sanitizedData: any = {
            ...listingData,
        };

        // Sanitize numeric fields if they exist in the update
        if (listingData.locationId !== undefined) sanitizedData.locationId = sanitizeNumber(listingData.locationId);
        if (listingData.quantity !== undefined) {
            sanitizedData.quantity = sanitizeNumber(listingData.quantity);
            sanitizedData.remainingQuantity = sanitizeNumber(listingData.quantity);
        }
        if (listingData.pricePerMetricTonne !== undefined)
            sanitizedData.pricePerMetricTonne = sanitizeNumber(listingData.pricePerMetricTonne);
        if (listingData.materialWeightPerUnit !== undefined)
            sanitizedData.materialWeightPerUnit = sanitizeNumber(listingData.materialWeightPerUnit);
        if (listingData.materialWeightWanted !== undefined)
            sanitizedData.materialWeightWanted = sanitizeNumber(listingData.materialWeightWanted);
        if (listingData.capacityPerMonth !== undefined)
            sanitizedData.capacityPerMonth = sanitizeNumber(listingData.capacityPerMonth);

        // Phase 2: Sanitize and recalculate totalWeight and weightPerLoad
        if (listingData.numberOfLoads !== undefined)
            sanitizedData.numberOfLoads = sanitizeNumber(listingData.numberOfLoads);
        if (listingData.totalWeight !== undefined) sanitizedData.totalWeight = sanitizeNumber(listingData.totalWeight);
        if (listingData.weightPerLoad !== undefined)
            sanitizedData.weightPerLoad = sanitizeNumber(listingData.weightPerLoad);
        if (listingData.materialWeight !== undefined)
            sanitizedData.materialWeight = sanitizeNumber(listingData.materialWeight);

        // Recalculate weightPerLoad if totalWeight or numberOfLoads changed
        const finalTotalWeight = sanitizedData.totalWeight ?? existingListing.totalWeight;
        const finalNumberOfLoads = sanitizedData.numberOfLoads ?? existingListing.numberOfLoads;

        if (finalTotalWeight && finalNumberOfLoads && !sanitizedData.weightPerLoad) {
            sanitizedData.weightPerLoad = Number((finalTotalWeight / finalNumberOfLoads).toFixed(3));
        }

        // Handle endDate - Phase 2: Apply 90-day default logic
        if (listingData.endDate) {
            sanitizedData.endDate = new Date(listingData.endDate);
        } else if (listingData.listingDuration) {
            // Backward compatibility
            sanitizedData.endDate = new Date(listingData.listingDuration);
        } else if (listingData.listingRenewalPeriod !== undefined) {
            // If renewal period is being updated
            if (!listingData.listingRenewalPeriod) {
                // Changed from ongoing to non-ongoing: set 90-day default
                const startDate = listingData.startDate
                    ? new Date(listingData.startDate)
                    : existingListing.startDate
                      ? new Date(existingListing.startDate)
                      : new Date();
                const newEndDate = new Date(startDate);
                newEndDate.setDate(newEndDate.getDate() + 90);
                sanitizedData.endDate = newEndDate;
            } else {
                // Changed to ongoing: clear endDate
                sanitizedData.endDate = null;
            }
        }

        // When editing, set status back to pending for admin approval
        sanitizedData.status = ListingStatus.PENDING;
        sanitizedData.state = ListingState.PENDING;

        // Update the listing
        await this.listingRepository.updateById(id, sanitizedData);

        // Handle document updates if provided
        if (documents && Array.isArray(documents)) {
            // Delete existing documents
            await this.listingDocumentsRepository.deleteAll({ listingId: id });
            // Create new documents
            await this.createListingDocuments(documents, id);
        }

        // Fetch updated listing
        const updatedListing = await this.listingRepository.findById(id);

        // Trigger Salesforce sync after successful listing update (fire-and-forget)
        if (this.salesforceSyncService && updatedListing?.id) {
            const syncFn = updatedListing.listingType === ListingType.WANTED
                ? this.salesforceSyncService.syncWantedListing(updatedListing.id, true, false, 'updateListing')
                : this.salesforceSyncService.syncListing(updatedListing.id, true, false, 'updateListing');
            syncFn.catch((syncError) => {
                SalesforceLogger.error('Sync failed after listing update', syncError, { entity: 'Listing', listingId: updatedListing.id, listingType: updatedListing.listingType, action: 'update' });
            });
        }

        return {
            status: 'success',
            message: messages.listingRetrievedSuccessfully,
            data: {
                listing: updatedListing,
            },
        };
    }

    // Renew a listing by extending its expiry date
    public async renewListing(
        id: number,
        userId: number,
        renewalPeriod: '2_weeks' | '90_days',
    ): Promise<IDataResponse> {
        // Fetch the listing
        const listing = await this.listingRepository.findById(id);
        if (!listing) {
            throw new HttpErrors[404](messages.listingNotFound);
        }

        // Check ownership
        if (listing.createdByUserId !== userId) {
            throw new HttpErrors[403](messages.forbidden);
        }

        // Check if listing can be renewed
        // Cannot renew if sold
        if (listing.status === ListingStatus.SOLD) {
            throw new HttpErrors[400](messages.listingAlreadySold);
        }

        // Cannot renew if rejected
        if (listing.state === ListingState.REJECTED) {
            throw new HttpErrors[400](messages.listingAlreadyRejected);
        }

        // Ongoing listings should not use manual renewal
        if (listing.listingRenewalPeriod) {
            throw new HttpErrors[400](messages.invalidListingRenewalPeriod);
        }

        // Check if listing is expired or about to expire (within 7 days)
        const expiryInfo = this.listingExpiryService.calculateExpiryInfo(listing);
        if (!expiryInfo.isExpired && !expiryInfo.isNearingExpiry) {
            throw new HttpErrors[400](messages.listingNotEligibleForRenewal);
        }

        // Calculate new end date
        const now = new Date();
        const currentEndDate = listing.endDate ? new Date(listing.endDate) : now;
        const baseDate = currentEndDate > now ? currentEndDate : now;

        const daysToAdd = renewalPeriod === '2_weeks' ? 14 : 90;
        const newEndDate = new Date(baseDate);
        newEndDate.setDate(newEndDate.getDate() + daysToAdd);

        // Update listing
        const updateData: Partial<Listings> = {
            endDate: newEndDate,
            updatedAt: new Date(),
        };

        // If listing was expired, set status back to available
        if (listing.status === ListingStatus.EXPIRED) {
            updateData.status = ListingStatus.AVAILABLE;
        }

        await this.listingRepository.updateById(id, updateData);

        // Fetch updated listing and user
        let user = null;
        const updatedListing = await this.listingRepository.findById(id);
        try {
            user = await this.userRepository.findById(listing.createdByUserId, {
                fields: { id: true, firstName: true, lastName: true, email: true },
            });
        } catch (error) {
            // User may have been deleted, continue without sending email
        }

        const renewalTasks: Promise<unknown>[] = [
            this.wasteTradeNotificationsService.createNotification(
                listing.createdByUserId,
                NotificationType.LISTING_RENEWED,
                {
                    listingId: listing.id!,
                    listingType: listing.listingType,
                    listingTitle: ListingHelper.getListingTitle(listing),
                    newEndDate: newEndDate.toISOString(),
                    isManual: true,
                },
            ),
        ];
        if (user) {
            renewalTasks.push(this.emailService.sendListingRenewedEmail(user, ListingHelper.getListingTitle(listing), true));
        }
        await Promise.all(renewalTasks);

        return {
            status: 'success',
            message: messages.listingRetrievedSuccessfully,
            data: {
                listing: updatedListing,
                newEndDate: newEndDate.toISOString(),
            },
        };
    }

    public async markListingAsSold(id: number, userId: number): Promise<IDataResponse> {
        // Fetch the listing
        const listing = await this.listingRepository.findById(id);
        if (!listing) {
            throw new HttpErrors[404](messages.listingNotFound);
        }

        // Check ownership
        if (listing.createdByUserId !== userId) {
            throw new HttpErrors[403](messages.forbidden);
        }

        // Check if listing is already sold
        if (listing.status === ListingStatus.SOLD) {
            throw new HttpErrors[400](messages.listingAlreadySold);
        }

        // Check if listing can be marked as sold (must be approved and available)
        if (listing.state !== ListingState.APPROVED) {
            throw new HttpErrors[400](messages.cannotMarkListingAsSoldNotApproved);
        }

        if (listing.status !== ListingStatus.AVAILABLE) {
            throw new HttpErrors[400](messages.listingNotAvailable);
        }

        // Update listing status to sold and force remaining quantities to 0
        const isOngoing = !!listing.listingRenewalPeriod;
        const updateData: Partial<typeof listing> = {
            status: ListingStatus.SOLD,
            remainingQuantity: 0,
        };
        if (isOngoing) {
            // If endDate exists and is in the future, keep it (already a valid reset date from previous cycle)
            // Otherwise calculate: startDate + renewalPeriod (first time)
            const now = new Date();
            if (!listing.endDate || new Date(listing.endDate) <= now) {
                const baseDate = listing.startDate ? new Date(listing.startDate) : now;
                const periodDays: Record<string, number> = {
                    [RenewalPeriod.WEEKLY]: 7,
                    [RenewalPeriod.FORTNIGHTLY]: 14,
                    [RenewalPeriod.MONTHLY]: 30,
                };
                const days = periodDays[listing.listingRenewalPeriod!] ?? 7;
                const resetDate = new Date(baseDate);
                resetDate.setDate(resetDate.getDate() + days);
                updateData.endDate = resetDate;
            }
        } else {
            updateData.numberOfLoads = 0;
        }
        await this.listingRepository.updateById(id, updateData);

        // Reject all pending offers for this listing
        const pendingOffers = await this.offersRepository.find({
            where: {
                listingId: id,
                or: [
                    { status: OfferStatusEnum.PENDING },
                    { status: OfferStatusEnum.APPROVED },
                    { state: OfferState.ACTIVE },
                ],
            },
        });

        if (pendingOffers.length > 0) {
            for (const offer of pendingOffers) {
                await this.offersRepository.updateById(offer.id, {
                    status: OfferStatusEnum.REJECTED,
                    state: OfferState.CLOSED,
                    rejectionReason: 'Listing marked as sold',
                    rejectionSource: 'seller',
                });
            }
        }

        // Fetch updated listing
        const updatedListing = await this.listingRepository.findById(id);

        // Trigger Salesforce sync after marking as sold (fire-and-forget)
        if (this.salesforceSyncService && updatedListing?.id) {
            const syncFn = updatedListing.listingType === ListingType.WANTED
                ? this.salesforceSyncService.syncWantedListing(updatedListing.id, true, false, 'markAsSold')
                : this.salesforceSyncService.syncListing(updatedListing.id, true, false, 'markAsSold');
            syncFn.catch((syncError) => {
                SalesforceLogger.error('Sync failed after listing update', syncError, { entity: 'Listing', listingId: updatedListing.id, listingType: updatedListing.listingType, action: 'update' });
            });
        }

        return {
            status: 'success',
            message: messages.listingRetrievedSuccessfully,
            data: {
                listing: updatedListing,
            },
        };
    }

    public async getAdminListingById(id: number): Promise<IDataResponse> {
        const query = `
            SELECT
                l.id,
                l.company_id,
                l.location_id,
                l.created_by_user_id,
                l.material_type,
                l.material_item,
                l.material_form,
                l.material_grading,
                l.material_color,
                l.material_finishing,
                l.material_packing,
                l.listing_type,
                l.title,
                l.description,
                l.quantity,
                l.remaining_quantity,
                l.material_flow_index,
                l.material_weight_per_unit,
                l.material_remain_in_country,
                l.currency,
                l.additional_notes,
                l.start_date,
                l.end_date,
                l.status,
                l.state,
                l.is_featured,
                l.is_urgent,
                l.capacity_per_month,
                l.material_weight_wanted,
                l.waste_storation,
                l.renewal_period,
                l.listing_duration,
                l.view_count,
                l.rejection_reason,
                l.message,
                l.price_per_metric_tonne,
                l.location_other,
                l.created_at,
                l.updated_at,
                l.country,
                -- User information
                u.first_name,
                u.last_name,
                u.email as user_email,
                u.username,
                u.phone_number as user_phone,
                -- Company information (buyer details)
                c.name as company_name,
                c.email as company_email,
                c.phone_number as company_phone,
                c.mobile_number as company_mobile,
                c.website as company_website,
                c.description as company_description,
                c.vat_number as company_vat_number,
                c.registration_number as company_registration_number,
                c.address_line_1 as company_address_line_1,
                c.address_line_2 as company_address_line_2,
                c.city as company_city,
                c.country as company_country,
                c.state_province as company_state_province,
                c.postal_code as company_postal_code,
                c.company_type,
                c.company_interest,
                c.is_buyer,
                c.is_seller,
                c.is_haulier,
                c.favorite_materials,
                c.container_types as company_container_types,
                c.areas_covered,
                -- Buyer's main warehouse location (default location)
                buyer_loc.id as buyer_location_id,
                buyer_loc.location_name as buyer_location_name,
                buyer_loc.site_point_contact as buyer_site_contact,
                buyer_loc.phone_number as buyer_location_phone,
                buyer_loc.address_line as buyer_location_address,
                buyer_loc.street as buyer_location_street,
                buyer_loc.postcode as buyer_location_postcode,
                buyer_loc.city as buyer_location_city,
                buyer_loc.country as buyer_location_country,
                buyer_loc.state_province as buyer_location_state_province,
                buyer_loc.office_open_time as buyer_office_open_time,
                buyer_loc.office_close_time as buyer_office_close_time,
                buyer_loc.loading_ramp as buyer_loading_ramp,
                buyer_loc.weighbridge as buyer_weighbridge,
                buyer_loc.container_type as buyer_container_types,
                buyer_loc.accepted_materials as buyer_accepted_materials,
                buyer_loc.site_specific_instructions as buyer_site_instructions,
                buyer_loc.self_load_unload_capability as buyer_self_load_unload,
                buyer_loc.access_restrictions as buyer_access_restrictions,
                buyer_loc.other_material as buyer_other_material,
                buyer_loc.main_location as buyer_main_location,
                -- Company location information (storage details)
                cl.location_name,
                cl.site_point_contact,
                cl.phone_number as location_phone,
                cl.address_line as location_address,
                cl.street as location_street,
                cl.postcode as location_postcode,
                cl.city as location_city,
                cl.country as location_country,
                cl.state_province as location_state_province,
                cl.office_open_time,
                cl.office_close_time,
                cl.loading_ramp,
                cl.weighbridge,
                cl.container_type as location_container_types,
                cl.accepted_materials,
                cl.site_specific_instructions,
                cl.self_load_unload_capability,
                cl.access_restrictions,
                cl.other_material,
                cl.main_location,
                CASE
                    WHEN l.listing_type = 'sell' THEN cl.country
                    ELSE l.country
                END as location_country_resolved,
                -- Offer statistics
                COUNT(o.id) FILTER (WHERE (o.state = 'active' AND o.status = 'approved') OR
                                         (o.state = 'closed' AND o.status = 'accepted') OR
                                         (o.state = 'closed' AND o.status = 'rejected' AND o.rejection_source = 'seller') OR
                                         (o.state = 'closed' AND o.status = 'rejected' AND o.rejection_source = 'system')) as number_of_offers,
                (SELECT o2.offered_price_per_unit FROM offers o2 WHERE o2.listing_id = l.id
                    AND ((o2.state = 'active' AND o2.status = 'approved') OR
                         (o2.state = 'closed' AND o2.status = 'accepted') OR
                         (o2.state = 'closed' AND o2.status = 'rejected' AND o2.rejection_source = 'seller') OR
                         (o2.state = 'closed' AND o2.status = 'rejected' AND o2.rejection_source = 'system'))
                    ORDER BY
                        CASE
                            WHEN LOWER(o2.currency) = 'gbp' THEN o2.offered_price_per_unit
                            WHEN LOWER(o2.currency) = 'usd' THEN o2.offered_price_per_unit / 1.27
                            WHEN LOWER(o2.currency) = 'eur' THEN o2.offered_price_per_unit / 1.17
                            ELSE o2.offered_price_per_unit
                        END DESC
                    LIMIT 1) as best_offer,
                (SELECT o2.currency FROM offers o2 WHERE o2.listing_id = l.id
                    AND ((o2.state = 'active' AND o2.status = 'approved') OR
                         (o2.state = 'closed' AND o2.status = 'accepted') OR
                         (o2.state = 'closed' AND o2.status = 'rejected' AND o2.rejection_source = 'seller') OR
                         (o2.state = 'closed' AND o2.status = 'rejected' AND o2.rejection_source = 'system'))
                    ORDER BY
                        CASE
                            WHEN LOWER(o2.currency) = 'gbp' THEN o2.offered_price_per_unit
                            WHEN LOWER(o2.currency) = 'usd' THEN o2.offered_price_per_unit / 1.27
                            WHEN LOWER(o2.currency) = 'eur' THEN o2.offered_price_per_unit / 1.17
                            ELSE o2.offered_price_per_unit
                        END DESC
                    LIMIT 1) as best_offer_currency
            FROM listings l
            LEFT JOIN users u ON l.created_by_user_id = u.id
            LEFT JOIN companies c ON l.company_id = c.id
            LEFT JOIN company_locations cl ON l.location_id = cl.id
            LEFT JOIN company_locations buyer_loc ON buyer_loc.company_id = c.id AND buyer_loc.main_location = true
            LEFT JOIN offers o ON l.id = o.listing_id
            WHERE l.id = ${id}
            GROUP BY
                l.id,
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.username,
                u.phone_number,
                c.id,
                c.name,
                c.email,
                c.phone_number,
                c.mobile_number,
                c.website,
                c.description,
                c.vat_number,
                c.registration_number,
                c.address_line_1,
                c.address_line_2,
                c.city,
                c.country,
                c.state_province,
                c.postal_code,
                c.company_type,
                c.company_interest,
                c.is_buyer,
                c.is_seller,
                c.is_haulier,
                c.favorite_materials,
                c.container_types,
                c.areas_covered,
                cl.id,
                cl.location_name,
                cl.site_point_contact,
                cl.phone_number,
                cl.address_line,
                cl.street,
                cl.postcode,
                cl.city,
                cl.country,
                cl.state_province,
                cl.office_open_time,
                cl.office_close_time,
                cl.loading_ramp,
                cl.weighbridge,
                cl.container_type,
                cl.accepted_materials,
                cl.site_specific_instructions,
                cl.self_load_unload_capability,
                cl.access_restrictions,
                cl.other_material,
                cl.main_location,
                buyer_loc.id,
                buyer_loc.location_name,
                buyer_loc.site_point_contact,
                buyer_loc.phone_number,
                buyer_loc.address_line,
                buyer_loc.street,
                buyer_loc.postcode,
                buyer_loc.city,
                buyer_loc.country,
                buyer_loc.state_province,
                buyer_loc.office_open_time,
                buyer_loc.office_close_time,
                buyer_loc.loading_ramp,
                buyer_loc.weighbridge,
                buyer_loc.container_type,
                buyer_loc.accepted_materials,
                buyer_loc.site_specific_instructions,
                buyer_loc.self_load_unload_capability,
                buyer_loc.access_restrictions,
                buyer_loc.other_material,
                buyer_loc.main_location
        `;

        const result = await this.listingRepository.dataSource.execute(query);

        if (!result || result.length === 0) {
            throw new HttpErrors[404](messages.listingNotFound);
        }

        const listingData = result[0];

        // Fetch listing documents including feature image
        const documents = await this.listingDocumentsRepository.find({
            where: { listingId: id },
        });

        const featureImage = documents.find((doc) => doc.documentType === ListingImageType.FEATURE_IMAGE);

        // Add wantedStatus for wanted listings
        const listingWithWantedStatus =
            listingData.listing_type === ListingType.WANTED
                ? {
                      ...listingData,
                      wantedStatus: getMaterialRequirementStatus(
                          listingData.status,
                          listingData.state,
                          listingData.start_date,
                          listingData.rejection_reason,
                      ),
                  }
                : listingData;

        return {
            status: 'success',
            data: {
                listing: {
                    id: listingWithWantedStatus.id,
                    locationId: listingWithWantedStatus.location_id,
                    materialType: listingWithWantedStatus.material_type,
                    materialItem: listingWithWantedStatus.material_item,
                    materialGrading: listingWithWantedStatus.material_grading,
                    materialForm: listingWithWantedStatus.material_form,
                    materialPacking: listingWithWantedStatus.material_packing,
                    materialFlowIndex: listingWithWantedStatus.material_flow_index,
                    materialWeightWanted: listingWithWantedStatus.material_weight_wanted,
                    materialWeightPerUnit: listingWithWantedStatus.material_weight_per_unit,
                    quantity: listingWithWantedStatus.quantity,
                    remainingQuantity: listingWithWantedStatus.remaining_quantity,
                    capacityPerMonth: listingWithWantedStatus.capacity_per_month,
                    currency: listingWithWantedStatus.currency,
                    startDate: listingWithWantedStatus.start_date,
                    listingDuration: listingWithWantedStatus.listing_duration,
                    listingRenewalPeriod: listingWithWantedStatus.renewal_period,
                    additionalNotes: listingWithWantedStatus.additional_notes,
                    status: listingWithWantedStatus.status,
                    state: listingWithWantedStatus.state,
                    createdAt: listingWithWantedStatus.created_at,
                    updatedAt: listingWithWantedStatus.updated_at,
                    companyId: listingWithWantedStatus.company_id,
                    createdByUserId: listingWithWantedStatus.created_by_user_id,
                    listingType: listingWithWantedStatus.listing_type,
                    country: listingWithWantedStatus.location_country_resolved,
                    wasteStoration: listingWithWantedStatus.waste_storation,
                    wantedStatus: listingWithWantedStatus.wantedStatus,
                },
                documents: {
                    featureImage: featureImage?.documentUrl || null,
                    all: documents,
                },
                numberOfOffers: parseInt(listingData.number_of_offers) || 0,
                bestOffer: listingData.best_offer || null,
                bestOfferCurrency: listingData.best_offer_currency || null,
                userInformation: {
                    fullName: `${listingData.first_name} ${listingData.last_name}`,
                    firstName: listingData.first_name,
                    lastName: listingData.last_name,
                    email: listingData.user_email,
                    username: listingData.username,
                    phoneNumber: listingData.user_phone,
                    company: listingData.company_name,
                },
                // Enhanced buyer details
                buyerDetails: {
                    companyName: listingData.company_name,
                    companyEmail: listingData.company_email,
                    companyPhone: listingData.company_phone,
                    companyMobile: listingData.company_mobile,
                    locationId: listingData.location_id || null,
                    companyWebsite: listingData.company_website,
                    companyDescription: listingData.company_description,
                    vatNumber: listingData.company_vat_number,
                    registrationNumber: listingData.company_registration_number,
                    companyType: listingData.company_type,
                    companyInterest: listingData.company_interest,
                    isBuyer: listingData.is_buyer,
                    isSeller: listingData.is_seller,
                    isHaulier: listingData.is_haulier,
                    favoriteMaterials: listingData.favorite_materials,
                    containerTypes: listingData.company_container_types,
                    areasCovered: listingData.areas_covered,
                    address: {
                        addressLine1: listingData.company_address_line_1,
                        addressLine2: listingData.company_address_line_2,
                        city: listingData.company_city,
                        country: listingData.company_country,
                        stateProvince: listingData.company_state_province,
                        postalCode: listingData.company_postal_code,
                    },
                    contactPerson: {
                        fullName: `${listingData.first_name} ${listingData.last_name}`,
                        firstName: listingData.first_name,
                        lastName: listingData.last_name,
                        email: listingData.user_email,
                        username: listingData.username,
                        phoneNumber: listingData.user_phone,
                    },
                    location: listingData.buyer_location_id
                        ? {
                              id: listingData.buyer_location_id,
                              locationName: listingData.buyer_location_name,
                              sitePointContact: listingData.buyer_site_contact,
                              phoneNumber: listingData.buyer_location_phone,
                              addressLine: listingData.buyer_location_address,
                              street: listingData.buyer_location_street,
                              postcode: listingData.buyer_location_postcode,
                              city: listingData.buyer_location_city,
                              country: listingData.buyer_location_country,
                              stateProvince: listingData.buyer_location_state_province,
                              officeOpenTime: listingData.buyer_office_open_time,
                              officeCloseTime: listingData.buyer_office_close_time,
                              loadingRamp: listingData.buyer_loading_ramp,
                              weighbridge: listingData.buyer_weighbridge,
                              containerType: listingData.buyer_container_types,
                              acceptedMaterials: listingData.buyer_accepted_materials,
                              siteSpecificInstructions: listingData.buyer_site_instructions,
                              selfLoadUnloadCapability: listingData.buyer_self_load_unload,
                              accessRestrictions: listingData.buyer_access_restrictions,
                              otherMaterial: listingData.buyer_other_material,
                              isMainLocation: listingData.buyer_main_location,
                          }
                        : null,
                },
                // Enhanced material information
                materialInformation: {
                    materialName: listingData.material_item,
                    materialType: listingData.material_type,
                    materialForm: listingData.material_form,
                    materialGrading: listingData.material_grading,
                    materialColor: listingData.material_color,
                    materialFinishing: listingData.material_finishing,
                    materialPacking: listingData.material_packing,
                    materialFlowIndex: listingData.material_flow_index,
                    materialWeightPerUnit: listingData.material_weight_per_unit,
                    materialRemainInCountry: listingData.material_remain_in_country,
                    country: listingData.location_country_resolved,
                    currency: listingData.currency,
                    packaging: listingData.material_packing,
                    capacityPerMonth: listingData.capacity_per_month,
                    materialWeightWanted: listingData.material_weight_wanted,
                    quantity: listingData.quantity,
                    remainingQuantity: listingData.remaining_quantity,
                    wasteStoration: listingData.waste_storation,
                    pricePerMetricTonne: listingData.price_per_metric_tonne,
                },
                // Enhanced storage details
                storageDetails: listingData.location_id
                    ? {
                          locationName: listingData.location_name,
                          sitePointContact: listingData.site_point_contact,
                          phoneNumber: listingData.location_phone,
                          address: {
                              addressLine: listingData.location_address,
                              street: listingData.location_street,
                              postcode: listingData.location_postcode,
                              city: listingData.location_city,
                              country: listingData.location_country,
                              stateProvince: listingData.location_state_province,
                          },
                          operatingHours: {
                              openTime: listingData.office_open_time,
                              closeTime: listingData.office_close_time,
                          },
                          facilities: {
                              loadingRamp: listingData.loading_ramp,
                              weighbridge: listingData.weighbridge,
                              selfLoadUnloadCapability: listingData.self_load_unload_capability,
                          },
                          containerTypes: listingData.location_container_types,
                          acceptedMaterials: listingData.accepted_materials,
                          siteSpecificInstructions: listingData.site_specific_instructions,
                          accessRestrictions: listingData.access_restrictions,
                          otherMaterial: listingData.other_material,
                          isMainLocation: listingData.main_location,
                      }
                    : null,
                bidStatus: {
                    status: listingData.status,
                    state: listingData.state,
                },
            },
            message: messages.listingRetrievedSuccessfully,
        };
    }

    public async handleAdminRequestAction(
        id: number,
        requestAction: string,
        options: { rejectionReason?: string; message?: string } = {},
    ): Promise<void> {
        const listing = await this.listingRepository.findById(id);
        if (!listing) {
            throw new HttpErrors[404](messages.listingNotFound);
        }
        if (listing.status === ListingStatus.AVAILABLE) {
            throw new HttpErrors[400](messages.listingAlreadyAvailable);
        }

        if (listing.status === ListingStatus.REJECTED) {
            throw new HttpErrors[400](messages.listingAlreadyRejected);
        }

        if (listing.status === ListingStatus.SOLD) {
            throw new HttpErrors[400](messages.listingAlreadySold);
        }
        let user = null;
        try {
            user = await this.userRepository.findById(listing.createdByUserId);
        } catch (error) {
            // User may have been deleted, continue without user for emails
        }

        if (requestAction === ListingRequestActionEnum.ACCEPT) {
            const tasks: Promise<unknown>[] = [
                this.listingRepository.updateById(id, {
                    status: ListingStatus.AVAILABLE,
                    state: ListingState.APPROVED,
                }),
                this.wasteTradeNotificationsService.createNotification(
                    listing.createdByUserId,
                    NotificationType.LISTING_APPROVED,
                    {
                        listingId: listing.id!,
                        listingType: listing.listingType,
                        listingTitle: ListingHelper.getListingTitle(listing),
                    },
                ),
            ];
            await Promise.all(tasks);
        } else if (requestAction === ListingRequestActionEnum.REJECT) {
            const updateData: { status: ListingStatus; state: ListingState; rejectionReason?: string } = {
                status: ListingStatus.REJECTED,
                state: ListingState.REJECTED,
            };

            if (options.rejectionReason) {
                updateData.rejectionReason = options.rejectionReason;
            }

            const tasks: Promise<unknown>[] = [
                this.listingRepository.updateById(id, updateData),
                this.wasteTradeNotificationsService.createNotification(
                    listing.createdByUserId,
                    NotificationType.LISTING_REJECTED,
                    {
                        listingId: listing.id!,
                        listingType: listing.listingType,
                        listingTitle: ListingHelper.getListingTitle(listing),
                        rejectionReason: options.rejectionReason,
                    },
                ),
            ];
            // Only send rejection email if user still exists
            if (user) {
                tasks.push(this.emailService.sendListingRejectionEmail(listing, user, options.rejectionReason));
            }
            await Promise.all(tasks);
        } else if (requestAction === ListingRequestActionEnum.REQUEST_INFORMATION) {
            const updateData: { status: ListingStatus; state: ListingState; message?: string } = {
                status: ListingStatus.PENDING,
                state: ListingState.PENDING,
            };

            if (options.message) {
                updateData.message = options.message;
            }

            const tasks: Promise<unknown>[] = [
                this.listingRepository.updateById(id, updateData),
                this.wasteTradeNotificationsService.createNotification(
                    listing.createdByUserId,
                    NotificationType.LISTING_MORE_INFORMATION_REQUIRED,
                    {
                        listingId: listing.id!,
                        listingType: listing.listingType,
                        listingTitle: ListingHelper.getListingTitle(listing),
                    },
                ),
            ];
            // Only send request-info email if user still exists
            if (user) {
                tasks.push(this.emailService.sendListingRequestInformationEmail(listing, user, options.message));
            }
            await Promise.all(tasks);
        }

        const listingUpdated = await this.listingRepository.findById(id);

        // Trigger Salesforce sync after admin action (fire-and-forget)
        if (this.salesforceSyncService && listingUpdated?.id) {
            const syncFn = listingUpdated.listingType === ListingType.WANTED
                ? this.salesforceSyncService.syncWantedListing(listingUpdated.id, true, false, 'adminAction')
                : this.salesforceSyncService.syncListing(listingUpdated.id, true, false, 'adminAction');
            syncFn.catch((syncError) => {
                SalesforceLogger.error('Sync failed after admin listing action', syncError, { entity: 'Listing', listingId: listingUpdated.id, listingType: listingUpdated.listingType, action: 'admin_update' });
            });
        }

        if (user) {
            await this.emailService.sendListingStatusUpdatedEmail(listingUpdated, user);
        }
    }

    public async getListingUsersCompanies(listingType: ListingType): Promise<{
        companies: {
            id: number;
            name: string;
            country: string;
            firstName: string;
            lastName: string;
            username: string;
        }[];
    }> {
        const query = `
            WITH distinct_companies AS (
                SELECT DISTINCT
                    c.id,
                    c.name,
                    ${listingType === ListingType.SELL ? 'cl.country' : 'l.country'} as country
                FROM listings l
                JOIN companies c ON l.company_id = c.id
                ${listingType === ListingType.SELL ? 'LEFT JOIN company_locations cl ON l.location_id = cl.id' : ''}
                WHERE l.listing_type = '${listingType}'
            ),
            company_users AS (
                SELECT DISTINCT ON (dc.id)
                    dc.id,
                    dc.name,
                    dc.country,
                    u.first_name,
                    u.last_name,
                    u.username
                FROM distinct_companies dc
                JOIN listings l ON l.company_id = dc.id AND l.listing_type = '${listingType}'
                LEFT JOIN users u ON l.created_by_user_id = u.id
                ORDER BY dc.id, l.created_at DESC
            )
            SELECT
                id,
                name,
                first_name,
                last_name,
                username,
                country
            FROM company_users
            ORDER BY name
        `;

        const result = await this.listingRepository.dataSource.execute(query);

        return {
            companies: result || [],
        };
    }
}
