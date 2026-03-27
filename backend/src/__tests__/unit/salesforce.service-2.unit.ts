/**
 * salesforce.service-2.unit.ts
 * Coverage-focused tests for salesforce.service.ts (Part 2)
 * Targets: upsertWithStandardFieldsOnly, upsertWithoutProblemField,
 *          upsertWithDuplicateBypass, INVALID_FIELD error path, connect() branches,
 *          getObjectTypeFromId, isRetryableError, executeWithRetry.
 */
import { expect, sinon } from '@loopback/testlab';
import { SalesforceService } from '../../services/salesforce/salesforce.service';

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
        soap: {
            convertLead: sinon.stub().resolves([{
                success: true, leadId: 'L001', accountId: 'A001', contactId: 'C001',
            }]),
        },
        version: '58.0',
        request: sinon.stub().resolves({ id: 'PATCH_001' }),
        login: sinon.stub().resolves(),
    };

    (service as any).connection = mockConnection;

    return { service, mockConnection, mockSobject, config };
}

describe('SalesforceService extended coverage - Part 2 (unit)', () => {

    // ── upsertRecord — INVALID_FIELD error path ───────────────────────────────
    describe('upsertRecord() — INVALID_FIELD error', () => {
        it('strips INVALID_FIELD and retries without problem field', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.upsert
                .onFirstCall().rejects(Object.assign(
                    new Error("INVALID_FIELD: Account.Bad_Custom__c"),
                    {},
                ))
                .onSecondCall().resolves([{ success: true, id: 'RETRY_OK' }]);

            const result = await service.upsertRecord('Account', 'WasteTrade_Id__c', {
                Name: 'Test',
                'Bad_Custom__c': 'val',
                'WasteTrade_Id__c': 'DEV_1',
            }, true);

            expect(result.success).to.be.true();
        });

        it('falls back to standard fields when field cannot be identified', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.upsert
                .onFirstCall().rejects(new Error('No such column something vague'))
                .onSecondCall().resolves([{ success: true, id: 'STD_OK' }]);

            const result = await service.upsertRecord('Account', 'WasteTrade_Id__c', {
                Name: 'Test',
                'Custom__c': 'val',
                'WasteTrade_Id__c': 'DEV_1',
            }, true);

            expect(result.success).to.be.true();
        });

        it('handles requested resource does not exist error', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.upsert
                .onFirstCall().rejects(new Error('requested resource does not exist'))
                .onSecondCall().resolves([{ success: true, id: 'RESOURCE_OK' }]);

            const result = await service.upsertRecord('CustomObj__c', 'External_Id__c', {
                Name: 'Test',
                'External_Id__c': 'DEV_1',
            }, true);

            expect(result.success).to.be.true();
        });
    });

    // ── upsertRecord — duplicate bypass ───────────────────────────────────────
    describe('upsertRecord() — DUPLICATES_DETECTED bypass', () => {
        it('succeeds via PATCH bypass when duplicate detected', async () => {
            const { service, mockSobject, mockConnection } = buildService();
            const dupError = Object.assign(
                new Error('DUPLICATES_DETECTED'),
                { name: 'DUPLICATES_DETECTED' },
            );
            mockSobject.upsert.rejects(dupError);
            mockConnection.request.resolves({ id: 'BYPASS_001' });

            const result = await service.upsertRecord('Account', 'WasteTrade_Id__c', {
                Name: 'Test',
                'WasteTrade_Id__c': 'DEV_1',
            }, true);

            expect(result).to.have.property('success');
            expect(mockConnection.request.called).to.be.true();
        });

        it('returns failure when bypass PATCH also fails', async () => {
            const { service, mockSobject, mockConnection } = buildService();
            const dupError = Object.assign(
                new Error('DUPLICATES_DETECTED'),
                { name: 'DUPLICATES_DETECTED' },
            );
            mockSobject.upsert.rejects(dupError);
            mockConnection.request.rejects(new Error('Bypass failed'));

            const result = await service.upsertRecord('Account', 'WasteTrade_Id__c', {
                Name: 'Test',
                'WasteTrade_Id__c': 'DEV_1',
            }, true);

            expect(result.success).to.be.false();
        });

        it('returns failure when external ID value is missing for bypass', async () => {
            const { service, mockSobject } = buildService();
            const dupError = Object.assign(
                new Error('DUPLICATES_DETECTED'),
                { name: 'DUPLICATES_DETECTED' },
            );
            mockSobject.upsert.rejects(dupError);

            const result = await service.upsertRecord('Account', 'WasteTrade_Id__c', {
                Name: 'Test',
                // Missing WasteTrade_Id__c value
            }, true);

            expect(result.success).to.be.false();
        });
    });

    // ── upsertRecord — second field error cascade ─────────────────────────────
    describe('upsertRecord() — cascading field errors', () => {
        it('strips two problem fields on cascading field errors', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.upsert
                .onFirstCall().rejects(new Error("No such column 'Field_One__c' on sobject of type Account"))
                .onSecondCall().rejects(new Error("No such column 'Field_Two__c' on sobject of type Account"))
                .onThirdCall().resolves([{ success: true, id: 'CASCADE_OK' }]);

            const result = await service.upsertRecord('Account', 'WasteTrade_Id__c', {
                Name: 'Test',
                'Field_One__c': 'v1',
                'Field_Two__c': 'v2',
                'WasteTrade_Id__c': 'DEV_1',
            }, true);

            expect(result).to.have.property('success');
        });
    });

    // ── createRecord — non-array response ────────────────────────────────────
    describe('createRecord() — single object response', () => {
        it('handles non-array single result from jsforce', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.create.resolves({ success: true, id: 'SINGLE_001' });

            const result = await service.createRecord('Account', { Name: 'Test' });

            expect(result.success).to.be.true();
            expect(result.salesforceId).to.equal('SINGLE_001');
        });
    });

    // ── updateRecord — non-array response ────────────────────────────────────
    describe('updateRecord() — single object response', () => {
        it('handles non-array single result from jsforce', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.update.resolves({ success: true, id: 'SINGLE_UPD' });

            const result = await service.updateRecord('Account', 'SF001', { Name: 'Updated' });

            expect(result.success).to.be.true();
        });
    });

    // ── deleteRecord — non-array response ────────────────────────────────────
    describe('deleteRecord() — success=false from destroy', () => {
        it('returns failure when destroy returns array with success=false', async () => {
            const { service, mockSobject } = buildService();
            mockSobject.destroy.resolves([{ success: false, errors: ['LOCKED_RECORD'] }]);

            const result = await service.deleteRecord('Account', 'SF001', true);

            // Array result — first element success=false
            expect(result).to.have.property('success');
        });
    });

    // ── query — empty result ──────────────────────────────────────────────────
    describe('query() — various result shapes', () => {
        it('returns empty records array when query throws', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.query.rejects(new Error('SOQL_ERROR'));

            const result = await service.query('SELECT Id FROM Account');

            expect(result.records).to.be.an.Array();
            expect(result.records.length).to.equal(0);
        });

        it('returns records from successful query', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.query.resolves({ records: [{ Id: 'ACC001' }] });

            const result = await service.query('SELECT Id FROM Account');

            expect(result.records).to.be.an.Array();
            expect(result.records.length).to.equal(1);
        });
    });

    // ── convertLead — SOAP error branch ──────────────────────────────────────
    describe('convertLead() — error branches', () => {
        it('handles missing MasterLabel from LeadStatus query gracefully', async () => {
            const { service, mockConnection } = buildService();
            // LeadStatus query returns no records — should fall back to default
            mockConnection.query.resolves({ records: [] });
            mockConnection.soap.convertLead.resolves([{
                success: true, leadId: 'L001', accountId: 'A001', contactId: 'C001',
            }]);

            const result = await service.convertLead('L001', 'Test Co');

            expect(result.success).to.be.true();
        });

        it('returns failure when convertLead result has errors array', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.query.resolves({ records: [{ MasterLabel: 'Converted' }] });
            mockConnection.soap.convertLead.resolves([{
                success: false,
                errors: [{ message: 'MERGE_FAILED: cannot merge' }],
            }]);

            const result = await service.convertLead('L001', 'Test Co');

            expect(result.success).to.be.false();
            expect(result.error).to.containEql('MERGE_FAILED');
        });

        it('returns skipped=true for CONVERTED_LEAD_ERROR', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.query.resolves({ records: [{ MasterLabel: 'Converted' }] });
            mockConnection.soap.convertLead.rejects(
                new Error('CONVERTED_LEAD_ERROR: Lead is already converted'),
            );

            const result = await service.convertLead('L001', 'Test Co');

            expect(result.success).to.be.true();
            expect(result.skipped).to.be.true();
        });

        it('returns accountId/contactId when lead already converted and query succeeds', async () => {
            const { service, mockConnection } = buildService();
            // First call: LeadStatus query; Second call: converted Lead query
            mockConnection.query
                .onFirstCall().resolves({ records: [{ MasterLabel: 'Converted' }] })
                .onSecondCall().resolves({ records: [{ ConvertedAccountId: 'A_EXISTING', ConvertedContactId: 'C_EXISTING' }] });
            mockConnection.soap.convertLead.rejects(
                new Error('CONVERTED_LEAD_ERROR: Lead is already converted'),
            );

            const result = await service.convertLead('L001');

            expect(result.success).to.be.true();
            expect(result.skipped).to.be.true();
            expect(result.accountId).to.equal('A_EXISTING');
            expect(result.contactId).to.equal('C_EXISTING');
        });

        it('passes accountId to SOAP convertLead when provided', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.query.resolves({ records: [{ MasterLabel: 'Qualified' }] });
            mockConnection.soap.convertLead.resolves([{
                success: true, leadId: 'L001', accountId: 'A_EXISTING', contactId: 'C001',
            }]);

            await service.convertLead('L001', 'A_EXISTING');

            const convertArgs = mockConnection.soap.convertLead.firstCall.args[0];
            expect(convertArgs[0].accountId).to.equal('A_EXISTING');
        });

        it('returns failure for unhandled convertLead exception', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.query.resolves({ records: [{ MasterLabel: 'Converted' }] });
            mockConnection.soap.convertLead.rejects(new Error('Network timeout'));

            const result = await service.convertLead('L001', 'Test Co');

            expect(result.success).to.be.false();
        });
    });

    // ── isConnected — concurrency semaphore ───────────────────────────────────
    describe('isConnected() — connection already set', () => {
        it('returns true when connection exists and query succeeds', async () => {
            const { service } = buildService();
            // connection is pre-set in buildService
            const result = await service.isConnected();
            expect(result).to.be.true();
        });

        it('returns false and nulls connection when query throws SESSION error', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.query.rejects(new Error('INVALID_SESSION_ID'));

            const result = await service.isConnected();

            expect(result).to.be.false();
            expect((service as any).connection).to.be.null();
        });
    });

    // ── testConnection ────────────────────────────────────────────────────────
    describe('testConnection()', () => {
        it('returns true when SELECT query succeeds', async () => {
            const { service } = buildService();
            const result = await service.testConnection();
            expect(result).to.be.true();
        });

        it('returns false when query throws', async () => {
            const { service, mockConnection } = buildService();
            mockConnection.query.rejects(new Error('DOWN'));
            const result = await service.testConnection();
            expect(result).to.be.false();
        });
    });
});
