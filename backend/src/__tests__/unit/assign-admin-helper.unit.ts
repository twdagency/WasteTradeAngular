import { expect, sinon } from '@loopback/testlab';
import { AssignAdminHelper } from '../../helpers/assign-admin.helper';

function makeStubUserRepo(users: any[] = []) {
    return {
        find: sinon.stub().resolves(users),
    };
}

describe('AssignAdminHelper (unit)', () => {
    describe('enrichWithAssignedAdmin', () => {
        afterEach(() => sinon.restore());

        it('returns empty array unchanged', async () => {
            const repo = makeStubUserRepo([]);
            const result = await AssignAdminHelper.enrichWithAssignedAdmin([], repo as any);
            expect(result).to.deepEqual([]);
            sinon.assert.notCalled(repo.find);
        });

        it('returns results unchanged when no assignAdmin data present', async () => {
            const repo = makeStubUserRepo([]);
            const items = [
                { id: 'co-001', name: 'Acme Recycling Ltd' },
                { id: 'co-002', name: 'GreenLoop UK Ltd' },
            ];
            const result = await AssignAdminHelper.enrichWithAssignedAdmin(items as any, repo as any);
            expect(result).to.have.length(2);
            expect(result[0]).to.containEql({ id: 'co-001' });
            expect(result[1]).to.containEql({ id: 'co-002' });
            sinon.assert.notCalled(repo.find);
        });

        it('returns results unchanged when assignAdmin has no assignedAdminId', async () => {
            const repo = makeStubUserRepo([]);
            const items = [
                { id: 'co-003', assignAdmin: { notes: 'pending review' } },
            ];
            const result = await AssignAdminHelper.enrichWithAssignedAdmin(items as any, repo as any);
            expect(result[0]).to.containEql({ id: 'co-003' });
            sinon.assert.notCalled(repo.find);
        });

        it('fetches admin user and merges into assignAdmin object', async () => {
            const adminUser = {
                id: 42,
                firstName: 'James',
                lastName: 'Pemberton',
                email: 'james.pemberton@wastetrade.com',
                globalRole: 'admin',
            };
            const repo = makeStubUserRepo([adminUser]);
            const items = [
                {
                    id: 'co-010',
                    name: 'Acme Recycling Ltd',
                    assignAdmin: { assignedAdminId: 42, assignedAt: '2026-01-15' },
                },
            ];
            const result = await AssignAdminHelper.enrichWithAssignedAdmin(items as any, repo as any);

            expect(result).to.have.length(1);
            const enriched = result[0] as any;
            expect(enriched.assignAdmin.assignedAdmin).to.containEql({
                id: 42,
                firstName: 'James',
                lastName: 'Pemberton',
                email: 'james.pemberton@wastetrade.com',
                globalRole: 'admin',
            });
            expect(enriched.assignAdmin.assignedAt).to.equal('2026-01-15');
            sinon.assert.calledOnce(repo.find);
            sinon.assert.calledWithMatch(repo.find, { where: { id: { inq: [42] } } });
        });

        it('batches multiple distinct admin IDs into a single repo.find call', async () => {
            const adminUsers = [
                { id: 10, firstName: 'Alice', lastName: 'Nguyen', email: 'alice@wastetrade.com', globalRole: 'admin' },
                { id: 11, firstName: 'Bob', lastName: 'Clarke', email: 'bob@wastetrade.com', globalRole: 'sales_admin' },
            ];
            const repo = makeStubUserRepo(adminUsers);
            const items = [
                { id: 'co-020', assignAdmin: { assignedAdminId: 10 } },
                { id: 'co-021', assignAdmin: { assignedAdminId: 11 } },
                { id: 'co-022', assignAdmin: { assignedAdminId: 10 } }, // duplicate — same admin
            ];
            const result = await AssignAdminHelper.enrichWithAssignedAdmin(items as any, repo as any);

            sinon.assert.calledOnce(repo.find);
            const callArgs = repo.find.firstCall.args[0];
            expect(callArgs.where.id.inq).to.containDeep([10, 11]);
            expect(callArgs.where.id.inq).to.have.length(2); // deduplicated

            expect((result[0] as any).assignAdmin.assignedAdmin.firstName).to.equal('Alice');
            expect((result[1] as any).assignAdmin.assignedAdmin.firstName).to.equal('Bob');
            expect((result[2] as any).assignAdmin.assignedAdmin.firstName).to.equal('Alice');
        });

        it('sets assignedAdmin to null when admin user is not found in repo results', async () => {
            const repo = makeStubUserRepo([]); // repo returns no users
            const items = [
                { id: 'co-030', assignAdmin: { assignedAdminId: 99 } },
            ];
            const result = await AssignAdminHelper.enrichWithAssignedAdmin(items as any, repo as any);
            expect((result[0] as any).assignAdmin.assignedAdmin).to.be.null();
        });

        it('preserves other properties on result objects', async () => {
            const adminUser = {
                id: 5,
                firstName: 'Priya',
                lastName: 'Sharma',
                email: 'priya.sharma@wastetrade.com',
                globalRole: 'admin',
            };
            const repo = makeStubUserRepo([adminUser]);
            const items = [
                {
                    id: 'co-040',
                    name: 'Greenfield Polymers Ltd',
                    registrationNumber: 'GB87654321',
                    assignAdmin: { assignedAdminId: 5 },
                },
            ];
            const result = await AssignAdminHelper.enrichWithAssignedAdmin(items as any, repo as any);
            const enriched = result[0] as any;
            expect(enriched.name).to.equal('Greenfield Polymers Ltd');
            expect(enriched.registrationNumber).to.equal('GB87654321');
            expect(enriched.assignAdmin.assignedAdmin.firstName).to.equal('Priya');
        });
    });
});
