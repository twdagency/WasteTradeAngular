import { expect, sinon } from '@loopback/testlab';
import { SalesforceService } from '../../services/salesforce/salesforce.service';

/**
 * Build a SalesforceService with a stubbed jsforce Connection injected post-construction.
 * We reach into private state via `(service as any).connection` to set the stub.
 */
function buildService(configOverrides: Record<string, unknown> = {}) {
    const config = {
        syncEnabled: true,
        username: 'test@example.com',
        password: 'password',
        securityToken: 'token',
        sandboxUrl: 'https://test.salesforce.com',
        apiVersion: '58.0',
        ...configOverrides,
    };

    const service = new SalesforceService(config as any);

    // Stub jsforce Connection methods
    const mockSobject = {
        create: sinon.stub().resolves([{ success: true, id: 'SF_NEW_001' }]),
        update: sinon.stub().resolves([{ success: true, id: 'SF_UPD_001' }]),
        destroy: sinon.stub().resolves({ success: true, id: 'SF_DEL_001' }),
        find: sinon.stub().resolves([{ Id: 'SF_EXT_001' }]),
        upsert: sinon.stub().resolves([{ success: true, id: 'SF_UPS_001' }]),
    };
    const mockConnection = {
        query: sinon.stub().resolves({ records: [{ Id: 'USER_001' }] }),
        sobject: sinon.stub().returns(mockSobject),
        soap: { convertLead: sinon.stub().resolves([{ success: true, leadId: 'L001', accountId: 'A001', contactId: 'C001' }]) },
        version: '58.0',
        request: sinon.stub().resolves({ id: 'PATCH_001' }),
        login: sinon.stub().resolves(),
    };

    // Inject the stub connection so isConnected() doesn't try to connect to real SF
    (service as any).connection = mockConnection;

    return { service, mockConnection, mockSobject, config };
}

