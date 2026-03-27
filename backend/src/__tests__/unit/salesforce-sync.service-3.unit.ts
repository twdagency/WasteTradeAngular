import { expect, sinon } from '@loopback/testlab';
import { SalesforceSyncService } from '../../services/salesforce/salesforce-sync.service';

function buildService() {
    const sfService = {
        isConnected: sinon.stub().resolves(true),
        upsertRecord: sinon.stub().resolves({ success: true, salesforceId: 'SF001' }),
        createRecord: sinon.stub().resolves({ success: true, salesforceId: 'SF_LOAD_001' }),
        findByExternalId: sinon.stub().resolves(null),
        query: sinon.stub().resolves({ records: [] }),
        deleteRecord: sinon.stub().resolves({ success: true }),
        updateRecord: sinon.stub().resolves({ success: true }),
        convertLead: sinon.stub().resolves({ success: true, contactId: 'C001', accountId: 'A001' }),
    };
    const companiesRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({ id: 1, name: 'Test Co', status: 'active', needsSyncSalesForce: true }),
        updateById: sinon.stub().resolves(),
        updateAll: sinon.stub().resolves({ count: 0 }),
    };
    const userRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({ id: 1, email: 'test@example.com', needsSyncSalesForce: true }),
        updateById: sinon.stub().resolves(),
        execute: sinon.stub().resolves([]),
    };
    const listingsRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({ id: 1, listingType: 'sell', needsSyncSalesForce: true }),
        updateById: sinon.stub().resolves(),
    };
    const materialUsersRepo = { find: sinon.stub().resolves([]) };
    const locationsRepo = {
        find: sinon.stub().resolves([]),
        findOne: sinon.stub().resolves(null),
        findById: sinon.stub().resolves(null),
    };
    const syncLogRepo = {
        create: sinon.stub().resolves({ id: 1 }),
        find: sinon.stub().resolves([{ id: 1, objectType: 'Account' }]),
        deleteAll: sinon.stub().resolves({ count: 5 }),
    };
    const offersRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({ id: 1, needsSyncSalesForce: true }),
        updateById: sinon.stub().resolves(),
    };
    const companyDocsRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({ id: 1, needsSyncSalesForce: true }),
        updateAll: sinon.stub().resolves({ count: 0 }),
        updateById: sinon.stub().resolves(),
    };
    const locationDocsRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({ id: 1, needsSyncSalesForce: true }),
        updateAll: sinon.stub().resolves({ count: 0 }),
        updateById: sinon.stub().resolves(),
    };
    const listingDocsRepo = { find: sinon.stub().resolves([]) };
    const companyUsersRepo = {
        find: sinon.stub().resolves([]),
        findOne: sinon.stub().resolves({ id: 1, userId: 1, companyId: 1, status: 'active' }),
        findById: sinon.stub().resolves({
            id: 1, userId: 1, companyId: 1, status: 'active',
            user: { id: 1, email: 'u@test.com' },
            company: { id: 1, status: 'active', salesforceId: 'SF_CO_001' },
        }),
        updateById: sinon.stub().resolves(),
        updateAll: sinon.stub().resolves({ count: 0 }),
    };
    const haulageOffersRepo = {
        findById: sinon.stub().resolves({ id: 1, needsSyncSalesForce: true, numberOfLoads: 2 }),
        updateById: sinon.stub().resolves(),
        find: sinon.stub().resolves([]),
    };
    const haulageLoadsRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({ id: 1, haulageOfferId: 1, needsSyncSalesForce: true }),
        updateById: sinon.stub().resolves(),
        count: sinon.stub().resolves({ count: 0 }),
    };

    const service = new SalesforceSyncService(
        sfService as any,
        companiesRepo as any,
        userRepo as any,
        listingsRepo as any,
        materialUsersRepo as any,
        locationsRepo as any,
        syncLogRepo as any,
        offersRepo as any,
        companyDocsRepo as any,
        locationDocsRepo as any,
        listingDocsRepo as any,
        companyUsersRepo as any,
        haulageOffersRepo as any,
        haulageLoadsRepo as any,
    );

    return {
        service, sfService, companiesRepo, userRepo, listingsRepo, offersRepo,
        syncLogRepo, companyUsersRepo, locationsRepo, haulageOffersRepo, haulageLoadsRepo,
        companyDocsRepo, locationDocsRepo, listingDocsRepo,
    };
}

