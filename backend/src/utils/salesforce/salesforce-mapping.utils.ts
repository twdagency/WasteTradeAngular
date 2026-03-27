/* eslint-disable @typescript-eslint/no-explicit-any */

import { ListingStatus, WasteStoration, TrailerType } from '../../enum';
import {
    SalesListingWasteTradePublicationStatusValues,
    SalesListingMaterialValues,
    SalesListingPackagingTypeValues,
    SalesListingStorageTypeValues,
    HaulageOffersTrailerTypeValues,
    HaulageOffersTrailerOrContainerValues,
    LeadLeadSourceValues,
} from './generated';

/**
 * Salesforce Mapping Utility Functions
 * Outbound-only mappers for WT → SF picklist value translation
 */

/**
 * Map WasteTrade lead source to Salesforce LeadSource picklist values
 * Handles both old legacy enum values and new Salesforce-compatible values
 */
export function mapLeadSource(wasteTradeSource: string | undefined): string {
    const SF = LeadLeadSourceValues;
    if (!wasteTradeSource) return SF.Website;

    // Comprehensive mapping to handle all possible values
    const sourceMapping: Record<string, string> = {
        // NEW ENUM VALUES - Direct matches from updated WhereDidYouHearAboutUs enum
        Advertisement: SF.Advertisement,
        'Customer Event': SF.Customer_Event,
        'Employee Referral': SF.Employee_Referral,
        'External Referral': SF.External_Referral,
        'Google AdWords': SF.Google_AdWords,
        Other: SF.Other,
        Partner: SF.Partner,
        'Purchased List': SF.Purchased_List,
        'Trade Show': SF.Trade_Show,
        Webinar: SF.Webinar,
        Website: SF.Website,

        // OLD LEGACY ENUM VALUES - Map from old snake_case values to new Salesforce values
        google_search: SF.Google_AdWords,
        prse_trade_show: SF.Trade_Show,
        plastics_live_trade_show: SF.Trade_Show,
        sustainability_show: SF.Trade_Show,
        k_show: SF.Trade_Show,
        interpack: SF.Trade_Show,
        plast_2023: SF.Trade_Show,
        word_of_mouth: SF.External_Referral,

        // CASE VARIATIONS - Handle different case formats
        advertisement: SF.Advertisement,
        'customer event': SF.Customer_Event,
        'employee referral': SF.Employee_Referral,
        'external referral': SF.External_Referral,
        'google adwords': SF.Google_AdWords,
        'google ads': SF.Google_AdWords,
        other: SF.Other,
        partner: SF.Partner,
        'purchased list': SF.Purchased_List,
        'trade show': SF.Trade_Show,
        webinar: SF.Webinar,
        website: SF.Website,

        // COMMON VARIATIONS AND ALIASES
        ad: SF.Advertisement,
        ads: SF.Advertisement,
        google: SF.Google_AdWords,
        'google search': SF.Google_AdWords,
        event: SF.Customer_Event,
        referral: SF.External_Referral,
        friend: SF.External_Referral,
        colleague: SF.External_Referral,
        recommendation: SF.External_Referral,
        social: SF.Website,
        'social media': SF.Website,
        facebook: SF.Website,
        linkedin: SF.Website,
        twitter: SF.Website,
        instagram: SF.Website,
        search: SF.Google_AdWords,
        'search engine': SF.Google_AdWords,
        seo: SF.Website,
        online: SF.Website,
        internet: SF.Website,
        web: SF.Website,
        exhibition: SF.Trade_Show,
        conference: SF.Trade_Show,
        fair: SF.Trade_Show,
        show: SF.Trade_Show,
        expo: SF.Trade_Show,
        convention: SF.Trade_Show,

        // SPECIFIC TRADE SHOW VARIATIONS
        prse: SF.Trade_Show,
        'plastics live': SF.Trade_Show,
        sustainability: SF.Trade_Show,
        'k show': SF.Trade_Show,
        'k-show': SF.Trade_Show,
        plast: SF.Trade_Show,
        'plast 2023': SF.Trade_Show,
        plast2023: SF.Trade_Show,

        // ADDITIONAL LEGACY MAPPINGS (avoiding duplicates)
        Online: SF.Website,
        'Word of mouth': SF.External_Referral,
        'Google Search': SF.Google_AdWords,
        'PRSE Trade Show': SF.Trade_Show,
        'Plastics Live Trade Show': SF.Trade_Show,
        'Sustainability show': SF.Trade_Show,
        'K-Show': SF.Trade_Show,
        Interpack: SF.Trade_Show,
        'Plast 2023': SF.Trade_Show,
    };

    // Try exact match first, then lowercase match, then fallback to 'Other'
    return sourceMapping[wasteTradeSource] ?? sourceMapping[wasteTradeSource.toLowerCase().trim()] ?? SF.Other;
}


