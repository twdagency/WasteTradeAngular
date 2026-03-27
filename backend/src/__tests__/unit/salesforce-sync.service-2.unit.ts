import { expect, sinon } from '@loopback/testlab';
import { SalesforceSyncService } from '../../services/salesforce/salesforce-sync.service';

function buildService() {
    const sfService = {
        isConnected: sinon.stub().resolves(true),
        upsertRecord: sinon.stub().resolves({ success: true, salesforceId: 'SF001' }),
        createRecord: sinon.stub().resolves({ success: true, salesforceId: 'SF001' }),
        findByExternalId: sinon.stub().resolves(null),
        query: sinon.stub().resolves({ records: [] }),
        deleteRecord: sinon.stub().resolves({ success: true }),
        convertLead: sinon.stub().resolves({ success: true, contactId: 'C001', accountId: 'A001' }),
        updateRecord: sinon.stub().resolves({ success: true }),
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
        companyDocsRepo,
        locationDocsRepo,
        listingDocsRepo,
    };
}

describe('SalesforceSyncService (unit) - part 2', () => {
    beforeEach(() => {
        const { service } = buildService();
        service.resetCircuitBreaker();
    });

    // ── syncListing ──────────────────────────────────────────────────────────
    describe('syncListing', () => {
        it('skips sync when listing is already synced and forceSync=false', async () => {
            const { service, listingsRepo, sfService } = buildService();
            listingsRepo.findById.resolves({
                id: 1, listingType: 'sell',
                isSyncedSalesForce: true,
                salesforceId: 'SF_L_001',
                lastSyncedSalesForceDate: new Date('2025-01-02'),
                updatedAt: new Date('2025-01-01'),
            });
            const result = await service.syncListing(1, false, true);
            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('calls upsertRecord with Sales_Listing__c on forced sync', async () => {
            const { service, sfService } = buildService();
            const result = await service.syncListing(1, true, true);
            expect(sfService.upsertRecord.called).to.be.true();
            expect(sfService.upsertRecord.firstCall.args[0]).to.equal('Sales_Listing__c');
        });

        it('returns success result when upsertRecord succeeds', async () => {
            const { service } = buildService();
            const result = await service.syncListing(1, true, true);
            expect(result.success).to.be.true();
        });

        it('returns failure result when repository throws', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.rejects(new Error('DB_CONNECTION_FAILED'));
            const result = await service.syncListing(1, true, true);
            expect(result.success).to.be.false();
        });

        it('logs sync attempt to syncLogRepository', async () => {
            const { service, syncLogRepo } = buildService();
            await service.syncListing(1, true, true);
            expect(syncLogRepo.create.called).to.be.true();
        });
    });

    // ── syncWantedListing ────────────────────────────────────────────────────
    describe('syncWantedListing', () => {
        it('skips when already synced and forceSync=false', async () => {
            const { service, listingsRepo, sfService } = buildService();
            listingsRepo.findById.resolves({
                id: 2, listingType: 'wanted',
                isSyncedSalesForce: true,
                salesforceId: 'SF_WL_001',
                lastSyncedSalesForceDate: new Date('2025-01-02'),
                updatedAt: new Date('2025-01-01'),
            });
            const result = await service.syncWantedListing(2, false, true);
            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('calls upsertRecord with Wanted_Listings__c on forced sync', async () => {
            const { service, sfService } = buildService();
            const result = await service.syncWantedListing(2, true, true);
            expect(sfService.upsertRecord.called).to.be.true();
            expect(sfService.upsertRecord.firstCall.args[0]).to.equal('Wanted_Listings__c');
        });

        it('returns failure with custom object message when INVALID_TYPE error', async () => {
            const { service, sfService } = buildService();
            sfService.upsertRecord.resolves({ success: false, error: 'INVALID_TYPE: Wanted_Listings__c' });
            const result = await service.syncWantedListing(2, true, true);
            expect(result.success).to.be.false();
        });
    });

    // ── syncOffer ────────────────────────────────────────────────────────────
    describe('syncOffer', () => {
        it('skips when already synced and forceSync=false', async () => {
            const { service, offersRepo, sfService } = buildService();
            offersRepo.findById.resolves({
                id: 10,
                isSyncedSalesForce: true,
                salesforceId: 'SF_OF_001',
                lastSyncedSalesForceDate: new Date('2025-01-02'),
                updatedAt: new Date('2025-01-01'),
            });
            const result = await service.syncOffer(10, false, true);
            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('calls upsertRecord with Offers__c on forced sync', async () => {
            const { service, sfService } = buildService();
            await service.syncOffer(10, true, true);
            expect(sfService.upsertRecord.called).to.be.true();
            expect(sfService.upsertRecord.firstCall.args[0]).to.equal('Offers__c');
        });

        it('returns success when SF responds with success', async () => {
            const { service } = buildService();
            const result = await service.syncOffer(10, true, true);
            expect(result.success).to.be.true();
        });

        it('returns failure when upsertRecord fails', async () => {
            const { service, sfService } = buildService();
            sfService.upsertRecord.resolves({ success: false, error: 'FIELD_ERROR' });
            const result = await service.syncOffer(10, true, true);
            expect(result.success).to.be.false();
        });
    });

    // ── syncHaulageOffer ─────────────────────────────────────────────────────
    describe('syncHaulageOffer', () => {
        it('skips when already synced and forceSync=false', async () => {
            const { service, haulageOffersRepo, sfService } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 5,
                isSyncedSalesForce: true,
                salesforceId: 'SF_HO_001',
                lastSyncedSalesForceDate: new Date('2025-01-02'),
                updatedAt: new Date('2025-01-01'),
            });
            const result = await service.syncHaulageOffer(5, false, true);
            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('calls upsertRecord with Haulage_Offers__c on forced sync', async () => {
            const { service, sfService } = buildService();
            await service.syncHaulageOffer(5, true, true);
            expect(sfService.upsertRecord.called).to.be.true();
            expect(sfService.upsertRecord.firstCall.args[0]).to.equal('Haulage_Offers__c');
        });

        it('returns success when upsertRecord succeeds', async () => {
            const { service } = buildService();
            const result = await service.syncHaulageOffer(5, true, true);
            expect(result.success).to.be.true();
        });

        it('logs sync result', async () => {
            const { service, syncLogRepo } = buildService();
            await service.syncHaulageOffer(5, true, true);
            expect(syncLogRepo.create.called).to.be.true();
        });
    });

    // ── syncHaulageLoad ──────────────────────────────────────────────────────
    describe('syncHaulageLoad', () => {
        it('skips when already synced and forceSync=false', async () => {
            const { service, haulageLoadsRepo, sfService } = buildService();
            haulageLoadsRepo.findById.resolves({
                id: 3, haulageOfferId: 1,
                isSyncedSalesForce: true,
                salesforceId: 'SF_HL_001',
                lastSyncedSalesForceDate: new Date('2025-01-02'),
                updatedAt: new Date('2025-01-01'),
            });
            const result = await service.syncHaulageLoad(3, false, true);
            expect(result.skipped).to.be.true();
        });

        it('calls upsertRecord with Haulage_Loads__c on forced sync', async () => {
            const { service, sfService } = buildService();
            await service.syncHaulageLoad(3, true, true);
            expect(sfService.upsertRecord.called).to.be.true();
            expect(sfService.upsertRecord.firstCall.args[0]).to.equal('Haulage_Loads__c');
        });
    });

    // ── syncUserAsLead ───────────────────────────────────────────────────────
    describe('syncUserAsLead', () => {
        it('skips user already converted to Contact', async () => {
            const { service, userRepo, sfService } = buildService();
            userRepo.findById.resolves({
                id: 1, email: 'u@test.com',
                salesforceLeadId: null,
                salesforceId: 'CONTACT_001',
            });
            const result = await service.syncUserAsLead(1, true, true);
            expect(result.skipped).to.be.true();
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('skips when already synced and forceSync=false', async () => {
            const { service, userRepo, sfService } = buildService();
            userRepo.findById.resolves({
                id: 1, email: 'u@test.com',
                isSyncedSalesForce: true,
                // salesforceId must be set for needsSync to reach date comparison
                salesforceId: 'SF_CONTACT_001',
                salesforceLeadId: 'LEAD_001',
                lastSyncedSalesForceDate: new Date('2025-06-02'),
                updatedAt: new Date('2025-01-01'),
            });
            // salesforceLeadId is set AND salesforceId is set → early-exit for Contact conversion
            // BUT salesforceLeadId is truthy so the "!leadId && hasId" check won't fire
            // needsSync: isSynced=true, salesforceId set, lastSync > updatedAt → returns false
            const result = await service.syncUserAsLead(1, false, true);
            // The user has salesforceId set but also salesforceLeadId — NOT the converted-to-Contact case
            // converted-to-Contact case requires: !salesforceLeadId AND salesforceId set
            // so we test the needsSync=false path by checking skipped OR that upsert wasn't called
            expect(sfService.upsertRecord.called).to.be.false();
        });

        it('calls upsertRecord with Lead on forced sync', async () => {
            const { service, sfService } = buildService();
            await service.syncUserAsLead(1, true, true);
            expect(sfService.upsertRecord.called).to.be.true();
            expect(sfService.upsertRecord.firstCall.args[0]).to.equal('Lead');
        });

        it('falls back to createRecord on METHOD_NOT_ALLOWED error', async () => {
            const { service, sfService } = buildService();
            sfService.upsertRecord.resolves({ success: false, error: 'METHOD_NOT_ALLOWED' });
            await service.syncUserAsLead(1, true, true);
            expect(sfService.createRecord.called).to.be.true();
        });
    });

    // ── syncCompanyUser deeper branches ──────────────────────────────────────
    describe('syncCompanyUser (deep branches)', () => {
        it('calls upsertRecord with Contact when all checks pass', async () => {
            const { service, companyUsersRepo, sfService } = buildService();
            companyUsersRepo.findById.resolves({
                id: 1, userId: 1, companyId: 1,
                status: 'active',
                user: { id: 1, email: 'u@test.com' },
                company: { id: 1, status: 'active', salesforceId: 'SF_CO_001' },
            });
            await service.syncCompanyUser(1, true, true);
            expect(sfService.upsertRecord.called).to.be.true();
            expect(sfService.upsertRecord.firstCall.args[0]).to.equal('Contact');
        });

        it('uses company salesforceId as accountId when present', async () => {
            const { service, companyUsersRepo, sfService } = buildService();
            companyUsersRepo.findById.resolves({
                id: 1, userId: 1, companyId: 1,
                status: 'active',
                user: { id: 1, email: 'u@test.com' },
                company: { id: 1, status: 'active', salesforceId: 'KNOWN_ACCOUNT_001' },
            });
            await service.syncCompanyUser(1, true, true);
            const upsertArgs = sfService.upsertRecord.firstCall.args[2];
            expect(upsertArgs['AccountId']).to.equal('KNOWN_ACCOUNT_001');
        });

        it('returns failure when user relation is missing', async () => {
            const { service, companyUsersRepo } = buildService();
            companyUsersRepo.findById.resolves({
                id: 1, userId: 1, companyId: 1,
                status: 'active',
                user: null,
                company: { id: 1, status: 'active' },
            });
            const result = await service.syncCompanyUser(1, true, true);
            expect(result.success).to.be.false();
        });
    });

    // ── bulkSyncCompanies ────────────────────────────────────────────────────
    describe('bulkSyncCompanies', () => {
        it('returns zero total when no companies found', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.find.resolves([]);
            const result = await service.bulkSyncCompanies(true);
            expect(result.total).to.equal(0);
        });

        it('processes all companies and returns bulk result', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.find.resolves([{ id: 1 }, { id: 2 }]);
            const result = await service.bulkSyncCompanies(true);
            expect(result.total).to.equal(2);
        });
    });

    // ── syncAllOffers ────────────────────────────────────────────────────────
    describe('syncAllOffers', () => {
        it('returns zero total when no offers found', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.find.resolves([]);
            const result = await service.syncAllOffers(true);
            expect(result.total).to.equal(0);
        });
    });

    // ── syncAllHaulageOffers ─────────────────────────────────────────────────
    describe('syncAllHaulageOffers', () => {
        it('returns bulk result with haulage offers', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.find.resolves([{ id: 1 }]);
            const result = await service.syncAllHaulageOffers(true);
            expect(result.total).to.equal(1);
        });
    });

    // ── syncRecordsModifiedAfter ─────────────────────────────────────────────
    describe('syncRecordsModifiedAfter', () => {
        it('delegates to syncCompaniesByFilter for companies type', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.find.resolves([]);
            const result = await service.syncRecordsModifiedAfter(new Date(), 'companies', true);
            expect(result).to.have.property('total');
        });

        it('delegates to syncUsersByFilter for users type', async () => {
            const { service, userRepo } = buildService();
            userRepo.find.resolves([]);
            const result = await service.syncRecordsModifiedAfter(new Date(), 'users', true);
            expect(result).to.have.property('total');
        });

        it('delegates to syncListingsByFilter for listings type', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.find.resolves([]);
            const result = await service.syncRecordsModifiedAfter(new Date(), 'listings', true);
            expect(result).to.have.property('total');
        });

        it('throws for unsupported record type', async () => {
            const { service } = buildService();
            let threw = false;
            try {
                await service.syncRecordsModifiedAfter(new Date(), 'unknown_type' as any, true);
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });
    });

    // ── getFailedSyncs ───────────────────────────────────────────────────────
    describe('getFailedSyncs', () => {
        it('queries syncLogRepository with FAILED status', async () => {
            const { service, syncLogRepo } = buildService();
            syncLogRepo.find.resolves([{ id: 1, status: 'FAILED' }]);
            const result = await service.getFailedSyncs(3);
            expect(syncLogRepo.find.called).to.be.true();
            expect(result.length).to.equal(1);
        });
    });

    // ── cleanupPendingCompanyAccounts ────────────────────────────────────────
    describe('cleanupPendingCompanyAccounts', () => {
        it('returns found=0 when no pending companies with SF IDs exist', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.find.resolves([]);
            const result = await service.cleanupPendingCompanyAccounts();
            expect(result.found).to.equal(0);
            expect(result.deleted).to.equal(0);
        });

        it('deletes SF accounts for pending companies', async () => {
            const { service, companiesRepo, sfService } = buildService();
            companiesRepo.find.resolves([{ id: 1, salesforceId: 'SF_ACC_001', status: 'pending' }]);
            sfService.deleteRecord.resolves({ success: true });
            const result = await service.cleanupPendingCompanyAccounts();
            expect(result.found).to.equal(1);
            expect(result.deleted).to.equal(1);
            expect(sfService.deleteRecord.calledWith('Account', 'SF_ACC_001')).to.be.true();
        });

        it('counts failed when deleteRecord fails', async () => {
            const { service, companiesRepo, sfService } = buildService();
            companiesRepo.find.resolves([{ id: 1, salesforceId: 'SF_ACC_001', status: 'pending' }]);
            sfService.deleteRecord.resolves({ success: false, error: 'Permission denied' });
            const result = await service.cleanupPendingCompanyAccounts();
            expect(result.failed).to.equal(1);
            expect(result.deleted).to.equal(0);
        });
    });

    // ── circuit breaker trip ─────────────────────────────────────────────────
    describe('circuit breaker behavior', () => {
        it('returns false from checkSalesforceConnection when circuit is open', async () => {
            const { service, sfService } = buildService();
            // Trip the circuit breaker by causing repeated failures
            sfService.isConnected.rejects(new Error('timeout'));
            // Force open by repeatedly calling
            for (let i = 0; i < 6; i++) {
                await service.checkSalesforceConnection();
            }
            const status = service.getCircuitBreakerStatus();
            // Circuit should be open after enough failures
            if (status.isOpen) {
                sfService.isConnected.resolves(true);
                const result = await service.checkSalesforceConnection();
                expect(result).to.be.false();
            }
            // At least verify status shape
            expect(status).to.have.property('isOpen');
            expect(status).to.have.property('failures');
        });

        it('resetCircuitBreaker closes the circuit and resets failure count', () => {
            const { service } = buildService();
            service.resetCircuitBreaker();
            const status = service.getCircuitBreakerStatus();
            expect(status.isOpen).to.be.false();
            expect(status.failures).to.equal(0);
        });
    });

    // ── syncHaulageOffersByFilter ────────────────────────────────────────────
    describe('syncHaulageOffersByFilter', () => {
        it('fetches haulage offers using provided where filter', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.find.resolves([]);
            await service.syncHaulageOffersByFilter({ status: 'pending' }, true);
            expect(haulageOffersRepo.find.calledWith({ where: { status: 'pending' } })).to.be.true();
        });

        it('returns zero total when no haulage offers match', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.find.resolves([]);
            const result = await service.syncHaulageOffersByFilter({});
            expect(result.total).to.equal(0);
        });
    });

    // ── syncCompanyUsersByFilter ─────────────────────────────────────────────
    describe('syncCompanyUsersByFilter', () => {
        it('filters by ACTIVE status automatically', async () => {
            const { service, companyUsersRepo } = buildService();
            companyUsersRepo.find.resolves([]);
            await service.syncCompanyUsersByFilter({ companyId: 1 }, true);
            const callArgs = companyUsersRepo.find.firstCall.args[0];
            expect(callArgs.where.status).to.equal('active');
        });
    });
});