describe('SalesforceSyncService (unit) - part 3', () => {
    beforeEach(() => {
        const { service } = buildService();
        service.resetCircuitBreaker();
    });

    // ── syncHaulageLoad ───────────────────────────────────────────────────────
    describe('syncHaulageLoad', () => {
        it('skips sync when load already synced and forceSync=false', async () => {
            const { service, haulageLoadsRepo, sfService } = buildService();
            haulageLoadsRepo.findById.resolves({
                id: 1,
                haulageOfferId: 1,
                isSyncedSalesForce: true,
                salesforceId: 'SF_HL_001',
                lastSyncedSalesForceDate: new Date('2025-02-01'),
                updatedAt: new Date('2025-01-01'),
            });
            const result = await service.syncHaulageLoad(1, false);
            expect(result.skipped).to.be.true();
            expect(sfService.createRecord.called).to.be.false();
        });

        it('calls upsertRecord with Haulage_Loads__c on forced sync', async () => {
            const { service, sfService } = buildService();
            await service.syncHaulageLoad(1, true);
            expect(sfService.upsertRecord.called).to.be.true();
            expect(sfService.upsertRecord.firstCall.args[0]).to.equal('Haulage_Loads__c');
        });

        it('returns success when createRecord succeeds', async () => {
            const { service } = buildService();
            const result = await service.syncHaulageLoad(1, true);
            expect(result.success).to.be.true();
        });

        it('returns failure when haulageLoadsRepo.findById throws', async () => {
            const { service, haulageLoadsRepo } = buildService();
            haulageLoadsRepo.findById.rejects(new Error('DB_ERROR'));
            const result = await service.syncHaulageLoad(1, true, true);
            expect(result.success).to.be.false();
            expect(result.error).to.containEql('DB_ERROR');
        });

        it('logs sync attempt to syncLogRepository', async () => {
            const { service, syncLogRepo } = buildService();
            await service.syncHaulageLoad(1, true);
            expect(syncLogRepo.create.called).to.be.true();
        });

        it('updates sync tracking on haulageLoadsRepo after success', async () => {
            const { service, haulageLoadsRepo } = buildService();
            await service.syncHaulageLoad(1, true);
            expect(haulageLoadsRepo.updateById.called).to.be.true();
        });
    });

    // ── syncCompanyDocument ───────────────────────────────────────────────────
    describe('syncCompanyDocument', () => {
        it('skips sync when document already synced and forceSync=false', async () => {
            const { service, companyDocsRepo, sfService } = buildService();
            companyDocsRepo.findById.resolves({
                id: 1,
                isSyncedSalesForce: true,
                salesforceId: 'SF_DOC_001',
                lastSyncedSalesForceDate: new Date('2025-02-01'),
                updatedAt: new Date('2025-01-01'),
            });
            const result = await service.syncCompanyDocument(1, false);
            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('calls upsertRecord with Document__c on forced sync', async () => {
            const { service, sfService } = buildService();
            await service.syncCompanyDocument(1, true);
            expect(sfService.upsertRecord.called).to.be.true();
            expect(sfService.upsertRecord.firstCall.args[0]).to.equal('Document__c');
        });

        it('returns success when upsertRecord succeeds', async () => {
            const { service } = buildService();
            const result = await service.syncCompanyDocument(1, true);
            expect(result.success).to.be.true();
        });

        it('returns failure when repository throws', async () => {
            const { service, companyDocsRepo } = buildService();
            companyDocsRepo.findById.rejects(new Error('DB_FAILURE'));
            const result = await service.syncCompanyDocument(1, true, true);
            expect(result.success).to.be.false();
        });
    });

    // ── syncLocationDocument ──────────────────────────────────────────────────
    describe('syncLocationDocument', () => {
        it('skips sync when location document already synced and forceSync=false', async () => {
            const { service, locationDocsRepo, sfService } = buildService();
            locationDocsRepo.findById.resolves({
                id: 1,
                isSyncedSalesForce: true,
                salesforceId: 'SF_LDOC_001',
                lastSyncedSalesForceDate: new Date('2025-02-01'),
                updatedAt: new Date('2025-01-01'),
            });
            const result = await service.syncLocationDocument(1, false);
            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('calls upsertRecord with Document__c on forced sync', async () => {
            const { service, sfService } = buildService();
            await service.syncLocationDocument(1, true);
            expect(sfService.upsertRecord.called).to.be.true();
            expect(sfService.upsertRecord.firstCall.args[0]).to.equal('Document__c');
        });

        it('returns failure when repository throws', async () => {
            const { service, locationDocsRepo } = buildService();
            locationDocsRepo.findById.rejects(new Error('TIMEOUT'));
            const result = await service.syncLocationDocument(1, true, true);
            expect(result.success).to.be.false();
        });
    });

    // ── syncAllHaulageOffers ──────────────────────────────────────────────────
    describe('syncAllHaulageOffers', () => {
        it('returns empty bulk result when no haulage offers exist', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.find.resolves([]);
            const result = await service.syncAllHaulageOffers(true);
            expect(result.total).to.equal(0);
            expect(result.successful).to.equal(0);
        });

        it('processes multiple haulage offers in batch', async () => {
            const { service, haulageOffersRepo, sfService } = buildService();
            haulageOffersRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true, numberOfLoads: 1 },
                { id: 2, needsSyncSalesForce: true, numberOfLoads: 2 },
            ]);
            const result = await service.syncAllHaulageOffers(true);
            expect(result.total).to.equal(2);
            expect(sfService.upsertRecord.called).to.be.true();
        });
    });

    // ── cleanupPendingCompanyAccounts ─────────────────────────────────────────
    describe('cleanupPendingCompanyAccounts', () => {
        it('returns zeros when no pending companies with SF IDs found', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.find.resolves([]);
            const result = await service.cleanupPendingCompanyAccounts();
            expect(result.found).to.equal(0);
            expect(result.deleted).to.equal(0);
            expect(result.failed).to.equal(0);
        });

        it('deletes SF Account and clears sync fields for each pending company', async () => {
            const { service, companiesRepo, sfService } = buildService();
            companiesRepo.find.resolves([
                { id: 10, salesforceId: 'SF_ACCT_001', name: 'PendingCo', status: 'pending', isSyncedSalesForce: true },
            ]);
            sfService.deleteRecord.resolves({ success: true });

            const result = await service.cleanupPendingCompanyAccounts();

            expect(result.found).to.equal(1);
            expect(result.deleted).to.equal(1);
            expect(result.failed).to.equal(0);
            expect(sfService.deleteRecord.calledWith('Account', 'SF_ACCT_001')).to.be.true();
            expect(companiesRepo.updateById.calledWith(10, sinon.match({ isSyncedSalesForce: false }))).to.be.true();
        });

        it('increments failed count when deleteRecord fails', async () => {
            const { service, companiesRepo, sfService } = buildService();
            companiesRepo.find.resolves([
                { id: 11, salesforceId: 'SF_ACCT_002', name: 'FailCo', status: 'pending', isSyncedSalesForce: true },
            ]);
            sfService.deleteRecord.resolves({ success: false, error: 'NOT_FOUND' });

            const result = await service.cleanupPendingCompanyAccounts();

            expect(result.found).to.equal(1);
            expect(result.deleted).to.equal(0);
            expect(result.failed).to.equal(1);
            expect(result.errors).to.have.length(1);
        });

        it('increments failed count when deleteRecord throws', async () => {
            const { service, companiesRepo, sfService } = buildService();
            companiesRepo.find.resolves([
                { id: 12, salesforceId: 'SF_ACCT_003', status: 'pending', isSyncedSalesForce: true },
            ]);
            sfService.deleteRecord.rejects(new Error('NETWORK_ERROR'));

            const result = await service.cleanupPendingCompanyAccounts();

            expect(result.failed).to.equal(1);
            expect(result.errors[0]).to.containEql('12');
        });

        it('skips companies without salesforceId', async () => {
            const { service, companiesRepo, sfService } = buildService();
            companiesRepo.find.resolves([
                { id: 13, salesforceId: null, status: 'pending', isSyncedSalesForce: false },
            ]);

            const result = await service.cleanupPendingCompanyAccounts();

            expect(result.found).to.equal(1);
            expect(result.deleted).to.equal(0);
            expect(sfService.deleteRecord.called).to.be.false();
        });

        it('limits errors array to 10 entries', async () => {
            const { service, companiesRepo, sfService } = buildService();
            const manyCompanies = Array.from({ length: 15 }, (_, i) => ({
                id: 100 + i,
                salesforceId: `SF_${i}`,
                status: 'pending',
                isSyncedSalesForce: true,
            }));
            companiesRepo.find.resolves(manyCompanies);
            sfService.deleteRecord.resolves({ success: false, error: 'ERR' });

            const result = await service.cleanupPendingCompanyAccounts();

            expect(result.failed).to.equal(15);
            expect(result.errors.length).to.be.lessThanOrEqual(10);
        });
    });

    // ── syncHaulageOffersByFilter ─────────────────────────────────────────────
    describe('syncHaulageOffersByFilter', () => {
        it('only processes matching haulage offers', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.find.resolves([
                { id: 5, needsSyncSalesForce: true, numberOfLoads: 1 },
            ]);
            const result = await service.syncHaulageOffersByFilter({ status: 'pending' }, true);
            expect(result.total).to.equal(1);
            expect(haulageOffersRepo.find.calledWith(sinon.match({ where: { status: 'pending' } }))).to.be.true();
        });
    });

    // ── syncCompanyDocumentsByFilter ──────────────────────────────────────────
    describe('syncCompanyDocumentsByFilter', () => {
        it('returns empty result when no documents match filter', async () => {
            const { service, companyDocsRepo } = buildService();
            companyDocsRepo.find.resolves([]);
            const result = await service.syncCompanyDocumentsByFilter({ companyId: 999 }, true);
            expect(result.total).to.equal(0);
        });

        it('syncs matching documents', async () => {
            const { service, companyDocsRepo, sfService } = buildService();
            companyDocsRepo.find.resolves([
                { id: 20, needsSyncSalesForce: true },
                { id: 21, needsSyncSalesForce: true },
            ]);
            const result = await service.syncCompanyDocumentsByFilter({ companyId: 1 }, true);
            expect(result.total).to.equal(2);
            expect(sfService.upsertRecord.called).to.be.true();
        });
    });
});