/**
 * Map WasteTrade listing status to Salesforce WasteTrade Publication Status picklist values
 */
export function mapWasteTradePublicationStatus(wasteTradeStatus: string | undefined): string {
    const SF_PUB = SalesListingWasteTradePublicationStatusValues;
    const statusMapping: Record<string, string> = {
        [ListingStatus.PENDING]: SF_PUB.Draft,
        [ListingStatus.AVAILABLE]: SF_PUB.Published,
        [ListingStatus.SOLD]: SF_PUB.Published, // Sold listings remain published
        [ListingStatus.REJECTED]: SF_PUB.Archived,
        [ListingStatus.EXPIRED]: SF_PUB.Archived, // Expired listings are archived
    };
    return statusMapping[wasteTradeStatus?.toLowerCase() ?? ''] ?? SF_PUB.Draft;
}

/**
 * Map WasteTrade material type to Salesforce Material picklist values
 */
export function mapMaterialPicklist(materialType: string | undefined): string | undefined {
    if (!materialType) return undefined;
    const SF = SalesListingMaterialValues;

    const materialMapping: Record<string, string> = {
        // Direct matches
        abs: SF.ABS,
        acrylic: SF.ACRYLIC,
        eps: SF.EPS,
        hdpe: SF.HDPE,
        ldpe: SF.LDPE,
        pc: SF.PC,
        pe: SF.PE,
        pet: SF.PET,
        plastic: SF.Plastic,
        pp: SF.PP,
        ps: SF.PS,
        pvc: SF.PVC,
        // Common variations
        polyethylene: SF.PE,
        polypropylene: SF.PP,
        polystyrene: SF.PS,
        'polyvinyl chloride': SF.PVC,
        polycarbonate: SF.PC,
        'high density polyethylene': SF.HDPE,
        'low density polyethylene': SF.LDPE,
        'polyethylene terephthalate': SF.PET,
        'acrylonitrile butadiene styrene': SF.ABS,
        'expanded polystyrene': SF.EPS,
        // Mixed materials
        mixed: SF.OTHER_MIX,
        mix: SF.OTHER_MIX,
        'other mix': SF.OTHER_MIX,
        other: SF.OTHER_SINGLE_SOURCES,
        'single source': SF.OTHER_SINGLE_SOURCES,
    };

    const normalized = materialType.toLowerCase().trim();
    return materialMapping[normalized] ?? SF.Plastic;
}

/**
 * Map WasteTrade packaging to Salesforce Packaging Type picklist values
 */
export function mapPackagingTypePicklist(packaging: string | undefined): string | undefined {
    if (!packaging) return undefined;
    const SF = SalesListingPackagingTypeValues;

    const packagingMapping: Record<string, string> = {
        agglomerate: SF.Agglomerate,
        bags: SF.Bags,
        bales: SF.Bales,
        granules: SF.Granules,
        loose: SF.Loose,
        lumps: SF.Lumps,
        prime: SF.Prime,
        regrind: SF.Regrind,
        rolls: SF.Rolls,
        shred: SF.Shred,
        // Common variations
        bag: SF.Bags,
        bale: SF.Bales,
        granule: SF.Granules,
        lump: SF.Lumps,
        roll: SF.Rolls,
        shredded: SF.Shred,
        pellets: SF.Granules,
        pellet: SF.Granules,
        flakes: SF.Loose,
        flake: SF.Loose,
    };

    const normalized = packaging.toLowerCase().trim();
    return packagingMapping[normalized] ?? SF.Loose;
}

/**
 * Map WasteTrade storage type to Salesforce Storage Type picklist values
 */
