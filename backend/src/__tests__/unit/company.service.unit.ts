import { expect, sinon } from '@loopback/testlab';
import { CompanyService } from '../../services/company.service';
import { CompanyInterest, CompanyStatus, CompanyUserRoleEnum, CompanyUserStatusEnum, UserRoleEnum } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function makeAdminProfile(overrides: Record<string, any> = {}): any {
    return { id: 99, globalRole: UserRoleEnum.ADMIN, companyId: 1, ...overrides };
}

function buildCompanyService(overrides: Record<string, any> = {}): CompanyService {
    return new CompanyService(
        overrides.companiesRepo ?? createStubRepo(),
        overrides.companyUserRepo ?? createStubRepo(),
        overrides.companyDocsRepo ?? createStubRepo(),
        overrides.companyLocationsRepo ?? createStubRepo(),
        overrides.companyUserRequestsRepo ?? createStubRepo(),
        overrides.userRepo ?? createStubRepo(),
        overrides.emailService ?? createStubService(['sendCompanyRejectedEmail', 'sendAdminNotification']),
        overrides.notificationsService ?? createStubService(['createNotification']),
    );
}

describe('CompanyService (unit)', () => {
    describe('getRolePriority() — via mergeCompanies role selection', () => {
        it('prefers ADMIN role over BUYER during merge', async () => {
            // Test via the mergeCompanies logic: user in both companies, one ADMIN one BUYER
            const tx = { commit: sinon.stub().resolves(), rollback: sinon.stub().resolves() };
            const companiesRepo = createStubRepo();
            companiesRepo.findById.onFirstCall().resolves({ id: 1, isHaulier: false });
            companiesRepo.findById.onSecondCall().resolves({ id: 2, isHaulier: false });
            companiesRepo.dataSource = {
                beginTransaction: sinon.stub().resolves(tx),
                execute: sinon.stub().resolves([{ count: 0 }]),
            };
            companiesRepo.execute = sinon.stub().resolves([{ count: 0 }]);
            companiesRepo.deleteById = sinon.stub().resolves();

            const companyUserRepo = createStubRepo();
            // userId 10 appears in both companies: master=BUYER, merged=ADMIN
            companyUserRepo.find.resolves([
                { id: 100, userId: 10, companyId: 1, companyRole: CompanyUserRoleEnum.BUYER },
                { id: 200, userId: 10, companyId: 2, companyRole: CompanyUserRoleEnum.ADMIN },
            ]);
            companyUserRepo.updateById.resolves();
            companyUserRepo.deleteById.resolves();

            const svc = buildCompanyService({ companiesRepo, companyUserRepo });
            const result = await svc.mergeCompanies(1, 2, makeAdminProfile());

            // Should have called updateById to set best role (ADMIN priority=4 > BUYER priority=2)
            const updateCall = companyUserRepo.updateById.getCalls().find(
                (c: any) => c.args[1]?.companyRole === CompanyUserRoleEnum.ADMIN
            );
            expect(updateCall).to.not.be.undefined();
            expect(result.status).to.equal('success');
        });

        it('throws BadRequest when merging same company', async () => {
            const svc = buildCompanyService();
            await expect(svc.mergeCompanies(5, 5, makeAdminProfile()))
                .to.be.rejectedWith('Select a different company');
        });

        it('throws Forbidden when caller is not admin', async () => {
            const svc = buildCompanyService();
            await expect(svc.mergeCompanies(1, 2, makeAdminProfile({ globalRole: UserRoleEnum.USER })))
                .to.be.rejectedWith(/403|unauthorized/i);
        });
    });

    describe('updateCompany()', () => {
        it('throws Unauthorized when no admin company user found', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves(null);
            const svc = buildCompanyService({ companyUserRepo });

            const result = await svc.updateCompany({ name: 'New Name' } as any, 10, '1');
            // updateCompany catches and returns error shape
            expect(result.status).to.equal('error');
        });

        it('updates company and derives isBuyer/isSeller from companyInterest=BOTH', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, companyId: 10, userId: 1, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            companiesRepo.updateById.resolves();
            const svc = buildCompanyService({ companiesRepo, companyUserRepo });

            const result = await svc.updateCompany({ companyInterest: CompanyInterest.BOTH } as any, 10, '1');

            expect(result.status).to.equal('success');
            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.isBuyer).to.be.true();
            expect(updateArg.isSeller).to.be.true();
        });

        it('derives companyInterest=SELLER when isSeller=true and isBuyer=false', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, companyId: 10, userId: 1, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 10, isBuyer: false, isSeller: false });
            companiesRepo.updateById.resolves();
            const svc = buildCompanyService({ companiesRepo, companyUserRepo });

            const result = await svc.updateCompany({ isSeller: true, isBuyer: false } as any, 10, '1');

            expect(result.status).to.equal('success');
            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.companyInterest).to.equal(CompanyInterest.SELLER);
        });
    });

    describe('createCompany()', () => {
        it('creates company and returns success', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.create.resolves({ id: 5, name: 'Test Co', status: CompanyStatus.PENDING });
            const svc = buildCompanyService({ companiesRepo });

            const result = await svc.createCompany({ name: 'Test Co', isHaulier: false } as any);

            expect(result.status).to.equal('success');
            expect(companiesRepo.create.calledOnce).to.be.true();
        });
    });

    describe('mergeCompanies() — type mismatch', () => {
        it('throws BadRequest when haulier merged with trading company', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.onFirstCall().resolves({ id: 1, isHaulier: true });
            companiesRepo.findById.onSecondCall().resolves({ id: 2, isHaulier: false });
            // beginTransaction must exist on dataSource
            companiesRepo.dataSource = { beginTransaction: sinon.stub().resolves({ rollback: sinon.stub() }) };
            const svc = buildCompanyService({ companiesRepo });

            await expect(svc.mergeCompanies(1, 2, makeAdminProfile()))
                .to.be.rejectedWith('Companies must be of the same type');
        });
    });
});
