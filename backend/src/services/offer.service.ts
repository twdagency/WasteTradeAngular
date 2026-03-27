/* eslint-disable @typescript-eslint/no-explicit-any */
import { BindingScope, inject, injectable, service } from '@loopback/core';
import { Filter } from '@loopback/filter';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { get } from 'lodash';
import { MyUserProfile } from '../authentication-strategies/type';
import { messages } from '../constants';
import { AreaCovered, ECurrency, ListingStatus, ListingType, NotificationType, RenewalPeriod } from '../enum';
import { OfferRequestActionEnum, OfferSortBy, OfferState, OfferStatusEnum } from '../enum/offer.enum';
import { Companies, Listings, Offers } from '../models';
import { BiddingForm } from '../models/bidding-form.model';
import { SalesforceBindings } from '../keys/salesforce';
import {
    CompaniesRepository,
    CompanyLocationsRepository,
    CompanyUsersRepository,
    ListingDocumentsRepository,
    ListingsRepository,
    OffersRepository,
    UserRepository,
} from '../repositories';
import { OfferCompanies, OfferDetails } from '../types/offer';
import { getCountryIsoCode, getAllMatchingCountryIsoCodes } from '../utils/country-mapping';
import { getMaterialCode } from '../utils/material-mapping';
import { SalesforceLogger } from '../utils/salesforce/salesforce-sync.utils';
import { IDataResponse, PaginationList } from './../types/common';
import { EmailService } from './email.service';
import { ExchangeRateService } from './exchange-rate.service';
import { SalesforceSyncService } from './salesforce/salesforce-sync.service';
import { WasteTradeNotificationsService } from './waste-trade-notifications.service';
import { ListingHelper } from '../helpers';
import { UK_ISO_CODE } from '../constants/country';

@injectable({ scope: BindingScope.TRANSIENT })
export class OfferService {
    constructor(
        @repository(OffersRepository)
        public offersRepository: OffersRepository,
        @repository(ListingsRepository)
        public listingsRepository: ListingsRepository,
        @repository(CompaniesRepository)
        public companiesRepository: CompaniesRepository,
        @repository(UserRepository)
        public userRepository: UserRepository,
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,
        @repository(CompanyLocationsRepository)
        public companyLocationsRepository: CompanyLocationsRepository,
        @repository(ListingDocumentsRepository)
        public listingDocumentsRepository: ListingDocumentsRepository,

        @service(EmailService)
        public emailService: EmailService,
        @service(ExchangeRateService)
        public exchangeRateService: ExchangeRateService,
        @service(WasteTradeNotificationsService)
        public wasteTradeNotificationsService: WasteTradeNotificationsService,

        @inject(SalesforceBindings.SYNC_SERVICE, { optional: true })
        private salesforceSyncService?: SalesforceSyncService,
    ) {}

