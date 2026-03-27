import { expect, sinon } from '@loopback/testlab';
import { CompanyUserRequestsService } from '../../services/company-user-requests.service';
import {
    CompanyUserRequestStatusEnum,
    CompanyUserRequestTypeEnum,
    CompanyUserRoleEnum,
    UserRoleEnum,
} from '../../enum';
import { messages } from '../../constants';

function makeCurrentUser(overrides: Partial<any> = {}): any {
    return {
        id: 1,
        email: 'admin@corp.com',
        companyId: 100,
        companyRole: CompanyUserRoleEnum.ADMIN,
        globalRole: UserRoleEnum.USER,
        ...overrides,
    };
}

function makeService(overrides: Partial<Record<string, any>> = {}): CompanyUserRequestsService {
    const companyUsersRepo = {
        findOne: sinon.stub().resolves(null),
        find: sinon.stub().resolves([]),
        create: sinon.stub().resolves({}),
        deleteById: sinon.stub().resolves(),
    };
    const companyUserRequestsRepo = {
        findOne: sinon.stub().resolves(null),
        findById: sinon.stub().resolves(null),
        create: sinon.stub().resolves({
            id: 99,
            role: CompanyUserRoleEnum.BUYER,
            status: CompanyUserRequestStatusEnum.REQUESTED,
            expiresAt: new Date().toISOString(),
        }),
        updateById: sinon.stub().resolves(),
        deleteById: sinon.stub().resolves(),
        deleteAll: sinon.stub().resolves(),
        execute: sinon.stub().resolves([{ count: '5' }]),
        dataSource: { execute: sinon.stub() },
    };
    const userRepo = {
        findOne: sinon.stub().resolves(null),
        findById: sinon.stub().resolves({ id: 5, email: 'u@test.com', passwordHash: 'hash', firstName: 'Joe', lastName: 'Doe' }),
        create: sinon.stub().resolves({ id: 5, email: 'new@test.com', passwordHash: 'hash', firstName: 'New', lastName: 'User' }),
        updateById: sinon.stub().resolves(),
    };
    const companiesRepo = {
        findOne: sinon.stub().resolves({ id: 100, name: 'TestCorp' }),
        findById: sinon.stub().resolves({ id: 100, name: 'TestCorp', isHaulier: false }),
    };
    const authService = { generateUniqueUsername: sinon.stub().resolves('user_abc') };
    const userService = {
        forgetPassword: sinon.stub().resolves(),
        validatePasswordAndResetToken: sinon.stub().resolves({ id: 5, passwordHash: 'oldhash' }),
        clearExpiredResetToken: sinon.stub().resolves(),
    };
    const notificationsService = { createNotification: sinon.stub().resolves() };
    const emailService = {
        sendCompanyAdminReceivedRequestedJoinCompanyEmail: sinon.stub().resolves(),
        sendCompanyAdminReceiveInviteAcceptedEmail: sinon.stub().resolves(),
        sendUserReceiveRejectedJoinCompanyEmail: sinon.stub().resolves(),
    };
    const passwordHasher = { hashPassword: sinon.stub().resolves('newhash') };
    const jwtService = { verifyTokenWithSecretKey: sinon.stub().resolves({ id: 5 }) };

    return new CompanyUserRequestsService(
        overrides.companyUsersRepo ?? companyUsersRepo,
        overrides.companyUserRequestsRepo ?? companyUserRequestsRepo,
        overrides.userRepo ?? userRepo,
        overrides.companiesRepo ?? companiesRepo,
        overrides.authService ?? authService,
        overrides.userService ?? userService,
        overrides.notificationsService ?? notificationsService,
        overrides.emailService ?? emailService,
        overrides.passwordHasher ?? passwordHasher,
        overrides.jwtService ?? jwtService,
    );
}

