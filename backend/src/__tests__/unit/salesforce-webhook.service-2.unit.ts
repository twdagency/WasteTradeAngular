import { expect, sinon } from '@loopback/testlab';
import { SalesforceWebhookService } from '../../services/salesforce/salesforce-webhook.service';
import { UserStatus } from '../../enum/user.enum';
import { CompanyStatus } from '../../enum/company.enum';
import { CompanyUserStatusEnum } from '../../enum/company-users.enum';
import { HaulageOfferStatus } from '../../enum/haulage-offer.enum';
import { ListingStatus } from '../../enum/listing.enum';
import { OfferStatusEnum } from '../../enum/offer.enum';

const FUTURE = new Date(Date.now() + 60_000).toISOString();
const PAST = new Date('2020-01-01').toISOString();

function buildService() {
    const haulageOffersRepo = {
        findById: sinon.stub().resolves({
            id: 1,
            status: HaulageOfferStatus.PENDING,
            numberOfLoads: 3,
            updatedAt: new Date(PAST),
        }),
        findOne: sinon.stub().resolves(null),
        updateById: sinon.stub().resolves(),
        find: sinon.stub().resolves([]),
    };
    const haulageOfferDocsRepo = {
        findOne: sinon.stub().resolves(null),
        create: sinon.stub().resolves({ id: 1 }),
        find: sinon.stub().resolves([]),
        deleteById: sinon.stub().resolves(),
    };
    const companiesRepo = {
        findById: sinon.stub().resolves({
            id: 1,
            name: 'ACME',
            status: CompanyStatus.PENDING,
            updatedAt: new Date(PAST),
        }),
        find: sinon.stub().resolves([]),
        updateById: sinon.stub().resolves(),
    };
    const userRepo = {
        findById: sinon.stub().resolves({
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'j@test.com',
            status: UserStatus.PENDING,
            updatedAt: new Date(PAST),
        }),
        updateById: sinon.stub().resolves(),
        find: sinon.stub().resolves([]),
    };
    const companyUsersRepo = {
        findOne: sinon.stub().resolves({
            id: 10,
            userId: 1,
            companyId: 1,
            status: CompanyUserStatusEnum.PENDING,
            isPrimaryContact: false,
        }),
        findById: sinon.stub().resolves({ id: 10 }),
        find: sinon.stub().resolves([]),
        updateById: sinon.stub().resolves(),
        updateAll: sinon.stub().resolves({ count: 1 }),
    };
    const syncLogRepo = {
        create: sinon.stub().resolves({ id: 1 }),
        find: sinon.stub().resolves([]),
    };
    const haulageLoadsRepo = {
        findById: sinon.stub().resolves({ id: 1, haulageOfferId: 1, updatedAt: new Date(PAST) }),
        find: sinon.stub().resolves([]),
        updateById: sinon.stub().resolves(),
        count: sinon.stub().resolves({ count: 1 }),
    };
    const companyDocsRepo = {
        updateAll: sinon.stub().resolves({ count: 1 }),
    };
    const locationDocsRepo = {
        updateAll: sinon.stub().resolves({ count: 1 }),
    };
    const locationsRepo = {
        find: sinon.stub().resolves([]),
        findOne: sinon.stub().resolves(null),
    };
    const listingsRepo = {
        findById: sinon.stub().resolves({
            id: 1,
            status: ListingStatus.AVAILABLE,
            updatedAt: new Date(PAST),
        }),
        find: sinon.stub().resolves([]),
        updateById: sinon.stub().resolves(),
    };
    const offersRepo = {
        findById: sinon.stub().resolves({
            id: 1,
            status: OfferStatusEnum.PENDING,
            updatedAt: new Date(PAST),
        }),
        find: sinon.stub().resolves([]),
        updateById: sinon.stub().resolves(),
    };
    const emailService = {
        sendAccountVerificationApprovedEmail: sinon.stub().resolves(),
        sendCompanyRequestInformationEmail: sinon.stub().resolves(),
        sendAccountVerificationRejectedEmail: sinon.stub().resolves(),
        sendCompanyRejectedEmail: sinon.stub().resolves(),
    };
    const notifService = {
        createNotification: sinon.stub().resolves(),
    };

    const service = new SalesforceWebhookService(
        haulageOffersRepo as any,
        haulageOfferDocsRepo as any,
        companiesRepo as any,
        userRepo as any,
        companyUsersRepo as any,
        syncLogRepo as any,
        haulageLoadsRepo as any,
        companyDocsRepo as any,
        locationDocsRepo as any,
        locationsRepo as any,
        listingsRepo as any,
        offersRepo as any,
        emailService as any,
        notifService as any,
        undefined,
    );

    return {
        service,
        haulageOffersRepo,
        haulageOfferDocsRepo,
        companiesRepo,
        userRepo,
        companyUsersRepo,
        syncLogRepo,
        haulageLoadsRepo,
        companyDocsRepo,
        locationDocsRepo,
        locationsRepo,
        listingsRepo,
        offersRepo,
        emailService,
        notifService,
    };
}

