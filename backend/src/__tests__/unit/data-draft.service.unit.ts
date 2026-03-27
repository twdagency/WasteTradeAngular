import { expect, sinon } from '@loopback/testlab';
import { DataDraftService } from '../../services/data-draft.service';

function makeDraftRepo(overrides = {}) {
    return {
        find: sinon.stub().resolves([]),
        create: sinon.stub().resolves({ id: 1, email: 'user@test.com', secret: 'abc', type: 'complete_account', data: '{}' }),
        updateById: sinon.stub().resolves(),
        findById: sinon.stub().resolves(null),
        deleteById: sinon.stub().resolves(),
        ...overrides,
    } as any;
}

function makeEmailService() {
    return { sendCompleteAccountDraftEmail: sinon.stub().resolves() } as any;
}

function makeAuthService() {
    return {
        login: sinon.stub().resolves({ data: { user: { id: 1, email: 'user@test.com' } } }),
    } as any;
}

const userProfile: any = { id: 1, email: 'user@test.com' };

describe('DataDraftService (unit)', () => {
    describe('saveDataDraft', () => {
        it('creates new draft when none exists and sends email', async () => {
            const draftRepo = makeDraftRepo();
            const emailService = makeEmailService();
            const service = new DataDraftService(draftRepo, emailService, makeAuthService());

            const result = await service.saveDataDraft({ step: 1, name: 'test' }, false, userProfile);

            expect(draftRepo.create.calledOnce).to.be.true();
            expect(emailService.sendCompleteAccountDraftEmail.calledOnce).to.be.true();
            expect(result.status).to.equal('success');
        });

        it('updates existing draft when found and sends email', async () => {
            const existingDraft = { id: 5, email: 'user@test.com', secret: 'old-secret', type: 'complete_account', data: '{}' };
            const draftRepo = makeDraftRepo({ find: sinon.stub().resolves([existingDraft]) });
            const emailService = makeEmailService();
            const service = new DataDraftService(draftRepo, emailService, makeAuthService());

            const result = await service.saveDataDraft({ step: 2 }, false, userProfile);

            expect(draftRepo.updateById.calledOnce).to.be.true();
            expect(draftRepo.create.called).to.be.false();
            expect(emailService.sendCompleteAccountDraftEmail.calledOnce).to.be.true();
            expect(result.status).to.equal('success');
        });

        it('does NOT send email on auto-save', async () => {
            const draftRepo = makeDraftRepo();
            const emailService = makeEmailService();
            const service = new DataDraftService(draftRepo, emailService, makeAuthService());

            await service.saveDataDraft({ step: 1 }, true, userProfile);

            expect(emailService.sendCompleteAccountDraftEmail.called).to.be.false();
        });

        it('reuses secret on auto-save (does not rotate)', async () => {
            const existingDraft = { id: 5, email: 'user@test.com', secret: 'fixed-secret', type: 'complete_account', data: '{}' };
            const draftRepo = makeDraftRepo({ find: sinon.stub().resolves([existingDraft]) });
            const service = new DataDraftService(draftRepo, makeEmailService(), makeAuthService());

            await service.saveDataDraft({ step: 1 }, true, userProfile);

            const updateArg = draftRepo.updateById.firstCall.args[1];
            expect(updateArg.secret).to.equal('fixed-secret');
        });

        it('rotates secret on manual save', async () => {
            const existingDraft = { id: 5, email: 'user@test.com', secret: 'fixed-secret', type: 'complete_account', data: '{}' };
            const draftRepo = makeDraftRepo({ find: sinon.stub().resolves([existingDraft]) });
            const service = new DataDraftService(draftRepo, makeEmailService(), makeAuthService());

            await service.saveDataDraft({ step: 1 }, false, userProfile);

            const updateArg = draftRepo.updateById.firstCall.args[1];
            expect(updateArg.secret).to.not.equal('fixed-secret');
        });
    });

    describe('getLatestDataDraft', () => {
        it('throws invalid token error for malformed token (no draftId)', async () => {
            const service = new DataDraftService(makeDraftRepo(), makeEmailService(), makeAuthService());

            // jwt.decode of a non-JWT returns null → no draftId
            await expect(service.getLatestDataDraft('not-a-jwt')).to.be.rejectedWith(/data-draft-token-invalid/);
        });

        it('throws invalid token error when draft not found in DB', async () => {
            // Build a real token with a draftId so decode works, but repo returns null
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ draftId: 999, email: 'u@u.com', type: 'complete_account' }, 'any-secret');
            const draftRepo = makeDraftRepo({ findById: sinon.stub().resolves(null) });
            const service = new DataDraftService(draftRepo, makeEmailService(), makeAuthService());

            await expect(service.getLatestDataDraft(token)).to.be.rejectedWith(/data-draft-token-invalid/);
        });
    });
});
