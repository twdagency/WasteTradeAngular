/**
 * company.service-7.unit.ts
 * Coverage for: createCompany, updateCompany, getDisplayArray, removeUser, getRolePriority
 */
import { expect, sinon } from '@loopback/testlab';
import { CompanyService } from '../../services/company.service';
import { CompanyInterest, CompanyStatus, CompanyDocumentStatus, CompanyUserRoleEnum, UserRoleEnum } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildSvc(overrides: Record<string, any> = {}) {
    const companiesRepo = overrides.companiesRepo ?? createStubRepo();
    const companyUserRepo = overrides.companyUserRepo ?? createStubRepo();
    const companyDocsRepo = overrides.companyDocsRepo ?? createStubRepo();
    const companyLocationsRepo = overrides.companyLocationsRepo ?? createStubRepo();
    const companyUserRequestsRepo = overrides.companyUserRequestsRepo ?? createStubRepo();
    const userRepo = overrides.userRepo ?? createStubRepo();
    const emailService = overrides.emailService ?? createStubService([
        'sendCompanyRejectedEmail', 'sendAdminNotification',
        'sendUserReceiveUnlinkedFromCompanyEmail', 'sendCompanyApprovedEmail',
        'sendCompanyRequestInformationEmail',
    ]);
    const notificationsService = overrides.notificationsService ?? createStubService(['createNotification']);
    const sfSyncService = overrides.sfSyncService ?? { syncCompany: sinon.stub().resolves() };

    const svc = new (CompanyService as any)(
        companiesRepo, companyUserRepo, companyDocsRepo, companyLocationsRepo,
        companyUserRequestsRepo, userRepo, emailService, notificationsService, sfSyncService,
    );
    return { svc, companiesRepo, companyUserRepo, emailService, notificationsService, sfSyncService };
}

function makeAdmin(): any {
    return { id: 99, email: 'a@t.com', firstName: 'Admin', lastName: 'U', username: 'admin', name: 'Admin U', companyName: 'Co', globalRole: UserRoleEnum.ADMIN, companyRole: CompanyUserRoleEnum.ADMIN, isHaulier: false };
}

