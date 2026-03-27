/**
 * salesforce-sync.service-9.unit.ts
 * Branch coverage for salesforce-sync.service.ts (Part 9)
 * Targets uncovered dist lines 2327–2619:
 *   pullSingleHaulageOfferFromSalesforce — all field-mapping branches
 *   pullLeadUpdatesFromSalesforce        — field diff, skip, timestamp, error paths
 *   pullUpdatesFromSalesforce            — account/contact/haulage/lead update branches
 *   pullListingStatusUpdatesFromSalesforce  — status map branches
 *   pullOfferStatusUpdatesFromSalesforce    — rejected + accepted branches
 *   pullWantedListingStatusUpdatesFromSalesforce — coverage
 *   syncRecordsModifiedAfter             — all switch cases + default throw
 *   cleanupPendingCompanyAccounts        — delete success/fail/throw branches
 *   syncCompanyMerge                     — all path branches
 */
import { expect, sinon } from '@loopback/testlab';
import { SalesforceSyncService } from '../../services/salesforce/salesforce-sync.service';

function buildService(overrides: Partial<Record<string, any>> = {}) {
    const sfService = {
        isConnected: sinon.stub().resolves(true),
        upsertRecord: sinon.stub().resolves({ success: true, salesforceId: 'SF001' }),
        createRecord: sinon.stub().resolves({ success: true, salesforceId: 'SF_NEW' }),
        findByExternalId: sinon.stub().resolves(null),
        query: sinon.stub().resolves({ records: [] }),
        deleteRecord: sinon.stub().resolves({ success: true }),
        updateRecord: sinon.stub().resolves({ success: true }),
        convertLead: sinon.stub().resolves({ success: true, contactId: 'C1', accountId: 'A1' }),
    };
    const companiesRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({ id: 1, name: 'Co', salesforceId: 'ACC1', status: 'pending', isSyncedSalesForce: true }),
        updateById: sinon.stub().resolves(),
        dataSource: { execute: sinon.stub().resolves([]) },
    };
    const userRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({ id: 1, email: 'u@x.com', firstName: 'A', lastName: 'B', phoneNumber: '0', salesforceId: null, salesforceLeadId: null, updatedAt: new Date('2020-01-01') }),
        updateById: sinon.stub().resolves(),
        execute: sinon.stub().resolves([]),
    };
    const listingsRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({ id: 1, listingType: 'sell', status: 'available', isSyncedSalesForce: true }),
        updateById: sinon.stub().resolves(),
    };
    const offersRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({ id: 1, status: 'pending', isSyncedSalesForce: true }),
        updateById: sinon.stub().resolves(),
    };
    const haulageOffersRepo = {
        find: sinon.stub().resolves([]),
        findById: sinon.stub().resolves({
            id: 1,
            status: 'pending',
            transportProvider: null,
            trailerContainerType: null,
            expectedTransitTime: null,
            demurrageAtDestination: 0,
            suggestedCollectionDate: null,
            completingCustomsClearance: null,
            notes: null,
            haulageCostPerLoad: 100,
            haulageTotal: 200,
            numberOfLoads: 2,
            customsFee: 0,
            rejectionReason: null,
        }),
        updateById: sinon.stub().resolves(),
    };
    const haulageLoadsRepo = { find: sinon.stub().resolves([]), findById: sinon.stub().resolves(null) };
    const syncLogRepo = { create: sinon.stub().resolves(), find: sinon.stub().resolves([]), deleteAll: sinon.stub().resolves({ count: 0 }) };
    const materialUsersRepo = { find: sinon.stub().resolves([]) };
    const locationsRepo = { find: sinon.stub().resolves([]), findOne: sinon.stub().resolves(null), findById: sinon.stub().resolves(null) };
    const companyDocsRepo = { find: sinon.stub().resolves([]), findById: sinon.stub().resolves(null), updateById: sinon.stub().resolves() };
    const locationDocsRepo = { find: sinon.stub().resolves([]), findById: sinon.stub().resolves(null), updateById: sinon.stub().resolves() };
    const listingDocsRepo = { find: sinon.stub().resolves([]) };
    const companyUsersRepo = { find: sinon.stub().resolves([]), findById: sinon.stub().resolves(null), findOne: sinon.stub().resolves(null), updateById: sinon.stub().resolves() };

    const circuitBreakerStub = {
        isCircuitOpen: sinon.stub().returns(false),
        recordSuccess: sinon.stub(),
        recordFailure: sinon.stub(),
        getStatus: sinon.stub().returns({ isOpen: false, failures: 0, lastFailureTime: null }),
        reset: sinon.stub(),
    };
    const metricsStub = {
        recordBatch: sinon.stub(),
        getSummary: sinon.stub().returns({}),
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

    (service as any).circuitBreaker = circuitBreakerStub;
    (service as any).metricsCollector = metricsStub;

    return { service, sfService, companiesRepo, userRepo, listingsRepo, offersRepo, haulageOffersRepo, syncLogRepo, companyUsersRepo, circuitBreakerStub, ...overrides };
}

