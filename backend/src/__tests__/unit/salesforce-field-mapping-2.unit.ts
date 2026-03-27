import { expect } from '@loopback/testlab';
import {
    getOutboundFieldsForObject,
    getInboundFieldsForObject,
    isInboundWritableForObject,
    SALES_LISTING_FIELD_MAPPINGS,
    OFFERS_FIELD_MAPPINGS,
    MAPPING_SCHEMA_VERSION,
} from '../../utils/salesforce/salesforce-field-mapping.utils';

describe('salesforce-field-mapping.utils extended coverage (unit)', () => {
    describe('getOutboundFieldsForObject()', () => {
        it('returns outbound fields for Sales_Listing__c', () => {
            const fields = getOutboundFieldsForObject('Sales_Listing__c');
            expect(fields.length).to.be.greaterThan(0);
            for (const f of fields) {
                expect(['WT→SF', 'bidirectional']).to.containEql(f.direction);
            }
        });

        it('returns outbound fields for Offers__c', () => {
            const fields = getOutboundFieldsForObject('Offers__c');
            expect(fields.length).to.be.greaterThan(0);
            for (const f of fields) {
                expect(['WT→SF', 'bidirectional']).to.containEql(f.direction);
            }
        });

        it('returns outbound fields for Account', () => {
            const fields = getOutboundFieldsForObject('Account');
            expect(fields.length).to.be.greaterThan(0);
        });

        it('returns outbound fields for Contact', () => {
            const fields = getOutboundFieldsForObject('Contact');
            expect(fields.length).to.be.greaterThan(0);
        });

        it('returns empty array for unknown object type', () => {
            const fields = getOutboundFieldsForObject('Unknown__c' as any);
            expect(fields).to.deepEqual([]);
        });
    });

    describe('getInboundFieldsForObject()', () => {
        it('returns inbound fields for Sales_Listing__c', () => {
            const fields = getInboundFieldsForObject('Sales_Listing__c');
            // Only status is bidirectional in listings
            expect(fields.length).to.be.greaterThan(0);
            for (const f of fields) {
                expect(['SF→WT', 'bidirectional']).to.containEql(f.direction);
            }
        });

        it('returns inbound fields for Offers__c', () => {
            const fields = getInboundFieldsForObject('Offers__c');
            expect(fields.length).to.be.greaterThan(0);
            for (const f of fields) {
                expect(['SF→WT', 'bidirectional']).to.containEql(f.direction);
            }
        });

        it('returns inbound fields for Account', () => {
            const fields = getInboundFieldsForObject('Account');
            expect(fields.length).to.be.greaterThan(0);
        });

        it('returns inbound fields for Contact', () => {
            const fields = getInboundFieldsForObject('Contact');
            expect(fields.length).to.be.greaterThan(0);
        });

        it('returns empty array for unknown object type', () => {
            const fields = getInboundFieldsForObject('Nonexistent__c' as any);
            expect(fields).to.deepEqual([]);
        });
    });

    describe('isInboundWritableForObject()', () => {
        it('returns true for bidirectional status field in Sales_Listing__c', () => {
            expect(isInboundWritableForObject('Listing_Status__c', 'Sales_Listing__c')).to.be.true();
        });

        it('returns false for WT→SF only field in Sales_Listing__c', () => {
            expect(isInboundWritableForObject('Material_Type__c', 'Sales_Listing__c')).to.be.false();
        });

        it('returns true for bidirectional status field in Offers__c', () => {
            expect(isInboundWritableForObject('bid_status__c', 'Offers__c')).to.be.true();
        });

        it('returns true for rejectionReason bidirectional field in Offers__c', () => {
            expect(isInboundWritableForObject('Rejection_Reason__c', 'Offers__c')).to.be.true();
        });

        it('returns false for outbound-only quantity field in Offers__c', () => {
            expect(isInboundWritableForObject('Quantity__c', 'Offers__c')).to.be.false();
        });

        it('returns false for unknown field in Account', () => {
            expect(isInboundWritableForObject('Unknown_Field__c', 'Account')).to.be.false();
        });

        it('returns false for unknown object type', () => {
            expect(isInboundWritableForObject('Name', 'Unknown__c' as any)).to.be.false();
        });

        it('returns true for bidirectional Name field in Account', () => {
            expect(isInboundWritableForObject('Name', 'Account')).to.be.true();
        });
    });

    describe('SALES_LISTING_FIELD_MAPPINGS integrity', () => {
        it('all mappings have required wasteTradeField, salesforceField, direction', () => {
            for (const m of SALES_LISTING_FIELD_MAPPINGS) {
                expect(m.wasteTradeField).to.be.a.String();
                expect(m.salesforceField).to.be.a.String();
                expect(['WT→SF', 'SF→WT', 'bidirectional']).to.containEql(m.direction);
            }
        });

        it('contains status as bidirectional mapping', () => {
            const statusMapping = SALES_LISTING_FIELD_MAPPINGS.find(
                m => m.wasteTradeField === 'status' && m.direction === 'bidirectional',
            );
            expect(statusMapping).to.not.be.undefined();
        });

        it('materialType field maps to Material_Type__c', () => {
            const mapping = SALES_LISTING_FIELD_MAPPINGS.find(m => m.wasteTradeField === 'materialType');
            expect(mapping).to.not.be.undefined();
            expect(mapping!.salesforceField).to.equal('Material_Type__c');
        });
    });

    describe('OFFERS_FIELD_MAPPINGS integrity', () => {
        it('all mappings have required fields', () => {
            for (const m of OFFERS_FIELD_MAPPINGS) {
                expect(m.wasteTradeField).to.be.a.String();
                expect(m.salesforceField).to.be.a.String();
                expect(['WT→SF', 'SF→WT', 'bidirectional']).to.containEql(m.direction);
            }
        });

        it('contains bid_status__c as bidirectional', () => {
            const m = OFFERS_FIELD_MAPPINGS.find(f => f.salesforceField === 'bid_status__c');
            expect(m).to.not.be.undefined();
            expect(m!.direction).to.equal('bidirectional');
        });

        it('quantity field is outbound only', () => {
            const m = OFFERS_FIELD_MAPPINGS.find(f => f.salesforceField === 'Quantity__c');
            expect(m).to.not.be.undefined();
            expect(m!.direction).to.equal('WT→SF');
        });
    });

    describe('MAPPING_SCHEMA_VERSION', () => {
        it('is a valid semver string', () => {
            expect(MAPPING_SCHEMA_VERSION).to.be.a.String();
            expect(/^\d+\.\d+\.\d+$/.test(MAPPING_SCHEMA_VERSION)).to.be.true();
        });
    });
});
