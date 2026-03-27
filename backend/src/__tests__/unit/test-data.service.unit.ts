import { expect, sinon } from '@loopback/testlab';
import { TestDataService } from '../../services/test-data.service';

function makeRepo(overrides: Record<string, any> = {}): any {
    return {
        create: sinon.stub().resolves({ id: 1 }),
        createAll: sinon.stub().resolves([{ id: 1 }, { id: 2 }]),
        findOne: sinon.stub().resolves(null),
        deleteAll: sinon.stub().resolves({ count: 0 }),
        ...overrides,
    };
}

function buildService(overrides: Record<string, any> = {}): TestDataService {
    return new TestDataService(
        overrides.userRepo ?? makeRepo(),
        overrides.companyRepo ?? makeRepo(),
        overrides.listingRepo ?? makeRepo(),
        overrides.mfiRepo ?? makeRepo(),
        overrides.sampleRepo ?? makeRepo(),
    );
}

describe('TestDataService (unit)', () => {
    describe('createTestUsers()', () => {
        it('creates requested number of new users', async () => {
            const userRepo = makeRepo({ findOne: sinon.stub().resolves(null) });
            const svc = buildService({ userRepo });
            const users = await svc.createTestUsers(3);
            expect(users).to.have.length(3);
            expect(userRepo.create.callCount).to.equal(3);
        });

        it('reuses existing user when email already exists', async () => {
            const existing = { id: 99, email: 'alice@gmail.com' };
            const userRepo = makeRepo({ findOne: sinon.stub().resolves(existing) });
            const svc = buildService({ userRepo });
            const users = await svc.createTestUsers(1);
            expect(users[0]).to.equal(existing);
            expect(userRepo.create.called).to.be.false();
        });

        it('calls deleteAll to clean up yopmail users before creating', async () => {
            const userRepo = makeRepo();
            const svc = buildService({ userRepo });
            await svc.createTestUsers(1);
            expect(userRepo.deleteAll.calledWith(sinon.match({ email: { like: '%@yopmail.com' } }))).to.be.true();
        });

        it('assigns ADMIN role to first 5 users', async () => {
            const createdUsers: any[] = [];
            const userRepo = makeRepo({
                create: sinon.stub().callsFake((u: any) => {
                    const saved = { ...u, id: createdUsers.length + 1 };
                    createdUsers.push(saved);
                    return Promise.resolve(saved);
                }),
            });
            const svc = buildService({ userRepo });
            await svc.createTestUsers(6);
            expect(createdUsers[0].globalRole).to.equal('admin');
            expect(createdUsers[4].globalRole).to.equal('admin');
            expect(createdUsers[5].globalRole).to.equal('user');
        });
    });

    describe('createTestCompanies()', () => {
        it('creates requested number of companies', async () => {
            const companyRepo = makeRepo();
            const svc = buildService({ companyRepo });
            const companies = await svc.createTestCompanies(4);
            expect(companies).to.have.length(4);
            expect(companyRepo.create.callCount).to.equal(4);
        });

        it('alternates MANUFACTURER and PROCESSOR types', async () => {
            const created: any[] = [];
            const companyRepo = makeRepo({
                create: sinon.stub().callsFake((c: any) => {
                    const saved = { ...c, id: created.length + 1 };
                    created.push(saved);
                    return Promise.resolve(saved);
                }),
            });
            const svc = buildService({ companyRepo });
            await svc.createTestCompanies(2);
            expect(created[0].companyType).to.equal('manufacturer');
            expect(created[1].companyType).to.equal('processor');
        });
    });

    describe('createTestListings()', () => {
        it('creates requested number of listings', async () => {
            const listingRepo = makeRepo();
            const users = [{ id: 1 }, { id: 2 }] as any[];
            const companies = [{ id: 10 }, { id: 11 }] as any[];
            const svc = buildService({ listingRepo });
            const listings = await svc.createTestListings(3, users, companies);
            expect(listings).to.have.length(3);
            expect(listingRepo.create.callCount).to.equal(3);
        });

        it('alternates between SELL and WANTED listing types', async () => {
            const created: any[] = [];
            const listingRepo = makeRepo({
                create: sinon.stub().callsFake((l: any) => {
                    const saved = { ...l, id: created.length + 1 };
                    created.push(saved);
                    return Promise.resolve(saved);
                }),
            });
            const svc = buildService({ listingRepo });
            const users = [{ id: 1 }] as any[];
            const companies = [{ id: 10 }] as any[];
            await svc.createTestListings(2, users, companies);
            expect(created[0].listingType).to.equal('sell');
            expect(created[1].listingType).to.equal('wanted');
        });
    });

    describe('createMfiRequests()', () => {
        it('calls mfiRepo.createAll with generated records', async () => {
            const mfiRepo = makeRepo();
            const svc = buildService({ mfiRepo });
            const users = [{ id: 1 }, { id: 2 }] as any[];
            const companies = [{ id: 10 }] as any[];
            const listings = [{ id: 100 }] as any[];
            await svc.createMfiRequests(2, users, companies, listings);
            expect(mfiRepo.createAll.calledOnce).to.be.true();
            const records = mfiRepo.createAll.firstCall.args[0];
            expect(records).to.have.length(2);
        });
    });

    describe('createSampleRequests()', () => {
        it('calls sampleRepo.createAll with generated records', async () => {
            const sampleRepo = makeRepo();
            const svc = buildService({ sampleRepo });
            const users = [{ id: 1 }] as any[];
            const companies = [{ id: 10 }] as any[];
            const listings = [{ id: 100 }] as any[];
            await svc.createSampleRequests(3, users, companies, listings);
            expect(sampleRepo.createAll.calledOnce).to.be.true();
            const records = sampleRepo.createAll.firstCall.args[0];
            expect(records).to.have.length(3);
        });
    });

    describe('cleanupTestData()', () => {
        it('deletes from all repos in correct order', async () => {
            const callOrder: string[] = [];
            const sampleRepo = makeRepo({ deleteAll: sinon.stub().callsFake(() => { callOrder.push('sample'); return Promise.resolve({ count: 0 }); }) });
            const mfiRepo = makeRepo({ deleteAll: sinon.stub().callsFake(() => { callOrder.push('mfi'); return Promise.resolve({ count: 0 }); }) });
            const listingRepo = makeRepo({ deleteAll: sinon.stub().callsFake(() => { callOrder.push('listing'); return Promise.resolve({ count: 0 }); }) });
            const companyRepo = makeRepo({ deleteAll: sinon.stub().callsFake(() => { callOrder.push('company'); return Promise.resolve({ count: 0 }); }) });
            const userRepo = makeRepo({ deleteAll: sinon.stub().callsFake(() => { callOrder.push('user'); return Promise.resolve({ count: 0 }); }) });

            const svc = buildService({ userRepo, companyRepo, listingRepo, mfiRepo, sampleRepo });
            await svc.cleanupTestData();

            expect(callOrder[0]).to.equal('sample');
            expect(callOrder[1]).to.equal('mfi');
            expect(userRepo.deleteAll.calledWith(sinon.match({ email: { like: '%@yopmail.com' } }))).to.be.true();
        });
    });
});
