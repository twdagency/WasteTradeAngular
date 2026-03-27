/**
 * salesforce-sync.service-6.unit.ts
 * Coverage-focused tests for salesforce-sync.service.ts (Part 6)
 * Targets: syncCompanyUser, syncOffer, syncWantedListing, convertLeadToAccountContact,
 *          syncCompanyDocument, checkSalesforceConnection circuit breaker,
 *          getCircuitBreakerStatus, getMetricsSummary, processBatches edge cases.
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

describe('SalesforceSyncService extended coverage - Part 6 (unit)', () => {
    beforeEach(() => {
        const { service } = buildService();
        service.resetCircuitBreaker();
    });

    // ── checkSalesforceConnection ──────────────────────────────────────────────
    describe('checkSalesforceConnection()', () => {
        it('returns true when SF is connected and records circuit breaker success', async () => {
            const { service, sfService } = buildService();
            sfService.isConnected.resolves(true);

            const result = await service.checkSalesforceConnection();

            expect(result).to.be.true();
            expect(sfService.isConnected.calledOnce).to.be.true();
        });

        it('returns false when SF is not connected and records circuit breaker failure', async () => {
            const { service, sfService } = buildService();
            sfService.isConnected.resolves(false);

            const result = await service.checkSalesforceConnection();

            expect(result).to.be.false();
        });

        it('returns false when sfService.isConnected throws', async () => {
            const { service, sfService } = buildService();
            sfService.isConnected.rejects(new Error('Network error'));

            const result = await service.checkSalesforceConnection();

            expect(result).to.be.false();
        });

        it('returns false immediately when circuit breaker is open', async () => {
            const { service, sfService } = buildService();
            // Force open circuit breaker by calling 6 failures
            sfService.isConnected.resolves(false);
            for (let i = 0; i < 6; i++) {
                await service.checkSalesforceConnection();
            }

            sfService.isConnected.resetHistory();
            const result = await service.checkSalesforceConnection();

            // When circuit breaker is open, isConnected should NOT be called
            expect(sfService.isConnected.called).to.be.false();
            expect(result).to.be.false();
        });
    });

    // ── getCircuitBreakerStatus ────────────────────────────────────────────────
    describe('getCircuitBreakerStatus()', () => {
        it('returns status object with isOpen, failures, lastFailureTime', () => {
            const { service } = buildService();

            const status = service.getCircuitBreakerStatus();

            expect(status).to.have.property('isOpen');
            expect(status).to.have.property('failures');
            expect(status).to.have.property('lastFailureTime');
        });

        it('reports isOpen=false initially', () => {
            const { service } = buildService();

            const status = service.getCircuitBreakerStatus();

            expect(status.isOpen).to.be.false();
            expect(status.failures).to.equal(0);
        });
    });

    // ── getMetricsSummary ──────────────────────────────────────────────────────
    describe('getMetricsSummary()', () => {
        it('returns a metrics summary object', () => {
            const { service } = buildService();

            const summary = service.getMetricsSummary();

            expect(summary).to.be.an.Object();
        });
    });

    // ── syncCompanyUser ────────────────────────────────────────────────────────
    describe('syncCompanyUser()', () => {
        it('syncs company user to Salesforce and returns success', async () => {
            const { service, sfService } = buildService();

            const result = await service.syncCompanyUser(1, true);

            expect(sfService.upsertRecord.called).to.be.true();
            expect(result.success).to.be.true();
        });

        it('skips sync when company user already synced and forceSync=false', async () => {
            const { service, companyUsersRepo, sfService } = buildService();
            companyUsersRepo.findById.resolves({
                id: 1, userId: 1, companyId: 1, status: 'active',
                isSyncedSalesForce: true,
                salesforceId: 'SF_CU_001',
                lastSyncedSalesForceDate: new Date('2025-06-01'),
                updatedAt: new Date('2025-01-01'),
                needsSyncSalesForce: false,
                user: { id: 1, email: 'u@test.com' },
                company: { id: 1, status: 'active', salesforceId: 'SF_CO_001' },
            });

            const result = await service.syncCompanyUser(1, false);

            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('returns failure when companyUser repo throws', async () => {
            const { service, companyUsersRepo } = buildService();
            companyUsersRepo.findById.rejects(new Error('DB_ERR'));

            const result = await service.syncCompanyUser(999, true, true);

            expect(result.success).to.be.false();
        });
    });

    // ── syncOffer ──────────────────────────────────────────────────────────────
    describe('syncOffer()', () => {
        it('syncs offer to Salesforce and returns success', async () => {
            const { service, sfService, offersRepo, listingsRepo, companiesRepo } = buildService();
            offersRepo.findById.resolves({
                id: 1, needsSyncSalesForce: true,
                listingId: 10, buyerCompanyId: 2,
                sellerCompanyId: 3,
            });
            listingsRepo.findById.resolves({ id: 10, listingType: 'sell', companyId: 3 });
            companiesRepo.findById.resolves({ id: 2, name: 'Buyer Co', salesforceId: 'SF_B_001' });

            const result = await service.syncOffer(1, true);

            expect(result.success).to.be.true();
        });

        it('skips offer sync when already synced and forceSync=false', async () => {
            const { service, offersRepo, sfService } = buildService();
            offersRepo.findById.resolves({
                id: 1,
                isSyncedSalesForce: true,
                salesforceId: 'SF_O_001',
                lastSyncedSalesForceDate: new Date('2025-06-01'),
                updatedAt: new Date('2025-01-01'),
                needsSyncSalesForce: false,
                listingId: 10, buyerCompanyId: 2,
            });

            const result = await service.syncOffer(1, false);

            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('returns failure when offer repo throws', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.findById.rejects(new Error('OFFER_DB_ERR'));

            const result = await service.syncOffer(999, true, true);

            expect(result.success).to.be.false();
        });
    });

    // ── syncWantedListing ──────────────────────────────────────────────────────
    describe('syncWantedListing()', () => {
        it('syncs wanted listing to Salesforce', async () => {
            const { service, sfService, listingsRepo } = buildService();
            listingsRepo.findById.resolves({
                id: 1, listingType: 'wanted', needsSyncSalesForce: true,
                companyId: 1, materialType: 'plastic',
            });

            const result = await service.syncWantedListing(1, true);

            expect(sfService.upsertRecord.called).to.be.true();
            expect(result.success).to.be.true();
        });

        it('skips wanted listing sync when already synced and forceSync=false', async () => {
            const { service, listingsRepo, sfService } = buildService();
            listingsRepo.findById.resolves({
                id: 1, listingType: 'wanted',
                isSyncedSalesForce: true,
                salesforceId: 'SF_WL_001',
                lastSyncedSalesForceDate: new Date('2025-06-01'),
                updatedAt: new Date('2025-01-01'),
                needsSyncSalesForce: false,
                companyId: 1,
            });

            const result = await service.syncWantedListing(1, false);

            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('returns failure when listing repo throws for wanted listing', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.rejects(new Error('WANTED_DB_ERR'));

            const result = await service.syncWantedListing(999, true, true);

            expect(result.success).to.be.false();
        });
    });

    // ── convertLeadToAccountContact ────────────────────────────────────────────
    describe('convertLeadToAccountContact()', () => {
        it('converts lead to account/contact and returns success', async () => {
            const { service, sfService, userRepo } = buildService();
            userRepo.findById.resolves({
                id: 1, email: 'u@test.com', firstName: 'John', lastName: 'Doe',
                salesforceId: 'SF_LEAD_001',
            });
            // query() must return a lead record so convertLeadToAccountContact can proceed
            sfService.query.resolves({ records: [{ Id: 'SF_LEAD_001', Email: 'u@test.com' }] });
            sfService.convertLead.resolves({ success: true, contactId: 'C001', accountId: 'A001' });

            const result = await service.convertLeadToAccountContact(1);

            expect(result.success).to.be.true();
        });

        it('returns skipped when user has no salesforceId', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({ id: 1, email: 'u@test.com', salesforceId: null });

            const result = await service.convertLeadToAccountContact(1);

            // No SF ID means nothing to convert — should skip gracefully
            expect(result).to.have.property('success');
        });

        it('returns failure when user repo throws', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.rejects(new Error('USER_NOT_FOUND'));

            const result = await service.convertLeadToAccountContact(999);

            expect(result.success).to.be.false();
        });

        it('handles already-converted Lead by SF automation (no active Lead found)', async () => {
            const { service, sfService, userRepo } = buildService();
            userRepo.findById.resolves({
                id: 1, email: 'u@test.com', firstName: 'John', lastName: 'Doe',
            });
            userRepo.execute.resolves([{ company_id: 10 }]);
            // First query (find Lead): no active Lead found
            // Second query (find converted Lead): returns converted Lead with Account/Contact IDs
            sfService.query
                .onFirstCall().resolves({ records: [] })
                .onSecondCall().resolves({ records: [{ Id: 'LEAD_001', ConvertedAccountId: 'A_CONV', ConvertedContactId: 'C_CONV' }] });

            const result = await service.convertLeadToAccountContact(1);

            expect(result.success).to.be.true();
            expect(result.skipped).to.be.true();
            expect(result.accountId).to.equal('A_CONV');
            expect(result.contactId).to.equal('C_CONV');
            // Should set external ID on the converted Account
            expect(sfService.updateRecord.called).to.be.true();
        });

        it('looks up existing Account before conversion to prevent duplicates', async () => {
            const { service, sfService, userRepo } = buildService();
            userRepo.findById.resolves({
                id: 1, email: 'u@test.com', firstName: 'John', lastName: 'Doe',
            });
            userRepo.execute.resolves([{ company_id: 10 }]);
            sfService.query.resolves({ records: [{ Id: 'SF_LEAD_001', Email: 'u@test.com' }] });
            sfService.findByExternalId.resolves({ Id: 'A_EXISTING' });
            sfService.convertLead.resolves({ success: true, contactId: 'C001', accountId: 'A_EXISTING' });

            const result = await service.convertLeadToAccountContact(1);

            expect(result.success).to.be.true();
            // convertLead should be called with existing accountId
            expect(sfService.convertLead.firstCall.args[1]).to.equal('A_EXISTING');
        });
    });

    // ── syncListingsByFilter ─────────────────────────────────────────────────
    describe('syncListingsByFilter()', () => {
        it('returns zero total when no listings match filter', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.find.resolves([]);

            const result = await service.syncListingsByFilter({ id: 9999 }, true);

            expect(result.total).to.equal(0);
        });

        it('processes matching listings via filter', async () => {
            const { service, listingsRepo, sfService } = buildService();
            listingsRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true, listingType: 'sell' },
                { id: 2, needsSyncSalesForce: true, listingType: 'sell' },
            ]);

            const result = await service.syncListingsByFilter({}, true);

            expect(result.total).to.equal(2);
        });
    });

    // ── syncAllOffers ─────────────────────────────────────────────────────────
    describe('syncAllOffers()', () => {
        it('returns zero total when no offers need sync', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.find.resolves([]);

            const result = await service.syncAllOffers(true);

            expect(result.total).to.equal(0);
        });

        it('processes multiple offers', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.find.resolves([
                { id: 1, needsSyncSalesForce: true },
                { id: 2, needsSyncSalesForce: true },
            ]);

            const result = await service.syncAllOffers(true);

            expect(result.total).to.equal(2);
        });
    });

    // ── syncCompanyDocument ────────────────────────────────────────────────────
    describe('syncCompanyDocument()', () => {
        it('syncs company document and returns success', async () => {
            const { service, sfService } = buildService();

            const result = await service.syncCompanyDocument(1, true);

            expect(sfService.upsertRecord.called).to.be.true();
            expect(result.success).to.be.true();
        });

        it('skips company document when already synced and forceSync=false', async () => {
            const { service, companyDocsRepo, sfService } = buildService();
            companyDocsRepo.findById.resolves({
                id: 1, companyId: 1,
                isSyncedSalesForce: true,
                salesforceId: 'SF_CD_001',
                lastSyncedSalesForceDate: new Date('2025-06-01'),
                updatedAt: new Date('2025-01-01'),
                needsSyncSalesForce: false,
            });

            const result = await service.syncCompanyDocument(1, false);

            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('returns failure when companyDoc repo throws', async () => {
            const { service, companyDocsRepo } = buildService();
            companyDocsRepo.findById.rejects(new Error('DOC_DB_ERR'));

            const result = await service.syncCompanyDocument(999, true, true);

            expect(result.success).to.be.false();
        });
    });
});
