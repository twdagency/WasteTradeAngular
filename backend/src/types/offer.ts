import { OfferState, OfferStatusEnum, ECurrency } from '../enum';
import { Companies, CompanyLocations, ListingDocuments, Listings, Offers, User } from '../models';

export interface OfferWithCurrency {
    offeredPricePerUnit?: number;
    totalPrice?: number;
    currency?: ECurrency;
    originalCurrency?: ECurrency;
}

export interface OfferDetails {
    offer: Partial<Offers> & {
        sellerTotalAmount?: number;
        location?: Partial<CompanyLocations> | null;
        originalCurrency?: ECurrency;
        hasNotes?: boolean;
        numOfLoadBidOn?: number; // Alias for quantity
    };
    listing: Partial<Listings> & {
        numberOfOffers?: number;
        bestOffer?: number;
        bestOfferCurrency?: ECurrency;
        originalBestOfferCurrency?: ECurrency;
        documents?: ListingDocuments[];
        location?: Partial<CompanyLocations> | null;
        pern?: number | null;
        guidePrice?: number;
    };
    buyer: {
        companyId?: number;
        companyName?: string;
        country?: string;
        user?: Partial<User>;
        company?: Partial<Companies>;
        location?: Partial<CompanyLocations> | null;
        loadingTimes?: {
            openTime?: string;
            closeTime?: string;
        } | null;
        siteRestrictions?: string | null;
    };
    seller: {
        companyId?: number;
        companyName?: string;
        country?: string;
        user?: Partial<User>;
        company?: Partial<Companies>;
        location?: Partial<CompanyLocations> | null;
        loadingTimes?: {
            openTime?: string;
            closeTime?: string;
        } | null;
        siteRestrictions?: string | null;
        averageWeightPerLoad?: number | null;
    };
}

export interface OfferCompanies {
    buyerCompanies: {
        id: number;
        name: string;
        country: string;
    }[];
    sellerCompanies: {
        id: number;
        name: string;
        country: string;
    }[];
}
