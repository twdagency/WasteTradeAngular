import { Client, expect } from '@loopback/testlab';
import { WasteTradeApplication } from '../..';
import { setupApplication, loginOrSkip, TEST_USERS } from './test-helper';

describe('Haulier Profile API (acceptance)', () => {
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

    describe('GET /haulier/profile', () => {
        it('retrieves haulier profile', async () => {
            // Happy path: Get haulier profile
            const res = await client
                .get('/haulier/profile')
                .set('Authorization', `Bearer ${haulierToken}`)
                .expect(200);

            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('accountId');
            expect(res.body.data).to.have.property('companyName');
            expect(res.body.data).to.have.property('fleetType');
            expect(res.body.data).to.have.property('containerTypes');
        });
    });

    describe('PATCH /haulier/profile', () => {
        it('updates haulier profile', async () => {
            // Happy path: Update profile fields
            const payload = {
                jobTitle: 'Senior Transport Manager',
                companyMobileNumber: '+447987654321',
                containerTypes: ['curtain_sider', 'containers', 'walking_floor'],
            };

            const res = await client
                .patch('/haulier/profile')
                .set('Authorization', `Bearer ${haulierToken}`)
                .send(payload)
                .expect(200);

            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('message', 'Profile updated successfully');
        });

        it('updates waste carrier license', async () => {
            // Happy path: Update license documents
            const payload = {
                wasteCarrierLicense: [
                    {
                        fileName: 'waste_carrier_license_2024.pdf',
                        documentUrl:
                            'https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/uploads/license.pdf',
                        expiryDate: '2027-12-31T00:00:00.000Z',
                    },
                ],
            };

            const res = await client
                .patch('/haulier/profile')
                .set('Authorization', `Bearer ${haulierToken}`)
                .send(payload)
                .expect(200);

            expect(res.body).to.have.property('success', true);
        });
    });
});
