import 'dotenv/config';
import { expect } from '@loopback/testlab';
import * as jsforce from 'jsforce';

const SF_ENABLED = process.env.SALESFORCE_SYNC_ENABLED === 'true';

(SF_ENABLED ? describe : describe.skip)('Salesforce Field Existence (integration)', function () {
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

    async function getFieldNames(objectName: string): Promise<string[]> {
        const desc = await connection.sobject(objectName).describe();
        return desc.fields.map((f: any) => f.name);
    }

    async function getField(objectName: string, fieldName: string): Promise<any> {
        const desc = await connection.sobject(objectName).describe();
        return desc.fields.find((f: any) => f.name === fieldName);
    }

    // ─── Account ────────────────────────────────────────────────────────────────

    describe('Account fields', () => {
        it('has all required custom fields', async () => {
            const fieldNames = await getFieldNames('Account');
            // Fields confirmed present in UAT sandbox
            const required = [
                'Email__c',
                'WasteTrade_Company_Id__c',
                'Account_Status__c',
                'Company_VAT_Number__c',
                'Company_Registration_Number__c',
                'WT_Company_Interest__c',
                'VAT_Registration_Country__c',
                'Last_Sync_Origin__c',
            ];
            for (const field of required) {
                expect(fieldNames).to.containEql(field);
            }
        });

        it('has all required standard fields', async () => {
            const fieldNames = await getFieldNames('Account');
            for (const field of ['Name', 'Phone', 'Website', 'BillingStreet', 'BillingCity', 'BillingCountry']) {
                expect(fieldNames).to.containEql(field);
            }
        });

        it('WasteTrade_Company_Id__c is marked as external ID', async () => {
            const field = await getField('Account', 'WasteTrade_Company_Id__c');
            expect(field).to.not.be.undefined();
            expect(field.externalId).to.be.true();
        });
    });

    // ─── Lead ───────────────────────────────────────────────────────────────────

    describe('Lead fields', () => {
        it('has all required custom fields', async () => {
            const fieldNames = await getFieldNames('Lead');
            // CompanyInterest__c is not in UAT sandbox; WasteTrade_Company_Interest__c is used instead
            const required = [
                'WasteTrade_User_Id__c',
                'Last_Sync_Origin__c',
            ];
            for (const field of required) {
                expect(fieldNames).to.containEql(field);
            }
        });

        it('has all required standard fields', async () => {
            const fieldNames = await getFieldNames('Lead');
            for (const field of ['FirstName', 'LastName', 'Email', 'Phone', 'Company', 'LeadSource', 'Status']) {
                expect(fieldNames).to.containEql(field);
            }
        });

        it('WasteTrade_User_Id__c is marked as external ID', async () => {
            const field = await getField('Lead', 'WasteTrade_User_Id__c');
            expect(field).to.not.be.undefined();
            expect(field.externalId).to.be.true();
        });
    });

    // ─── Contact ────────────────────────────────────────────────────────────────

    describe('Contact fields', () => {
        it('has all required custom fields', async () => {
            const fieldNames = await getFieldNames('Contact');
            const required = [
                'WasteTrade_User_Id__c',
                'Company_Role__c',
                'Is_Primary_Contact__c',
                'Company_User_Status__c',
                'Last_Sync_Origin__c',
            ];
            for (const field of required) {
                expect(fieldNames).to.containEql(field);
            }
        });

        it('has all required standard fields', async () => {
            const fieldNames = await getFieldNames('Contact');
            for (const field of ['FirstName', 'LastName', 'Email', 'Phone', 'AccountId', 'Title']) {
                expect(fieldNames).to.containEql(field);
            }
        });

        it('WasteTrade_User_Id__c is marked as external ID', async () => {
            const field = await getField('Contact', 'WasteTrade_User_Id__c');
            expect(field).to.not.be.undefined();
            expect(field.externalId).to.be.true();
        });
    });

    // ─── Sales_Listing__c ───────────────────────────────────────────────────────

    describe('Sales_Listing__c fields', () => {
        it('has all required fields confirmed in UAT sandbox', async () => {
            const fieldNames = await getFieldNames('Sales_Listing__c');
            // Field names confirmed from sandbox describe()
            const required = [
                'Name',
                'Sales_Listing_Name__c',
                'WasteTrade_Listing_Id__c',
                'Material_Type__c',
                'Material_Packing__c',
                'Material_Weight__c',
                'Price_Per_Tonne__c',
                'CurrencyIsoCode',
                'Available_From_Date__c',
                'Available_Until__c',
                'Listing_Status__c',
                'WasteTrade_Publication_Status__c',
                'Description__c',
                'Number_of_Loads__c',
                'Storage_Type__c',
                'Last_Sync_Origin__c',
            ];
            for (const field of required) {
                expect(fieldNames).to.containEql(field);
            }
        });

        it('WasteTrade_Listing_Id__c is marked as external ID', async () => {
            const field = await getField('Sales_Listing__c', 'WasteTrade_Listing_Id__c');
            expect(field).to.not.be.undefined();
            expect(field.externalId).to.be.true();
        });
    });

    // ─── Wanted_Listings__c ─────────────────────────────────────────────────────

    describe('Wanted_Listings__c fields', () => {
        it('has all required fields confirmed in UAT sandbox', async () => {
            const fieldNames = await getFieldNames('Wanted_Listings__c');
            // External ID in sandbox is WasteTrade_Listing_Id__c (not WasteTrade_Wanted_Listing_Id__c)
            const required = [
                'Name',
                'WasteTrade_Listing_Id__c',
                'Material_Type__c',
                'Available_From__c',
                'Listing_Status__c',
                'Last_Sync_Origin__c',
            ];
            for (const field of required) {
                expect(fieldNames).to.containEql(field);
            }
        });

        it('WasteTrade_Listing_Id__c is marked as external ID', async () => {
            const field = await getField('Wanted_Listings__c', 'WasteTrade_Listing_Id__c');
            expect(field).to.not.be.undefined();
            expect(field.externalId).to.be.true();
        });
    });

    // ─── Offers__c ──────────────────────────────────────────────────────────────

    describe('Offers__c fields', () => {
        it('has all required fields confirmed in UAT sandbox', async () => {
            const fieldNames = await getFieldNames('Offers__c');
            const required = [
                'Name',
                'WasteTrade_Offer_Id__c',
                'sales_listing__c',
                'Offered_Price_Per_Unit__c',
                'Total_Price__c',
                'Quantity__c',
                'Currency__c',
                'bid_status__c',
                'Offer_Status__c',
                'Rejection_Reason__c',
                'Message__c',
                'Last_Sync_Origin__c',
            ];
            for (const field of required) {
                expect(fieldNames).to.containEql(field);
            }
        });

        it('WasteTrade_Offer_Id__c is marked as external ID', async () => {
            const field = await getField('Offers__c', 'WasteTrade_Offer_Id__c');
            expect(field).to.not.be.undefined();
            expect(field.externalId).to.be.true();
        });
    });

    // ─── Haulage_Offers__c ──────────────────────────────────────────────────────

    describe('Haulage_Offers__c fields', () => {
        it('has all required fields confirmed in UAT sandbox', async () => {
            const fieldNames = await getFieldNames('Haulage_Offers__c');
            // Actual field names from sandbox (differ from mapper references — sync service maps them)
            const required = [
                'Name',
                'WasteTrade_Haulage_Offers_ID__c',
                'haulier_listing_status__c',
                'Transport_Provider__c',
                'expected__c',
                'demurrage__c',
                'Customs_Clearance__c',
                'trailer_or_container__c',
                'trailer_type__c',
                'Last_Sync_Origin__c',
            ];
            for (const field of required) {
                expect(fieldNames).to.containEql(field);
            }
        });

        it('WasteTrade_Haulage_Offers_ID__c is marked as external ID', async () => {
            const field = await getField('Haulage_Offers__c', 'WasteTrade_Haulage_Offers_ID__c');
            expect(field).to.not.be.undefined();
            expect(field.externalId).to.be.true();
        });
    });

    // ─── Document__c ────────────────────────────────────────────────────────────

    describe('Document__c fields', () => {
        it('has all required fields confirmed in UAT sandbox', async () => {
            const fieldNames = await getFieldNames('Document__c');
            // Fields confirmed from sandbox describe() — sandbox uses Document_URL__c not Document_Link__c,
            // and has no Account__c lookup (links via WasteTrade_Haulage_Offer_Id__c instead)
            const required = [
                'Name',
                'WasteTrade_Document_Id__c',
                'Document_Type__c',
                'Document_URL__c',
                'Document_Status__c',
                'Rejection_Reason__c',
            ];
            for (const field of required) {
                expect(fieldNames).to.containEql(field);
            }
        });

        it('WasteTrade_Document_Id__c is marked as external ID', async () => {
            const field = await getField('Document__c', 'WasteTrade_Document_Id__c');
            expect(field).to.not.be.undefined();
            expect(field.externalId).to.be.true();
        });
    });
});