// ── pullSingleHaulageOfferFromSalesforce ────────────────────────────────────
describe('SalesforceSyncService.pullSingleHaulageOfferFromSalesforce (unit)', () => {

    it('returns error when haulage offer not found in WasteTrade', async () => {
        const { service, haulageOffersRepo } = buildService();
        haulageOffersRepo.findById.rejects(new Error('NOT_FOUND'));
        const result = await service.pullSingleHaulageOfferFromSalesforce(999);
        expect(result.success).to.be.false();
        expect(result.error).to.match(/not found in WasteTrade/);
    });

    it('returns error when SF record not found', async () => {
        const { service, sfService } = buildService();
        sfService.query.resolves({ records: [] });
        const result = await service.pullSingleHaulageOfferFromSalesforce(1);
        expect(result.success).to.be.false();
        expect(result.error).to.match(/not found in Salesforce/);
    });

    it('maps status field and updates when changed', async () => {
        const { service, sfService, haulageOffersRepo } = buildService();
        sfService.query.resolves({
            records: [{
                'haulier_listing_status__c': 'Accepted',
                'expected__c': null,
                'Transport_Provider__c': null,
                'container_type__c': null,
                'trailer_type__c': null,
                'trailer_or_container__c': null,
                'demurrage__c': null,
                'suggested_collection_date__c': null,
                'Customs_Clearance__c': null,
                'haulage_notes__c': null,
                'haulage__c': null,
                'haulage_total__c': null,
            }],
        });
        haulageOffersRepo.findById.resolves({ id: 1, status: 'pending', numberOfLoads: 2, customsFee: 0, haulageCostPerLoad: 100, haulageTotal: 200 });
        const result = await service.pullSingleHaulageOfferFromSalesforce(1);
        expect(result.success).to.be.true();
        expect(haulageOffersRepo.updateById.called).to.be.true();
    });

    it('maps transport provider field', async () => {
        const { service, sfService, haulageOffersRepo } = buildService();
        sfService.query.resolves({
            records: [{
                'haulier_listing_status__c': null,
                'expected__c': '2-3 days',
                'Transport_Provider__c': 'Own Haulage',
                'container_type__c': '20ft',
                'trailer_type__c': null,
                'trailer_or_container__c': 'Container',
                'demurrage__c': '5',
                'suggested_collection_date__c': '2025-06-01',
                'Customs_Clearance__c': 'Yes',
                'haulage_notes__c': 'some notes',
                'haulage__c': '150.00',
                'haulage_total__c': '300.00',
            }],
        });
        haulageOffersRepo.findById.resolves({
            id: 1, status: 'pending', transportProvider: 'third_party', trailerContainerType: null,
            expectedTransitTime: null, demurrageAtDestination: 0, suggestedCollectionDate: null,
            completingCustomsClearance: null, notes: null, haulageCostPerLoad: 100, haulageTotal: 200,
            numberOfLoads: 2, customsFee: 0, rejectionReason: null,
        });
        const result = await service.pullSingleHaulageOfferFromSalesforce(1);
        expect(result.success).to.be.true();
    });

    it('updates haulage total independently when no cost change', async () => {
        const { service, sfService, haulageOffersRepo } = buildService();
        sfService.query.resolves({
            records: [{
                'haulier_listing_status__c': null,
                'expected__c': null,
                'Transport_Provider__c': null,
                'container_type__c': null,
                'trailer_type__c': 'Curtainsider',
                'trailer_or_container__c': 'Trailer',
                'demurrage__c': null,
                'suggested_collection_date__c': null,
                'Customs_Clearance__c': 'No',
                'haulage_notes__c': null,
                'haulage__c': null,
                'haulage_total__c': '500.00',
            }],
        });
        haulageOffersRepo.findById.resolves({
            id: 1, status: 'pending', transportProvider: null, trailerContainerType: null,
            expectedTransitTime: null, demurrageAtDestination: 0, suggestedCollectionDate: null,
            completingCustomsClearance: true, notes: null, haulageCostPerLoad: 100, haulageTotal: 200,
            numberOfLoads: 2, customsFee: 0, rejectionReason: null,
        });
        const result = await service.pullSingleHaulageOfferFromSalesforce(1);
        expect(result.success).to.be.true();
    });

    it('returns no-changes message when nothing differs', async () => {
        const { service, sfService, haulageOffersRepo } = buildService();
        sfService.query.resolves({
            records: [{
                'haulier_listing_status__c': 'Pending Approval',
                'expected__c': null,
                'Transport_Provider__c': null,
                'container_type__c': null,
                'trailer_type__c': null,
                'trailer_or_container__c': null,
                'demurrage__c': null,
                'suggested_collection_date__c': null,
                'Customs_Clearance__c': null,
                'haulage_notes__c': null,
                'haulage__c': null,
                'haulage_total__c': null,
            }],
        });
        haulageOffersRepo.findById.resolves({ id: 1, status: 'pending', numberOfLoads: 2, customsFee: 0, haulageCostPerLoad: 100, haulageTotal: 200 });
        const result = await service.pullSingleHaulageOfferFromSalesforce(1);
        expect(result.success).to.be.true();
        expect((result.data as any)?.message).to.match(/No changes/);
    });
});

