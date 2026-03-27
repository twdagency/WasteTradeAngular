import { expect, sinon } from '@loopback/testlab';
import { SalesforceWebhookService } from '../../services/salesforce/salesforce-webhook.service';
import { UserStatus } from '../../enum/user.enum';
import { CompanyStatus } from '../../enum/company.enum';
import { CompanyUserStatusEnum } from '../../enum/company-users.enum';
import { ListingStatus } from '../../enum/listing.enum';
import { OfferStatusEnum } from '../../enum/offer.enum';
import { HaulageOfferStatus } from '../../enum/haulage-offer.enum';

// Shared timestamps
const FUTURE = new Date(Date.now() + 60_000).toISOString();
const PAST = new Date('2020-01-01').toISOString();

/**
 * Build a fully-stubbed SalesforceWebhookService.
 * All repo/service objects are returned by reference so tests can
 * call .resolves() / .rejects() on stubs after construction.
 */
function buildService() {
    const haulageOffersRepo = {
        findById: sinon.stub().resolves({
            id: 1,
            status: HaulageOfferStatus.ACCEPTED,
            numberOfLoads: 2,
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
            status: CompanyStatus.ACTIVE,
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
            status: CompanyUserStatusEnum.ACTIVE,
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
        findById: sinon.stub().resolves({ id: 1 }),
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
        undefined, // salesforceSyncService is optional
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

// ─────────────────────────────────────────────────────────────────────────────

describe('SalesforceWebhookService (unit)', () => {

    // ── processAccountUpdate ─────────────────────────────────────────────────
    describe('processAccountUpdate', () => {
        it('ignores updates with WT_ origin marker (loop prevention)', async () => {
            const { service } = buildService();
            const result = await service.processAccountUpdate({
                accountId: 'SF001',
                externalId: '1',
                updatedAt: FUTURE,
                originMarker: 'WT_DEV',
            });
            expect(result.success).to.be.true();
            expect(result.reason).to.equal('loop_prevention');
        });

        it('returns missing_external_id when externalId absent', async () => {
            const { service } = buildService();
            const result = await service.processAccountUpdate({
                accountId: 'SF001',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.false();
            expect(result.reason).to.equal('missing_external_id');
        });

        it('throws NotFound when company does not exist', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.findById.rejects(new Error('not found'));
            companiesRepo.find.resolves([]);
            let threw = false;
            try {
                await service.processAccountUpdate({ accountId: 'SF001', externalId: '99', updatedAt: FUTURE });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('updates company fields and calls updateById', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.findById.resolves({
                id: 1,
                name: 'Old Name',
                status: CompanyStatus.PENDING,
                updatedAt: new Date(PAST),
            });
            const result = await service.processAccountUpdate({
                accountId: 'SF001',
                externalId: '1',
                name: 'New Name',
                billingCity: 'London',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(result.updated).to.be.true();
            expect(companiesRepo.updateById.called).to.be.true();
        });

        it('logs inbound sync to syncLogRepository', async () => {
            const { service, syncLogRepo } = buildService();
            await service.processAccountUpdate({
                accountId: 'SF001',
                externalId: '1',
                name: 'New Name',
                updatedAt: FUTURE,
            });
            expect(syncLogRepo.create.called).to.be.true();
        });

        it('throws Conflict on stale update (WT has newer data)', async () => {
            const { service, companiesRepo } = buildService();
            companiesRepo.findById.resolves({
                id: 1,
                name: 'ACME',
                status: CompanyStatus.ACTIVE,
                updatedAt: new Date(FUTURE),
            });
            let threw = false;
            try {
                await service.processAccountUpdate({ accountId: 'SF001', externalId: '1', updatedAt: PAST });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('returns updated=false when no fields changed', async () => {
            const { service } = buildService();
            // Only accountId/externalId/updatedAt — no writable fields provided
            const result = await service.processAccountUpdate({
                accountId: 'SF001',
                externalId: '1',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(result.updated).to.be.false();
        });
    });

    // ── processContactUpdate ─────────────────────────────────────────────────
    describe('processContactUpdate', () => {
        it('ignores contact updates with WT_ origin marker', async () => {
            const { service } = buildService();
            const result = await service.processContactUpdate({
                contactId: 'C001',
                externalId: '1',
                updatedAt: FUTURE,
                originMarker: 'WT_PROD',
            });
            expect(result.reason).to.equal('loop_prevention');
        });

        it('throws NotFound when externalId is absent', async () => {
            const { service } = buildService();
            let threw = false;
            try {
                await service.processContactUpdate({ contactId: 'C001', updatedAt: FUTURE });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('updates user firstName and lastName from contact payload', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({
                id: 1, firstName: 'Old', lastName: 'Name', updatedAt: new Date(PAST), status: UserStatus.PENDING,
            });
            const result = await service.processContactUpdate({
                contactId: 'C001',
                externalId: '1',
                firstName: 'NewFirst',
                lastName: 'NewLast',
                updatedAt: FUTURE,
            });
            expect(result.updated).to.be.true();
            expect(userRepo.updateById.called).to.be.true();
        });

        it('returns no_changes when contact fields are unchanged', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({
                id: 1, firstName: 'Same', lastName: 'Name', updatedAt: new Date(PAST),
            });
            const result = await service.processContactUpdate({
                contactId: 'C001',
                externalId: '1',
                firstName: 'Same',
                lastName: 'Name',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(result.updated).to.be.false();
        });
    });

    // ── processListingStatusUpdate ───────────────────────────────────────────
    describe('processListingStatusUpdate', () => {
        it('ignores updates with WT_ origin marker', async () => {
            const { service } = buildService();
            const result = await service.processListingStatusUpdate({
                listingId: 1,
                updatedAt: FUTURE,
                originMarker: 'WT_UAT',
            });
            expect(result.reason).to.equal('loop_prevention');
        });

        it('returns missing_id when neither listingId nor externalId provided', async () => {
            const { service } = buildService();
            const result = await service.processListingStatusUpdate({ updatedAt: FUTURE });
            expect(result.success).to.be.false();
            expect(result.reason).to.equal('missing_id');
        });

        it('resolves listingId from externalId with ENV prefix', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 5, status: ListingStatus.AVAILABLE, updatedAt: new Date(PAST) });
            await service.processListingStatusUpdate({ externalId: 'DEV_5', updatedAt: FUTURE });
            expect(listingsRepo.findById.calledWith(5)).to.be.true();
        });

        it('returns not_found when listing does not exist', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.rejects(new Error('not found'));
            const result = await service.processListingStatusUpdate({ listingId: 999, updatedAt: FUTURE });
            expect(result.success).to.be.false();
            expect(result.reason).to.equal('not_found');
        });

        it('returns stale_event when SF timestamp is not newer than listing updatedAt', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 1, status: ListingStatus.AVAILABLE, updatedAt: new Date(FUTURE) });
            const result = await service.processListingStatusUpdate({ listingId: 1, updatedAt: PAST });
            expect(result.reason).to.equal('stale_event');
        });

        it('updates listing when valid status provided', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 1, status: ListingStatus.AVAILABLE, updatedAt: new Date(PAST) });
            const result = await service.processListingStatusUpdate({
                listingId: 1,
                status: 'Pending',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(listingsRepo.updateById.called).to.be.true();
        });

        it('updates description and materialWeight fields', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 1, status: ListingStatus.AVAILABLE, updatedAt: new Date(PAST) });
            const result = await service.processListingStatusUpdate({
                listingId: 1,
                description: 'Updated desc',
                materialWeight: 500,
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(result.updated).to.be.true();
        });

        it('does not apply SOLD→PENDING invalid transition', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 1, status: ListingStatus.SOLD, updatedAt: new Date(PAST) });
            // Should succeed but not change the status (invalid transition skipped)
            const result = await service.processListingStatusUpdate({ listingId: 1, status: 'Pending', updatedAt: FUTURE });
            expect(result.success).to.be.true();
        });
    });

    // ── processOfferStatusUpdate ─────────────────────────────────────────────
    describe('processOfferStatusUpdate', () => {
        it('ignores updates with WT_ origin marker', async () => {
            const { service } = buildService();
            const result = await service.processOfferStatusUpdate({
                offerId: 1,
                updatedAt: FUTURE,
                originMarker: 'WT_DEV',
            });
            expect(result.reason).to.equal('loop_prevention');
        });

        it('returns missing_id when no offerId or externalId', async () => {
            const { service } = buildService();
            const result = await service.processOfferStatusUpdate({ updatedAt: FUTURE });
            expect(result.success).to.be.false();
            expect(result.reason).to.equal('missing_id');
        });

        it('resolves offerId from externalId with ENV prefix', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.findById.resolves({ id: 5, status: OfferStatusEnum.PENDING, updatedAt: new Date(PAST) });
            await service.processOfferStatusUpdate({ externalId: 'DEV_5', updatedAt: FUTURE });
            expect(offersRepo.findById.calledWith(5)).to.be.true();
        });

        it('returns not_found when offer does not exist', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.findById.rejects(new Error('not found'));
            const result = await service.processOfferStatusUpdate({ offerId: 999, updatedAt: FUTURE });
            expect(result.success).to.be.false();
            expect(result.reason).to.equal('not_found');
        });

        it('returns stale_event when SF timestamp is not newer', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.findById.resolves({ id: 1, status: OfferStatusEnum.PENDING, updatedAt: new Date(FUTURE) });
            const result = await service.processOfferStatusUpdate({ offerId: 1, updatedAt: PAST });
            expect(result.reason).to.equal('stale_event');
        });

        it('updates offer status and fields from valid payload', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.findById.resolves({ id: 1, status: OfferStatusEnum.PENDING, updatedAt: new Date(PAST) });
            const result = await service.processOfferStatusUpdate({
                offerId: 1,
                status: 'Accepted',
                offeredPricePerUnit: 100,
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(offersRepo.updateById.called).to.be.true();
        });

        it('does not apply ACCEPTED→PENDING invalid transition', async () => {
            const { service, offersRepo } = buildService();
            offersRepo.findById.resolves({ id: 1, status: OfferStatusEnum.ACCEPTED, updatedAt: new Date(PAST) });
            const result = await service.processOfferStatusUpdate({ offerId: 1, status: 'Pending', updatedAt: FUTURE });
            expect(result.success).to.be.true();
        });
    });

    // ── processApprovalInstruction ───────────────────────────────────────────
    describe('processApprovalInstruction', () => {
        it('throws BadRequest for invalid actionType', async () => {
            const { service } = buildService();
            let threw = false;
            try {
                await service.processApprovalInstruction({
                    actionType: 'bad_action' as any,
                    userId: 1,
                    timestamp: FUTURE,
                });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('throws NotFound when userId and externalId both absent', async () => {
            const { service } = buildService();
            let threw = false;
            try {
                await service.processApprovalInstruction({
                    actionType: 'approve_user',
                    timestamp: FUTURE,
                });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('throws when user does not exist in database', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.rejects(new Error('not found'));
            let threw = false;
            try {
                await service.processApprovalInstruction({
                    actionType: 'approve_user',
                    userId: 999,
                    timestamp: FUTURE,
                });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('throws BadRequest for unsupported mapping version', async () => {
            const { service } = buildService();
            let threw = false;
            try {
                await service.processApprovalInstruction({
                    actionType: 'approve_user',
                    userId: 1,
                    timestamp: FUTURE,
                    mappingVersion: '0.0.1',
                });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('approve_user: activates PENDING user and sends approval email', async () => {
            const { service, userRepo, emailService } = buildService();
            userRepo.findById.resolves({ id: 1, status: UserStatus.PENDING, updatedAt: new Date(PAST) });
            const result = await service.processApprovalInstruction({
                actionType: 'approve_user',
                userId: 1,
                timestamp: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(result.approved).to.be.true();
            expect(userRepo.updateById.called).to.be.true();
            expect(emailService.sendAccountVerificationApprovedEmail.called).to.be.true();
        });

        it('approve_user: returns already_approved when user is ACTIVE (idempotent)', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({ id: 1, status: UserStatus.ACTIVE, updatedAt: new Date(PAST) });
            const result = await service.processApprovalInstruction({
                actionType: 'approve_user',
                userId: 1,
                timestamp: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(result.reason).to.equal('already_approved');
        });

        it('approve_user: throws Conflict when user is REJECTED', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({ id: 1, status: UserStatus.REJECTED, updatedAt: new Date(PAST) });
            let threw = false;
            try {
                await service.processApprovalInstruction({
                    actionType: 'approve_user',
                    userId: 1,
                    timestamp: FUTURE,
                });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('reject_user: sets user REJECTED and updates company status', async () => {
            const { service, userRepo, companiesRepo, companyUsersRepo } = buildService();
            userRepo.findById.resolves({ id: 1, status: UserStatus.PENDING, updatedAt: new Date(PAST) });
            // companyUsersRepo.findOne already returns { id: 10, userId: 1, companyId: 1 }
            const result = await service.processApprovalInstruction({
                actionType: 'reject_user',
                userId: 1,
                timestamp: FUTURE,
                reason: 'Incomplete documents',
            });
            expect(result.success).to.be.true();
            expect(result.approved).to.be.false();
            expect(userRepo.updateById.called).to.be.true();
            expect(companiesRepo.updateById.called).to.be.true();
        });

        it('reject_user: returns already_rejected for REJECTED user (idempotent)', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({ id: 1, status: UserStatus.REJECTED, updatedAt: new Date(PAST) });
            const result = await service.processApprovalInstruction({
                actionType: 'reject_user',
                userId: 1,
                timestamp: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(result.reason).to.equal('already_rejected');
        });

        it('request_info: sends info request email for PENDING user', async () => {
            const { service, userRepo, emailService } = buildService();
            userRepo.findById.resolves({ id: 1, status: UserStatus.PENDING, updatedAt: new Date(PAST) });
            const result = await service.processApprovalInstruction({
                actionType: 'request_info',
                userId: 1,
                timestamp: FUTURE,
                message: 'Please provide VAT documents',
            });
            expect(result.success).to.be.true();
            expect(emailService.sendCompanyRequestInformationEmail.called).to.be.true();
        });

        it('request_info: throws Conflict for ACTIVE user', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({ id: 1, status: UserStatus.ACTIVE, updatedAt: new Date(PAST) });
            let threw = false;
            try {
                await service.processApprovalInstruction({
                    actionType: 'request_info',
                    userId: 1,
                    timestamp: FUTURE,
                });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('request_info: throws Conflict for REJECTED user', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({ id: 1, status: UserStatus.REJECTED, updatedAt: new Date(PAST) });
            let threw = false;
            try {
                await service.processApprovalInstruction({
                    actionType: 'request_info',
                    userId: 1,
                    timestamp: FUTURE,
                });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('resolves userId via externalId ENV prefix stripping', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({ id: 3, status: UserStatus.PENDING, updatedAt: new Date(PAST) });
            await service.processApprovalInstruction({
                actionType: 'approve_user',
                externalId: 'DEV_3',
                timestamp: FUTURE,
            });
            expect(userRepo.findById.calledWith(3)).to.be.true();
        });
    });

    // ── processLeadUpdate ────────────────────────────────────────────────────
    describe('processLeadUpdate', () => {
        it('ignores lead updates with WT_ origin marker', async () => {
            const { service } = buildService();
            const result = await service.processLeadUpdate({
                leadId: 'L001',
                externalId: '1',
                updatedAt: FUTURE,
                originMarker: 'WT_DEV',
            });
            expect(result.reason).to.equal('loop_prevention');
        });

        it('returns missing_external_id when externalId absent', async () => {
            const { service } = buildService();
            const result = await service.processLeadUpdate({ leadId: 'L001', updatedAt: FUTURE });
            expect(result.success).to.be.false();
            expect(result.reason).to.equal('missing_external_id');
        });

        it('returns user_not_found when user does not exist', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.rejects(new Error('not found'));
            const result = await service.processLeadUpdate({
                leadId: 'L001',
                externalId: '99',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.false();
            expect(result.reason).to.equal('user_not_found');
        });

        it('updates user phone when it differs from payload', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({
                id: 1, phoneNumber: '+44111', salesforceLeadId: null, updatedAt: new Date(PAST),
            });
            const result = await service.processLeadUpdate({
                leadId: 'L001',
                externalId: '1',
                phone: '+44999',
                updatedAt: FUTURE,
            });
            expect(result.updated).to.be.true();
            expect(userRepo.updateById.called).to.be.true();
        });

        it('returns no_changes when all fields match', async () => {
            const { service, userRepo } = buildService();
            userRepo.findById.resolves({
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                phoneNumber: '+44000',
                salesforceLeadId: 'L001',
                updatedAt: new Date(PAST),
            });
            const result = await service.processLeadUpdate({
                leadId: 'L001',
                externalId: '1',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+44000',
                updatedAt: FUTURE,
            });
            expect(result.updated).to.be.false();
            expect(result.reason).to.equal('no_changes');
        });
    });

    // ── processHaulageDocuments ──────────────────────────────────────────────
    describe('processHaulageDocuments', () => {
        it('throws NotFound when haulage offer does not exist', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.rejects(new Error('not found'));
            let threw = false;
            try {
                await service.processHaulageDocuments(999, [
                    { title: 'doc', url: 'http://example.com/doc', salesforceDocumentId: 'SF_DOC_001' },
                ]);
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('throws BadRequest when haulage offer is in PENDING status', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({ id: 1, status: HaulageOfferStatus.PENDING });
            let threw = false;
            try {
                await service.processHaulageDocuments(1, [
                    { title: 'doc', url: 'http://example.com/doc', salesforceDocumentId: 'SF_DOC_001' },
                ]);
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('throws BadRequest when documents array is empty', async () => {
            const { service } = buildService();
            let threw = false;
            try {
                await service.processHaulageDocuments(1, []);
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('creates document for accepted haulage offer', async () => {
            const { service, haulageOfferDocsRepo } = buildService();
            const result = await service.processHaulageDocuments(1, [
                { title: 'Delivery Note', url: 'http://example.com/dn', salesforceDocumentId: 'SF_DOC_001' },
            ]);
            expect(result.documentsCreated).to.equal(1);
            expect(haulageOfferDocsRepo.create.called).to.be.true();
        });

        it('skips duplicate document when already exists', async () => {
            const { service, haulageOfferDocsRepo } = buildService();
            haulageOfferDocsRepo.findOne.resolves({ id: 9, salesforceId: 'SF_DOC_001' });
            const result = await service.processHaulageDocuments(1, [
                { title: 'Delivery Note', url: 'http://example.com/dn', salesforceDocumentId: 'SF_DOC_001' },
            ]);
            expect(result.documentsCreated).to.equal(0);
            expect(haulageOfferDocsRepo.create.called).to.be.false();
        });

        it('creates multiple documents and returns correct count', async () => {
            const { service, haulageOfferDocsRepo } = buildService();
            const result = await service.processHaulageDocuments(1, [
                { title: 'Doc A', url: 'http://example.com/a', salesforceDocumentId: 'SF_DOC_A' },
                { title: 'Doc B', url: 'http://example.com/b', salesforceDocumentId: 'SF_DOC_B' },
            ]);
            expect(result.documentsCreated).to.equal(2);
            expect(haulageOfferDocsRepo.create.callCount).to.equal(2);
        });
    });
});
