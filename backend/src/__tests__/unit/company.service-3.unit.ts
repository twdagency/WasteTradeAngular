import { expect, sinon } from '@loopback/testlab';
import { CompanyService } from '../../services/company.service';
import {
    CompanyDocumentStatus,
    CompanyInterest,
    CompanyStatus,
    CompanyUserRoleEnum,
    UserRoleEnum,
    UserRegistrationStatus,
    UserOverallStatus,
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
    return { id: 99, globalRole: UserRoleEnum.ADMIN, companyId: 1, ...overrides };
}

describe('CompanyService deeper coverage (unit)', () => {
    describe('getCompanyByVATNumber()', () => {
        it('returns company when found by VAT number', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findOne.resolves({ id: 5, vatNumber: 'GB123', isHaulier: false });
            const svc = buildService({ companiesRepo });

            const result = await svc.getCompanyByVATNumber('GB123', false);

            expect(result.id).to.equal(5);
            expect(companiesRepo.findOne.firstCall.args[0]).to.containEql({
                where: { vatNumber: { ilike: 'GB123' }, isHaulier: false },
            });
        });

        it('throws NotFound when company not found by VAT', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findOne.resolves(null);
            const svc = buildService({ companiesRepo });

            await expect(svc.getCompanyByVATNumber('UNKNOWN', false)).to.be.rejectedWith(/company-not-found/);
        });
    });

    describe('createCompany()', () => {
        it('creates company and returns success', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.create.resolves({ id: 10, name: 'New Corp' });
            const svc = buildService({ companiesRepo });

            const result = await svc.createCompany({ name: 'New Corp' } as any);

            expect(result.status).to.equal('success');
            expect((result.data as any).company.id).to.equal(10);
        });

        it('passes createdAt and updatedAt timestamps to repo', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.create.resolves({ id: 1 });
            const svc = buildService({ companiesRepo });

            await svc.createCompany({ name: 'Corp' } as any);

            const createArg = companiesRepo.create.firstCall.args[0];
            expect(createArg.createdAt).to.be.a.String();
            expect(createArg.updatedAt).to.be.a.String();
        });
    });

    describe('updateCompany()', () => {
        it('derives companyInterest=SELLER when only isSeller=true', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 10, isBuyer: false, isSeller: false });
            companiesRepo.updateById.resolves();
            const svc = buildService({ companiesRepo, companyUserRepo });

            const result = await svc.updateCompany({ isBuyer: false, isSeller: true } as any, 10, '1');

            expect(result.status).to.equal('success');
            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.companyInterest).to.equal(CompanyInterest.SELLER);
        });

        it('derives companyInterest=BOTH when both isBuyer and isSeller=true', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 10, isBuyer: false, isSeller: false });
            companiesRepo.updateById.resolves();
            const svc = buildService({ companiesRepo, companyUserRepo });

            const result = await svc.updateCompany({ isBuyer: true, isSeller: true } as any, 10, '1');

            expect(result.status).to.equal('success');
            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.companyInterest).to.equal(CompanyInterest.BOTH);
        });

        it('sets isBuyer/isSeller from companyInterest=BOTH', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            companiesRepo.updateById.resolves();
            const svc = buildService({ companiesRepo, companyUserRepo });

            await svc.updateCompany({ companyInterest: CompanyInterest.BOTH } as any, 10, '1');

            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.isBuyer).to.be.true();
            expect(updateArg.isSeller).to.be.true();
        });

        it('sets isBuyer=true, isSeller=false from companyInterest=BUYER', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            companiesRepo.updateById.resolves();
            const svc = buildService({ companiesRepo, companyUserRepo });

            await svc.updateCompany({ companyInterest: CompanyInterest.BUYER } as any, 10, '1');

            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.isBuyer).to.be.true();
            expect(updateArg.isSeller).to.be.false();
        });

        it('returns error status when companyUser not found', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves(null);
            const svc = buildService({ companyUserRepo });

            const result = await svc.updateCompany({ name: 'Test' } as any, 10, '1');

            expect(result.status).to.equal('error');
        });
    });

    describe('getDisplayArray()', () => {
        function makeCompany(overrides: Record<string, any> = {}): any {
            return {
                id: 1,
                name: 'TestCorp',
                status: CompanyStatus.PENDING,
                vatNumber: 'GB123',
                isBuyer: false,
                isSeller: true,
                country: 'IE',
                createdAt: '2025-01-01',
                ...overrides,
            };
        }

        it('returns registrationStatus=COMPLETE for active company', () => {
            const svc = buildService();
            const data = [{
                company: makeCompany({ status: CompanyStatus.ACTIVE }),
                documents: [],
                locations: [],
                users: [{ id: 1, firstName: 'A', lastName: 'B' } as any],
            }];

            const result = svc.getDisplayArray(data);

            expect(result[0].registrationStatus).to.equal(UserRegistrationStatus.COMPLETE);
            expect(result[0].overallStatus).to.equal(UserOverallStatus.COMPLETE);
        });

        it('returns overallStatus=AWAITING_APPROVAL when pending with vat, docs, locations', () => {
            const svc = buildService();
            const data = [{
                company: makeCompany({ status: CompanyStatus.PENDING }),
                documents: [{ id: 1, status: CompanyDocumentStatus.APPROVED } as any],
                locations: [{ id: 1 } as any],
                users: [{ id: 1, firstName: 'A', lastName: 'B' } as any],
            }];

            const result = svc.getDisplayArray(data);

            expect(result[0].overallStatus).to.equal(UserOverallStatus.AWAITING_APPROVAL);
        });

        it('returns IN_PROGRESS when company is pending with no vat', () => {
            const svc = buildService();
            const data = [{
                company: makeCompany({ status: CompanyStatus.PENDING, vatNumber: null }),
                documents: [],
                locations: [],
                users: [{ id: 1, firstName: 'A', lastName: 'B' } as any],
            }];

            const result = svc.getDisplayArray(data);

            expect(result[0].overallStatus).to.equal(UserOverallStatus.IN_PROGRESS);
        });

        it('sets companyType=both when isBuyer and isSeller', () => {
            const svc = buildService();
            const data = [{
                company: makeCompany({ isBuyer: true, isSeller: true }),
                documents: [],
                locations: [],
                users: [{ id: 1, firstName: 'A', lastName: 'B' } as any],
            }];

            const result = svc.getDisplayArray(data);

            expect(result[0].user.companyType).to.equal('both');
        });

        it('sets companyType=seller when only isSeller', () => {
            const svc = buildService();
            const data = [{
                company: makeCompany({ isBuyer: false, isSeller: true }),
                documents: [],
                locations: [],
                users: [{ id: 1, firstName: 'A', lastName: 'B' } as any],
            }];

            const result = svc.getDisplayArray(data);

            expect(result[0].user.companyType).to.equal('seller');
        });

        it('handles empty users array gracefully', () => {
            const svc = buildService();
            const data = [{
                company: makeCompany(),
                documents: [],
                locations: [],
                users: [],
            }];

            const result = svc.getDisplayArray(data);

            expect(result[0].user.userId).to.equal(0);
            expect(result[0].user.name).to.equal(' ');
        });
    });

    describe('mergeCompanies() — error cases', () => {
        it('throws BadRequest when master and merged company are the same', async () => {
            const svc = buildService();
            await expect(svc.mergeCompanies(5, 5, makeAdminProfile())).to.be.rejectedWith(/different company/i);
        });

        it('throws Forbidden when caller is not admin', async () => {
            const svc = buildService();
            const user = makeAdminProfile({ globalRole: UserRoleEnum.USER });
            await expect(svc.mergeCompanies(1, 2, user)).to.be.rejectedWith(/unauthorized/i);
        });

        it('throws error wrapped in InternalServerError when master company not found', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.onFirstCall().resolves(null);
            companiesRepo.findById.onSecondCall().resolves({ id: 2, isHaulier: false });
            const tx = { commit: sinon.stub().resolves(), rollback: sinon.stub().resolves() };
            companiesRepo.dataSource = { beginTransaction: sinon.stub().resolves(tx), execute: sinon.stub().resolves([{ count: 0 }]) };
            companiesRepo.execute = sinon.stub().resolves([{ count: 0 }]);
            const svc = buildService({ companiesRepo });

            await expect(svc.mergeCompanies(1, 2, makeAdminProfile())).to.be.rejectedWith(/not found|merge/i);
        });

        it('throws BadRequest when merging haulier with non-haulier', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.onFirstCall().resolves({ id: 1, isHaulier: true });
            companiesRepo.findById.onSecondCall().resolves({ id: 2, isHaulier: false });
            const tx = { commit: sinon.stub().resolves(), rollback: sinon.stub().resolves() };
            companiesRepo.dataSource = { beginTransaction: sinon.stub().resolves(tx), execute: sinon.stub().resolves([{ count: 0 }]) };
            companiesRepo.execute = sinon.stub().resolves([{ count: 0 }]);
            const svc = buildService({ companiesRepo });

            await expect(svc.mergeCompanies(1, 2, makeAdminProfile())).to.be.rejectedWith(/same type|merge/i);
        });
    });

    describe('searchCompaniesForMerge()', () => {
        it('throws Forbidden for non-admin caller', async () => {
            const svc = buildService();
            const user = makeAdminProfile({ globalRole: UserRoleEnum.USER });

            await expect(svc.searchCompaniesForMerge({}, '', user)).to.be.rejectedWith(/unauthorized/i);
        });

        it('executes query and returns paginated results', async () => {
            const companiesRepo = createStubRepo();
            // execute is already a sinon.stub on createStubRepo — set up sequential responses
            companiesRepo.execute = sinon.stub()
                .onFirstCall().resolves([{ id: 1, name: 'Corp A' }])
                .onSecondCall().resolves([{ count: '1' }]);
            const svc = buildService({ companiesRepo });

            const result = await svc.searchCompaniesForMerge({ skip: 0, limit: 10 }, '', makeAdminProfile());

            expect(result.totalCount).to.equal(1);
            expect(result.results).to.have.length(1);
        });
    });
});
