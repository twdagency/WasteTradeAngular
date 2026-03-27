/**
 * Tests for salesforce-required-fields.config.ts
 * Validates GENERATED_FIELDS config structure and getCustomFields logic
 */
import { expect } from '@loopback/testlab';
import { GENERATED_FIELDS } from '../../utils/salesforce/salesforce-required-fields.config';

describe('salesforce-required-fields.config (unit)', () => {
    describe('GENERATED_FIELDS structure', () => {
        it('exports an object', () => {
            expect(GENERATED_FIELDS).to.be.an.Object();
        });

        it('contains expected Salesforce object keys', () => {
            const expectedKeys = [
                'Account',
                'Contact',
                'Lead',
                'Sales_Listing__c',
                'Wanted_Listings__c',
                'Offers__c',
                'Haulage_Offers__c',
                'Haulage_Loads__c',
                'Document__c',
            ];
            for (const key of expectedKeys) {
                expect(GENERATED_FIELDS).to.have.property(key);
            }
        });

        it('each value is an array', () => {
            for (const [key, value] of Object.entries(GENERATED_FIELDS)) {
                expect(Array.isArray(value)).to.be.true();
                void key; // suppress unused warning
            }
        });

        it('all field names in each array end with __c (custom fields only)', () => {
            for (const [, fields] of Object.entries(GENERATED_FIELDS)) {
                for (const field of fields) {
                    expect(field.endsWith('__c')).to.be.true();
                }
            }
        });

        it('Account has at least one custom field', () => {
            expect(GENERATED_FIELDS['Account'].length).to.be.greaterThan(0);
        });

        it('Sales_Listing__c has at least one custom field', () => {
            expect(GENERATED_FIELDS['Sales_Listing__c'].length).to.be.greaterThan(0);
        });

        it('Offers__c has at least one custom field', () => {
            expect(GENERATED_FIELDS['Offers__c'].length).to.be.greaterThan(0);
        });

        it('Haulage_Offers__c has at least one custom field', () => {
            expect(GENERATED_FIELDS['Haulage_Offers__c'].length).to.be.greaterThan(0);
        });

        it('contains no duplicate field names within each object', () => {
            for (const [obj, fields] of Object.entries(GENERATED_FIELDS)) {
                const unique = new Set(fields);
                expect(unique.size).to.equal(
                    fields.length,
                    `Duplicate fields found in "${obj}"`,
                );
            }
        });
    });
});
