import { Client, expect } from '@loopback/testlab';
import { WasteTradeApplication } from '../..';
import { setupApplication, loginOrSkip, TEST_USERS } from './test-helper';

describe('Haulage Offers API (acceptance)', () => {
    let app: WasteTradeApplication;
    let client: Client;
    let haulierToken: string;

    before('setupApplication', async function () {
        this.timeout(10000);
        ({ app, client } = await setupApplication());
        haulierToken = await loginOrSkip(client, TEST_USERS.haulier.email, TEST_USERS.haulier.password, this);
    });

    after(async () => {
        if (app) await app.stop();
    });

    describe('GET /haulage-offers/company-hauliers', () => {
        it('returns approved hauliers in company', async () => {
            // Happy path: Get list of approved hauliers for dropdown
            const res = await client
                .get('/haulage-offers/company-hauliers')
                .set('Authorization', `Bearer ${haulierToken}`)
                .expect(200);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.be.Array();
        });

        it('filters hauliers by search term', async () => {
            // Happy path: Search hauliers by name/email
            const res = await client
                .get('/haulage-offers/company-hauliers?search=john')
                .set('Authorization', `Bearer ${haulierToken}`)
                .expect(200);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data).to.be.Array();
        });
    });

    describe('POST /haulage-offers', () => {
        it('creates haulage offer for self', async () => {
            // Happy path: Haulier creates bid for themselves
            // Note: Use actual offer ID from test data
            const payload = {
                offerId: 1,
                trailerContainerType: 'curtain_slider_standard',
                completingCustomsClearance: true,
                haulageCostPerLoad: 8,
                currency: 'usd',
                transportProvider: 'mixed',
                suggestedCollectionDate: '2025-12-30T17:00:00.000Z',
                expectedTransitTime: '4-5',
                demurrageAtDestination: 29,
            };

            const res = await client
                .post('/haulage-offers')
                .set('Authorization', `Bearer ${haulierToken}`)
                .send(payload)
                .expect(201);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data).to.have.property('id');
            expect(res.body.data).to.have.property('haulierUserId');
            expect(res.body.data).to.have.property('haulierCompanyId');
        });
    });
});
