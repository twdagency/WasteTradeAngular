/**
 * company.service-5.unit.ts
 * Branch-focused tests for company.service.ts (Part 5)
 * Targets: updateCompany companyInterest branches, mergeCompanies error paths,
 *          reassignUser guards, getPendingCompanies filters.
 */
import { expect, sinon } from '@loopback/testlab';
import { CompanyService } from '../../services/company.service';
import {
    CompanyInterest,
    CompanyStatus,
    CompanyUserRoleEnum,
    UserRoleEnum,
} from '../../enum';
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

function makeAdminProfile(overrides: Record<string, any> = {}): any {
    return { id: 99, globalRole: UserRoleEnum.ADMIN, companyId: 1, companyRole: CompanyUserRoleEnum.ADMIN, ...overrides };
}

function makeUserProfile(overrides: Record<string, any> = {}): any {
    return { id: 1, globalRole: UserRoleEnum.USER, companyId: 10, companyRole: CompanyUserRoleEnum.ADMIN, ...overrides };
}

describe('CompanyService branch coverage - Part 5 (unit)', () => {
    describe('updateCompany() — companyInterest branch', () => {
        it('throws Unauthorized when companyUser is not admin of the company', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves(null); // no admin record found
            const svc = buildService({ companyUserRepo });

            const result = await svc.updateCompany({ name: 'New Name' } as any, 10, '1');

            // updateCompany catches errors and returns status:'error' rather than throwing
            expect(result.status).to.equal('error');
        });

        it('sets isBuyer=true isSeller=false when companyInterest=BUYER', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 5, userId: 1, companyId: 10, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            companiesRepo.updateById.resolves();
            const svc = buildService({ companyUserRepo, companiesRepo });

            const result = await svc.updateCompany(
                { companyInterest: CompanyInterest.BUYER } as any,
                10,
                '1',
            );

            expect(result.status).to.equal('success');
            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.isBuyer).to.be.true();
            expect(updateArg.isSeller).to.be.false();
        });

        it('sets isBuyer=false isSeller=true when companyInterest=SELLER', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 5, userId: 1, companyId: 10, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            companiesRepo.updateById.resolves();
            const svc = buildService({ companyUserRepo, companiesRepo });

            const result = await svc.updateCompany(
                { companyInterest: CompanyInterest.SELLER } as any,
                10,
                '1',
            );

            expect(result.status).to.equal('success');
            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.isBuyer).to.be.false();
            expect(updateArg.isSeller).to.be.true();
        });

        it('sets isBuyer=true isSeller=true when companyInterest=BOTH', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 5, userId: 1, companyId: 10, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            companiesRepo.updateById.resolves();
            const svc = buildService({ companyUserRepo, companiesRepo });

            const result = await svc.updateCompany(
                { companyInterest: CompanyInterest.BOTH } as any,
                10,
                '1',
            );

            expect(result.status).to.equal('success');
            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.isBuyer).to.be.true();
            expect(updateArg.isSeller).to.be.true();
        });

        it('derives companyInterest=BOTH when isBuyer and isSeller both set independently', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 5, userId: 1, companyId: 10, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 10, isBuyer: false, isSeller: false });
            companiesRepo.updateById.resolves();
            const svc = buildService({ companyUserRepo, companiesRepo });

            const result = await svc.updateCompany(
                { isBuyer: true, isSeller: true } as any,
                10,
                '1',
            );

            expect(result.status).to.equal('success');
            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.companyInterest).to.equal(CompanyInterest.BOTH);
        });

        it('derives companyInterest=SELLER when only isSeller=true', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 5, userId: 1, companyId: 10, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 10, isBuyer: false, isSeller: false });
            companiesRepo.updateById.resolves();
            const svc = buildService({ companyUserRepo, companiesRepo });

            const result = await svc.updateCompany(
                { isSeller: true, isBuyer: false } as any,
                10,
                '1',
            );

            expect(result.status).to.equal('success');
            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.companyInterest).to.equal(CompanyInterest.SELLER);
        });
    });

    describe('mergeCompanies() — error path branches', () => {
        it('throws Forbidden when non-admin attempts merge', async () => {
            const svc = buildService();

            await expect(svc.mergeCompanies(1, 2, makeUserProfile({ globalRole: UserRoleEnum.USER })))
                .to.be.rejectedWith(/unauthorized|forbidden|admin/i);
        });

        it('throws BadRequest when masterCompanyId equals mergedCompanyId', async () => {
            const svc = buildService();

            await expect(svc.mergeCompanies(5, 5, makeAdminProfile()))
                .to.be.rejectedWith(/different|same/i);
        });

        it('throws NotFound when one of the companies does not exist', async () => {
            const companiesRepo = createStubRepo();
            // findById called twice in Promise.all — first resolves, second returns null
            companiesRepo.findById
                .onFirstCall().resolves({ id: 1, name: 'Master' })
                .onSecondCall().resolves(null);
            // dataSource needed for beginTransaction
            companiesRepo.dataSource = {
                beginTransaction: sinon.stub().resolves({
                    rollback: sinon.stub().resolves(),
                    commit: sinon.stub().resolves(),
                }),
                execute: sinon.stub().resolves([{ count: 0 }]),
            };
            const svc = buildService({ companiesRepo });

            await expect(svc.mergeCompanies(1, 2, makeAdminProfile()))
                .to.be.rejectedWith(/not found|companies/i);
        });
    });

    describe('reassignUser() — guard branches', () => {
        it('throws BadRequest when companyId is 0 for admin', async () => {
            const svc = buildService();

            await expect(svc.reassignUser(1, 2, 0, makeAdminProfile()))
                .to.be.rejectedWith(/companyId is required/i);
        });

        it('throws Forbidden when non-admin non-company-admin calls', async () => {
            const svc = buildService();

            await expect(svc.reassignUser(1, 2, 10, makeUserProfile({ companyRole: CompanyUserRoleEnum.BUYER })))
                .to.be.rejectedWith(/unauthorized|forbidden/i);
        });
    });

    describe('removeUser() — guard branches', () => {
        it('throws Forbidden when non-admin calls removeUser', async () => {
            const svc = buildService();

            await expect(svc.removeUser(1, 10, makeUserProfile({ globalRole: UserRoleEnum.USER })))
                .to.be.rejectedWith(/unauthorized|forbidden/i);
        });

        it('removes user successfully when admin calls with valid companyUser', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({
                id: 5,
                userId: 1,
                companyId: 10,
                user: { email: 'u@t.com', firstName: 'John', lastName: 'Doe' },
                company: { name: 'ACME Corp' },
            });
            companyUserRepo.deleteById = sinon.stub().resolves();
            const emailService = createStubService(['sendUserReceiveUnlinkedFromCompanyEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildService({ companyUserRepo, emailService, notificationsService });

            const result = await svc.removeUser(1, 10, makeAdminProfile());

            expect(result.status).to.equal('success');
            expect(companyUserRepo.deleteById.calledWith(5)).to.be.true();
        });
    });

    describe('getCompaniesDescending() — filter branches', () => {
        it('returns empty result when no companies match', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.execute = sinon.stub()
                .onFirstCall().resolves([{ total: '0' }])
                .onSecondCall().resolves([]);
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.find.resolves([]);
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.find.resolves([]);
            const svc = buildService({ companiesRepo, companyDocsRepo, companyLocationsRepo });

            const result = await svc.getCompaniesDescending();
            expect(result.total).to.equal(0);
            expect(result.data).to.have.length(0);
        });

        it('applies name search filter when or condition is provided', async () => {
            const companiesRepo = createStubRepo();
            const capturedSqls: string[] = [];
            companiesRepo.execute = sinon.stub().callsFake((sql: string) => {
                capturedSqls.push(String(sql));
                return Promise.resolve([{ total: '0' }]);
            });
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.find.resolves([]);
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.find.resolves([]);
            const svc = buildService({ companiesRepo, companyDocsRepo, companyLocationsRepo });

            await svc.getCompaniesDescending({
                where: { or: [{ name: { ilike: '%testcorp%' } }] } as any,
            });

            expect(capturedSqls.some(s => s.toLowerCase().includes('testcorp'))).to.be.true();
        });
    });
});
