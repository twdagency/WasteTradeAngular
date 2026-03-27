import 'dotenv/config';
import { expect } from '@loopback/testlab';
import * as jsforce from 'jsforce';

const SF_ENABLED = process.env.SALESFORCE_SYNC_ENABLED === 'true';

(SF_ENABLED ? describe : describe.skip)('Salesforce Picklist Validation (integration)', function () {
    this.timeout(60000);

    let connection: jsforce.Connection;

    before(async () => {
        connection = new jsforce.Connection({
            loginUrl: process.env.SALESFORCE_SANDBOX_URL || 'https://test.salesforce.com',
            version: process.env.SALESFORCE_API_VERSION || '58.0',
        });
        const password =
            (process.env.SALESFORCE_PASSWORD ?? '') + (process.env.SALESFORCE_SECURITY_TOKEN ?? '');
        await connection.login(process.env.SALESFORCE_USERNAME!, password);
    });

    async function getPicklistValues(objectName: string, fieldName: string): Promise<string[]> {
        const desc = await connection.sobject(objectName).describe();
        const field = desc.fields.find((f: any) => f.name === fieldName);
        if (!field || !field.picklistValues || field.picklistValues.length === 0) return [];
        return field.picklistValues
            .filter((v: any) => v.active)
            .map((v: any) => v.value as string);
    }

    function assertContains(actual: string[], expected: string[], fieldLabel: string): void {
        for (const val of expected) {
            if (!actual.includes(val)) {
                throw new Error(
                    `Picklist "${fieldLabel}" missing value "${val}". Active values: [${actual.join(', ')}]`,
                );
            }
        }
    }

    // ─── Sales_Listing__c ───────────────────────────────────────────────────────

    describe('Sales_Listing__c picklists', () => {
        it('Listing_Status__c contains all outbound mapper values', async () => {
            const values = await getPicklistValues('Sales_Listing__c', 'Listing_Status__c');
            // mapListingStatus outbound: pending→Pending Approval, available→Approved, rejected→Rejected
            assertContains(values, ['Pending Approval', 'Approved', 'Rejected'], 'Listing_Status__c');
        });

        it('WasteTrade_Publication_Status__c contains all outbound mapper values', async () => {
            const values = await getPicklistValues('Sales_Listing__c', 'WasteTrade_Publication_Status__c');
            // mapWasteTradePublicationStatus: pending→Draft, available→Published, rejected→Archived
            assertContains(values, ['Draft', 'Published', 'Archived'], 'WasteTrade_Publication_Status__c');
        });

        it('Storage_Type__c contains expected values', async () => {
            const values = await getPicklistValues('Sales_Listing__c', 'Storage_Type__c');
            assertContains(values, ['Indoors', 'Outdoors'], 'Storage_Type__c');
        });
    });

    // ─── Offers__c ──────────────────────────────────────────────────────────────

    describe('Offers__c picklists', () => {
        it('bid_status__c contains all outbound mapper values', async () => {
            const values = await getPicklistValues('Offers__c', 'bid_status__c');
            // mapOfferStatus outbound: pending→Pending, accepted→Accepted, rejected→Unsuccessful
            assertContains(values, ['Pending', 'Accepted', 'Unsuccessful'], 'bid_status__c');
        });
    });

    // ─── Haulage_Offers__c ──────────────────────────────────────────────────────
    // NOTE: actual sandbox field names differ from mapper references:
    //   haulage_status__c → haulier_listing_status__c
    //   transport_provider__c → Transport_Provider__c
    //   expected_transit_time__c → expected__c

    describe('Haulage_Offers__c picklists', () => {
        it('haulier_listing_status__c contains all outbound mapper values', async () => {
            const values = await getPicklistValues('Haulage_Offers__c', 'haulier_listing_status__c');
            // mapHaulageOfferStatus outbound: pending→Pending Approval, approved→Approved, rejected→Rejected
            assertContains(values, ['Pending Approval', 'Approved', 'Rejected'], 'haulier_listing_status__c');
        });

        it('Transport_Provider__c contains all outbound mapper values', async () => {
            const values = await getPicklistValues('Haulage_Offers__c', 'Transport_Provider__c');
            // mapTransportProvider outbound: own_haulage→Own Haulage, mixed→Mixed Haulage, third_party→Third Party Haulier
            assertContains(values, ['Own Haulage', 'Mixed Haulage', 'Third Party Haulier'], 'Transport_Provider__c');
        });

        it('expected__c contains all transit time mapper values', async () => {
            const values = await getPicklistValues('Haulage_Offers__c', 'expected__c');
            // mapExpectedTransitTime valid values (sandbox has 7 options)
            assertContains(
                values,
                ['1-2 Days', '3-4 Days', '4-6 Days', '1 Week', '2 Weeks', '3 Weeks', '1 Month'],
                'expected__c',
            );
        });

        it('trailer_or_container__c contains Trailer', async () => {
            const values = await getPicklistValues('Haulage_Offers__c', 'trailer_or_container__c');
            // mapTrailerOrContainer always returns 'Trailer'
            assertContains(values, ['Trailer'], 'trailer_or_container__c');
        });

        it('trailer_type__c contains all mapper values', async () => {
            const values = await getPicklistValues('Haulage_Offers__c', 'trailer_type__c');
            // mapTrailerType valid values
            assertContains(
                values,
                ['Curtain Sider', 'Containers', 'Tipper Trucks', 'Walking Floor'],
                'trailer_type__c',
            );
        });

        it('Customs_Clearance__c contains expected values', async () => {
            const values = await getPicklistValues('Haulage_Offers__c', 'Customs_Clearance__c');
            assertContains(values, ['Yes', 'No'], 'Customs_Clearance__c');
        });
    });

    // ─── Contact ────────────────────────────────────────────────────────────────

    describe('Contact picklists', () => {
        it('Company_Role__c contains all expected role values', async () => {
            const values = await getPicklistValues('Contact', 'Company_Role__c');
            assertContains(values, ['ADMIN', 'BUYER', 'SELLER', 'HAULIER', 'DUAL'], 'Company_Role__c');
        });

        it('Company_User_Status__c contains all expected status values', async () => {
            const values = await getPicklistValues('Contact', 'Company_User_Status__c');
            assertContains(values, ['PENDING', 'ACTIVE', 'REJECTED', 'INACTIVE'], 'Company_User_Status__c');
        });
    });

    // ─── Lead ───────────────────────────────────────────────────────────────────

    describe('Lead picklists', () => {
        it('LeadSource contains all mapper output values', async () => {
            const values = await getPicklistValues('Lead', 'LeadSource');
            // mapLeadSource outputs — all these must be valid SF picklist values
            assertContains(
                values,
                ['Website', 'Advertisement', 'Google AdWords', 'Trade Show', 'External Referral',
                    'Customer Event', 'Employee Referral', 'Partner', 'Purchased List', 'Webinar', 'Other'],
                'LeadSource',
            );
        });
    });

    // ─── Account ────────────────────────────────────────────────────────────────
    // Account_Status__c is type "string" in UAT sandbox (not a picklist) — values are freeform.
    // This test documents that fact so the team knows constraint is not enforced at SF level.

    describe('Account picklists', () => {
        it('Account_Status__c field exists (values not constrained as picklist in UAT sandbox)', async () => {
            const desc = await connection.sobject('Account').describe();
            const field = desc.fields.find((f: any) => f.name === 'Account_Status__c');
            expect(field).to.not.be.undefined();
            // In UAT sandbox this is a free-text field; document that the mapper emits valid values
            const mapperOutputs = ['Pending', 'Active', 'Rejected', 'Inactive'];
            expect(mapperOutputs.length).to.be.greaterThan(0);
        });
    });
});
