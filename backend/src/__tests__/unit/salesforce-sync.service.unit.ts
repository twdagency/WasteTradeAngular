import { expect, sinon } from '@loopback/testlab';
import { SalesforceSyncService } from '../../services/salesforce/salesforce-sync.service';

/**
 * Build a fully-stubbed SalesforceSyncService.
 * The same repo object references are both injected into the service
 * and returned, so tests can configure stubs after construction.
 */
function buildService() {
    const sfService = {
        isConnected: sinon.stub().resolves(true),
        upsertRecord: sinon.stub().resolves({ success: true, salesforceId: 'SF001' }),
        createRecord: sinon.stub().resolves({ success: true, salesforceId: 'SF001' }),
        findByExternalId: sinon.stub().resolves(null),
        query: sinon.stub().resolves({ records: [] }),
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
    const materialUsersRepo = {
        find: sinon.stub().resolves([]),
    };
    const locationsRepo = {
        find: sinon.stub().resolves([]),
        findOne: sinon.stub().resolves(null),
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
        updateAll: sinon.stub().resolves({ count: 0 }),
    };
    const locationDocsRepo = {
        updateAll: sinon.stub().resolves({ count: 0 }),
    };
    const listingDocsRepo = {
        find: sinon.stub().resolves([]),
    };
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
        findById: sinon.stub().resolves({ id: 1, needsSyncSalesForce: true }),
        updateById: sinon.stub().resolves(),
        find: sinon.stub().resolves([]),
    };
    const haulageLoadsRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({ id: 1 }),
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
        service,
        sfService,
        companiesRepo,
        userRepo,
        listingsRepo,
        offersRepo,
        syncLogRepo,
        companyUsersRepo,
        locationsRepo,
        haulageOffersRepo,
        haulageLoadsRepo,
    };
}