    public async getOfferById(
        id: number,
        loggedInUser: MyUserProfile,
        isAdmin?: boolean,
    ): Promise<IDataResponse<Partial<OfferDetails>>> {
        const { id: userId, companyId } = loggedInUser;
        const dsOffer = this.offersRepository.dataSource;
        const sql = `
            SELECT
                o.*,
                l.id AS "listing_id",
                l.title AS "listing_title",
                l.material_weight_per_unit AS "listing_material_weight_per_unit",
                l.material_weight_wanted AS "listing_material_weight_wanted",
                l.status AS "listing_status",
                l.state AS "listing_state",
                l.quantity AS "listing_quantity",
                l.remaining_quantity AS "listing_remaining_quantity",
                l.material_packing AS "listing_material_packing",
                l.material_type AS "listing_material_type",
                l.material_item AS "listing_material_item",
                l.material_finishing AS "listing_material_finishing",
                l.material_form AS "listing_material_form",
                l.location_id AS "listing_location_id",
                bc.id AS "buyer_company_id",
                bc.name AS "buyer_company_name",
                bc.country AS "buyer_company_country",
                bc.status AS "buyer_company_status",
                bc.address_line_1 AS "buyer_address_line_1",
                bc.address_line_2 AS "buyer_address_line_2",
                bc.city AS "buyer_city",
                bc.country AS "buyer_country",
                bc.state_province AS "buyer_state_province",
                bc.postal_code AS "buyer_postal_code",
                sc.id AS "seller_company_id",
                sc.name AS "seller_company_name",
                sc.country AS "seller_company_country",
                sc.status AS "seller_company_status",
                sc.address_line_1 AS "seller_address_line_1",
                sc.address_line_2 AS "seller_address_line_2",
                sc.city AS "seller_city",
                sc.country AS "seller_country",
                sc.state_province AS "seller_state_province",
                sc.postal_code AS "seller_postal_code",
                bu.username AS "buyer_username",
                su.username AS "seller_username",
                bl.id AS "buyer_location_id",
                bl.address_line AS "buyer_location_address_line",
                bl.street AS "buyer_location_street",
                bl.city AS "buyer_location_city",
                bl.country AS "buyer_location_country",
                bl.postcode AS "buyer_location_postcode",
                bl.state_province AS "buyer_location_state_province",
                bl.office_open_time AS "buyer_office_open_time",
                bl.office_close_time AS "buyer_office_close_time",
                bl.access_restrictions AS "buyer_access_restrictions",
                bl.container_type AS "buyer_container_type",
                sl.id AS "seller_location_id",
                sl.address_line AS "seller_location_address_line",
                sl.street AS "seller_location_street",
                sl.city AS "seller_location_city",
                sl.country AS "seller_location_country",
                sl.postcode AS "seller_location_postcode",
                sl.state_province AS "seller_location_state_province",
                sl.office_open_time AS "seller_office_open_time",
                sl.office_close_time AS "seller_office_close_time",
                sl.access_restrictions AS "seller_access_restrictions",
                sl.container_type AS "seller_container_type",
                l.weight_per_load AS "listing_weight_per_load",
                l.price_per_metric_tonne AS "listing_price_per_metric_tonne",
                l.pern AS "listing_pern",
                l.created_at AS "listing_created_at",
                l.currency AS "listing_currency",
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
                    LIMIT 1) AS "best_offer",
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
                    LIMIT 1) AS "best_offer_currency",
                (SELECT COUNT(*) FROM offers o4 WHERE o4.listing_id = l.id 
                    AND ((o4.state = 'active' AND o4.status = 'approved') OR 
                         (o4.state = 'closed' AND o4.status = 'accepted') OR
                         (o4.state = 'closed' AND o4.status = 'rejected' AND o4.rejection_source = 'seller') OR
                         (o4.state = 'closed' AND o4.status = 'rejected' AND o4.rejection_source = 'system'))) AS "number_of_offers",
                o.total_price AS "seller_total_amount",
                bu.first_name AS "buyer_first_name",
                bu.last_name AS "buyer_last_name",
                su.first_name AS "seller_first_name",
                su.last_name AS "seller_last_name"
            FROM offers o
                JOIN listings l ON o.listing_id = l.id
                LEFT JOIN companies bc ON o.buyer_company_id = bc.id
                LEFT JOIN companies sc ON l.company_id = sc.id
                LEFT JOIN users bu ON o.buyer_user_id = bu.id
                LEFT JOIN users su ON o.seller_user_id = su.id
                LEFT JOIN company_locations bl ON o.buyer_location_id = bl.id
                LEFT JOIN company_locations sl ON o.seller_location_id = sl.id
            WHERE o.id = $1
            ORDER BY o.created_at DESC
        `;

        let offer = await dsOffer.execute(sql, [id]);
        offer = offer?.[0] ?? offer ?? null;

        if (!offer) {
            throw new HttpErrors[404]('Offer not found');
        }

        // CRITICAL SECURITY: Check visibility rules for pending/rejected bids
        // Admins can view all offers, bypass restrictions
        if (companyId && !isAdmin) {
            // const isOwner = offer.buyer_user_id === userId || offer.seller_user_id === userId;
            const isSeller = offer.seller_company_id === companyId;
            // // If user didn't create this offer, deny access
            // if (!isOwner) {
            //     throw new HttpErrors[403]('You do not have permission to view this offer');
            // }

            // Seller visibility rules - CONSISTENT WITH getOffers
            if (isSeller) {
                // SAME RULE AS getOffers: Hide pending offers UNLESS user is the creator
                if (
                    offer.state === OfferState.PENDING &&
                    offer.status === OfferStatusEnum.PENDING &&
                    offer.seller_company_id !== companyId
                ) {
                    throw new HttpErrors[403]('This offer is not yet approved by admin');
                }

                // Admin-rejected offers should be hidden from seller
                if (
                    offer.state === OfferState.CLOSED &&
                    offer.status === OfferStatusEnum.REJECTED &&
                    offer.rejection_source === 'admin'
                ) {
                    throw new HttpErrors[403]('This offer is not available');
                }

                // CONSISTENT VISIBILITY RULES WITH getOffers:
                // - Pending offers => Allow ONLY if user is creator
                // - Approved offers => Allow
                // - Accepted offers => Allow
                // - Rejected by seller => Allow
                // - Rejected by system => Allow
                // - Rejected by admin => Block (handled above)
                const allowedStates = [
                    { state: OfferState.PENDING, status: OfferStatusEnum.PENDING, requiresCreator: true },
                    { state: OfferState.ACTIVE, status: OfferStatusEnum.APPROVED },
                    { state: OfferState.CLOSED, status: OfferStatusEnum.ACCEPTED },
                    { state: OfferState.CLOSED, status: OfferStatusEnum.REJECTED, rejectionSource: 'seller' },
                    { state: OfferState.CLOSED, status: OfferStatusEnum.REJECTED, rejectionSource: 'system' },
                ];

                const isAllowed = allowedStates.some((allowed) => {
                    if (allowed.requiresCreator && offer.created_by_user_id !== userId) {
                        return false;
                    }
                    if (allowed.rejectionSource) {
                        return (
                            offer.state === allowed.state &&
                            offer.status === allowed.status &&
                            offer.rejection_source === allowed.rejectionSource
                        );
                    }
                    return offer.state === allowed.state && offer.status === allowed.status;
                });

                if (!isAllowed) {
                    throw new HttpErrors[403]('This offer is not available');
                }
            }

            // Buyers can see all their own offers regardless of status
            // (no additional restrictions for buyers)
        }

        const [listingDocuments, listingLocation] = await Promise.all([
            this.listingDocumentsRepository.find({
                where: { listingId: offer?.listing_id },
            }),
            offer?.listing_location_id ? this.companyLocationsRepository.findById(offer?.listing_location_id) : null,
        ]);

        // Convert currency for offer data
        const convertedOffer = await this.exchangeRateService.convertOfferToBaseCurrency({
            offeredPricePerUnit: Number(offer.offered_price_per_unit),
            totalPrice: Number(offer.total_price),
            currency: offer.currency,
        });

        // Convert best offer currency if exists
        const convertedBestOffer =
            offer.best_offer && offer.best_offer_currency
                ? await this.exchangeRateService.convertToBaseCurrency(
                      Number(offer.best_offer),
                      offer.best_offer_currency,
                  )
                : Number(offer.best_offer);

        return {
            status: 'success',
            message: 'get-offer-detail',
            data: {
                offer: {
                    id: offer.id,
                    createdAt: offer.created_at,
                    quantity: Number(offer.quantity),
                    numOfLoadBidOn: Number(offer.quantity), // Alias for frontend convenience
                    offeredPricePerUnit: convertedOffer.offeredPricePerUnit,
                    totalPrice: convertedOffer.totalPrice,
                    status: offer.status,
                    state: offer.state,
                    expiresAt: offer.expires_at,
                    earliestDeliveryDate: offer.earliest_delivery_date,
                    latestDeliveryDate: offer.latest_delivery_date,
                    currency: convertedOffer.currency as ECurrency,
                    originalCurrency: convertedOffer.originalCurrency as ECurrency,
                    message: offer.message,
                    rejectionReason: offer.rejection_reason,
                    incoterms: offer.incoterms,
                    shippingPort: offer.shipping_port,
                    needsTransport: offer.needs_transport,
                    listingId: offer.listing_id,
                    buyerCompanyId: offer.buyer_company_id,
                    buyerLocationId: offer.buyer_location_id,
                    buyerUserId: offer.buyer_user_id,
                    buyerCountry: offer.buyer_country,
                    sellerCompanyId: offer.seller_company_id,
                    sellerLocationId: offer.seller_location_id,
                    sellerUserId: offer.seller_user_id,
                    sellerCountry: offer.seller_country,
                    acceptedByUserId: offer.accepted_by_user_id,
                    rejectedByUserId: offer.rejected_by_user_id,
                    createdByUserId: offer.created_by_user_id,
                    updatedAt: offer.updated_at,
                    sellerTotalAmount: Number(offer.seller_total_amount),
                } as any,
                listing: {
                    id: offer.listing_id,
                    title: offer.listing_title,
                    status: offer.listing_status,
                    materialWeightPerUnit: offer.listing_material_weight_per_unit
                        ? Number(offer.listing_material_weight_per_unit)
                        : undefined,
                    materialWeightWanted: Number(offer.listing_material_weight_wanted),
                    weightPerLoad: offer.listing_weight_per_load ? Number(offer.listing_weight_per_load) : undefined,
                    pricePerMetricTonne: offer.listing_price_per_metric_tonne
                        ? Number(offer.listing_price_per_metric_tonne)
                        : undefined,
                    pern: offer.listing_pern ? Number(offer.listing_pern) : null,
                    currency: offer.listing_currency,
                    createdAt: offer.listing_created_at,
                    quantity: Number(offer.listing_quantity),
                    remainingQuantity: Number(offer.listing_remaining_quantity),
                    materialPacking: offer.listing_material_packing,
                    state: offer.listing_state,
                    materialType: offer.listing_material_type,
                    materialItem: offer.listing_material_item,
                    materialFinishing: offer.listing_material_finishing,
                    materialForm: offer.listing_material_form,
                    numberOfOffers: Number(offer.number_of_offers),
                    bestOffer: convertedBestOffer,
                    bestOfferCurrency: this.exchangeRateService.baseCurrencyCode,
                    originalBestOfferCurrency: offer.best_offer_currency,
                    documents: listingDocuments,
                    location: listingLocation
                        ? {
                              addressLine: listingLocation.addressLine,
                              street: listingLocation.street,
                              postcode: listingLocation.postcode,
                              city: listingLocation.city,
                              country: listingLocation.country,
                              stateProvince: listingLocation.stateProvince,
                          }
                        : null,
                } as any,
                seller: {
                    companyId: offer.seller_company_id,
                    companyName: offer.seller_company_name,
                    country: offer.seller_country,
                    company: {
                        status: offer.seller_company_status,
                        addressLine1: offer.seller_address_line_1,
                        addressLine2: offer.seller_address_line_2,
                        city: offer.seller_city,
                        stateProvince: offer.seller_state_province,
                        postalCode: offer.seller_postal_code,
                    },
                    user: {
                        username: offer.seller_username,
                        firstName: offer.seller_first_name,
                        lastName: offer.seller_last_name,
                    },
                    loadingTimes:
                        offer.seller_location_id && (offer.seller_office_open_time || offer.seller_office_close_time)
                            ? {
                                  openTime: offer.seller_office_open_time,
                                  closeTime: offer.seller_office_close_time,
                              }
                            : null,
                    siteRestrictions: offer.seller_access_restrictions || null,
                    averageWeightPerLoad: offer.listing_weight_per_load || null,
                    location: offer.seller_location_id
                        ? {
                              id: offer.seller_location_id,
                              addressLine: offer.seller_location_address_line,
                              street: offer.seller_location_street,
                              city: offer.seller_location_city,
                              country: offer.seller_location_country,
                              postcode: offer.seller_location_postcode,
                              stateProvince: offer.seller_location_state_province,
                              containerType: offer.seller_container_type,
                          }
                        : null,
                },
                buyer: {
                    companyId: offer.buyer_company_id,
                    companyName: offer.buyer_company_name,
                    country: offer.buyer_country,
                    company: {
                        status: offer.buyer_company_status,
                        addressLine1: offer.buyer_address_line_1,
                        addressLine2: offer.buyer_address_line_2,
                        city: offer.buyer_city,
                        stateProvince: offer.buyer_state_province,
                        postalCode: offer.buyer_postal_code,
                    },
                    user: {
                        username: offer.buyer_username,
                        firstName: offer.buyer_first_name,
                        lastName: offer.buyer_last_name,
                    },
                    loadingTimes:
                        offer.buyer_location_id && (offer.buyer_office_open_time || offer.buyer_office_close_time)
                            ? {
                                  openTime: offer.buyer_office_open_time,
                                  closeTime: offer.buyer_office_close_time,
                              }
                            : null,
                    siteRestrictions: offer.buyer_access_restrictions || null,
                    location: offer.buyer_location_id
                        ? {
                              id: offer.buyer_location_id,
                              addressLine: offer.buyer_location_address_line,
                              street: offer.buyer_location_street,
                              city: offer.buyer_location_city,
                              country: offer.buyer_location_country,
                              postcode: offer.buyer_location_postcode,
                              stateProvince: offer.buyer_location_state_province,
                              containerType: offer.buyer_container_type,
                          }
                        : null,
                },
            },
        };
    }

