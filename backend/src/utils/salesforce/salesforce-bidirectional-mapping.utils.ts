/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Bidirectional mapping between WasteTrade and Salesforce field values.
 * Uses generated SF picklist constants to prevent mismatch bugs.
 */

import {
    ContactCompanyUserStatusValues,
    LeadWasteTradeUserStatusValues,
    OffersBidStatusValues,
    SalesListingListingStatusValues,
    HaulageLoadsLoadStatusValues,
    HaulageOffersCurrencyIsoCodeValues,
    HaulageOffersCustomsClearanceValues,
    HaulageOffersTransportProviderValues,
    HaulageOffersTrailerTypeValues,
    HaulageOffersTrailerOrContainerValues,
    HaulageOffersExpectedValues,
    HaulageOffersHaulierListingStatusValues,
} from './generated';
import {
    CompanyUserRoleEnum,
    CompanyUserStatusEnum,
    CompanyStatus,
    HaulageOfferStatus,
    TransportProvider,
    ListingStatus,
    ECurrency,
    OfferStatusEnum,
    UserStatus,
} from '../../enum';

// Shorthand aliases for SF picklist values
const SF_CU_STATUS = ContactCompanyUserStatusValues;
const SF_BID_STATUS = OffersBidStatusValues;
const SF_LISTING_STATUS = SalesListingListingStatusValues;
const SF_LOAD_STATUS = HaulageLoadsLoadStatusValues;
const SF_CURRENCY = HaulageOffersCurrencyIsoCodeValues;
const SF_CUSTOMS = HaulageOffersCustomsClearanceValues;
const SF_TRANSPORT = HaulageOffersTransportProviderValues;
const SF_TRAILER = HaulageOffersTrailerTypeValues;
const SF_TRAILER_OR_CONTAINER = HaulageOffersTrailerOrContainerValues;
const SF_HAULAGE_STATUS = HaulageOffersHaulierListingStatusValues;
const SF_TRANSIT = HaulageOffersExpectedValues;
const SF_LEAD_USER_STATUS = LeadWasteTradeUserStatusValues;

/**
 * Map CompanyUser Role between WasteTrade (lowercase) and Salesforce (UPPERCASE)
 * No generated SF picklist for roles — uses hardcoded values
 */
export function mapCompanyRole(value: string | undefined, isInbound = false): string | undefined {
    if (!value) return undefined;

    const outboundMap: Record<string, string> = {
        [CompanyUserRoleEnum.ADMIN]: 'ADMIN',
        [CompanyUserRoleEnum.BUYER]: 'BUYER',
        [CompanyUserRoleEnum.SELLER]: 'SELLER',
        [CompanyUserRoleEnum.HAULIER]: 'HAULIER',
        [CompanyUserRoleEnum.BOTH]: 'DUAL',
    };

    const inboundMap: Record<string, string> = {
        'ADMIN': CompanyUserRoleEnum.ADMIN,
        'BUYER': CompanyUserRoleEnum.BUYER,
        'SELLER': CompanyUserRoleEnum.SELLER,
        'HAULIER': CompanyUserRoleEnum.HAULIER,
        'DUAL': CompanyUserRoleEnum.BOTH,
    };

    const map = isInbound ? inboundMap : outboundMap;
    return map[value] || (isInbound ? value.toLowerCase() : value.toUpperCase());
}

/**
 * Map CompanyUser Status between WasteTrade and Salesforce
 * SF picklist: PENDING, ACTIVE, REJECTED, INACTIVE, REQUEST_INFORMATION
 */
