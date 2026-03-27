/**
 * auth.service-3.unit.ts
 * Branch-focused tests for auth.service.ts (Part 3)
 * Targets: registerTrading validation branches (invalid email, short password,
 *          duplicate email), registerHaulier validation, refreshToken branches,
 *          login forceLogin branch.
 */
import { expect, sinon } from '@loopback/testlab';
import { AuthService } from '../../services/auth.service';
import {
    CompanyInterest,
    CompanyStatus,
    CompanyUserRoleEnum,
    UserRoleEnum,
    UserStatus,
} from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildAuthService(overrides: Partial<Record<string, any>> = {}): AuthService {
    return new AuthService(
        overrides.userRepo ?? createStubRepo(),
        overrides.userService ?? { convertToUserProfile: sinon.stub().returns({ id: 1 }) },
        overrides.jwtService ?? { generateToken: sinon.stub().resolves('token123') },
        overrides.passwordHasher ?? {
            comparePassword: sinon.stub().resolves(true),
            hashPassword: sinon.stub().resolves('hashed'),
        },
        overrides.companiesRepo ?? createStubRepo(),
        overrides.companyUsersRepo ?? createStubRepo(),
        overrides.companyDocsRepo ?? createStubRepo(),
        overrides.materialsRepo ?? createStubRepo(),
        overrides.materialUsersRepo ?? createStubRepo(),
        overrides.emailService ?? createStubService(['sendAdminNotification', 'sendAccountVerificationRequiredEmail']),
    );
}

