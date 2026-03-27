/**
 * company.service-6.unit.ts
 * Coverage for: getCompanyByVATNumber, searchCompaniesForMerge,
 * getCompanyUsers, searchUsersForReassignment, companyAdminRemoveUserPending,
 * handleSendEmailAndNotificationUnlinkUserFromCompany
 */
import { expect, sinon } from '@loopback/testlab';
import { CompanyService } from '../../services/company.service';
import { CompanyUserRoleEnum, UserRoleEnum } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildService(overrides: Record<string, any> = {}): CompanyService {
    return new CompanyService(
        overrides.companiesRepo ?? createStubRepo(),
        overrides.companyUserRepo ?? createStubRepo(),
        overrides.companyDocsRepo ?? createStubRepo(),
        overrides.companyLocationsRepo ?? createStubRepo(),
        overrides.companyUserRequestsRepo ?? createStubRepo(),
        overrides.userRepo ?? createStubRepo(),
        overrides.emailService ?? createStubService([
            'sendCompanyRejectedEmail',
            'sendAdminNotification',
            'sendUserReceiveUnlinkedFromCompanyEmail',
            'sendCompanyApprovedEmail',
            'sendCompanyRequestInformationEmail',
        ]),
        overrides.notificationsService ?? createStubService(['createNotification']),
    );
}

function makeAdmin(): any {
    return { id: 99, email: 'admin@test.com', firstName: 'Admin', lastName: 'User', username: 'admin', name: 'Admin User', companyName: 'TestCo', globalRole: UserRoleEnum.ADMIN, companyId: 1, companyRole: CompanyUserRoleEnum.ADMIN, isHaulier: false };
}

function makeUser(): any {
    return { id: 1, email: 'user@test.com', firstName: 'Normal', lastName: 'User', username: 'user', name: 'Normal User', companyName: 'UserCo', globalRole: UserRoleEnum.USER, companyId: 10, companyRole: CompanyUserRoleEnum.ADMIN, isHaulier: false };
}

