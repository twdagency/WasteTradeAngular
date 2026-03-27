import { Client, expect } from '@loopback/testlab';
import { WasteTradeApplication } from '../..';
import { setupApplication, loginOrSkip, TEST_USERS } from './test-helper';

describe('Haulage Bid Actions API (acceptance)', () => {
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

    describe('POST /haulage-offers/:id/actions', () => {
        it('approves haulage bid', async () => {
            // Happy path: Admin approves bid
            const payload = {
                action: 'approve',
            };

            const res = await client
                .post('/haulage-offers/1/actions')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(payload)
                .expect(200);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data).to.have.property('status', 'approved');
        });

        it('rejects haulage bid with reason', async () => {
            // Happy path: Admin rejects bid
            const payload = {
                action: 'reject',
                rejectionReason: 'price_too_high',
            };

            const res = await client
                .post('/haulage-offers/2/actions')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(payload)
                .expect(200);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data).to.have.property('status', 'rejected');
        });
    });
});