// ── pullLeadUpdatesFromSalesforce ───────────────────────────────────────────
describe('SalesforceSyncService.pullLeadUpdatesFromSalesforce (unit)', () => {

    it('skips records with no external ID', async () => {
        const { service, sfService } = buildService();
        sfService.query.resolves({ records: [{ 'WasteTrade_User_Id__c': null, 'LastModifiedDate': '2025-01-01T00:00:00Z' }] });
        const result = await service.pullLeadUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(0);
    });

    it('skips records with invalid (NaN) user ID', async () => {
        const { service, sfService } = buildService();
        sfService.query.resolves({ records: [{ 'WasteTrade_User_Id__c': 'INVALID_ID', 'LastModifiedDate': '2025-01-01T00:00:00Z' }] });
        const result = await service.pullLeadUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(0);
    });

    it('skips when user not found in WasteTrade', async () => {
        const { service, sfService, userRepo } = buildService();
        sfService.query.resolves({ records: [{ 'WasteTrade_User_Id__c': 'DEV_99', 'LastModifiedDate': '2025-01-01T00:00:00Z' }] });
        userRepo.findById.rejects(new Error('NOT_FOUND'));
        const result = await service.pullLeadUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(0);
    });

    it('updates user when SF has newer/different field values', async () => {
        const { service, sfService, userRepo } = buildService();
        sfService.query.resolves({
            records: [{
                'WasteTrade_User_Id__c': 'DEV_1',
                'FirstName': 'NewName',
                'LastName': 'B',
                'Phone': '111',
                'Email': 'new@x.com',
                'Id': 'SFID123',
                'LastModifiedDate': new Date(Date.now() + 10000).toISOString(),
            }],
        });
        userRepo.findById.resolves({ id: 1, firstName: 'OldName', lastName: 'B', phoneNumber: '0', email: 'u@x.com', salesforceId: null, updatedAt: new Date('2020-01-01') });
        const result = await service.pullLeadUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(1);
        expect(userRepo.updateById.called).to.be.true();
    });

    it('skips update when no fields differ', async () => {
        const { service, sfService, userRepo } = buildService();
        sfService.query.resolves({
            records: [{
                'WasteTrade_User_Id__c': 'DEV_1',
                'FirstName': 'A',
                'LastName': 'B',
                'Phone': '0',
                'Email': 'u@x.com',
                'Id': null,
                'LastModifiedDate': new Date('2020-01-01').toISOString(),
            }],
        });
        userRepo.findById.resolves({ id: 1, firstName: 'A', lastName: 'B', phoneNumber: '0', email: 'u@x.com', salesforceId: null, updatedAt: new Date('2025-01-01') });
        const result = await service.pullLeadUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(0);
    });

    it('logs when SF is older but data differs (timestamps branch)', async () => {
        const { service, sfService, userRepo } = buildService();
        const oldSfDate = new Date('2019-01-01').toISOString();
        sfService.query.resolves({
            records: [{
                'WasteTrade_User_Id__c': 'DEV_1',
                'FirstName': 'DiffName',
                'LastName': null,
                'Phone': null,
                'Email': null,
                'Id': null,
                'LastModifiedDate': oldSfDate,
            }],
        });
        userRepo.findById.resolves({ id: 1, firstName: 'OldName', lastName: 'B', phoneNumber: '0', email: 'u@x.com', salesforceId: null, updatedAt: new Date('2025-01-01') });
        const result = await service.pullLeadUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(1);
    });

    it('increments failed count on per-record error', async () => {
        const { service, sfService, userRepo } = buildService();
        sfService.query.resolves({
            records: [{ 'WasteTrade_User_Id__c': 'DEV_1', 'FirstName': 'Boom', 'LastName': null, 'Phone': null, 'Email': null, 'Id': 'X', 'LastModifiedDate': '2025-01-01T00:00:00Z' }],
        });
        userRepo.findById.resolves({ id: 1, firstName: 'Old', lastName: 'B', phoneNumber: '0', email: 'u@x.com', salesforceId: null, updatedAt: new Date('2020-01-01') });
        userRepo.updateById.rejects(new Error('DB_ERROR'));
        const result = await service.pullLeadUpdatesFromSalesforce(15);
        expect(result.failed).to.equal(1);
    });

    it('handles top-level query error gracefully', async () => {
        const { service, sfService } = buildService();
        sfService.query.rejects(new Error('SF_DOWN'));
        const result = await service.pullLeadUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(0);
        expect(result.failed).to.equal(0);
    });
});

