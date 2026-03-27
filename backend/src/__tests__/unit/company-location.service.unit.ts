import { expect, sinon } from '@loopback/testlab';
import { CompanyLocationService } from '../../services/company-location.service';
import { CompanyUserRoleEnum } from '../../enum';

function makeLocationsRepo(overrides = {}) {
    return {
        create: sinon.stub().resolves({ id: 10, companyId: 5 }),
        findById: sinon.stub().resolves({ id: 10, companyId: 5 }),
        updateById: sinon.stub().resolves(),
        updateAll: sinon.stub().resolves(),
        count: sinon.stub().resolves({ count: 1 }),
        find: sinon.stub().resolves([{ id: 10, companyId: 5, toJSON: () => ({ id: 10, companyId: 5 }) }]),
        ...overrides,
    } as any;
}

function makeLocationDocsRepo(overrides = {}) {
    return {
        find: sinon.stub().resolves([]),
        ...overrides,
    } as any;
}

function makeCompanyUsersRepo(companyUser: object | null) {
    return { findOne: sinon.stub().resolves(companyUser) } as any;
}

function makeLocationDocService(overrides = {}) {
    return {
        updateCompanyLocationDocuments: sinon.stub().resolves({
            status: 'success',
            data: { companyLocationDocuments: [] },
        }),
        ...overrides,
    } as any;
}

const adminProfile: any = { id: 1, companyId: 5 };
const companyAdminRecord = { id: 1, userId: 1, companyId: 5, companyRole: CompanyUserRoleEnum.ADMIN };

describe('CompanyLocationService (unit)', () => {
    describe('createCompanyLocation', () => {
        it('creates location and returns success', async () => {
            const locRepo = makeLocationsRepo();
            const usersRepo = makeCompanyUsersRepo(companyAdminRecord);
            const service = new CompanyLocationService(locRepo, makeLocationDocsRepo(), usersRepo, makeLocationDocService());

            const location: any = { name: 'Site A', mainLocation: false };
            const result = await service.createCompanyLocation(location, [], adminProfile);

            expect(result.status).to.equal('success');
            expect(locRepo.create.calledOnce).to.be.true();
        });

        it('returns error status when user is not company admin', async () => {
            const locRepo = makeLocationsRepo();
            const usersRepo = makeCompanyUsersRepo(null);
            const service = new CompanyLocationService(locRepo, makeLocationDocsRepo(), usersRepo, makeLocationDocService());

            const result = await service.createCompanyLocation({ name: 'Site' } as any, [], adminProfile);

            expect(result.status).to.equal('error');
        });

        it('resets other main locations when mainLocation is true', async () => {
            const locRepo = makeLocationsRepo();
            const usersRepo = makeCompanyUsersRepo(companyAdminRecord);
            const service = new CompanyLocationService(locRepo, makeLocationDocsRepo(), usersRepo, makeLocationDocService());

            await service.createCompanyLocation({ name: 'HQ', mainLocation: true } as any, [], adminProfile);

            expect(locRepo.updateAll.calledOnce).to.be.true();
            expect(locRepo.updateAll.firstCall.args[0]).to.containEql({ mainLocation: false });
        });

        it('returns error for invalid office open time', async () => {
            const locRepo = makeLocationsRepo();
            const usersRepo = makeCompanyUsersRepo(companyAdminRecord);
            const service = new CompanyLocationService(locRepo, makeLocationDocsRepo(), usersRepo, makeLocationDocService());

            const result = await service.createCompanyLocation(
                { name: 'Site', officeOpenTime: 'not-a-time' } as any,
                [],
                adminProfile,
            );

            expect(result.status).to.equal('error');
        });
    });

    describe('updateCompanyLocation', () => {
        it('updates location and returns success', async () => {
            const locRepo = makeLocationsRepo();
            const usersRepo = makeCompanyUsersRepo(companyAdminRecord);
            const service = new CompanyLocationService(locRepo, makeLocationDocsRepo(), usersRepo, makeLocationDocService());

            const result = await service.updateCompanyLocation(10, { name: 'Updated' } as any, [], adminProfile);

            expect(result.status).to.equal('success');
            expect(locRepo.updateById.calledOnce).to.be.true();
        });

        it('returns error when location not found', async () => {
            const locRepo = makeLocationsRepo({ findById: sinon.stub().resolves(null) });
            const service = new CompanyLocationService(locRepo, makeLocationDocsRepo(), makeCompanyUsersRepo(null), makeLocationDocService());

            const result = await service.updateCompanyLocation(999, { name: 'X' } as any, [], adminProfile);

            expect(result.status).to.equal('error');
        });
    });

    describe('getCompanyLocationList', () => {
        it('returns paginated list with documents', async () => {
            const locations = [{ id: 10, companyId: 5, toJSON: () => ({ id: 10, companyId: 5 }) }];
            const locRepo = makeLocationsRepo({
                find: sinon.stub().resolves(locations),
                count: sinon.stub().resolves({ count: 1 }),
            });
            const locationDocsRepo = makeLocationDocsRepo({ find: sinon.stub().resolves([{ id: 1 }]) });
            const service = new CompanyLocationService(locRepo, locationDocsRepo, makeCompanyUsersRepo(null), makeLocationDocService());

            const result = await service.getCompanyLocationList({}, adminProfile);

            expect(result.totalCount).to.equal(1);
            expect(result.results).to.have.length(1);
            expect((result.results[0] as any).companyLocationDocuments).to.have.length(1);
        });

        it('merges companyId into filter.where', async () => {
            const locRepo = makeLocationsRepo({ find: sinon.stub().resolves([]) });
            const service = new CompanyLocationService(locRepo, makeLocationDocsRepo(), makeCompanyUsersRepo(null), makeLocationDocService());

            await service.getCompanyLocationList({ where: { name: 'X' } } as any, adminProfile);

            const whereArg = locRepo.find.firstCall.args[0].where;
            expect(whereArg.companyId).to.equal(5);
            expect(whereArg.name).to.equal('X');
        });
    });
});
