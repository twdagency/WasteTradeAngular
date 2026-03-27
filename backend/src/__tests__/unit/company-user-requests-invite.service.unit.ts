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
            status: CompanyUserRequestStatusEnum.PENDING,
            expiresAt: new Date().toISOString(),
        }),
        updateById: sinon.stub().resolves(),
        deleteById: sinon.stub().resolves(),
        deleteAll: sinon.stub().resolves(),
        execute: sinon.stub().resolves([]),
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
    const authService = {
        generateUniqueUsername: sinon.stub().resolves('user_abc'),
    };
    const userService = {
        forgetPassword: sinon.stub().resolves(),
        validatePasswordAndResetToken: sinon.stub().resolves({ id: 5, passwordHash: 'hash' }),
        clearExpiredResetToken: sinon.stub().resolves(),
    };
    const notificationsService = {
        createNotification: sinon.stub().resolves(),
    };
    const emailService = {
        sendCompanyAdminReceivedRequestedJoinCompanyEmail: sinon.stub().resolves(),
        sendCompanyAdminReceiveInviteAcceptedEmail: sinon.stub().resolves(),
        sendUserReceiveRejectedJoinCompanyEmail: sinon.stub().resolves(),
    };
    const passwordHasher = {
        hashPassword: sinon.stub().resolves('newhash'),
    };
    const jwtService = {
        verifyTokenWithSecretKey: sinon.stub().resolves({ id: 5 }),
    };

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

describe('CompanyUserRequestsService — inviteToJoinCompany (unit)', () => {
    it('throws Forbidden when currentUser is not company admin', async () => {
        const service = makeService();
        const nonAdmin = makeCurrentUser({ companyRole: CompanyUserRoleEnum.SELLER });

        try {
            await service.inviteToJoinCompany({ email: 'x@test.com', role: CompanyUserRoleEnum.BUYER } as any, nonAdmin);
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(403);
        }
    });

    it('throws BadRequest when invited user is a global admin', async () => {
        const userRepo = {
            findOne: sinon.stub().resolves({ id: 10, globalRole: UserRoleEnum.ADMIN }),
            findById: sinon.stub().resolves({}),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
        };
        const service = makeService({ userRepo });
        const admin = makeCurrentUser();

        try {
            await service.inviteToJoinCompany({ email: 'globaladmin@test.com', role: CompanyUserRoleEnum.BUYER } as any, admin);
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(400);
            expect(err.message).to.equal(messages.cannotInviteAdminToCompany);
        }
    });

    it('throws BadRequest when user already belongs to this company', async () => {
        const userRepo = {
            findOne: sinon.stub().resolves({ id: 10, globalRole: UserRoleEnum.USER }),
            findById: sinon.stub().resolves({}),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
        };
        const companyUsersRepo = {
            findOne: sinon.stub().resolves({ id: 1, companyId: 100, userId: 10 }),
            find: sinon.stub().resolves([]),
            create: sinon.stub().resolves({}),
            deleteById: sinon.stub().resolves(),
        };
        const service = makeService({ userRepo, companyUsersRepo });
        const admin = makeCurrentUser();

        try {
            await service.inviteToJoinCompany({ email: 'member@test.com', role: CompanyUserRoleEnum.BUYER } as any, admin);
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(400);
            expect(err.message).to.equal(messages.userAlreadyBelongsToThisCompany);
        }
    });

    it('throws BadRequest when user already belongs to a different company', async () => {
        const userRepo = {
            findOne: sinon.stub().resolves({ id: 10, globalRole: UserRoleEnum.USER }),
            findById: sinon.stub().resolves({}),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
        };
        const companyUsersRepo = {
            findOne: sinon.stub().resolves({ id: 1, companyId: 999, userId: 10 }),
            find: sinon.stub().resolves([]),
            create: sinon.stub().resolves({}),
            deleteById: sinon.stub().resolves(),
        };
        const service = makeService({ userRepo, companyUsersRepo });
        const admin = makeCurrentUser();

        try {
            await service.inviteToJoinCompany({ email: 'other@test.com', role: CompanyUserRoleEnum.BUYER } as any, admin);
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(400);
            expect(err.message).to.equal(messages.userAlreadyBelongsToOtherCompany);
        }
    });

    it('throws BadRequest when a pending invitation already exists', async () => {
        const userRepo = {
            findOne: sinon.stub().resolves({ id: 10, globalRole: UserRoleEnum.USER }),
            findById: sinon.stub().resolves({}),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
        };
        const companyUserRequestsRepo = {
            findOne: sinon.stub().resolves({ id: 50, status: CompanyUserRequestStatusEnum.PENDING }),
            findById: sinon.stub().resolves(null),
            create: sinon.stub().resolves({}),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const service = makeService({ userRepo, companyUserRequestsRepo });
        const admin = makeCurrentUser();

        try {
            await service.inviteToJoinCompany({ email: 'pending@test.com', role: CompanyUserRoleEnum.BUYER } as any, admin);
            throw new Error('Should have thrown');
        } catch (err: any) {
            expect(err.statusCode).to.equal(400);
            expect(err.message).to.equal(messages.anInvitationHasBeenSentToThisUser);
        }
    });

    it('creates new user and invitation when user does not exist', async () => {
        const userRepo = {
            findOne: sinon.stub().resolves(null),
            findById: sinon.stub().resolves({ id: 5, email: 'brand@new.com', passwordHash: 'hash' }),
            create: sinon.stub().resolves({ id: 5, email: 'brand@new.com', passwordHash: 'hash' }),
            updateById: sinon.stub().resolves(),
        };
        const companyUserRequestsRepo = {
            findOne: sinon.stub().resolves(null),
            findById: sinon.stub().resolves(null),
            create: sinon.stub().resolves({
                id: 99,
                userId: 5,
                role: CompanyUserRoleEnum.BUYER,
                status: CompanyUserRequestStatusEnum.PENDING,
                expiresAt: new Date().toISOString(),
            }),
            updateById: sinon.stub().resolves(),
            deleteById: sinon.stub().resolves(),
            deleteAll: sinon.stub().resolves(),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        const service = makeService({ userRepo, companyUserRequestsRepo });
        const admin = makeCurrentUser();

        const result = await service.inviteToJoinCompany(
            { email: 'brand@new.com', role: CompanyUserRoleEnum.BUYER, firstName: 'Brand', lastName: 'New' } as any,
            admin,
        );

        expect(result.status).to.equal('success');
        expect(userRepo.create.calledOnce).to.be.true();
        expect(companyUserRequestsRepo.create.calledOnce).to.be.true();
        const createdRequest = companyUserRequestsRepo.create.firstCall.args[0];
        expect(createdRequest.requestType).to.equal(CompanyUserRequestTypeEnum.INVITE);
        expect(createdRequest.status).to.equal(CompanyUserRequestStatusEnum.PENDING);
    });
});
