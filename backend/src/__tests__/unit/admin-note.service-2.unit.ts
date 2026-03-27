import { expect, sinon } from '@loopback/testlab';
import { AdminNoteService } from '../../services/admin-note.service';
import { AdminNoteDataType, UserRoleEnum } from '../../enum';
import { createStubRepo } from '../helpers/stub-factory';

function buildService(overrides: Record<string, any> = {}): AdminNoteService {
    return new AdminNoteService(
        overrides.userRepo ?? createStubRepo(),
        overrides.listingsRepo ?? createStubRepo(),
        overrides.offersRepo ?? createStubRepo(),
        overrides.haulageOffersRepo ?? createStubRepo(),
        overrides.sampleRequestsRepo ?? createStubRepo(),
        overrides.mfiRequestsRepo ?? createStubRepo(),
        overrides.companyUsersRepo ?? createStubRepo(),
    );
}

const adminUser: any = { id: 99, globalRole: UserRoleEnum.ADMIN };
const superAdmin: any = { id: 1, globalRole: UserRoleEnum.SUPER_ADMIN };

describe('AdminNoteService deeper coverage (unit)', () => {
    describe('createOrUpdateNote() — additional types', () => {
        it('creates note for HAULAGE_OFFERS data type', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves({ id: 40 });
            haulageOffersRepo.updateById.resolves();
            const svc = buildService({ haulageOffersRepo });

            const result = await svc.createOrUpdateNote(
                { dataId: 40, dataType: AdminNoteDataType.HAULAGE_OFFERS, value: 'haulage note' },
                adminUser,
            );

            expect(haulageOffersRepo.updateById.calledOnce).to.be.true();
            expect(result.value).to.equal('haulage note');
            expect(result.updatedBy).to.equal(99);
        });

        it('creates note for SAMPLES data type', async () => {
            const sampleRequestsRepo = createStubRepo();
            sampleRequestsRepo.findById.resolves({ id: 50 });
            sampleRequestsRepo.updateById.resolves();
            const svc = buildService({ sampleRequestsRepo });

            const result = await svc.createOrUpdateNote(
                { dataId: 50, dataType: AdminNoteDataType.SAMPLES, value: 'sample note' },
                adminUser,
            );

            expect(sampleRequestsRepo.updateById.calledOnce).to.be.true();
            expect(result.value).to.equal('sample note');
        });

        it('creates note for MFI data type', async () => {
            const mfiRequestsRepo = createStubRepo();
            mfiRequestsRepo.findById.resolves({ id: 60 });
            mfiRequestsRepo.updateById.resolves();
            const svc = buildService({ mfiRequestsRepo });

            const result = await svc.createOrUpdateNote(
                { dataId: 60, dataType: AdminNoteDataType.MFI, value: 'mfi note' },
                adminUser,
            );

            expect(mfiRequestsRepo.updateById.calledOnce).to.be.true();
            expect(result.value).to.equal('mfi note');
        });

        it('throws NotFound when haulage offer not found', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(null);
            const svc = buildService({ haulageOffersRepo });

            await expect(
                svc.createOrUpdateNote(
                    { dataId: 999, dataType: AdminNoteDataType.HAULAGE_OFFERS, value: 'x' },
                    adminUser,
                ),
            ).to.be.rejectedWith(/not found/i);
        });

        it('throws NotFound when sample not found', async () => {
            const sampleRequestsRepo = createStubRepo();
            sampleRequestsRepo.findById.resolves(null);
            const svc = buildService({ sampleRequestsRepo });

            await expect(
                svc.createOrUpdateNote(
                    { dataId: 999, dataType: AdminNoteDataType.SAMPLES, value: 'x' },
                    adminUser,
                ),
            ).to.be.rejectedWith(/not found/i);
        });

        it('throws NotFound when MFI not found', async () => {
            const mfiRequestsRepo = createStubRepo();
            mfiRequestsRepo.findById.resolves(null);
            const svc = buildService({ mfiRequestsRepo });

            await expect(
                svc.createOrUpdateNote(
                    { dataId: 999, dataType: AdminNoteDataType.MFI, value: 'x' },
                    adminUser,
                ),
            ).to.be.rejectedWith(/not found/i);
        });

        it('sets updatedAt as a Date on result', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 5 });
            userRepo.updateById.resolves();
            const svc = buildService({ userRepo });

            const result = await svc.createOrUpdateNote(
                { dataId: 5, dataType: AdminNoteDataType.USERS, value: 'timestamp test' },
                superAdmin,
            );

            expect(result.updatedAt).to.be.instanceof(Date);
        });

        it('works for SUPER_ADMIN caller', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves({ id: 20 });
            offersRepo.updateById.resolves();
            const svc = buildService({ offersRepo });

            const result = await svc.createOrUpdateNote(
                { dataId: 20, dataType: AdminNoteDataType.OFFERS, value: 'by super admin' },
                superAdmin,
            );

            expect(result.updatedBy).to.equal(1);
        });
    });

    describe('getAdminNoteDetail() — additional data types', () => {
        it('returns null for LISTINGS with no adminNote', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves({ id: 10, adminNote: null });
            const svc = buildService({ listingsRepo });

            const result = await svc.getAdminNoteDetail(10, AdminNoteDataType.LISTINGS, adminUser);

            expect(result.status).to.equal('success');
            expect(result.data).to.be.null();
        });

        it('returns null for OFFERS with no adminNote', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves({ id: 20, adminNote: undefined });
            const svc = buildService({ offersRepo });

            const result = await svc.getAdminNoteDetail(20, AdminNoteDataType.OFFERS, adminUser);

            expect(result.data).to.be.null();
        });

        it('returns null for HAULAGE_OFFERS with no adminNote', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves({ id: 40, adminNote: null });
            const svc = buildService({ haulageOffersRepo });

            const result = await svc.getAdminNoteDetail(40, AdminNoteDataType.HAULAGE_OFFERS, adminUser);

            expect(result.data).to.be.null();
        });

        it('returns null for SAMPLES with no adminNote', async () => {
            const sampleRequestsRepo = createStubRepo();
            sampleRequestsRepo.findById.resolves({ id: 50, adminNote: null });
            const svc = buildService({ sampleRequestsRepo });

            const result = await svc.getAdminNoteDetail(50, AdminNoteDataType.SAMPLES, adminUser);

            expect(result.data).to.be.null();
        });

        it('returns null for MFI with no adminNote', async () => {
            const mfiRequestsRepo = createStubRepo();
            mfiRequestsRepo.findById.resolves({ id: 60, adminNote: null });
            const svc = buildService({ mfiRequestsRepo });

            const result = await svc.getAdminNoteDetail(60, AdminNoteDataType.MFI, adminUser);

            expect(result.data).to.be.null();
        });

        it('throws BadRequest for invalid dataType in getAdminNoteDetail', async () => {
            const svc = buildService();

            await expect(
                svc.getAdminNoteDetail(1, 'INVALID' as any, adminUser),
            ).to.be.rejectedWith(/Invalid data type/);
        });

        it('returns updatedBy=null when admin user not found', async () => {
            const adminNote = { value: 'orphan note', updatedBy: 999, updatedAt: new Date() };
            const userRepo = createStubRepo();
            userRepo.findById
                .onFirstCall().resolves({ id: 5, adminNote })
                .onSecondCall().resolves(null);
            const svc = buildService({ userRepo });

            const result = await svc.getAdminNoteDetail(5, AdminNoteDataType.USERS, adminUser);

            expect(result.data?.updatedBy).to.be.null();
            expect(result.data?.value).to.equal('orphan note');
        });
    });
});