describe('CompanyService coverage - Part 6 (unit)', () => {
    describe('getCompanyByVATNumber()', () => {
        it('returns company when found', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findOne.resolves({ id: 5, vatNumber: 'GB123', name: 'TestCo' });
            const svc = buildService({ companiesRepo });

            const result = await svc.getCompanyByVATNumber('GB123', false);
            expect(result).to.have.property('vatNumber', 'GB123');
        });

        it('throws 404 when VAT number not found', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findOne.resolves(null);
            const svc = buildService({ companiesRepo });

            await expect(svc.getCompanyByVATNumber('NOTEXIST', false)).to.be.rejected();
        });

        it('passes isHaulier flag to query', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findOne.resolves({ id: 7, vatNumber: 'H999', isHaulier: true });
            const svc = buildService({ companiesRepo });

            const result = await svc.getCompanyByVATNumber('H999', true);
            expect(result.id).to.equal(7);
            const callArg = companiesRepo.findOne.firstCall.args[0];
            expect(callArg.where.isHaulier).to.be.true();
        });
    });

    describe('searchCompaniesForMerge()', () => {
        it('throws Forbidden for non-admin users', async () => {
            const svc = buildService();
            await expect(svc.searchCompaniesForMerge({}, '', makeUser())).to.be.rejectedWith(/unauthorized|forbidden|admin/i);
        });

        it('returns paginated results with searchTerm for admin', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.execute = sinon.stub()
                .onFirstCall().resolves([{ id: 1, name: 'ACME Corp' }])
                .onSecondCall().resolves([{ count: '1' }]);
            const svc = buildService({ companiesRepo });

            const result = await svc.searchCompaniesForMerge({}, 'acme', makeAdmin());
            expect(result.totalCount).to.equal(1);
        });

        it('returns empty list when no match', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.execute = sinon.stub()
                .onFirstCall().resolves([])
                .onSecondCall().resolves([{ count: '0' }]);
            const svc = buildService({ companiesRepo });

            const result = await svc.searchCompaniesForMerge({}, 'xyz123', makeAdmin());
            expect(result.totalCount).to.equal(0);
        });

        it('passes isHaulier from filter.where to query', async () => {
            const companiesRepo = createStubRepo();
            const sqls: string[] = [];
            companiesRepo.execute = sinon.stub().callsFake((sql: string) => {
                sqls.push(sql);
                return Promise.resolve([{ count: '0' }]);
            });
            const svc = buildService({ companiesRepo });

            await svc.searchCompaniesForMerge({ where: { isHaulier: true } as any }, '', makeAdmin());
            expect(sqls.some(s => s.includes('is_haulier = true'))).to.be.true();
        });
    });

    describe('getCompanyUsers()', () => {
        it('throws Forbidden for non-admin non-company-admin', async () => {
            const svc = buildService();
            await expect(svc.getCompanyUsers(
                {},
                '',
                { id: 1, email: 'b@test.com', firstName: 'B', lastName: 'U', username: 'bu', name: 'B U', companyName: 'Co', globalRole: UserRoleEnum.USER, companyId: 10, companyRole: CompanyUserRoleEnum.BUYER, isHaulier: false } as any,
            )).to.be.rejectedWith(/unauthorized|forbidden/i);
        });

        it('returns users when admin with companyId filter', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.execute = sinon.stub()
                .onFirstCall().resolves([{ id: 1, firstName: 'Jane', lastName: 'Doe', companyId: 10, companyRole: 'admin', status: 'active', email: 'jane@t.com' }])
                .onSecondCall().resolves([{ count: '1' }]);
            const svc = buildService({ companiesRepo });

            const result = await svc.getCompanyUsers(
                { where: { companyId: 10 } as any },
                '',
                makeAdmin(),
            );
            expect(result.totalCount).to.equal(1);
        });

        it('restricts to current company for company-admin user', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.execute = sinon.stub()
                .onFirstCall().resolves([])
                .onSecondCall().resolves([{ count: '0' }]);
            const svc = buildService({ companiesRepo });

            await svc.getCompanyUsers({}, '', makeUser());
            // execute called with SQL containing companyId
            const sqlArg = companiesRepo.execute.firstCall.args[0];
            expect(sqlArg).to.containEql('10');
        });

        it('applies UNVERIFIED tabFilter to query', async () => {
            const companiesRepo = createStubRepo();
            const sqls: string[] = [];
            companiesRepo.execute = sinon.stub().callsFake((sql: string) => {
                sqls.push(sql);
                return Promise.resolve([{ count: '0' }]);
            });
            const svc = buildService({ companiesRepo });

            await svc.getCompanyUsers(
                { where: { tabFilter: 'unverified' } as any },
                '',
                makeAdmin(),
            );
            expect(sqls.some(s => s.includes('pending'))).to.be.true();
        });
    });

    describe('searchUsersForReassignment()', () => {
        it('throws BadRequest for admin without companyId', async () => {
            const svc = buildService();
            await expect(svc.searchUsersForReassignment({}, '', makeAdmin())).to.be.rejectedWith(/companyId is required/i);
        });

        it('throws Forbidden for non-company-admin', async () => {
            const svc = buildService();
            await expect(
                svc.searchUsersForReassignment(
                    {},
                    '',
                    { id: 1, email: 'b@test.com', firstName: 'B', lastName: 'U', username: 'bu', name: 'B U', companyName: 'Co', globalRole: UserRoleEnum.USER, companyId: 10, companyRole: CompanyUserRoleEnum.BUYER, isHaulier: false } as any,
                ),
            ).to.be.rejectedWith(/unauthorized|forbidden/i);
        });

        it('returns paginated users for admin with companyId', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.execute = sinon.stub()
                .onFirstCall().resolves([{ id: 2, email: 'b@t.com', firstName: 'Bob', lastName: 'Smith', companyRole: 'buyer' }])
                .onSecondCall().resolves([{ count: '1' }]);
            const svc = buildService({ companiesRepo });

            const result = await svc.searchUsersForReassignment(
                { where: { companyId: 5 } as any },
                '',
                makeAdmin(),
            );
            expect(result.totalCount).to.equal(1);
        });

        it('applies searchTerm to SQL query', async () => {
            const companiesRepo = createStubRepo();
            const sqls: string[] = [];
            companiesRepo.execute = sinon.stub().callsFake((sql: string) => {
                sqls.push(sql);
                return Promise.resolve([{ count: '0' }]);
            });
            const svc = buildService({ companiesRepo });

            await svc.searchUsersForReassignment(
                { where: { companyId: 5 } as any },
                'john',
                makeAdmin(),
            );
            expect(sqls.some(s => s.toLowerCase().includes('john'))).to.be.true();
        });
    });

    describe('companyAdminRemoveUserPending()', () => {
        it('throws Forbidden for non-company-admin user', async () => {
            const svc = buildService();
            await expect(
                svc.companyAdminRemoveUserPending(1, 10, {
                    id: 1, email: 'b@test.com', firstName: 'B', lastName: 'U', username: 'bu', name: 'B U', companyName: 'Co',
                    globalRole: UserRoleEnum.USER, companyId: 10, companyRole: CompanyUserRoleEnum.BUYER, isHaulier: false,
                } as any),
            ).to.be.rejectedWith(/unauthorized|forbidden/i);
        });

        it('throws NotFound when pending request not found', async () => {
            const companyUserRequestsRepo = createStubRepo();
            companyUserRequestsRepo.findOne.resolves(null);
            const svc = buildService({ companyUserRequestsRepo });

            await expect(svc.companyAdminRemoveUserPending(999, 10, makeAdmin())).to.be.rejected();
        });

        it('removes pending user and returns success', async () => {
            const companyUserRequestsRepo = createStubRepo();
            companyUserRequestsRepo.findOne.resolves({
                id: 3,
                userId: 1,
                companyId: 10,
                user: { email: 'u@t.com', firstName: 'Joe', lastName: 'Blow' },
                company: { name: 'ACME' },
            });
            companyUserRequestsRepo.deleteById = sinon.stub().resolves();
            const emailService = createStubService(['sendUserReceiveUnlinkedFromCompanyEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildService({ companyUserRequestsRepo, emailService, notificationsService });

            const result = await svc.companyAdminRemoveUserPending(1, 10, makeAdmin());
            expect(result.success).to.be.true();
        });
    });

    describe('handleSendEmailAndNotificationUnlinkUserFromCompany()', () => {
        it('sends email and creates notification', async () => {
            const emailService = createStubService(['sendUserReceiveUnlinkedFromCompanyEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildService({ emailService, notificationsService });

            await svc.handleSendEmailAndNotificationUnlinkUserFromCompany({
                userId: 1,
                companyId: 10,
                companyUser: { email: 'u@t.com', firstName: 'Jane', lastName: 'Doe' },
                companyName: 'TestCo',
            });

            expect(emailService.sendUserReceiveUnlinkedFromCompanyEmail.calledOnce).to.be.true();
            expect(notificationsService.createNotification.calledOnce).to.be.true();
        });
    });
});
