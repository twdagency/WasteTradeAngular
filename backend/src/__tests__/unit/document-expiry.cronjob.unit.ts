import { expect, sinon } from '@loopback/testlab';
import { DocumentExpiryCronjob } from '../../components/Cronjobs/document-expiry.cronjob';

describe('DocumentExpiryCronjob (unit)', () => {
    let cronjob: DocumentExpiryCronjob;
    let stubService: { checkDocumentExpiry: sinon.SinonStub };

    beforeEach(() => {
        stubService = {
            checkDocumentExpiry: sinon.stub().resolves({ errors: [] }),
        };
        cronjob = new DocumentExpiryCronjob(stubService as any);
    });

    afterEach(() => sinon.restore());

    describe('isCurrentlyRunning', () => {
        it('returns false initially', () => {
            expect(cronjob.isCurrentlyRunning()).to.be.false();
        });
    });

    describe('triggerManualCheck', () => {
        it('calls checkDocumentExpiry', async () => {
            await cronjob.triggerManualCheck();
            expect(stubService.checkDocumentExpiry.calledOnce).to.be.true();
        });

        it('resets isRunning to false after success', async () => {
            await cronjob.triggerManualCheck();
            expect(cronjob.isCurrentlyRunning()).to.be.false();
        });

        it('resets isRunning to false after service error', async () => {
            stubService.checkDocumentExpiry.rejects(new Error('timeout'));
            // performExpiryCheck catches the error in finally block
            await cronjob.triggerManualCheck();
            expect(cronjob.isCurrentlyRunning()).to.be.false();
        });

        it('skips overlapping execution when already running', async () => {
            // Simulate concurrent call: first call sets isRunning = true
            let resolveFirst!: () => void;
            const firstCallPromise = new Promise<void>((res) => {
                resolveFirst = res;
            });
            stubService.checkDocumentExpiry.onFirstCall().returns(firstCallPromise.then(() => ({ errors: [] })));
            stubService.checkDocumentExpiry.onSecondCall().resolves({ errors: [] });

            const first = (cronjob as any).performExpiryCheck();
            // At this point isRunning is true — second call should be a no-op
            await (cronjob as any).performExpiryCheck();
            resolveFirst();
            await first;

            // checkDocumentExpiry called once only (second call skipped)
            expect(stubService.checkDocumentExpiry.callCount).to.equal(1);
        });
    });

    describe('performExpiryCheck with errors', () => {
        it('logs errors array when non-empty but does not throw', async () => {
            stubService.checkDocumentExpiry.resolves({ errors: ['err1', 'err2'] });
            await expect((cronjob as any).performExpiryCheck()).to.not.be.rejected();
        });
    });
});