describe('AuthService branch coverage - Part 3 (unit)', () => {
    describe('registerTrading() — validation branches', () => {
        it('throws 422 when email is invalid format', async () => {
            const svc = buildAuthService();

            await expect(svc.registerTrading({
                email: 'not-an-email',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                companyName: 'Corp',
                favoriteMaterials: [],
            } as any)).to.be.rejectedWith(/invalid.*email|email.*invalid/i);
        });

        it('throws 422 when password is shorter than 8 chars', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves(null); // email not taken
            const svc = buildAuthService({ userRepo });

            await expect(svc.registerTrading({
                email: 'valid@test.com',
                password: 'short',
                firstName: 'Test',
                lastName: 'User',
                companyName: 'Corp',
                favoriteMaterials: [],
            } as any)).to.be.rejectedWith(/password|characters/i);
        });

        it('throws 422 when email already exists', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({ id: 1, email: 'exists@test.com' });
            const svc = buildAuthService({ userRepo });

            await expect(svc.registerTrading({
                email: 'exists@test.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                companyName: 'Corp',
                favoriteMaterials: [],
            } as any)).to.be.rejectedWith(/existed|already|exist/i);
        });

        it('sets isBuyer=true isSeller=false for BUYER interest', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves(null);
            userRepo.create.resolves({ id: 1 });
            const companiesRepo = createStubRepo();
            companiesRepo.create.resolves({ id: 2, status: CompanyStatus.PENDING });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.create.resolves({ id: 3, companyId: 2, userId: 1 });
            const emailService = createStubService(['sendAdminNotification', 'sendAccountVerificationRequiredEmail']);
            const userService = { convertToUserProfile: sinon.stub().returns({ id: 1 }) };
            const jwtService = { generateToken: sinon.stub().resolves('tok') };
            const passwordHasher = { hashPassword: sinon.stub().resolves('hashed'), comparePassword: sinon.stub() };
            const svc = buildAuthService({
                userRepo, companiesRepo, companyUsersRepo,
                emailService, userService, jwtService, passwordHasher,
            });

            await svc.registerTrading({
                email: 'buyer@test.com',
                password: 'password123',
                firstName: 'Buy',
                lastName: 'Er',
                companyName: 'Buy Corp',
                companyInterest: CompanyInterest.BUYER,
                favoriteMaterials: [],
            } as any);

            const companyArg = companiesRepo.create.firstCall.args[0];
            expect(companyArg.isBuyer).to.be.true();
            expect(companyArg.isSeller).to.be.false();
        });
    });

    describe('registerHaulier() — validation branches', () => {
        it('throws when email already exists for haulier registration', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({ id: 1 });
            const svc = buildAuthService({ userRepo });

            await expect(svc.registerHaulier({
                email: 'exists@test.com',
                password: 'password123',
                documents: [],
                containerTypes: [],
                areasCovered: [],
            } as any)).to.be.rejectedWith(/existed|already|exist/i);
        });

        it('creates haulier without documents when documents array is empty', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves(null);
            userRepo.create.resolves({ id: 1 });
            const companiesRepo = createStubRepo();
            companiesRepo.create.resolves({ id: 2, status: CompanyStatus.PENDING });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.create.resolves({ id: 3, companyId: 2, userId: 1 });
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.create.resolves({ id: 4 });
            const emailService = createStubService(['sendAdminNotification', 'sendAccountVerificationRequiredEmail']);
            const userService = { convertToUserProfile: sinon.stub().returns({ id: 1 }) };
            const jwtService = { generateToken: sinon.stub().resolves('haulier-token') };
            const passwordHasher = { hashPassword: sinon.stub().resolves('hashed'), comparePassword: sinon.stub() };
            const svc = buildAuthService({
                userRepo, companiesRepo, companyUsersRepo, companyDocsRepo,
                emailService, userService, jwtService, passwordHasher,
            });

            const result = await svc.registerHaulier({
                email: 'newhaulier@test.com',
                password: 'password123',
                firstName: 'Haul',
                lastName: 'Ier',
                companyName: 'Fast Haulage',
                country: 'GB',
                addressLine1: '1 Road',
                city: 'London',
                postalCode: 'W1A 1AA',
                documents: [],
                containerTypes: [],
                areasCovered: [],
            } as any);

            expect(result.status).to.equal('success');
            expect(companyDocsRepo.create.called).to.be.false();
        });
    });

    describe('login() — forceLogin branch', () => {
        it('succeeds with forceLogin=true even when password does not match', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({
                id: 1,
                status: UserStatus.ACTIVE,
                email: 'u@test.com',
                passwordHash: 'hash',
                globalRole: UserRoleEnum.USER,
            });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves(null);
            const passwordHasher = {
                comparePassword: sinon.stub().resolves(false), // password mismatch
                hashPassword: sinon.stub(),
            };
            const userService = { convertToUserProfile: sinon.stub().returns({ id: 1 }) };
            const jwtService = { generateToken: sinon.stub().resolves('force-token') };
            const svc = buildAuthService({ userRepo, companyUsersRepo, passwordHasher, userService, jwtService });

            const result = await svc.login({ email: 'u@test.com', password: 'wrong' }, true);

            expect(result.status).to.equal('success');
            expect(result.data?.user.accessToken).to.equal('force-token');
        });
    });

    describe('refreshToken() — branch coverage', () => {
        it('returns undefined when user not found for refresh token', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves(null);
            const svc = buildAuthService({ userRepo });

            const result = await svc.refreshToken('unknown@test.com', {} as any);

            expect(result).to.be.undefined();
        });

        it('returns new token when user is found', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({
                id: 2,
                email: 'refresh@test.com',
                status: UserStatus.ACTIVE,
                globalRole: UserRoleEnum.USER,
            });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves(null);
            const userService = { convertToUserProfile: sinon.stub().returns({ id: 2 }) };
            const jwtService = { generateToken: sinon.stub().resolves('refreshed-token') };
            const svc = buildAuthService({ userRepo, companyUsersRepo, userService, jwtService });

            const result = await svc.refreshToken('refresh@test.com', {} as any) as any;

            expect(result?.data?.user?.accessToken).to.equal('refreshed-token');
        });
    });

    describe('login() — user not found branch', () => {
        it('throws 401 when user does not exist', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves(null);
            const svc = buildAuthService({ userRepo });

            await expect(svc.login({ email: 'ghost@test.com', password: 'pass' }))
                .to.be.rejectedWith(/invalid|not found|account/i);
        });
    });

    describe('login() — password mismatch branch', () => {
        it('throws 401 when password does not match and forceLogin=false', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({
                id: 1,
                status: UserStatus.ACTIVE,
                email: 'u@test.com',
                passwordHash: 'hash',
                globalRole: UserRoleEnum.USER,
            });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves(null);
            const passwordHasher = {
                comparePassword: sinon.stub().resolves(false),
                hashPassword: sinon.stub(),
            };
            const svc = buildAuthService({ userRepo, companyUsersRepo, passwordHasher });

            await expect(svc.login({ email: 'u@test.com', password: 'wrongpass' }, false))
                .to.be.rejectedWith(/invalid|password|account/i);
        });
    });
});
