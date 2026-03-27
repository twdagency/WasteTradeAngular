import { expect } from '@loopback/testlab';
import {
    mapListingStatus,
    mapOfferStatus,
    mapHaulageOfferStatus,
    mapTransportProvider,
    mapExpectedTransitTime,
    mapCustomsClearance,
    mapCurrency,
    mapCompanyRole,
    mapCompanyUserStatus,
    mapUserStatus,
} from '../../utils/salesforce/salesforce-bidirectional-mapping.utils';
import {
    mapLeadSource,
    mapMaterialPicklist,
    mapPackagingTypePicklist,
    mapStorageTypePicklist,
    mapWasteTradePublicationStatus,
    mapDemurrage,
} from '../../utils/salesforce/salesforce-mapping.utils';
import {
    SalesListingListingStatusValues,
    SalesListingMaterialValues,
    SalesListingPackagingTypeValues,
    SalesListingStorageTypeValues,
    SalesListingWasteTradePublicationStatusValues,
    OffersBidStatusValues,
    HaulageOffersHaulierListingStatusValues,
    HaulageOffersTransportProviderValues,
    HaulageOffersExpectedValues,
    HaulageOffersCustomsClearanceValues,
    HaulageOffersDemurrageValues,
    AccountCurrencyIsoCodeValues,
    ContactCompanyRoleValues,
    ContactCompanyUserStatusValues,
    LeadLeadSourceValues,
    LeadWasteTradeUserStatusValues,
} from '../../utils/salesforce/generated';

function vals(obj: Record<string, string>): string[] {
    return Object.values(obj);
}

