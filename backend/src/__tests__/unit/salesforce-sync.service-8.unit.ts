/**
 * salesforce-sync.service-8.unit.ts
 * Coverage-focused tests for salesforce-sync.service.ts (Part 8)
 * Targets: syncHaulageOffer, syncAllHaulageOffers, syncHaulageOffersByFilter,
 *          syncHaulageLoad, syncHaulageLoadsByFilter, syncAllCompanyDocuments,
 *          syncLocationDocument, syncAllLocationDocuments, syncWantedListing,
 *          syncAllListings, syncAllWantedListings, syncRecordsModifiedAfter,
 *          syncCompanyDocumentsByFilter, syncLocationDocumentsByFilter,
 *          syncCompanyUsersByFilter, syncOffersByFilter,
 *          cleanupPendingCompanyAccounts, pullSingleHaulageOfferFromSalesforce,
 *          pullLeadUpdatesFromSalesforce, pullUpdatesFromSalesforce
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
        findById: sinon.stub().resolves({ id: 1, companyId: 1, country: 'GB' }),
    };
    const syncLogRepo = {
        create: sinon.stub().resolves({ id: 1 }),
        find: sinon.stub().resolves([]),
        deleteAll: sinon.stub().resolves({ count: 0 }),
    };
    const offersRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({ id: 1, needsSyncSalesForce: true, listingId: 10, buyerCompanyId: 2 }),
        updateById: sinon.stub().resolves(),
    };
    const companyDocsRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({ id: 1, needsSyncSalesForce: true, companyId: 1 }),
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
            id: 1, userId: 1, companyId: 1, status: 'active', companyRole: 'buyer',
            user: { id: 1, email: 'u@test.com', firstName: 'John', lastName: 'Doe' },
            company: { id: 1, status: 'active', salesforceId: 'SF_CO_001' },
        }),
        updateById: sinon.stub().resolves(),
        updateAll: sinon.stub().resolves({ count: 0 }),
    };
    const haulageOffersRepo = {
        findById: sinon.stub().resolves({
            id: 1, needsSyncSalesForce: true, numberOfLoads: 2,
            haulageOfferId: 1, status: 'pending',
        }),
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

describe('SalesforceSyncService extended coverage - Part 8 (unit)', () => {
    beforeEach(() => {
        const { service } = buildService();
        service.resetCircuitBreaker();
    });

    // ── syncHaulageOffer ───────────────────────────────────────────────────────
    describe('syncHaulageOffer()', () => {
        it('syncs haulage offer to Salesforce and returns success', async () => {
            const { service, sfService } = buildService();

            const result = await service.syncHaulageOffer(1, true, true);

            expect(sfService.upsertRecord.called).to.be.true();
            expect(result.success).to.be.true();
        });

        it('skips when haulage offer is already synced and forceSync=false', async () => {
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

            const result = await service.syncHaulageOffer(1, false, true);

            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('returns failure when haulageOffer repo throws', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.rejects(new Error('HO_DB_ERR'));

            const result = await service.syncHaulageOffer(999, true, true);

            expect(result.success).to.be.false();
        });

        it('returns failure when upsertRecord fails', async () => {
            const { service, sfService } = buildService();
            sfService.upsertRecord.resolves({ success: false, error: 'INVALID_FIELD' });

            const result = await service.syncHaulageOffer(1, true, true);

            expect(result.success).to.be.false();
        });

        it('logs sync result via syncLogRepo', async () => {
            const { service, syncLogRepo } = buildService();

            await service.syncHaulageOffer(1, true, true);

            expect(syncLogRepo.create.called).to.be.true();
        });
    });

    // ── syncAllHaulageOffers ───────────────────────────────────────────────────
    describe('syncAllHaulageOffers()', () => {
        it('returns zero total when no haulage offers exist', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.find.resolves([]);

            const result = await service.syncAllHaulageOffers(true);

            expect(result.total).to.equal(0);
        });

        it('processes multiple haulage offers and returns totals', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true },
                { id: 2, needsSyncSalesForce: true },
            ]);

            const result = await service.syncAllHaulageOffers(true);

            expect(result.total).to.equal(2);
        });

        it('respects limit option when provided', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.find.resolves([{ id: 1, needsSyncSalesForce: true }]);

            await service.syncAllHaulageOffers(false, 1);

            expect(haulageOffersRepo.find.calledWith({ limit: 1 })).to.be.true();
        });

        it('handles missing id gracefully in batch', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.find.resolves([{ id: undefined, needsSyncSalesForce: true }]);

            const result = await service.syncAllHaulageOffers(true);

            expect(result.failed).to.equal(1);
        });
    });

    // ── syncHaulageOffersByFilter ──────────────────────────────────────────────
    describe('syncHaulageOffersByFilter()', () => {
        it('fetches haulage offers using the provided where filter', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.find.resolves([]);

            await service.syncHaulageOffersByFilter({ status: 'pending' }, true);

            expect(haulageOffersRepo.find.calledWith({ where: { status: 'pending' } })).to.be.true();
        });

        it('returns zero total when no haulage offers match filter', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.find.resolves([]);

            const result = await service.syncHaulageOffersByFilter({ id: 9999 }, true);

            expect(result.total).to.equal(0);
        });

        it('processes matching haulage offers', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true },
                { id: 2, needsSyncSalesForce: true },
            ]);

            const result = await service.syncHaulageOffersByFilter({}, true);

            expect(result.total).to.equal(2);
        });
    });

    // ── syncHaulageLoad ────────────────────────────────────────────────────────
    describe('syncHaulageLoad()', () => {
        it('syncs haulage load to Salesforce and returns success', async () => {
            const { service, sfService } = buildService();

            const result = await service.syncHaulageLoad(1, true, true);

            expect(sfService.upsertRecord.called).to.be.true();
            expect(result.success).to.be.true();
        });

        it('skips when haulage load is already synced and forceSync=false', async () => {
            const { service, haulageLoadsRepo, sfService } = buildService();
            haulageLoadsRepo.findById.resolves({
                id: 1,
                haulageOfferId: 1,
                isSyncedSalesForce: true,
                salesforceId: 'SF_HL_001',
                lastSyncedSalesForceDate: new Date('2025-06-01'),
                updatedAt: new Date('2025-01-01'),
                needsSyncSalesForce: false,
            });

            const result = await service.syncHaulageLoad(1, false, true);

            expect(result.skipped).to.be.true();
            expect(sfService.createRecord.called).to.be.false();
        });

        it('returns failure when load repo throws', async () => {
            const { service, haulageLoadsRepo } = buildService();
            haulageLoadsRepo.findById.rejects(new Error('LOAD_DB_ERR'));

            const result = await service.syncHaulageLoad(999, true, true);

            expect(result.success).to.be.false();
        });

        it('logs sync result via syncLogRepo', async () => {
            const { service, syncLogRepo } = buildService();

            await service.syncHaulageLoad(1, true, true);

            expect(syncLogRepo.create.called).to.be.true();
        });
    });

    // ── syncHaulageLoadsByFilter ───────────────────────────────────────────────
    describe('syncHaulageLoadsByFilter()', () => {
        it('fetches haulage loads using the provided where filter', async () => {
            const { service, haulageLoadsRepo } = buildService();
            haulageLoadsRepo.find.resolves([]);

            await service.syncHaulageLoadsByFilter({ haulageOfferId: 5 }, true);

            expect(haulageLoadsRepo.find.calledWith({ where: { haulageOfferId: 5 } })).to.be.true();
        });

        it('returns zero total when no loads match filter', async () => {
            const { service, haulageLoadsRepo } = buildService();
            haulageLoadsRepo.find.resolves([]);

            const result = await service.syncHaulageLoadsByFilter({ id: 9999 }, true);

            expect(result.total).to.equal(0);
        });

        it('processes matching loads', async () => {
            const { service, haulageLoadsRepo } = buildService();
            haulageLoadsRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true },
                { id: 2, needsSyncSalesForce: true },
            ]);

            const result = await service.syncHaulageLoadsByFilter({}, true);

            expect(result.total).to.equal(2);
        });

        it('handles missing load id in batch', async () => {
            const { service, haulageLoadsRepo } = buildService();
            haulageLoadsRepo.find.resolves([{ id: undefined, needsSyncSalesForce: true }]);

            const result = await service.syncHaulageLoadsByFilter({}, true);

            expect(result.failed).to.equal(1);
        });
    });

    // ── syncAllCompanyDocuments ────────────────────────────────────────────────
    describe('syncAllCompanyDocuments()', () => {
        it('returns zero total when no company documents exist', async () => {
            const { service, companyDocsRepo } = buildService();
            companyDocsRepo.find.resolves([]);

            const result = await service.syncAllCompanyDocuments(true);

            expect(result.total).to.equal(0);
        });

        it('processes multiple company documents', async () => {
            const { service, companyDocsRepo } = buildService();
            companyDocsRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true },
                { id: 2, needsSyncSalesForce: true },
            ]);

            const result = await service.syncAllCompanyDocuments(true);

            expect(result.total).to.equal(2);
        });

        it('respects limit option', async () => {
            const { service, companyDocsRepo } = buildService();
            companyDocsRepo.find.resolves([{ id: 1, needsSyncSalesForce: true }]);

            await service.syncAllCompanyDocuments(false, 1);

            expect(companyDocsRepo.find.calledWith({ limit: 1 })).to.be.true();
        });

        it('handles missing document id in batch', async () => {
            const { service, companyDocsRepo } = buildService();
            companyDocsRepo.find.resolves([{ id: undefined, needsSyncSalesForce: true }]);

            const result = await service.syncAllCompanyDocuments(true);

            expect(result.failed).to.equal(1);
        });
    });

    // ── syncLocationDocument ───────────────────────────────────────────────────
    describe('syncLocationDocument()', () => {
        it('syncs location document to Salesforce and returns success', async () => {
            const { service, sfService } = buildService();

            const result = await service.syncLocationDocument(1, true, true);

            expect(sfService.upsertRecord.called).to.be.true();
            expect(result.success).to.be.true();
        });

        it('skips when location document is already synced and forceSync=false', async () => {
            const { service, locationDocsRepo, sfService } = buildService();
            locationDocsRepo.findById.resolves({
                id: 1,
                isSyncedSalesForce: true,
                salesforceId: 'SF_LD_001',
                lastSyncedSalesForceDate: new Date('2025-06-01'),
                updatedAt: new Date('2025-01-01'),
                needsSyncSalesForce: false,
            });

            const result = await service.syncLocationDocument(1, false, true);

            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('returns failure when location doc repo throws', async () => {
            const { service, locationDocsRepo } = buildService();
            locationDocsRepo.findById.rejects(new Error('LOC_DOC_ERR'));

            const result = await service.syncLocationDocument(999, true, true);

            expect(result.success).to.be.false();
        });

        it('logs sync result via syncLogRepo', async () => {
            const { service, syncLogRepo } = buildService();

            await service.syncLocationDocument(1, true, true);

            expect(syncLogRepo.create.called).to.be.true();
        });

        it('returns failure result when upsertRecord fails for location doc', async () => {
            const { service, sfService } = buildService();
            sfService.upsertRecord.resolves({ success: false, error: 'SF_ERR' });

            const result = await service.syncLocationDocument(1, true, true);

            expect(result.success).to.be.false();
        });
    });

    // ── syncAllLocationDocuments ───────────────────────────────────────────────
    describe('syncAllLocationDocuments()', () => {
        it('returns zero total when no location documents exist', async () => {
            const { service, locationDocsRepo } = buildService();
            locationDocsRepo.find.resolves([]);

            const result = await service.syncAllLocationDocuments(true);

            expect(result.total).to.equal(0);
        });

        it('processes multiple location documents', async () => {
            const { service, locationDocsRepo } = buildService();
            locationDocsRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true },
                { id: 2, needsSyncSalesForce: true },
            ]);

            const result = await service.syncAllLocationDocuments(true);

            expect(result.total).to.equal(2);
        });

        it('respects limit option for location docs', async () => {
            const { service, locationDocsRepo } = buildService();
            locationDocsRepo.find.resolves([{ id: 1, needsSyncSalesForce: true }]);

            await service.syncAllLocationDocuments(false, 5);

            expect(locationDocsRepo.find.calledWith({ limit: 5 })).to.be.true();
        });

        it('handles missing document id in batch for location docs', async () => {
            const { service, locationDocsRepo } = buildService();
            locationDocsRepo.find.resolves([{ id: undefined, needsSyncSalesForce: true }]);

            const result = await service.syncAllLocationDocuments(true);

            expect(result.failed).to.equal(1);
        });
    });

    // ── syncAllListings ────────────────────────────────────────────────────────
    describe('syncAllListings()', () => {
        it('returns zero total when no listings exist', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.find.resolves([]);

            const result = await service.syncAllListings(true);

            expect(result.total).to.equal(0);
        });

        it('processes SELL listings through syncListing', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.find.resolves([{ id: 1, listingType: 'sell', needsSyncSalesForce: true }]);

            const result = await service.syncAllListings(true);

            expect(result.total).to.equal(1);
        });

        it('processes WANTED listings through syncWantedListing', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.find.resolves([{ id: 2, listingType: 'wanted', needsSyncSalesForce: true }]);
            listingsRepo.findById.resolves({ id: 2, listingType: 'wanted', needsSyncSalesForce: true });

            const result = await service.syncAllListings(true);

            expect(result.total).to.equal(1);
        });

        it('handles missing listing id in batch', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.find.resolves([{ id: undefined, listingType: 'sell', needsSyncSalesForce: true }]);

            const result = await service.syncAllListings(true);

            expect(result.failed).to.equal(1);
        });

        it('respects limit option for all listings', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.find.resolves([]);

            await service.syncAllListings(false, 10);

            expect(listingsRepo.find.calledWith({ limit: 10 })).to.be.true();
        });
    });

    // ── syncAllWantedListings ──────────────────────────────────────────────────
    describe('syncAllWantedListings()', () => {
        it('returns zero total when no wanted listings exist', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.find.resolves([]);

            const result = await service.syncAllWantedListings(true);

            expect(result.total).to.equal(0);
        });

        it('processes multiple wanted listings', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.find.resolves([
                { id: 3, listingType: 'wanted', needsSyncSalesForce: true },
                { id: 4, listingType: 'wanted', needsSyncSalesForce: true },
            ]);
            listingsRepo.findById.resolves({ id: 3, listingType: 'wanted', needsSyncSalesForce: true });

            const result = await service.syncAllWantedListings(true);

            expect(result.total).to.equal(2);
        });
    });

    // ── syncRecordsModifiedAfter ───────────────────────────────────────────────
    describe('syncRecordsModifiedAfter()', () => {
        it('delegates to syncCompaniesByFilter for companies type', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.find.resolves([]);

            const result = await service.syncRecordsModifiedAfter(new Date(), 'companies', true);

            expect(companiesRepo.find.called).to.be.true();
            expect(result).to.have.property('total');
        });

        it('delegates to syncUsersByFilter for users type', async () => {
            const { service, userRepo } = buildService();
            userRepo.find.resolves([]);

            const result = await service.syncRecordsModifiedAfter(new Date(), 'users', true);

            expect(userRepo.find.called).to.be.true();
            expect(result).to.have.property('total');
        });

        it('delegates to syncListingsByFilter for listings type', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.find.resolves([]);

            const result = await service.syncRecordsModifiedAfter(new Date(), 'listings', true);

            expect(listingsRepo.find.called).to.be.true();
            expect(result).to.have.property('total');
        });

        it('delegates to syncOffersByFilter for offers type', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.find.resolves([]);

            const result = await service.syncRecordsModifiedAfter(new Date(), 'offers', true);

            expect(offersRepo.find.called).to.be.true();
            expect(result).to.have.property('total');
        });

        it('delegates to syncCompanyDocumentsByFilter for company_documents type', async () => {
            const { service, companyDocsRepo } = buildService();
            companyDocsRepo.find.resolves([]);

            const result = await service.syncRecordsModifiedAfter(new Date(), 'company_documents', true);

            expect(companyDocsRepo.find.called).to.be.true();
            expect(result).to.have.property('total');
        });

        it('delegates to syncLocationDocumentsByFilter for location_documents type', async () => {
            const { service, locationDocsRepo } = buildService();
            locationDocsRepo.find.resolves([]);

            const result = await service.syncRecordsModifiedAfter(new Date(), 'location_documents', true);

            expect(locationDocsRepo.find.called).to.be.true();
            expect(result).to.have.property('total');
        });

        it('throws for unsupported record type', async () => {
            const { service } = buildService();

            await expect(
                service.syncRecordsModifiedAfter(new Date(), 'invalid_type' as any, true),
            ).to.be.rejectedWith(Error);
        });
    });

    // ── syncCompanyDocumentsByFilter ───────────────────────────────────────────
    describe('syncCompanyDocumentsByFilter()', () => {
        it('fetches documents using the provided where filter', async () => {
            const { service, companyDocsRepo } = buildService();
            companyDocsRepo.find.resolves([]);

            await service.syncCompanyDocumentsByFilter({ companyId: 1 }, true);

            expect(companyDocsRepo.find.calledWith({ where: { companyId: 1 } })).to.be.true();
        });

        it('returns zero total when no documents match filter', async () => {
            const { service, companyDocsRepo } = buildService();
            companyDocsRepo.find.resolves([]);

            const result = await service.syncCompanyDocumentsByFilter({ id: 9999 }, true);

            expect(result.total).to.equal(0);
        });

        it('processes matching documents and returns bulk result', async () => {
            const { service, companyDocsRepo } = buildService();
            companyDocsRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true },
                { id: 2, needsSyncSalesForce: true },
            ]);

            const result = await service.syncCompanyDocumentsByFilter({}, true);

            expect(result.total).to.equal(2);
        });
    });

    // ── syncLocationDocumentsByFilter ──────────────────────────────────────────
    describe('syncLocationDocumentsByFilter()', () => {
        it('fetches location docs using the provided where filter', async () => {
            const { service, locationDocsRepo } = buildService();
            locationDocsRepo.find.resolves([]);

            await service.syncLocationDocumentsByFilter({ companyId: 2 }, true);

            expect(locationDocsRepo.find.calledWith({ where: { companyId: 2 } })).to.be.true();
        });

        it('returns zero total when no location docs match filter', async () => {
            const { service, locationDocsRepo } = buildService();
            locationDocsRepo.find.resolves([]);

            const result = await service.syncLocationDocumentsByFilter({ id: 9999 }, true);

            expect(result.total).to.equal(0);
        });

        it('processes matching location documents', async () => {
            const { service, locationDocsRepo } = buildService();
            locationDocsRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true },
                { id: 2, needsSyncSalesForce: true },
            ]);

            const result = await service.syncLocationDocumentsByFilter({}, true);

            expect(result.total).to.equal(2);
        });
    });

    // ── syncCompanyUsersByFilter ───────────────────────────────────────────────
    describe('syncCompanyUsersByFilter()', () => {
        it('fetches only ACTIVE company users', async () => {
            const { service, companyUsersRepo } = buildService();
            companyUsersRepo.find.resolves([]);

            await service.syncCompanyUsersByFilter({ companyId: 1 }, true);

            const findCall = companyUsersRepo.find.firstCall;
            expect(findCall.args[0].where.status).to.equal('active');
        });

        it('returns zero total when no company users match', async () => {
            const { service, companyUsersRepo } = buildService();
            companyUsersRepo.find.resolves([]);

            const result = await service.syncCompanyUsersByFilter({ companyId: 9999 }, true);

            expect(result.total).to.equal(0);
        });

        it('processes matching active company users', async () => {
            const { service, companyUsersRepo } = buildService();
            companyUsersRepo.find.resolves([
                { id: 1, status: 'active', needsSyncSalesForce: true },
                { id: 2, status: 'active', needsSyncSalesForce: true },
            ]);

            const result = await service.syncCompanyUsersByFilter({}, true);

            expect(result.total).to.equal(2);
        });
    });

    // ── syncOffersByFilter ─────────────────────────────────────────────────────
    describe('syncOffersByFilter()', () => {
        it('fetches offers using the provided where filter', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.find.resolves([]);

            await service.syncOffersByFilter({ listingId: 5 }, true);

            expect(offersRepo.find.calledWith({ where: { listingId: 5 } })).to.be.true();
        });

        it('returns zero total when no offers match filter', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.find.resolves([]);

            const result = await service.syncOffersByFilter({ id: 9999 }, true);

            expect(result.total).to.equal(0);
        });

        it('processes matching offers and returns bulk result', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true },
                { id: 2, needsSyncSalesForce: true },
            ]);

            const result = await service.syncOffersByFilter({}, true);

            expect(result.total).to.equal(2);
        });
    });

    // ── cleanupPendingCompanyAccounts ──────────────────────────────────────────
    describe('cleanupPendingCompanyAccounts()', () => {
        it('returns zero found when no pending companies with SF IDs exist', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.find.resolves([]);

            const result = await service.cleanupPendingCompanyAccounts();

            expect(result.found).to.equal(0);
            expect(result.deleted).to.equal(0);
        });

        it('deletes SF accounts and clears sync fields for pending companies', async () => {
            const { service, companiesRepo, sfService } = buildService();
            companiesRepo.find.resolves([
                { id: 1, salesforceId: 'SF_ACC_001', status: 'pending', name: 'Pending Co' },
            ]);
            sfService.deleteRecord.resolves({ success: true });

            const result = await service.cleanupPendingCompanyAccounts();

            expect(result.found).to.equal(1);
            expect(result.deleted).to.equal(1);
            expect(sfService.deleteRecord.calledOnce).to.be.true();
            expect(companiesRepo.updateById.calledOnce).to.be.true();
        });

        it('increments failed count when SF delete fails', async () => {
            const { service, companiesRepo, sfService } = buildService();
            companiesRepo.find.resolves([
                { id: 1, salesforceId: 'SF_ACC_001', status: 'pending' },
            ]);
            sfService.deleteRecord.resolves({ success: false, error: 'DELETE_FAILED' });

            const result = await service.cleanupPendingCompanyAccounts();

            expect(result.found).to.equal(1);
            expect(result.failed).to.equal(1);
            expect(result.deleted).to.equal(0);
        });

        it('handles exception per company and increments failed count', async () => {
            const { service, companiesRepo, sfService } = buildService();
            companiesRepo.find.resolves([
                { id: 1, salesforceId: 'SF_ACC_001', status: 'pending' },
            ]);
            sfService.deleteRecord.rejects(new Error('SF_NETWORK_ERR'));

            const result = await service.cleanupPendingCompanyAccounts();

            expect(result.failed).to.equal(1);
        });

        it('skips companies without salesforceId', async () => {
            const { service, companiesRepo, sfService } = buildService();
            companiesRepo.find.resolves([
                { id: 1, salesforceId: null, status: 'pending' },
            ]);

            const result = await service.cleanupPendingCompanyAccounts();

            expect(result.found).to.equal(1);
            expect(sfService.deleteRecord.called).to.be.false();
        });

        it('throws when repo.find throws', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.find.rejects(new Error('DB_FATAL'));

            await expect(service.cleanupPendingCompanyAccounts()).to.be.rejectedWith(Error);
        });
    });

    // ── pullSingleHaulageOfferFromSalesforce ───────────────────────────────────
    describe('pullSingleHaulageOfferFromSalesforce()', () => {
        it('returns not-found error when haulage offer does not exist in WT', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.rejects(new Error('NOT_FOUND'));

            const result = await service.pullSingleHaulageOfferFromSalesforce(999);

            expect(result.success).to.be.false();
            expect(result.error).to.containEql('999');
        });

        it('returns not-found error when SF query returns no records', async () => {
            const { service, sfService } = buildService();
            sfService.query.resolves({ records: [] });

            const result = await service.pullSingleHaulageOfferFromSalesforce(1);

            expect(result.success).to.be.false();
            expect(result.error).to.containEql('1');
        });

        it('returns success with no changes when all SF fields match WT', async () => {
            const { service, sfService, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1,
                status: 'pending',
                notes: 'existing notes',
                numberOfLoads: 2,
            });
            sfService.query.resolves({
                records: [{
                    Id: 'SF_HO_001',
                    WasteTrade_Haulage_Offers_ID__c: 'DEV_1',
                }],
            });

            const result = await service.pullSingleHaulageOfferFromSalesforce(1);

            expect(result.success).to.be.true();
            expect((result as any).data?.message).to.equal('No changes detected');
        });

        it('updates WT record when SF status differs', async () => {
            const { service, sfService, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1,
                status: 'pending',
                notes: null,
                numberOfLoads: 2,
                customsFee: 0,
            });
            sfService.query.resolves({
                records: [{
                    Id: 'SF_HO_001',
                    WasteTrade_Haulage_Offers_ID__c: 'DEV_1',
                    haulier_listing_status__c: 'Approved',
                    LastModifiedDate: new Date().toISOString(),
                }],
            });

            const result = await service.pullSingleHaulageOfferFromSalesforce(1);

            expect(result.success).to.be.true();
            expect(haulageOffersRepo.updateById.called).to.be.true();
        });

        it('updates notes when SF notes differ from WT', async () => {
            const { service, sfService, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1,
                status: 'pending',
                notes: 'old notes',
                numberOfLoads: 2,
                customsFee: 0,
            });
            sfService.query.resolves({
                records: [{
                    Id: 'SF_HO_001',
                    WasteTrade_Haulage_Offers_ID__c: 'DEV_1',
                    haulage_notes__c: 'new notes from SF',
                    LastModifiedDate: new Date().toISOString(),
                }],
            });

            const result = await service.pullSingleHaulageOfferFromSalesforce(1);

            expect(result.success).to.be.true();
            expect(haulageOffersRepo.updateById.called).to.be.true();
        });

        it('returns failure on unexpected error', async () => {
            const { service, sfService } = buildService();
            sfService.query.rejects(new Error('SF_QUERY_FAILED'));

            const result = await service.pullSingleHaulageOfferFromSalesforce(1);

            expect(result.success).to.be.false();
        });
    });

    // ── pullLeadUpdatesFromSalesforce ──────────────────────────────────────────
    describe('pullLeadUpdatesFromSalesforce()', () => {
        it('returns zero updated when SF returns no lead records', async () => {
            const { service, sfService } = buildService();
            sfService.query.resolves({ records: [] });

            const result = await service.pullLeadUpdatesFromSalesforce();

            expect(result.updated).to.equal(0);
            expect(result.failed).to.equal(0);
        });

        it('skips record when WasteTrade_User_Id__c is missing', async () => {
            const { service, sfService } = buildService();
            sfService.query.resolves({
                records: [{ WasteTrade_User_Id__c: null, LastModifiedDate: new Date().toISOString() }],
            });

            const result = await service.pullLeadUpdatesFromSalesforce();

            expect(result.updated).to.equal(0);
        });

        it('skips record when user not found in WT', async () => {
            const { service, sfService, userRepo } = buildService();
            sfService.query.resolves({
                records: [{ WasteTrade_User_Id__c: 'DEV_1', LastModifiedDate: new Date().toISOString() }],
            });
            userRepo.findById.rejects(new Error('NOT_FOUND'));

            const result = await service.pullLeadUpdatesFromSalesforce();

            expect(result.updated).to.equal(0);
        });

        it('updates user when SF data differs from WT', async () => {
            const { service, sfService, userRepo } = buildService();
            sfService.query.resolves({
                records: [{
                    WasteTrade_User_Id__c: 'DEV_1',
                    FirstName: 'NewFirstName',
                    LastName: null,
                    Phone: null,
                    Email: null,
                    Id: 'SF_LEAD_001',
                    LastModifiedDate: new Date().toISOString(),
                }],
            });
            userRepo.findById.resolves({
                id: 1, firstName: 'OldFirstName', lastName: 'Doe',
                email: 'test@example.com', salesforceId: 'SF_LEAD_001',
                updatedAt: new Date('2020-01-01'),
            });

            const result = await service.pullLeadUpdatesFromSalesforce();

            expect(result.updated).to.equal(1);
            expect(userRepo.updateById.called).to.be.true();
        });

        it('increments failed when per-record error occurs', async () => {
            const { service, sfService, userRepo } = buildService();
            sfService.query.resolves({
                records: [{
                    WasteTrade_User_Id__c: 'DEV_1',
                    LastModifiedDate: new Date().toISOString(),
                    FirstName: 'Changed',
                    LastName: 'Name',
                    Email: 'changed@example.com',
                    Id: 'SF_NEW',
                }],
            });
            // findById succeeds but updateById throws
            userRepo.findById.resolves({
                id: 1, firstName: 'Diff', lastName: 'Doe',
                email: 'test@example.com', salesforceId: 'SF_OLD',
                updatedAt: new Date('2020-01-01'),
            });
            userRepo.updateById.rejects(new Error('UPDATE_ERR'));

            const result = await service.pullLeadUpdatesFromSalesforce();

            expect(result.failed).to.equal(1);
        });

        it('handles SF query failure gracefully and returns zero results', async () => {
            const { service, sfService } = buildService();
            sfService.query.rejects(new Error('SF_UNREACHABLE'));

            const result = await service.pullLeadUpdatesFromSalesforce();

            expect(result.updated).to.equal(0);
            expect(result.failed).to.equal(0);
        });
    });

    // ── pullUpdatesFromSalesforce ──────────────────────────────────────────────
    describe('pullUpdatesFromSalesforce()', () => {
        it('returns zero results when SF returns no records for any type', async () => {
            const { service, sfService } = buildService();
            sfService.query.resolves({ records: [] });

            const result = await service.pullUpdatesFromSalesforce();

            expect(result.accounts.updated).to.equal(0);
            expect(result.contacts.updated).to.equal(0);
            expect(result.haulageOffers.updated).to.equal(0);
            expect(result.leads.updated).to.equal(0);
        });

        it('handles SF account query failure gracefully', async () => {
            const { service, sfService } = buildService();
            let callCount = 0;
            sfService.query.callsFake(() => {
                callCount++;
                if (callCount === 1) throw new Error('SF_ACCOUNT_QUERY_FAIL');
                return Promise.resolve({ records: [] });
            });

            const result = await service.pullUpdatesFromSalesforce();

            expect(result.accounts.updated).to.equal(0);
        });

        it('updates account when SF name differs', async () => {
            const { service, sfService, companiesRepo } = buildService();
            const now = new Date();
            sfService.query.onFirstCall().resolves({
                records: [{
                    WasteTrade_Company_Id__c: 'DEV_1',
                    Name: 'New Company Name',
                    Phone: null, Website: null, BillingStreet: null,
                    BillingCity: null, BillingCountry: null,
                    BillingPostalCode: null, BillingState: null,
                    LastModifiedDate: now.toISOString(),
                }],
            });
            sfService.query.resolves({ records: [] });
            companiesRepo.findById.resolves({
                id: 1, name: 'Old Company Name', updatedAt: new Date('2020-01-01'),
            });

            const result = await service.pullUpdatesFromSalesforce();

            expect(result.accounts.updated).to.equal(1);
            expect(companiesRepo.updateById.called).to.be.true();
        });

        it('skips account record when WasteTrade_Company_Id__c is missing', async () => {
            const { service, sfService, companiesRepo } = buildService();
            sfService.query.onFirstCall().resolves({
                records: [{
                    WasteTrade_Company_Id__c: null,
                    Name: 'Some Co',
                    LastModifiedDate: new Date().toISOString(),
                }],
            });
            sfService.query.resolves({ records: [] });

            const result = await service.pullUpdatesFromSalesforce();

            expect(result.accounts.updated).to.equal(0);
            expect(companiesRepo.updateById.called).to.be.false();
        });

        it('runs forceAll mode without date filter', async () => {
            const { service, sfService } = buildService();
            sfService.query.resolves({ records: [] });

            await service.pullUpdatesFromSalesforce(0, true);

            expect(sfService.query.called).to.be.true();
        });
    });
});
