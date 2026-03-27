import 'dotenv/config';
import { expect } from '@loopback/testlab';
import * as jsforce from 'jsforce';

const SF_ENABLED = process.env.SALESFORCE_SYNC_ENABLED === 'true';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Unique prefix per run so parallel runs never collide
const RUN_ID = Date.now();
const TEST_PREFIX = `IT_${RUN_ID}`;

function testExtId(suffix: string): string {
    return `${TEST_PREFIX}_${suffix}`;
}

function makeAccountPayload(externalId: string): Record<string, unknown> {
    // Derive a short discriminator from the externalId so that every account created
    // within a single run has a unique Name, Email, BillingStreet and Phone.
    // This prevents the sandbox duplicate rule (which matches on address + phone) from firing.
    const slug = externalId.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toLowerCase();
    return {
        Name: `${TEST_PREFIX} ${slug}`,
        // Unique street per record so address-based duplicate rules don't match
        BillingStreet: `${slug} Test Street`,
        BillingCity: 'London',
        BillingCountry: 'United Kingdom',
        BillingPostalCode: 'EC1A 1BB',
        // Unique phone per record (pad slug digits into a UK-style number)
        Phone: `+44${slug.replace(/\D/g, '').padEnd(10, '0').slice(0, 10)}`,
        Type: 'Customer',
        Email__c: `${slug}@test.wastetrade.com`,
        Account_Status__c: 'Pending',
        Last_Sync_Origin__c: `WT_${RUN_ID}`,
        WasteTrade_Company_Id__c: externalId,
    };
}

function makeLeadPayload(externalId: string): Record<string, unknown> {
    return {
        FirstName: 'Integration',
        LastName: 'Tester',
        Email: `it-lead-${RUN_ID}@test.wastetrade.com`,
        Phone: '+441234567891',
        Company: `${TEST_PREFIX} Acme Ltd`,
        LeadSource: 'Website',
        Status: 'Open - Not Contacted',
        // Required fields enforced by the UAT sandbox validation rules
        Lead_Direction__c: 'Inbound',
        Lead_Buyer_Intention__c: 'High',
        Lead_Rating__c: 'Cold',
        Last_Sync_Origin__c: `WT_${RUN_ID}`,
        WasteTrade_User_Id__c: externalId,
    };
}

// Sales_Listing__c has no Account lookup in the UAT sandbox — it identifies its
// seller company via WasteTrade_Site_Id__c (a text external-ID-style field).
function makeListingPayload(externalId: string): Record<string, unknown> {
    return {
        Name: `${TEST_PREFIX} HDPE Bales`,
        Sales_Listing_Name__c: `${TEST_PREFIX} HDPE Bales`,
        WasteTrade_Listing_Id__c: externalId,
        Material_Type__c: 'HDPE',
        Material_Packing__c: 'Bales',
        Material_Weight__c: 10,
        Price_Per_Tonne__c: 250,
        CurrencyIsoCode: 'GBP',
        Listing_Status__c: 'Pending Approval',
        WasteTrade_Publication_Status__c: 'Draft',
        Last_Sync_Origin__c: `WT_${RUN_ID}`,
    };
}

function makeOfferPayload(
    externalId: string,
    listingSfId: string,
): Record<string, unknown> {
    return {
        Name: `${TEST_PREFIX} Offer`,
        WasteTrade_Offer_Id__c: externalId,
        // Sandbox field name is lowercase sales_listing__c
        sales_listing__c: listingSfId,
        Offered_Price_Per_Unit__c: 230,
        Total_Price__c: 2300,
        Quantity__c: 10,
        Currency__c: 'GBP',
        bid_status__c: 'Pending',
        Last_Sync_Origin__c: `WT_${RUN_ID}`,
    };
}

// ─── Upsert helper that handles duplicate detection by falling back to create ─

