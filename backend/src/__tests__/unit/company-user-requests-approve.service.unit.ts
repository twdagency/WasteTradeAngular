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
        execute: sinon.stub().resolves([{ count: '0' }]),
        dataSource: { execute: sinon.stub() },
    };
    const userRepo = {
        findOne: sinon.stub().resolves(null),
        findById: sinon.stub().resolves({ id: 5, email: 'user@test.com', passwordHash: 'hash' }),
        create: sinon.stub().resolves({ id: 5, email: 'new@test.com', passwordHash: 'hash' }),
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

describe('CompanyUserRequestsService — approve/reject/request (unit)', () => {
    // ── companyAdminApproveRequestJoinCompany ──────────────────────────────

    it('approve: throws Forbidden when currentUser is not company admin', async () => {
        const service = makeService();
        const nonAdmin = makeCurrentUser({ companyRole: CompanyUserRoleEnum.SELLER });

        try {
            await service.companyAdminApproveRequestJoinCompany(1, nonAdmin);
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(403);
        }
    });

    it('approve: throws NotFound when request does not exist', async () => {
        const companyUserRequestsRepo = {
            findById: sinon.stub().resolves(null),
            findOne: sinon.stub().resolves(null),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const service = makeService({ companyUserRequestsRepo });

        try {
            await service.companyAdminApproveRequestJoinCompany(999, makeCurrentUser());
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(404);
            expect(err.message).to.equal(messages.notFoundCompanyUserRequest);
        }
    });

    it('approve: throws NotFound when request belongs to a different company', async () => {
        const companyUserRequestsRepo = {
            findById: sinon.stub().resolves({ id: 1, companyId: 999, userId: 5 }),
            findOne: sinon.stub().resolves(null),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const service = makeService({ companyUserRequestsRepo });

        try {
            // currentUser.companyId = 100, request.companyId = 999
            await service.companyAdminApproveRequestJoinCompany(1, makeCurrentUser());
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(404);
        }
    });

    it('approve: updates request status and calls forgetPassword', async () => {
        const companyUserRequestsRepo = {
            findById: sinon.stub().resolves({ id: 1, companyId: 100, userId: 5 }),
            findOne: sinon.stub().resolves(null),
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
        const service = makeService({ companyUserRequestsRepo, userService });

        const result = await service.companyAdminApproveRequestJoinCompany(1, makeCurrentUser());

        expect(result.status).to.equal('success');
        expect(companyUserRequestsRepo.updateById.calledOnce).to.be.true();
        expect(userService.forgetPassword.calledOnce).to.be.true();
    });

    // ── companyAdminRejectRequestJoinCompany ───────────────────────────────

    it('reject: throws Forbidden when currentUser is not company admin', async () => {
        const service = makeService();

        try {
            await service.companyAdminRejectRequestJoinCompany(1, makeCurrentUser({ companyRole: CompanyUserRoleEnum.BUYER }));
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(403);
        }
    });

    it('reject: throws NotFound when request is from wrong company', async () => {
        const companyUserRequestsRepo = {
            findById: sinon.stub().resolves({
                id: 1,
                companyId: 999,
                userId: 5,
                requestType: CompanyUserRequestTypeEnum.REQUEST,
                user: { email: 'u@test.com', firstName: 'U', lastName: 'N' },
                company: { name: 'OtherCorp' },
            }),
            findOne: sinon.stub().resolves(null),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const service = makeService({ companyUserRequestsRepo });

        try {
            await service.companyAdminRejectRequestJoinCompany(1, makeCurrentUser());
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(404);
        }
    });

    it('reject: throws NotFound when requestType is INVITE not REQUEST', async () => {
        const companyUserRequestsRepo = {
            findById: sinon.stub().resolves({
                id: 1,
                companyId: 100,
                userId: 5,
                requestType: CompanyUserRequestTypeEnum.INVITE, // wrong type
                user: { email: 'u@test.com', firstName: 'U', lastName: 'N' },
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
        const service = makeService({ companyUserRequestsRepo });

        try {
            await service.companyAdminRejectRequestJoinCompany(1, makeCurrentUser());
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(404);
        }
    });

    it('reject: deletes request and sends rejection email', async () => {
        const companyUserRequestsRepo = {
            findById: sinon.stub().resolves({
                id: 1,
                companyId: 100,
                userId: 5,
                requestType: CompanyUserRequestTypeEnum.REQUEST,
                oldCompanyId: null,
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
        const emailService = {
            sendCompanyAdminReceivedRequestedJoinCompanyEmail: sinon.stub().resolves(),
            sendCompanyAdminReceiveInviteAcceptedEmail: sinon.stub().resolves(),
            sendUserReceiveRejectedJoinCompanyEmail: sinon.stub().resolves(),
        };
        const service = makeService({ companyUserRequestsRepo, emailService });

        const result = await service.companyAdminRejectRequestJoinCompany(1, makeCurrentUser());

        expect(result.status).to.equal('success');
        expect(companyUserRequestsRepo.deleteById.calledOnce).to.be.true();
        expect(emailService.sendUserReceiveRejectedJoinCompanyEmail.calledOnce).to.be.true();
    });

    // ── requestToJoinCompany ───────────────────────────────────────────────

    it('requestToJoin: throws BadRequest when email does not match currentUser email', async () => {
        const service = makeService();
        const currentUser = makeCurrentUser({ email: 'real@user.com' });

        try {
            await service.requestToJoinCompany(
                { email: 'different@user.com', companyId: 100 } as any,
                currentUser,
            );
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(400);
            expect(err.message).to.equal(messages.emailDoesNotMatch);
        }
    });

    it('requestToJoin: throws BadRequest when companyId is missing', async () => {
        const service = makeService();

        try {
            await service.requestToJoinCompany({ email: 'user@test.com', companyId: 0 } as any, null);
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(400);
            expect(err.message).to.equal(messages.companyNotFound);
        }
    });

    it('requestToJoin: throws BadRequest when company is a haulier and user is logged in', async () => {
        const companiesRepo = {
            findOne: sinon.stub().resolves({ id: 100, name: 'HaulCorp', isHaulier: true }),
            findById: sinon.stub().resolves({ id: 100, name: 'HaulCorp', isHaulier: true }),
        };
        const service = makeService({ companiesRepo });
        const currentUser = makeCurrentUser({ email: 'user@test.com' });

        try {
            await service.requestToJoinCompany({ email: 'user@test.com', companyId: 100 } as any, currentUser);
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(400);
            expect(err.message).to.equal(messages.companyNotFound);
        }
    });

    it('requestToJoin: throws BadRequest when global admin tries to request', async () => {
        const userRepo = {
            findOne: sinon.stub().resolves({ id: 10, globalRole: UserRoleEnum.ADMIN }),
            findById: sinon.stub().resolves({}),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
        };
        const service = makeService({ userRepo });

        try {
            await service.requestToJoinCompany({ email: 'admin@test.com', companyId: 100 } as any, null);
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(400);
            expect(err.message).to.equal(messages.globalAdminCannotRequestToJoinCompany);
        }
    });

    it('requestToJoin: notifies company admins on successful request', async () => {
        const userRepo = {
            findOne: sinon.stub().resolves(null),
            findById: sinon.stub().resolves({ id: 5, email: 'u@test.com', firstName: 'Joe', lastName: 'Doe' }),
            create: sinon.stub().resolves({ id: 5, email: 'new@test.com', firstName: 'New', lastName: 'User', passwordHash: 'hash' }),
            updateById: sinon.stub().resolves(),
        };
        const adminUser = { id: 20, email: 'a@corp.com', firstName: 'Admin', lastName: 'User' };
        const companyUsersRepo = {
            findOne: sinon.stub().resolves(null),
            find: sinon.stub().resolves([{ user: adminUser }]),
            create: sinon.stub().resolves({}),
            deleteById: sinon.stub().resolves(),
        };
        const notificationsService = { createNotification: sinon.stub().resolves() };
        const emailService = {
            sendCompanyAdminReceivedRequestedJoinCompanyEmail: sinon.stub().resolves(),
            sendCompanyAdminReceiveInviteAcceptedEmail: sinon.stub().resolves(),
            sendUserReceiveRejectedJoinCompanyEmail: sinon.stub().resolves(),
        };
        const service = makeService({ userRepo, companyUsersRepo, notificationsService, emailService });

        const result = await service.requestToJoinCompany(
            { email: 'new@test.com', companyId: 100 } as any,
            null,
        );

        expect(result.status).to.equal('success');
        expect(emailService.sendCompanyAdminReceivedRequestedJoinCompanyEmail.calledOnce).to.be.true();
        expect(notificationsService.createNotification.calledOnce).to.be.true();
    });
});
