import { Client, expect } from '@loopback/testlab';
import { WasteTradeApplication } from '../..';
import { setupApplication, loginOrSkip, TEST_USERS } from './test-helper';
import { CompanyUserStatusEnum } from '../../enum/company-users.enum';

describe('Admin Offers API (acceptance)', () => {
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

    describe('GET /offers/admin', () => {
        it('returns paginated offers list', async () => {
            // Happy path: Admin views all offers
            const filter = encodeURIComponent(
                JSON.stringify({
                    skip: 0,
                    limit: 20,
                }),
            );

            const res = await client
                .get(`/offers/admin?filter=${filter}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('results');
            expect(res.body).to.have.property('totalCount');
            expect(res.body.results).to.be.Array();
        });

        it('filters offers by search term', async () => {
            // Happy path: Admin searches offers by material/buyer/seller
            const filter = encodeURIComponent(
                JSON.stringify({
                    skip: 0,
                    limit: 20,
                    where: {
                        searchTerm: 'plastic',
                        status: CompanyUserStatusEnum.ACTIVE,
                    },
                }),
            );

            const res = await client
                .get(`/offers/admin?filter=${filter}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('results');
            expect(res.body.results).to.be.Array();
        });
    });

    describe('GET /offers/:id', () => {
        it('returns offer details with locations', async () => {
            // Happy path: Admin views offer details
            // Note: Use actual offer ID from test data
            const res = await client
                .get('/offers/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data).to.have.property('offer');
            expect(res.body.data).to.have.property('buyer');
            expect(res.body.data).to.have.property('seller');
            expect(res.body.data).to.have.property('listing');
        });
    });
});