export function mapCompanyUserStatus(value: string | undefined, isInbound = false): string | undefined {
    if (!value) return undefined;

    const outboundMap: Record<string, string> = {
        [CompanyUserStatusEnum.ACTIVE]: SF_CU_STATUS.ACTIVE,
        [CompanyUserStatusEnum.PENDING]: SF_CU_STATUS.PENDING,
        [CompanyUserStatusEnum.REJECTED]: SF_CU_STATUS.REJECTED,
        [CompanyUserStatusEnum.REQUEST_INFORMATION]: SF_CU_STATUS.REQUEST_INFORMATION,
    };

    const inboundMap: Record<string, string> = {
        [SF_CU_STATUS.ACTIVE]: CompanyUserStatusEnum.ACTIVE,
        [SF_CU_STATUS.PENDING]: CompanyUserStatusEnum.PENDING,
        [SF_CU_STATUS.REJECTED]: CompanyUserStatusEnum.REJECTED,
        [SF_CU_STATUS.REQUEST_INFORMATION]: CompanyUserStatusEnum.REQUEST_INFORMATION,
        // Legacy: INACTIVE mapped to request_information for backward compat
        [SF_CU_STATUS.INACTIVE]: CompanyUserStatusEnum.REQUEST_INFORMATION,
    };

    const map = isInbound ? inboundMap : outboundMap;
    return map[value] || (isInbound ? value.toLowerCase() : value.toUpperCase());
}

/**
 * Map Haulage Offer Status between WasteTrade and Salesforce
 * SF picklist: Pending Approval, Approved, Rejected (only 3 values — lossy mapping)
 */
export function mapHaulageOfferStatus(
    value: string | undefined,
    isInbound = false,
    currentWtStatus?: string,
): string | undefined {
    if (!value) return isInbound ? HaulageOfferStatus.PENDING : SF_HAULAGE_STATUS.Pending_Approval;

    const outboundMap: Record<string, string> = {
        [HaulageOfferStatus.PENDING]: SF_HAULAGE_STATUS.Pending_Approval,
        [HaulageOfferStatus.APPROVED]: SF_HAULAGE_STATUS.Approved,
        [HaulageOfferStatus.ACCEPTED]: SF_HAULAGE_STATUS.Approved,
        [HaulageOfferStatus.REJECTED]: SF_HAULAGE_STATUS.Rejected,
        [HaulageOfferStatus.WITHDRAWN]: SF_HAULAGE_STATUS.Rejected,
        [HaulageOfferStatus.INFORMATION_REQUESTED]: SF_HAULAGE_STATUS.Pending_Approval,
        [HaulageOfferStatus.OPEN_FOR_EDITS]: SF_HAULAGE_STATUS.Pending_Approval,
        [HaulageOfferStatus.PARTIALLY_SHIPPED]: SF_HAULAGE_STATUS.Approved,
        [HaulageOfferStatus.SHIPPED]: SF_HAULAGE_STATUS.Approved,
    };

    const inboundMap: Record<string, string> = {
        // SF picklist values (raw from Salesforce)
        [SF_HAULAGE_STATUS.Pending_Approval]: HaulageOfferStatus.PENDING,
        [SF_HAULAGE_STATUS.Approved]: HaulageOfferStatus.APPROVED,
        [SF_HAULAGE_STATUS.Rejected]: HaulageOfferStatus.REJECTED,
        // Pre-mapped WT values (Apex mapHaulageStatus already converts before sending)
        [HaulageOfferStatus.PENDING]: HaulageOfferStatus.PENDING,
        [HaulageOfferStatus.APPROVED]: HaulageOfferStatus.APPROVED,
        [HaulageOfferStatus.ACCEPTED]: HaulageOfferStatus.ACCEPTED,
        [HaulageOfferStatus.REJECTED]: HaulageOfferStatus.REJECTED,
        [HaulageOfferStatus.WITHDRAWN]: HaulageOfferStatus.WITHDRAWN,
        [HaulageOfferStatus.INFORMATION_REQUESTED]: HaulageOfferStatus.INFORMATION_REQUESTED,
        [HaulageOfferStatus.OPEN_FOR_EDITS]: HaulageOfferStatus.OPEN_FOR_EDITS,
        [HaulageOfferStatus.PARTIALLY_SHIPPED]: HaulageOfferStatus.PARTIALLY_SHIPPED,
        [HaulageOfferStatus.SHIPPED]: HaulageOfferStatus.SHIPPED,
    };

    if (isInbound) {
        const mapped = inboundMap[value] || value;
        // Preserve current WT status when SF 'Approved' maps ambiguously
        // SF has one 'Approved' for both WT 'approved' and 'accepted'
        if (mapped === HaulageOfferStatus.APPROVED && currentWtStatus) {
            const preserveStatuses = [
                HaulageOfferStatus.ACCEPTED,
                HaulageOfferStatus.PARTIALLY_SHIPPED,
                HaulageOfferStatus.SHIPPED,
            ];
            if (preserveStatuses.includes(currentWtStatus as HaulageOfferStatus)) {
                return currentWtStatus;
            }
        }
        return mapped;
    }

    // Outbound map keys use HaulageOfferStatus enum values (already lowercase)
    return outboundMap[value] || outboundMap[value.toLowerCase()] || SF_HAULAGE_STATUS.Pending_Approval;
}

