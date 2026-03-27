/**
 * user.service-5.unit.ts
 * Coverage-focused tests for user.service.ts (Part 5)
 * Targets: adminRequestAction approve/reject branches, validatePasswordAndResetToken,
 *          resetPassword, updateById duplicate email error, getUserList, create.
 */
import { expect, sinon } from '@loopback/testlab';
import { securityId } from '@loopback/security';
import { MyUserService } from '../../services/user.service';
import { CompanyUserStatusEnum, CompanyDocumentStatus, CompanyStatus, UserRoleEnum, UserStatus } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildUserService(overrides: Record<string, any> = {}): MyUserService {
    return new MyUserService(
        overrides.userRepo ?? createStubRepo(),
        overrides.companiesRepo ?? createStubRepo(),
        overrides.companyUsersRepo ?? createStubRepo(),
        overrides.companyLocationsRepo ?? createStubRepo(),
        overrides.companyDocsRepo ?? createStubRepo(),
        overrides.companyLocationDocsRepo ?? createStubRepo(),
        overrides.passwordHasher ?? {
            hashPassword: sinon.stub().resolves('hashed_pw'),
            comparePassword: sinon.stub().resolves(true),
        },
        overrides.jwtService ?? {
            generateToken: sinon.stub().resolves('tok'),
            generateTemporaryTokenForResetPassword: sinon.stub().resolves('reset-tok'),
            verifyToken: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
            decodeTokenWithoutSecretKey: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
        },
        overrides.emailService ?? createStubService([
            'sendResetPasswordEmail',
            'sendInvitedToJoinCompanyEmail',
            'sendEditProfileEmail',
            'sendAccountVerificationApprovedEmail',
            'sendCompanyRejectedEmail',
            'sendCompanyRequestInformationEmail',
        ]),
        overrides.companyService ?? createStubService(['getCompanyById', 'getDisplayArray']),
        overrides.notificationsService ?? createStubService(['createNotification']),
    );
}

function makeUserProfile(overrides: Record<string, any> = {}): any {
    return {
        [securityId]: '1',
        id: 1,
        email: 'user@test.com',
        globalRole: UserRoleEnum.USER,
        companyId: 10,
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        username: '12345678',
        companyName: 'Test Co',
        createdAt: new Date(),
        ...overrides,
    };
}

