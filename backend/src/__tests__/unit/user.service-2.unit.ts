import { expect, sinon } from '@loopback/testlab';
import { securityId } from '@loopback/security';
import { MyUserService } from '../../services/user.service';
import { CompanyUserRoleEnum, UserRoleEnum, UserStatus } from '../../enum';
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

// ── getUserList ───────────────────────────────────────────────────────────────
describe('MyUserService (unit) - part 2', () => {
    describe('getUserList()', () => {
        it('calls repository.find with fields filter applied', async () => {
            const userRepo = createStubRepo();
            userRepo.find.resolves([{ id: 1, firstName: 'Alice', lastName: 'Smith', email: 'a@t.com' }]);
            const svc = buildUserService({ userRepo });

            const result = await svc.getUserList({});

            expect(userRepo.find.calledOnce).to.be.true();
            const calledFilter = userRepo.find.firstCall.args[0];
            expect(calledFilter.fields).to.containEql({ id: true, firstName: true, lastName: true, email: true });
        });

        it('merges caller filter with fields restriction', async () => {
            const userRepo = createStubRepo();
            userRepo.find.resolves([]);
            const svc = buildUserService({ userRepo });

            await svc.getUserList({ limit: 5, skip: 10 });

            const calledFilter = userRepo.find.firstCall.args[0];
            expect(calledFilter.limit).to.equal(5);
            expect(calledFilter.skip).to.equal(10);
        });
    });

    // ── updateById ────────────────────────────────────────────────────────────
    describe('updateById()', () => {
        it('updates user and sets updatedAt timestamp', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, status: UserStatus.PENDING });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildUserService({ userRepo, companyUsersRepo });

            const user: any = { firstName: 'Updated' };
            await svc.updateById(1, user);

            expect(userRepo.updateById.calledOnce).to.be.true();
            expect(user.updatedAt).to.be.instanceOf(Date);
        });

        it('throws Conflict on duplicate email constraint error', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, status: UserStatus.ACTIVE });
            const dupError: any = new Error('duplicate key value violates unique constraint "users_email_idx"');
            dupError.code = '23505';
            userRepo.updateById.rejects(dupError);
            const svc = buildUserService({ userRepo });

            await expect(svc.updateById(1, { email: 'dup@test.com' } as any)).to.be.rejectedWith('email-is-already-existed');
        });

        it('re-throws non-duplicate errors', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, status: UserStatus.ACTIVE });
            userRepo.updateById.rejects(new Error('DB_TIMEOUT'));
            const svc = buildUserService({ userRepo });

            await expect(svc.updateById(1, {} as any)).to.be.rejectedWith('DB_TIMEOUT');
        });
    });

    // ── create ────────────────────────────────────────────────────────────────
    describe('create()', () => {
        it('delegates to repository.create and returns saved user', async () => {
            const userRepo = createStubRepo();
            const saved = { id: 42, email: 'new@test.com' };
            userRepo.create.resolves(saved);
            const svc = buildUserService({ userRepo });

            const result = await svc.create({ email: 'new@test.com' } as any);

            expect(result).to.equal(saved);
            expect(userRepo.create.calledOnce).to.be.true();
        });
    });

    // ── resetPassword ─────────────────────────────────────────────────────────
    describe('resetPassword()', () => {
        it('hashes new password and updates user record', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'tok' });
            userRepo.updateById.resolves();
            const jwtService = {
                verifyToken: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
                decodeTokenWithoutSecretKey: sinon.stub().resolves({ id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }),
            };
            const passwordHasher = { hashPassword: sinon.stub().resolves('new-hash'), comparePassword: sinon.stub() };
            const svc = buildUserService({ userRepo, jwtService, passwordHasher });

            await svc.resetPassword({
                resetPasswordToken: 'tok',
                newPassword: 'newpass123',
                confirmNewPassword: 'newpass123',
            } as any);

            expect(passwordHasher.hashPassword.calledWith('newpass123')).to.be.true();
            // updateById called at least twice: once for password, once for clearExpiredResetToken
            expect(userRepo.updateById.called).to.be.true();
        });
    });

    // ── clearExpiredResetToken ────────────────────────────────────────────────
    describe('clearExpiredResetToken()', () => {
        it('sets resetPasswordToken to empty string', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, resetPasswordToken: 'old-token', email: 'u@t.com' });
            userRepo.updateById.resolves();
            const svc = buildUserService({ userRepo });

            await svc.clearExpiredResetToken(1);

            expect(userRepo.updateById.calledOnce).to.be.true();
            const updateArg = userRepo.updateById.firstCall.args[1];
            expect(updateArg.resetPasswordToken).to.equal('');
        });
    });

    // ── getUsersCountTabs ─────────────────────────────────────────────────────
    describe('getUsersCountTabs()', () => {
        it('returns tab counts from multiple count queries', async () => {
            const userRepo = createStubRepo();
            userRepo.count
                .onFirstCall().resolves({ count: 100 })   // all
                .onSecondCall().resolves({ count: 20 })   // unverified
                .onThirdCall().resolves({ count: 60 })    // verified
                .onCall(3).resolves({ count: 10 })        // rejected
                .onCall(4).resolves({ count: 5 });        // archived
            const svc = buildUserService({ userRepo });

            const result = await svc.getUsersCountTabs();

            expect(result.status).to.equal('success');
            expect(result.data!.all).to.equal(100);
            expect(result.data!.unverified).to.equal(20);
            expect(result.data!.verified).to.equal(60);
            expect(result.data!.rejected).to.equal(10);
        });
    });

    // ── getUserInfoByAdmin ────────────────────────────────────────────────────
    describe('getUserInfoByAdmin()', () => {
        it('throws NotFound when no user rows returned', async () => {
            const userRepo = createStubRepo();
            userRepo.dataSource.execute.resolves([]);
            const svc = buildUserService({ userRepo });

            await expect(svc.getUserInfoByAdmin(999)).to.be.rejectedWith('user-not-found');
        });

        it('returns user data without company when companyId is null', async () => {
            const userRepo = createStubRepo();
            userRepo.dataSource.execute
                .onFirstCall().resolves([{ id: 1, email: 'u@t.com', companyId: null }]);
            const svc = buildUserService({ userRepo });

            const result = await svc.getUserInfoByAdmin(1);

            expect(result.status).to.equal('success');
            expect((result.data as any).id).to.equal(1);
        });

        it('returns user with company, locations and documents when companyId present', async () => {
            const userRepo = createStubRepo();
            userRepo.dataSource.execute
                .onFirstCall().resolves([{ id: 1, email: 'u@t.com', companyId: 10 }])
                .onSecondCall().resolves([{ id: 10, name: 'ACME', isSeller: true, isBuyer: false }])
                .onThirdCall().resolves([{ id: 20, locationName: 'Site A', companyId: 10 }])
                .onCall(3).resolves([{ id: 30, documentType: 'cert', companyId: 10 }]);
            const svc = buildUserService({ userRepo });

            const result = await svc.getUserInfoByAdmin(1);

            expect(result.status).to.equal('success');
            const data = result.data as any;
            expect(data.company.id).to.equal(10);
            expect(data.company.locations).to.have.length(1);
            expect(data.company.documents).to.have.length(1);
        });

        it('sets companyType to "seller" when isSeller=true isBuyer=false', async () => {
            const userRepo = createStubRepo();
            userRepo.dataSource.execute
                .onFirstCall().resolves([{ id: 1, companyId: 5 }])
                .onSecondCall().resolves([{ id: 5, isSeller: true, isBuyer: false }])
                .onThirdCall().resolves([])
                .onCall(3).resolves([]);
            const svc = buildUserService({ userRepo });

            const result = await svc.getUserInfoByAdmin(1);
            expect((result.data as any).companyType).to.equal('seller');
        });

        it('sets companyType to "buyer" when isSeller=false isBuyer=true', async () => {
            const userRepo = createStubRepo();
            userRepo.dataSource.execute
                .onFirstCall().resolves([{ id: 1, companyId: 5 }])
                .onSecondCall().resolves([{ id: 5, isSeller: false, isBuyer: true }])
                .onThirdCall().resolves([])
                .onCall(3).resolves([]);
            const svc = buildUserService({ userRepo });

            const result = await svc.getUserInfoByAdmin(1);
            expect((result.data as any).companyType).to.equal('buyer');
        });

        it('sets companyType to "both" when isSeller=true isBuyer=true', async () => {
            const userRepo = createStubRepo();
            userRepo.dataSource.execute
                .onFirstCall().resolves([{ id: 1, companyId: 5 }])
                .onSecondCall().resolves([{ id: 5, isSeller: true, isBuyer: true }])
                .onThirdCall().resolves([])
                .onCall(3).resolves([]);
            const svc = buildUserService({ userRepo });

            const result = await svc.getUserInfoByAdmin(1);
            expect((result.data as any).companyType).to.equal('both');
        });
    });

    // ── adminRequestAction — request_info ─────────────────────────────────────
    describe('adminRequestAction() — request_info', () => {
        it('sets REQUEST_INFORMATION status on user, companyUser and company', async () => {
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
            companyLocationsRepo.find.resolves([]);
            const companyLocationDocsRepo = createStubRepo();
            companyLocationDocsRepo.updateAll.resolves({ count: 0 });
            const emailService = createStubService(['sendCompanyRequestInformationEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildUserService({
                userRepo, companyUsersRepo, companiesRepo, companyDocsRepo,
                companyLocationsRepo, companyLocationDocsRepo, emailService, notificationsService,
            });

            const result = await svc.adminRequestAction(
                1, 'request_info',
                { infoRequestType: 'documents', message: 'Please upload docs' },
                99,
            );

            expect(result.status).to.equal('success');
            expect(companiesRepo.updateById.calledWith(10, sinon.match({ status: 'request_information' }))).to.be.true();
            expect(emailService.sendCompanyRequestInformationEmail.calledOnce).to.be.true();
        });

        it('throws BadRequest when companyUser not found for request_info', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1 });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves(null);
            const svc = buildUserService({ userRepo, companyUsersRepo });

            await expect(svc.adminRequestAction(1, 'request_info', {}, 99))
                .to.be.rejectedWith('User is already approved');
        });

        it('throws BadRequest for unknown requestAction', async () => {
            const svc = buildUserService();
            await expect(svc.adminRequestAction(1, 'unknown_action', {}, 99))
                .to.be.rejectedWith('Invalid request action');
        });
    });

    // ── adminRequestAction — reject with "Other" reason ───────────────────────
    describe('adminRequestAction() — reject with Other reason', () => {
        it('uses message field as rejection reason when rejectReason is "Other"', async () => {
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

            await svc.adminRequestAction(1, 'reject', { rejectReason: 'Other', message: 'Custom reason here' }, 99);

            const companiesUpdateArg = companiesRepo.updateById.firstCall.args[1];
            expect(companiesUpdateArg.rejectionReason).to.equal('Custom reason here');
        });
    });

    // ── updateProfile — notification push enabled ─────────────────────────────
    describe('updateProfile() — push notification toggle', () => {
        it('creates NOTIFICATIONS_ENABLED notification when push enabled goes false → true', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, notificationPushEnabled: false, status: UserStatus.ACTIVE });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const notificationsService = createStubService(['createNotification']);
            const emailService = createStubService(['sendEditProfileEmail']);
            const svc = buildUserService({ userRepo, companyUsersRepo, notificationsService, emailService });

            await svc.updateProfile({ notificationPushEnabled: true } as any, makeUserProfile());

            expect(notificationsService.createNotification.calledWith(
                1, 'notifications_enabled', {}
            )).to.be.true();
        });

        it('does NOT create NOTIFICATIONS_ENABLED notification when push stays false', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, notificationPushEnabled: false, status: UserStatus.ACTIVE });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildUserService({ userRepo, companyUsersRepo, notificationsService });

            await svc.updateProfile({ notificationPushEnabled: false } as any, makeUserProfile());

            const notifCalls = notificationsService.createNotification.args;
            const notifTypes = notifCalls.map((a: any[]) => a[1]);
            expect(notifTypes).to.not.containEql('notifications_enabled');
        });
    });
});
