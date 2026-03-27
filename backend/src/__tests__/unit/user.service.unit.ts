import { expect, sinon } from '@loopback/testlab';
import { securityId } from '@loopback/security';
import { MyUserService } from '../../services/user.service';
import { CompanyDocumentStatus, CompanyStatus, CompanyUserRoleEnum, CompanyUserStatusEnum, UserRoleEnum, UserStatus } from '../../enum';
import { UrlTypeEnum } from '../../enum/url-type.enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function makeUserProfile(overrides: Record<string, any> = {}): any {
    return {
        [securityId]: '1',
        id: 1,
        email: 'user@test.com',
        globalRole: UserRoleEnum.USER,
        companyId: 10,
        companyRole: CompanyUserRoleEnum.BUYER,
        isHaulier: false,
        isBuyer: true,
        isSeller: false,
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        username: '12345678',
        companyName: 'Test Co',
        createdAt: new Date(),
        ...overrides,
    };
}

function buildUserService(overrides: Record<string, any> = {}): MyUserService {
    return new MyUserService(
        overrides.userRepo ?? createStubRepo(),
        overrides.companiesRepo ?? createStubRepo(),
        overrides.companyUsersRepo ?? createStubRepo(),
        overrides.companyLocationsRepo ?? createStubRepo(),
        overrides.companyDocsRepo ?? createStubRepo(),
        overrides.companyLocationDocsRepo ?? createStubRepo(),
        overrides.passwordHasher ?? { hashPassword: sinon.stub().resolves('hashed'), comparePassword: sinon.stub().resolves(true) },
        overrides.jwtService ?? {
            generateToken: sinon.stub().resolves('tok'),
            generateTemporaryTokenForResetPassword: sinon.stub().resolves('reset-tok'),
            verifyToken: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
            decodeTokenWithoutSecretKey: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
        },
        overrides.emailService ?? createStubService(['sendResetPasswordEmail', 'sendInvitedToJoinCompanyEmail', 'sendEditProfileEmail', 'sendAccountVerificationApprovedEmail']),
        overrides.companyService ?? createStubService(['getCompanyById']),
        overrides.notificationsService ?? createStubService(['createNotification']),
    );
}