describe('Mapper outputs match SF picklist values — status/role mappers (regression)', () => {
    it('mapListingStatus: all WT statuses → valid Listing_Status__c', () => {
        const valid = vals(SalesListingListingStatusValues);
        for (const s of ['pending', 'available', 'active', 'approved', 'expired', 'sold', 'rejected', 'withdrawn', undefined]) {
            expect(valid).to.containEql(mapListingStatus(s, false));
        }
    });

    it('mapOfferStatus: all WT statuses → valid bid_status__c', () => {
        const valid = vals(OffersBidStatusValues);
        for (const s of ['pending', 'accepted', 'rejected', 'withdrawn', 'expired', undefined]) {
            expect(valid).to.containEql(mapOfferStatus(s, false));
        }
    });

    it('mapHaulageOfferStatus: all WT statuses → valid haulier_listing_status__c', () => {
        const valid = vals(HaulageOffersHaulierListingStatusValues);
        const statuses = ['pending', 'approved', 'accepted', 'rejected', 'withdrawn',
            'information_requested', 'open_for_edits', 'partially_shipped', 'shipped', undefined];
        for (const s of statuses) {
            expect(valid).to.containEql(mapHaulageOfferStatus(s, false));
        }
    });

    it('mapHaulageOfferStatus inbound: Approved + currentWtStatus preservation logic', () => {
        // Approved inbound preserves sub-statuses that map ambiguously
        expect(mapHaulageOfferStatus('Approved', true, 'accepted')).to.equal('accepted');
        expect(mapHaulageOfferStatus('Approved', true, 'partially_shipped')).to.equal('partially_shipped');
        expect(mapHaulageOfferStatus('Approved', true, 'shipped')).to.equal('shipped');
        // Non-preserve statuses fall through to 'approved'
        expect(mapHaulageOfferStatus('Approved', true, 'pending')).to.equal('approved');
        // Rejected always overrides
        expect(mapHaulageOfferStatus('Rejected', true, 'accepted')).to.equal('rejected');
    });

    it('mapTransportProvider: all WT values → valid Transport_Provider__c', () => {
        const valid = vals(HaulageOffersTransportProviderValues);
        for (const p of ['own_haulage', 'mixed', 'mixed_haulage', 'third_party', 'third_party_haulier']) {
            expect(valid).to.containEql(mapTransportProvider(p, false));
        }
    });

    it('mapExpectedTransitTime: current + legacy values → valid expected__c', () => {
        const valid = vals(HaulageOffersExpectedValues);
        const all = ['1-2 Days', '3-4 Days', '4-6 Days', '1 Week', '2 Weeks', '3 Weeks', '1 Month',
            '1', '2-3', '4-5', '6-7', '8-10', '11-14',
            '1_2_days', '3_4_days', '4_6_days', '1_week', '2_weeks', '3_weeks', '1_month'];
        for (const v of all) {
            expect(valid).to.containEql(mapExpectedTransitTime(v));
        }
    });

    it('mapCustomsClearance: true/false/undefined → valid Customs_Clearance__c', () => {
        const valid = vals(HaulageOffersCustomsClearanceValues);
        expect(valid).to.containEql(mapCustomsClearance(true, false) as string);
        expect(valid).to.containEql(mapCustomsClearance(false, false) as string);
        expect(valid).to.containEql(mapCustomsClearance(undefined, false) as string);
    });

    it('mapCurrency: GBP/EUR/USD → valid CurrencyIsoCode', () => {
        const valid = vals(AccountCurrencyIsoCodeValues);
        for (const c of ['GBP', 'EUR', 'USD', 'gbp', 'eur', 'usd']) {
            expect(valid).to.containEql(mapCurrency(c));
        }
    });

    it('mapCompanyRole: all WT roles → valid Company_Role__c', () => {
        const valid = vals(ContactCompanyRoleValues);
        for (const r of ['admin', 'buyer', 'seller', 'haulier', 'both']) {
            expect(valid).to.containEql(mapCompanyRole(r, false));
        }
    });

    it('mapCompanyUserStatus: all WT statuses → valid Company_User_Status__c', () => {
        const valid = vals(ContactCompanyUserStatusValues);
        for (const s of ['active', 'pending', 'rejected', 'request_information']) {
            expect(valid).to.containEql(mapCompanyUserStatus(s, false));
        }
    });

    it('mapLeadSource: common inputs → valid LeadSource', () => {
        const valid = vals(LeadLeadSourceValues);
        const inputs = ['Advertisement', 'Trade Show', 'Website', 'Other', 'Partner',
            'google_search', 'word_of_mouth', 'prse_trade_show', undefined];
        for (const s of inputs) {
            expect(valid).to.containEql(mapLeadSource(s));
        }
    });

    it('mapMaterialPicklist: common materials → valid Material__c', () => {
        const valid = vals(SalesListingMaterialValues);
        for (const m of ['abs', 'hdpe', 'ldpe', 'pet', 'pp', 'ps', 'pvc', 'pc', 'eps', 'plastic', 'mixed', 'other']) {
            expect(valid).to.containEql(mapMaterialPicklist(m));
        }
    });

    it('mapPackagingTypePicklist: common types → valid Packaging_Type__c', () => {
        const valid = vals(SalesListingPackagingTypeValues);
        for (const t of ['agglomerate', 'bags', 'bales', 'granules', 'loose', 'lumps', 'regrind', 'shred', 'pellets']) {
            expect(valid).to.containEql(mapPackagingTypePicklist(t));
        }
    });

    it('mapStorageTypePicklist: all mappable types → valid Storage_Type__c', () => {
        const valid = vals(SalesListingStorageTypeValues);
        for (const t of ['indoors', 'outdoors', 'indoor', 'outdoor', 'covered', 'warehouse']) {
            expect(valid).to.containEql(mapStorageTypePicklist(t));
        }
    });

    it('mapWasteTradePublicationStatus: all WT statuses → valid WasteTrade_Publication_Status__c', () => {
        const valid = vals(SalesListingWasteTradePublicationStatusValues);
        for (const s of ['pending', 'available', 'sold', 'rejected', 'expired', 'draft']) {
            expect(valid).to.containEql(mapWasteTradePublicationStatus(s));
        }
    });

    it('mapDemurrage: 0–31 + clamping → valid demurrage__c', () => {
        const valid = vals(HaulageOffersDemurrageValues);
        for (const n of [0, 1, 15, 31]) {
            expect(valid).to.containEql(mapDemurrage(n));
        }
        // Clamping
        expect(mapDemurrage(99)).to.equal('31');
        expect(mapDemurrage(-5)).to.equal('0');
    });

    it('mapUserStatus outbound maps to valid SF picklist values', () => {
        const valid = vals(LeadWasteTradeUserStatusValues);
        for (const input of ['pending', 'active', 'rejected', 'request_information', 'archived', 'inactive']) {
            const result = mapUserStatus(input, false);
            expect(valid).to.containEql(result);
        }
    });
});
