import { expect, sinon } from '@loopback/testlab';
import { AssignAdminService } from '../../services/assign-admin.service';
import { AssignAdminDataType, UserRoleEnum, UserStatus } from '../../enum';
import { createStubRepo } from '../helpers/stub-factory';

function buildService(overrides: Record<string, any> = {}): AssignAdminService {
    return new AssignAdminService(
        overrides.userRepo ?? createStubRepo(),
        overrides.listingsRepo ?? createStubRepo(),
        overrides.offersRepo ?? createStubRepo(),
        overrides.haulageOffersRepo ?? createStubRepo(),
        overrides.sampleRequestsRepo ?? createStubRepo(),
        overrides.mfiRequestsRepo ?? createStubRepo(),
    );
}

const adminUser: any = { id: 1, globalRole: UserRoleEnum.ADMIN };
const superAdmin: any = { id: 2, globalRole: UserRoleEnum.SUPER_ADMIN };

describe('AssignAdminService (unit)', () => {
    describe('assignAdmin()', () => {
        it('throws Forbidden when caller is a regular user', async () => {
            const svc = buildService();
            const regularUser: any = { id: 5, globalRole: UserRoleEnum.USER };

            await expect(
                svc.assignAdmin({ dataId: 1, dataType: AssignAdminDataType.USERS, assignedAdminId: 2 }, regularUser),
            ).to.be.rejectedWith(/unauthorized/i);
        });

        it('throws NotFound when assignedAdmin does not exist', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves(null);
            const svc = buildService({ userRepo });

            await expect(
                svc.assignAdmin({ dataId: 1, dataType: AssignAdminDataType.USERS, assignedAdminId: 999 }, adminUser),
            ).to.be.rejectedWith(/not found/i);
        });

        it('throws BadRequest when assignedAdmin is not an admin', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.onFirstCall().resolves({ id: 999, globalRole: UserRoleEnum.USER });
            const svc = buildService({ userRepo });

            await expect(
                svc.assignAdmin({ dataId: 1, dataType: AssignAdminDataType.USERS, assignedAdminId: 999 }, adminUser),
            ).to.be.rejectedWith(/not an admin/i);
        });

        it('assigns admin to USER data type and returns assignAdmin object', async () => {
            const userRepo = createStubRepo();
            // First call: verify admin, second call: find user
            userRepo.findById.onFirstCall().resolves({ id: 10, globalRole: UserRoleEnum.ADMIN });
            userRepo.findById.onSecondCall().resolves({ id: 5 });
            userRepo.updateById.resolves();
            const svc = buildService({ userRepo });

            const result = await svc.assignAdmin(
                { dataId: 5, dataType: AssignAdminDataType.USERS, assignedAdminId: 10 },
                superAdmin,
            );

            expect(result).to.not.be.null();
            expect(result?.assignedAdminId).to.equal(10);
            expect(userRepo.updateById.calledOnce).to.be.true();
        });

        it('unassigns admin from USER (assignedAdminId=null) and returns null', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 5 });
            userRepo.updateById.resolves();
            const svc = buildService({ userRepo });

            const result = await svc.assignAdmin(
                { dataId: 5, dataType: AssignAdminDataType.USERS, assignedAdminId: null },
                adminUser,
            );

            expect(result).to.be.null();
            expect(userRepo.updateById.calledOnce).to.be.true();
        });

        it('assigns admin to LISTINGS data type', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 10, globalRole: UserRoleEnum.ADMIN });
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves({ id: 20 });
            listingsRepo.updateById.resolves();
            const svc = buildService({ userRepo, listingsRepo });

            const result = await svc.assignAdmin(
                { dataId: 20, dataType: AssignAdminDataType.LISTINGS, assignedAdminId: 10 },
                adminUser,
            );

            expect(result?.assignedAdminId).to.equal(10);
            expect(listingsRepo.updateById.calledOnce).to.be.true();
        });

        it('throws NotFound when listing does not exist', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 10, globalRole: UserRoleEnum.ADMIN });
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(null);
            const svc = buildService({ userRepo, listingsRepo });

            await expect(
                svc.assignAdmin({ dataId: 999, dataType: AssignAdminDataType.LISTINGS, assignedAdminId: 10 }, adminUser),
            ).to.be.rejectedWith(/not found/i);
        });

        it('assigns admin to OFFERS data type', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 10, globalRole: UserRoleEnum.ADMIN });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves({ id: 30 });
            offersRepo.updateById.resolves();
            const svc = buildService({ userRepo, offersRepo });

            const result = await svc.assignAdmin(
                { dataId: 30, dataType: AssignAdminDataType.OFFERS, assignedAdminId: 10 },
                adminUser,
            );

            expect(offersRepo.updateById.calledOnce).to.be.true();
            expect(result?.assignedAdminId).to.equal(10);
        });

        it('assigns admin to HAULAGE_OFFERS data type', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 10, globalRole: UserRoleEnum.ADMIN });
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves({ id: 40 });
            haulageOffersRepo.updateById.resolves();
            const svc = buildService({ userRepo, haulageOffersRepo });

            const result = await svc.assignAdmin(
                { dataId: 40, dataType: AssignAdminDataType.HAULAGE_OFFERS, assignedAdminId: 10 },
                adminUser,
            );

            expect(haulageOffersRepo.updateById.calledOnce).to.be.true();
            expect(result?.assignedAdminId).to.equal(10);
        });

        it('assigns admin to SAMPLES data type', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 10, globalRole: UserRoleEnum.ADMIN });
            const sampleRequestsRepo = createStubRepo();
            sampleRequestsRepo.findById.resolves({ id: 50 });
            sampleRequestsRepo.updateById.resolves();
            const svc = buildService({ userRepo, sampleRequestsRepo });

            const result = await svc.assignAdmin(
                { dataId: 50, dataType: AssignAdminDataType.SAMPLES, assignedAdminId: 10 },
                adminUser,
            );

            expect(sampleRequestsRepo.updateById.calledOnce).to.be.true();
            expect(result?.assignedAdminId).to.equal(10);
        });

        it('assigns admin to MFI data type', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 10, globalRole: UserRoleEnum.ADMIN });
            const mfiRequestsRepo = createStubRepo();
            mfiRequestsRepo.findById.resolves({ id: 60 });
            mfiRequestsRepo.updateById.resolves();
            const svc = buildService({ userRepo, mfiRequestsRepo });

            const result = await svc.assignAdmin(
                { dataId: 60, dataType: AssignAdminDataType.MFI, assignedAdminId: 10 },
                adminUser,
            );

            expect(mfiRequestsRepo.updateById.calledOnce).to.be.true();
            expect(result?.assignedAdminId).to.equal(10);
        });

        it('throws BadRequest for invalid dataType', async () => {
            const svc = buildService();

            await expect(
                svc.assignAdmin({ dataId: 1, dataType: 'INVALID' as any, assignedAdminId: null }, adminUser),
            ).to.be.rejectedWith(/Invalid data type/);
        });
    });

    describe('getAdminsToAssign()', () => {
        it('returns paginated admin users with default limit', async () => {
            const userRepo = createStubRepo();
            userRepo.find.resolves([
                { id: 1, firstName: 'Alice', lastName: 'Smith', email: 'a@x.com', globalRole: UserRoleEnum.ADMIN },
            ]);
            userRepo.count.resolves({ count: 1 });
            const svc = buildService({ userRepo });

            const result = await svc.getAdminsToAssign({});

            expect(result.totalCount).to.equal(1);
            expect(result.results).to.have.length(1);
            expect(result.results[0].firstName).to.equal('Alice');
        });

        it('applies skip and limit from filter', async () => {
            const userRepo = createStubRepo();
            userRepo.find.resolves([]);
            userRepo.count.resolves({ count: 0 });
            const svc = buildService({ userRepo });

            await svc.getAdminsToAssign({ skip: 5, limit: 3 });

            const findArg = userRepo.find.firstCall.args[0];
            expect(findArg.skip).to.equal(5);
            expect(findArg.limit).to.equal(3);
        });

        it('filters only ACTIVE admin roles', async () => {
            const userRepo = createStubRepo();
            userRepo.find.resolves([]);
            userRepo.count.resolves({ count: 0 });
            const svc = buildService({ userRepo });

            await svc.getAdminsToAssign({});

            const findArg = userRepo.find.firstCall.args[0];
            expect(findArg.where.status).to.equal(UserStatus.ACTIVE);
            expect(findArg.where.globalRole.inq).to.containDeep([
                UserRoleEnum.SUPER_ADMIN,
                UserRoleEnum.ADMIN,
                UserRoleEnum.SALES_ADMIN,
            ]);
        });
    });

    describe('unassignAdminFromAllRecords()', () => {
        it('calls updateAll on all repositories with adminId', async () => {
            const userRepo = createStubRepo();
            const listingsRepo = createStubRepo();
            const offersRepo = createStubRepo();
            const haulageOffersRepo = createStubRepo();
            const sampleRequestsRepo = createStubRepo();
            const mfiRequestsRepo = createStubRepo();
            [userRepo, listingsRepo, offersRepo, haulageOffersRepo, sampleRequestsRepo, mfiRequestsRepo].forEach(
                (r) => r.updateAll.resolves({ count: 0 }),
            );
            const svc = buildService({ userRepo, listingsRepo, offersRepo, haulageOffersRepo, sampleRequestsRepo, mfiRequestsRepo });

            await svc.unassignAdminFromAllRecords(10);

            expect(userRepo.updateAll.calledOnce).to.be.true();
            expect(listingsRepo.updateAll.calledOnce).to.be.true();
            expect(offersRepo.updateAll.calledOnce).to.be.true();
            expect(haulageOffersRepo.updateAll.calledOnce).to.be.true();
            expect(sampleRequestsRepo.updateAll.calledOnce).to.be.true();
            expect(mfiRequestsRepo.updateAll.calledOnce).to.be.true();

            const whereArg = userRepo.updateAll.firstCall.args[1];
            expect(whereArg['assignAdmin.assignedAdminId']).to.equal(10);
        });
    });
});