describe('MyUserService (unit)', () => {
    describe('convertToUserProfile()', () => {
        it('maps user fields to profile shape', () => {
            const svc = buildUserService();
            const user: any = {
                id: 5,
                email: 'u@test.com',
                firstName: 'Alice',
                lastName: 'Smith',
                username: '11223344',
                globalRole: UserRoleEnum.USER,
                isHaulier: false,
            };
            const companyUser: any = { companyRole: CompanyUserRoleEnum.SELLER };
            const company: any = { id: 20, name: 'Acme Ltd', isBuyer: false, isSeller: true };

            const profile = svc.convertToUserProfile(user, companyUser, company);

            expect(profile[securityId]).to.equal('5');
            expect(profile.email).to.equal('u@test.com');
            expect(profile.companyRole).to.equal(CompanyUserRoleEnum.SELLER);
            expect(profile.companyId).to.equal(20);
            expect(profile.isSeller).to.be.true();
        });

        it('uses safe defaults when companyUser and company are null', () => {
            const svc = buildUserService();
            const user: any = { id: 3, email: 'u@x.com', firstName: 'Bob', lastName: 'Jones', globalRole: UserRoleEnum.USER, isHaulier: false };

            const profile = svc.convertToUserProfile(user, null, null);

            expect(profile.companyId).to.equal(0);
            expect(profile.companyName).to.equal('');
            expect(profile.isBuyer).to.be.false();
        });
    });

    describe('forgetPassword()', () => {
        it('generates reset token, updates user, and sends reset email', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            const jwtService = { generateTemporaryTokenForResetPassword: sinon.stub().resolves('reset-tok') };
            const emailService = createStubService(['sendResetPasswordEmail']);
            const svc = buildUserService({ userRepo, jwtService, emailService });

            const user: any = { id: 1, email: 'u@test.com', firstName: 'J', lastName: 'D' };
            const result = await svc.forgetPassword(user, { urlType: UrlTypeEnum.RESET_PASSWORD, isCreatedAdmin: false });

            expect(userRepo.updateById.calledOnce).to.be.true();
            expect(userRepo.updateById.firstCall.args[1]).to.containEql({ resetPasswordToken: 'reset-tok' });
            expect(emailService.sendResetPasswordEmail.calledOnce).to.be.true();
            expect(result.resetPasswordUrl).to.containEql('reset-tok');
        });

        it('sends invite email for INVITE_JOIN_COMPANY url type', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            const jwtService = { generateTemporaryTokenForResetPassword: sinon.stub().resolves('invite-tok') };
            const emailService = createStubService(['sendInvitedToJoinCompanyEmail']);
            const svc = buildUserService({ userRepo, jwtService, emailService });

            const user: any = { id: 2, email: 'u@test.com' };
            await svc.forgetPassword(user, { urlType: UrlTypeEnum.INVITE_JOIN_COMPANY, isCreatedAdmin: false, companyName: 'Acme' });

            expect(emailService.sendInvitedToJoinCompanyEmail.calledOnce).to.be.true();
        });
    });

    describe('validatePasswordAndResetToken()', () => {
        it('throws BadRequest when token expired', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'old-tok' });
            userRepo.updateById.resolves();
            const jwtService = {
                decodeTokenWithoutSecretKey: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) - 100 }),
            };
            const svc = buildUserService({ userRepo, jwtService });

            await expect(svc.validatePasswordAndResetToken({
                resetPasswordToken: 'old-tok',
                newPassword: 'newpass123',
                confirmNewPassword: 'newpass123',
            } as any)).to.be.rejectedWith('token-expired');
        });

        it('throws UnprocessableEntity when passwords do not match', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'tok' });
            const jwtService = {
                decodeTokenWithoutSecretKey: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
            };
            const svc = buildUserService({ userRepo, jwtService });

            await expect(svc.validatePasswordAndResetToken({
                resetPasswordToken: 'tok',
                newPassword: 'newpass123',
                confirmNewPassword: 'different123',
            } as any)).to.be.rejectedWith('password-does-not-match');
        });

        it('throws UnprocessableEntity when password too short', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'tok' });
            const jwtService = {
                decodeTokenWithoutSecretKey: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
            };
            const svc = buildUserService({ userRepo, jwtService });

            await expect(svc.validatePasswordAndResetToken({
                resetPasswordToken: 'tok',
                newPassword: 'short',
                confirmNewPassword: 'short',
            } as any)).to.be.rejectedWith('password-must-have-at-least-8-characters');
        });

        it('returns user on valid token and matching passwords', async () => {
            const mockUser: any = { id: 1, resetPasswordToken: 'valid-tok' };
            const userRepo = createStubRepo();
            userRepo.findById.resolves(mockUser);
            const jwtService = {
                decodeTokenWithoutSecretKey: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
            };
            const svc = buildUserService({ userRepo, jwtService });

            const user = await svc.validatePasswordAndResetToken({
                resetPasswordToken: 'valid-tok',
                newPassword: 'newpass123',
                confirmNewPassword: 'newpass123',
            } as any);

            expect(user.id).to.equal(1);
        });
    });

    describe('updateProfile()', () => {
        it('calls updateById and sends email when profile fields present', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, notificationPushEnabled: true, status: UserStatus.ACTIVE });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const emailService = createStubService(['sendEditProfileEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildUserService({ userRepo, companyUsersRepo, emailService, notificationsService });

            await svc.updateProfile({ email: 'new@test.com' } as any, makeUserProfile());

            expect(userRepo.updateById.calledOnce).to.be.true();
            expect(emailService.sendEditProfileEmail.calledOnce).to.be.true();
        });

        it('does not send email when no profile-triggering fields present', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, notificationPushEnabled: false, status: UserStatus.ACTIVE });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const emailService = createStubService(['sendEditProfileEmail']);
            const svc = buildUserService({ userRepo, companyUsersRepo, emailService });

            await svc.updateProfile({ notificationPushEnabled: false } as any, makeUserProfile());

            expect(emailService.sendEditProfileEmail.called).to.be.false();
        });
    });

    describe('adminRequestAction()', () => {
        it('approve: updates user, companyUser, and company to ACTIVE', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com' });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({ id: 5, companyId: 10, userId: 1 });
            companyUsersRepo.updateById.resolves();
            companyUsersRepo.find.resolves([]);
            const companiesRepo = createStubRepo();
            companiesRepo.updateById.resolves();
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.updateAll.resolves();
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.find.resolves([]);
            const companyLocationDocsRepo = createStubRepo();
            companyLocationDocsRepo.updateAll.resolves();
            const emailService = createStubService(['sendAccountVerificationApprovedEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildUserService({
                userRepo, companyUsersRepo, companiesRepo, companyDocsRepo,
                companyLocationsRepo, companyLocationDocsRepo, emailService, notificationsService,
            });

            const result = await svc.adminRequestAction(1, 'approve', {}, 99);

            expect(result.status).to.equal('success');
            expect(userRepo.updateById.calledWith(1, { status: UserStatus.ACTIVE })).to.be.true();
            expect(companyUsersRepo.updateById.calledWith(5, sinon.match({ status: CompanyUserStatusEnum.ACTIVE }))).to.be.true();
            expect(companiesRepo.updateById.calledWith(10, sinon.match({ status: CompanyStatus.ACTIVE }))).to.be.true();
        });

        it('reject: updates user and company to REJECTED', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com' });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({ id: 5, companyId: 10, userId: 1 });
            companyUsersRepo.updateById.resolves();
            const companiesRepo = createStubRepo();
            companiesRepo.updateById.resolves();
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.updateAll.resolves();
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.find.resolves([]);
            const companyLocationDocsRepo = createStubRepo();
            companyLocationDocsRepo.updateAll.resolves();
            const emailService = createStubService(['sendCompanyRejectedEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildUserService({
                userRepo, companyUsersRepo, companiesRepo, companyDocsRepo,
                companyLocationsRepo, companyLocationDocsRepo, emailService, notificationsService,
            });

            await svc.adminRequestAction(1, 'reject', { rejectReason: 'Invalid docs' }, 99);

            expect(userRepo.updateById.calledWith(1, { status: UserStatus.REJECTED })).to.be.true();
        });
    });
});
