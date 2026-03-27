/**
 * user.service-7.unit.ts
 * Coverage-focused tests for user.service.ts (Part 7)
 * Targets: convertToUserProfile, forgetPassword (all urlType branches),
 *          clearExpiredResetToken, getUserInfoByAdmin (no-company and with-company paths),
 *          updateProfile notification push branch.
 */
import { expect, sinon } from '@loopback/testlab';
import { securityId } from '@loopback/security';
import { MyUserService } from '../../services/user.service';
import { UserRoleEnum, UserStatus, UrlTypeEnum } from '../../enum';
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

describe('MyUserService extended coverage - Part 7 (unit)', () => {

    // ── convertToUserProfile ───────────────────────────────────────────────────
    describe('convertToUserProfile()', () => {
        it('maps user fields into MyUserProfile correctly', () => {
            const svc = buildUserService();
            const user: any = {
                id: 42,
                email: 'alice@example.com',
                firstName: 'Alice',
                lastName: 'Smith',
                username: 'alicesmith',
                globalRole: UserRoleEnum.USER,
                isHaulier: false,
            };

            const result = svc.convertToUserProfile(user);

            expect(result[securityId]).to.equal('42');
            expect(result.id).to.equal(42);
            expect(result.email).to.equal('alice@example.com');
            expect(result.name).to.equal('Alice Smith');
            expect(result.firstName).to.equal('Alice');
            expect(result.lastName).to.equal('Smith');
            expect(result.username).to.equal('alicesmith');
        });

        it('uses company id and name from company when provided', () => {
            const svc = buildUserService();
            const user: any = { id: 5, email: 'b@b.com', firstName: 'B', lastName: 'B', globalRole: UserRoleEnum.USER };
            const company: any = { id: 99, name: 'WidgetCorp', isBuyer: true, isSeller: false };

            const result = svc.convertToUserProfile(user, null, company);

            expect(result.companyId).to.equal(99);
            expect(result.companyName).to.equal('WidgetCorp');
            expect(result.isBuyer).to.equal(true);
            expect(result.isSeller).to.equal(false);
        });

        it('falls back to empty string for companyName and 0 for companyId when company is null', () => {
            const svc = buildUserService();
            const user: any = { id: 3, email: 'c@c.com', firstName: 'C', lastName: 'C', globalRole: UserRoleEnum.USER };

            const result = svc.convertToUserProfile(user, null, null);

            expect(result.companyId).to.equal(0);
            expect(result.companyName).to.equal('');
        });

        it('uses companyUser role when provided', () => {
            const svc = buildUserService();
            const user: any = { id: 7, email: 'd@d.com', firstName: 'D', lastName: 'D', globalRole: UserRoleEnum.USER };
            const companyUser: any = { companyRole: 'buyer' };

            const result = svc.convertToUserProfile(user, companyUser, null);

            expect(result.companyRole).to.equal('buyer');
        });
    });

    // ── forgetPassword — RESET_PASSWORD branch ────────────────────────────────
    describe('forgetPassword() — urlType branches', () => {
        it('sends reset password email and returns URL for RESET_PASSWORD urlType', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            const emailService = createStubService(['sendResetPasswordEmail', 'sendInvitedToJoinCompanyEmail']);
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('reset-tok-123'),
                verifyToken: sinon.stub().resolves({}),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({}),
            };

            const svc = buildUserService({ userRepo, emailService, jwtService });
            const foundUser: any = { id: 1, email: 'u@t.com', firstName: 'U', lastName: 'S' };

            const result = await svc.forgetPassword(foundUser, {
                urlType: UrlTypeEnum.RESET_PASSWORD,
                isCreatedAdmin: false,
            });

            expect(result).to.have.property('resetPasswordUrl');
            expect(result.resetPasswordUrl).to.match(/reset_pass=1.*reset-tok-123/);
            expect(emailService.sendResetPasswordEmail.calledOnce).to.be.true();
            const [, , isAdmin] = emailService.sendResetPasswordEmail.firstCall.args;
            expect(isAdmin).to.equal(false);
        });

        it('sends admin reset password email when isCreatedAdmin is true', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            const emailService = createStubService(['sendResetPasswordEmail', 'sendInvitedToJoinCompanyEmail']);
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('admin-tok'),
                verifyToken: sinon.stub().resolves({}),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({}),
            };
            const svc = buildUserService({ userRepo, emailService, jwtService });
            const foundUser: any = { id: 2, email: 'admin@t.com' };

            await svc.forgetPassword(foundUser, {
                urlType: UrlTypeEnum.RESET_PASSWORD,
                isCreatedAdmin: true,
            });

            const [, , isAdmin] = emailService.sendResetPasswordEmail.firstCall.args;
            expect(isAdmin).to.equal(true);
        });

        it('sends invite email for INVITE_JOIN_COMPANY urlType', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            const emailService = createStubService(['sendResetPasswordEmail', 'sendInvitedToJoinCompanyEmail']);
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('invite-tok'),
                verifyToken: sinon.stub().resolves({}),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({}),
            };
            const svc = buildUserService({ userRepo, emailService, jwtService });
            const foundUser: any = { id: 3, email: 'invite@t.com' };

            const result = await svc.forgetPassword(foundUser, {
                urlType: UrlTypeEnum.INVITE_JOIN_COMPANY,
                isCreatedAdmin: false,
                companyName: 'AcmeCorp',
            });

            expect(result.resetPasswordUrl).to.match(/invite-tok/);
            expect(emailService.sendInvitedToJoinCompanyEmail.calledOnce).to.be.true();
            const [, companyArg] = emailService.sendInvitedToJoinCompanyEmail.firstCall.args;
            expect(companyArg).to.equal('AcmeCorp');
        });

        it('sends invite email for REQUEST_JOIN_COMPANY urlType', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            const emailService = createStubService(['sendResetPasswordEmail', 'sendInvitedToJoinCompanyEmail']);
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('request-tok'),
                verifyToken: sinon.stub().resolves({}),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({}),
            };
            const svc = buildUserService({ userRepo, emailService, jwtService });
            const foundUser: any = { id: 4, email: 'req@t.com' };

            await svc.forgetPassword(foundUser, {
                urlType: UrlTypeEnum.REQUEST_JOIN_COMPANY,
                isCreatedAdmin: false,
                companyName: 'BetaCorp',
            });

            expect(emailService.sendInvitedToJoinCompanyEmail.calledOnce).to.be.true();
        });

        it('stores reset token on user record', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('stored-tok'),
                verifyToken: sinon.stub().resolves({}),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({}),
            };
            const emailService = createStubService(['sendResetPasswordEmail']);
            const svc = buildUserService({ userRepo, jwtService, emailService });
            const foundUser: any = { id: 5, email: 'e@e.com' };

            await svc.forgetPassword(foundUser, {
                urlType: UrlTypeEnum.RESET_PASSWORD,
                isCreatedAdmin: false,
            });

            expect(userRepo.updateById.calledWith(5, sinon.match({ resetPasswordToken: 'stored-tok' }))).to.be.true();
        });
    });

    // ── clearExpiredResetToken ─────────────────────────────────────────────────
    describe('clearExpiredResetToken()', () => {
        it('clears the resetPasswordToken on the user record', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com', resetPasswordToken: 'old-tok', firstName: 'A' });
            userRepo.updateById.resolves();
            const svc = buildUserService({ userRepo });

            await svc.clearExpiredResetToken(1);

            expect(userRepo.updateById.calledWith(1, sinon.match({ resetPasswordToken: '' }))).to.be.true();
        });

        it('calls findById with the correct userId', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 99, resetPasswordToken: 'tok' });
            userRepo.updateById.resolves();
            const svc = buildUserService({ userRepo });

            await svc.clearExpiredResetToken(99);

            expect(userRepo.findById.calledWith(99)).to.be.true();
        });
    });

    // ── getUserInfoByAdmin — no company path ───────────────────────────────────
    describe('getUserInfoByAdmin()', () => {
        it('returns user data without company when companyId is null', async () => {
            const userRepo = createStubRepo();
            userRepo.dataSource = {
                execute: sinon.stub().resolves([{
                    id: 1, email: 'u@t.com', firstName: 'A', lastName: 'B',
                    globalRole: UserRoleEnum.USER, status: UserStatus.ACTIVE,
                    companyId: null,
                }]),
            };
            const svc = buildUserService({ userRepo });

            const result = await svc.getUserInfoByAdmin(1);

            expect(result.status).to.equal('success');
            expect(result.data).to.have.property('id', 1);
            // Should not have a company object since companyId is null
            expect((result.data as any).company).to.be.undefined();
        });

        it('throws NotFound when user query returns empty result', async () => {
            const userRepo = createStubRepo();
            userRepo.dataSource = {
                execute: sinon.stub().resolves([]),
            };
            const svc = buildUserService({ userRepo });

            await expect(svc.getUserInfoByAdmin(999))
                .to.be.rejectedWith(/not.found/i);
        });

        it('returns user with company data when companyId exists', async () => {
            const userRow = {
                id: 2, email: 'b@t.com', firstName: 'B', lastName: 'C',
                globalRole: UserRoleEnum.USER, status: UserStatus.ACTIVE,
                companyId: 10,
            };
            const companyRow = {
                id: 10, name: 'TestCo', isSeller: true, isBuyer: false,
                status: 'active',
            };

            const executeStub = sinon.stub();
            // First call: user query
            executeStub.onFirstCall().resolves([userRow]);
            // Second call: company query
            executeStub.onSecondCall().resolves([companyRow]);
            // Third call: locations query
            executeStub.onThirdCall().resolves([]);
            // Fourth call: documents query
            executeStub.onCall(3).resolves([]);

            const userRepo = createStubRepo();
            userRepo.dataSource = { execute: executeStub };
            const svc = buildUserService({ userRepo });

            const result = await svc.getUserInfoByAdmin(2);

            expect(result.status).to.equal('success');
            expect((result.data as any).company).to.not.be.undefined();
            expect((result.data as any).company.name).to.equal('TestCo');
        });

        it('computes companyType as "seller" when isSeller=true and isBuyer=false', async () => {
            const userRow = { id: 3, email: 'c@t.com', companyId: 20 };
            const companyRow = { id: 20, name: 'SellerCo', isSeller: true, isBuyer: false };
            const executeStub = sinon.stub();
            executeStub.onFirstCall().resolves([userRow]);
            executeStub.onSecondCall().resolves([companyRow]);
            executeStub.onThirdCall().resolves([]);
            executeStub.onCall(3).resolves([]);

            const userRepo = createStubRepo();
            userRepo.dataSource = { execute: executeStub };
            const svc = buildUserService({ userRepo });

            const result = await svc.getUserInfoByAdmin(3);

            expect((result.data as any).companyType).to.equal('seller');
        });

        it('computes companyType as "buyer" when isSeller=false and isBuyer=true', async () => {
            const userRow = { id: 4, email: 'd@t.com', companyId: 30 };
            const companyRow = { id: 30, name: 'BuyerCo', isSeller: false, isBuyer: true };
            const executeStub = sinon.stub();
            executeStub.onFirstCall().resolves([userRow]);
            executeStub.onSecondCall().resolves([companyRow]);
            executeStub.onThirdCall().resolves([]);
            executeStub.onCall(3).resolves([]);

            const userRepo = createStubRepo();
            userRepo.dataSource = { execute: executeStub };
            const svc = buildUserService({ userRepo });

            const result = await svc.getUserInfoByAdmin(4);

            expect((result.data as any).companyType).to.equal('buyer');
        });

        it('computes companyType as "both" when isSeller=true and isBuyer=true', async () => {
            const userRow = { id: 5, email: 'e@t.com', companyId: 40 };
            const companyRow = { id: 40, name: 'BothCo', isSeller: true, isBuyer: true };
            const executeStub = sinon.stub();
            executeStub.onFirstCall().resolves([userRow]);
            executeStub.onSecondCall().resolves([companyRow]);
            executeStub.onThirdCall().resolves([]);
            executeStub.onCall(3).resolves([]);

            const userRepo = createStubRepo();
            userRepo.dataSource = { execute: executeStub };
            const svc = buildUserService({ userRepo });

            const result = await svc.getUserInfoByAdmin(5);

            expect((result.data as any).companyType).to.equal('both');
        });
    });

    // ── updateProfile — notificationPushEnabled branch ────────────────────────
    describe('updateProfile() — notificationPushEnabled branch', () => {
        it('creates NOTIFICATIONS_ENABLED notification when push enabled transitions false→true', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, notificationPushEnabled: false });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const notificationsService = createStubService(['createNotification']);
            const emailService = createStubService(['sendEditProfileEmail']);
            const svc = buildUserService({ userRepo, companyUsersRepo, notificationsService, emailService });

            await svc.updateProfile({ notificationPushEnabled: true } as any, makeUserProfile());

            expect(notificationsService.createNotification.called).to.be.true();
            const calls = notificationsService.createNotification.getCalls();
            const notifTypes = calls.map((c: any) => c.args[1]);
            expect(notifTypes).to.containEql('notifications_enabled');
        });

        it('does NOT send NOTIFICATIONS_ENABLED notification when push was already true', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, notificationPushEnabled: true }); // already enabled
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const notificationsService = createStubService(['createNotification']);
            const emailService = createStubService(['sendEditProfileEmail']);
            const svc = buildUserService({ userRepo, companyUsersRepo, notificationsService, emailService });

            await svc.updateProfile({ notificationPushEnabled: true } as any, makeUserProfile());

            // Should not call createNotification with notifications_enabled type
            const calls = notificationsService.createNotification.getCalls();
            const notifTypes = calls.map((c: any) => c.args[1]);
            expect(notifTypes).to.not.containEql('notifications_enabled');
        });
    });

    // ── resetPassword — token verify + hash + update path ─────────────────────
    describe('resetPassword() — full flow', () => {
        it('verifies token, validates, hashes password, and updates user', async () => {
            const userRepo = createStubRepo();
            userRepo.findById
                .onFirstCall().resolves({ id: 1, resetPasswordToken: 'valid-tok' })
                .onSecondCall().resolves({ id: 1, resetPasswordToken: 'valid-tok' }); // clearExpiredResetToken call
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
                hashPassword: sinon.stub().resolves('new-hashed-pw'),
                comparePassword: sinon.stub().resolves(true),
            };
            const svc = buildUserService({ userRepo, jwtService, passwordHasher });

            await svc.resetPassword({
                resetPasswordToken: 'valid-tok',
                newPassword: 'ValidPass123!',
                confirmNewPassword: 'ValidPass123!',
            } as any);

            expect(passwordHasher.hashPassword.calledWith('ValidPass123!')).to.be.true();
            expect(userRepo.updateById.calledWith(1, sinon.match({ passwordHash: 'new-hashed-pw' }))).to.be.true();
        });
    });
});