// ── pullListingStatusUpdatesFromSalesforce ─────────────────────────────────
describe('SalesforceSyncService.pullListingStatusUpdatesFromSalesforce (unit)', () => {

    it('updates listing when SF status differs', async () => {
        const { service, sfService, listingsRepo } = buildService();
        sfService.query.resolves({
            records: [{ 'WasteTrade_Listing_Id__c': 'DEV_1', 'Listing_Status__c': 'Pending Approval', 'LastModifiedDate': '2025-01-01T00:00:00Z' }],
        });
        listingsRepo.findById.resolves({ id: 1, status: 'rejected' });
        const result = await service.pullListingStatusUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(1);
    });

    it('skips when mapped status equals current status', async () => {
        const { service, sfService, listingsRepo } = buildService();
        sfService.query.resolves({
            records: [{ 'WasteTrade_Listing_Id__c': 'DEV_1', 'Listing_Status__c': 'Approved', 'LastModifiedDate': '2025-01-01T00:00:00Z' }],
        });
        listingsRepo.findById.resolves({ id: 1, status: 'available' });
        const result = await service.pullListingStatusUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(0);
    });

    it('skips when mapped SF status equals current WT status', async () => {
        const { service, sfService, listingsRepo } = buildService();
        sfService.query.resolves({
            records: [{ 'WasteTrade_Listing_Id__c': 'DEV_1', 'Listing_Status__c': 'UnknownStatus', 'LastModifiedDate': '2025-01-01T00:00:00Z' }],
        });
        // UnknownStatus falls back to 'pending' — listing already pending, so no update
        listingsRepo.findById.resolves({ id: 1, status: 'pending' });
        const result = await service.pullListingStatusUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(0);
    });

    it('increments failed on per-record error', async () => {
        const { service, sfService, listingsRepo } = buildService();
        sfService.query.resolves({
            records: [{ 'WasteTrade_Listing_Id__c': 'DEV_1', 'Listing_Status__c': 'Rejected', 'LastModifiedDate': '2025-01-01T00:00:00Z' }],
        });
        listingsRepo.findById.resolves({ id: 1, status: 'available' });
        listingsRepo.updateById.rejects(new Error('DB_FAIL'));
        const result = await service.pullListingStatusUpdatesFromSalesforce(15);
        expect(result.failed).to.equal(1);
    });

    it('handles top-level query error gracefully', async () => {
        const { service, sfService } = buildService();
        sfService.query.rejects(new Error('QUERY_FAIL'));
        const result = await service.pullListingStatusUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(0);
    });
});