describe('SalesforceWebhookService (unit) - part 2', () => {

    // ── processHaulageOfferStatusUpdate ─────────────────────────────────────
    describe('processHaulageOfferStatusUpdate', () => {
        it('ignores updates with WT_ origin marker', async () => {
            const { service } = buildService();
            const result = await service.processHaulageOfferStatusUpdate({
                haulageOfferId: 1,
                status: 'Approved',
                updatedAt: FUTURE,
                originMarker: 'WT_DEV',
            });
            expect(result.success).to.be.true();
            expect(result.reason).to.equal('loop_prevention');
        });

        it('returns stale_event when SF timestamp is not newer', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1, status: HaulageOfferStatus.PENDING, numberOfLoads: 2, updatedAt: new Date(FUTURE),
            });
            const result = await service.processHaulageOfferStatusUpdate({
                haulageOfferId: 1,
                status: 'Approved',
                updatedAt: PAST,
            });
            expect(result.success).to.be.false();
            expect(result.reason).to.equal('stale_event');
        });

        it('returns salesforce_id_mismatch when salesforceId differs', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1,
                status: HaulageOfferStatus.PENDING,
                numberOfLoads: 2,
                salesforceId: 'SF_HO_001',
                updatedAt: new Date(PAST),
            });
            const result = await service.processHaulageOfferStatusUpdate({
                haulageOfferId: 1,
                status: 'Approved',
                salesforceId: 'DIFFERENT_ID',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.false();
            expect(result.reason).to.equal('salesforce_id_mismatch');
        });

        it('returns invalid_status for SF value not in HaulageOfferStatus enum', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1, status: HaulageOfferStatus.PENDING, numberOfLoads: 2, updatedAt: new Date(PAST),
            });
            // Mapper returns raw string when not in map — 'UnknownStatus123' is not in enum
            const result = await service.processHaulageOfferStatusUpdate({
                haulageOfferId: 1,
                status: 'UnknownStatus123',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.false();
            expect(result.reason).to.equal('invalid_status');
        });

        it('updates haulage offer with valid status Approved', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1, status: HaulageOfferStatus.PENDING, numberOfLoads: 2, updatedAt: new Date(PAST),
            });
            const result = await service.processHaulageOfferStatusUpdate({
                haulageOfferId: 1,
                status: 'Approved',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(result.updated).to.be.true();
            expect(haulageOffersRepo.updateById.called).to.be.true();
        });

        it('returns invalid_state_transition for SHIPPED→APPROVED (back-transition)', async () => {
            const { service, haulageOffersRepo } = buildService();
            // SHIPPED status cannot transition back to APPROVED (pending)
            haulageOffersRepo.findById.resolves({
                id: 1, status: HaulageOfferStatus.SHIPPED, numberOfLoads: 2, updatedAt: new Date(PAST),
            });
            // 'Pending Approval' maps inbound to 'pending' which IS in enum
            // but SHIPPED→pending is an invalid transition
            const result = await service.processHaulageOfferStatusUpdate({
                haulageOfferId: 1,
                status: 'Pending Approval',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.false();
            expect(result.reason).to.equal('invalid_state_transition');
        });

        it('maps optional fields (rejectionReason, adminMessage) into update data', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1, status: HaulageOfferStatus.PENDING, numberOfLoads: 2, updatedAt: new Date(PAST),
            });
            const result = await service.processHaulageOfferStatusUpdate({
                haulageOfferId: 1,
                status: 'Rejected',
                rejectionReason: 'Pricing issue',
                adminMessage: 'Please resubmit',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            const updateCall = haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateCall.rejectionReason).to.equal('Pricing issue');
            expect(updateCall.adminMessage).to.equal('Please resubmit');
        });

        it('logs inbound operation to syncLogRepository', async () => {
            const { service, syncLogRepo, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1, status: HaulageOfferStatus.PENDING, numberOfLoads: 2, updatedAt: new Date(PAST),
            });
            await service.processHaulageOfferStatusUpdate({
                haulageOfferId: 1,
                status: 'Approved',
                updatedAt: FUTURE,
            });
            expect(syncLogRepo.create.called).to.be.true();
        });
    });

    // ── processContactUpdate ─────────────────────────────────────────────────
    describe('processContactUpdate (deep)', () => {
        it('updates user phone from contact payload', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({
                id: 1, firstName: 'John', lastName: 'Doe', phoneNumber: '+44111', updatedAt: new Date(PAST),
            });
            const result = await service.processContactUpdate({
                contactId: 'C001',
                externalId: '1',
                phone: '+44999',
                updatedAt: FUTURE,
            });
            expect(result.updated).to.be.true();
            const updateData = userRepo.updateById.firstCall.args[1];
            expect(updateData.phoneNumber).to.equal('+44999');
        });

        it('updates companyRole via accountExternalId', async () => {
            const { service, companyUsersRepo } = buildService();
            companyUsersRepo.findOne.resolves({
                id: 10, userId: 1, companyId: 1, status: 'active', companyRole: 'viewer', isPrimaryContact: false,
            });
            const result = await service.processContactUpdate({
                contactId: 'C001',
                externalId: '1',
                accountExternalId: '1',
                companyRole: 'OWNER',
                updatedAt: FUTURE,
            });
            // Result should process without error
            expect(result.success).to.be.true();
        });

        it('throws Conflict on stale contact update', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({
                id: 1, firstName: 'John', updatedAt: new Date(FUTURE),
            });
            let threw = false;
            try {
                await service.processContactUpdate({
                    contactId: 'C001',
                    externalId: '1',
                    firstName: 'NewName',
                    updatedAt: PAST,
                });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('returns duplicate_event when SF timestamp matches lastSyncedSalesForceDate within 1s', async () => {
            const { service, userRepo } = buildService();
            const syncTime = new Date(FUTURE);
            userRepo.findById.resolves({
                id: 1,
                firstName: 'John',
                updatedAt: new Date(PAST),
                lastSyncedSalesForceDate: syncTime,
            });
            const result = await service.processContactUpdate({
                contactId: 'C001',
                externalId: '1',
                firstName: 'John2',
                updatedAt: syncTime.toISOString(),
            });
            expect(result.reason).to.equal('duplicate_event');
        });

        it('throws BadRequest for invalid mappingVersion', async () => {
            const { service } = buildService();
            let threw = false;
            try {
                await service.processContactUpdate({
                    contactId: 'C001',
                    externalId: '1',
                    updatedAt: FUTURE,
                    mappingVersion: '0.0.1',
                });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });
    });

    // ── processListingStatusUpdate (extra branches) ──────────────────────────
    describe('processListingStatusUpdate (extra branches)', () => {
        it('updates listing price fields', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({
                id: 1, status: ListingStatus.AVAILABLE, updatedAt: new Date(PAST),
            });
            const result = await service.processListingStatusUpdate({
                listingId: 1,
                description: 'New description',
                materialWeight: 200,
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(result.updated).to.be.true();
        });

        it('resolves listing from externalId with PROD prefix', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 7, status: ListingStatus.AVAILABLE, updatedAt: new Date(PAST) });
            await service.processListingStatusUpdate({ externalId: 'PROD_7', updatedAt: FUTURE });
            expect(listingsRepo.findById.calledWith(7)).to.be.true();
        });
    });

    // ── processOfferStatusUpdate (extra branches) ────────────────────────────
    describe('processOfferStatusUpdate (extra branches)', () => {
        it('updates offer price and quantity fields', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.findById.resolves({
                id: 1, status: OfferStatusEnum.PENDING, updatedAt: new Date(PAST),
            });
            const result = await service.processOfferStatusUpdate({
                offerId: 1,
                status: 'Accepted',
                offeredPricePerUnit: 150,
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(result.updated).to.be.true();
            const updateArgs = offersRepo.updateById.firstCall.args[1];
            expect(updateArgs.offeredPricePerUnit).to.equal(150);
        });

        it('resolves offer from externalId with UAT prefix', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.findById.resolves({ id: 8, status: OfferStatusEnum.PENDING, updatedAt: new Date(PAST) });
            await service.processOfferStatusUpdate({ externalId: 'UAT_8', updatedAt: FUTURE });
            expect(offersRepo.findById.calledWith(8)).to.be.true();
        });
    });

    // ── getDocumentsForHaulageOffer ──────────────────────────────────────────
    describe('getDocumentsForHaulageOffer', () => {
        it('returns documents from repository', async () => {
            const { service, haulageOfferDocsRepo } = buildService();
            haulageOfferDocsRepo.find.resolves([{ id: 1, documentTitle: 'Doc A' }]);
            const docs = await service.getDocumentsForHaulageOffer(1);
            expect(docs.length).to.equal(1);
            expect(haulageOfferDocsRepo.find.calledOnce).to.be.true();
        });

        it('returns empty array when no documents exist', async () => {
            const { service, haulageOfferDocsRepo } = buildService();
            haulageOfferDocsRepo.find.resolves([]);
            const docs = await service.getDocumentsForHaulageOffer(999);
            expect(docs.length).to.equal(0);
        });
    });

    // ── deleteDocumentBySalesforceId ─────────────────────────────────────────
    describe('deleteDocumentBySalesforceId', () => {
        it('deletes document when it exists', async () => {
            const { service, haulageOfferDocsRepo } = buildService();
            haulageOfferDocsRepo.findOne.resolves({ id: 5, salesforceId: 'SF_DOC_001' });
            await service.deleteDocumentBySalesforceId('SF_DOC_001');
            expect(haulageOfferDocsRepo.deleteById.calledWith(5)).to.be.true();
        });

        it('does nothing when document does not exist', async () => {
            const { service, haulageOfferDocsRepo } = buildService();
            haulageOfferDocsRepo.findOne.resolves(null);
            await service.deleteDocumentBySalesforceId('NON_EXISTENT');
            expect(haulageOfferDocsRepo.deleteById.called).to.be.false();
        });
    });

    // ── handleLoadUpdate ─────────────────────────────────────────────────────
    describe('handleLoadUpdate', () => {
        it('ignores updates with WT_ origin marker', async () => {
            const { service } = buildService();
            const result = await service.handleLoadUpdate({
                loadId: 1,
                updatedAt: FUTURE,
                originMarker: 'WT_DEV',
            });
            expect(result.reason).to.equal('loop_prevention');
        });

        it('throws NotFound when load not found by any method', async () => {
            const { service, haulageLoadsRepo } = buildService();
            haulageLoadsRepo.findById.rejects(new Error('not found'));
            haulageLoadsRepo.find.resolves([]);
            let threw = false;
            try {
                await service.handleLoadUpdate({ loadId: 999, updatedAt: FUTURE });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('updates load fields on success', async () => {
            const { service, haulageLoadsRepo } = buildService();
            haulageLoadsRepo.findById.resolves({ id: 1, haulageOfferId: 1, updatedAt: new Date(PAST) });
            const result = await service.handleLoadUpdate({
                loadId: 1,
                grossWeight: '5000',
                updatedAt: FUTURE,
            });
            expect(result.status).to.equal('success');
            expect(haulageLoadsRepo.updateById.called).to.be.true();
        });

        it('returns stale_event when WT has newer data', async () => {
            const { service, haulageLoadsRepo } = buildService();
            haulageLoadsRepo.findById.resolves({
                id: 1, haulageOfferId: 1, updatedAt: new Date(FUTURE),
            });
            const result = await service.handleLoadUpdate({ loadId: 1, updatedAt: PAST });
            expect(result.reason).to.equal('stale_event');
        });

        it('updates parent offer status to PARTIALLY_SHIPPED when some loads delivered', async () => {
            const { service, haulageLoadsRepo, haulageOffersRepo } = buildService();
            haulageLoadsRepo.findById.resolves({
                id: 1, haulageOfferId: 1, loadStatus: 'Pending', updatedAt: new Date(PAST),
            });
            haulageOffersRepo.findById.resolves({
                id: 1, status: HaulageOfferStatus.ACCEPTED, numberOfLoads: 3, updatedAt: new Date(PAST),
            });
            // 1 of 3 delivered - partially shipped
            haulageLoadsRepo.count.resolves({ count: 1 });

            const result = await service.handleLoadUpdate({
                loadId: 1,
                loadStatus: 'Delivered',
                updatedAt: FUTURE,
            });
            expect(result.status).to.equal('success');
            const offerUpdateArgs = haulageOffersRepo.updateById.firstCall.args[1];
            expect(offerUpdateArgs.status).to.equal(HaulageOfferStatus.PARTIALLY_SHIPPED);
        });

        it('updates parent offer status to SHIPPED when all loads delivered', async () => {
            const { service, haulageLoadsRepo, haulageOffersRepo } = buildService();
            haulageLoadsRepo.findById.resolves({
                id: 1, haulageOfferId: 1, loadStatus: 'Pending', updatedAt: new Date(PAST),
            });
            haulageOffersRepo.findById.resolves({
                id: 1, status: HaulageOfferStatus.PARTIALLY_SHIPPED, numberOfLoads: 3, updatedAt: new Date(PAST),
            });
            // All 3 delivered
            haulageLoadsRepo.count.resolves({ count: 3 });

            const result = await service.handleLoadUpdate({
                loadId: 1,
                loadStatus: 'Delivered',
                updatedAt: FUTURE,
            });
            expect(result.status).to.equal('success');
            const offerUpdateArgs = haulageOffersRepo.updateById.firstCall.args[1];
            expect(offerUpdateArgs.status).to.equal(HaulageOfferStatus.SHIPPED);
        });

        it('finds load by salesforceId when loadId not provided', async () => {
            const { service, haulageLoadsRepo } = buildService();
            haulageLoadsRepo.find.resolves([{ id: 2, haulageOfferId: 1, updatedAt: new Date(PAST) }]);
            const result = await service.handleLoadUpdate({
                salesforceId: 'SF_LOAD_002',
                updatedAt: FUTURE,
            });
            expect(result.status).to.equal('success');
        });
    });

    // ── processAccountUpdate (extra branches) ────────────────────────────────
    describe('processAccountUpdate (extra branches)', () => {
        it('returns duplicate_event when timestamps match within 1 second', async () => {
            const { service, companiesRepo } = buildService();
            const syncTime = new Date(FUTURE);
            companiesRepo.findById.resolves({
                id: 1,
                name: 'ACME',
                status: CompanyStatus.PENDING,
                updatedAt: new Date(PAST),
                lastSyncedSalesForceDate: syncTime,
            });
            const result = await service.processAccountUpdate({
                accountId: 'SF001',
                externalId: '1',
                name: 'New Name',
                updatedAt: syncTime.toISOString(),
            });
            expect(result.reason).to.equal('duplicate_event');
        });

        it('updates vatNumber and registrationNumber fields', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.findById.resolves({
                id: 1,
                name: 'ACME',
                status: CompanyStatus.ACTIVE,
                updatedAt: new Date(PAST),
            });
            const result = await service.processAccountUpdate({
                accountId: 'SF001',
                externalId: '1',
                vatNumber: 'GB123456789',
                registrationNumber: 'REG001',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(result.updated).to.be.true();
        });

        it('throws BadRequest when non-writable fields are in fieldsUpdated', async () => {
            const { service } = buildService();
            let threw = false;
            try {
                await service.processAccountUpdate({
                    accountId: 'SF001',
                    externalId: '1',
                    updatedAt: FUTURE,
                    fieldsUpdated: ['WasteTrade_Company_Id__c'],
                });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('falls back to lookup by salesforceId when findById returns null', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.findById.resolves(null);
            companiesRepo.find.resolves([{
                id: 1,
                name: 'ACME',
                salesforceId: 'SF001',
                status: CompanyStatus.PENDING,
                updatedAt: new Date(PAST),
            }]);
            const result = await service.processAccountUpdate({
                accountId: 'SF001',
                externalId: '1',
                name: 'Updated Name',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
        });
    });

    // ── processLeadUpdate (extra branches) ───────────────────────────────────
    describe('processLeadUpdate (extra branches)', () => {
        it('returns stale_event when SF timestamp is not newer than user updatedAt', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({
                id: 1, firstName: 'John', updatedAt: new Date(FUTURE),
            });
            const result = await service.processLeadUpdate({
                leadId: 'L001',
                externalId: '1',
                updatedAt: PAST,
            });
            expect(result.success).to.be.false();
            expect(result.reason).to.equal('stale_event');
        });

        it('stores salesforceLeadId when not already stored', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({
                id: 1, firstName: 'John', lastName: 'Doe', phoneNumber: '+44000',
                salesforceLeadId: null, updatedAt: new Date(PAST),
            });
            const result = await service.processLeadUpdate({
                leadId: 'L_NEW_001',
                externalId: '1',
                firstName: 'NewFirst',
                updatedAt: FUTURE,
            });
            expect(result.updated).to.be.true();
            const updateCall = userRepo.updateById.firstCall.args[1];
            expect(updateCall.salesforceLeadId).to.equal('L_NEW_001');
        });
    });
});
