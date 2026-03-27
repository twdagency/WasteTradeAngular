import { Client, expect } from '@loopback/testlab';
import { WasteTradeApplication } from '../..';
import { setupApplication, loginOrSkip, TEST_USERS } from './test-helper';

describe('Admin Haulage Bids API (acceptance)', () => {
    let app: WasteTradeApplication;
    let client: Client;
    let adminToken: string;

    before('setupApplication', async function () {
        this.timeout(10000);
        ({ app, client } = await setupApplication());
        adminToken = await loginOrSkip(client, TEST_USERS.superAdmin.email, TEST_USERS.superAdmin.password, this);
    });

    after(async () => {
        if (app) await app.stop();
    });

    describe('GET /admin/haulage-bids', () => {
        it('returns paginated haulage bids list', async () => {
            // Happy path: Admin views all haulage bids
            const filter = encodeURIComponent(
                JSON.stringify({
                    skip: 0,
                    limit: 20,
                }),
            );

            const res = await client
                .get(`/admin/haulage-bids?filter=${filter}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('results');
            expect(res.body).to.have.property('totalCount');
            expect(res.body.results).to.be.Array();
        });

        it('filters haulage bids by status and material', async () => {
            // Happy path: Admin filters by status, material type, and date range
            const filter = encodeURIComponent(
                JSON.stringify({
                    skip: 0,
                    limit: 20,
                    status: 'pending',
                    state: 'approved',
                    materialType: 'Plastic',
                    textSearch: 'uk buyer',
                    dateFrom: '2025-01-01',
                    dateTo: '2025-01-31',
                }),
            );

            const res = await client
                .get(`/admin/haulage-bids?filter=${filter}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('results');
            expect(res.body.results).to.be.Array();
        });
    });

    describe('GET /admin/hauliers', () => {
        it('returns list of hauliers for dropdown', async () => {
            // Happy path: Admin gets hauliers list for creating offer
            const filter = encodeURIComponent(
                JSON.stringify({
                    skip: 0,
                    limit: 20,
                }),
            );

            const res = await client
                .get(`/admin/hauliers?filter=${filter}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.be.Array();
        });
    });

    describe('POST /admin/haulage-offers', () => {
        it('creates haulage offer on behalf of haulier', async () => {
            // Happy path: Admin creates haulage offer for a haulier
            const payload = {
                offerId: 1,
                haulierCompanyId: 10,
                haulierUserId: 55,
                trailerContainerType: '40ft container',
                completingCustomsClearance: false,
                haulageCostPerLoad: 1200,
                quantityPerLoad: 24,
                currency: 'GBP',
                transportProvider: 'road',
                suggestedCollectionDate: '2025-02-10T00:00:00.000Z',
                expectedTransitTime: '3_5_days',
                demurrageAtDestination: 21,
                notes: 'Internal note for admin-only',
            };

            const res = await client
                .post('/admin/haulage-offers')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(payload)
                .expect(201);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data).to.have.property('id');
            expect(res.body.data).to.have.property('haulierUserId', 55);
            expect(res.body.data).to.have.property('haulierCompanyId', 10);
        });
    });
});