/**
 * Map Transport Provider between WasteTrade and Salesforce
 * SF picklist: Own Haulage, Third Party Haulier, Mixed Haulage
 */
export function mapTransportProvider(value: string | undefined, isInbound = false): string | undefined {
    if (!value) return undefined;

    const outboundMap: Record<string, string> = {
        [TransportProvider.OWN_HAULAGE]: SF_TRANSPORT.Own_Haulage,
        [TransportProvider.MIXED]: SF_TRANSPORT.Mixed_Haulage,
        mixed_haulage: SF_TRANSPORT.Mixed_Haulage,
        [TransportProvider.THIRD_PARTY]: SF_TRANSPORT.Third_Party_Haulier,
        third_party_haulier: SF_TRANSPORT.Third_Party_Haulier,
    };

    const inboundMap: Record<string, string> = {
        [SF_TRANSPORT.Own_Haulage]: TransportProvider.OWN_HAULAGE,
        [SF_TRANSPORT.Mixed_Haulage]: TransportProvider.MIXED,
        [SF_TRANSPORT.Third_Party_Haulier]: TransportProvider.THIRD_PARTY,
        // Pre-mapped WT values (Apex may convert before sending)
        [TransportProvider.OWN_HAULAGE]: TransportProvider.OWN_HAULAGE,
        [TransportProvider.MIXED]: TransportProvider.MIXED,
        mixed_haulage: TransportProvider.MIXED,
        [TransportProvider.THIRD_PARTY]: TransportProvider.THIRD_PARTY,
        third_party_haulier: TransportProvider.THIRD_PARTY,
    };

    const map = isInbound ? inboundMap : outboundMap;
    const key = isInbound ? value : value.toLowerCase().replace(/ /g, '_');
    return map[key] || value;
}

/**
 * Map Expected Transit Time between WasteTrade and Salesforce
 * SF picklist: 1-2 Days, 3-4 Days, 4-6 Days, 1 Week, 2 Weeks, 3 Weeks, 1 Month
 * Values are identical between FE/BE and SF
 */