export function mapStorageTypePicklist(storageType: string | undefined): string | undefined {
    if (!storageType) return undefined;
    const SF = SalesListingStorageTypeValues;

    const storageMapping: Record<string, string> = {
        indoors: SF.Indoors,
        outdoors: SF.Outdoors,
        [WasteStoration.INDOOR]: SF.Indoors,
        [WasteStoration.OUTDOOR]: SF.Outdoors,
        inside: SF.Indoors,
        outside: SF.Outdoors,
        covered: SF.Indoors,
        uncovered: SF.Outdoors,
        warehouse: SF.Indoors,
        external: SF.Outdoors,
    };

    const normalized = storageType.toLowerCase().trim();
    return storageMapping[normalized] ?? SF.Indoors;
}


/**
 * Map country code to full country name for Salesforce picklist
 */
export function mapCountryCodeToFullName(countryCode: string): string {
    const countryMapping: Record<string, string> = {
        UK: 'United Kingdom',
        GB: 'United Kingdom',
        US: 'United States',
        USA: 'United States',
        CA: 'Canada',
        AU: 'Australia',
        DE: 'Germany',
        FR: 'France',
        ES: 'Spain',
        IT: 'Italy',
        NL: 'Netherlands',
        BE: 'Belgium',
        PL: 'Poland',
        SE: 'Sweden',
        DK: 'Denmark',
        NO: 'Norway',
        FI: 'Finland',
        CH: 'Switzerland',
        AT: 'Austria',
        IE: 'Ireland',
        PT: 'Portugal',
        GR: 'Greece',
        CZ: 'Czech Republic',
        HU: 'Hungary',
        RO: 'Romania',
        BG: 'Bulgaria',
        HR: 'Croatia',
        SI: 'Slovenia',
        SK: 'Slovakia',
        LT: 'Lithuania',
        LV: 'Latvia',
        EE: 'Estonia',
        CY: 'Cyprus',
        MT: 'Malta',
        LU: 'Luxembourg',
        IS: 'Iceland',
        AD: 'Andorra',
        MC: 'Monaco',
        LI: 'Liechtenstein',
        SM: 'San Marino',
        VA: 'Holy See (Vatican City State)',
        BR: 'Brazil',
        MX: 'Mexico',
        AR: 'Argentina',
        CL: 'Chile',
        CO: 'Colombia',
        PE: 'Peru',
        VE: 'Venezuela, Bolivarian Republic of',
        EC: 'Ecuador',
        BO: 'Bolivia, Plurinational State of',
        PY: 'Paraguay',
        UY: 'Uruguay',
        GY: 'Guyana',
        SR: 'Suriname',
        GF: 'French Guiana',
        FK: 'Falkland Islands (Malvinas)',
        CN: 'China',
        JP: 'Japan',
        KR: 'Korea, Republic of',
        IN: 'India',
        ID: 'Indonesia',
        MY: 'Malaysia',
        TH: 'Thailand',
        VN: 'Vietnam',
        PH: 'Philippines',
        SG: 'Singapore',
        HK: 'Hong Kong',
        TW: 'Taiwan',
        MO: 'Macao',
        MM: 'Myanmar',
        LA: "Lao People's Democratic Republic",
        KH: 'Cambodia',
        BD: 'Bangladesh',
        LK: 'Sri Lanka',
        NP: 'Nepal',
        BT: 'Bhutan',
        MV: 'Maldives',
        PK: 'Pakistan',
        AF: 'Afghanistan',
        IR: 'Iran, Islamic Republic of',
        IQ: 'Iraq',
        SA: 'Saudi Arabia',
        AE: 'United Arab Emirates',
        QA: 'Qatar',
        KW: 'Kuwait',
        BH: 'Bahrain',
        OM: 'Oman',
        YE: 'Yemen',
        JO: 'Jordan',
        LB: 'Lebanon',
        SY: 'Syrian Arab Republic',
        IL: 'Israel',
        PS: 'Palestine',
        TR: 'Turkey',
        GE: 'Georgia',
        AM: 'Armenia',
        AZ: 'Azerbaijan',
        RU: 'Russian Federation',
        BY: 'Belarus',
        UA: 'Ukraine',
        MD: 'Moldova, Republic of',
        KZ: 'Kazakhstan',
        UZ: 'Uzbekistan',
        KG: 'Kyrgyzstan',
        TJ: 'Tajikistan',
        TM: 'Turkmenistan',
        MN: 'Mongolia',
        KP: "Korea, Democratic People's Republic of",
        ZA: 'South Africa',
        EG: 'Egypt',
        LY: 'Libya',
        TN: 'Tunisia',
        DZ: 'Algeria',
        MA: 'Morocco',
        EH: 'Western Sahara',
        SD: 'Sudan',
        SS: 'South Sudan',
        ET: 'Ethiopia',
        ER: 'Eritrea',
        DJ: 'Djibouti',
        SO: 'Somalia',
        KE: 'Kenya',
        TZ: 'Tanzania, United Republic of',
        UG: 'Uganda',
        RW: 'Rwanda',
        BI: 'Burundi',
        MZ: 'Mozambique',
        ZW: 'Zimbabwe',
        ZM: 'Zambia',
        MW: 'Malawi',
        BW: 'Botswana',
        NA: 'Namibia',
        SZ: 'Swaziland',
        LS: 'Lesotho',
        MG: 'Madagascar',
        MU: 'Mauritius',
        SC: 'Seychelles',
        KM: 'Comoros',
        YT: 'Mayotte',
        RE: 'Reunion',
        CG: 'Congo',
        CD: 'Congo, the Democratic Republic of the',
        GA: 'Gabon',
        GQ: 'Equatorial Guinea',
        ST: 'Sao Tome and Principe',
        CM: 'Cameroon',
        CF: 'Central African Republic',
        TD: 'Chad',
        NE: 'Niger',
        NG: 'Nigeria',
        BF: 'Burkina Faso',
        ML: 'Mali',
        SN: 'Senegal',
        GN: 'Guinea',
        GW: 'Guinea-Bissau',
        SL: 'Sierra Leone',
        LR: 'Liberia',
        CI: "Cote d'Ivoire",
        GH: 'Ghana',
        TG: 'Togo',
        BJ: 'Benin',
        CV: 'Cape Verde',
        GM: 'Gambia',
        MR: 'Mauritania',
    };

    return countryMapping[countryCode.toUpperCase()] || countryCode;
}


