import { Client, expect } from '@loopback/testlab';
import { WasteTradeApplication } from '../..';
import { setupApplication, loginOrSkip, TEST_USERS } from './test-helper';

describe('Company Onboarding API (acceptance)', () => {
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

    describe('PATCH /companies/:id', () => {
        it('updates company information', async () => {
            // Happy path: Update company details
            const payload = {
                countryCode: 'GB',
                name: 'Waste Hauling Co',
                vatNumber: 'GB987654321',
                vatRegistrationCountry: 'UK',
                addressLine1: '123 Haulier St',
                city: 'London',
                country: 'United Kingdom',
                stateProvince: 'England',
                postalCode: 'AB1 2CD',
                companyType: 'Recycling',
                phoneNumber: '4554554',
                mobileNumber: '454554',
            };

            const res = await client
                .patch('/companies/2')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send(payload)
                .expect(200);

            expect(res.body).to.have.property('status', 'success');
        });
    });

    describe('POST /company-locations', () => {
        it('creates company location', async () => {
            // Happy path: Add site location
            const payload = {
                companyId: 2,
                locationName: 'Main Warehouse',
                firstName: 'John',
                lastName: 'Doe',
                positionInCompany: 'Manager',
                phoneNumber: '1234567890',
                addressLine: '123 Green St, Unit 1',
                street: 'Green Street',
                postcode: 'AB1 2CD',
                city: 'London',
                country: 'United Kingdom',
                stateProvince: 'England',
                officeOpenTime: '08:00:00',
                officeCloseTime: '17:00:00',
                loadingRamp: true,
                containerType: ['Curtain Sider', 'Container'],
                selfLoadUnloadCapability: true,
                accessRestrictions: 'N/A',
            };

            const res = await client
                .post('/company-locations')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send(payload)
                .expect(201);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data).to.have.property('id');
        });
    });

    describe('POST /company-documents', () => {
        it('uploads company document', async () => {
            // Happy path: Upload company document
            const payload = {
                companyId: 2,
                documentType: 'waste_carrier_license',
                documentName: 'license.pdf',
                documentUrl: 'https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/license.pdf',
                expiryDate: '2027-12-31',
            };

            const res = await client
                .post('/company-documents')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send(payload)
                .expect(201);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body.data).to.have.property('id');
        });
    });
});
