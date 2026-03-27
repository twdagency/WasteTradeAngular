/**
 * salesforce-sync.service-5.unit.ts
 * Branch-focused tests for salesforce-sync.service.ts (Part 5)
 * Targets: circuit breaker open branch, needsSync conditionals,
 *          error handling paths, forceSync=true vs false branches.
 */
import { expect, sinon } from '@loopback/testlab';
import { SalesforceSyncService } from '../../services/salesforce/salesforce-sync.service';

function buildService(overrides: Partial<Record<string, any>> = {}) {
    const sfService = {
        isConnected: sinon.stub().resolves(true),
        upsertRecord: sinon.stub().resolves({ success: true, salesforceId: 'SF001' }),
        createRecord: sinon.stub().resolves({ success: true, salesforceId: 'SF_NEW_001' }),
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
        execute: sinon.stub().resolves([]),
        dataSource: { execute: sinon.stub().resolves([]) },
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
        find: sinon.stub().resolves([]),
        deleteAll: sinon.stub().resolves({ count: 0 }),
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
        overrides.sfService ?? sfService,
        overrides.companiesRepo ?? companiesRepo,
        overrides.userRepo ?? userRepo,
        overrides.listingsRepo ?? listingsRepo,
        overrides.materialUsersRepo ?? materialUsersRepo,
        overrides.locationsRepo ?? locationsRepo,
        overrides.syncLogRepo ?? syncLogRepo,
        overrides.offersRepo ?? offersRepo,
        overrides.companyDocsRepo ?? companyDocsRepo,
        overrides.locationDocsRepo ?? locationDocsRepo,
        overrides.listingDocsRepo ?? listingDocsRepo,
        overrides.companyUsersRepo ?? companyUsersRepo,
        overrides.haulageOffersRepo ?? haulageOffersRepo,
        overrides.haulageLoadsRepo ?? haulageLoadsRepo,
    );

    return {
        service, sfService, companiesRepo, userRepo, listingsRepo, offersRepo,
        syncLogRepo, companyUsersRepo, locationsRepo, haulageOffersRepo, haulageLoadsRepo,
        companyDocsRepo, locationDocsRepo, listingDocsRepo,
    };
}

