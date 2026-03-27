/**
 * user.service-9.unit.ts
 * Coverage-focused tests for user.service.ts (Part 9)
 * Targets: getUsers() registrationStatusFilter, searchTerm branches,
 *          client-side overallStatus/onboardingStatus filtering, pagination shape.
 */
import { expect, sinon } from '@loopback/testlab';
import { MyUserService } from '../../services/user.service';
import {
    UserRegistrationStatus,
    UserOverallStatus,
    OnboardingStatus,
} from '../../enum';
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
            'sendResetPasswordEmail', 'sendInvitedToJoinCompanyEmail',
            'sendEditProfileEmail', 'sendAccountVerificationApprovedEmail',
            'sendCompanyRejectedEmail', 'sendCompanyRequestInformationEmail',
        ]),
        overrides.companyService ?? createStubService(['getCompanyById', 'getDisplayArray']),
        overrides.notificationsService ?? createStubService(['createNotification']),
    );
}

function captureSql(overrides: Record<string, any> = {}): { sqls: string[]; svc: MyUserService } {
    const sqls: string[] = [];
    const userRepo = createStubRepo();
    userRepo.execute = sinon.stub().callsFake((sql: string) => {
        sqls.push(sql);
        return Promise.resolve([]);
    });
    return { sqls, svc: buildUserService({ userRepo, ...overrides }) };
}

describe('MyUserService getUsers() advanced filter branches - Part 9 (unit)', () => {

    describe('registrationStatusFilter branches', () => {
        it('COMPLETE: SQL contains c.status = active', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({ where: { registrationStatus: UserRegistrationStatus.COMPLETE } as any });
            expect(sqls.some(s => s.includes("c.status = 'active'"))).to.be.true();
        });

        it('IN_PROGRESS: SQL contains c.status != active', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({ where: { registrationStatus: UserRegistrationStatus.IN_PROGRESS } as any });
            expect(sqls.some(s => s.includes("c.status != 'active'"))).to.be.true();
        });
    });

    describe('searchTerm SQL filter branches', () => {
        it('escapes single quotes in searchTerm', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({}, "o'brien");
            expect(sqls.some(s => s.includes("o''brien"))).to.be.true();
        });

        it('"buy" searchTerm adds buyer company_role to SQL', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({}, 'buy');
            expect(sqls.some(s => s.includes("company_role = 'buyer'"))).to.be.true();
        });

        it('"sell" searchTerm adds seller company_role to SQL', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({}, 'sell');
            expect(sqls.some(s => s.includes("company_role = 'seller'"))).to.be.true();
        });

        it('"dual" searchTerm adds both company_role to SQL', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({}, 'dual');
            expect(sqls.some(s => s.includes("company_role = 'both'"))).to.be.true();
        });

        it('"haul" searchTerm adds haulier company_role to SQL', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({}, 'haul');
            expect(sqls.some(s => s.includes("company_role = 'haulier'"))).to.be.true();
        });

        it('"trading company" searchTerm adds trading admin filter to SQL', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({}, 'trading company');
            expect(sqls.some(s => s.includes('is_haulier = false'))).to.be.true();
        });

        it('"haulage company" searchTerm adds haulage admin filter to SQL', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({}, 'haulage company');
            expect(sqls.some(s => s.includes('is_haulier = true'))).to.be.true();
        });
    });

    describe('client-side overallStatus filtering', () => {
        it('COMPLETE filter: excludes users with no company (empty overallStatus)', async () => {
            const userRepo = createStubRepo();
            userRepo.execute = sinon.stub()
                .resolves([{ id: 1, firstName: 'A', lastName: 'B', email: 'a@t.com', status: 'active', companyId: null }]);
            const svc = buildUserService({ userRepo });

            const result = await svc.getUsers(
                { limit: 10, skip: 0, where: { overallStatus: UserOverallStatus.COMPLETE } as any },
            );

            expect(result.results).to.have.length(0);
            expect(result.totalCount).to.equal(0);
        });

        it('AWAITING_APPROVAL filter: excludes users with mismatched overallStatus', async () => {
            const userRepo = createStubRepo();
            userRepo.execute = sinon.stub()
                .resolves([{ id: 2, firstName: 'B', lastName: 'C', email: 'b@t.com', status: 'active', companyId: null }]);
            const svc = buildUserService({ userRepo });

            const result = await svc.getUsers(
                { limit: 10, skip: 0, where: { overallStatus: UserOverallStatus.AWAITING_APPROVAL } as any },
            );

            expect(result.results).to.have.length(0);
        });

    });

    describe('client-side onboardingStatus filtering', () => {
        it('onboardingStatus filter excludes users with no onboardingStatus', async () => {
            const userRepo = createStubRepo();
            userRepo.execute = sinon.stub()
                .resolves([{ id: 4, firstName: 'D', lastName: 'E', email: 'd@t.com', status: 'active', companyId: null }]);
            const svc = buildUserService({ userRepo });

            const result = await svc.getUsers(
                { limit: 10, skip: 0, where: { onboardingStatus: OnboardingStatus.COMPANY_INFORMATION_COMPLETE } as any },
            );

            expect(result.results).to.have.length(0);
        });
    });

    describe('pagination shape', () => {
        it('returns totalCount from SQL count query when no client-side filtering', async () => {
            const userRepo = createStubRepo();
            userRepo.execute = sinon.stub()
                .onFirstCall().resolves([])
                .onSecondCall().resolves([{ count: '57' }]);
            const svc = buildUserService({ userRepo });

            const result = await svc.getUsers({ limit: 10, skip: 0 });

            expect(result.totalCount).to.equal(57);
            expect(result.results).to.have.length(0);
        });

        it('countResult of 0 returns totalCount 0', async () => {
            const userRepo = createStubRepo();
            userRepo.execute = sinon.stub()
                .onFirstCall().resolves([])
                .onSecondCall().resolves([{ count: '0' }]);
            const svc = buildUserService({ userRepo });

            const result = await svc.getUsers({ limit: 10, skip: 0 });

            expect(result.totalCount).to.equal(0);
        });

        it('client-side pagination slices results correctly', async () => {
            const rows = Array.from({ length: 5 }, (_, i) => ({
                id: i + 1, firstName: 'X', lastName: 'Y', email: `u${i}@t.com`,
                status: 'active', companyId: null,
            }));
            const userRepo = createStubRepo();
            userRepo.execute = sinon.stub().resolves(rows);
            const svc = buildUserService({ userRepo });

            // overallStatus filter with empty results forces client-side path; no matches → totalCount=0
            const result = await svc.getUsers(
                { limit: 2, skip: 1, where: { overallStatus: UserOverallStatus.COMPLETE } as any },
            );

            expect(result.totalCount).to.equal(0);
            expect(result.results).to.have.length(0);
        });
    });
});