    public async getOffers(
        { filter }: { filter?: Filter<Offers> },
        loggedInUser: MyUserProfile,
    ): Promise<PaginationList<OfferDetails>> {
        const { id: userId, companyId } = loggedInUser;
        const skip: number | null = get(filter, 'skip', 0);
        const limit: number | null = get(filter, 'limit', 10);
        const listingId = Number(get(filter?.where, 'listingId', null)) as number | null;
        const isSeller = get(filter?.where, 'isSeller', true) as boolean;
        const materialItem = get(filter?.where, 'materialItem', null) as string | null;
        const conditions = [];

        if (listingId) {
            conditions.push(`o.listing_id = ${listingId}`);
        }

        if (materialItem) {
            // Escape single quotes to prevent SQL injection
            const escapedMaterialItem = materialItem.replace(/'/g, "''");
            conditions.push(`l.material_item ILIKE '%${escapedMaterialItem}%'`);
        }

        // FIXED: Handle NULL values and improve filtering logic
        if (isSeller) {
            // For sellers: check seller_company_id
            conditions.push(`o.seller_company_id = ${companyId}`);

            // Apply visibility rules for sellers
            // SIMPLE RULE: Hide pending offers UNLESS user is the creator
            conditions.push(`(
                (o.state = 'pending' AND o.status = 'pending' AND o.created_by_user_id = ${userId}) OR
                (o.state = 'active' AND o.status = 'approved') OR
                (o.state = 'closed' AND o.status = 'accepted') OR
                (o.state = 'closed' AND o.status = 'rejected' AND o.rejection_source = 'seller') OR
                (o.state = 'closed' AND o.status = 'rejected' AND o.rejection_source = 'system')
            )`);
        } else {
            // For buyers: check buyer_company_id
            // Buyer sees all their own bids (they created them) - NO STATUS FILTERING
            conditions.push(`o.buyer_company_id = ${companyId}`);
            // Note: Buyers can see ALL their offers regardless of status/state
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const dsOffer = this.offersRepository.dataSource;
        const countSql = `
            SELECT COUNT(*)::int AS "totalCount"
            FROM offers o
                JOIN listings l ON o.listing_id = l.id
                LEFT JOIN companies bc ON o.buyer_company_id = bc.id
                LEFT JOIN companies sc ON l.company_id = sc.id
                LEFT JOIN users bu ON o.buyer_user_id = bu.id
                LEFT JOIN users su ON o.seller_user_id = su.id
            ${whereClause}
        `;
        const sql = `
            SELECT
                o.*,
                l.id AS "listing_id",
                l.title AS "listing_title",
                l.material_weight_per_unit AS "listing_material_weight_per_unit",
                l.material_weight_wanted AS "listing_material_weight_wanted",
                l.status AS "listing_status",
                l.state AS "listing_state",
                l.quantity AS "listing_quantity",
                l.remaining_quantity AS "listing_remaining_quantity",
                l.material_packing AS "listing_material_packing",
                l.material_type AS "listing_material_type",
                l.material_item AS "listing_material_item",
                l.material_finishing AS "listing_material_finishing",
                l.material_form AS "listing_material_form",
                bc.id AS "buyer_company_id",
                bc.name AS "buyer_company_name",
                bc.country AS "buyer_company_country",
                bc.status AS "buyer_company_status",
                bc.address_line_1 AS "buyer_address_line_1",
                bc.address_line_2 AS "buyer_address_line_2",
                bc.city AS "buyer_city",
                bc.country AS "buyer_country",
                bc.state_province AS "buyer_state_province",
                bc.postal_code AS "buyer_postal_code",
                sc.id AS "seller_company_id",
                sc.name AS "seller_company_name",
                sc.country AS "seller_company_country",
                sc.status AS "seller_company_status",
                sc.address_line_1 AS "seller_address_line_1",
                sc.address_line_2 AS "seller_address_line_2",
                sc.city AS "seller_city",
                sc.country AS "seller_country",
                sc.state_province AS "seller_state_province",
                sc.postal_code AS "seller_postal_code",
                bu.id AS "buyer_user_id",
                bu.first_name AS "buyer_first_name",
                bu.last_name AS "buyer_last_name",
                bu.email AS "buyer_email",
                bu.username AS "buyer_username",
                su.id AS "seller_user_id",
                su.first_name AS "seller_first_name",
                su.last_name AS "seller_last_name",
                su.email AS "seller_email",
                su.username AS "seller_username",
                bl.id AS "buyer_location_id",
                bl.address_line AS "buyer_location_address_line",
                bl.street AS "buyer_location_street",
                bl.city AS "buyer_location_city",
                bl.country AS "buyer_location_country",
                bl.postcode AS "buyer_location_postcode",
                bl.state_province AS "buyer_location_state_province",
                sl.id AS "seller_location_id",
                sl.address_line AS "seller_location_address_line",
                sl.street AS "seller_location_street",
                sl.city AS "seller_location_city",
                sl.country AS "seller_location_country",
                sl.postcode AS "seller_location_postcode",
                sl.state_province AS "seller_location_state_province",
                ll.id AS "listing_location_id",
                ll.address_line AS "listing_location_address_line",
                ll.street AS "listing_location_street",
                ll.city AS "listing_location_city",
                ll.country AS "listing_location_country",
                ll.postcode AS "listing_location_postcode",
                ll.state_province AS "listing_location_state_province"
            FROM offers o
                JOIN listings l ON o.listing_id = l.id
                LEFT JOIN companies bc ON o.buyer_company_id = bc.id
                LEFT JOIN companies sc ON l.company_id = sc.id
                LEFT JOIN users bu ON o.buyer_user_id = bu.id
                LEFT JOIN users su ON o.seller_user_id = su.id
                LEFT JOIN company_locations bl ON o.buyer_location_id = bl.id
                LEFT JOIN company_locations sl ON o.seller_location_id = sl.id
                LEFT JOIN company_locations ll ON l.location_id = ll.id
            ${whereClause}
            ORDER BY o.created_at DESC, o.id DESC
            LIMIT $1 OFFSET $2
        `;
        const [offersCount, offers] = await Promise.all([
            dsOffer.execute(countSql),
            dsOffer.execute(sql, [limit, skip]),
        ]);

        return {
            totalCount: offersCount[0]?.totalCount ?? 0,
            results: await Promise.all(
                offers.map(async (offer: any) => {
                    const listingDocuments = await this.listingDocumentsRepository.find({
                        where: { listingId: offer?.listing_id },
                    });

                    // Convert currency for offer data
                    const convertedOffer = await this.exchangeRateService.convertOfferToBaseCurrency({
                        offeredPricePerUnit: Number(offer.offered_price_per_unit),
                        totalPrice: Number(offer.total_price),
                        currency: offer.currency,
                    });
                    console.log(offer.seller_user_id, offer.seller_company_id);
                    return {
                        offer: {
                            id: offer.id,
                            createdAt: offer.created_at,
                            quantity: Number(offer.quantity),
                            offeredPricePerUnit: convertedOffer.offeredPricePerUnit,
                            totalPrice: convertedOffer.totalPrice,
                            status: offer.status,
                            state: offer.state,
                            expiresAt: offer.expires_at,
                            earliestDeliveryDate: offer.earliest_delivery_date,
                            latestDeliveryDate: offer.latest_delivery_date,
                            currency: convertedOffer.currency,
                            originalCurrency: convertedOffer.originalCurrency,
                            message: offer.message,
                            rejectionReason: offer.rejection_reason,
                            incoterms: offer.incoterms,
                            shippingPort: offer.shipping_port,
                            needsTransport: offer.needs_transport,
                            listingId: offer.listing_id,
                            buyerCountry: offer.buyer_country,
                            sellerCountry: offer.seller_country,
                            updatedAt: offer.updated_at,
                        },
                        listing: {
                            id: offer.listing_id,
                            title: offer.listing_title,
                            status: offer.listing_status,
                            state: offer.listing_state,
                            materialWeightPerUnit: offer.listing_material_weight_per_unit,
                            materialWeightWanted: Number(offer.listing_material_weight_wanted),
                            quantity: Number(offer.listing_quantity),
                            remainingQuantity: Number(offer.listing_remaining_quantity),
                            materialPacking: offer.listing_material_packing,
                            materialType: offer.listing_material_type,
                            materialItem: offer.listing_material_item,
                            materialFinishing: offer.listing_material_finishing,
                            materialForm: offer.listing_material_form,
                            documents: listingDocuments,
                            location: offer.listing_location_id
                                ? {
                                      addressLine: offer.listing_location_address_line,
                                      street: offer.listing_location_street,
                                      postcode: offer.listing_location_postcode,
                                      city: offer.listing_location_city,
                                      country: offer.listing_location_country,
                                      stateProvince: offer.listing_location_state_province,
                                  }
                                : null,
                        },
                        seller: {
                            company: {
                                status: offer.seller_company_status,
                            },
                            user: {
                                username: offer.seller_username,
                            },
                            // For sellers (isSeller=true): exclude seller.location completely
                            // For buyers (isSeller=false): include seller.location with address fields
                            ...(isSeller
                                ? {}
                                : {
                                      location: offer.seller_location_id
                                          ? {
                                                addressLine: offer.seller_location_address_line,
                                                street: offer.seller_location_street,
                                                postcode: offer.seller_location_postcode,
                                                city: offer.seller_location_city,
                                                country: offer.seller_location_country,
                                                stateProvince: offer.seller_location_state_province,
                                            }
                                          : offer.seller_company_id
                                            ? {
                                                  addressLine: offer.seller_address_line_1,
                                                  street: offer.seller_address_line_2,
                                                  postcode: offer.seller_postal_code,
                                                  city: offer.seller_city,
                                                  country: offer.seller_company_country,
                                                  stateProvince: offer.seller_state_province,
                                              }
                                            : null,
                                  }),
                        },
                        buyer: {
                            company: {
                                status: offer.buyer_company_status,
                            },
                            user: {
                                username: offer.buyer_username,
                            },
                            // For sellers (isSeller=true): include only buyer.location.country
                            // For buyers (isSeller=false): include buyer.location with full address fields
                            location: isSeller
                                ? offer.buyer_location_id
                                    ? { country: offer.buyer_location_country }
                                    : offer.buyer_company_country
                                      ? { country: offer.buyer_company_country }
                                      : null
                                : offer.buyer_location_id
                                  ? {
                                        addressLine: offer.buyer_location_address_line,
                                        street: offer.buyer_location_street,
                                        postcode: offer.buyer_location_postcode,
                                        city: offer.buyer_location_city,
                                        country: offer.buyer_location_country,
                                        stateProvince: offer.buyer_location_state_province,
                                    }
                                  : offer.buyer_company_id
                                    ? {
                                          addressLine: offer.buyer_address_line_1,
                                          street: offer.buyer_address_line_2,
                                          postcode: offer.buyer_postal_code,
                                          city: offer.buyer_city,
                                          country: offer.buyer_company_country,
                                          stateProvince: offer.buyer_state_province,
                                      }
                                    : null,
                        },
                    } as OfferDetails;
                }),
            ),
        };
    }

    public async getOffersAdmin(filter?: Filter<Offers>): Promise<PaginationList<OfferDetails>> {
        const skip: number | null = get(filter, 'skip', 0);
        const limit: number | null = get(filter, 'limit', 20);
        const buyerName = get(filter?.where, 'buyerName', null) as string | null;
        const sellerName = get(filter?.where, 'sellerName', null) as string | null;
        const buyerCompanyName = get(filter?.where, 'buyerCompanyName', null) as string | null;
        const sellerCompanyName = get(filter?.where, 'sellerCompanyName', null) as string | null;
        const searchTerm = get(filter?.where, 'searchTerm', null) as string | null;
        const materialType = get(filter?.where, 'materialType', null) as string | null;
        const materialItem = get(filter?.where, 'materialItem', null) as string | null;
        const materialPacking = get(filter?.where, 'materialPacking', null) as string | null;
        const location = get(filter?.where, 'location', null) as string | string[] | null;
        const status = get(filter?.where, 'status', null) as string | null;
        const state = get(filter?.where, 'state', null) as string | null;
        const sortBy = get(filter?.where, 'sortBy', null) as string | null;
        const listingId = get(filter?.where, 'listingId', null) as number | null;

        let orderByClause = `ORDER BY
                        CASE
                            WHEN o.status = '${OfferStatusEnum.PENDING}' THEN 1
                            WHEN o.status = '${OfferStatusEnum.APPROVED}' THEN 2
                            WHEN o.status = '${OfferStatusEnum.ACCEPTED}' THEN 3
                            WHEN o.status = '${OfferStatusEnum.SHIPPED}' THEN 4
                            WHEN o.status = '${OfferStatusEnum.REJECTED}' THEN 5
                            ELSE 6
                        END ASC,
                        o.created_at DESC NULLS LAST,
                        o.id DESC`;

        if (sortBy) {
            switch (sortBy) {
                case OfferSortBy.BUYER_COMPANY_NAME_ASC:
                    orderByClause = 'ORDER BY bc.name ASC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.BUYER_COMPANY_NAME_DESC:
                    orderByClause = 'ORDER BY bc.name DESC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.SELLER_COMPANY_NAME_ASC:
                    orderByClause = 'ORDER BY sc.name ASC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.SELLER_COMPANY_NAME_DESC:
                    orderByClause = 'ORDER BY sc.name DESC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.MATERIAL_TYPE_ASC:
                    orderByClause = 'ORDER BY l.material_type ASC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.MATERIAL_TYPE_DESC:
                    orderByClause = 'ORDER BY l.material_type DESC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.BUYER_COUNTRY_ASC:
                    orderByClause = `ORDER BY bc.country ASC NULLS LAST, o.created_at DESC, o.id DESC`;
                    break;
                case OfferSortBy.BUYER_COUNTRY_DESC:
                    orderByClause = `ORDER BY bc.country DESC NULLS LAST, o.created_at DESC, o.id DESC`;
                    break;
                case OfferSortBy.SELLER_COUNTRY_ASC:
                    orderByClause = `ORDER BY sc.country ASC NULLS LAST, o.created_at DESC, o.id DESC`;
                    break;
                case OfferSortBy.SELLER_COUNTRY_DESC:
                    orderByClause = `ORDER BY sc.country DESC NULLS LAST, o.created_at DESC, o.id DESC`;
                    break;
                case OfferSortBy.BUYER_NAME_ASC:
                    orderByClause = 'ORDER BY bu.first_name, bu.last_name ASC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.BUYER_NAME_DESC:
                    orderByClause =
                        'ORDER BY bu.first_name, bu.last_name DESC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.SELLER_NAME_ASC:
                    orderByClause = 'ORDER BY su.first_name, su.last_name ASC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.SELLER_NAME_DESC:
                    orderByClause =
                        'ORDER BY su.first_name, su.last_name DESC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.STATUS_ASC:
                    orderByClause = 'ORDER BY o.status ASC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.STATUS_DESC:
                    orderByClause = 'ORDER BY o.status DESC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.STATE_ASC:
                    orderByClause = 'ORDER BY o.state ASC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.STATE_DESC:
                    orderByClause = 'ORDER BY o.state DESC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.MATERIAL_PACKING_ASC:
                    orderByClause = 'ORDER BY l.material_packing ASC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.MATERIAL_PACKING_DESC:
                    orderByClause = 'ORDER BY l.material_packing DESC NULLS LAST, o.created_at DESC, o.id DESC';
                    break;
                case OfferSortBy.AVAILABLE_LISTINGS_ASC:
                    orderByClause = `ORDER BY 
                        CASE 
                            WHEN o.status = '${OfferStatusEnum.PENDING}' THEN 1
                            WHEN o.status = '${OfferStatusEnum.APPROVED}' THEN 2
                            WHEN o.status = '${OfferStatusEnum.ACCEPTED}' THEN 3
                            WHEN o.status = '${OfferStatusEnum.SHIPPED}' THEN 4
                            WHEN o.status = '${OfferStatusEnum.REJECTED}' THEN 5
                            ELSE 6
                        END ASC,
                        CASE 
                            WHEN o.expires_at IS NOT NULL THEN o.expires_at
                            ELSE o.created_at
                        END DESC NULLS LAST, 
                        o.id DESC`;
                    break;
                case OfferSortBy.AVAILABLE_LISTINGS_DESC:
                    orderByClause = `ORDER BY 
                        CASE 
                            WHEN o.status = '${OfferStatusEnum.SHIPPED}' THEN 1
                            WHEN o.status = '${OfferStatusEnum.ACCEPTED}' THEN 2
                            WHEN o.status = '${OfferStatusEnum.REJECTED}' THEN 3
                            WHEN o.status = '${OfferStatusEnum.APPROVED}' THEN 4
                            WHEN o.status = '${OfferStatusEnum.PENDING}' THEN 5
                            ELSE 6
                        END ASC,
                        CASE 
                            WHEN o.expires_at IS NOT NULL THEN o.expires_at
                            ELSE o.created_at
                        END ASC NULLS LAST, 
                        o.id DESC`;
                    break;
                case OfferSortBy.CREATED_AT_ASC:
                    orderByClause = 'ORDER BY o.created_at ASC, o.id ASC';
                    break;
                case OfferSortBy.CREATED_AT_DESC:
                    orderByClause = 'ORDER BY o.created_at DESC, o.id DESC';
                    break;
                default:
                    // Default fallback: availability priority then newest first
                    break;
            }
        }

        const conditions = [];

        if (searchTerm) {
            const tokens = searchTerm
                .split(/\s+/)
                .map((t) => t.trim())
                .filter((t) => t !== '');

            const tokenGroups = tokens.map((rawToken) => {
                const token = rawToken.replace(/'/g, "''");
                const countryIsoCodes = getAllMatchingCountryIsoCodes(rawToken);
                const materialTypeCode = getMaterialCode(rawToken, 'type').replace(/'/g, "''");
                const materialItemCode = getMaterialCode(rawToken, 'item').replace(/'/g, "''");
                const materialPackingCode = getMaterialCode(rawToken, 'packing').replace(/'/g, "''");

                // Build country search conditions for all matching ISO codes
                const countryConditions = countryIsoCodes.length > 0
                    ? countryIsoCodes.map(code => 
                        `bl.country ILIKE '%${code}%' OR sl.country ILIKE '%${code}%' OR bc.country ILIKE '%${code}%' OR sc.country ILIKE '%${code}%'`
                    ).join(' OR ')
                    : '';

                return `(l.material_type ILIKE '%${token}%' OR 
                l.material_type ILIKE '%${materialTypeCode}%' OR
                l.material_item ILIKE '%${token}%' OR 
                l.material_item ILIKE '%${materialItemCode}%' OR
                l.material_form ILIKE '%${token}%' OR
                l.material_grading ILIKE '%${token}%' OR
                l.material_color ILIKE '%${token}%' OR
                l.material_finishing ILIKE '%${token}%' OR
                l.material_packing ILIKE '%${token}%' OR
                l.material_packing ILIKE '%${materialPackingCode}%' OR
                CONCAT_WS(' ', l.material_type, l.material_item, l.material_form, l.material_grading, l.material_color, l.material_finishing, l.material_packing) ILIKE '%${token}%' OR
                bl.country ILIKE '%${token}%' OR
                sl.country ILIKE '%${token}%' OR
                bc.country ILIKE '%${token}%' OR
                sc.country ILIKE '%${token}%' OR
                ${countryConditions ? countryConditions + ' OR' : ''}
                bl.location_name ILIKE '%${token}%' OR
                bl.city ILIKE '%${token}%' OR
                sl.location_name ILIKE '%${token}%' OR
                sl.city ILIKE '%${token}%' OR
                bc.name ILIKE '%${token}%' OR
                sc.name ILIKE '%${token}%' OR
                o.id::text ILIKE '%${token}%' OR
                bu.id::text ILIKE '%${token}%' OR
                su.id::text ILIKE '%${token}%' OR
                bu.username ILIKE '%${token}%' OR
                su.username ILIKE '%${token}%' OR
                bu.first_name ILIKE '%${token}%' OR
                bu.last_name ILIKE '%${token}%' OR
                su.first_name ILIKE '%${token}%' OR
                su.last_name ILIKE '%${token}%' OR
                CONCAT(bu.first_name, ' ', bu.last_name) ILIKE '%${token}%' OR
                CONCAT(su.first_name, ' ', su.last_name) ILIKE '%${token}%' OR
                bu.email ILIKE '%${token}%' OR
                su.email ILIKE '%${token}%')`;
            });

            if (tokenGroups.length > 0) {
                conditions.push(`(${tokenGroups.join(' AND ')})`);
            }
        }

        if (buyerName) {
            const escapedBuyerName = buyerName.replace(/'/g, "''");
            const buyerConditions = `bu.first_name ILIKE '%${escapedBuyerName}%'
             OR bu.last_name ILIKE '%${escapedBuyerName}%'
             OR CONCAT(bu.first_name, ' ', bu.last_name) ILIKE '%${escapedBuyerName}%'`;
            conditions.push(`(${buyerConditions})`);
        }

        if (sellerName) {
            const escapedSellerName = sellerName.replace(/'/g, "''");
            const sellerConditions = `su.first_name ILIKE '%${escapedSellerName}%'
             OR su.last_name ILIKE '%${escapedSellerName}%' 
             OR CONCAT(su.first_name, ' ', su.last_name) ILIKE '%${escapedSellerName}%'`;
            conditions.push(`(${sellerConditions})`);
        }

        if (buyerCompanyName) {
            const escapedBuyerCompanyName = buyerCompanyName.replace(/'/g, "''");
            const buyerConditions = `bc.name ILIKE '%${escapedBuyerCompanyName}%'`;
            conditions.push(`(${buyerConditions})`);
        }

        if (sellerCompanyName) {
            const escapedSellerCompanyName = sellerCompanyName.replace(/'/g, "''");
            const sellerConditions = `sc.name ILIKE '%${escapedSellerCompanyName}%'`;
            conditions.push(`(${sellerConditions})`);
        }

        if (materialType) {
            const escapedMaterialType = materialType.replace(/'/g, "''");
            const materialTypeConditions = `l.material_type = '${escapedMaterialType}'`;
            conditions.push(`(${materialTypeConditions})`);
        }

        if (materialItem) {
            // Escape single quotes to prevent SQL injection
            const escapedMaterialItem = materialItem.replace(/'/g, "''");
            const materialItemConditions = `l.material_item ILIKE '%${escapedMaterialItem}%'`;
            conditions.push(`(${materialItemConditions})`);
        }

        if (materialPacking) {
            const escapedMaterialPacking = materialPacking.replace(/'/g, "''");
            const materialPackingConditions = `l.material_packing = '${escapedMaterialPacking}'`;
            conditions.push(`(${materialPackingConditions})`);
        }

        if (location) {
            let locationConditions: string;
            if (Array.isArray(location)) {
                // Handle array of locations - search both company and location tables
                const locationClauses = location
                    .map((loc) => {
                        const escapedLoc = loc.replace(/'/g, "''");
                        const isoCode = getCountryIsoCode(loc);
                        return `bl.country ILIKE '%${escapedLoc}%' OR bl.country ILIKE '%${isoCode}%' OR sl.country ILIKE '%${escapedLoc}%' OR sl.country ILIKE '%${isoCode}%' OR bc.country ILIKE '%${escapedLoc}%' OR bc.country ILIKE '%${isoCode}%' OR sc.country ILIKE '%${escapedLoc}%' OR sc.country ILIKE '%${isoCode}%'`;
                    })
                    .join(' OR ');
                locationConditions = `(${locationClauses})`;
            } else {
                // Handle single location string - search both company and location tables
                const escapedLocation = location.replace(/'/g, "''");
                const isoCode = getCountryIsoCode(location);
                locationConditions = `bl.country ILIKE '%${escapedLocation}%' OR bl.country ILIKE '%${isoCode}%' OR sl.country ILIKE '%${escapedLocation}%' OR sl.country ILIKE '%${isoCode}%' OR bc.country ILIKE '%${escapedLocation}%' OR bc.country ILIKE '%${isoCode}%' OR sc.country ILIKE '%${escapedLocation}%' OR sc.country ILIKE '%${isoCode}%'`;
            }
            conditions.push(`(${locationConditions})`);
        }

        if (status) {
            const escapedStatus = status.replace(/'/g, "''");
            const statusConditions = `o.status = '${escapedStatus}'`;
            conditions.push(`(${statusConditions})`);
        }

        if (state) {
            const escapedState = state.replace(/'/g, "''");
            const stateConditions = `o.state = '${escapedState}'`;
            conditions.push(`(${stateConditions})`);
        }

        if (listingId) {
            const listingIdConditions = `o.listing_id = ${listingId}`;
            conditions.push(`(${listingIdConditions})`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const dsOffer = this.offersRepository.dataSource;
        const countSql = `
        SELECT COUNT(*)::int AS "totalCount"
        FROM offers o
        JOIN listings l ON o.listing_id = l.id
        -- Join buyer related tables
        LEFT JOIN companies bc ON o.buyer_company_id = bc.id
        LEFT JOIN users bu ON o.buyer_user_id = bu.id
        LEFT JOIN company_locations bl ON o.buyer_location_id = bl.id
        -- Join seller related tables
        LEFT JOIN companies sc ON o.seller_company_id = sc.id
        LEFT JOIN users su ON o.seller_user_id = su.id
        LEFT JOIN company_locations sl ON o.seller_location_id = sl.id
        ${whereClause}
        `;

        const sql = `
        SELECT 
            o.*,
            o.admin_note AS "adminNote",
            o.assign_admin AS "assignAdmin",
            l.id AS "listing_id",
            l.title,
            l.status AS "listing_status",
            l.state AS "listing_state",
            l.quantity AS "listing_quantity",
            l.remaining_quantity,
            l.material_weight_per_unit,
            l.material_weight_wanted,
            l.weight_per_load,
            l.material_type,
            l.material_packing,
            l.material_item,
            l.material_finishing,
            l.material_form,
            l.material_grading,
            l.material_color,
            l.price_per_metric_tonne AS "listing_guide_price",
            l.currency AS "listing_currency",
            l.pern AS "listing_pern",
            l.created_at AS "listing_created_at",
            -- Buyer details
            bc.id AS "buyer_company_id",
            bc.name AS "buyer_company_name",
            bu.id AS "buyer_user_id",
            bu.first_name AS "buyer_first_name",
            bu.last_name AS "buyer_last_name",
            bu.email AS "buyer_email",
            bu.username AS "buyer_username",
            bc.country AS "buyer_country",
            -- Buyer location
            bl.id AS "buyer_location_id",
            bl.location_name AS "buyer_location_name",
            bl.city AS "buyer_location_city",
            bl.country AS "buyer_location_country",
            -- Seller details
            sc.id AS "seller_company_id",
            sc.name AS "seller_company_name",
            su.id AS "seller_user_id",
            su.first_name AS "seller_first_name",
            su.last_name AS "seller_last_name",
            su.email AS "seller_email",
            su.username AS "seller_username",
            sc.country AS "seller_country",
            -- Seller location
            sl.id AS "seller_location_id",
            sl.location_name AS "seller_location_name",
            sl.city AS "seller_location_city",
            sl.country AS "seller_location_country",
            -- Haulage offers info
            (SELECT COUNT(*) FROM haulage_offers ho WHERE ho.offer_id = o.id) AS "number_of_haulage_offers",
            (SELECT ho.id FROM haulage_offers ho WHERE ho.offer_id = o.id AND ho.status = 'accepted' LIMIT 1) AS "accepted_haulage_offer_id",
            EXISTS (
                SELECT 1
                FROM admin_notes an
                WHERE an.record_id = o.id
                  AND an.record_type = 'offer'
                  AND an.note_text <> ''
            ) AS "has_notes",
            -- Assigned admin info
            aa.id AS "assignedAdminId",
            aa.first_name AS "assignedAdminFirstName",
            aa.last_name AS "assignedAdminLastName",
            aa.email AS "assignedAdminEmail",
            aa.global_role AS "assignedAdminGlobalRole"
        FROM offers o
        JOIN listings l ON o.listing_id = l.id
        -- Join buyer related tables
        LEFT JOIN companies bc ON o.buyer_company_id = bc.id
        LEFT JOIN users bu ON o.buyer_user_id = bu.id
        LEFT JOIN company_locations bl ON o.buyer_location_id = bl.id
        -- Join seller related tables
        LEFT JOIN companies sc ON o.seller_company_id = sc.id
        LEFT JOIN users su ON o.seller_user_id = su.id
        LEFT JOIN company_locations sl ON o.seller_location_id = sl.id
        -- Join assigned admin
        LEFT JOIN users aa ON (o.assign_admin->>'assignedAdminId')::int = aa.id
        ${whereClause}
        ${orderByClause}
        LIMIT $1 OFFSET $2
    `;

        const [offersCount, offersData] = await Promise.all([
            dsOffer.execute(countSql),
            dsOffer.execute(sql, [limit, skip]),
        ]);

        const results = await Promise.all(
            offersData.map(async (row: any) => {
                // Convert currency for offer data
                const convertedOffer = await this.exchangeRateService.convertOfferToBaseCurrency({
                    offeredPricePerUnit: Number(row.offered_price_per_unit),
                    totalPrice: Number(row.total_price),
                    currency: row.currency,
                });

                return {
                    offer: {
                        id: row.id,
                        createdAt: row.created_at,
                        quantity: Number(row.quantity),
                        offeredPricePerUnit: convertedOffer.offeredPricePerUnit,
                        totalPrice: convertedOffer.totalPrice,
                        status: row.status,
                        state: row.state,
                        expiresAt: row.expires_at,
                        earliestDeliveryDate: row.earliest_delivery_date,
                        latestDeliveryDate: row.latest_delivery_date,
                        currency: convertedOffer.currency,
                        originalCurrency: convertedOffer.originalCurrency,
                        message: row.message,
                        rejectionReason: row.rejection_reason,
                        incoterms: row.incoterms,
                        shippingPort: row.shipping_port,
                        needsTransport: row.needs_transport,
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
                        hasNotes: row.has_notes === true,
                        listingId: row.listing_id,
                        buyerCompanyId: row.buyer_company_id,
                        buyerLocationId: row.buyer_location_id,
                        buyerUserId: row.buyer_user_id,
                        buyerCountry: row.buyer_country,
                        sellerCompanyId: row.seller_company_id,
                        sellerLocationId: row.seller_location_id,
                        sellerUserId: row.seller_user_id,
                        sellerCountry: row.seller_country,
                        acceptedByUserId: row.accepted_by_user_id,
                        rejectedByUserId: row.rejected_by_user_id,
                        createdByUserId: row.created_by_user_id,
                        updatedAt: row.updated_at,
                        haulageOffersCount: Number(row.number_of_haulage_offers || 0),
                        hasAcceptedHaulageOffer: !!row.accepted_haulage_offer_id,
                        acceptedHaulageOfferId: row.accepted_haulage_offer_id
                            ? Number(row.accepted_haulage_offer_id)
                            : null,
                    },
                    listing: {
                        id: row.listing_id,
                        title: row.title,
                        status: row.listing_status,
                        state: row.listing_state,
                        materialWeightPerUnit: row.material_weight_per_unit,
                        materialWeightWanted: Number(row.material_weight_wanted),
                        weightPerLoad: row.weight_per_load,
                        quantity: Number(row.listing_quantity),
                        remainingQuantity: Number(row.remaining_quantity),
                        materialPacking: row.material_packing,
                        materialType: row.material_type,
                        materialItem: row.material_item,
                        materialFinishing: row.material_finishing,
                        materialForm: row.material_form,
                        materialGrading: row.material_grading,
                        materialColor: row.material_color,
                        guidePrice: row.listing_guide_price,
                        currency: row.listing_currency,
                        pern: row.listing_pern,
                        createdAt: row.listing_created_at,
                    },
                    buyer: {
                        user: {
                            id: row.buyer_user_id,
                            firstName: row.buyer_first_name,
                            lastName: row.buyer_last_name,
                            email: row.buyer_email,
                            username: row.buyer_username,
                        },
                        company: {
                            id: row.buyer_company_id,
                            name: row.buyer_company_name,
                        },
                        location: {
                            id: row.buyer_location_id,
                            locationName: row.buyer_location_name,
                            city: row.buyer_location_city,
                            country: row.buyer_location_country,
                        },
                        country: row.buyer_country,
                    },
                    seller: {
                        user: {
                            id: row.seller_user_id,
                            firstName: row.seller_first_name,
                            lastName: row.seller_last_name,
                            email: row.seller_email,
                            username: row.seller_username,
                        },
                        company: {
                            id: row.seller_company_id,
                            name: row.seller_company_name,
                        },
                        location: {
                            id: row.seller_location_id,
                            locationName: row.seller_location_name,
                            city: row.seller_location_city,
                            country: row.seller_location_country,
                        },
                        country: row.seller_country,
                    },
                    numberOfHaulageOffers: parseInt(row.number_of_haulage_offers) || 0,
                };
            }),
        );

        return {
            totalCount: offersCount[0]?.totalCount ?? 0,
            results: results as OfferDetails[],
        };
    }

    public async createOffer(biddingForm: BiddingForm): Promise<Offers> {
        const { listingId, listingType, companyId, locationId, createdByUserId } = biddingForm;
        const offerData: Partial<Offers> = {
            createdByUserId,
            listingId,
            quantity: biddingForm.quantity,
            offeredPricePerUnit: biddingForm.offeredPricePerUnit,
            currency: biddingForm.currency,
            totalPrice: biddingForm.quantity * biddingForm.offeredPricePerUnit,
            status: OfferStatusEnum.PENDING,
            state: OfferState.PENDING,
            expiresAt: new Date(biddingForm.expiresAt),
            earliestDeliveryDate: new Date(biddingForm.earliestDeliveryDate),
            latestDeliveryDate: new Date(biddingForm.latestDeliveryDate),
            incoterms: biddingForm.incoterms,
            shippingPort: biddingForm.shippingPort,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const listing = await this.listingsRepository.findById(listingId);
        if (!listing) {
            throw new HttpErrors[404](messages.listingNotFound);
        }
        if (listing.status !== ListingStatus.AVAILABLE) {
            throw new HttpErrors[400](messages.listingNotAvailable);
        }
        if (biddingForm.quantity > (listing?.remainingQuantity ?? listing?.quantity ?? 0)) {
            throw new HttpErrors[400](messages.quantityExceeded);
        }
        if (createdByUserId === listing.createdByUserId || companyId === listing.companyId) {
            throw new HttpErrors[400](messages.cannotBidOnOwnListing);
        }
        if (listingType === ListingType.SELL) {
            const companyLocationBuyer = await this.companyLocationsRepository.findById(locationId);
            if (!companyLocationBuyer) {
                throw new HttpErrors[404](messages.companyLocationNotFound);
            }
            const companyLocationSeller = await this.companyLocationsRepository.findById(listing.locationId);
            if (!companyLocationSeller) {
                throw new HttpErrors[404](messages.companyLocationNotFound);
            }

            // Get company countries instead of location countries
            const buyerCompany = await this.companiesRepository.findById(companyId);
            const sellerCompany = await this.companiesRepository.findById(listing.companyId);

            if (!buyerCompany) {
                throw new HttpErrors[404](messages.companyNotFound);
            }
            if (!sellerCompany) {
                throw new HttpErrors[404](messages.companyNotFound);
            }

            offerData.buyerCompanyId = companyId;
            offerData.buyerLocationId = locationId;
            offerData.buyerCountry = buyerCompany.country;
            offerData.buyerUserId = createdByUserId;
            offerData.sellerCompanyId = listing.companyId;
            offerData.sellerLocationId = listing.locationId;
            offerData.sellerCountry = sellerCompany.country;
            offerData.sellerUserId = listing.createdByUserId;
        } else if (listingType === ListingType.WANTED) {
            const companyLocationSeller = await this.companyLocationsRepository.findById(locationId);
            if (!companyLocationSeller) {
                throw new HttpErrors[404](messages.companyLocationNotFound);
            }

            // Get company countries instead of location countries
            const sellerCompany = await this.companiesRepository.findById(companyId);
            const buyerCompany = await this.companiesRepository.findById(listing.companyId);

            if (!sellerCompany) {
                throw new HttpErrors[404](messages.companyNotFound);
            }
            if (!buyerCompany) {
                throw new HttpErrors[404](messages.companyNotFound);
            }

            offerData.sellerCompanyId = companyId;
            offerData.sellerLocationId = locationId;
            offerData.sellerCountry = sellerCompany.country;
            offerData.sellerUserId = createdByUserId;
            offerData.buyerCompanyId = listing.companyId;
            offerData.buyerCountry = buyerCompany.country;
            offerData.buyerUserId = listing.createdByUserId;
        } else {
            throw new HttpErrors[400](messages.invalidListingType);
        }

        const createdOffer = await this.offersRepository.create(offerData);

        // Trigger Salesforce sync after successful offer creation (fire-and-forget)
        if (this.salesforceSyncService && createdOffer.id) {
            this.salesforceSyncService.syncOffer(createdOffer.id, true, false, 'createOffer').catch((syncError) => {
                SalesforceLogger.error('Sync failed after offer creation', syncError, { entity: 'Offer', offerId: createdOffer.id, action: 'create' });
            });
        }

        return createdOffer;
    }

    public async handleRequestAction(
        offerId: number,
        requestAction: string,
        currentUserProfile: MyUserProfile,
        optionals: { rejectionReason?: string } = {},
    ): Promise<void> {
        let { rejectionReason } = optionals;

        const offer = await this.offersRepository.findById(offerId);

        if (!offer) {
            throw new HttpErrors[404](messages.offerNotFound);
        } else if (offer.status !== OfferStatusEnum.APPROVED) {
            throw new HttpErrors[400](messages.offerNotAction);
        }

        const listing = await this.listingsRepository.findById(offer.listingId);

        if (!listing) {
            throw new HttpErrors[404](messages.listingNotFound);
        }

        if (listing.status !== ListingStatus.AVAILABLE) {
            throw new HttpErrors[400](messages.listingNotAvailable);
        }

        switch (requestAction) {
            case OfferRequestActionEnum.ACCEPT: {
                const offerQuantity = offer.quantity;
                let listingRemainingQuantity = (listing.remainingQuantity ?? 0) - offerQuantity;

                if (listingRemainingQuantity < 0) {
                    listingRemainingQuantity = 0;
                }

                await Promise.all([
                    this.offersRepository.updateById(offerId, {
                        state: OfferState.CLOSED,
                        status: OfferStatusEnum.ACCEPTED,
                        acceptedByUserId: currentUserProfile.id,
                    }),
                    listingRemainingQuantity === 0
                        ? (this.offersRepository.updateAll(
                              {
                                  state: OfferState.CLOSED,
                                  status: OfferStatusEnum.REJECTED,
                                  rejectedByUserId: currentUserProfile.id,
                                  rejectionReason: 'No load remaining',
                                  rejectionSource: 'system',
                              },
                              {
                                  id: { neq: offerId },
                                  listingId: offer.listingId,
                                  state: OfferState.ACTIVE,
                                  status: OfferStatusEnum.APPROVED,
                              },
                          ),
                          (() => {
                              // For ongoing listings, calculate reset date (endDate) so cron can auto-reset
                              const soldUpdateData: any = {
                                  remainingQuantity: listingRemainingQuantity,
                                  status: ListingStatus.SOLD,
                                  updatedAt: new Date(),
                              };
                              if (listing.listingRenewalPeriod) {
                                  // If endDate is in the future, keep it (valid reset date from previous cycle)
                                  // Otherwise: startDate + renewalPeriod (first time)
                                  const now = new Date();
                                  if (!listing.endDate || new Date(listing.endDate) <= now) {
                                      const baseDate = listing.startDate ? new Date(listing.startDate) : now;
                                      const periodDays: Record<string, number> = {
                                          [RenewalPeriod.WEEKLY]: 7,
                                          [RenewalPeriod.FORTNIGHTLY]: 14,
                                          [RenewalPeriod.MONTHLY]: 30,
                                      };
                                      const days = periodDays[listing.listingRenewalPeriod] ?? 7;
                                      const resetDate = new Date(baseDate);
                                      resetDate.setDate(resetDate.getDate() + days);
                                      soldUpdateData.endDate = resetDate;
                                  }
                              }
                              return this.listingsRepository.updateById(listing.id, soldUpdateData);
                          })())
                        : null,
                    // Only remainingQuantity changes (not mapped to SF) — preserve current sync state
                    this.listingsRepository.updateById(listing.id, {
                        remainingQuantity: listingRemainingQuantity,
                        updatedAt: new Date(),
                        isSyncedSalesForce: listing.isSyncedSalesForce ?? false,
                    } as any),
                ]);

                break;
            }
            case OfferRequestActionEnum.REJECT: {
                if (rejectionReason === undefined) {
                    rejectionReason = 'Offer rejected by seller';
                }
                await this.offersRepository.updateById(offerId, {
                    status: OfferStatusEnum.REJECTED,
                    state: OfferState.CLOSED,
                    rejectionReason,
                    rejectedByUserId: currentUserProfile.id,
                    rejectionSource: 'seller',
                });

                break;
            }

            default:
                throw new HttpErrors[404](messages.notFound);
        }

        // Trigger Salesforce sync after seller action (fire-and-forget)
        if (this.salesforceSyncService) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.salesforceSyncService.syncOffer(offerId, true, false, 'sellerAction').catch((err) => {
                SalesforceLogger.error('Sync failed after seller action on offer', err, { entity: 'Offer', offerId, action: 'seller_action' });
            });
            // Sync listing too — seller accept updates remainingQuantity/status
            if (requestAction === OfferRequestActionEnum.ACCEPT && listing.id) {
                const syncListingFn = listing.listingType === ListingType.WANTED
                    ? this.salesforceSyncService.syncWantedListing(listing.id, true, false, 'sellerAcceptListing')
                    : this.salesforceSyncService.syncListing(listing.id, true, false, 'sellerAcceptListing');
                syncListingFn.catch((err) => {
                    SalesforceLogger.error('Sync failed after seller action on listing', err, { entity: 'Listing', listingId: listing.id, action: 'seller_accept' });
                });
            }
        }
    }

    private async handleSendOfferApprovedEmailAndNotification(offer: Offers, listing: Listings): Promise<void> {
        const [seller, sellerLocation, buyerLocation] = await Promise.all([
            this.userRepository.findById(offer.sellerUserId),
            this.companyLocationsRepository.findById(offer.sellerLocationId),
            this.companyLocationsRepository.findById(offer.buyerLocationId),
        ]);
        const pickupLocationCountry = sellerLocation ? sellerLocation.country : null;
        const destinationLocationCountry = buyerLocation ? buyerLocation.country : null;

        if (!seller) {
            console.error(
                `handleSendOfferApprovedEmailAndNotification: Seller not found for offer ${offer.id} in listing ${listing.id}`,
            );
            return;
        }

        // get all haulier companies
        const haulierCompanies = await this.companyUsersRepository
            .find({
                include: [
                    {
                        relation: 'company',
                        scope: {
                            where: {
                                isHaulier: true,
                            },
                        },
                    },
                    {
                        relation: 'user',
                        scope: {
                            fields: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                ],
            })
            .catch((e) => {
                console.error('handleSendOfferApprovedEmailAndNotification Error getting haulier companies:', e);
                return [];
            });

        await Promise.all([
            ...(listing.listingType === ListingType.SELL && sellerLocation && sellerLocation
                ? (haulierCompanies || []).map(async (haulierCompany) => {
                      const company = haulierCompany.company as Companies;

                      if (!company) {
                          return null;
                      }

                      // If the company covers only UK, and the pickup or destination location is not in the UK, skip
                      if (
                          company.areasCovered?.[0] === AreaCovered.UK_ONLY &&
                          (pickupLocationCountry !== UK_ISO_CODE || destinationLocationCountry !== UK_ISO_CODE)
                      ) {
                          return null;
                      }
                      // If the company covers only EU, and the pickup or destination location is not in the company's areas covered, skip
                      if (
                          company.areasCovered?.[0] !== AreaCovered.WORLDWIDE &&
                          (company.areasCovered?.length ?? 0) > 0 &&
                          ![pickupLocationCountry, destinationLocationCountry].every((country) =>
                              company.areasCovered?.includes(country ?? ''),
                          )
                      ) {
                          return null;
                      }

                      await Promise.all([
                          this.wasteTradeNotificationsService.createNotification(
                              haulierCompany.userId,
                              NotificationType.NEW_HAULAGE_OPPORTUNITY,
                              {
                                  offerId: offer.id,
                                  listingId: listing.id,
                                  listingType: listing.listingType,
                                  listingTitle: ListingHelper.getListingTitle(listing),
                              },
                          ),
                          this.emailService.sendNewHaulageOpportunityEmail(haulierCompany.user),
                      ]);
                  })
                : []),
        ]);
    }

    private async sendOfferAcceptanceEmail(offer: Offers, listing: Listings): Promise<void> {
        if (listing.listingType === ListingType.SELL) {
            const buyer = await this.userRepository.findById(offer.buyerUserId);
            await this.emailService.sendOfferAcceptEmail(offer, buyer);
        } else {
            const seller = await this.userRepository.findById(offer.sellerUserId);
            await this.emailService.sendOfferAcceptEmail(offer, seller);
        }
    }

    private async sendOfferRejectionEmail(offer: Offers, listing: Listings, rejectionReason?: string): Promise<void> {
        if (listing.listingType === ListingType.SELL) {
            const buyer = await this.userRepository.findById(offer.buyerUserId);
            await this.emailService.sendOfferRejectionEmail(offer, buyer, rejectionReason);
        } else {
            const seller = await this.userRepository.findById(offer.sellerUserId);
            await this.emailService.sendOfferRejectionEmail(offer, seller, rejectionReason);
        }
    }

    private async sendOfferRequestInformationEmail(offer: Offers, listing: Listings, message?: string): Promise<void> {
        if (listing.listingType === ListingType.SELL) {
            const buyer = await this.userRepository.findById(offer.buyerUserId);
            await this.emailService.sendOfferRequestInformationEmail(offer, buyer, message);
        } else {
            const seller = await this.userRepository.findById(offer.sellerUserId);
            await this.emailService.sendOfferRequestInformationEmail(offer, seller, message);
        }
    }

    public async rejectAllPendingAndApprovedOffersForListing(listingId: number, reason?: string): Promise<void> {
        const rejectionReason = reason ?? 'Listing marked as sold';

        // Find all pending and approved offers for this listing
        const offersToReject = await this.offersRepository.find({
            where: {
                listingId,
                status: { inq: [OfferStatusEnum.PENDING, OfferStatusEnum.APPROVED] },
                state: { nin: [OfferState.CLOSED] },
            },
        });

        if (offersToReject.length === 0) {
            return; // No offers to reject
        }

        // Update all pending/approved offers to rejected status
        await this.offersRepository.updateAll(
            {
                status: OfferStatusEnum.REJECTED,
                state: OfferState.CLOSED,
                rejectionReason,
                rejectionSource: 'system',
                updatedAt: new Date(),
            },
            {
                listingId,
                status: { inq: [OfferStatusEnum.PENDING, OfferStatusEnum.APPROVED] },
                state: { nin: [OfferState.CLOSED] },
            },
        );

        console.log(`Rejected ${offersToReject.length} pending/approved offers for listing ${listingId}`);
    }

    public async handleAdminRequestAction(
        offerId: number,
        requestAction: string,
        optionals: { rejectionReason?: string; message?: string } = {},
    ): Promise<void> {
        let { rejectionReason, message } = optionals;
        const offer = await this.offersRepository.findById(offerId);
        const listing = await this.listingsRepository.findById(offer.listingId);
        if (!offer) {
            throw new HttpErrors[404](messages.offerNotFound);
        }

        if (offer.status !== OfferStatusEnum.PENDING) {
            throw new HttpErrors[400](messages.offerNotAction);
        }

        switch (requestAction) {
            case OfferRequestActionEnum.ACCEPT: {
                await this.offersRepository.updateById(offerId, {
                    status: OfferStatusEnum.APPROVED,
                    state: OfferState.ACTIVE,
                });
                await this.sendOfferAcceptanceEmail(offer, listing);

                this.handleSendOfferApprovedEmailAndNotification(offer, listing).catch((e) => {
                    console.error('Error sending offer approved email and notification:', e);
                });

                break;
            }
            case OfferRequestActionEnum.REJECT: {
                if (rejectionReason === undefined) {
                    rejectionReason = 'Unsuitable offer';
                }
                // If rejection reason is "Other", use the message field instead
                const emailRejectionReason =
                    rejectionReason === 'Other' ? (message ?? rejectionReason) : rejectionReason;
                await this.offersRepository.updateById(offerId, {
                    status: OfferStatusEnum.REJECTED,
                    state: OfferState.CLOSED,
                    rejectionReason: emailRejectionReason,
                    rejectionSource: 'admin',
                });
                await this.sendOfferRejectionEmail(offer, listing, emailRejectionReason);
                break;
            }
            case OfferRequestActionEnum.REQUEST_INFORMATION: {
                if (message === undefined) {
                    message = 'Please check the offer and provide more information';
                }
                await this.offersRepository.updateById(offerId, {
                    status: OfferStatusEnum.PENDING,
                    state: OfferState.PENDING,
                    message,
                });
                await this.sendOfferRequestInformationEmail(offer, listing, message);
                break;
            }
            default:
                throw new HttpErrors[404](messages.notFound);
        }

        const [user, offerUpdated] = await Promise.all([
            this.userRepository.findById(offer.createdByUserId),
            this.offersRepository.findById(offerId),
        ]);

        // Trigger Salesforce sync after admin action (fire-and-forget)
        if (this.salesforceSyncService && offerUpdated?.id) {
            this.salesforceSyncService.syncOffer(offerUpdated.id, true, false, 'adminAction').catch((err) => {
                SalesforceLogger.error('Sync failed after admin action on offer', err, { entity: 'Offer', offerId: offerUpdated.id, action: 'admin_action' });
            });
        }

        if (user) {
            await Promise.all([
                this.emailService.sendOfferStatusUpdatedEmail(offerUpdated, listing, user),
                this.wasteTradeNotificationsService.createNotification(
                    user.id ?? 0,
                    NotificationType.OFFER_STATUS_UPDATED,
                    {
                        offerId: offerUpdated.id,
                        listingId: listing.id,
                        listingType: listing.listingType,
                        listingTitle: ListingHelper.getListingTitle(listing),
                        createdAt: offerUpdated.createdAt,
                        status: offerUpdated.status,
                    },
                ),
            ]);
        }
    }

    public async getOfferCompanies(): Promise<OfferCompanies> {
        const dsOffer = this.offersRepository.dataSource;

        const query = `
            WITH buyer_companies AS (
                SELECT DISTINCT
                    c.id,
                    c.name,
                    MAX(o.buyer_country) as country
                FROM offers o
                JOIN companies c ON o.buyer_company_id = c.id
                WHERE o.buyer_company_id IS NOT NULL
                GROUP BY c.id, c.name
            ),
            seller_companies AS (
                SELECT DISTINCT
                    c.id,
                    c.name,
                    MAX(o.seller_country) as country
                FROM offers o
                JOIN companies c ON o.seller_company_id = c.id
                WHERE o.seller_company_id IS NOT NULL
                GROUP BY c.id, c.name
            )
            SELECT 
                json_build_object(
                    'buyerCompanies', (SELECT json_agg(buyer_companies.*) FROM buyer_companies),
                    'sellerCompanies', (SELECT json_agg(seller_companies.*) FROM seller_companies)
                ) as result
        `;

        const result = await dsOffer.execute(query);
        const companies = result[0]?.result || { buyerCompanies: [], sellerCompanies: [] };

        return companies;
    }
}
