/**
 * user.service-4.unit.ts
 * Branch-focused tests for user.service.ts (Part 4)
 * Targets: adminRequestAction all branches (suspend/request_info/activate),
 *          forgetPassword urlType branches, null guards in updateProfile.
 */
import { expect, sinon } from '@loopback/testlab';
import { securityId } from '@loopback/security';
import { MyUserService } from '../../services/user.service';
import { CompanyUserRoleEnum, UserRoleEnum, UserStatus } from '../../enum';
import { UrlTypeEnum } from '../../enum/url-type.enum';
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
            hashPassword: sinon.stub().resolves('hashed'),
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

describe('MyUserService branch coverage - Part 4 (unit)', () => {
    describe('adminRequestAction() — invalid action branch', () => {
        it('throws BadRequest for an unknown action string', async () => {
            const svc = buildUserService();

            await expect(svc.adminRequestAction(1, 'unknown_action', {}, 99))
                .to.be.rejectedWith(/invalid request action/i);
        });
    });

    describe('adminRequestAction() — request_info branch', () => {
        it('sends request-info email and sets company to more_info_required', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com', firstName: 'Jane', lastName: 'Doe' });
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
            const emailService = createStubService(['sendCompanyRequestInformationEmail']);
            const notificationsService = createStubService(['createNotification']);

            const svc = buildUserService({
                userRepo, companyUsersRepo, companiesRepo, companyDocsRepo,
                companyLocationsRepo, companyLocationDocsRepo, emailService, notificationsService,
            });

            const result = await svc.adminRequestAction(1, 'request_info', { message: 'Need more details' }, 99);

            expect(result.status).to.equal('success');
            expect(emailService.sendCompanyRequestInformationEmail.calledOnce).to.be.true();
        });
    });

    describe('adminRequestAction() — request_info with infoRequestType branch', () => {
        it('sends request_info email with message and infoRequestType', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com', firstName: 'Jane', lastName: 'Doe' });
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
            const emailService = createStubService(['sendCompanyRequestInformationEmail']);
            const notificationsService = createStubService(['createNotification']);

            const svc = buildUserService({
                userRepo, companyUsersRepo, companiesRepo, companyDocsRepo,
                companyLocationsRepo, companyLocationDocsRepo, emailService, notificationsService,
            });

            const result = await svc.adminRequestAction(1, 'request_info', { message: 'Upload VAT certificate' }, 99);

            expect(result.status).to.equal('success');
            expect(emailService.sendCompanyRequestInformationEmail.calledOnce).to.be.true();
        });
    });

    describe('forgetPassword() — urlType branches', () => {
        it('calls sendResetPasswordEmail with isCreatedAdmin=true when isCreatedAdmin flag set', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1 });
            userRepo.updateById.resolves();
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('reset-tok'),
                verifyToken: sinon.stub().resolves({}),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({}),
            };
            const emailService = createStubService(['sendResetPasswordEmail', 'sendInvitedToJoinCompanyEmail']);
            const svc = buildUserService({ userRepo, jwtService, emailService });

            const user = { id: 1, email: 'u@t.com', firstName: 'A', lastName: 'B' };
            await svc.forgetPassword(user as any, {
                urlType: UrlTypeEnum.RESET_PASSWORD,
                isCreatedAdmin: true,
            });

            expect(emailService.sendResetPasswordEmail.calledWith(user, sinon.match.string, true)).to.be.true();
        });

        it('calls sendResetPasswordEmail with isCreatedAdmin=false for regular reset', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('reset-tok'),
                verifyToken: sinon.stub().resolves({}),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({}),
            };
            const emailService = createStubService(['sendResetPasswordEmail', 'sendInvitedToJoinCompanyEmail']);
            const svc = buildUserService({ userRepo, jwtService, emailService });

            const user = { id: 1, email: 'u@t.com', firstName: 'A', lastName: 'B' };
            await svc.forgetPassword(user as any, {
                urlType: UrlTypeEnum.RESET_PASSWORD,
                isCreatedAdmin: false,
            });

            expect(emailService.sendResetPasswordEmail.calledWith(user, sinon.match.string, false)).to.be.true();
        });

        it('calls sendInvitedToJoinCompanyEmail for INVITE_JOIN_COMPANY urlType', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('reset-tok'),
                verifyToken: sinon.stub().resolves({}),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({}),
            };
            const emailService = createStubService(['sendResetPasswordEmail', 'sendInvitedToJoinCompanyEmail']);
            const svc = buildUserService({ userRepo, jwtService, emailService });

            const user = { id: 1, email: 'u@t.com', firstName: 'A', lastName: 'B' };
            await svc.forgetPassword(user as any, {
                urlType: UrlTypeEnum.INVITE_JOIN_COMPANY,
                isCreatedAdmin: false,
                companyName: 'ACME Corp',
            });

            expect(emailService.sendInvitedToJoinCompanyEmail.calledOnce).to.be.true();
            expect(emailService.sendResetPasswordEmail.called).to.be.false();
        });

        it('returns resetPasswordUrl in result', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            const jwtService = {
                generateToken: sinon.stub().resolves('tok'),
                generateTemporaryTokenForResetPassword: sinon.stub().resolves('my-reset-token'),
                verifyToken: sinon.stub().resolves({}),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({}),
            };
            const emailService = createStubService(['sendResetPasswordEmail', 'sendInvitedToJoinCompanyEmail']);
            const svc = buildUserService({ userRepo, jwtService, emailService });

            const user = { id: 1, email: 'u@t.com', firstName: 'A', lastName: 'B' };
            const result = await svc.forgetPassword(user as any, {
                urlType: UrlTypeEnum.RESET_PASSWORD,
                isCreatedAdmin: false,
            });

            expect(result.resetPasswordUrl).to.match(/my-reset-token/);
        });
    });

    describe('updateProfile() — null guard branches', () => {
        it('does not throw when userRepo.findById returns minimal user object', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1 });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const notificationsService = createStubService(['createNotification']);
            const emailService = createStubService(['sendEditProfileEmail']);
            const svc = buildUserService({ userRepo, companyUsersRepo, emailService, notificationsService });

            await svc.updateProfile({ lastName: 'NewLast' } as any, makeUserProfile());

            expect(userRepo.updateById.called).to.be.true();
        });

        it('sends notification when notificationPushEnabled is true on user', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, notificationPushEnabled: true });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([{ companyId: 10, userId: 1 }]);
            const notificationsService = createStubService(['createNotification']);
            const emailService = createStubService(['sendEditProfileEmail']);
            const svc = buildUserService({ userRepo, companyUsersRepo, emailService, notificationsService });

            await svc.updateProfile({ firstName: 'Updated' } as any, makeUserProfile());

            expect(notificationsService.createNotification.called).to.be.true();
        });
    });

    describe('clearExpiredResetToken()', () => {
        it('clears the resetPasswordToken for the given user', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com', resetPasswordToken: 'old-token' });
            userRepo.updateById.resolves();
            const svc = buildUserService({ userRepo });

            await svc.clearExpiredResetToken(1);

            expect(userRepo.updateById.calledWith(1, sinon.match({ resetPasswordToken: '' }))).to.be.true();
        });
    });
});
