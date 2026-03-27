import { expect, sinon } from '@loopback/testlab';
import { AuthService } from '../../services/auth.service';
import { CompanyInterest, CompanyStatus, CompanyUserRoleEnum, CompanyUserStatusEnum, UserRoleEnum, UserStatus } from '../../enum';
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

describe('AuthService extended coverage (unit)', () => {
    describe('login() — additional branches', () => {
        it('throws 401 when user account is archived', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({ id: 1, status: UserStatus.ARCHIVED, email: 'x@test.com' });
            const svc = buildAuthService({ userRepo });

            await expect(svc.login({ email: 'x@test.com', password: 'pass' }))
                .to.be.rejectedWith(/archived|account/i);
        });

        it('returns token with companyRole from companyUser', async () => {
            const userRepo = createStubRepo();
            const userData = {
                id: 5,
                status: UserStatus.ACTIVE,
                email: 'u@test.com',
                passwordHash: 'hash',
                globalRole: UserRoleEnum.USER,
            };
            userRepo.findOne.resolves(userData);
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({
                companyRole: CompanyUserRoleEnum.SELLER,
                company: { isHaulier: false, isBuyer: false, isSeller: true },
            });
            const passwordHasher = { comparePassword: sinon.stub().resolves(true), hashPassword: sinon.stub() };
            const userService = { convertToUserProfile: sinon.stub().returns({ id: 5, companyRole: CompanyUserRoleEnum.SELLER }) };
            const jwtService = { generateToken: sinon.stub().resolves('seller-token') };
            const svc = buildAuthService({ userRepo, companyUsersRepo, passwordHasher, userService, jwtService });

            const result = await svc.login({ email: 'u@test.com', password: 'pass123' });

            expect(result.status).to.equal('success');
            expect(result.data?.user.accessToken).to.equal('seller-token');
        });

        it('succeeds for ADMIN user regardless of company membership', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({
                id: 99,
                status: UserStatus.ACTIVE,
                email: 'admin@test.com',
                passwordHash: 'hash',
                globalRole: UserRoleEnum.ADMIN,
            });
            userRepo.updateById.resolves();
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves(null);
            const passwordHasher = { comparePassword: sinon.stub().resolves(true), hashPassword: sinon.stub() };
            const userService = { convertToUserProfile: sinon.stub().returns({ id: 99 }) };
            const jwtService = { generateToken: sinon.stub().resolves('admin-token') };
            const svc = buildAuthService({ userRepo, companyUsersRepo, passwordHasher, userService, jwtService });

            const result = await svc.login({ email: 'admin@test.com', password: 'adminpass' });

            expect(result.status).to.equal('success');
        });
    });

    describe('registerHaulier() — success path', () => {
        it('creates user, company, companyUser, and documents on valid input', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves(null);
            userRepo.create.resolves({ id: 1, email: 'haulier@test.com' });
            const companiesRepo = createStubRepo();
            companiesRepo.create.resolves({ id: 2, name: 'Fast Haulage', status: CompanyStatus.PENDING });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.create.resolves({ id: 3, companyId: 2, userId: 1, companyRole: CompanyUserRoleEnum.ADMIN });
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
                email: 'haulier@test.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                companyName: 'Fast Haulage',
                country: 'GB',
                addressLine1: '1 Main St',
                city: 'London',
                postalCode: 'W1A 1AA',
                containerTypes: [],
                areasCovered: [],
                documents: [
                    {
                        documentType: 'insurance',
                        documentUrl: 'https://s3.example.com/doc.pdf',
                        expiryDate: '31/12/2026',
                    },
                ],
            } as any);

            expect(result.status).to.equal('success');
            expect(userRepo.create.calledOnce).to.be.true();
            expect(companiesRepo.create.calledOnce).to.be.true();
            expect(companyUsersRepo.create.calledOnce).to.be.true();
            expect(companyDocsRepo.create.calledOnce).to.be.true();
        });

        it('throws when existing email is used for haulier registration', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({ id: 1 });
            const svc = buildAuthService({ userRepo });

            await expect(svc.registerHaulier({
                email: 'exists@test.com',
                password: 'password123',
                documents: [],
                containerTypes: [],
                areasCovered: [],
            } as any)).to.be.rejectedWith('existed-user');
        });
    });

    describe('registerTrading() — SELLER and BOTH interest', () => {
        function makeRegistrationBase(overrides: Record<string, any> = {}): any {
            return {
                email: 'new@test.com',
                password: 'password123',
                firstName: 'Alice',
                lastName: 'Smith',
                companyName: 'Trade Corp',
                favoriteMaterials: [],
                ...overrides,
            };
        }

        it('sets isSeller=true isBuyer=false for SELLER interest', async () => {
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

            await svc.registerTrading(makeRegistrationBase({ companyInterest: CompanyInterest.SELLER }));

            const companyCreateArg = companiesRepo.create.firstCall.args[0];
            expect(companyCreateArg.isSeller).to.be.true();
            expect(companyCreateArg.isBuyer).to.be.false();
        });

        it('sets isBuyer=true isSeller=true for BOTH interest', async () => {
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

            await svc.registerTrading(makeRegistrationBase({ companyInterest: CompanyInterest.BOTH }));

            const companyCreateArg = companiesRepo.create.firstCall.args[0];
            expect(companyCreateArg.isBuyer).to.be.true();
            expect(companyCreateArg.isSeller).to.be.true();
        });

        it('sends admin notification and verification emails on success', async () => {
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

            await svc.registerTrading(makeRegistrationBase({ companyInterest: CompanyInterest.BUYER }));

            expect(emailService.sendAdminNotification.calledOnce).to.be.true();
            expect(emailService.sendAccountVerificationRequiredEmail.calledOnce).to.be.true();
        });
    });

    describe('generateUniqueUsername() — uniqueness guarantee', () => {
        it('retries multiple times until conflict-free username found', async () => {
            const userRepo = createStubRepo();
            // First 4 attempts collide, 5th is unique
            userRepo.findOne
                .onCall(0).resolves({ id: 1 })
                .onCall(1).resolves({ id: 2 })
                .onCall(2).resolves({ id: 3 })
                .onCall(3).resolves({ id: 4 })
                .onCall(4).resolves(null);
            const svc = buildAuthService({ userRepo });

            const result = await svc.generateUniqueUsername();

            expect(userRepo.findOne.callCount).to.equal(5);
            expect(/^\d{8}$/.test(result)).to.be.true();
        });
    });
});