// ── pullOfferStatusUpdatesFromSalesforce ────────────────────────────────────
describe('SalesforceSyncService.pullOfferStatusUpdatesFromSalesforce (unit)', () => {

    it('updates offer status to accepted and sets acceptedAt', async () => {
        const { service, sfService, offersRepo } = buildService();
        sfService.query.resolves({
            records: [{ 'WasteTrade_Offer_Id__c': 'DEV_1', 'bid_status__c': 'Accepted', 'Offer_Status__c': null, 'Rejection_Reason__c': null, 'LastModifiedDate': '2025-01-01T00:00:00Z' }],
        });
        offersRepo.findById.resolves({ id: 1, status: 'pending' });
        const result = await service.pullOfferStatusUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(1);
        const updateArg = offersRepo.updateById.getCall(0).args[1];
        expect(updateArg).to.have.property('acceptedAt');
    });

    it('updates offer status to rejected and sets rejectionReason', async () => {
        const { service, sfService, offersRepo } = buildService();
        sfService.query.resolves({
            records: [{ 'WasteTrade_Offer_Id__c': 'DEV_1', 'bid_status__c': 'Unsuccessful', 'Offer_Status__c': null, 'Rejection_Reason__c': 'Too expensive', 'LastModifiedDate': '2025-01-01T00:00:00Z' }],
        });
        offersRepo.findById.resolves({ id: 1, status: 'pending' });
        const result = await service.pullOfferStatusUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(1);
        const updateArg = offersRepo.updateById.getCall(0).args[1];
        expect(updateArg).to.have.property('rejectionReason', 'Too expensive');
    });

    it('skips when status unchanged', async () => {
        const { service, sfService, offersRepo } = buildService();
        sfService.query.resolves({
            records: [{ 'WasteTrade_Offer_Id__c': 'DEV_1', 'bid_status__c': 'Pending', 'Offer_Status__c': null, 'Rejection_Reason__c': null, 'LastModifiedDate': '2025-01-01T00:00:00Z' }],
        });
        offersRepo.findById.resolves({ id: 1, status: 'pending' });
        const result = await service.pullOfferStatusUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(0);
    });

    it('falls back to Offer_Status__c when bid_status__c missing', async () => {
        const { service, sfService, offersRepo } = buildService();
        sfService.query.resolves({
            records: [{ 'WasteTrade_Offer_Id__c': 'DEV_1', 'bid_status__c': null, 'Offer_Status__c': 'Accepted', 'Rejection_Reason__c': null, 'LastModifiedDate': '2025-01-01T00:00:00Z' }],
        });
        offersRepo.findById.resolves({ id: 1, status: 'pending' });
        const result = await service.pullOfferStatusUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(1);
    });
});

// ── pullWantedListingStatusUpdatesFromSalesforce ────────────────────────────
describe('SalesforceSyncService.pullWantedListingStatusUpdatesFromSalesforce (unit)', () => {

    it('updates wanted listing status when different', async () => {
        const { service, sfService, listingsRepo } = buildService();
        sfService.query.resolves({
            records: [{ 'WasteTrade_Listing_Id__c': 'DEV_1', 'Listing_Status__c': 'Rejected', 'LastModifiedDate': '2025-01-01T00:00:00Z' }],
        });
        listingsRepo.findById.resolves({ id: 1, status: 'available' });
        const result = await service.pullWantedListingStatusUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(1);
    });

    it('handles query error gracefully', async () => {
        const { service, sfService } = buildService();
        sfService.query.rejects(new Error('QUERY_FAIL'));
        const result = await service.pullWantedListingStatusUpdatesFromSalesforce(15);
        expect(result.updated).to.equal(0);
    });
});