export function mapExpectedTransitTime(value: string | undefined, isInbound = false): string | undefined {
    if (!value) return undefined;

    const validValues = [
        SF_TRANSIT._1_2_Days,
        SF_TRANSIT._3_4_Days,
        SF_TRANSIT._4_6_Days,
        SF_TRANSIT._1_Week,
        SF_TRANSIT._2_Weeks,
        SF_TRANSIT._3_Weeks,
        SF_TRANSIT._1_Month,
    ];

    // Direct match — values are the same between WT and SF
    if (validValues.includes(value as any)) {
        return value;
    }

    // Legacy value mapping for old data
    const legacyMap: Record<string, string> = {
        '1': SF_TRANSIT._1_2_Days,
        '2-3': SF_TRANSIT._3_4_Days,
        '4-5': SF_TRANSIT._4_6_Days,
        '6-7': SF_TRANSIT._1_Week,
        '8-10': SF_TRANSIT._1_Week,
        '11-14': SF_TRANSIT._2_Weeks,
        '1_2_days': SF_TRANSIT._1_2_Days,
        '3_4_days': SF_TRANSIT._3_4_Days,
        '4_6_days': SF_TRANSIT._4_6_Days,
        '1_week': SF_TRANSIT._1_Week,
        '2_weeks': SF_TRANSIT._2_Weeks,
        '3_weeks': SF_TRANSIT._3_Weeks,
        '1_month': SF_TRANSIT._1_Month,
    };

    return legacyMap[value] || legacyMap[value.toLowerCase().replace(/-/g, '_').replace(/ /g, '_')] || SF_TRANSIT._1_Week;
}

/**
 * Map Customs Clearance between WasteTrade (boolean) and Salesforce (picklist)
 * SF picklist: Yes, No, Customs Clearance Not Required
 */
export function mapCustomsClearance(value: boolean | string | undefined, isInbound = false): boolean | string | undefined {
    if (value === undefined || value === null) {
        return isInbound ? false : SF_CUSTOMS.Customs_Clearance_Not_Required;
    }

    if (isInbound) {
        if (typeof value === 'boolean') return value;
        return value === SF_CUSTOMS.Yes;
    } else {
        if (typeof value === 'string') return value;
        if (value === true) return SF_CUSTOMS.Yes;
        if (value === false) return SF_CUSTOMS.No;
        return SF_CUSTOMS.Customs_Clearance_Not_Required;
    }
}

/**
 * Map Trailer/Container type between WasteTrade and Salesforce
 * SF picklist: Curtain Sider, Containers, Tipper Trucks, Walking Floor
 */
export function mapTrailerContainer(
    value: string | { trailerOrContainer?: string; trailerType?: string } | undefined,
    isInbound = false,
): string | { trailerOrContainer?: string; trailerType?: string } | undefined {
    if (!value) return undefined;

    const sfTrailerTypes = [
        SF_TRAILER.Curtain_Sider,
        SF_TRAILER.Containers,
        SF_TRAILER.Tipper_Trucks,
        SF_TRAILER.Walking_Floor,
    ];

    // Legacy FE/BE values → SF trailer types
    const legacyTrailerMap: Record<string, string> = {
        curtain_slider_standard: SF_TRAILER.Curtain_Sider,
        curtain_slider_high_cube: SF_TRAILER.Curtain_Sider,
        walking_floor: SF_TRAILER.Walking_Floor,
        tipper: SF_TRAILER.Tipper_Trucks,
        tipper_trucks: SF_TRAILER.Tipper_Trucks,
        containers: SF_TRAILER.Containers,
    };

    if (isInbound) {
        if (typeof value === 'object') {
            const { trailerOrContainer, trailerType } = value;
            if (trailerOrContainer === SF_TRAILER_OR_CONTAINER.Trailer && trailerType) {
                return trailerType;
            }
            return trailerType || trailerOrContainer;
        }
        return value;
    } else {
        if (typeof value !== 'string') return undefined;

        if (sfTrailerTypes.includes(value as any)) {
            return { trailerOrContainer: SF_TRAILER_OR_CONTAINER.Trailer, trailerType: value };
        }

        const mappedTrailerType = legacyTrailerMap[value.toLowerCase()];
        if (mappedTrailerType) {
            return { trailerOrContainer: SF_TRAILER_OR_CONTAINER.Trailer, trailerType: mappedTrailerType };
        }

        return { trailerOrContainer: SF_TRAILER_OR_CONTAINER.Trailer, trailerType: value };
    }
}

/**
 * Map Currency between WasteTrade (lowercase) and Salesforce (uppercase)
 * SF picklist: GBP, EUR, USD
 */
