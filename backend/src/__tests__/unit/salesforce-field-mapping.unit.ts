import { expect } from '@loopback/testlab';
import {
    getOutboundFields,
    getInboundFields,
    isInboundWritable,
    getWasteTradeField,
    getSalesforceField,
    ACCOUNT_FIELD_MAPPINGS,
    CONTACT_FIELD_MAPPINGS,
} from '../../utils/salesforce/salesforce-field-mapping.utils';

describe('salesforce-field-mapping.utils (unit)', () => {
    describe('getOutboundFields', () => {
        it('returns WT→SF and bidirectional fields for Account', () => {
            const fields = getOutboundFields('Account');
            expect(fields.length).to.be.greaterThan(0);
            for (const f of fields) {
                expect(['WT→SF', 'bidirectional']).to.containEql(f.direction);
            }
        });

        it('returns WT→SF and bidirectional fields for Contact', () => {
            const fields = getOutboundFields('Contact');
            expect(fields.length).to.be.greaterThan(0);
            for (const f of fields) {
                expect(['WT→SF', 'bidirectional']).to.containEql(f.direction);
            }
        });

        it('includes bidirectional name field for Account', () => {
            const fields = getOutboundFields('Account');
            const nameField = fields.find((f) => f.wasteTradeField === 'name');
            expect(nameField).to.not.be.undefined();
            expect(nameField!.salesforceField).to.equal('Name');
        });
    });

    describe('getInboundFields', () => {
        it('returns SF→WT and bidirectional fields for Account', () => {
            const fields = getInboundFields('Account');
            expect(fields.length).to.be.greaterThan(0);
            for (const f of fields) {
                expect(['SF→WT', 'bidirectional']).to.containEql(f.direction);
            }
        });

        it('returns SF→WT and bidirectional fields for Contact', () => {
            const fields = getInboundFields('Contact');
            expect(fields.length).to.be.greaterThan(0);
        });
    });

    describe('isInboundWritable', () => {
        it('returns true for a bidirectional Account field', () => {
            // 'Name' is bidirectional
            expect(isInboundWritable('Name', 'Account')).to.be.true();
        });

        it('returns false for WT→SF only Account field', () => {
            // 'Description' is WT→SF only
            expect(isInboundWritable('Description', 'Account')).to.be.false();
        });

        it('returns false for unknown field', () => {
            expect(isInboundWritable('NonExistentField__c', 'Account')).to.be.false();
        });

        it('returns true for bidirectional Contact field', () => {
            expect(isInboundWritable('Email', 'Contact')).to.be.true();
        });
    });

    describe('getWasteTradeField', () => {
        it('returns WT field name for known SF Account field', () => {
            expect(getWasteTradeField('Name', 'Account')).to.equal('name');
            expect(getWasteTradeField('BillingCity', 'Account')).to.equal('city');
        });

        it('returns null for unknown SF field', () => {
            expect(getWasteTradeField('Unknown__c', 'Account')).to.be.null();
        });

        it('returns WT field for Contact SF field', () => {
            expect(getWasteTradeField('Email', 'Contact')).to.equal('email');
        });
    });

    describe('getSalesforceField', () => {
        it('returns SF field name for known WT Account field', () => {
            expect(getSalesforceField('name', 'Account')).to.equal('Name');
            expect(getSalesforceField('city', 'Account')).to.equal('BillingCity');
        });

        it('returns null for unknown WT field', () => {
            expect(getSalesforceField('nonExistent', 'Account')).to.be.null();
        });

        it('returns SF field for Contact WT field', () => {
            expect(getSalesforceField('email', 'Contact')).to.equal('Email');
        });
    });

    describe('ACCOUNT_FIELD_MAPPINGS integrity', () => {
        it('all mappings have required wasteTradeField, salesforceField, direction', () => {
            for (const m of ACCOUNT_FIELD_MAPPINGS) {
                expect(m.wasteTradeField).to.be.a.String();
                expect(m.salesforceField).to.be.a.String();
                expect(['WT→SF', 'SF→WT', 'bidirectional']).to.containEql(m.direction);
            }
        });
    });

    describe('CONTACT_FIELD_MAPPINGS integrity', () => {
        it('all mappings have required fields', () => {
            for (const m of CONTACT_FIELD_MAPPINGS) {
                expect(m.wasteTradeField).to.be.a.String();
                expect(m.salesforceField).to.be.a.String();
                expect(['WT→SF', 'SF→WT', 'bidirectional']).to.containEql(m.direction);
            }
        });
    });
});
