import { Client, expect } from '@loopback/testlab';
import { WasteTradeApplication } from '../..';
import { setupApplication, loginOrSkip, TEST_USERS } from './test-helper';

describe('Admin Listings API (acceptance)', () => {
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

    describe('GET /listings/sell', () => {
        it('returns paginated sell listings', async () => {
            // Happy path: Admin views all sell listings
            const filter = encodeURIComponent(
                JSON.stringify({
                    skip: 0,
                    limit: 20,
                }),
            );

            const res = await client
                .get(`/listings/sell?filter=${filter}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('results');
            expect(res.body).to.have.property('totalCount');
            expect(res.body.results).to.be.Array();
        });

        it('filters sell listings by search and material type', async () => {
            // Happy path: Admin searches listings with filters
            const filter = encodeURIComponent(
                JSON.stringify({
                    skip: 0,
                    limit: 20,
                    where: {
                        searchTerm: 'uk plastic bale',
                        materialType: ['plastic'],
                        company: 'Seller Corp',
                        country: 'UK',
                        status: 'available',
                        state: 'approved',
                        sortBy: 'createdAtDesc',
                    },
                }),
            );

            const res = await client
                .get(`/listings/sell?filter=${filter}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('results');
            expect(res.body.results).to.be.Array();
        });
    });

    describe('GET /listings/wanted', () => {
        it('returns paginated wanted listings', async () => {
            // Happy path: Admin views all wanted listings
            const filter = encodeURIComponent(
                JSON.stringify({
                    skip: 0,
                    limit: 20,
                }),
            );

            const res = await client
                .get(`/listings/wanted?filter=${filter}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('results');
            expect(res.body).to.have.property('totalCount');
            expect(res.body.results).to.be.Array();
        });

        it('filters wanted listings by search and material type', async () => {
            // Happy path: Admin searches wanted listings with filters
            const filter = encodeURIComponent(
                JSON.stringify({
                    skip: 0,
                    limit: 20,
                    where: {
                        searchTerm: 'de aluminum flake',
                        materialType: ['metal'],
                        company: 'Buyer Corp',
                        country: 'Germany',
                        wantedStatus: 'Material Required',
                        state: 'approved',
                    },
                }),
            );

            const res = await client
                .get(`/listings/wanted?filter=${filter}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('results');
            expect(res.body.results).to.be.Array();
        });
    });
});
