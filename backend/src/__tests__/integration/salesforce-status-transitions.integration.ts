import 'dotenv/config';
import { expect } from '@loopback/testlab';
import * as jsforce from 'jsforce';

const SF_ENABLED = process.env.SALESFORCE_SYNC_ENABLED === 'true';

const RUN_ID = Date.now();
const TEST_PREFIX = `IT_${RUN_ID}`;

function testExtId(suffix: string): string {
    return `${TEST_PREFIX}_${suffix}`;
}

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
        if (err?.errorCode === 'DUPLICATES_DETECTED' || String(err?.message).includes('DUPLICATES_DETECTED')) {
            const existing: any[] = await (connection.sobject(objectName) as any)
                .find({ [externalIdField]: payload[externalIdField] }, 'Id')
                .execute();
            if (existing.length > 0) return existing[0].Id;
        }
        throw err;
    }
}

(SF_ENABLED ? describe : describe.skip)('Salesforce Status Transitions (integration)', function () {
    this.timeout(120000);

    let connection: jsforce.Connection;

    const cleanup: Record<string, string[]> = {
        Account: [],
        Sales_Listing__c: [],
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
        const order: Array<keyof typeof cleanup> = [
            'Haulage_Offers__c', 'Offers__c', 'Sales_Listing__c', 'Account',
        ];
        for (const objectName of order) {
            const ids = cleanup[objectName].filter(Boolean);
            if (ids.length === 0) continue;
            try {
                await connection.sobject(objectName).destroy(ids as any);
            } catch {
                // best-effort
            }
        }
    });

    // ─── Account: Pending → Active ──────────────────────────────────────────

    describe('Account Account_Status__c transition', () => {
        const extId = testExtId('acct_st_001');
        const slug = extId.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toLowerCase();

        it('transitions Account_Status__c from Pending to Active', async () => {
            const initial: Record<string, unknown> = {
                Name: `${TEST_PREFIX} ${slug}`,
                BillingStreet: `${slug} Status Street`,
                BillingCity: 'London',
                BillingCountry: 'United Kingdom',
                BillingPostalCode: 'EC1A 1BB',
                Phone: `+44${slug.replace(/\D/g, '').padEnd(10, '0').slice(0, 10)}`,
                Type: 'Customer',
                Email__c: `${slug}@test.wastetrade.com`,
                Account_Status__c: 'Pending',
                Last_Sync_Origin__c: `WT_${RUN_ID}`,
                WasteTrade_Company_Id__c: extId,
            };
            const sfId = await upsertRecord(connection, 'Account', initial, 'WasteTrade_Company_Id__c');
            cleanup['Account'].push(sfId);

            // Transition to Active
            await upsertRecord(connection, 'Account', {
                ...initial,
                Account_Status__c: 'Active',
            }, 'WasteTrade_Company_Id__c');

            const records: any[] = await connection
                .sobject('Account')
                .find({ WasteTrade_Company_Id__c: extId }, 'Id,Account_Status__c')
                .execute();

            expect(records.length).to.equal(1);
            expect(records[0].Account_Status__c).to.equal('Active');
        });
    });

    // ─── Sales_Listing__c: Pending Approval → Approved ──────────────────────

    describe('Sales_Listing__c Listing_Status__c transition', () => {
        const extId = testExtId('listing_st_001');

        it('transitions Listing_Status__c from Pending Approval to Approved', async () => {
            const initial: Record<string, unknown> = {
                Name: `${TEST_PREFIX} HDPE Status`,
                Sales_Listing_Name__c: `${TEST_PREFIX} HDPE Status`,
                WasteTrade_Listing_Id__c: extId,
                Material_Type__c: 'HDPE',
                Material_Packing__c: 'Bales',
                Material_Weight__c: 10,
                Price_Per_Tonne__c: 250,
                CurrencyIsoCode: 'GBP',
                Listing_Status__c: 'Pending Approval',
                WasteTrade_Publication_Status__c: 'Draft',
                Last_Sync_Origin__c: `WT_${RUN_ID}`,
            };
            const sfId = await upsertRecord(connection, 'Sales_Listing__c', initial, 'WasteTrade_Listing_Id__c');
            cleanup['Sales_Listing__c'].push(sfId);

            await upsertRecord(connection, 'Sales_Listing__c', {
                ...initial,
                Listing_Status__c: 'Approved',
                WasteTrade_Publication_Status__c: 'Published',
            }, 'WasteTrade_Listing_Id__c');

            const records: any[] = await connection
                .sobject('Sales_Listing__c')
                .find({ WasteTrade_Listing_Id__c: extId }, 'Id,Listing_Status__c')
                .execute();

            expect(records.length).to.equal(1);
            expect(records[0].Listing_Status__c).to.equal('Approved');
        });
    });

    // ─── Offers__c: Pending → Accepted ──────────────────────────────────────

    describe('Offers__c bid_status__c transition', () => {
        const listingExtId = testExtId('listing_for_offer_st');
        const offerExtId = testExtId('offer_st_001');
        let listingSfId: string;

        before('create parent Listing', async () => {
            listingSfId = await upsertRecord(connection, 'Sales_Listing__c', {
                Name: `${TEST_PREFIX} HDPE For Offer ST`,
                Sales_Listing_Name__c: `${TEST_PREFIX} HDPE For Offer ST`,
                WasteTrade_Listing_Id__c: listingExtId,
                Material_Type__c: 'HDPE',
                Material_Packing__c: 'Bales',
                Material_Weight__c: 10,
                Price_Per_Tonne__c: 250,
                CurrencyIsoCode: 'GBP',
                Listing_Status__c: 'Pending Approval',
                WasteTrade_Publication_Status__c: 'Draft',
                Last_Sync_Origin__c: `WT_${RUN_ID}`,
            }, 'WasteTrade_Listing_Id__c');
            cleanup['Sales_Listing__c'].push(listingSfId);
        });

        it('transitions bid_status__c from Pending to Accepted', async () => {
            const initial: Record<string, unknown> = {
                Name: `${TEST_PREFIX} Offer ST`,
                WasteTrade_Offer_Id__c: offerExtId,
                sales_listing__c: listingSfId,
                Offered_Price_Per_Unit__c: 230,
                Total_Price__c: 2300,
                Quantity__c: 10,
                Currency__c: 'GBP',
                bid_status__c: 'Pending',
                Last_Sync_Origin__c: `WT_${RUN_ID}`,
            };
            const sfId = await upsertRecord(connection, 'Offers__c', initial, 'WasteTrade_Offer_Id__c');
            cleanup['Offers__c'].push(sfId);

            await upsertRecord(connection, 'Offers__c', {
                ...initial,
                bid_status__c: 'Accepted',
            }, 'WasteTrade_Offer_Id__c');

            const records: any[] = await connection
                .sobject('Offers__c')
                .find({ WasteTrade_Offer_Id__c: offerExtId }, 'Id,bid_status__c')
                .execute();

            expect(records.length).to.equal(1);
            expect(records[0].bid_status__c).to.equal('Accepted');
        });
    });

    // ─── Haulage_Offers__c: Pending Approval → Approved ─────────────────────

    describe('Haulage_Offers__c haulier_listing_status__c transition', () => {
        const haulageExtId = testExtId('haulage_st_001');

        it('transitions haulier_listing_status__c from Pending Approval to Approved', async () => {
            const initial: Record<string, unknown> = {
                Name: `${TEST_PREFIX} Haulage ST`,
                WasteTrade_Haulage_Offers_ID__c: haulageExtId,
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
            const sfId = await upsertRecord(
                connection,
                'Haulage_Offers__c',
                initial,
                'WasteTrade_Haulage_Offers_ID__c',
            );
            cleanup['Haulage_Offers__c'].push(sfId);

            await upsertRecord(connection, 'Haulage_Offers__c', {
                ...initial,
                haulier_listing_status__c: 'Approved',
            }, 'WasteTrade_Haulage_Offers_ID__c');

            const records: any[] = await connection
                .sobject('Haulage_Offers__c')
                .find(
                    { WasteTrade_Haulage_Offers_ID__c: haulageExtId },
                    'Id,haulier_listing_status__c',
                )
                .execute();

            expect(records.length).to.equal(1);
            expect(records[0].haulier_listing_status__c).to.equal('Approved');
        });
    });
});
