import { expect, sinon } from '@loopback/testlab';
import { securityId } from '@loopback/security';
import { MyUserService } from '../../services/user.service';
import { CompanyUserRoleEnum, CompanyUserStatusEnum, UserRoleEnum, UserStatus } from '../../enum';
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

describe('MyUserService (unit) - part 3', () => {
    describe('validatePasswordAndResetToken()', () => {
        it('throws BadRequest when token is expired', async () => {
            const jwtService = {
                verifyToken: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) - 100 }),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) - 100 }),
            };
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'old-tok' });
            userRepo.updateById.resolves();
            const svc = buildUserService({ userRepo, jwtService });

            await expect(svc.validatePasswordAndResetToken({
                resetPasswordToken: 'old-tok',
                newPassword: 'newpass123',
                confirmNewPassword: 'newpass123',
            } as any)).to.be.rejectedWith('token-expired');
        });

        it('throws UnprocessableEntity when new password is too short', async () => {
            const jwtService = {
                verifyToken: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
            };
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'tok' });
            const svc = buildUserService({ userRepo, jwtService });

            await expect(svc.validatePasswordAndResetToken({
                resetPasswordToken: 'tok',
                newPassword: 'short',
                confirmNewPassword: 'short',
            } as any)).to.be.rejectedWith('password-must-have-at-least-8-characters');
        });

        it('throws UnprocessableEntity when passwords do not match', async () => {
            const jwtService = {
                verifyToken: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
            };
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'tok' });
            const svc = buildUserService({ userRepo, jwtService });

            await expect(svc.validatePasswordAndResetToken({
                resetPasswordToken: 'tok',
                newPassword: 'password123',
                confirmNewPassword: 'different123',
            } as any)).to.be.rejectedWith('password-does-not-match');
        });

        it('throws NotFound when token does not match stored token', async () => {
            const jwtService = {
                verifyToken: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
            };
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'stored-tok' });
            const svc = buildUserService({ userRepo, jwtService });

            await expect(svc.validatePasswordAndResetToken({
                resetPasswordToken: 'different-tok',
                newPassword: 'password123',
                confirmNewPassword: 'password123',
            } as any, true)).to.be.rejectedWith('token-does-not-exist');
        });

        it('returns user on valid token and matching passwords', async () => {
            const jwtService = {
                verifyToken: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
            };
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'tok' });
            const svc = buildUserService({ userRepo, jwtService });

            const user = await svc.validatePasswordAndResetToken({
                resetPasswordToken: 'tok',
                newPassword: 'password123',
                confirmNewPassword: 'password123',
            } as any, true);

            expect(user.id).to.equal(1);
        });
    });

    describe('adminRequestAction() — approve', () => {
        it('approves user, company user, and company on approve action', async () => {
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
            companyLocationsRepo.find.resolves([{ id: 20, companyId: 10 }]);
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
            expect(companiesRepo.updateById.calledWith(10, sinon.match({ status: 'active' }))).to.be.true();
            expect(emailService.sendAccountVerificationApprovedEmail.calledOnce).to.be.true();
        });

        it('throws BadRequest when companyUser not found on approve', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves(null);
            const svc = buildUserService({ userRepo, companyUsersRepo });

            await expect(svc.adminRequestAction(1, 'approve', {}, 99))
                .to.be.rejectedWith('User is already approved');
        });
    });

    describe('adminRequestAction() — reject', () => {
        it('rejects user and company with standard reject reason', async () => {
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

            const result = await svc.adminRequestAction(1, 'reject', { rejectReason: 'Insufficient documentation' }, 99);

            expect(result.status).to.equal('success');
            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.rejectionReason).to.equal('Insufficient documentation');
            expect(emailService.sendCompanyRejectedEmail.calledOnce).to.be.true();
        });
    });

    describe('getUsers()', () => {
        it('returns paginated user list via raw SQL', async () => {
            // getUsers calls this.userRepository.execute() twice via Promise.all:
            // first: data query (SELECT ... LIMIT N), second: count query (SELECT COUNT...)
            const userRepo = createStubRepo();
            userRepo.execute = sinon.stub()
                .onFirstCall().resolves([
                    { id: 1, email: 'a@t.com', firstName: 'A', lastName: 'B', status: 'active', companyId: null },
                    { id: 2, email: 'b@t.com', firstName: 'C', lastName: 'D', status: 'active', companyId: null },
                ])
                .onSecondCall().resolves([{ count: '2' }]);
            const svc = buildUserService({ userRepo });

            const result = await svc.getUsers({ limit: 10, skip: 0 });

            expect(result.totalCount).to.equal(2);
            expect(result.results).to.have.length(2);
        });

        it('applies searchTerm in user list query', async () => {
            const userRepo = createStubRepo();
            const capturedSqls: string[] = [];
            userRepo.execute = sinon.stub().callsFake((sql: string) => {
                capturedSqls.push(String(sql));
                return Promise.resolve([]);
            });
            const svc = buildUserService({ userRepo });

            await svc.getUsers({}, 'alice');
            expect(capturedSqls.some(s => s.toLowerCase().includes('alice'))).to.be.true();
        });

        it('returns empty results when no users found', async () => {
            const userRepo = createStubRepo();
            userRepo.execute = sinon.stub()
                .onFirstCall().resolves([])
                .onSecondCall().resolves([{ count: '0' }]);
            const svc = buildUserService({ userRepo });

            const result = await svc.getUsers({});

            expect(result.totalCount).to.equal(0);
            expect(result.results).to.have.length(0);
        });
    });

    describe('updateProfile() — email/profile field change', () => {
        it('sends edit profile email when email field is updated', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, notificationPushEnabled: false });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const emailService = createStubService(['sendEditProfileEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildUserService({ userRepo, companyUsersRepo, emailService, notificationsService });

            await svc.updateProfile({ email: 'new@t.com' } as any, makeUserProfile());

            expect(emailService.sendEditProfileEmail.called).to.be.true();
        });

        it('sends edit profile email when firstName is updated', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, notificationPushEnabled: false });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const emailService = createStubService(['sendEditProfileEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildUserService({ userRepo, companyUsersRepo, emailService, notificationsService });

            await svc.updateProfile({ firstName: 'UpdatedName' } as any, makeUserProfile());

            expect(emailService.sendEditProfileEmail.called).to.be.true();
        });

        it('does not send email when only untracked fields change', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, notificationPushEnabled: false });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const emailService = createStubService(['sendEditProfileEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildUserService({ userRepo, companyUsersRepo, emailService, notificationsService });

            await svc.updateProfile({ notificationPushEnabled: false } as any, makeUserProfile());

            expect(emailService.sendEditProfileEmail.called).to.be.false();
        });
    });

    describe('getUsersCountTabs() — status variants', () => {
        it('returns tab counts with all fields populated', async () => {
            const userRepo = createStubRepo();
            userRepo.count
                .onFirstCall().resolves({ count: 50 })   // all
                .onSecondCall().resolves({ count: 10 })  // unverified
                .onThirdCall().resolves({ count: 30 })   // verified
                .onCall(3).resolves({ count: 5 })        // rejected
                .onCall(4).resolves({ count: 2 });       // inactive/archived
            const svc = buildUserService({ userRepo });

            const result = await svc.getUsersCountTabs();
            expect(result.status).to.equal('success');
            expect(result.data!.all).to.equal(50);
            expect(result.data!.unverified).to.equal(10);
            expect(result.data!.verified).to.equal(30);
            expect(result.data!.rejected).to.equal(5);
        });
    });
});
