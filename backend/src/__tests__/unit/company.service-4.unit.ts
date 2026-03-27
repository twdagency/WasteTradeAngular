import { expect, sinon } from '@loopback/testlab';
import { CompanyService } from '../../services/company.service';
import {
    CompanyDocumentStatus,
    CompanyStatus,
    CompanyUserRoleEnum,
    UserOverallStatus,
    UserRegistrationStatus,
    UserRoleEnum,
} from '../../enum';
import { OnboardingStatus } from '../../enum/company.enum';
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

describe('CompanyService deeper coverage - Part 4 (unit)', () => {
    describe('getCompaniesDescending()', () => {
        it('returns paginated companies via raw SQL', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.execute = sinon.stub()
                .onFirstCall().resolves([{ total: '2' }])
                .onSecondCall().resolves([
                    { id: 1, name: 'Alpha Corp', status: CompanyStatus.ACTIVE, is_buyer: true, is_seller: false, created_at: '2025-01-01' },
                    { id: 2, name: 'Beta Ltd', status: CompanyStatus.PENDING, is_buyer: false, is_seller: true, created_at: '2025-02-01' },
                ]);
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.find.resolves([]);
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.find.resolves([]);
            const svc = buildService({ companiesRepo, companyDocsRepo, companyLocationsRepo });

            const result = await svc.getCompaniesDescending({ limit: 10, skip: 0 });

            expect(result.total).to.equal(2);
            expect(result.data).to.have.length(2);
        });

        it('applies search filter via OR condition', async () => {
            const companiesRepo = createStubRepo();
            const capturedSqls: string[] = [];
            companiesRepo.execute = sinon.stub().callsFake((sql: string) => {
                capturedSqls.push(String(sql));
                // Always return a valid count row so parseInt doesn't fail
                return Promise.resolve([{ total: '0' }]);
            });
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.find.resolves([]);
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.find.resolves([]);
            const svc = buildService({ companiesRepo, companyDocsRepo, companyLocationsRepo });

            await svc.getCompaniesDescending({
                where: { or: [{ name: { ilike: '%acme%' } }] } as any,
            });

            expect(capturedSqls.some(s => s.toLowerCase().includes('acme'))).to.be.true();
        });

        it('returns empty data when no companies found', async () => {
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
    });

    describe('getDisplayArray() — onboarding status', () => {
        function makeCompany(overrides: Record<string, any> = {}): any {
            return {
                id: 1,
                name: 'TestCorp',
                status: CompanyStatus.PENDING,
                vatNumber: 'GB123',
                isBuyer: true,
                isSeller: false,
                country: 'GB',
                createdAt: '2025-01-01',
                ...overrides,
            };
        }

        it('sets onboardingStatus=COMPANY_INFORMATION_IN_PROGRESS when no VAT', () => {
            const svc = buildService();
            const data = [{
                company: makeCompany({ vatNumber: null }),
                documents: [],
                locations: [],
                users: [{ id: 1, firstName: 'A', lastName: 'B' } as any],
            }];

            const result = svc.getDisplayArray(data);
            expect(result[0].onboardingStatus).to.equal(OnboardingStatus.COMPANY_INFORMATION_IN_PROGRESS);
        });

        it('sets onboardingStatus=COMPANY_INFORMATION_COMPLETE when VAT but no docs', () => {
            const svc = buildService();
            const data = [{
                company: makeCompany(),
                documents: [],
                locations: [],
                users: [{ id: 1, firstName: 'A', lastName: 'B' } as any],
            }];

            const result = svc.getDisplayArray(data);
            expect(result[0].onboardingStatus).to.equal(OnboardingStatus.COMPANY_INFORMATION_COMPLETE);
        });

        it('sets onboardingStatus=COMPANY_DOCUMENTS_IN_PROGRESS when docs uploaded but not approved', () => {
            const svc = buildService();
            const data = [{
                company: makeCompany(),
                documents: [{ id: 1, status: CompanyDocumentStatus.PENDING } as any],
                locations: [],
                users: [{ id: 1, firstName: 'A', lastName: 'B' } as any],
            }];

            const result = svc.getDisplayArray(data);
            expect(result[0].onboardingStatus).to.equal(OnboardingStatus.COMPANY_DOCUMENTS_IN_PROGRESS);
        });

        it('sets onboardingStatus=COMPANY_DOCUMENTS_ADDED when docs approved but no locations', () => {
            const svc = buildService();
            const data = [{
                company: makeCompany(),
                documents: [{ id: 1, status: CompanyDocumentStatus.APPROVED } as any],
                locations: [],
                users: [{ id: 1, firstName: 'A', lastName: 'B' } as any],
            }];

            const result = svc.getDisplayArray(data);
            expect(result[0].onboardingStatus).to.equal(OnboardingStatus.COMPANY_DOCUMENTS_ADDED);
        });

        it('sets onboardingStatus=SITE_LOCATION_ADDED when all steps complete', () => {
            const svc = buildService();
            const data = [{
                company: makeCompany(),
                documents: [{ id: 1, status: CompanyDocumentStatus.APPROVED } as any],
                locations: [{ id: 1, locationName: 'Main Site' } as any],
                users: [{ id: 1, firstName: 'A', lastName: 'B' } as any],
            }];

            const result = svc.getDisplayArray(data);
            expect(result[0].onboardingStatus).to.equal(OnboardingStatus.SITE_LOCATION_ADDED);
        });

        it('sets registrationStatus=IN_PROGRESS for pending company', () => {
            const svc = buildService();
            const data = [{
                company: makeCompany({ status: CompanyStatus.PENDING }),
                documents: [],
                locations: [],
                users: [{ id: 1, firstName: 'A', lastName: 'B' } as any],
            }];

            const result = svc.getDisplayArray(data);
            expect(result[0].registrationStatus).to.equal(UserRegistrationStatus.IN_PROGRESS);
        });

        it('sets overallStatus=IN_PROGRESS for pending company with no vat', () => {
            const svc = buildService();
            const data = [{
                company: makeCompany({ vatNumber: null }),
                documents: [],
                locations: [],
                users: [{ id: 1, firstName: 'A', lastName: 'B' } as any],
            }];

            const result = svc.getDisplayArray(data);
            expect(result[0].overallStatus).to.equal(UserOverallStatus.IN_PROGRESS);
        });

        it('sets companyType=buyer when only isBuyer=true', () => {
            const svc = buildService();
            const data = [{
                company: makeCompany({ isBuyer: true, isSeller: false }),
                documents: [],
                locations: [],
                users: [{ id: 1, firstName: 'A', lastName: 'B' } as any],
            }];

            const result = svc.getDisplayArray(data);
            expect(result[0].user.companyType).to.equal('buyer');
        });
    });

    describe('getCompanyUsers()', () => {
        it('throws Forbidden when non-admin regular user tries to view company users', async () => {
            const companyUserRepo = createStubRepo();
            const svc = buildService({ companyUserRepo });

            const nonAdminUser = makeUserProfile({ companyRole: CompanyUserRoleEnum.BUYER });
            await expect(svc.getCompanyUsers({}, '', nonAdminUser))
                .to.be.rejectedWith(/unauthorized|forbidden/i);
        });

        it('returns paginated company users for admin', async () => {
            // getCompanyUsers runs queries via companiesRepository.execute (not companyUserRepo)
            const companiesRepo = createStubRepo();
            companiesRepo.execute = sinon.stub()
                .onFirstCall().resolves([
                    { id: 1, email: 'a@t.com', firstName: 'Alice', companyRole: 'buyer', status: 'active',
                      companyId: 1, companyName: 'Corp', companyCountry: 'GB', isHaulier: false, isBuyer: true, isSeller: false },
                ])
                .onSecondCall().resolves([{ count: '1' }]);
            const svc = buildService({ companiesRepo });

            const result = await svc.getCompanyUsers({}, '', makeAdminProfile());
            expect(result.totalCount).to.equal(1);
            expect(result.results).to.have.length(1);
        });

        it('applies searchTerm in company users query', async () => {
            const companiesRepo = createStubRepo();
            const capturedSqls: string[] = [];
            companiesRepo.execute = sinon.stub().callsFake((sql: string) => {
                capturedSqls.push(String(sql));
                return Promise.resolve([]);
            });
            const svc = buildService({ companiesRepo });

            await svc.getCompanyUsers({}, 'bob', makeAdminProfile());
            expect(capturedSqls.some(s => s.toLowerCase().includes('bob'))).to.be.true();
        });
    });

    describe('getPendingCompanies()', () => {
        it('returns pending companies via raw SQL', async () => {
            // getPendingCompanies calls Promise.all([countQuery, dataQuery]) via companiesRepository.execute
            // Both calls run simultaneously so onFirstCall/onSecondCall order is non-deterministic
            const companiesRepo = createStubRepo();
            companiesRepo.execute = sinon.stub().callsFake((sql: string) => {
                if (String(sql).includes('COUNT')) {
                    return Promise.resolve([{ total: '1' }]);
                }
                return Promise.resolve([{
                    id: 5,
                    name: 'Pending Corp',
                    status: CompanyStatus.PENDING,
                    userId: 1,
                    userFirstName: 'John',
                    userLastName: 'Doe',
                    userEmail: 'j@t.com',
                    userPhoneNumber: '0123',
                    documents: [],
                    locations: [],
                }]);
            });
            const svc = buildService({ companiesRepo });

            const result = await svc.getPendingCompanies({ limit: 10, skip: 0 });
            expect(result.total).to.equal(1);
            expect(result.data).to.have.length(1);
        });

        it('returns empty array when no pending companies', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.execute = sinon.stub().callsFake((sql: string) => {
                if (String(sql).includes('COUNT')) {
                    return Promise.resolve([{ total: '0' }]);
                }
                return Promise.resolve([]);
            });
            const svc = buildService({ companiesRepo });

            const result = await svc.getPendingCompanies();
            expect(result.total).to.equal(0);
            expect(result.data).to.have.length(0);
        });
    });

    describe('removeUser()', () => {
        it('throws Forbidden when caller is not admin', async () => {
            const svc = buildService();
            await expect(svc.removeUser(1, 10, makeUserProfile({ globalRole: UserRoleEnum.USER })))
                .to.be.rejectedWith(/unauthorized|forbidden/i);
        });

        it('throws NotFound when company user not found', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves(null);
            const svc = buildService({ companyUserRepo });

            await expect(svc.removeUser(99, 10, makeAdminProfile()))
                .to.be.rejected();
        });

        it('removes user and sends unlink email', async () => {
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
            expect(emailService.sendUserReceiveUnlinkedFromCompanyEmail.calledOnce).to.be.true();
        });
    });

    describe('reassignUser()', () => {
        it('throws BadRequest when admin calls without companyId', async () => {
            const svc = buildService();
            await expect(svc.reassignUser(1, 2, 0, makeAdminProfile()))
                .to.be.rejectedWith(/companyId is required/i);
        });

        it('throws Forbidden when non-admin non-company-admin calls', async () => {
            const svc = buildService();
            await expect(svc.reassignUser(1, 2, 10, makeUserProfile({ companyRole: CompanyUserRoleEnum.BUYER })))
                .to.be.rejectedWith(/unauthorized|forbidden/i);
        });

        it('throws NotFound when old user not in company', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves(null);
            companyUserRepo.count.resolves({ count: 2 });
            const companyUserRequestsRepo = createStubRepo();
            companyUserRequestsRepo.findOne.resolves(null);
            const svc = buildService({ companyUserRepo, companyUserRequestsRepo });

            await expect(svc.reassignUser(99, 2, 10, makeAdminProfile()))
                .to.be.rejectedWith(/not found|user/i);
        });
    });
});

