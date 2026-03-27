import { expect, sinon } from '@loopback/testlab';
import { AdminAssignmentService } from '../../services/admin-assignment.service';
import { UserRoleEnum } from '../../enum';
import { createStubRepo } from '../helpers/stub-factory';

function buildService(overrides: Record<string, any> = {}): AdminAssignmentService {
    return new AdminAssignmentService(
        overrides.userRepo ?? createStubRepo(),
        overrides.listingsRepo ?? createStubRepo(),
        overrides.offersRepo ?? createStubRepo(),
        overrides.haulageOffersRepo ?? createStubRepo(),
    );
}

describe('AdminAssignmentService deeper coverage (unit)', () => {
    describe('assignAdmin()', () => {
        it('throws BadRequest for invalid recordType', async () => {
            const svc = buildService();
            await expect(svc.assignAdmin('invalid_type', 1, 10)).to.be.rejectedWith(/Invalid record type/);
        });

        it('throws NotFound when adminId provided but user not found', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves(null);
            const svc = buildService({ userRepo });

            await expect(svc.assignAdmin('user', 1, 999)).to.be.rejectedWith(/not found/i);
        });

        it('throws BadRequest when adminId user is not an admin', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 999, globalRole: UserRoleEnum.USER });
            const svc = buildService({ userRepo });

            await expect(svc.assignAdmin('user', 1, 999)).to.be.rejectedWith(/not an admin/i);
        });

        it('assigns admin to user record', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 10, globalRole: UserRoleEnum.ADMIN });
            userRepo.updateById.resolves();
            const svc = buildService({ userRepo });

            const result = await svc.assignAdmin('user', 5, 10);

            expect(result.success).to.be.true();
            expect(userRepo.updateById.calledOnceWith(5, { assignedAdminId: 10 })).to.be.true();
            expect(result.message).to.match(/assigned/i);
        });

        it('unassigns admin from user (adminId=null)', async () => {
            const userRepo = createStubRepo();
            userRepo.updateById.resolves();
            const svc = buildService({ userRepo });

            const result = await svc.assignAdmin('user', 5, null);

            expect(result.success).to.be.true();
            expect(userRepo.updateById.calledOnceWith(5, { assignedAdminId: null })).to.be.true();
            expect(result.message).to.match(/unassigned/i);
        });

        it('assigns admin to offer record', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 10, globalRole: UserRoleEnum.ADMIN });
            const offersRepo = createStubRepo();
            offersRepo.updateById.resolves();
            const svc = buildService({ userRepo, offersRepo });

            const result = await svc.assignAdmin('offer', 30, 10);

            expect(result.success).to.be.true();
            expect(offersRepo.updateById.calledOnceWith(30, { assignedAdminId: 10 })).to.be.true();
        });

        it('assigns admin to haulage_offer record', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 10, globalRole: UserRoleEnum.ADMIN });
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.updateById.resolves();
            const svc = buildService({ userRepo, haulageOffersRepo });

            const result = await svc.assignAdmin('haulage_offer', 40, 10);

            expect(result.success).to.be.true();
            expect(haulageOffersRepo.updateById.calledOnceWith(40, { assignedAdminId: 10 })).to.be.true();
        });

        it('assigns admin to listing record', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 10, globalRole: UserRoleEnum.ADMIN });
            const listingsRepo = createStubRepo();
            listingsRepo.updateById.resolves();
            const svc = buildService({ userRepo, listingsRepo });

            const result = await svc.assignAdmin('listing', 20, 10);

            expect(result.success).to.be.true();
            expect(listingsRepo.updateById.calledOnceWith(20, { assignedAdminId: 10 })).to.be.true();
        });
    });

    describe('getAssignedRecords()', () => {
        it('throws BadRequest for invalid recordType', async () => {
            const svc = buildService();
            await expect(svc.getAssignedRecords(1, 'bad_type')).to.be.rejectedWith(/Invalid record type/);
        });

        it('returns users and listings when no recordType filter', async () => {
            const userRepo = createStubRepo();
            userRepo.find.resolves([{ id: 1 }]);
            const listingsRepo = createStubRepo();
            listingsRepo.find.resolves([{ id: 10 }, { id: 11 }]);
            const offersRepo = createStubRepo();
            offersRepo.find.resolves([]);
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.find.resolves([]);
            const svc = buildService({ userRepo, listingsRepo, offersRepo, haulageOffersRepo });

            const result = await svc.getAssignedRecords(5);

            expect(result.users).to.have.length(1);
            expect(result.listings).to.have.length(2);
            expect(result.offers).to.have.length(0);
            expect(result.haulageOffers).to.have.length(0);
        });

        it('returns only users when recordType=user', async () => {
            const userRepo = createStubRepo();
            userRepo.find.resolves([{ id: 1 }, { id: 2 }]);
            const svc = buildService({ userRepo });

            const result = await svc.getAssignedRecords(5, 'user');

            expect(result.users).to.have.length(2);
            expect(result.listings).to.be.undefined();
            expect(result.offers).to.be.undefined();
        });

        it('returns only offers when recordType=offer', async () => {
            const offersRepo = createStubRepo();
            offersRepo.find.resolves([{ id: 30 }]);
            const svc = buildService({ offersRepo });

            const result = await svc.getAssignedRecords(5, 'offer');

            expect(result.offers).to.have.length(1);
            expect(result.users).to.be.undefined();
        });

        it('returns only haulage offers when recordType=haulage_offer', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.find.resolves([{ id: 40 }, { id: 41 }]);
            const svc = buildService({ haulageOffersRepo });

            const result = await svc.getAssignedRecords(5, 'haulage_offer');

            expect(result.haulageOffers).to.have.length(2);
            expect(result.users).to.be.undefined();
        });
    });
});