/**
 * Map demurrage days to Salesforce picklist values (string "0" to "31")
 */
export function mapDemurrage(days: number | undefined): string | undefined {
    if (days === undefined || days === null) return undefined;
    const clamped = Math.max(0, Math.min(31, Math.round(days)));
    return clamped.toString();
}

/**
 * Map trailer/container type to Salesforce trailer_or_container__c picklist
 * SF Values: "Trailer", "Container"
 * WT only uses Trailer - always default to Trailer
 */
export function mapTrailerOrContainer(type: string | undefined): string {
    // WT only has trailers, always return Trailer
    return HaulageOffersTrailerOrContainerValues.Trailer;
}

/**
 * Map to Salesforce trailer_type__c picklist
 * SF Values: "Curtain Sider", "Containers", "Tipper Trucks", "Walking Floor"
 */
export function mapTrailerType(type: string | undefined): string | undefined {
    if (!type) return undefined;
    
    // Direct SF values (1:1 mapping)
    const validValues = [
        HaulageOffersTrailerTypeValues.Curtain_Sider,
        HaulageOffersTrailerTypeValues.Containers,
        HaulageOffersTrailerTypeValues.Tipper_Trucks,
        HaulageOffersTrailerTypeValues.Walking_Floor,
    ];
    if (validValues.includes(type as any)) return type;

    // Legacy mapping from old FE values
    const legacyMapping: Record<string, string> = {
        'curtain_slider_standard': TrailerType.CURTAIN_SIDER,
        'curtain_slider_high_cube': TrailerType.CURTAIN_SIDER,
        'walking_floor': TrailerType.WALKING_FLOOR,
        'tipper': TrailerType.TIPPER_TRUCKS,
        'tipper_trucks': TrailerType.TIPPER_TRUCKS,
        'containers': TrailerType.CONTAINERS,
    };

    return legacyMapping[type.toLowerCase()] || undefined;
}

/**
 * Map to Salesforce container_type__c picklist
 * SF Values: "20' Container", "40' Container - Standard", "40' Container - High Cube", etc.
 * NOTE: WT only uses Trailer, not Container - this function returns undefined
 */
export function mapContainerType(type: string | undefined): string | undefined {
    // WT only has trailers, container_type__c should always be empty
    return undefined;
}