export function mapCurrency(value: string | undefined, isInbound = false): string | undefined {
    if (!value) return undefined;
    const validCurrencies = [SF_CURRENCY.GBP, SF_CURRENCY.EUR, SF_CURRENCY.USD];
    const upperValue = value.toUpperCase();
    if (!validCurrencies.includes(upperValue as any)) return undefined;
    // SF uses uppercase (GBP), WT enum uses lowercase (ECurrency.GBP = 'gbp')
    return isInbound ? (upperValue.toLowerCase() as ECurrency) : upperValue;
}

/**
 * Map Company Status between WasteTrade and Salesforce
 * Account_Status__c is a string field (no picklist), but we use consistent values
 */
export function mapCompanyStatus(value: string | undefined, isInbound = false): string | undefined {
    if (!value) return isInbound ? undefined : 'Pending';

    const outboundMap: Record<string, string> = {
        [CompanyStatus.PENDING]: 'Pending',
        [CompanyStatus.ACTIVE]: 'Active',
        [CompanyStatus.REJECTED]: 'Rejected',
        [CompanyStatus.REQUEST_INFORMATION]: 'Request Information',
    };

    const inboundMap: Record<string, string> = {
        'pending': CompanyStatus.PENDING,
        'active': CompanyStatus.ACTIVE,
        'rejected': CompanyStatus.REJECTED,
        'request information': CompanyStatus.REQUEST_INFORMATION,
        // Legacy: Inactive mapped to rejected for safety (no inactive in CompanyStatus enum)
        'inactive': CompanyStatus.REJECTED,
    };

    const map = isInbound ? inboundMap : outboundMap;
    // Normalize: outbound uses lowercase enum keys, inbound uses lowercase for case-insensitive matching
    const key = value.toLowerCase();
    // For inbound: return undefined for unknown values (caller decides whether to update)
    // For outbound: default to 'Pending' for unknown values
    return map[key] || (isInbound ? undefined : 'Pending');
}

/**
 * Map Listing Status between WasteTrade and Salesforce
 * SF picklist: Approved, Pending Approval, Rejected
 */
export function mapListingStatus(value: string | undefined, isInbound = false): string | undefined {
    if (!value) return isInbound ? ListingStatus.PENDING : SF_LISTING_STATUS.Pending_Approval;

    const outboundMap: Record<string, string> = {
        [ListingStatus.PENDING]: SF_LISTING_STATUS.Pending_Approval,
        [ListingStatus.AVAILABLE]: SF_LISTING_STATUS.Available,
        active: SF_LISTING_STATUS.Available,
        approved: SF_LISTING_STATUS.Approved,
        [ListingStatus.EXPIRED]: SF_LISTING_STATUS.Expired,
        [ListingStatus.SOLD]: SF_LISTING_STATUS.Sold,
        [ListingStatus.REJECTED]: SF_LISTING_STATUS.Rejected,
        withdrawn: SF_LISTING_STATUS.Rejected,
    };

    const inboundMap: Record<string, string> = {
        [SF_LISTING_STATUS.Pending_Approval]: ListingStatus.PENDING,
        [SF_LISTING_STATUS.Approved]: ListingStatus.AVAILABLE,
        [SF_LISTING_STATUS.Available]: ListingStatus.AVAILABLE,
        [SF_LISTING_STATUS.Sold]: ListingStatus.SOLD,
        [SF_LISTING_STATUS.Expired]: ListingStatus.EXPIRED,
        [SF_LISTING_STATUS.Rejected]: ListingStatus.REJECTED,
    };

    const map = isInbound ? inboundMap : outboundMap;
    const key = isInbound ? value : value.toLowerCase();
    return map[key] || (isInbound ? ListingStatus.PENDING : SF_LISTING_STATUS.Pending_Approval);
}

/**
 * Map Offer Status between WasteTrade and Salesforce
 * SF picklist (bid_status__c): Pending, Accepted, Unsuccessful, Approved, Rejected, Partially_Shipped, Shipped
 */
