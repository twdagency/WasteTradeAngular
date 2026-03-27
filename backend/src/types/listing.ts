import { Filter } from '@loopback/repository';
import { Listings, ListingDocuments, Companies, CompanyLocations, User } from '../models';
import { ECurrency } from '../enum';
import { ExpiryInfo } from '../services/listing-expiry.service';

export interface LocationDetails {
    locationName: string;
    sitePointContact?: string;
    phoneNumber?: string;
    address: {
        addressLine?: string;
        street?: string;
        postcode?: string;
        city?: string;
        country?: string;
        stateProvince?: string;
    };
    operatingHours: {
        openTime?: string;
        closeTime?: string;
    };
    facilities: {
        loadingRamp?: boolean;
        weighbridge?: boolean;
        selfLoadUnloadCapability?: boolean;
    };
    containerTypes?: string[];
    acceptedMaterials?: string[];
    siteSpecificInstructions?: string;
    accessRestrictions?: string;
    otherMaterial?: string;
    isMainLocation?: boolean;
}

export interface ListingWithCurrency {
    pricePerMetricTonne?: number;
    currency?: ECurrency;
    originalCurrency?: ECurrency; // Original currency before conversion
}

export interface ListingWithDocuments extends Listings {
    documents: ListingDocuments[];
    wantedStatus?: string; // Material requirement status for wanted listings
    originalCurrency?: ECurrency; // Original currency before conversion
    locationDetails?: LocationDetails | null; // Enhanced location details
    expiryInfo?: ExpiryInfo; // Expiry information for active listings
    hasPendingOffer?: boolean; // Whether listing has pending or approved offers
}

export interface ListingWithDetails extends Listings {
    documents: ListingDocuments[];
    wantedStatus?: string; // Material requirement status for wanted listings
    originalCurrency?: string; // Original currency before conversion
    locationDetails?: LocationDetails | null; // Enhanced location details
    hasNotes?: boolean;
    createdBy: {
        user: User;
        company: Companies;
        location: CompanyLocations;
    };
}
