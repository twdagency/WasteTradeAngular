import { Client, expect } from '@loopback/testlab';
import { WasteTradeApplication } from '../..';
import { setupApplication, loginOrSkip, TEST_USERS } from './test-helper';

describe('Offers API (acceptance)', () => {
    let app: WasteTradeApplication;
    let client: Client;
    let buyerToken: string;
    let sellerToken: string;

    before('setupApplication', async function () {
        this.timeout(10000);
        ({ app, client } = await setupApplication());
        buyerToken = await loginOrSkip(client, TEST_USERS.buyer.email, TEST_USERS.buyer.password, this);
        sellerToken = await loginOrSkip(client, TEST_USERS.seller.email, TEST_USERS.seller.password, this);
    });

    after(async () => {
        if (app) await app.stop();
    });

    describe('POST /offers', () => {
        it('creates offer on listing', async () => {
            // Happy path: Buyer creates offer
            const payload = {
                listingId: 1,
                quantity: 10,
                offeredPricePerUnit: 520,
                currency: 'gbp',
                message: 'Urgent requirement, can collect immediately',
                incoterms: 'EXW',
                earliestDeliveryDate: '2024-12-15',
                latestDeliveryDate: '2024-12-25',
                needsTransport: false,
            };

            const res = await client
                .post('/offers')
                .set('Authorization', `Bearer ${buyerToken}`)
                .send(payload)
                .expect(201);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data).to.have.property('id');
            expect(res.body.data).to.have.property('status', 'pending');
        });
    });

    describe('GET /offers', () => {
        it('retrieves user offers', async () => {
            // Happy path: User views their offers
            const filter = encodeURIComponent(
                JSON.stringify({
                    skip: 0,
                    limit: 20,
                }),
            );

            const res = await client
                .get(`/offers?filter=${filter}`)
                .set('Authorization', `Bearer ${buyerToken}`)
                .expect(200);

            expect(res.body).to.have.property('results');
            expect(res.body).to.have.property('totalCount');
            expect(res.body.results).to.be.Array();
        });
    });

    describe('PATCH /offers/:id/accept', () => {
        it('seller accepts offer', async () => {
            // Happy path: Seller accepts buyer offer
            const res = await client
                .patch('/offers/1/accept')
                .set('Authorization', `Bearer ${sellerToken}`)
                .expect(200);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data).to.have.property('status', 'accepted');
        });
    });
});
