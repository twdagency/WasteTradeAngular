import 'dotenv/config';
import { expect } from '@loopback/testlab';
import * as jsforce from 'jsforce';

const SF_ENABLED = process.env.SALESFORCE_SYNC_ENABLED === 'true';

(SF_ENABLED ? describe : describe.skip)('Salesforce Connection (integration)', function () {
    this.timeout(30000);

    let connection: jsforce.Connection;

    before(async () => {
        connection = new jsforce.Connection({
            loginUrl: process.env.SALESFORCE_SANDBOX_URL || 'https://test.salesforce.com',
            version: process.env.SALESFORCE_API_VERSION || '58.0',
        });
        const password =
            (process.env.SALESFORCE_PASSWORD ?? '') + (process.env.SALESFORCE_SECURITY_TOKEN ?? '');
        await connection.login(process.env.SALESFORCE_USERNAME!, password);
    });

    it('connects to Salesforce sandbox successfully', () => {
        expect(connection.accessToken).to.be.a.String();
        expect(connection.accessToken!.length).to.be.greaterThan(0);
    });

    it('can execute a simple SOQL query', async () => {
        const result = await connection.query('SELECT Id FROM User LIMIT 1');
        expect(result).to.have.property('totalSize');
        expect(result.records).to.be.an.Array();
        expect(result.records.length).to.be.greaterThanOrEqual(1);
    });

    it('reports correct API version', () => {
        const expectedVersion = process.env.SALESFORCE_API_VERSION || '58.0';
        expect(connection.version).to.equal(expectedVersion);
    });

    it('can describe the Account object', async () => {
        const desc = await connection.sobject('Account').describe();
        expect(desc).to.have.property('name', 'Account');
        expect(desc.fields).to.be.an.Array();
        expect(desc.fields.length).to.be.greaterThan(0);
    });

    it('sandbox URL matches configuration', () => {
        const loginUrl = process.env.SALESFORCE_SANDBOX_URL!.replace(/\/$/, '');
        expect(connection.instanceUrl).to.containEql('salesforce.com');
        expect(loginUrl).to.containEql('sandbox');
    });
});
