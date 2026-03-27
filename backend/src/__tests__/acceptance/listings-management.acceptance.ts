import { Client, expect } from '@loopback/testlab';
import { WasteTradeApplication } from '../..';
import { setupApplication, loginOrSkip, TEST_USERS } from './test-helper';

describe('Listings Management API (acceptance)', () => {
    let app: WasteTradeApplication;
    let client: Client;
    let sellerToken: string;

    before('setupApplication', async function () {
        this.timeout(10000);
        ({ app, client } = await setupApplication());
        sellerToken = await loginOrSkip(client, TEST_USERS.seller.email, TEST_USERS.seller.password, this);
    });

    after(async () => {
        if (app) await app.stop();
    });

    describe('POST /listings', () => {
        it('creates sell listing with materialWeight + weightUnit', async () => {
            // Happy path: Create listing using kg weight
            const payload = {
                companyId: 28,
                materialType: 'plastic',
                materialItem: 'bopp',
                country: 'United Kingdom',
                listingType: 'sell',
                title: 'BOPP Plastic Bales',
                materialWeight: 12000,
                weightUnit: 'kg',
                numberOfLoads: 6,
                currency: 'usd',
                pricePerMetricTonne: 500,
                startDate: '2025-11-04T17:00:00.000Z',
                documents: [
                    {
                        documentType: 'feature_image',
                        documentUrl: 'https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/image.jpg',
                    },
                ],
            };

            const res = await client
                .post('/listings')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send(payload)
                .expect(201);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data.listing).to.have.property('id');
            expect(res.body.data.listing).to.have.property('totalWeight', 12);
            expect(res.body.data.listing).to.have.property('weightPerLoad');
        });

        it('creates wanted listing with required fields', async () => {
            // Happy path: Create wanted listing
            const payload = {
                companyId: 28,
                materialType: 'plastic',
                country: 'United Kingdom',
                listingType: 'wanted',
                title: 'Looking for PET bottles',
                materialWeight: 15000,
                weightUnit: 'kg',
                numberOfLoads: 5,
                currency: 'gbp',
                pricePerMetricTonne: 400,
                startDate: '2025-11-04T17:00:00.000Z',
                capacityPerMonth: 100,
                materialFlowIndex: 'high',
                materialWeightWanted: 15,
                documents: [
                    {
                        documentType: 'feature_image',
                        documentUrl: 'https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/image.jpg',
                    },
                ],
            };

            const res = await client
                .post('/listings')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send(payload)
                .expect(201);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data.listing).to.have.property('listingType', 'wanted');
        });
    });

    describe.skip('PATCH /listings/:id', () => {
        it('updates listing successfully', async () => {
            // Happy path: Update listing fields
            const payload = {
                quantity: 8,
                numberOfLoads: 4,
                pricePerMetricTonne: 550,
                incoterms: 'CIF',
            };

            const res = await client
                .patch('/listings/123')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send(payload)
                .expect(200);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data.listing).to.have.property('pricePerMetricTonne', 550);
        });
    });

    describe.skip('PATCH /listings/:id/renew', () => {
        it('renews listing for 2 weeks', async () => {
            // Happy path: Renew listing
            const payload = {
                renewalPeriod: '2_weeks',
            };

            const res = await client
                .patch('/listings/123/renew')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send(payload)
                .expect(200);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data).to.have.property('newEndDate');
        });
    });

    describe.skip('PATCH /listings/:id/mark-sold', () => {
        it('marks listing as sold', async () => {
            // Happy path: Mark listing as sold/fulfilled
            const res = await client
                .patch('/listings/123/mark-sold')
                .set('Authorization', `Bearer ${sellerToken}`)
                .expect(200);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data.listing).to.have.property('status', 'sold');
        });
    });

    describe.skip('DELETE /listings/:id', () => {
        it('removes listing successfully', async () => {
            // Happy path: Delete listing
            await client
                .delete('/listings/123')
                .set('Authorization', `Bearer ${sellerToken}`)
                .expect(204);
        });
    });
});