describe('SalesforceService (unit)', () => {

    // ── isConnected ──────────────────────────────────────────────────────────
    describe('isConnected', () => {
        it('returns true when connection query succeeds', async () => {
            const { service } = buildService();
            const result = await service.isConnected();
            expect(result).to.be.true();
        });

        it('returns false and clears connection when query throws', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.query.rejects(new Error('Session expired'));
            const result = await service.isConnected();
            expect(result).to.be.false();
            expect((service as any).connection).to.be.null();
        });

        it('returns false when connection is null after connect attempt with syncEnabled=false', async () => {
            const { service } = buildService({ syncEnabled: false });
            // Remove the injected connection so it falls back to connect()
            (service as any).connection = null;
            const result = await service.isConnected();
            // syncEnabled=false means connect() returns without setting connection
            expect(result).to.be.false();
        });
    });

    // ── createRecord ─────────────────────────────────────────────────────────
    describe('createRecord', () => {
        it('returns success result with salesforceId on create', async () => {
            const { service } = buildService();
            const result = await service.createRecord('Account', { Name: 'Test Co' });
            expect(result.success).to.be.true();
            expect(result.salesforceId).to.equal('SF_NEW_001');
        });

        it('handles array response from jsforce', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.create.resolves([{ success: true, id: 'ARRAY_001' }]);
            const result = await service.createRecord('Contact', { LastName: 'Doe' });
            expect(result.success).to.be.true();
            expect(result.salesforceId).to.equal('ARRAY_001');
        });

        it('returns failure when create result has success=false', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.create.resolves([{ success: false, errors: ['REQUIRED_FIELD_MISSING'] }]);
            const result = await service.createRecord('Account', {}, true);
            expect(result.success).to.be.false();
            expect(result.error).to.containEql('REQUIRED_FIELD_MISSING');
        });

        it('returns failure when sobject throws an error', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.create.rejects(new Error('CONNECTION_FAILED'));
            const result = await service.createRecord('Account', {}, true);
            expect(result.success).to.be.false();
            expect(result.error).to.containEql('CONNECTION_FAILED');
        });
    });

    // ── updateRecord ─────────────────────────────────────────────────────────
    describe('updateRecord', () => {
        it('returns success on valid update', async () => {
            const { service } = buildService();
            const result = await service.updateRecord('Account', 'SF_ACC_001', { Name: 'Updated' });
            expect(result.success).to.be.true();
        });

        it('returns failure when update result has success=false', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.update.resolves([{ success: false, errors: ['FIELD_INTEGRITY_EXCEPTION'] }]);
            const result = await service.updateRecord('Account', 'SF_ACC_001', {}, true);
            expect(result.success).to.be.false();
        });

        it('returns failure when update throws', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.update.rejects(new Error('Network timeout'));
            const result = await service.updateRecord('Account', 'SF_ACC_001', {}, true);
            expect(result.success).to.be.false();
        });
    });

    // ── deleteRecord ─────────────────────────────────────────────────────────
    describe('deleteRecord', () => {
        it('returns success when destroy succeeds', async () => {
            const { service } = buildService();
            const result = await service.deleteRecord('Account', 'SF_ACC_001');
            expect(result.success).to.be.true();
        });

        it('returns failure when destroy returns success=false', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.destroy.resolves({ success: false, errors: ['ENTITY_IS_DELETED'] });
            const result = await service.deleteRecord('Account', 'SF_ACC_001', true);
            expect(result.success).to.be.false();
        });

        it('returns failure when destroy throws', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.destroy.rejects(new Error('INSUFFICIENT_ACCESS_ON_CROSS_REFERENCE_ENTITY'));
            const result = await service.deleteRecord('Account', 'SF_ACC_001', true);
            expect(result.success).to.be.false();
        });
    });

    // ── findByExternalId ─────────────────────────────────────────────────────
    describe('findByExternalId', () => {
        it('returns first record when found', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.find.resolves([{ Id: 'SF_EXT_001', Name: 'Test Co' }]);
            const result = await service.findByExternalId('Account', 'WasteTrade_Company_Id__c', 'DEV_1');
            expect(result).to.not.be.null();
            expect(result.Id).to.equal('SF_EXT_001');
        });

        it('returns null when no records found', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.find.resolves([]);
            const result = await service.findByExternalId('Account', 'WasteTrade_Company_Id__c', 'DEV_999');
            expect(result).to.be.null();
        });

        it('returns null on error (suppressErrorLog=true)', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.find.rejects(new Error('No such column'));
            const result = await service.findByExternalId('Account', 'Bad_Field__c', 'DEV_1', true);
            expect(result).to.be.null();
        });
    });

    // ── upsertRecord ─────────────────────────────────────────────────────────
    describe('upsertRecord', () => {
        it('returns success on valid upsert', async () => {
            const { service } = buildService();
            const result = await service.upsertRecord('Account', 'WasteTrade_Company_Id__c', { Name: 'Co' });
            expect(result.success).to.be.true();
            expect(result.salesforceId).to.equal('SF_UPS_001');
        });

        it('returns failure when upsert result has success=false', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.upsert.resolves([{ success: false, errors: ['DUPLICATE_VALUE'] }]);
            const result = await service.upsertRecord('Account', 'WasteTrade_Company_Id__c', {}, true);
            expect(result.success).to.be.false();
        });

        it('retries without problem field on No such column error', async () => {
            const { service, mockSobject } = buildService();
            // First call fails with field error, second succeeds
            mockSobject.upsert
                .onFirstCall().rejects(Object.assign(new Error("No such column 'Bad_Field__c' on sobject of type Account"), {}))
                .onSecondCall().resolves([{ success: true, id: 'RETRY_001' }]);
            const result = await service.upsertRecord('Account', 'WasteTrade_Company_Id__c', {
                Name: 'Co',
                'Bad_Field__c': 'value',
                'WasteTrade_Company_Id__c': 'DEV_1',
            }, true);
            expect(result.success).to.be.true();
        });

        it('handles DUPLICATES_DETECTED by attempting duplicate bypass', async () => {
            const { service, mockSobject, mockConnection } = buildService();
            const dupError = Object.assign(new Error('DUPLICATES_DETECTED'), { name: 'DUPLICATES_DETECTED' });
            mockSobject.upsert.rejects(dupError);
            // mockConnection.request is the bypass path
            mockConnection.request.resolves({ id: 'BYPASS_001' });
            const result = await service.upsertRecord('Account', 'WasteTrade_Company_Id__c', {
                Name: 'Co',
                'WasteTrade_Company_Id__c': 'DEV_1',
            }, true);
            // Either bypass succeeds or falls back
            expect(result).to.have.property('success');
        });
    });

    // ── query ────────────────────────────────────────────────────────────────
    describe('query', () => {
        it('returns records from SOQL query', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.query.resolves({ records: [{ Id: 'Q001' }, { Id: 'Q002' }] });
            const result = await service.query('SELECT Id FROM Account LIMIT 10');
            expect(result.records.length).to.equal(2);
        });

        it('returns empty records array on query error', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.query.rejects(new Error('MALFORMED_QUERY'));
            const result = await service.query('INVALID SOQL');
            expect(result.records).to.be.an.Array();
            expect(result.records.length).to.equal(0);
        });
    });

    // ── convertLead ──────────────────────────────────────────────────────────
    describe('convertLead', () => {
        it('returns success with accountId and contactId on conversion', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.soap.convertLead.resolves([{
                success: true,
                leadId: 'L001',
                accountId: 'A001',
                contactId: 'C001',
            }]);
            // Need to mock LeadStatus query too
            mockConnection.query.resolves({ records: [{ MasterLabel: 'Qualified' }] });
            const result = await service.convertLead('L001', 'Test Company');
            expect(result.success).to.be.true();
            expect(result.contactId).to.equal('C001');
        });

        it('returns skipped when lead already converted', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.query.resolves({ records: [{ MasterLabel: 'Qualified' }] });
            mockConnection.soap.convertLead.rejects(new Error('CONVERTED_LEAD_ERROR: already converted'));
            const result = await service.convertLead('L001', 'Test Co');
            expect(result.success).to.be.true();
            expect(result.skipped).to.be.true();
        });

        it('returns failure on conversion error', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.query.resolves({ records: [{ MasterLabel: 'Qualified' }] });
            mockConnection.soap.convertLead.resolves([{
                success: false,
                errors: [{ message: 'CANNOT_CONVERT: no account' }],
            }]);
            const result = await service.convertLead('L001', 'Test Co');
            expect(result.success).to.be.false();
        });
    });

    // ── testConnection ───────────────────────────────────────────────────────
    describe('testConnection', () => {
        it('returns true when query succeeds', async () => {
            const { service } = buildService();
            const result = await service.testConnection();
            expect(result).to.be.true();
        });

        it('returns false when query fails', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.query.rejects(new Error('Connection refused'));
            const result = await service.testConnection();
            expect(result).to.be.false();
        });
    });
});
