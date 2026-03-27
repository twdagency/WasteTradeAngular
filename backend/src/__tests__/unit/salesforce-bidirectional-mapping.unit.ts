/**
 * salesforce-bidirectional-mapping.unit.ts
 * Branch coverage for all mappers in salesforce-bidirectional-mapping.utils.ts:
 * mapCompanyRole, mapCompanyUserStatus, mapHaulageOfferStatus, mapTransportProvider,
 * mapExpectedTransitTime, mapCustomsClearance, mapTrailerContainer,
 * mapCurrency, mapCompanyStatus, mapListingStatus, mapOfferStatus,
 * mapUserRole, mapUserStatus, mapLoadStatus, map() dispatcher.
 */
import { expect } from '@loopback/testlab';
import {
    mapCompanyRole,
    mapCompanyUserStatus,
    mapHaulageOfferStatus,
    mapTransportProvider,
    mapExpectedTransitTime,
    mapCustomsClearance,
    mapTrailerContainer,
    mapCurrency,
    mapCompanyStatus,
    mapListingStatus,
    mapOfferStatus,
    mapUserRole,
    mapUserStatus,
    mapLoadStatus,
    map,
} from '../../utils/salesforce/salesforce-bidirectional-mapping.utils';

describe('salesforce-bidirectional-mapping.utils (unit)', () => {

    // ── mapCompanyRole ───────────────────────────────────────────────────────
    describe('mapCompanyRole()', () => {
        it('undefined returns undefined', () => {
            expect(mapCompanyRole(undefined)).to.be.undefined();
        });
        it('outbound: admin → ADMIN', () => {
            expect(mapCompanyRole('admin')).to.equal('ADMIN');
        });
        it('outbound: both → DUAL', () => {
            expect(mapCompanyRole('both')).to.equal('DUAL');
        });
        it('outbound: unknown falls back to uppercase', () => {
            expect(mapCompanyRole('custom')).to.equal('CUSTOM');
        });
        it('inbound: ADMIN → admin', () => {
            expect(mapCompanyRole('ADMIN', true)).to.equal('admin');
        });
        it('inbound: DUAL → both', () => {
            expect(mapCompanyRole('DUAL', true)).to.equal('both');
        });
        it('inbound: unknown falls back to lowercase', () => {
            expect(mapCompanyRole('UNKNOWN_ROLE', true)).to.equal('unknown_role');
        });
    });

    // ── mapCompanyUserStatus ─────────────────────────────────────────────────
    describe('mapCompanyUserStatus()', () => {
        it('undefined returns undefined', () => {
            expect(mapCompanyUserStatus(undefined)).to.be.undefined();
        });
        it('outbound: active → ACTIVE', () => {
            expect(mapCompanyUserStatus('active')).to.equal('ACTIVE');
        });
        it('outbound: request_information → REQUEST_INFORMATION', () => {
            expect(mapCompanyUserStatus('request_information')).to.equal('REQUEST_INFORMATION');
        });
        it('inbound: INACTIVE → request_information', () => {
            expect(mapCompanyUserStatus('INACTIVE', true)).to.equal('request_information');
        });
        it('inbound: unknown falls back to lowercase', () => {
            expect(mapCompanyUserStatus('MYSTERY', true)).to.equal('mystery');
        });
    });

    // ── mapHaulageOfferStatus ────────────────────────────────────────────────
    describe('mapHaulageOfferStatus()', () => {
        it('undefined outbound returns Pending Approval', () => {
            expect(mapHaulageOfferStatus(undefined, false)).to.equal('Pending Approval');
        });
        it('undefined inbound returns pending', () => {
            expect(mapHaulageOfferStatus(undefined, true)).to.equal('pending');
        });
        it('outbound: accepted → Approved', () => {
            expect(mapHaulageOfferStatus('accepted', false)).to.equal('Approved');
        });
        it('outbound: withdrawn → Rejected', () => {
            expect(mapHaulageOfferStatus('withdrawn', false)).to.equal('Rejected');
        });
        it('inbound: Approved preserves accepted when currentWtStatus=accepted', () => {
            expect(mapHaulageOfferStatus('Approved', true, 'accepted')).to.equal('accepted');
        });
        it('inbound: Approved preserves shipped when currentWtStatus=shipped', () => {
            expect(mapHaulageOfferStatus('Approved', true, 'shipped')).to.equal('shipped');
        });
        it('inbound: Approved maps to approved when currentWtStatus=pending', () => {
            expect(mapHaulageOfferStatus('Approved', true, 'pending')).to.equal('approved');
        });
        it('inbound: Rejected → rejected', () => {
            expect(mapHaulageOfferStatus('Rejected', true)).to.equal('rejected');
        });
        it('outbound: unknown → Pending Approval', () => {
            expect(mapHaulageOfferStatus('some_status', false)).to.equal('Pending Approval');
        });
    });

    // ── mapTransportProvider ─────────────────────────────────────────────────
    describe('mapTransportProvider()', () => {
        it('undefined returns undefined', () => {
            expect(mapTransportProvider(undefined)).to.be.undefined();
        });
        it('outbound: own_haulage → Own Haulage', () => {
            expect(mapTransportProvider('own_haulage')).to.equal('Own Haulage');
        });
        it('outbound: third_party → Third Party Haulier', () => {
            expect(mapTransportProvider('third_party')).to.equal('Third Party Haulier');
        });
        it('outbound: mixed → Mixed Haulage', () => {
            expect(mapTransportProvider('mixed')).to.equal('Mixed Haulage');
        });
        it('inbound: Own Haulage → own_haulage', () => {
            expect(mapTransportProvider('Own Haulage', true)).to.equal('own_haulage');
        });
        it('inbound: Third Party Haulier → third_party', () => {
            expect(mapTransportProvider('Third Party Haulier', true)).to.equal('third_party');
        });
        it('inbound: Mixed Haulage → mixed', () => {
            expect(mapTransportProvider('Mixed Haulage', true)).to.equal('mixed');
        });
        it('inbound: pre-mapped own_haulage passes through', () => {
            expect(mapTransportProvider('own_haulage', true)).to.equal('own_haulage');
        });
    });

    // ── mapExpectedTransitTime ───────────────────────────────────────────────
    describe('mapExpectedTransitTime()', () => {
        it('undefined returns undefined', () => {
            expect(mapExpectedTransitTime(undefined)).to.be.undefined();
        });
        it('direct valid value passes through', () => {
            expect(mapExpectedTransitTime('1-2 Days')).to.equal('1-2 Days');
            expect(mapExpectedTransitTime('1 Month')).to.equal('1 Month');
        });
        it('legacy numeric string 1 → 1-2 Days', () => {
            expect(mapExpectedTransitTime('1')).to.equal('1-2 Days');
        });
        it('legacy underscore format 1_week → 1 Week', () => {
            expect(mapExpectedTransitTime('1_week')).to.equal('1 Week');
        });
        it('legacy 2-3 → 3-4 Days', () => {
            expect(mapExpectedTransitTime('2-3')).to.equal('3-4 Days');
        });
        it('unknown value defaults to 1 Week', () => {
            expect(mapExpectedTransitTime('999 years')).to.equal('1 Week');
        });
    });

    // ── mapCustomsClearance ──────────────────────────────────────────────────
    describe('mapCustomsClearance()', () => {
        it('undefined outbound returns Customs Clearance Not Required', () => {
            expect(mapCustomsClearance(undefined, false)).to.equal('Customs Clearance Not Required');
        });
        it('undefined inbound returns false', () => {
            expect(mapCustomsClearance(undefined, true)).to.equal(false);
        });
        it('outbound: true → Yes', () => {
            expect(mapCustomsClearance(true, false)).to.equal('Yes');
        });
        it('outbound: false → No', () => {
            expect(mapCustomsClearance(false, false)).to.equal('No');
        });
        it('outbound: string passes through', () => {
            expect(mapCustomsClearance('Yes', false)).to.equal('Yes');
        });
        it('inbound: Yes → true', () => {
            expect(mapCustomsClearance('Yes', true)).to.equal(true);
        });
        it('inbound: No → false', () => {
            expect(mapCustomsClearance('No', true)).to.equal(false);
        });
        it('inbound: boolean true passes through', () => {
            expect(mapCustomsClearance(true, true)).to.equal(true);
        });
    });

    // ── mapTrailerContainer ──────────────────────────────────────────────────
    describe('mapTrailerContainer()', () => {
        it('undefined returns undefined', () => {
            expect(mapTrailerContainer(undefined)).to.be.undefined();
        });
        it('outbound: SF trailer type Curtain Sider wraps in object', () => {
            const result = mapTrailerContainer('Curtain Sider', false) as any;
            expect(result.trailerOrContainer).to.equal('Trailer');
            expect(result.trailerType).to.equal('Curtain Sider');
        });
        it('outbound: legacy walking_floor maps to Walking Floor', () => {
            const result = mapTrailerContainer('walking_floor', false) as any;
            expect(result.trailerType).to.equal('Walking Floor');
        });
        it('outbound: unknown string still wraps in Trailer object', () => {
            const result = mapTrailerContainer('custom_trailer', false) as any;
            expect(result.trailerOrContainer).to.equal('Trailer');
        });
        it('outbound: non-string returns undefined', () => {
            expect(mapTrailerContainer({ trailerType: 'X' }, false)).to.be.undefined();
        });
        it('inbound: object with Trailer+trailerType returns trailerType', () => {
            const result = mapTrailerContainer({ trailerOrContainer: 'Trailer', trailerType: 'Tipper Trucks' }, true);
            expect(result).to.equal('Tipper Trucks');
        });
        it('inbound: object without trailerOrContainer=Trailer returns trailerType', () => {
            const result = mapTrailerContainer({ trailerOrContainer: 'Container', trailerType: 'Big Box' }, true);
            expect(result).to.equal('Big Box');
        });
        it('inbound: string passes through', () => {
            expect(mapTrailerContainer('Walking Floor', true)).to.equal('Walking Floor');
        });
    });

    // ── mapCurrency ──────────────────────────────────────────────────────────
    describe('mapCurrency()', () => {
        it('undefined returns undefined', () => {
            expect(mapCurrency(undefined)).to.be.undefined();
        });
        it('gbp → GBP', () => {
            expect(mapCurrency('gbp')).to.equal('GBP');
        });
        it('EUR passes through', () => {
            expect(mapCurrency('EUR')).to.equal('EUR');
        });
        it('unknown currency returns undefined', () => {
            expect(mapCurrency('ZWD')).to.be.undefined();
        });
    });

    // ── mapCompanyStatus ─────────────────────────────────────────────────────
    describe('mapCompanyStatus()', () => {
        it('undefined outbound returns Pending', () => {
            expect(mapCompanyStatus(undefined, false)).to.equal('Pending');
        });
        it('undefined inbound returns pending', () => {
            expect(mapCompanyStatus(undefined, true)).to.equal('pending');
        });
        it('outbound: active → Active', () => {
            expect(mapCompanyStatus('active')).to.equal('Active');
        });
        it('outbound: inactive → Pending (not in map, returns default)', () => {
            expect(mapCompanyStatus('inactive')).to.equal('Pending');
        });
        it('inbound: Active → active', () => {
            expect(mapCompanyStatus('Active', true)).to.equal('active');
        });
        it('inbound: Rejected → rejected', () => {
            expect(mapCompanyStatus('Rejected', true)).to.equal('rejected');
        });
        it('outbound: unknown returns default Pending', () => {
            expect(mapCompanyStatus('mystery_status')).to.equal('Pending');
        });
    });

    // ── mapListingStatus ─────────────────────────────────────────────────────
    describe('mapListingStatus()', () => {
        it('undefined outbound returns Pending Approval', () => {
            expect(mapListingStatus(undefined)).to.equal('Pending Approval');
        });
        it('undefined inbound returns pending', () => {
            expect(mapListingStatus(undefined, true)).to.equal('pending');
        });
        it('outbound: sold → Sold', () => {
            expect(mapListingStatus('sold')).to.equal('Sold');
        });
        it('outbound: withdrawn → Rejected', () => {
            expect(mapListingStatus('withdrawn')).to.equal('Rejected');
        });
        it('inbound: Approved → available', () => {
            expect(mapListingStatus('Approved', true)).to.equal('available');
        });
        it('inbound: unknown defaults to pending', () => {
            expect(mapListingStatus('SomeOtherStatus', true)).to.equal('pending');
        });
    });

    // ── mapOfferStatus ───────────────────────────────────────────────────────
    describe('mapOfferStatus()', () => {
        it('undefined outbound returns Pending', () => {
            expect(mapOfferStatus(undefined)).to.equal('Pending');
        });
        it('undefined inbound returns pending', () => {
            expect(mapOfferStatus(undefined, true)).to.equal('pending');
        });
        it('outbound: rejected → Rejected', () => {
            expect(mapOfferStatus('rejected')).to.equal('Rejected');
        });
        it('outbound: withdrawn → Pending (not in map, returns default)', () => {
            expect(mapOfferStatus('withdrawn')).to.equal('Pending');
        });
        it('inbound: Unsuccessful → rejected', () => {
            expect(mapOfferStatus('Unsuccessful', true)).to.equal('rejected');
        });
        it('inbound: approved → approved (SF Approved maps to WT approved)', () => {
            expect(mapOfferStatus('approved', true)).to.equal('approved');
        });
        it('outbound: unknown returns default Pending', () => {
            expect(mapOfferStatus('custom_status')).to.equal('Pending');
        });
    });

    // ── mapUserRole ──────────────────────────────────────────────────────────
    describe('mapUserRole()', () => {
        it('undefined returns undefined', () => {
            expect(mapUserRole(undefined)).to.be.undefined();
        });
        it('outbound: dual → DUAL', () => {
            expect(mapUserRole('dual')).to.equal('DUAL');
        });
        it('inbound: HAULIER → haulier', () => {
            expect(mapUserRole('HAULIER', true)).to.equal('haulier');
        });
        it('outbound: unknown passes through as-is', () => {
            expect(mapUserRole('custom_role')).to.equal('custom_role');
        });
    });

    // ── mapUserStatus ────────────────────────────────────────────────────────
    describe('mapUserStatus()', () => {
        it('undefined outbound returns ACTIVE', () => {
            expect(mapUserStatus(undefined, false)).to.equal('ACTIVE');
        });
        it('undefined inbound returns active', () => {
            expect(mapUserStatus(undefined, true)).to.equal('active');
        });
        it('outbound: pending → PENDING', () => {
            expect(mapUserStatus('pending')).to.equal('PENDING');
        });
        it('outbound: request_information → REQUEST_INFORMATION', () => {
            expect(mapUserStatus('request_information')).to.equal('REQUEST_INFORMATION');
        });
        it('outbound: archived → INACTIVE (not in Lead picklist)', () => {
            expect(mapUserStatus('archived')).to.equal('INACTIVE');
        });
        it('inbound: REJECTED → rejected', () => {
            expect(mapUserStatus('REJECTED', true)).to.equal('rejected');
        });
        it('inbound: INACTIVE → archived', () => {
            expect(mapUserStatus('INACTIVE', true)).to.equal('archived');
        });
        it('outbound: unknown passes through as-is', () => {
            expect(mapUserStatus('weird_status')).to.equal('weird_status');
        });
    });

    // ── mapLoadStatus ────────────────────────────────────────────────────────
    describe('mapLoadStatus()', () => {
        it('undefined returns Awaiting Collection (no inbound/outbound distinction)', () => {
            expect(mapLoadStatus(undefined, false)).to.equal('Awaiting Collection');
        });
        it('undefined inbound also returns Awaiting Collection', () => {
            expect(mapLoadStatus(undefined, true)).to.equal('Awaiting Collection');
        });
        it('in_transit normalizes to In Transit', () => {
            expect(mapLoadStatus('in_transit')).to.equal('In Transit');
        });
        it('delivered normalizes to Delivered', () => {
            expect(mapLoadStatus('delivered')).to.equal('Delivered');
        });
        it('In Transit is a valid SF value, returns as-is', () => {
            expect(mapLoadStatus('In Transit', true)).to.equal('In Transit');
        });
        it('Delivered is a valid SF value, returns as-is', () => {
            expect(mapLoadStatus('Delivered', true)).to.equal('Delivered');
        });
        it('unknown passes through', () => {
            expect(mapLoadStatus('custom_load_status')).to.equal('custom_load_status');
        });
    });

    // ── map() dispatcher ─────────────────────────────────────────────────────
    describe('map() dispatcher', () => {
        it('dispatches to mapCompanyStatus outbound', () => {
            expect(map('companyStatus', 'active', false)).to.equal('Active');
        });
        it('dispatches to mapUserStatus inbound', () => {
            expect(map('userStatus', 'ACTIVE', true)).to.equal('active');
        });
        it('dispatches to mapLoadStatus', () => {
            expect(map('loadStatus', 'delivered')).to.equal('Delivered');
        });
        it('dispatches to mapCurrency', () => {
            expect(map('currency', 'usd')).to.equal('USD');
        });
    });
});
