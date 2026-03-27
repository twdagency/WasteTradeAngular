import { expect, sinon } from '@loopback/testlab';
import { SalesforceWebhookService } from '../../services/salesforce/salesforce-webhook.service';
import { UserStatus } from '../../enum/user.enum';
import { CompanyStatus } from '../../enum/company.enum';
import { CompanyUserStatusEnum } from '../../enum/company-users.enum';

const PAST = new Date('2020-01-01').toISOString();
const FUTURE = new Date(Date.now() + 60_000).toISOString();

function buildService(overrides: Record<string, any> = {}) {
    const haulageOffersRepo = {
        findById: sinon.stub().resolves({ id: 1, status: 'pending', numberOfLoads: 2, updatedAt: new Date(PAST) }),
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
        findById: sinon.stub().resolves({ id: 1, name: 'ACME', status: CompanyStatus.PENDING, updatedAt: new Date(PAST) }),
        find: sinon.stub().resolves([]),
        updateById: sinon.stub().resolves(),
    };
    const userRepo = {
        findById: sinon.stub().resolves({
            id: 1, firstName: 'Jane', lastName: 'Doe', email: 'j@test.com',
            status: UserStatus.PENDING, updatedAt: new Date(PAST),
        }),
        updateById: sinon.stub().resolves(),
        find: sinon.stub().resolves([]),
    };
    const companyUsersRepo = {
        findOne: sinon.stub().resolves({ id: 10, userId: 1, companyId: 1, status: CompanyUserStatusEnum.PENDING }),
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
    const companyDocsRepo = { updateAll: sinon.stub().resolves({ count: 0 }) };
    const locationDocsRepo = { updateAll: sinon.stub().resolves({ count: 0 }) };
    const locationsRepo = {
        find: sinon.stub().resolves([]),
        findOne: sinon.stub().resolves(null),
    };
    const listingsRepo = {
        findById: sinon.stub().resolves({ id: 1, status: 'available', updatedAt: new Date(PAST) }),
        find: sinon.stub().resolves([]),
        updateById: sinon.stub().resolves(),
    };
    const offersRepo = {
        findById: sinon.stub().resolves({ id: 1, status: 'pending', updatedAt: new Date(PAST) }),
        find: sinon.stub().resolves([]),
        updateById: sinon.stub().resolves(),
    };
    const emailService = {
        sendAccountVerificationApprovedEmail: sinon.stub().resolves(),
        sendCompanyRequestInformationEmail: sinon.stub().resolves(),
        sendAccountVerificationRejectedEmail: sinon.stub().resolves(),
        sendCompanyRejectedEmail: sinon.stub().resolves(),
    };
    const notifService = { createNotification: sinon.stub().resolves() };
    const companyLocationsRepo = { find: sinon.stub().resolves([]) };
    const companyLocationDocsRepo = { updateAll: sinon.stub().resolves({ count: 0 }) };

    // Build with all standard repos then apply overrides at repo level
    const service = new SalesforceWebhookService(
        overrides.haulageOffersRepo ?? haulageOffersRepo as any,
        overrides.haulageOfferDocsRepo ?? haulageOfferDocsRepo as any,
        overrides.companiesRepo ?? companiesRepo as any,
        overrides.userRepo ?? userRepo as any,
        overrides.companyUsersRepo ?? companyUsersRepo as any,
        overrides.syncLogRepo ?? syncLogRepo as any,
        overrides.haulageLoadsRepo ?? haulageLoadsRepo as any,
        overrides.companyDocsRepo ?? companyDocsRepo as any,
        overrides.locationDocsRepo ?? locationDocsRepo as any,
        overrides.locationsRepo ?? locationsRepo as any,
        overrides.listingsRepo ?? listingsRepo as any,
        overrides.offersRepo ?? offersRepo as any,
        overrides.emailService ?? emailService as any,
        overrides.notifService ?? notifService as any,
        undefined,
    );

    return {
        service,
        haulageOffersRepo, haulageOfferDocsRepo, companiesRepo,
        userRepo, companyUsersRepo, syncLogRepo, haulageLoadsRepo,
        companyDocsRepo, locationDocsRepo, locationsRepo,
        listingsRepo, offersRepo, emailService, notifService,
        companyLocationsRepo, companyLocationDocsRepo,
    };
}

describe('SalesforceWebhookService (unit) - part 3', () => {

    // ── processApprovalInstruction — approve_user ─────────────────────────────
    describe('processApprovalInstruction — approve_user', () => {
        it('returns already_approved when user already ACTIVE', async () => {
            const userRepo = {
                findById: sinon.stub().resolves({
                    id: 1, status: UserStatus.ACTIVE, updatedAt: new Date(PAST),
                }),
                updateById: sinon.stub().resolves(),
                find: sinon.stub().resolves([]),
            };
            const { service } = buildService({ userRepo });

            const result = await service.processApprovalInstruction({
                actionType: 'approve_user',
                userId: 1,
                contactId: 'C001',
                timestamp: FUTURE,
            });

            expect(result.success).to.be.true();
            expect(result.reason).to.equal('already_approved');
        });

        it('throws Conflict when trying to approve a REJECTED user', async () => {
            const userRepo = {
                findById: sinon.stub().resolves({
                    id: 1, status: UserStatus.REJECTED, updatedAt: new Date(PAST),
                }),
                updateById: sinon.stub().resolves(),
                find: sinon.stub().resolves([]),
            };
            const { service } = buildService({ userRepo });

            await expect(service.processApprovalInstruction({
                actionType: 'approve_user',
                userId: 1,
                contactId: 'C001',
                timestamp: FUTURE,
            })).to.be.rejectedWith(/cannot approve a rejected user/i);
        });

        it('approves pending user and updates status to ACTIVE', async () => {
            const userRepo = {
                findById: sinon.stub().resolves({
                    id: 1, status: UserStatus.PENDING, updatedAt: new Date(PAST),
                }),
                updateById: sinon.stub().resolves(),
                find: sinon.stub().resolves([]),
            };
            const companyUsersRepo = {
                findOne: sinon.stub().resolves({ id: 10, userId: 1, companyId: 5, status: CompanyUserStatusEnum.PENDING }),
                findById: sinon.stub().resolves({ id: 10 }),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
                updateAll: sinon.stub().resolves({ count: 0 }),
            };
            const companyDocsRepo = { updateAll: sinon.stub().resolves({ count: 0 }) };
            const locationDocsRepo = { updateAll: sinon.stub().resolves({ count: 0 }) };
            const locationsRepo = { find: sinon.stub().resolves([]) };
            const companiesRepo = {
                findById: sinon.stub().resolves({ id: 5, status: CompanyStatus.PENDING, updatedAt: new Date(PAST) }),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
            };
            const { service, emailService } = buildService({
                userRepo, companyUsersRepo, companiesRepo,
                companyDocsRepo, locationDocsRepo, locationsRepo,
            });

            const result = await service.processApprovalInstruction({
                actionType: 'approve_user',
                userId: 1,
                contactId: 'C001',
                timestamp: FUTURE,
            });

            expect(result.success).to.be.true();
            expect(result.approved).to.be.true();
            expect(result.resultingStatus).to.equal(UserStatus.ACTIVE);
            expect(userRepo.updateById.calledWith(1, sinon.match({ status: UserStatus.ACTIVE }))).to.be.true();
            expect(emailService.sendAccountVerificationApprovedEmail.calledOnce).to.be.true();
        });

        it('throws NotFound when userId not found', async () => {
            const userRepo = {
                findById: sinon.stub().resolves(null),
                updateById: sinon.stub().resolves(),
                find: sinon.stub().resolves([]),
            };
            const { service } = buildService({ userRepo });

            await expect(service.processApprovalInstruction({
                actionType: 'approve_user',
                userId: 999,
                contactId: 'C001',
                timestamp: FUTURE,
            })).to.be.rejectedWith(/not found/i);
        });

        it('throws BadRequest when userId missing and no externalId', async () => {
            const { service } = buildService();

            await expect(service.processApprovalInstruction({
                actionType: 'approve_user',
                contactId: 'C001',
                timestamp: FUTURE,
            } as any)).to.be.rejectedWith(/missing or invalid/i);
        });
    });

    // ── processApprovalInstruction — reject_user ──────────────────────────────
    describe('processApprovalInstruction — reject_user', () => {
        it('returns already_rejected when user already REJECTED', async () => {
            const userRepo = {
                findById: sinon.stub().resolves({
                    id: 1, status: UserStatus.REJECTED, updatedAt: new Date(PAST),
                }),
                updateById: sinon.stub().resolves(),
                find: sinon.stub().resolves([]),
            };
            const { service } = buildService({ userRepo });

            const result = await service.processApprovalInstruction({
                actionType: 'reject_user',
                userId: 1,
                contactId: 'C001',
                timestamp: FUTURE,
            });

            expect(result.success).to.be.true();
            expect(result.reason).to.equal('already_rejected');
        });

        it('throws Conflict when trying to reject an ACTIVE user', async () => {
            const userRepo = {
                findById: sinon.stub().resolves({
                    id: 1, status: UserStatus.ACTIVE, updatedAt: new Date(PAST),
                }),
                updateById: sinon.stub().resolves(),
                find: sinon.stub().resolves([]),
            };
            const { service } = buildService({ userRepo });

            await expect(service.processApprovalInstruction({
                actionType: 'reject_user',
                userId: 1,
                contactId: 'C001',
                timestamp: FUTURE,
            })).to.be.rejectedWith(/cannot reject an approved user/i);
        });

        it('rejects pending user and updates status to REJECTED', async () => {
            const userRepo = {
                findById: sinon.stub().resolves({
                    id: 1, status: UserStatus.PENDING, updatedAt: new Date(PAST),
                }),
                updateById: sinon.stub().resolves(),
                find: sinon.stub().resolves([]),
            };
            const companyUsersRepo = {
                findOne: sinon.stub().resolves({ id: 10, userId: 1, companyId: 5 }),
                findById: sinon.stub().resolves({ id: 10 }),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
                updateAll: sinon.stub().resolves({ count: 0 }),
            };
            const locationsRepo = { find: sinon.stub().resolves([]) };
            const companiesRepo = {
                findById: sinon.stub().resolves({ id: 5, status: CompanyStatus.PENDING, updatedAt: new Date(PAST) }),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
            };
            const companyDocsRepo = { updateAll: sinon.stub().resolves({ count: 0 }) };
            const locationDocsRepo = { updateAll: sinon.stub().resolves({ count: 0 }) };
            const { service, emailService } = buildService({
                userRepo, companyUsersRepo, companiesRepo,
                companyDocsRepo, locationDocsRepo, locationsRepo,
            });

            const result = await service.processApprovalInstruction({
                actionType: 'reject_user',
                userId: 1,
                contactId: 'C001',
                timestamp: FUTURE,
                reason: 'Insufficient documentation',
            });

            expect(result.success).to.be.true();
            expect(result.approved).to.be.false();
            expect(result.resultingStatus).to.equal(UserStatus.REJECTED);
            expect(userRepo.updateById.calledWith(1, sinon.match({ status: UserStatus.REJECTED }))).to.be.true();
            expect(emailService.sendCompanyRejectedEmail.calledOnce).to.be.true();
        });
    });

    // ── processApprovalInstruction — request_info ─────────────────────────────
    describe('processApprovalInstruction — request_info', () => {
        it('throws Conflict when user is already ACTIVE', async () => {
            const userRepo = {
                findById: sinon.stub().resolves({
                    id: 1, status: UserStatus.ACTIVE, updatedAt: new Date(PAST),
                }),
                updateById: sinon.stub().resolves(),
                find: sinon.stub().resolves([]),
            };
            const { service } = buildService({ userRepo });

            await expect(service.processApprovalInstruction({
                actionType: 'request_info',
                userId: 1,
                contactId: 'C001',
                timestamp: FUTURE,
            })).to.be.rejectedWith(/cannot request information from an approved user/i);
        });

        it('throws Conflict when user is already REJECTED', async () => {
            const userRepo = {
                findById: sinon.stub().resolves({
                    id: 1, status: UserStatus.REJECTED, updatedAt: new Date(PAST),
                }),
                updateById: sinon.stub().resolves(),
                find: sinon.stub().resolves([]),
            };
            const { service } = buildService({ userRepo });

            await expect(service.processApprovalInstruction({
                actionType: 'request_info',
                userId: 1,
                contactId: 'C001',
                timestamp: FUTURE,
            })).to.be.rejectedWith(/cannot request information from a rejected user/i);
        });

        it('sends request info email and updates status', async () => {
            const userRepo = {
                findById: sinon.stub().resolves({
                    id: 1, status: UserStatus.PENDING, updatedAt: new Date(PAST),
                }),
                updateById: sinon.stub().resolves(),
                find: sinon.stub().resolves([]),
            };
            const companyUsersRepo = {
                findOne: sinon.stub().resolves({ id: 10, userId: 1, companyId: 5 }),
                findById: sinon.stub().resolves({ id: 10 }),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
                updateAll: sinon.stub().resolves({ count: 0 }),
            };
            const locationsRepo = { find: sinon.stub().resolves([]) };
            const companiesRepo = {
                findById: sinon.stub().resolves({ id: 5, status: CompanyStatus.PENDING, updatedAt: new Date(PAST) }),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
            };
            const companyDocsRepo = { updateAll: sinon.stub().resolves({ count: 0 }) };
            const locationDocsRepo = { updateAll: sinon.stub().resolves({ count: 0 }) };
            const { service, emailService } = buildService({
                userRepo, companyUsersRepo, companiesRepo,
                companyDocsRepo, locationDocsRepo, locationsRepo,
            });

            const result = await service.processApprovalInstruction({
                actionType: 'request_info',
                userId: 1,
                contactId: 'C001',
                timestamp: FUTURE,
                message: 'Please upload your ID',
            });

            expect(result.success).to.be.true();
            expect(result.approved).to.be.false();
            expect(emailService.sendCompanyRequestInformationEmail.calledOnce).to.be.true();
            expect(companiesRepo.updateById.calledWith(5, sinon.match({ status: CompanyStatus.REQUEST_INFORMATION }))).to.be.true();
        });
    });

    // ── processApprovalInstruction — validation ───────────────────────────────
    describe('processApprovalInstruction — schema validation', () => {
        it('throws BadRequest for unsupported actionType', async () => {
            const { service } = buildService();

            await expect(service.processApprovalInstruction({
                actionType: 'delete_user' as any,
                userId: 1,
                contactId: 'C001',
                timestamp: FUTURE,
            })).to.be.rejectedWith(/unsupported action type/i);
        });

        it('throws BadRequest for mismatched mappingVersion', async () => {
            const { service } = buildService();

            await expect(service.processApprovalInstruction({
                actionType: 'approve_user',
                userId: 1,
                contactId: 'C001',
                timestamp: FUTURE,
                mappingVersion: '99.0.0',
            })).to.be.rejectedWith(/not supported/i);
        });

        it('throws Conflict when instruction timestamp is older than user updatedAt', async () => {
            const userRepo = {
                findById: sinon.stub().resolves({
                    id: 1, status: UserStatus.PENDING,
                    updatedAt: new Date(FUTURE), // user is NEWER than the instruction
                }),
                updateById: sinon.stub().resolves(),
                find: sinon.stub().resolves([]),
            };
            const { service } = buildService({ userRepo });

            await expect(service.processApprovalInstruction({
                actionType: 'approve_user',
                userId: 1,
                contactId: 'C001',
                timestamp: PAST,
            })).to.be.rejectedWith(/stale instruction/i);
        });
    });
});