describe('CompanyService — Part 7 (unit)', () => {
    describe('createCompany()', () => {
        it('creates company and triggers SF sync', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.create.resolves({ id: 10, name: 'NewCo' });
            const sfSyncService = { syncCompany: sinon.stub().resolves() };
            const { svc } = buildSvc({ companiesRepo, sfSyncService });

            const result = await svc.createCompany({ name: 'NewCo' } as any);
            expect(result.status).to.equal('success');
            expect(sfSyncService.syncCompany.calledWith(10, true)).to.be.true();
        });

        it('succeeds even if SF sync fails', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.create.resolves({ id: 11, name: 'Co2' });
            const sfSyncService = { syncCompany: sinon.stub().rejects(new Error('SF down')) };
            const { svc } = buildSvc({ companiesRepo, sfSyncService });

            const result = await svc.createCompany({ name: 'Co2' } as any);
            expect(result.status).to.equal('success');
        });
    });

    describe('updateCompany()', () => {
        it('updates with companyInterest=BOTH setting isBuyer/isSeller', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.updateById.resolves();
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, userId: 99, companyId: 5 });
            const { svc } = buildSvc({ companiesRepo, companyUserRepo });

            const result = await svc.updateCompany({ companyInterest: CompanyInterest.BOTH } as any, 5, '99');
            expect(result.status).to.equal('success');
        });

        it('derives companyInterest from isBuyer/isSeller when no companyInterest', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 5, isBuyer: false, isSeller: true });
            companiesRepo.updateById.resolves();
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, userId: 99, companyId: 5 });
            const { svc } = buildSvc({ companiesRepo, companyUserRepo });

            const result = await svc.updateCompany({ isBuyer: true } as any, 5, '99');
            expect(result.status).to.equal('success');
        });

        it('returns error when user is not company admin', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves(null);
            const { svc } = buildSvc({ companyUserRepo });

            const result = await svc.updateCompany({ name: 'X' } as any, 5, '99');
            expect(result.status).to.equal('error');
        });
    });

    describe('removeUser()', () => {
        it('removes user and sends email/notification', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({
                id: 1, userId: 5, companyId: 10,
                user: { email: 'u@t.com', firstName: 'J', lastName: 'D' },
                company: { name: 'TestCo' },
            });
            companyUserRepo.deleteById = sinon.stub().resolves();
            const emailService = createStubService(['sendUserReceiveUnlinkedFromCompanyEmail']);
            const notificationsService = createStubService(['createNotification']);
            const { svc } = buildSvc({ companyUserRepo, emailService, notificationsService });

            const result = await svc.removeUser(5, 10, makeAdmin());
            expect(result.status).to.equal('success');
            expect(emailService.sendUserReceiveUnlinkedFromCompanyEmail.calledOnce).to.be.true();
        });

        it('throws NotFound when companyUser not found', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves(null);
            const { svc } = buildSvc({ companyUserRepo });

            await expect(svc.removeUser(999, 10, makeAdmin())).to.be.rejected();
        });

        it('throws when current user is not admin', async () => {
            const { svc } = buildSvc();
            const nonAdmin = { ...makeAdmin(), globalRole: UserRoleEnum.USER };
            await expect(svc.removeUser(5, 10, nonAdmin)).to.be.rejected();
        });
    });

    describe('getDisplayArray()', () => {
        it('returns COMPANY_INFORMATION_IN_PROGRESS when no VAT', () => {
            const { svc } = buildSvc();
            const result = svc.getDisplayArray([{
                company: { id: 1, name: 'Co', status: CompanyStatus.PENDING } as any,
                documents: [], locations: [], users: [{ id: 1, firstName: 'J', lastName: 'D' }],
            }]);
            expect(result[0].onboardingStatus).to.match(/company_information/i);
        });

        it('returns COMPANY_INFORMATION_COMPLETE when VAT but no docs', () => {
            const { svc } = buildSvc();
            const result = svc.getDisplayArray([{
                company: { id: 1, name: 'Co', vatNumber: 'GB123', status: CompanyStatus.PENDING } as any,
                documents: [], locations: [], users: [{ id: 1, firstName: 'J', lastName: 'D' }],
            }]);
            expect(result[0].onboardingStatus).to.match(/company_information_complete/i);
        });

        it('returns COMPANY_DOCUMENTS_IN_PROGRESS when docs not approved', () => {
            const { svc } = buildSvc();
            const result = svc.getDisplayArray([{
                company: { id: 1, name: 'Co', vatNumber: 'GB123', status: CompanyStatus.PENDING } as any,
                documents: [{ status: 'pending' }],
                locations: [], users: [{ id: 1, firstName: 'J', lastName: 'D' }],
            }]);
            expect(result[0].onboardingStatus).to.match(/documents_in_progress/i);
        });

        it('returns SITE_LOCATION_ADDED when all steps complete', () => {
            const { svc } = buildSvc();
            const result = svc.getDisplayArray([{
                company: { id: 1, name: 'Co', vatNumber: 'GB123', status: CompanyStatus.ACTIVE, isSeller: true, isBuyer: false } as any,
                documents: [{ status: CompanyDocumentStatus.APPROVED }],
                locations: [{ id: 1 }],
                users: [{ id: 1, firstName: 'J', lastName: 'D' }],
            }]);
            expect(result[0].onboardingStatus).to.match(/site_location_added/i);
            expect(result[0].overallStatus).to.match(/complete/i);
        });

        it('returns AWAITING_APPROVAL when pending with all steps done', () => {
            const { svc } = buildSvc();
            const result = svc.getDisplayArray([{
                company: { id: 1, name: 'Co', vatNumber: 'GB123', status: CompanyStatus.PENDING, isSeller: true, isBuyer: true } as any,
                documents: [{ status: CompanyDocumentStatus.APPROVED }],
                locations: [{ id: 1 }],
                users: [{ id: 1, firstName: 'J', lastName: 'D' }],
            }]);
            expect(result[0].overallStatus).to.match(/awaiting/i);
        });

        it('returns companyType "both" when isBuyer and isSeller', () => {
            const { svc } = buildSvc();
            const result = svc.getDisplayArray([{
                company: { id: 1, name: 'Co', isSeller: true, isBuyer: true, status: CompanyStatus.ACTIVE } as any,
                documents: [], locations: [], users: [{ id: 1, firstName: 'J', lastName: 'D' }],
            }]);
            expect(result[0].user.companyType).to.equal('both');
        });

        it('returns companyType "buyer" when not isSeller', () => {
            const { svc } = buildSvc();
            const result = svc.getDisplayArray([{
                company: { id: 1, name: 'Co', isSeller: false, isBuyer: true, status: CompanyStatus.ACTIVE } as any,
                documents: [], locations: [], users: [{ id: 1, firstName: 'J', lastName: 'D' }],
            }]);
            expect(result[0].user.companyType).to.equal('buyer');
        });

        it('handles missing user gracefully', () => {
            const { svc } = buildSvc();
            const result = svc.getDisplayArray([{
                company: { id: 1, name: 'Co', status: CompanyStatus.PENDING } as any,
                documents: [], locations: [], users: [],
            }]);
            expect(result[0].user.userId).to.equal(0);
        });
    });
});
