/**
 * data-draft.service-2.unit.ts
 * Coverage for: getLatestDataDraft token verify success, expired token, general error
 */
import { expect, sinon } from '@loopback/testlab';
import { DataDraftService } from '../../services/data-draft.service';
import * as jwt from 'jsonwebtoken';

function makeDraftRepo(overrides = {}) {
    return {
        find: sinon.stub().resolves([]),
        create: sinon.stub().resolves({ id: 1, email: 'u@t.com', secret: 'abc', type: 'complete_account', data: '{}' }),
        updateById: sinon.stub().resolves(),
        findById: sinon.stub().resolves(null),
        deleteById: sinon.stub().resolves(),
        ...overrides,
    } as any;
}

describe('DataDraftService Part 2 (unit)', () => {
    describe('getLatestDataDraft() — token verification', () => {
        it('returns draft data on valid token', async () => {
            const secret = 'test-secret-123';
            const token = jwt.sign({ draftId: 10, email: 'u@t.com', type: 'complete_account' }, secret, { expiresIn: '1h' });
            const draft = { id: 10, email: 'u@t.com', secret, type: 'complete_account', data: '{"step":2}' };
            const draftRepo = makeDraftRepo({ findById: sinon.stub().resolves(draft) });
            const authService = { login: sinon.stub().resolves({ data: { user: { id: 1, email: 'u@t.com' } } }) } as any;
            const svc = new DataDraftService(draftRepo, { sendCompleteAccountDraftEmail: sinon.stub() } as any, authService);

            const result = await svc.getLatestDataDraft(token);
            expect(result.status).to.equal('success');
            expect((result.data as any).dataDraft).to.deepEqual({ step: 2 });
            expect((result.data as any).userLoginData).to.have.property('id', 1);
        });

        it('deletes draft and throws 401 when token expired', async () => {
            const secret = 'test-secret-456';
            // Create an already-expired token
            const token = jwt.sign({ draftId: 20, email: 'u@t.com', type: 'complete_account' }, secret, { expiresIn: '-1s' });
            const draft = { id: 20, email: 'u@t.com', secret, type: 'complete_account', data: '{}' };
            const draftRepo = makeDraftRepo({ findById: sinon.stub().resolves(draft) });
            const svc = new DataDraftService(draftRepo, { sendCompleteAccountDraftEmail: sinon.stub() } as any, { login: sinon.stub() } as any);

            await expect(svc.getLatestDataDraft(token)).to.be.rejectedWith(/expired/i);
            expect(draftRepo.deleteById.calledWith(20)).to.be.true();
        });

        it('throws 401 when token signed with wrong secret', async () => {
            const token = jwt.sign({ draftId: 30, email: 'u@t.com', type: 'complete_account' }, 'wrong-secret');
            const draft = { id: 30, email: 'u@t.com', secret: 'correct-secret', type: 'complete_account', data: '{}' };
            const draftRepo = makeDraftRepo({ findById: sinon.stub().resolves(draft) });
            const svc = new DataDraftService(draftRepo, { sendCompleteAccountDraftEmail: sinon.stub() } as any, { login: sinon.stub() } as any);

            await expect(svc.getLatestDataDraft(token)).to.be.rejectedWith(/invalid/i);
        });

        it('returns null userLoginData when auth login fails', async () => {
            const secret = 'test-secret-789';
            const token = jwt.sign({ draftId: 40, email: 'u@t.com', type: 'complete_account' }, secret, { expiresIn: '1h' });
            const draft = { id: 40, email: 'u@t.com', secret, type: 'complete_account', data: '{"x":1}' };
            const draftRepo = makeDraftRepo({ findById: sinon.stub().resolves(draft) });
            const authService = { login: sinon.stub().rejects(new Error('auth fail')) } as any;
            const svc = new DataDraftService(draftRepo, { sendCompleteAccountDraftEmail: sinon.stub() } as any, authService);

            const result = await svc.getLatestDataDraft(token);
            expect(result.status).to.equal('success');
            expect((result.data as any).userLoginData).to.be.null();
        });
    });
});
