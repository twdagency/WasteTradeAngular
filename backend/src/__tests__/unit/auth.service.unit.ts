import { expect, sinon } from '@loopback/testlab';
import { AuthService } from '../../services/auth.service';
import { CompanyInterest, CompanyStatus, CompanyUserRoleEnum, CompanyUserStatusEnum, UserRoleEnum, UserStatus } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildAuthService(overrides: Partial<Record<string, any>> = {}): AuthService {
    const userRepo = overrides.userRepo ?? createStubRepo();
    const userService = overrides.userService ?? { convertToUserProfile: sinon.stub().returns({ id: 1 }) };
    const jwtService = overrides.jwtService ?? { generateToken: sinon.stub().resolves('token123') };
    const passwordHasher = overrides.passwordHasher ?? {
        comparePassword: sinon.stub().resolves(true),
        hashPassword: sinon.stub().resolves('hashed'),
    };
    const companiesRepo = overrides.companiesRepo ?? createStubRepo();
    const companyUsersRepo = overrides.companyUsersRepo ?? createStubRepo();
    const companyDocsRepo = overrides.companyDocsRepo ?? createStubRepo();
    const materialsRepo = overrides.materialsRepo ?? createStubRepo();
    const materialUsersRepo = overrides.materialUsersRepo ?? createStubRepo();
    const emailService = overrides.emailService ?? createStubService(['sendAdminNotification', 'sendAccountVerificationRequiredEmail']);

    return new AuthService(
        userRepo,
        userService as any,
        jwtService as any,
        passwordHasher as any,
        companiesRepo,
        companyUsersRepo,
        companyDocsRepo,
        materialsRepo,
        materialUsersRepo,
        emailService as any,
    );
}

describe('AuthService (unit)', () => {
    describe('generateUniqueUsername()', () => {
        it('returns 8-digit string when no conflict', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves(null);
            const svc = buildAuthService({ userRepo });

            const result = await svc.generateUniqueUsername();

            expect(result).to.have.length(8);
            expect(/^\d{8}$/.test(result)).to.be.true();
        });

        it('retries until unique username found', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.onFirstCall().resolves({ id: 1 });
            userRepo.findOne.onSecondCall().resolves(null);
            const svc = buildAuthService({ userRepo });

            const result = await svc.generateUniqueUsername();

            expect(userRepo.findOne.callCount).to.equal(2);
            expect(/^\d{8}$/.test(result)).to.be.true();
        });
    });

    describe('login()', () => {
        it('throws 401 when user not found', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves(null);
            const svc = buildAuthService({ userRepo });

            await expect(svc.login({ email: 'x@test.com', password: 'pass' })).to.be.rejectedWith(Error);
        });

        it('throws 401 when user is archived', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({ id: 1, status: UserStatus.ARCHIVED, email: 'x@test.com' });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves(null);
            const svc = buildAuthService({ userRepo, companyUsersRepo });

            await expect(svc.login({ email: 'x@test.com', password: 'pass' })).to.be.rejectedWith('account-archived');
        });

        it('throws 401 on wrong password', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({ id: 1, status: UserStatus.ACTIVE, email: 'x@test.com', passwordHash: 'hash' });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves(null);
            const passwordHasher = { comparePassword: sinon.stub().resolves(false), hashPassword: sinon.stub() };
            const svc = buildAuthService({ userRepo, companyUsersRepo, passwordHasher });

            await expect(svc.login({ email: 'x@test.com', password: 'wrong' })).to.be.rejectedWith('account-and-password-invalid');
        });

        it('returns token on successful login', async () => {
            const userRepo = createStubRepo();
            const userData = { id: 10, status: UserStatus.ACTIVE, email: 'user@test.com', passwordHash: 'hash', globalRole: UserRoleEnum.USER };
            userRepo.findOne.resolves(userData);
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({ companyRole: CompanyUserRoleEnum.BUYER, company: { isHaulier: false } });
            const passwordHasher = { comparePassword: sinon.stub().resolves(true), hashPassword: sinon.stub() };
            const userService = { convertToUserProfile: sinon.stub().returns({ id: 10 }) };
            const jwtService = { generateToken: sinon.stub().resolves('my-token') };
            const svc = buildAuthService({ userRepo, companyUsersRepo, passwordHasher, userService, jwtService });

            const result = await svc.login({ email: 'user@test.com', password: 'pass123' });

            expect(result.status).to.equal('success');
            expect(result.data?.user.accessToken).to.equal('my-token');
        });
    });

    describe('registerTrading()', () => {
        it('throws on invalid email', async () => {
            const svc = buildAuthService();

            await expect(svc.registerTrading({
                email: 'not-an-email',
                password: 'password123',
                companyName: 'Test Co',
                companyInterest: CompanyInterest.BUYER,
                favoriteMaterials: [],
            } as any)).to.be.rejectedWith('invalid-email');
        });

        it('throws on existing email', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({ id: 1 });
            const svc = buildAuthService({ userRepo });

            await expect(svc.registerTrading({
                email: 'exists@test.com',
                password: 'password123',
                companyName: 'Test Co',
                companyInterest: CompanyInterest.BUYER,
                favoriteMaterials: [],
            } as any)).to.be.rejectedWith('existed-user');
        });

        it('throws on short password', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves(null);
            const svc = buildAuthService({ userRepo });

            await expect(svc.registerTrading({
                email: 'new@test.com',
                password: 'short',
                companyName: 'Test Co',
                companyInterest: CompanyInterest.BUYER,
                favoriteMaterials: [],
            } as any)).to.be.rejectedWith('invalid-password');
        });

        it('creates user, company, and companyUser on success', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves(null);
            userRepo.create.resolves({ id: 1, email: 'new@test.com' });
            const companiesRepo = createStubRepo();
            companiesRepo.create.resolves({ id: 2, name: 'Test Co', status: CompanyStatus.PENDING });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.create.resolves({ id: 3, companyId: 2, userId: 1, companyRole: CompanyUserRoleEnum.ADMIN });
            const emailService = createStubService(['sendAdminNotification', 'sendAccountVerificationRequiredEmail']);
            const svc = buildAuthService({ userRepo, companiesRepo, companyUsersRepo, emailService });

            const result = await svc.registerTrading({
                email: 'new@test.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                companyName: 'Test Co',
                companyInterest: CompanyInterest.BUYER,
                favoriteMaterials: [],
            } as any);

            expect(result.status).to.equal('success');
            expect(userRepo.create.calledOnce).to.be.true();
            expect(companiesRepo.create.calledOnce).to.be.true();
            expect(companyUsersRepo.create.calledOnce).to.be.true();
        });
    });

    describe('registerHaulier()', () => {
        it('throws on invalid email', async () => {
            const svc = buildAuthService();

            await expect(svc.registerHaulier({
                email: 'bad-email',
                password: 'password123',
                documents: [],
                containerTypes: [],
                areasCovered: [],
            } as any)).to.be.rejectedWith('invalid-email');
        });

        it('throws on short password', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves(null);
            const svc = buildAuthService({ userRepo });

            await expect(svc.registerHaulier({
                email: 'haulier@test.com',
                password: 'short',
                documents: [],
                containerTypes: [],
                areasCovered: [],
            } as any)).to.be.rejectedWith('invalid-password');
        });
    });
});
