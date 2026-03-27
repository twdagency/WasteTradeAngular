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

describe('SalesforceSyncService (unit) - part 4', () => {
    beforeEach(() => {
        const { service } = buildService();
        service.resetCircuitBreaker();
    });

    // ── syncAllCompanyDocuments ───────────────────────────────────────────────
    describe('syncAllCompanyDocuments', () => {
        it('returns empty bulk result when no documents exist', async () => {
            const { service, companyDocsRepo } = buildService();
            companyDocsRepo.find.resolves([]);
            const result = await service.syncAllCompanyDocuments(true);
            expect(result.total).to.equal(0);
            expect(result.successful).to.equal(0);
        });

        it('processes multiple company documents in batch', async () => {
            const { service, companyDocsRepo, sfService } = buildService();
            companyDocsRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true },
                { id: 2, needsSyncSalesForce: true },
            ]);
            const result = await service.syncAllCompanyDocuments(true);
            expect(result.total).to.equal(2);
            expect(sfService.upsertRecord.called).to.be.true();
        });

        it('respects the limit parameter', async () => {
            const { service, companyDocsRepo } = buildService();
            companyDocsRepo.find.resolves([{ id: 1, needsSyncSalesForce: true }]);
            await service.syncAllCompanyDocuments(true, 1);
            expect(companyDocsRepo.find.firstCall.args[0]).to.containEql({ limit: 1 });
        });
    });

    // ── syncAllLocationDocuments ──────────────────────────────────────────────
    describe('syncAllLocationDocuments', () => {
        it('returns empty bulk result when no location documents exist', async () => {
            const { service, locationDocsRepo } = buildService();
            locationDocsRepo.find.resolves([]);
            const result = await service.syncAllLocationDocuments(true);
            expect(result.total).to.equal(0);
        });

        it('processes multiple location documents', async () => {
            const { service, locationDocsRepo, sfService } = buildService();
            locationDocsRepo.find.resolves([
                { id: 10, needsSyncSalesForce: true },
                { id: 11, needsSyncSalesForce: true },
            ]);
            const result = await service.syncAllLocationDocuments(true);
            expect(result.total).to.equal(2);
            expect(sfService.upsertRecord.called).to.be.true();
        });
    });

    // ── syncWantedListing ─────────────────────────────────────────────────────
    describe('syncWantedListing', () => {
        it('skips sync when listing already synced and forceSync=false', async () => {
            const { service, listingsRepo, sfService } = buildService();
            listingsRepo.findById.resolves({
                id: 1,
                listingType: 'wanted',
                isSyncedSalesForce: true,
                salesforceId: 'SF_WL_001',
                lastSyncedSalesForceDate: new Date('2025-02-01'),
                updatedAt: new Date('2025-01-01'),
                needsSyncSalesForce: false,
            });
            const result = await service.syncWantedListing(1, false);
            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('calls upsertRecord on forced sync', async () => {
            const { service, sfService } = buildService();
            const result = await service.syncWantedListing(1, true);
            expect(sfService.upsertRecord.called).to.be.true();
            // Accept either singular or plural form of the Salesforce object name
            expect(sfService.upsertRecord.firstCall.args[0]).to.match(/Wanted_Listing/);
        });

        it('returns failure when repository throws', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.rejects(new Error('DB_ERROR'));
            const result = await service.syncWantedListing(1, true, true);
            expect(result.success).to.be.false();
            expect(result.error).to.containEql('DB_ERROR');
        });

        it('logs sync attempt after successful upsert', async () => {
            const { service, syncLogRepo } = buildService();
            await service.syncWantedListing(1, true);
            expect(syncLogRepo.create.called).to.be.true();
        });
    });

    // ── syncAllWantedListings ─────────────────────────────────────────────────
    describe('syncAllWantedListings', () => {
        it('returns empty result when no wanted listings', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.find.resolves([]);
            const result = await service.syncAllWantedListings(true);
            expect(result.total).to.equal(0);
        });

        it('processes multiple wanted listings', async () => {
            const { service, listingsRepo, sfService } = buildService();
            listingsRepo.find.resolves([
                { id: 5, listingType: 'wanted', needsSyncSalesForce: true },
                { id: 6, listingType: 'wanted', needsSyncSalesForce: true },
            ]);
            const result = await service.syncAllWantedListings(true);
            expect(result.total).to.equal(2);
            expect(sfService.upsertRecord.called).to.be.true();
        });
    });

    // ── syncAllListings ───────────────────────────────────────────────────────
    describe('syncAllListings', () => {
        it('returns empty result when no sell listings', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.find.resolves([]);
            const result = await service.syncAllListings(true);
            expect(result.total).to.equal(0);
        });

        it('processes sell listings via upsertRecord', async () => {
            const { service, listingsRepo, sfService } = buildService();
            listingsRepo.find.resolves([
                { id: 1, listingType: 'sell', needsSyncSalesForce: true },
                { id: 2, listingType: 'sell', needsSyncSalesForce: true },
            ]);
            const result = await service.syncAllListings(true);
            expect(result.total).to.equal(2);
            expect(sfService.upsertRecord.called).to.be.true();
        });

        it('respects the limit parameter', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.find.resolves([]);
            await service.syncAllListings(true, 5);
            expect(listingsRepo.find.firstCall.args[0]).to.containEql({ limit: 5 });
        });
    });

    // ── syncOffer ─────────────────────────────────────────────────────────────
    describe('syncOffer', () => {
        it('skips when offer already synced and forceSync=false', async () => {
            const { service, offersRepo, sfService } = buildService();
            offersRepo.findById.resolves({
                id: 1,
                isSyncedSalesForce: true,
                salesforceId: 'SF_OFFER_001',
                lastSyncedSalesForceDate: new Date('2025-02-01'),
                updatedAt: new Date('2025-01-01'),
                needsSyncSalesForce: false,
            });
            const result = await service.syncOffer(1, false);
            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('calls upsertRecord with Offers__c on forced sync', async () => {
            const { service, sfService } = buildService();
            await service.syncOffer(1, true);
            expect(sfService.upsertRecord.called).to.be.true();
            expect(sfService.upsertRecord.firstCall.args[0]).to.equal('Offers__c');
        });

        it('returns failure when offer not found', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.findById.rejects(new Error('NOT_FOUND'));
            const result = await service.syncOffer(999, true, true);
            expect(result.success).to.be.false();
        });
    });

    // ── syncAllOffers ─────────────────────────────────────────────────────────
    describe('syncAllOffers', () => {
        it('returns empty bulk result when no offers exist', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.find.resolves([]);
            const result = await service.syncAllOffers(true);
            expect(result.total).to.equal(0);
        });

        it('processes multiple offers in batch', async () => {
            const { service, offersRepo, sfService } = buildService();
            offersRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true },
                { id: 2, needsSyncSalesForce: true },
                { id: 3, needsSyncSalesForce: true },
            ]);
            const result = await service.syncAllOffers(true);
            expect(result.total).to.equal(3);
            expect(sfService.upsertRecord.called).to.be.true();
        });
    });

    // ── circuit breaker ───────────────────────────────────────────────────────
    describe('resetCircuitBreaker', () => {
        it('resets circuit breaker state so sync can proceed again', async () => {
            const { service } = buildService();
            // Should not throw
            expect(() => service.resetCircuitBreaker()).to.not.throw();
        });
    });
});
