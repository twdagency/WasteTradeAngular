import { expect, sinon } from '@loopback/testlab';
import { CompanyUserService } from '../../services/company-user.service';
import { CompanyUserRoleEnum, UserRoleEnum } from '../../enum';

function makeCompanyUsersRepo(overrides = {}) {
    return {
        create: sinon.stub().resolves({ id: 1, status: 'ACTIVE' }),
        findById: sinon.stub().resolves({ id: 1, userId: 10, company: { id: 5 }, user: {} }),
        findOne: sinon.stub().resolves(null),
        updateById: sinon.stub().resolves(),
        ...overrides,
    } as any;
}

function makeCompanyUserRequestsRepo(overrides = {}) {
    return {
        findOne: sinon.stub().resolves(null),
        updateById: sinon.stub().resolves(),
        ...overrides,
    } as any;
}

function makeEmailService() {
    return { sendUserReceiveRoleChangeEmail: sinon.stub().resolves() } as any;
}

function makeNotificationsService() {
    return { createNotification: sinon.stub().resolves() } as any;
}

const adminUser: any = { id: 99, globalRole: UserRoleEnum.ADMIN, companyRole: CompanyUserRoleEnum.ADMIN };
const companyAdminUser: any = { id: 99, globalRole: UserRoleEnum.USER, companyRole: CompanyUserRoleEnum.ADMIN, companyId: 5 };

describe('CompanyUserService (unit)', () => {
    describe('createCompanyUser', () => {
        it('creates company user and returns success', async () => {
            const repo = makeCompanyUsersRepo();
            const service = new CompanyUserService(repo, makeCompanyUserRequestsRepo(), makeEmailService(), makeNotificationsService());

            const result = await service.createCompanyUser({ userId: 10, companyId: 5, companyRole: CompanyUserRoleEnum.BUYER } as any);

            expect(repo.create.calledOnce).to.be.true();
            expect(result.status).to.equal('success');
            expect((result.data as any).companyUser).to.be.ok();
        });

        it('triggers salesforce sync for ACTIVE user when sync service present', async () => {
            const repo = makeCompanyUsersRepo({
                create: sinon.stub().resolves({ id: 1, status: 'ACTIVE' }),
            });
            const syncService = { syncCompanyUser: sinon.stub().resolves() } as any;
            const service = new CompanyUserService(repo, makeCompanyUserRequestsRepo(), makeEmailService(), makeNotificationsService(), syncService);

            await service.createCompanyUser({ userId: 10, companyId: 5, companyRole: CompanyUserRoleEnum.BUYER } as any);

            // fire-and-forget — stub called once
            expect(syncService.syncCompanyUser.calledOnce).to.be.true();
        });
    });

    describe('removeCompanyUser', () => {
        it('removes company user and returns success', async () => {
            const repo = makeCompanyUsersRepo({
                findById: sinon.stub().resolves({ id: 1, userId: 10, company: {}, user: {} }),
            });
            const service = new CompanyUserService(repo, makeCompanyUserRequestsRepo(), makeEmailService(), makeNotificationsService());

            const result = await service.removeCompanyUser(1, adminUser);

            expect(repo.updateById.calledOnce).to.be.true();
            expect(repo.updateById.firstCall.args[1]).to.containEql({ status: 'REMOVED' });
            expect(result.status).to.equal('success');
        });

        it('throws BadRequest when user tries to remove themselves', async () => {
            const repo = makeCompanyUsersRepo({
                findById: sinon.stub().resolves({ id: 1, userId: 99, company: {}, user: {} }),
            });
            const service = new CompanyUserService(repo, makeCompanyUserRequestsRepo(), makeEmailService(), makeNotificationsService());

            await expect(service.removeCompanyUser(1, adminUser)).to.be.rejectedWith(/cannot remove yourself/);
        });

        it('throws Forbidden when regular user is not company admin', async () => {
            const repo = makeCompanyUsersRepo();
            const regularUser: any = { id: 1, globalRole: UserRoleEnum.USER, companyRole: CompanyUserRoleEnum.BUYER };
            const service = new CompanyUserService(repo, makeCompanyUserRequestsRepo(), makeEmailService(), makeNotificationsService());

            await expect(service.removeCompanyUser(1, regularUser)).to.be.rejectedWith(/unauthorized/i);
        });
    });

    describe('assignRole', () => {
        it('assigns role to target user in companyUsers', async () => {
            const targetUser = { id: 3, userId: 10, status: 'ACTIVE', companyRole: CompanyUserRoleEnum.BUYER, user: { email: 'u@u.com', firstName: 'A', lastName: 'B' }, company: { id: 5, name: 'Acme' } };
            const repo = makeCompanyUsersRepo({
                findOne: sinon.stub().resolves(targetUser),
            });
            const emailService = makeEmailService();
            const notifService = makeNotificationsService();
            const service = new CompanyUserService(repo, makeCompanyUserRequestsRepo(), emailService, notifService);

            const result = await service.assignRole(10, CompanyUserRoleEnum.ADMIN, adminUser);

            expect(repo.updateById.calledOnce).to.be.true();
            expect(repo.updateById.firstCall.args[1]).to.containEql({ companyRole: CompanyUserRoleEnum.ADMIN });
            expect(result.status).to.equal('success');
        });

        it('throws BadRequest when assigning role to self', async () => {
            const repo = makeCompanyUsersRepo();
            const service = new CompanyUserService(repo, makeCompanyUserRequestsRepo(), makeEmailService(), makeNotificationsService());

            await expect(service.assignRole(99, CompanyUserRoleEnum.BUYER, adminUser)).to.be.rejectedWith(/cannot change your own role/);
        });

        it('throws NotFound when user not in company', async () => {
            const repo = makeCompanyUsersRepo({ findOne: sinon.stub().resolves(null) });
            const requestsRepo = makeCompanyUserRequestsRepo({ findOne: sinon.stub().resolves(null) });
            const service = new CompanyUserService(repo, requestsRepo, makeEmailService(), makeNotificationsService());

            await expect(service.assignRole(200, CompanyUserRoleEnum.BUYER, adminUser)).to.be.rejectedWith(/not found/i);
        });

        it('allows company admin (USER globalRole) to assign roles', async () => {
            const targetUser = { id: 3, userId: 10, status: 'ACTIVE', companyRole: CompanyUserRoleEnum.BUYER, user: { email: 'u@u.com', firstName: 'A', lastName: 'B' }, company: { id: 5, name: 'Acme' } };
            const repo = makeCompanyUsersRepo({ findOne: sinon.stub().resolves(targetUser) });
            const service = new CompanyUserService(repo, makeCompanyUserRequestsRepo(), makeEmailService(), makeNotificationsService());

            const result = await service.assignRole(10, CompanyUserRoleEnum.ADMIN, companyAdminUser);

            expect(result.status).to.equal('success');
        });
    });
});