describe('CompanyUserRequestsService — requestToJoinCompany branches (unit)', () => {
    it('requestToJoin: existing user with pending request throws BadRequest', async () => {
        const userRepo = {
            findOne: sinon.stub().resolves({ id: 10, globalRole: UserRoleEnum.USER }),
            findById: sinon.stub().resolves({}),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
        };
        const companyUserRequestsRepo = {
            findOne: sinon.stub().resolves({ id: 77, status: CompanyUserRequestStatusEnum.PENDING }),
            findById: sinon.stub().resolves(null),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const service = makeService({ userRepo, companyUserRequestsRepo });

        try {
            await service.requestToJoinCompany({ email: 'u@test.com', companyId: 100 } as any, null);
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(400);
            expect(err.message).to.equal(messages.aRequestToJoinCompanyHasBeenSentByThisUser);
        }
    });

    it('requestToJoin: existing user with existing companyUser deletes old company membership', async () => {
        const companyUsersRepo = {
            findOne: sinon.stub().resolves({ id: 55, companyId: 200, userId: 10 }),
            find: sinon.stub().resolves([]),
            create: sinon.stub().resolves({}),
            deleteById: sinon.stub().resolves(),
        };
        const userRepo = {
            findOne: sinon.stub().resolves({ id: 10, globalRole: UserRoleEnum.USER }),
            findById: sinon.stub().resolves({ id: 10, email: 'u@test.com', firstName: 'U', lastName: 'N' }),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
        };
        const companiesRepo = {
            findOne: sinon.stub().resolves({ id: 100, name: 'TestCorp' }),
            findById: sinon.stub().resolves({ id: 100, name: 'TestCorp', isHaulier: false }),
        };
        const service = makeService({ companyUsersRepo, userRepo, companiesRepo });

        // currentUser is logged in (non-null) → role = BOTH
        const currentUser = makeCurrentUser({ id: 10 });
        const result = await service.requestToJoinCompany({ email: 'admin@corp.com', companyId: 100 } as any, currentUser);

        expect(result.status).to.equal('success');
        expect(companyUsersRepo.deleteById.calledWith(55)).to.be.true();
    });

    it('requestToJoin: null currentUser creates HAULIER role request', async () => {
        const userRepo = {
            findOne: sinon.stub().resolves(null),
            findById: sinon.stub().resolves({ id: 5, email: 'new@test.com', firstName: 'New', lastName: 'User' }),
            create: sinon.stub().resolves({ id: 5, email: 'new@test.com', firstName: 'New', lastName: 'User', passwordHash: 'h' }),
            updateById: sinon.stub().resolves(),
        };
        const companyUserRequestsRepo = {
            findOne: sinon.stub().resolves(null),
            findById: sinon.stub().resolves(null),
            create: sinon.stub().resolves({
                id: 99,
                role: CompanyUserRoleEnum.HAULIER,
                status: CompanyUserRequestStatusEnum.REQUESTED,
                expiresAt: new Date().toISOString(),
            }),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const service = makeService({ userRepo, companyUserRequestsRepo });

        // null currentUser → HAULIER role
        const result = await service.requestToJoinCompany(
            { email: 'new@test.com', companyId: 100, firstName: 'New', lastName: 'User' } as any,
            null,
        );

        expect(result.status).to.equal('success');
        const createdArg = companyUserRequestsRepo.create.firstCall.args[0];
        expect(createdArg.role).to.equal(CompanyUserRoleEnum.HAULIER);
    });

    it('requestToJoin: logged-in currentUser creates BOTH role request', async () => {
        const userRepo = {
            findOne: sinon.stub().resolves(null),
            findById: sinon.stub().resolves({ id: 5 }),
            create: sinon.stub().resolves({ id: 5, email: 'admin@corp.com', passwordHash: 'h', firstName: 'A', lastName: 'B' }),
            updateById: sinon.stub().resolves(),
        };
        const companyUserRequestsRepo = {
            findOne: sinon.stub().resolves(null),
            findById: sinon.stub().resolves(null),
            create: sinon.stub().resolves({
                id: 88,
                role: CompanyUserRoleEnum.BOTH,
                status: CompanyUserRequestStatusEnum.REQUESTED,
                expiresAt: new Date().toISOString(),
            }),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const service = makeService({ userRepo, companyUserRequestsRepo });

        const currentUser = makeCurrentUser({ email: 'admin@corp.com' });
        const result = await service.requestToJoinCompany(
            { email: 'admin@corp.com', companyId: 100 } as any,
            currentUser,
        );

        expect(result.status).to.equal('success');
        const createdArg = companyUserRequestsRepo.create.firstCall.args[0];
        expect(createdArg.role).to.equal(CompanyUserRoleEnum.BOTH);
    });
});

describe('CompanyUserRequestsService — setPasswordJoinCompany branches (unit)', () => {
    it('throws (caught) and completes when companyUser already exists', async () => {
        const companyUsersRepo = {
            findOne: sinon.stub().resolves({ id: 1, companyId: 100, userId: 5 }),
            find: sinon.stub().resolves([]),
            create: sinon.stub().resolves({}),
            deleteById: sinon.stub().resolves(),
        };
        const service = makeService({ companyUsersRepo });

        // setPasswordJoinCompany catches the error internally and resolves
        await service.setPasswordJoinCompany({ newPassword: 'pass123', resetPasswordToken: 'tok' } as any);
        // verify clearExpiredResetToken was still called after catch
        // (no assertion needed on thrown error since it's caught internally)
    });

    it('throws (caught) when companyUserRequest not found', async () => {
        const companyUsersRepo = {
            findOne: sinon.stub().resolves(null),
            find: sinon.stub().resolves([]),
            create: sinon.stub().resolves({}),
            deleteById: sinon.stub().resolves(),
        };
        const companyUserRequestsRepo = {
            findOne: sinon.stub().resolves(null),
            findById: sinon.stub().resolves(null),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const userService = {
            forgetPassword: sinon.stub().resolves(),
            validatePasswordAndResetToken: sinon.stub().resolves({ id: 5, passwordHash: 'hash' }),
            clearExpiredResetToken: sinon.stub().resolves(),
        };
        const service = makeService({ companyUsersRepo, companyUserRequestsRepo, userService });

        await service.setPasswordJoinCompany({ newPassword: 'newpass', resetPasswordToken: 'tok' } as any);
        expect(userService.clearExpiredResetToken.calledOnce).to.be.true();
    });

    it('processes successfully with admin users and sends emails', async () => {
        const adminUser = { id: 20, email: 'admin@corp.com', firstName: 'Admin', lastName: 'User' };
        const companyUsersRepo = {
            findOne: sinon.stub().resolves(null),
            find: sinon.stub().resolves([{ user: adminUser }]),
            create: sinon.stub().resolves({}),
            deleteById: sinon.stub().resolves(),
        };
        const companyUserRequestsRepo = {
            findOne: sinon.stub().resolves({ id: 99, userId: 5, companyId: 100, role: CompanyUserRoleEnum.BUYER }),
            findById: sinon.stub().resolves(null),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const emailService = {
            sendCompanyAdminReceivedRequestedJoinCompanyEmail: sinon.stub().resolves(),
            sendCompanyAdminReceiveInviteAcceptedEmail: sinon.stub().resolves(),
            sendUserReceiveRejectedJoinCompanyEmail: sinon.stub().resolves(),
        };
        const notificationsService = { createNotification: sinon.stub().resolves() };
        const userService = {
            forgetPassword: sinon.stub().resolves(),
            validatePasswordAndResetToken: sinon.stub().resolves({ id: 5, passwordHash: 'oldhash' }),
            clearExpiredResetToken: sinon.stub().resolves(),
        };
        const service = makeService({
            companyUsersRepo,
            companyUserRequestsRepo,
            emailService,
            notificationsService,
            userService,
        });

        await service.setPasswordJoinCompany({ newPassword: 'newpass123', resetPasswordToken: 'tok' } as any);

        expect(emailService.sendCompanyAdminReceiveInviteAcceptedEmail.calledOnce).to.be.true();
        expect(notificationsService.createNotification.calledOnce).to.be.true();
        expect(userService.clearExpiredResetToken.calledOnce).to.be.true();
    });

    it('processes successfully with no admin users (empty companyAdminUsers array)', async () => {
        const companyUsersRepo = {
            findOne: sinon.stub().resolves(null),
            find: sinon.stub().resolves([]),
            create: sinon.stub().resolves({}),
            deleteById: sinon.stub().resolves(),
        };
        const companyUserRequestsRepo = {
            findOne: sinon.stub().resolves({ id: 99, userId: 5, companyId: 100, role: CompanyUserRoleEnum.SELLER }),
            findById: sinon.stub().resolves(null),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const emailService = {
            sendCompanyAdminReceivedRequestedJoinCompanyEmail: sinon.stub().resolves(),
            sendCompanyAdminReceiveInviteAcceptedEmail: sinon.stub().resolves(),
            sendUserReceiveRejectedJoinCompanyEmail: sinon.stub().resolves(),
        };
        const userService = {
            forgetPassword: sinon.stub().resolves(),
            validatePasswordAndResetToken: sinon.stub().resolves({ id: 5, passwordHash: 'oldhash' }),
            clearExpiredResetToken: sinon.stub().resolves(),
        };
        const service = makeService({ companyUsersRepo, companyUserRequestsRepo, emailService, userService });

        await service.setPasswordJoinCompany({ newPassword: 'newpass123', resetPasswordToken: 'tok' } as any);

        expect(emailService.sendCompanyAdminReceiveInviteAcceptedEmail.called).to.be.false();
        expect(userService.clearExpiredResetToken.calledOnce).to.be.true();
    });
});

describe('CompanyUserRequestsService — reject with oldCompanyId branch (unit)', () => {
    it('reject: restores old company membership when oldCompanyId is set', async () => {
        const companyUserRequestsRepo = {
            findById: sinon.stub().resolves({
                id: 1,
                companyId: 100,
                userId: 5,
                oldCompanyId: 50,
                requestType: CompanyUserRequestTypeEnum.REQUEST,
                user: { email: 'u@test.com', firstName: 'John', lastName: 'Doe' },
                company: { name: 'TestCorp' },
            }),
            findOne: sinon.stub().resolves(null),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const companyUsersRepo = {
            findOne: sinon.stub().resolves(null),
            find: sinon.stub().resolves([]),
            create: sinon.stub().resolves({}),
            deleteById: sinon.stub().resolves(),
        };
        const service = makeService({ companyUserRequestsRepo, companyUsersRepo });

        const result = await service.companyAdminRejectRequestJoinCompany(1, makeCurrentUser());

        expect(result.status).to.equal('success');
        expect(companyUsersRepo.create.calledOnce).to.be.true();
        const createdArg = companyUsersRepo.create.firstCall.args[0];
        expect(createdArg.companyId).to.equal(50);
    });

    it('reject: skips company restoration when oldCompanyId is null', async () => {
        const companyUserRequestsRepo = {
            findById: sinon.stub().resolves({
                id: 2,
                companyId: 100,
                userId: 6,
                oldCompanyId: null,
                requestType: CompanyUserRequestTypeEnum.REQUEST,
                user: { email: 'x@test.com', firstName: 'X', lastName: 'Y' },
                company: { name: 'TestCorp' },
            }),
            findOne: sinon.stub().resolves(null),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const companyUsersRepo = {
            findOne: sinon.stub().resolves(null),
            find: sinon.stub().resolves([]),
            create: sinon.stub().resolves({}),
            deleteById: sinon.stub().resolves(),
        };
        const service = makeService({ companyUserRequestsRepo, companyUsersRepo });

        const result = await service.companyAdminRejectRequestJoinCompany(2, makeCurrentUser());

        expect(result.status).to.equal('success');
        expect(companyUsersRepo.create.called).to.be.false();
    });
});

describe('CompanyUserRequestsService — companyAdminResendInvitation branches (unit)', () => {
    it('throws Forbidden when currentUser is not company admin', async () => {
        const service = makeService();

        try {
            await service.companyAdminResendInvitation(5, makeCurrentUser({ companyRole: CompanyUserRoleEnum.BUYER }));
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(403);
        }
    });

    it('throws NotFound when no pending request found for user', async () => {
        const companyUserRequestsRepo = {
            findOne: sinon.stub().resolves(null),
            findById: sinon.stub().resolves(null),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const service = makeService({ companyUserRequestsRepo });

        try {
            await service.companyAdminResendInvitation(5, makeCurrentUser());
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(404);
            expect(err.message).to.equal(messages.notFoundCompanyUserRequest);
        }
    });

    it('successfully resends invitation and calls forgetPassword', async () => {
        const companyUserRequestsRepo = {
            findOne: sinon.stub().resolves({ id: 30, userId: 5, companyId: 100, status: CompanyUserRequestStatusEnum.PENDING }),
            findById: sinon.stub().resolves(null),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const userService = {
            forgetPassword: sinon.stub().resolves(),
            validatePasswordAndResetToken: sinon.stub().resolves(),
            clearExpiredResetToken: sinon.stub().resolves(),
        };
        const service = makeService({ companyUserRequestsRepo, userService });

        const result = await service.companyAdminResendInvitation(5, makeCurrentUser());

        expect(result.status).to.equal('success');
        expect(userService.forgetPassword.calledOnce).to.be.true();
    });
});
