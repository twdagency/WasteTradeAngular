import { expect, sinon } from '@loopback/testlab';
import { AdminNoteService } from '../../services/admin-note.service';
import { AdminNoteDataType, UserRoleEnum } from '../../enum';

function makeRepo(record: object | null = { id: 1 }) {
    return {
        findById: sinon.stub().resolves(record),
        updateById: sinon.stub().resolves(),
    } as any;
}

function makeService(overrides: Partial<{
    userRepo: any;
    listingsRepo: any;
    offersRepo: any;
    haulageOffersRepo: any;
    sampleRequestsRepo: any;
    mfiRequestsRepo: any;
    companyUsersRepo: any;
}> = {}) {
    return new AdminNoteService(
        overrides.userRepo ?? makeRepo(),
        overrides.listingsRepo ?? makeRepo(),
        overrides.offersRepo ?? makeRepo(),
        overrides.haulageOffersRepo ?? makeRepo(),
        overrides.sampleRequestsRepo ?? makeRepo(),
        overrides.mfiRequestsRepo ?? makeRepo(),
        overrides.companyUsersRepo ?? makeRepo(),
    );
}

const adminUser: any = { id: 99, globalRole: UserRoleEnum.ADMIN };

describe('AdminNoteService (unit)', () => {
    describe('createOrUpdateNote', () => {
        it('creates note for USER data type', async () => {
            const userRepo = makeRepo({ id: 5, adminNote: null });
            const service = makeService({ userRepo });

            const result = await service.createOrUpdateNote(
                { dataId: 5, dataType: AdminNoteDataType.USERS, value: 'test note' },
                adminUser,
            );

            expect(userRepo.updateById.calledOnce).to.be.true();
            expect(result.value).to.equal('test note');
            expect(result.updatedBy).to.equal(99);
        });

        it('creates note for LISTINGS data type', async () => {
            const listingsRepo = makeRepo({ id: 10 });
            const service = makeService({ listingsRepo });

            const result = await service.createOrUpdateNote(
                { dataId: 10, dataType: AdminNoteDataType.LISTINGS, value: 'listing note' },
                adminUser,
            );

            expect(listingsRepo.updateById.calledOnce).to.be.true();
            expect(result.value).to.equal('listing note');
        });

        it('creates note for OFFERS data type', async () => {
            const offersRepo = makeRepo({ id: 20 });
            const service = makeService({ offersRepo });

            const result = await service.createOrUpdateNote(
                { dataId: 20, dataType: AdminNoteDataType.OFFERS, value: 'offer note' },
                adminUser,
            );

            expect(offersRepo.updateById.calledOnce).to.be.true();
            expect(result.value).to.equal('offer note');
        });

        it('throws NotFound when user record does not exist', async () => {
            const userRepo = makeRepo(null);
            const service = makeService({ userRepo });

            await expect(
                service.createOrUpdateNote({ dataId: 999, dataType: AdminNoteDataType.USERS, value: 'x' }, adminUser),
            ).to.be.rejectedWith(/not found/i);
        });

        it('throws BadRequest for invalid data type', async () => {
            const service = makeService();

            await expect(
                service.createOrUpdateNote({ dataId: 1, dataType: 'INVALID' as any, value: 'x' }, adminUser),
            ).to.be.rejectedWith(/Invalid data type/);
        });

        it('throws Forbidden for non-admin user', async () => {
            const service = makeService();
            const regularUser: any = { id: 1, globalRole: UserRoleEnum.USER };

            await expect(
                service.createOrUpdateNote({ dataId: 1, dataType: AdminNoteDataType.USERS, value: 'x' }, regularUser),
            ).to.be.rejectedWith(/unauthorized/i);
        });
    });

    describe('getAdminNoteDetail', () => {
        it('returns null data when no adminNote set', async () => {
            const userRepo = makeRepo({ id: 5, adminNote: null });
            const service = makeService({ userRepo });

            const result = await service.getAdminNoteDetail(5, AdminNoteDataType.USERS, adminUser);

            expect(result.status).to.equal('success');
            expect(result.data).to.be.null();
        });

        it('returns note detail with updatedBy user info', async () => {
            const adminNote = { value: 'some note', updatedBy: 99, updatedAt: new Date() };
            const userRepo = {
                findById: sinon.stub()
                    .onFirstCall().resolves({ id: 5, adminNote })
                    .onSecondCall().resolves({ id: 99, firstName: 'Admin', lastName: 'User', email: 'a@a.com', globalRole: 'admin' }),
                updateById: sinon.stub().resolves(),
            } as any;
            const service = makeService({ userRepo });

            const result = await service.getAdminNoteDetail(5, AdminNoteDataType.USERS, adminUser);

            expect(result.data?.value).to.equal('some note');
            expect(result.data?.updatedBy?.id).to.equal(99);
        });
    });
});