export function mapOfferStatus(value: string | undefined, isInbound = false): string | undefined {
    if (!value) return isInbound ? OfferStatusEnum.PENDING : SF_BID_STATUS.Pending;

    const outboundMap: Record<string, string> = {
        [OfferStatusEnum.PENDING]: SF_BID_STATUS.Pending,
        [OfferStatusEnum.APPROVED]: SF_BID_STATUS.Approved,
        [OfferStatusEnum.ACCEPTED]: SF_BID_STATUS.Accepted,
        [OfferStatusEnum.REJECTED]: SF_BID_STATUS.Rejected,
        [OfferStatusEnum.PARTIALLY_SHIPPED]: SF_BID_STATUS.Partially_Shipped,
        [OfferStatusEnum.SHIPPED]: SF_BID_STATUS.Shipped,
    };

    const inboundMap: Record<string, string> = {
        [SF_BID_STATUS.Pending]: OfferStatusEnum.PENDING,
        [SF_BID_STATUS.Approved]: OfferStatusEnum.APPROVED,
        [SF_BID_STATUS.Accepted]: OfferStatusEnum.ACCEPTED,
        [SF_BID_STATUS.Rejected]: OfferStatusEnum.REJECTED,
        [SF_BID_STATUS.Partially_Shipped]: OfferStatusEnum.PARTIALLY_SHIPPED,
        [SF_BID_STATUS.Shipped]: OfferStatusEnum.SHIPPED,
        // Legacy SF value
        [SF_BID_STATUS.Unsuccessful]: OfferStatusEnum.REJECTED,
        // Legacy format with space
        'Partially Shipped': OfferStatusEnum.PARTIALLY_SHIPPED,
        // Pre-mapped WT values (Apex may convert before sending)
        [OfferStatusEnum.PENDING]: OfferStatusEnum.PENDING,
        [OfferStatusEnum.APPROVED]: OfferStatusEnum.APPROVED,
        [OfferStatusEnum.ACCEPTED]: OfferStatusEnum.ACCEPTED,
        [OfferStatusEnum.REJECTED]: OfferStatusEnum.REJECTED,
        [OfferStatusEnum.PARTIALLY_SHIPPED]: OfferStatusEnum.PARTIALLY_SHIPPED,
        [OfferStatusEnum.SHIPPED]: OfferStatusEnum.SHIPPED,
    };

    const map = isInbound ? inboundMap : outboundMap;
    const key = isInbound ? value : value.toLowerCase();
    return map[key] || (isInbound ? OfferStatusEnum.PENDING : SF_BID_STATUS.Pending);
}

/**
 * Map User Role — no SF picklist, uses hardcoded UPPERCASE values
 */
export function mapUserRole(value: string | undefined, isInbound = false): string | undefined {
    if (!value) return undefined;

    const outboundMap: Record<string, string> = {
        admin: 'ADMIN',
        buyer: 'BUYER',
        seller: 'SELLER',
        haulier: 'HAULIER',
        dual: 'DUAL',
    };

    const inboundMap: Record<string, string> = {
        'ADMIN': 'admin',
        'BUYER': 'buyer',
        'SELLER': 'seller',
        'HAULIER': 'haulier',
        'DUAL': 'dual',
    };

    const map = isInbound ? inboundMap : outboundMap;
    const key = isInbound ? value : value.toLowerCase();
    return map[key] || value;
}

/**
 * Map User Status — used for Lead sync only (Contact uses mapCompanyUserStatus).
 * SF Lead picklist: PENDING, ACTIVE, REJECTED, INACTIVE, REQUEST_INFORMATION
 * WT enum: pending, active, rejected, request_information, archived
 */