describe('MyUserService extended coverage - Part 5 (unit)', () => {

    // ── adminRequestAction — approve branch ────────────────────────────────────
    describe('adminRequestAction() — approve branch', () => {
        it('approves user and company, sends verification email', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com', firstName: 'Jane', lastName: 'Doe' });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({ id: 5, companyId: 10, userId: 1 });
            companyUsersRepo.updateById.resolves();
            const companiesRepo = createStubRepo();
            companiesRepo.updateById.resolves();
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.updateAll.resolves({ count: 1 });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.find.resolves([{ id: 100, companyId: 10 }]);
            const companyLocationDocsRepo = createStubRepo();
            companyLocationDocsRepo.updateAll.resolves({ count: 0 });
            const emailService = createStubService(['sendAccountVerificationApprovedEmail']);
            const notificationsService = createStubService(['createNotification']);

            const svc = buildUserService({
                userRepo, companyUsersRepo, companiesRepo, companyDocsRepo,
                companyLocationsRepo, companyLocationDocsRepo, emailService, notificationsService,
            });

            const result = await svc.adminRequestAction(1, 'approve', {}, 99);

            expect(result.status).to.equal('success');
            expect(userRepo.updateById.calledWith(1, sinon.match({ status: UserStatus.ACTIVE }))).to.be.true();
            expect(companiesRepo.updateById.calledWith(10, sinon.match({ status: CompanyStatus.ACTIVE }))).to.be.true();
            expect(emailService.sendAccountVerificationApprovedEmail.calledOnce).to.be.true();
        });

        it('throws BadRequest when companyUser not found on approve', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves(null);
            const svc = buildUserService({ userRepo, companyUsersRepo });

            await expect(svc.adminRequestAction(1, 'approve', {}, 99))
                .to.be.rejectedWith(/already approved/i);
        });

        it('updates all location documents on approval', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com' });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({ id: 5, companyId: 10, userId: 1 });
            companyUsersRepo.updateById.resolves();
            const companiesRepo = createStubRepo();
            companiesRepo.updateById.resolves();
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.updateAll.resolves({ count: 1 });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.find.resolves([
                { id: 100, companyId: 10 },
                { id: 101, companyId: 10 },
            ]);
            const companyLocationDocsRepo = createStubRepo();
            companyLocationDocsRepo.updateAll.resolves({ count: 1 });
            const emailService = createStubService(['sendAccountVerificationApprovedEmail']);
            const notificationsService = createStubService(['createNotification']);

            const svc = buildUserService({
                userRepo, companyUsersRepo, companiesRepo, companyDocsRepo,
                companyLocationsRepo, companyLocationDocsRepo, emailService, notificationsService,
            });

            await svc.adminRequestAction(1, 'approve', {}, 99);

            expect(companyLocationDocsRepo.updateAll.callCount).to.equal(2);
        });
    });

    // ── adminRequestAction — reject branch ────────────────────────────────────
    describe('adminRequestAction() — reject branch', () => {
        it('rejects user and company, sends rejection email', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com', firstName: 'Bob', lastName: 'Smith' });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({ id: 5, companyId: 10, userId: 1 });
            companyUsersRepo.updateById.resolves();
            const companiesRepo = createStubRepo();
            companiesRepo.updateById.resolves();
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.updateAll.resolves({ count: 1 });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.find.resolves([]);
            const companyLocationDocsRepo = createStubRepo();
            companyLocationDocsRepo.updateAll.resolves({ count: 0 });
            const emailService = createStubService(['sendCompanyRejectedEmail']);
            const notificationsService = createStubService(['createNotification']);

            const svc = buildUserService({
                userRepo, companyUsersRepo, companiesRepo, companyDocsRepo,
                companyLocationsRepo, companyLocationDocsRepo, emailService, notificationsService,
            });

            const result = await svc.adminRequestAction(1, 'reject', { rejectReason: 'Documents incomplete' }, 99);

            expect(result.status).to.equal('success');
            expect(companiesRepo.updateById.calledWith(10, sinon.match({ status: CompanyStatus.REJECTED }))).to.be.true();
            expect(emailService.sendCompanyRejectedEmail.calledOnce).to.be.true();
        });

        it('uses message field when rejectReason is "Other"', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com' });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({ id: 5, companyId: 10, userId: 1 });
            companyUsersRepo.updateById.resolves();
            const companiesRepo = createStubRepo();
            companiesRepo.updateById.resolves();
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.updateAll.resolves({ count: 0 });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.find.resolves([]);
            const companyLocationDocsRepo = createStubRepo();
            companyLocationDocsRepo.updateAll.resolves({ count: 0 });
            const emailService = createStubService(['sendCompanyRejectedEmail']);
            const notificationsService = createStubService(['createNotification']);

            const svc = buildUserService({
                userRepo, companyUsersRepo, companiesRepo, companyDocsRepo,
                companyLocationsRepo, companyLocationDocsRepo, emailService, notificationsService,
            });

            await svc.adminRequestAction(1, 'reject', { rejectReason: 'Other', message: 'Custom reason' }, 99);

            const emailArg = emailService.sendCompanyRejectedEmail.firstCall.args[1];
            expect(emailArg).to.equal('Custom reason');
        });

        it('throws BadRequest when companyUser not found on reject', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves(null);
            const svc = buildUserService({ userRepo, companyUsersRepo });

            await expect(svc.adminRequestAction(1, 'reject', { rejectReason: 'Bad docs' }, 99))
                .to.be.rejectedWith(/already approved/i);
        });
    });

    // ── validatePasswordAndResetToken ──────────────────────────────────────────
    describe('validatePasswordAndResetToken()', () => {
        it('throws token-expired when token exp is in the past', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'expired-tok' });
            userRepo.updateById.resolves();
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('reset-tok'),
                verifyToken: sinon.stub().resolves({}),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({
                    id: 1,
                    exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
                }),
            };
            const svc = buildUserService({ userRepo, jwtService });

            await expect(
                svc.validatePasswordAndResetToken({
                    resetPasswordToken: 'expired-tok',
                    newPassword: 'NewPass123!',
                    confirmNewPassword: 'NewPass123!',
                } as any)
            ).to.be.rejectedWith(/token-expired/i);
        });

        it('throws when newPassword is less than 8 characters', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'valid-tok' });
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('reset-tok'),
                verifyToken: sinon.stub().resolves({}),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({
                    id: 1,
                    exp: Math.floor(Date.now() / 1000) + 3600,
                }),
            };
            const svc = buildUserService({ userRepo, jwtService });

            await expect(
                svc.validatePasswordAndResetToken({
                    resetPasswordToken: 'valid-tok',
                    newPassword: 'short',
                    confirmNewPassword: 'short',
                } as any)
            ).to.be.rejectedWith(/8.*character|character.*8/i);
        });

        it('throws when passwords do not match', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'valid-tok' });
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('reset-tok'),
                verifyToken: sinon.stub().resolves({}),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({
                    id: 1,
                    exp: Math.floor(Date.now() / 1000) + 3600,
                }),
            };
            const svc = buildUserService({ userRepo, jwtService });

            await expect(
                svc.validatePasswordAndResetToken({
                    resetPasswordToken: 'valid-tok',
                    newPassword: 'ValidPass1!',
                    confirmNewPassword: 'DifferentPass1!',
                } as any)
            ).to.be.rejectedWith(/does-not-match|not.*match/i);
        });

        it('throws when resetPasswordToken does not match stored token', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'stored-tok' });
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('reset-tok'),
                verifyToken: sinon.stub().resolves({}),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({
                    id: 1,
                    exp: Math.floor(Date.now() / 1000) + 3600,
                }),
            };
            const svc = buildUserService({ userRepo, jwtService });

            await expect(
                svc.validatePasswordAndResetToken({
                    resetPasswordToken: 'different-tok',
                    newPassword: 'ValidPass1!',
                    confirmNewPassword: 'ValidPass1!',
                } as any, true) // isResetPasswordRequest = true
            ).to.be.rejectedWith(/does-not-exist|not.*exist/i);
        });

        it('returns user when all validation passes', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'valid-tok', email: 'u@t.com' });
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('reset-tok'),
                verifyToken: sinon.stub().resolves({}),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({
                    id: 1,
                    exp: Math.floor(Date.now() / 1000) + 3600,
                }),
            };
            const svc = buildUserService({ userRepo, jwtService });

            const user = await svc.validatePasswordAndResetToken({
                resetPasswordToken: 'valid-tok',
                newPassword: 'ValidPass1!',
                confirmNewPassword: 'ValidPass1!',
            } as any, true);

            expect(user.id).to.equal(1);
        });
    });

    // ── resetPassword ──────────────────────────────────────────────────────────
    describe('resetPassword()', () => {
        it('hashes new password and updates user', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'valid-tok' });
            userRepo.updateById.resolves();
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('reset-tok'),
                verifyToken: sinon.stub().resolves({ id: 1 }),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({
                    id: 1,
                    exp: Math.floor(Date.now() / 1000) + 3600,
                }),
            };
            const passwordHasher = {
                hashPassword: sinon.stub().resolves('hashed_new_pw'),
                comparePassword: sinon.stub().resolves(true),
            };
            const svc = buildUserService({ userRepo, jwtService, passwordHasher });

            await svc.resetPassword({
                resetPasswordToken: 'valid-tok',
                newPassword: 'NewSecurePass1!',
                confirmNewPassword: 'NewSecurePass1!',
            } as any);

            expect(passwordHasher.hashPassword.calledWith('NewSecurePass1!')).to.be.true();
            expect(userRepo.updateById.calledWith(1, sinon.match({ passwordHash: 'hashed_new_pw' }))).to.be.true();
        });
    });

    // ── updateById — duplicate email error ────────────────────────────────────
    describe('updateById() — error branches', () => {
        it('throws Conflict when update triggers duplicate email constraint', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, status: 'active' });
            const dupError = Object.assign(
                new Error('duplicate key value violates unique constraint "users_email_idx"'),
                { code: '23505' },
            );
            userRepo.updateById.rejects(dupError);
            const svc = buildUserService({ userRepo });

            await expect(
                svc.updateById(1, { email: 'existing@test.com' } as any)
            ).to.be.rejectedWith(/exist|duplicate/i);
        });

        it('re-throws non-duplicate errors from updateById', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, status: 'active' });
            userRepo.updateById.rejects(new Error('Connection refused'));
            const svc = buildUserService({ userRepo });

            await expect(
                svc.updateById(1, { firstName: 'Test' } as any)
            ).to.be.rejectedWith('Connection refused');
        });
    });

    // ── getUserList ────────────────────────────────────────────────────────────
    describe('getUserList()', () => {
        it('returns list of users with id/firstName/lastName/email fields', async () => {
            const userRepo = createStubRepo();
            userRepo.find.resolves([
                { id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@t.com' },
                { id: 2, firstName: 'Bob', lastName: 'Jones', email: 'bob@t.com' },
            ]);
            const svc = buildUserService({ userRepo });

            const result = await svc.getUserList({});

            expect(result).to.have.length(2);
            expect(userRepo.find.calledOnce).to.be.true();
        });
    });

    // ── create ─────────────────────────────────────────────────────────────────
    describe('create()', () => {
        it('creates and returns a user', async () => {
            const userRepo = createStubRepo();
            userRepo.create.resolves({ id: 1, email: 'new@t.com', firstName: 'New', lastName: 'User' });
            const svc = buildUserService({ userRepo });

            const result = await svc.create({ email: 'new@t.com', firstName: 'New', lastName: 'User' } as any);

            expect(result.id).to.equal(1);
            expect(userRepo.create.calledOnce).to.be.true();
        });
    });

    // ── updateProfile — email field triggers email send ────────────────────────
    describe('updateProfile() — shouldSendEmail branches', () => {
        it('sends edit-profile email when email field changes', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, notificationPushEnabled: false });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const emailService = createStubService(['sendEditProfileEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildUserService({ userRepo, companyUsersRepo, emailService, notificationsService });

            await svc.updateProfile({ email: 'new@t.com' } as any, makeUserProfile());

            expect(emailService.sendEditProfileEmail.calledOnce).to.be.true();
        });

        it('does not send email when no tracked field changes', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, notificationPushEnabled: false });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const emailService = createStubService(['sendEditProfileEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildUserService({ userRepo, companyUsersRepo, emailService, notificationsService });

            await svc.updateProfile({ notificationPushEnabled: true } as any, makeUserProfile());

            expect(emailService.sendEditProfileEmail.called).to.be.false();
        });

        it('throws Conflict when update triggers duplicate email constraint in updateProfile', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, notificationPushEnabled: false });
            const dupError = Object.assign(
                new Error('duplicate key value violates unique constraint "users_email_idx"'),
                { code: '23505' },
            );
            userRepo.updateById.rejects(dupError);
            const svc = buildUserService({ userRepo });

            await expect(
                svc.updateProfile({ email: 'taken@t.com' } as any, makeUserProfile())
            ).to.be.rejectedWith(/exist|duplicate/i);
        });
    });
});