describe('SalesforceSyncService (unit)', () => {
    // Reset the singleton circuit breaker between tests so state doesn't leak
    beforeEach(() => {
        const { service } = buildService();
        service.resetCircuitBreaker();
    });

    describe('checkSalesforceConnection', () => {
        it('returns true when SF service is connected', async () => {
            const { service } = buildService();
            const result = await service.checkSalesforceConnection();
            expect(result).to.be.true();
        });

        it('returns false when SF service throws', async () => {
            const { service, sfService } = buildService();
            sfService.isConnected.rejects(new Error('Connection failed'));
            const result = await service.checkSalesforceConnection();
            expect(result).to.be.false();
        });

        it('returns false when SF service returns false', async () => {
            const { service, sfService } = buildService();
            sfService.isConnected.resolves(false);
            const result = await service.checkSalesforceConnection();
            expect(result).to.be.false();
        });
    });

    describe('syncCompany', () => {
        it('calls upsertRecord with Account object type', async () => {
            const { service, sfService, syncLogRepo } = buildService();
            const result = await service.syncCompany(1, true, true);
            expect(sfService.upsertRecord.called).to.be.true();
            expect(sfService.upsertRecord.firstCall.args[0]).to.equal('Account');
            expect(syncLogRepo.create.called).to.be.true();
        });

        it('skips sync when company is already synced and forceSync=false', async () => {
            const { service, companiesRepo, sfService } = buildService();
            // needsSync returns false: isSyncedSalesForce=true, salesforceId set,
            // lastSyncedSalesForceDate > updatedAt
            companiesRepo.findById.resolves({
                id: 1,
                name: 'Test Co',
                isSyncedSalesForce: true,
                salesforceId: 'SF_ACC_001',
                lastSyncedSalesForceDate: new Date('2025-01-02'),
                updatedAt: new Date('2025-01-01'),
            });
            const result = await service.syncCompany(1, false, true);
            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('returns failure result when upsertRecord fails', async () => {
            const { service, sfService } = buildService();
            sfService.upsertRecord.resolves({ success: false, error: 'INVALID_FIELD' });
            const result = await service.syncCompany(1, true, true);
            expect(result.success).to.be.false();
        });

        it('logs sync result to syncLogRepository on success', async () => {
            const { service, syncLogRepo } = buildService();
            await service.syncCompany(1, true, true);
            expect(syncLogRepo.create.called).to.be.true();
        });
    });

    describe('syncCompaniesByFilter', () => {
        it('fetches companies using the provided where filter', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.find.resolves([]);
            await service.syncCompaniesByFilter({ status: 'active' }, true);
            expect(companiesRepo.find.calledWith({ where: { status: 'active' } })).to.be.true();
        });

        it('returns zero total when no companies match', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.find.resolves([]);
            const result = await service.syncCompaniesByFilter({ id: 9999 });
            expect(result.total).to.equal(0);
        });

        it('processes returned companies and returns bulk result', async () => {
            const { service, companiesRepo } = buildService();
            const company = { id: 1, name: 'Test Co', needsSyncSalesForce: true };
            companiesRepo.find.resolves([company]);
            companiesRepo.findById.resolves(company);
            const result = await service.syncCompaniesByFilter({}, true);
            expect(result).to.have.property('total');
            expect(result.total).to.equal(1);
        });
    });

    describe('syncUsersByFilter', () => {
        it('fetches users using the provided where filter', async () => {
            const { service, userRepo } = buildService();
            userRepo.find.resolves([]);
            await service.syncUsersByFilter({ id: 2 }, true);
            expect(userRepo.find.calledWith({ where: { id: 2 } })).to.be.true();
        });

        it('processes returned users and returns bulk result', async () => {
            const { service, userRepo } = buildService();
            const user = { id: 2, email: 'u@test.com', needsSyncSalesForce: true };
            userRepo.find.resolves([user]);
            userRepo.findById.resolves(user);
            const result = await service.syncUsersByFilter({}, true);
            expect(result.total).to.equal(1);
        });
    });

    describe('syncListingsByFilter', () => {
        it('fetches listings using the provided where filter', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.find.resolves([]);
            await service.syncListingsByFilter({ id: 5 }, true);
            expect(listingsRepo.find.calledWith({ where: { id: 5 } })).to.be.true();
        });

        it('routes SELL listings through syncListing', async () => {
            const { service, listingsRepo } = buildService();
            const listing = { id: 5, listingType: 'sell', needsSyncSalesForce: true };
            listingsRepo.find.resolves([listing]);
            listingsRepo.findById.resolves(listing);
            const result = await service.syncListingsByFilter({}, true);
            expect(result.total).to.equal(1);
        });

        it('routes WANTED listings through syncWantedListing', async () => {
            const { service, listingsRepo } = buildService();
            const listing = { id: 6, listingType: 'wanted', needsSyncSalesForce: true };
            listingsRepo.find.resolves([listing]);
            listingsRepo.findById.resolves(listing);
            const result = await service.syncListingsByFilter({}, true);
            expect(result.total).to.equal(1);
        });
    });

    describe('syncOffersByFilter', () => {
        it('fetches offers using the provided where filter', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.find.resolves([]);
            await service.syncOffersByFilter({ id: 10 }, true);
            expect(offersRepo.find.calledWith({ where: { id: 10 } })).to.be.true();
        });

        it('processes returned offers and returns bulk result', async () => {
            const { service, offersRepo } = buildService();
            const offer = { id: 10, needsSyncSalesForce: true };
            offersRepo.find.resolves([offer]);
            offersRepo.findById.resolves(offer);
            const result = await service.syncOffersByFilter({}, true);
            expect(result.total).to.equal(1);
        });
    });

    describe('getSyncLogs', () => {
        it('calls syncLogRepository.find and returns results', async () => {
            const { service, syncLogRepo } = buildService();
            syncLogRepo.find.resolves([{ id: 1, objectType: 'Account' }]);
            const logs = await service.getSyncLogs('Account');
            expect(syncLogRepo.find.called).to.be.true();
            expect(logs.length).to.equal(1);
        });

        it('returns all logs when no objectType provided', async () => {
            const { service, syncLogRepo } = buildService();
            syncLogRepo.find.resolves([{ id: 1 }, { id: 2 }]);
            const logs = await service.getSyncLogs();
            expect(logs.length).to.equal(2);
        });
    });

    describe('clearFailedSyncs', () => {
        it('deletes all FAILED entries and returns count', async () => {
            const { service, syncLogRepo } = buildService();
            syncLogRepo.deleteAll.resolves({ count: 5 });
            const result = await service.clearFailedSyncs();
            expect(syncLogRepo.deleteAll.calledWith({ status: 'FAILED' })).to.be.true();
            expect(result.count).to.equal(5);
        });
    });

    describe('syncCompanyUser', () => {
        it('skips non-ACTIVE company users', async () => {
            const { service, companyUsersRepo, sfService } = buildService();
            companyUsersRepo.findById.resolves({
                id: 1, userId: 1, companyId: 1,
                status: 'pending',
                user: { id: 1, email: 'u@test.com' },
                company: { id: 1, status: 'active' },
            });
            const result = await service.syncCompanyUser(1, true, true);
            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('skips when company is not active', async () => {
            const { service, companyUsersRepo, sfService } = buildService();
            companyUsersRepo.findById.resolves({
                id: 1, userId: 1, companyId: 1,
                status: 'active',
                user: { id: 1, email: 'u@test.com' },
                company: { id: 1, status: 'pending' },
            });
            const result = await service.syncCompanyUser(1, true, true);
            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('returns error when account not found in Salesforce', async () => {
            const { service, companyUsersRepo, sfService } = buildService();
            companyUsersRepo.findById.resolves({
                id: 1, userId: 1, companyId: 1,
                status: 'active',
                user: { id: 1, email: 'u@test.com' },
                company: { id: 1, status: 'active', salesforceId: null },
            });
            sfService.findByExternalId.rejects(new Error('Not found'));
            const result = await service.syncCompanyUser(1, true, true);
            expect(result.success).to.be.false();
        });
    });

    describe('getCircuitBreakerStatus', () => {
        it('returns object with isOpen and failures properties', () => {
            const { service } = buildService();
            const status = service.getCircuitBreakerStatus();
            expect(status).to.have.property('isOpen');
            expect(status).to.have.property('failures');
        });
    });

    describe('getMetricsSummary', () => {
        it('returns a metrics summary object', () => {
            const { service } = buildService();
            const summary = service.getMetricsSummary();
            expect(summary).to.be.an.Object();
        });
    });

    describe('resetCircuitBreaker', () => {
        it('resets circuit breaker state without throwing', () => {
            const { service } = buildService();
            expect(() => service.resetCircuitBreaker()).to.not.throwError();
            const status = service.getCircuitBreakerStatus();
            expect(status.isOpen).to.be.false();
        });
    });
});