async function upsertRecord(
    connection: jsforce.Connection,
    objectName: string,
    payload: Record<string, unknown>,
    externalIdField: string,
): Promise<string> {
    try {
        const result: any = await connection
            .sobject(objectName)
            .upsert(payload as any, externalIdField);
        if (!result.success) throw new Error(`Upsert failed: ${JSON.stringify(result.errors)}`);
        return result.id;
    } catch (err: any) {
        // If SF duplicate rule blocks the upsert, query the existing record instead
        if (err?.errorCode === 'DUPLICATES_DETECTED' || String(err?.message).includes('DUPLICATES_DETECTED')) {
            const existing: any[] = await (connection.sobject(objectName) as any)
                .find({ [externalIdField]: payload[externalIdField] }, 'Id')
                .execute();
            if (existing.length > 0) return existing[0].Id;
        }
        throw err;
    }
}

function makeContactPayload(externalId: string, accountSfId: string): Record<string, unknown> {
    const slug = externalId.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toLowerCase();
    return {
        FirstName: 'Integration',
        LastName: `Tester ${slug}`,
        Email: `it-contact-${slug}@test.wastetrade.com`,
        Phone: `+44${slug.replace(/\D/g, '').padEnd(10, '0').slice(0, 10)}`,
        AccountId: accountSfId,
        Company_Role__c: 'ADMIN',
        Is_Primary_Contact__c: true,
        Company_User_Status__c: 'ACTIVE',
        Last_Sync_Origin__c: `WT_${RUN_ID}`,
        WasteTrade_User_Id__c: externalId,
    };
}

function makeWantedListingPayload(externalId: string): Record<string, unknown> {
    return {
        Name: `${TEST_PREFIX} HDPE Wanted`,
        WasteTrade_Listing_Id__c: externalId,
        Material_Type__c: 'HDPE',
        Available_From__c: '2026-06-01',
        Listing_Status__c: 'Pending Approval',
        Last_Sync_Origin__c: `WT_${RUN_ID}`,
    };
}