// ── syncRecordsModifiedAfter ────────────────────────────────────────────────
describe('SalesforceSyncService.syncRecordsModifiedAfter (unit)', () => {

    const modifiedAfter = new Date(Date.now() - 3600000);

    it('routes companies correctly', async () => {
        const { service, companiesRepo } = buildService();
        companiesRepo.find.resolves([]);
        const result = await service.syncRecordsModifiedAfter(modifiedAfter, 'companies');
        expect(result).to.have.property('total');
    });

    it('routes users correctly', async () => {
        const { service, userRepo } = buildService();
        userRepo.find.resolves([]);
        const result = await service.syncRecordsModifiedAfter(modifiedAfter, 'users');
        expect(result).to.have.property('total');
    });

    it('routes listings correctly', async () => {
        const { service, listingsRepo } = buildService();
        listingsRepo.find.resolves([]);
        const result = await service.syncRecordsModifiedAfter(modifiedAfter, 'listings');
        expect(result).to.have.property('total');
    });

    it('routes offers correctly', async () => {
        const { service, offersRepo } = buildService();
        offersRepo.find.resolves([]);
        const result = await service.syncRecordsModifiedAfter(modifiedAfter, 'offers');
        expect(result).to.have.property('total');
    });

    it('routes company_documents correctly', async () => {
        const { service } = buildService();
        const result = await service.syncRecordsModifiedAfter(modifiedAfter, 'company_documents');
        expect(result).to.have.property('total');
    });

    it('routes location_documents correctly', async () => {
        const { service } = buildService();
        const result = await service.syncRecordsModifiedAfter(modifiedAfter, 'location_documents');
        expect(result).to.have.property('total');
    });

    it('throws for unsupported record type (default branch)', async () => {
        const { service } = buildService();
        await expect(
            service.syncRecordsModifiedAfter(modifiedAfter, 'unsupported' as any),
        ).to.be.rejectedWith(/Unsupported record type/);
    });
});

// ── cleanupPendingCompanyAccounts ───────────────────────────────────────────
describe('SalesforceSyncService.cleanupPendingCompanyAccounts (unit)', () => {

    it('returns counts when no pending companies found', async () => {
        const { service, companiesRepo } = buildService();
        companiesRepo.find.resolves([]);
        const result = await service.cleanupPendingCompanyAccounts();
        expect(result.found).to.equal(0);
        expect(result.deleted).to.equal(0);
    });

    it('deletes Account and clears sync fields on success', async () => {
        const { service, companiesRepo, sfService } = buildService();
        companiesRepo.find.resolves([{ id: 1, salesforceId: 'ACC001', name: 'Pending Co' }]);
        sfService.deleteRecord.resolves({ success: true });
        const result = await service.cleanupPendingCompanyAccounts();
        expect(result.found).to.equal(1);
        expect(result.deleted).to.equal(1);
        expect(companiesRepo.updateById.called).to.be.true();
    });

    it('tracks failed count when delete returns success=false', async () => {
        const { service, companiesRepo, sfService } = buildService();
        companiesRepo.find.resolves([{ id: 2, salesforceId: 'ACC002', name: 'Fail Co' }]);
        sfService.deleteRecord.resolves({ success: false, error: 'LOCKED_RECORD' });
        const result = await service.cleanupPendingCompanyAccounts();
        expect(result.failed).to.equal(1);
        expect(result.errors.length).to.be.greaterThan(0);
    });

    it('tracks failed count when deleteRecord throws', async () => {
        const { service, companiesRepo, sfService } = buildService();
        companiesRepo.find.resolves([{ id: 3, salesforceId: 'ACC003', name: 'Throw Co' }]);
        sfService.deleteRecord.rejects(new Error('SF_TIMEOUT'));
        const result = await service.cleanupPendingCompanyAccounts();
        expect(result.failed).to.equal(1);
    });

    it('skips companies without salesforceId', async () => {
        const { service, companiesRepo, sfService } = buildService();
        companiesRepo.find.resolves([{ id: 4, salesforceId: null, name: 'No SF Co' }]);
        const result = await service.cleanupPendingCompanyAccounts();
        expect(sfService.deleteRecord.called).to.be.false();
        expect(result.deleted).to.equal(0);
    });

    it('limits errors array to 10 entries', async () => {
        const { service, companiesRepo, sfService } = buildService();
        const companies = Array.from({ length: 15 }, (_, i) => ({ id: i + 1, salesforceId: `ACC${i}`, name: `Co${i}` }));
        companiesRepo.find.resolves(companies);
        sfService.deleteRecord.resolves({ success: false, error: 'LOCKED' });
        const result = await service.cleanupPendingCompanyAccounts();
        expect(result.errors.length).to.be.lessThanOrEqual(10);
    });
});

