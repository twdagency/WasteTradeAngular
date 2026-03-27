import { expect, sinon } from '@loopback/testlab';

import { AdminNotesService } from '../../services';

describe('AdminNotesService (unit)', () => {
    it('upserts existing record note (updates latest note)', async () => {
        const adminNotesRepository = {
            findOne: sinon.stub().resolves({ id: 1 }),
            updateById: sinon.stub().resolves(),
            findById: sinon.stub().resolves({ id: 1, noteText: 'abc' }),
            create: sinon.stub(),
        } as any;

        const service = new AdminNotesService(adminNotesRepository);

        const note = await service.createNote({
            recordType: 'listing',
            recordId: 123,
            noteText: '  abc  ',
            createdByAdminId: 9,
        });

        expect(adminNotesRepository.updateById.calledOnce).to.be.true();
        expect(adminNotesRepository.updateById.firstCall.args[0]).to.equal(1);
        expect(adminNotesRepository.updateById.firstCall.args[1]).to.containEql({
            noteText: 'abc',
            updatedByAdminId: 9,
        });
        expect(adminNotesRepository.create.called).to.be.false();
        expect(note).to.containEql({ id: 1 });
    });

    it('creates new record note when none exists (allows clear to empty)', async () => {
        const adminNotesRepository = {
            findOne: sinon.stub().resolves(null),
            create: sinon.stub().resolves({ id: 2, noteText: '' }),
        } as any;

        const service = new AdminNotesService(adminNotesRepository);

        const note = await service.createNote({
            recordType: 'offer',
            recordId: 55,
            noteText: '   ',
            createdByAdminId: 9,
        });

        expect(adminNotesRepository.create.calledOnce).to.be.true();
        expect(adminNotesRepository.create.firstCall.args[0]).to.containEql({
            recordType: 'offer',
            recordId: 55,
            noteText: '',
            createdByAdminId: 9,
            updatedByAdminId: 9,
        });
        expect(note).to.containEql({ id: 2, noteText: '' });
    });
});