export function mapUserStatus(value: string | undefined, isInbound = false): string | undefined {
    if (!value) return isInbound ? UserStatus.ACTIVE : SF_LEAD_USER_STATUS.ACTIVE;

    const outboundMap: Record<string, string> = {
        [UserStatus.PENDING]: SF_LEAD_USER_STATUS.PENDING,
        [UserStatus.ACTIVE]: SF_LEAD_USER_STATUS.ACTIVE,
        [UserStatus.REJECTED]: SF_LEAD_USER_STATUS.REJECTED,
        [UserStatus.REQUEST_INFORMATION]: SF_LEAD_USER_STATUS.REQUEST_INFORMATION,
        [UserStatus.ARCHIVED]: SF_LEAD_USER_STATUS.INACTIVE, // No ARCHIVED in Lead picklist
        inactive: SF_LEAD_USER_STATUS.INACTIVE, // Legacy — no UserStatus.INACTIVE
    };

    const inboundMap: Record<string, string> = {
        [SF_LEAD_USER_STATUS.PENDING]: UserStatus.PENDING,
        [SF_LEAD_USER_STATUS.ACTIVE]: UserStatus.ACTIVE,
        [SF_LEAD_USER_STATUS.REJECTED]: UserStatus.REJECTED,
        [SF_LEAD_USER_STATUS.REQUEST_INFORMATION]: UserStatus.REQUEST_INFORMATION,
        [SF_LEAD_USER_STATUS.INACTIVE]: UserStatus.ARCHIVED, // INACTIVE → archived (admin-deactivated)
    };

    const map = isInbound ? inboundMap : outboundMap;
    const key = isInbound ? value : value.toLowerCase();
    return map[key] || value;
}

/**
 * Map Load Status between WasteTrade and Salesforce
 * SF picklist and WT DB use identical values: Awaiting Collection, In Transit, Delivered
 * This mapper normalizes case and validates against known values
 */
export function mapLoadStatus(value: string | undefined, isInbound = false): string | undefined {
    if (!value) return SF_LOAD_STATUS.Awaiting_Collection;

    // SF and WT use identical Title Case values — validate and normalize
    const validValues: Record<string, string> = {
        [SF_LOAD_STATUS.Awaiting_Collection]: SF_LOAD_STATUS.Awaiting_Collection,
        [SF_LOAD_STATUS.In_Transit]: SF_LOAD_STATUS.In_Transit,
        [SF_LOAD_STATUS.Delivered]: SF_LOAD_STATUS.Delivered,
    };

    // Direct match first
    if (validValues[value]) return validValues[value];

    // Case-insensitive fallback (handles lowercase/uppercase variants from either direction)
    const lowerValue = value.toLowerCase();
    const caseInsensitiveMap: Record<string, string> = {
        'awaiting collection': SF_LOAD_STATUS.Awaiting_Collection,
        'awaiting_collection': SF_LOAD_STATUS.Awaiting_Collection,
        'in transit': SF_LOAD_STATUS.In_Transit,
        'in_transit': SF_LOAD_STATUS.In_Transit,
        'delivered': SF_LOAD_STATUS.Delivered,
    };

    return caseInsensitiveMap[lowerValue] || value;
}

export const BIDIRECTIONAL_MAPPERS = {
    haulageOfferStatus: mapHaulageOfferStatus,
    transportProvider: mapTransportProvider,
    expectedTransitTime: mapExpectedTransitTime,
    customsClearance: mapCustomsClearance,
    trailerContainer: mapTrailerContainer,
    currency: mapCurrency,
    companyStatus: mapCompanyStatus,
    listingStatus: mapListingStatus,
    offerStatus: mapOfferStatus,
    userRole: mapUserRole,
    userStatus: mapUserStatus,
    loadStatus: mapLoadStatus,
};

export type MapperKey = keyof typeof BIDIRECTIONAL_MAPPERS;

export function map(key: MapperKey, value: any, isInbound = false): any {
    const mapper = BIDIRECTIONAL_MAPPERS[key];
    return mapper ? mapper(value, isInbound) : value;
}