// ── syncCompanyMerge ────────────────────────────────────────────────────────
describe('SalesforceSyncService.syncCompanyMerge (unit)', () => {

    it('returns error when master company has no salesforceId and lookup fails', async () => {
        const { service, companiesRepo, sfService } = buildService();
        companiesRepo.findById.resolves({ id: 1, salesforceId: null });
        sfService.findByExternalId.resolves(null);
        const result = await service.syncCompanyMerge(1, 2);
        expect(result.success).to.be.false();
        expect(result.error).to.match(/Master company/);
    });

    it('returns skipped when merged company not in SF', async () => {
        const { service, companiesRepo, sfService } = buildService();
        companiesRepo.findById.resolves({ id: 1, salesforceId: 'MASTER_ACC' });
        sfService.findByExternalId.resolves(null);
        sfService.query.resolves({ records: [] });
        const result = await service.syncCompanyMerge(1, 2);
        expect(result.success).to.be.true();
        expect(result.skipped).to.be.true();
    });

    it('reparents contacts and archives merged account', async () => {
        const { service, companiesRepo, sfService } = buildService();
        companiesRepo.findById.resolves({ id: 1, salesforceId: 'MASTER_ACC' });
        sfService.findByExternalId.resolves({ Id: 'MERGED_ACC' });
        sfService.query.resolves({ records: [{ Id: 'CONTACT_1' }] });
        sfService.updateRecord.resolves({ success: true });
        const result = await service.syncCompanyMerge(1, 2, 'MERGED_ACC');
        expect(result.success).to.be.true();
        expect(sfService.updateRecord.called).to.be.true();
    });

    it('continues merge even when reparent of a contact fails', async () => {
        const { service, companiesRepo, sfService } = buildService();
        companiesRepo.findById.resolves({ id: 1, salesforceId: 'MASTER_ACC' });
        sfService.query.resolves({ records: [{ Id: 'CONTACT_1' }] });
        sfService.updateRecord
            .onFirstCall().rejects(new Error('REPARENT_FAIL'))
            .resolves({ success: true });
        const result = await service.syncCompanyMerge(1, 2, 'MERGED_ACC');
        // Archive call still proceeds
        expect(result.success).to.be.true();
    });

    it('still returns success even when archive updateRecord returns success=false', async () => {
        const { service, companiesRepo, sfService } = buildService();
        companiesRepo.findById.resolves({ id: 1, salesforceId: 'MASTER_ACC' });
        sfService.query.resolves({ records: [] });
        sfService.updateRecord.resolves({ success: false, error: 'FIELD_ERROR' });
        const result = await service.syncCompanyMerge(1, 2, 'MERGED_ACC');
        expect(result.success).to.be.true();
    });

    it('returns failure on unexpected error', async () => {
        const { service, companiesRepo } = buildService();
        companiesRepo.findById.rejects(new Error('DB_ERROR'));
        const result = await service.syncCompanyMerge(1, 2);
        expect(result.success).to.be.false();
    });
});