describe('SalesforceSyncService branch coverage - Part 5 (unit)', () => {
    beforeEach(() => {
        const { service } = buildService();
        service.resetCircuitBreaker();
    });

    describe('syncCompany() — needsSync/forceSync branches', () => {
        it('skips sync when company already synced and forceSync=false', async () => {
            const { service, companiesRepo, sfService } = buildService();
            companiesRepo.findById.resolves({
                id: 1,
                isSyncedSalesForce: true,
                salesforceId: 'SF_CO_001',
                lastSyncedSalesForceDate: new Date('2025-06-01'),
                updatedAt: new Date('2025-01-01'),
                needsSyncSalesForce: false,
            });

            const result = await service.syncCompany(1, false);

            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('syncs company when forceSync=true even if already synced', async () => {
            const { service, sfService } = buildService();

            const result = await service.syncCompany(1, true);

            expect(sfService.upsertRecord.called).to.be.true();
            expect(result.success).to.be.true();
        });

        it('syncs company when needsSyncSalesForce=true', async () => {
            const { service, companiesRepo, sfService } = buildService();
            companiesRepo.findById.resolves({
                id: 1,
                status: 'active',
                isSyncedSalesForce: true,
                salesforceId: 'SF_CO_001',
                lastSyncedSalesForceDate: new Date('2025-06-01'),
                updatedAt: new Date('2025-07-01'), // updated after last sync
                needsSyncSalesForce: true,
            });

            const result = await service.syncCompany(1, false);

            expect(sfService.upsertRecord.called).to.be.true();
            expect(result.success).to.be.true();
        });

        it('returns failure when company repo throws', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.findById.rejects(new Error('DB_CONNECTION_ERROR'));

            const result = await service.syncCompany(1, true, true);

            expect(result.success).to.be.false();
            expect(result.error).to.containEql('DB_CONNECTION_ERROR');
        });
    });

    describe('syncUserAsLead() — needsSync/forceSync branches', () => {
        it('skips sync when user already synced and forceSync=false', async () => {
            const { service, userRepo, sfService } = buildService();
            userRepo.findById.resolves({
                id: 1,
                isSyncedSalesForce: true,
                salesforceId: 'SF_U_001',
                lastSyncedSalesForceDate: new Date('2025-06-01'),
                updatedAt: new Date('2025-01-01'),
                needsSyncSalesForce: false,
            });

            const result = await service.syncUserAsLead(1, false);

            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('syncs user when forceSync=true', async () => {
            const { service, sfService } = buildService();

            const result = await service.syncUserAsLead(1, true);

            expect(sfService.upsertRecord.called).to.be.true();
            expect(result.success).to.be.true();
        });

        it('returns failure when user repo throws', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.rejects(new Error('USER_NOT_FOUND'));

            const result = await service.syncUserAsLead(999, true, true);

            expect(result.success).to.be.false();
            expect(result.error).to.containEql('USER_NOT_FOUND');
        });
    });

    describe('syncListing() — needsSync/forceSync branches', () => {
        it('skips sync when listing already synced and forceSync=false', async () => {
            const { service, listingsRepo, sfService } = buildService();
            listingsRepo.findById.resolves({
                id: 1,
                listingType: 'sell',
                isSyncedSalesForce: true,
                salesforceId: 'SF_L_001',
                lastSyncedSalesForceDate: new Date('2025-06-01'),
                updatedAt: new Date('2025-01-01'),
                needsSyncSalesForce: false,
            });

            const result = await service.syncListing(1, false);

            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('returns failure when listing repo throws', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.rejects(new Error('LISTING_DB_ERR'));

            const result = await service.syncListing(1, true, true);

            expect(result.success).to.be.false();
        });
    });

    describe('syncHaulageOffer() — needsSync/forceSync branches', () => {
        it('skips sync when haulage offer already synced and forceSync=false', async () => {
            const { service, haulageOffersRepo, sfService } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1,
                isSyncedSalesForce: true,
                salesforceId: 'SF_HO_001',
                lastSyncedSalesForceDate: new Date('2025-06-01'),
                updatedAt: new Date('2025-01-01'),
                needsSyncSalesForce: false,
                numberOfLoads: 2,
            });

            const result = await service.syncHaulageOffer(1, false);

            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('syncs haulage offer when forceSync=true', async () => {
            const { service, sfService } = buildService();

            const result = await service.syncHaulageOffer(1, true);

            expect(sfService.upsertRecord.called).to.be.true();
            expect(result.success).to.be.true();
        });

        it('returns failure when haulage offer repo throws', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.rejects(new Error('HAULAGE_DB_ERR'));

            const result = await service.syncHaulageOffer(999, true, true);

            expect(result.success).to.be.false();
        });
    });

    describe('bulkSyncUsersAsLeads() — batch processing', () => {
        it('returns empty result when no users need sync', async () => {
            const { service, userRepo } = buildService();
            userRepo.find.resolves([]);

            const result = await service.bulkSyncUsersAsLeads(true);

            expect(result.total).to.equal(0);
        });

        it('processes multiple users in batch', async () => {
            const { service, userRepo, sfService } = buildService();
            userRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true },
                { id: 2, needsSyncSalesForce: true },
            ]);

            const result = await service.bulkSyncUsersAsLeads(true);

            expect(result.total).to.equal(2);
            expect(sfService.upsertRecord.called).to.be.true();
        });
    });

    describe('bulkSyncCompanies() — batch processing', () => {
        it('returns empty result when no companies need sync', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.find.resolves([]);

            const result = await service.bulkSyncCompanies(true);

            expect(result.total).to.equal(0);
        });

        it('processes multiple companies', async () => {
            const { service, companiesRepo, sfService } = buildService();
            companiesRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true },
                { id: 2, needsSyncSalesForce: true },
            ]);

            const result = await service.bulkSyncCompanies(true);

            expect(result.total).to.equal(2);
            expect(sfService.upsertRecord.called).to.be.true();
        });
    });
});
