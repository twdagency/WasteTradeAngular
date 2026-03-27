import { expect, sinon } from '@loopback/testlab';
import { AdminNotesService } from '../../services';

function buildService(repoOverrides: Record<string, any> = {}): { service: AdminNotesService; repo: any } {
    const repo: any = {
        findOne: sinon.stub().resolves(null),
        findById: sinon.stub().resolves({ id: 1, noteText: 'note' }),
        find: sinon.stub().resolves([]),
        create: sinon.stub().resolves({ id: 1 }),
        updateById: sinon.stub().resolves(),
        deleteById: sinon.stub().resolves(),
        ...repoOverrides,
    };
    return { service: new AdminNotesService(repo), repo };
}

describe('AdminNotesService extended coverage (unit)', () => {
    describe('createNote() — validation', () => {
        it('throws BadRequest for invalid record type', async () => {
            const { service } = buildService();

            await expect(service.createNote({
                recordType: 'invalid_type',
                recordId: 1,
                noteText: 'test',
                createdByAdminId: 9,
            })).to.be.rejectedWith(/invalid record type/i);
        });

        it('creates note for all valid record types', async () => {
            const validTypes = ['user', 'listing', 'wanted_listing', 'offer', 'haulage_offer', 'sample', 'mfi'];

            for (const recordType of validTypes) {
                const { service, repo } = buildService({
                    findOne: sinon.stub().resolves(null),
                    create: sinon.stub().resolves({ id: 1, noteText: 'note', recordType }),
                });

                const result = await service.createNote({
                    recordType,
                    recordId: 1,
                    noteText: 'test note',
                    createdByAdminId: 9,
                });

                expect(repo.create.calledOnce).to.be.true();
                expect(result).to.be.ok();
            }
        });

        it('trims whitespace from noteText before storing', async () => {
            const { service, repo } = buildService({
                findOne: sinon.stub().resolves(null),
                create: sinon.stub().resolves({ id: 2, noteText: 'trimmed' }),
            });

            await service.createNote({
                recordType: 'listing',
                recordId: 5,
                noteText: '   trimmed   ',
                createdByAdminId: 9,
            });

            const createArg = repo.create.firstCall.args[0];
            expect(createArg.noteText).to.equal('trimmed');
        });

        it('stores both createdByAdminId and updatedByAdminId on new note', async () => {
            const { service, repo } = buildService({
                findOne: sinon.stub().resolves(null),
                create: sinon.stub().resolves({ id: 3 }),
            });

            await service.createNote({
                recordType: 'offer',
                recordId: 10,
                noteText: 'new note',
                createdByAdminId: 42,
            });

            const createArg = repo.create.firstCall.args[0];
            expect(createArg.createdByAdminId).to.equal(42);
            expect(createArg.updatedByAdminId).to.equal(42);
        });
    });

    describe('getNotesForRecord()', () => {
        it('throws BadRequest for invalid record type', async () => {
            const { service } = buildService();

            await expect(service.getNotesForRecord('bad_type', 1))
                .to.be.rejectedWith(/invalid record type/i);
        });

        it('returns notes array for valid record type', async () => {
            const { service, repo } = buildService({
                find: sinon.stub().resolves([
                    { id: 1, recordType: 'listing', recordId: 5, noteText: 'First note' },
                    { id: 2, recordType: 'listing', recordId: 5, noteText: 'Second note' },
                ]),
            });

            const result = await service.getNotesForRecord('listing', 5);

            expect(result).to.have.length(2);
            expect(repo.find.calledOnce).to.be.true();
            const findArg = repo.find.firstCall.args[0];
            expect(findArg.where).to.containEql({ recordType: 'listing', recordId: 5 });
        });

        it('returns empty array when no notes exist', async () => {
            const { service } = buildService({
                find: sinon.stub().resolves([]),
            });

            const result = await service.getNotesForRecord('user', 99);
            expect(result).to.deepEqual([]);
        });

        it('passes include relations for createdByAdmin and updatedByAdmin', async () => {
            const { service, repo } = buildService({
                find: sinon.stub().resolves([]),
            });

            await service.getNotesForRecord('offer', 7);

            const findArg = repo.find.firstCall.args[0];
            expect(findArg.include).to.containDeep([{ relation: 'createdByAdmin' }]);
            expect(findArg.include).to.containDeep([{ relation: 'updatedByAdmin' }]);
        });
    });

    describe('updateNote()', () => {
        it('updates note text and updatedByAdminId', async () => {
            const { service, repo } = buildService({
                findById: sinon.stub().resolves({ id: 1, noteText: 'old text' }),
            });

            await service.updateNote(1, '  new text  ', 55);

            expect(repo.updateById.calledWith(1, sinon.match({
                noteText: 'new text',
                updatedByAdminId: 55,
            }))).to.be.true();
        });

        it('trims whitespace from updated noteText', async () => {
            const { service, repo } = buildService({
                findById: sinon.stub().resolves({ id: 2, noteText: 'old' }),
            });

            await service.updateNote(2, '   padded text   ', 9);

            const updateArg = repo.updateById.firstCall.args[1];
            expect(updateArg.noteText).to.equal('padded text');
        });

        it('sets updatedAt timestamp when updating', async () => {
            const { service, repo } = buildService({
                findById: sinon.stub().resolves({ id: 3, noteText: 'existing' }),
            });

            await service.updateNote(3, 'new text', 10);

            const updateArg = repo.updateById.firstCall.args[1];
            expect(updateArg.updatedAt).to.be.a.String();
        });
    });

    describe('deleteNote()', () => {
        it('calls deleteById on repository', async () => {
            const { service, repo } = buildService();

            await service.deleteNote(7);

            expect(repo.deleteById.calledWith(7)).to.be.true();
        });
    });

    describe('getNoteById()', () => {
        it('returns note with relations included', async () => {
            const { service, repo } = buildService({
                findById: sinon.stub().resolves({
                    id: 1,
                    noteText: 'admin note',
                    createdByAdmin: { id: 9, firstName: 'Admin' },
                }),
            });

            const result = await service.getNoteById(1);

            expect(result.id).to.equal(1);
            expect(result.noteText).to.equal('admin note');
            const findArg = repo.findById.firstCall.args[1];
            expect(findArg.include).to.containDeep([{ relation: 'createdByAdmin' }]);
        });
    });
});