function makeHaulageOfferPayload(externalId: string): Record<string, unknown> {
    return {
        Name: `${TEST_PREFIX} Haulage Offer`,
        WasteTrade_Haulage_Offers_ID__c: externalId,
        haulier_listing_status__c: 'Pending Approval',
        Transport_Provider__c: 'Own Haulage',
        expected__c: '1-2 Days',
        Customs_Clearance__c: 'No',
        trailer_or_container__c: 'Trailer',
        trailer_type__c: 'Curtain Sider',
        demurrage__c: '0',
        haulage_currency__c: 'GBP',
        Last_Sync_Origin__c: `WT_${RUN_ID}`,
    };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

(SF_ENABLED ? describe : describe.skip)('Salesforce Sync Round-Trip (integration)', function () {
    this.timeout(120000);

    let connection: jsforce.Connection;

    // Track created SF record IDs for guaranteed cleanup keyed by object name
    const cleanup: Record<string, string[]> = {
        Account: [],
        Lead: [],
        Contact: [],
        Sales_Listing__c: [],
        Wanted_Listings__c: [],
        Offers__c: [],
        Haulage_Offers__c: [],
    };

    before(async () => {
        connection = new jsforce.Connection({
            loginUrl: process.env.SALESFORCE_SANDBOX_URL || 'https://test.salesforce.com',
            version: process.env.SALESFORCE_API_VERSION || '58.0',
        });
        const password =
            (process.env.SALESFORCE_PASSWORD ?? '') + (process.env.SALESFORCE_SECURITY_TOKEN ?? '');
        await connection.login(process.env.SALESFORCE_USERNAME!, password);
    });

    after(async () => {
        // Delete in reverse dependency order — best-effort, never fail the suite
        const order: Array<keyof typeof cleanup> = [
            'Haulage_Offers__c', 'Offers__c', 'Contact', 'Wanted_Listings__c',
            'Sales_Listing__c', 'Lead', 'Account',
        ];
        for (const objectName of order) {
            const ids = cleanup[objectName].filter(Boolean);
            if (ids.length === 0) continue;
            try {
                await connection.sobject(objectName).destroy(ids as any);
            } catch {
                // intentionally swallow — cleanup is best-effort
            }
        }
    });

    // ─── Account round-trip ─────────────────────────────────────────────────

    describe('Account round-trip', () => {
        const extId = testExtId('acct_001');

        it('upserts a test Account and queries it back with matching fields', async () => {
            const payload = makeAccountPayload(extId);
            const sfId = await upsertRecord(connection, 'Account', payload, 'WasteTrade_Company_Id__c');
            cleanup['Account'].push(sfId);

            // SOQL requires comma-separated field list in the SELECT string
            const records: any[] = await connection
                .sobject('Account')
                .find({ WasteTrade_Company_Id__c: extId }, 'Id,BillingCity,Account_Status__c,Email__c,WasteTrade_Company_Id__c')
                .execute();

            expect(records.length).to.equal(1);
            expect(records[0].BillingCity).to.equal(payload.BillingCity);
            expect(records[0].Account_Status__c).to.equal(payload.Account_Status__c);
            expect(records[0].Email__c).to.equal(payload.Email__c);
            expect(records[0].WasteTrade_Company_Id__c).to.equal(extId);
        });
    });

    // ─── Lead round-trip ────────────────────────────────────────────────────

    describe('Lead round-trip', () => {
        const extId = testExtId('lead_001');

        it('upserts a test Lead and queries it back with matching fields', async () => {
            const payload = makeLeadPayload(extId);
            const sfId = await upsertRecord(connection, 'Lead', payload, 'WasteTrade_User_Id__c');
            cleanup['Lead'].push(sfId);

            const records: any[] = await connection
                .sobject('Lead')
                .find({ WasteTrade_User_Id__c: extId }, 'Id,FirstName,LastName,Email,LeadSource,Status,WasteTrade_User_Id__c')
                .execute();

            expect(records.length).to.equal(1);
            expect(records[0].FirstName).to.equal(payload.FirstName);
            expect(records[0].LastName).to.equal(payload.LastName);
            expect(records[0].Email).to.equal(payload.Email);
            expect(records[0].LeadSource).to.equal(payload.LeadSource);
            expect(records[0].WasteTrade_User_Id__c).to.equal(extId);
        });
    });

    // ─── Sales_Listing__c round-trip ────────────────────────────────────────

    describe('Sales_Listing__c round-trip', () => {
        const listingExtId = testExtId('listing_001');

        it('upserts a test Sales_Listing__c and queries it back', async () => {
            const payload = makeListingPayload(listingExtId);
            const sfId = await upsertRecord(connection, 'Sales_Listing__c', payload, 'WasteTrade_Listing_Id__c');
            cleanup['Sales_Listing__c'].push(sfId);

            const records: any[] = await connection
                .sobject('Sales_Listing__c')
                .find(
                    { WasteTrade_Listing_Id__c: listingExtId },
                    'Id,Material_Type__c,Listing_Status__c,CurrencyIsoCode,WasteTrade_Listing_Id__c',
                )
                .execute();

            expect(records.length).to.equal(1);
            expect(records[0].Material_Type__c).to.equal(payload.Material_Type__c);
            expect(records[0].Listing_Status__c).to.equal(payload.Listing_Status__c);
            expect(records[0].CurrencyIsoCode).to.equal(payload.CurrencyIsoCode);
            expect(records[0].WasteTrade_Listing_Id__c).to.equal(listingExtId);
        });
    });

    // ─── Offers__c round-trip ───────────────────────────────────────────────

    describe('Offers__c round-trip', () => {
        const listingExtId = testExtId('listing_for_offer');
        const offerExtId = testExtId('offer_001');
        let listingSfId: string;

        before('create parent Listing', async () => {
            listingSfId = await upsertRecord(
                connection,
                'Sales_Listing__c',
                makeListingPayload(listingExtId),
                'WasteTrade_Listing_Id__c',
            );
            cleanup['Sales_Listing__c'].push(listingSfId);
        });

        it('upserts a test Offer and queries it back', async () => {
            const payload = makeOfferPayload(offerExtId, listingSfId);
            const sfId = await upsertRecord(connection, 'Offers__c', payload, 'WasteTrade_Offer_Id__c');
            cleanup['Offers__c'].push(sfId);

            const records: any[] = await connection
                .sobject('Offers__c')
                .find(
                    { WasteTrade_Offer_Id__c: offerExtId },
                    'Id,bid_status__c,Offered_Price_Per_Unit__c,Currency__c,WasteTrade_Offer_Id__c',
                )
                .execute();

            expect(records.length).to.equal(1);
            expect(records[0].bid_status__c).to.equal(payload.bid_status__c);
            expect(records[0].Currency__c).to.equal(payload.Currency__c);
            expect(records[0].WasteTrade_Offer_Id__c).to.equal(offerExtId);
        });
    });

    // ─── Contact round-trip ─────────────────────────────────────────────────

    describe('Contact round-trip', () => {
        const acctExtId = testExtId('acct_for_contact');
        const contactExtId = testExtId('contact_001');
        let acctSfId: string;

        before('create parent Account', async () => {
            acctSfId = await upsertRecord(
                connection,
                'Account',
                makeAccountPayload(acctExtId),
                'WasteTrade_Company_Id__c',
            );
            cleanup['Account'].push(acctSfId);
        });

        it('upserts a test Contact and queries it back with matching fields', async () => {
            const payload = makeContactPayload(contactExtId, acctSfId);
            const sfId = await upsertRecord(connection, 'Contact', payload, 'WasteTrade_User_Id__c');
            cleanup['Contact'].push(sfId);

            const records: any[] = await connection
                .sobject('Contact')
                .find(
                    { WasteTrade_User_Id__c: contactExtId },
                    'Id,FirstName,LastName,Email,Company_Role__c,Company_User_Status__c,WasteTrade_User_Id__c',
                )
                .execute();

            expect(records.length).to.equal(1);
            expect(records[0].FirstName).to.equal(payload.FirstName);
            expect(records[0].LastName).to.equal(payload.LastName);
            expect(records[0].Email).to.equal(payload.Email);
            expect(records[0].Company_Role__c).to.equal(payload.Company_Role__c);
            expect(records[0].Company_User_Status__c).to.equal(payload.Company_User_Status__c);
            expect(records[0].WasteTrade_User_Id__c).to.equal(contactExtId);
        });
    });

    // ─── Wanted_Listings__c round-trip ──────────────────────────────────────

    describe('Wanted_Listings__c round-trip', () => {
        const wantedExtId = testExtId('wanted_001');

        it('upserts a test Wanted_Listings__c and queries it back', async () => {
            const payload = makeWantedListingPayload(wantedExtId);
            const sfId = await upsertRecord(connection, 'Wanted_Listings__c', payload, 'WasteTrade_Listing_Id__c');
            cleanup['Wanted_Listings__c'].push(sfId);

            const records: any[] = await connection
                .sobject('Wanted_Listings__c')
                .find(
                    { WasteTrade_Listing_Id__c: wantedExtId },
                    'Id,Material_Type__c,Listing_Status__c,WasteTrade_Listing_Id__c',
                )
                .execute();

            expect(records.length).to.equal(1);
            expect(records[0].Material_Type__c).to.equal(payload.Material_Type__c);
            expect(records[0].Listing_Status__c).to.equal(payload.Listing_Status__c);
            expect(records[0].WasteTrade_Listing_Id__c).to.equal(wantedExtId);
        });
    });

    // ─── Haulage_Offers__c round-trip ───────────────────────────────────────

    describe('Haulage_Offers__c round-trip', () => {
        const haulageExtId = testExtId('haulage_001');

        it('upserts a test Haulage_Offers__c and queries it back', async () => {
            const payload = makeHaulageOfferPayload(haulageExtId);
            const sfId = await upsertRecord(
                connection,
                'Haulage_Offers__c',
                payload,
                'WasteTrade_Haulage_Offers_ID__c',
            );
            cleanup['Haulage_Offers__c'].push(sfId);

            const records: any[] = await connection
                .sobject('Haulage_Offers__c')
                .find(
                    { WasteTrade_Haulage_Offers_ID__c: haulageExtId },
                    'Id,haulier_listing_status__c,Transport_Provider__c,expected__c,WasteTrade_Haulage_Offers_ID__c',
                )
                .execute();

            expect(records.length).to.equal(1);
            expect(records[0].haulier_listing_status__c).to.equal(payload.haulier_listing_status__c);
            expect(records[0].Transport_Provider__c).to.equal(payload.Transport_Provider__c);
            expect(records[0].expected__c).to.equal(payload.expected__c);
            expect(records[0].WasteTrade_Haulage_Offers_ID__c).to.equal(haulageExtId);
        });
    });
});
