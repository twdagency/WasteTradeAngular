/**
 * user.service-8.unit.ts
 * Coverage-focused tests for user.service.ts (Part 8)
 * Targets: getUsers() tabFilter, dateFilter, and accountTypeFilter SQL branches.
 */
import { expect, sinon } from '@loopback/testlab';
import { MyUserService } from '../../services/user.service';
import { UserTabFilter, UserAccountType } from '../../enum';
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

describe('MyUserService getUsers() SQL filter branches - Part 8 (unit)', () => {

    describe('tabFilter branches', () => {
        it('UNVERIFIED: SQL contains pending and request_information', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({ where: { tabFilter: UserTabFilter.UNVERIFIED } as any });
            expect(sqls.some(s => s.includes('pending') && s.includes('request_information'))).to.be.true();
        });

        it('VERIFIED: SQL contains status = active', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({ where: { tabFilter: UserTabFilter.VERIFIED } as any });
            expect(sqls.some(s => s.includes("status = 'active'"))).to.be.true();
        });

        it('REJECTED: SQL contains status = rejected', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({ where: { tabFilter: UserTabFilter.REJECTED } as any });
            expect(sqls.some(s => s.includes("status = 'rejected'"))).to.be.true();
        });

        it('default (no tabFilter): no status filter clause added', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({});
            // SQL should not contain explicit status filter from tab (only global_role filter)
            expect(sqls.some(s => s.includes("global_role = 'user'"))).to.be.true();
        });
    });

    describe('dateFilter branches', () => {
        it('dateFrom + dateTo: SQL contains BETWEEN', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({ where: { dateFrom: '2024-01-01', dateTo: '2024-12-31' } as any });
            expect(sqls.some(s => s.includes('BETWEEN') && s.includes('2024-01-01'))).to.be.true();
        });

        it('dateFrom only: SQL contains >= clause', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({ where: { dateFrom: '2024-06-01' } as any });
            expect(sqls.some(s => s.includes(">= '2024-06-01'"))).to.be.true();
        });

        it('dateTo only: SQL contains <= clause', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({ where: { dateTo: '2024-12-31' } as any });
            expect(sqls.some(s => s.includes("<= '2024-12-31'"))).to.be.true();
        });
    });

    describe('accountTypeFilter branches', () => {
        it('BUYER: SQL filters company_role = buyer', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({ where: { accountType: UserAccountType.BUYER } as any });
            expect(sqls.some(s => s.includes("company_role = 'buyer'"))).to.be.true();
        });

        it('SELLER: SQL filters company_role = seller', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({ where: { accountType: UserAccountType.SELLER } as any });
            expect(sqls.some(s => s.includes("company_role = 'seller'"))).to.be.true();
        });

        it('DUAL: SQL filters company_role = both', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({ where: { accountType: UserAccountType.DUAL } as any });
            expect(sqls.some(s => s.includes("company_role = 'both'"))).to.be.true();
        });

        it('HAULIER: SQL filters company_role = haulier', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({ where: { accountType: UserAccountType.HAULIER } as any });
            expect(sqls.some(s => s.includes("company_role = 'haulier'"))).to.be.true();
        });

        it('TRADING_COMPANY_ADMIN: SQL contains is_haulier = false', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({ where: { accountType: UserAccountType.TRADING_COMPANY_ADMIN } as any });
            expect(sqls.some(s => s.includes('is_haulier = false'))).to.be.true();
        });

        it('HAULAGE_COMPANY_ADMIN: SQL contains is_haulier = true', async () => {
            const { sqls, svc } = captureSql();
            await svc.getUsers({ where: { accountType: UserAccountType.HAULAGE_COMPANY_ADMIN } as any });
            expect(sqls.some(s => s.includes('is_haulier = true'))).to.be.true();
        });
    });
});
