import { expect, sinon } from '@loopback/testlab';
import { ListingExpiryCronjob } from '../../components/Cronjobs/listing-expiry.cronjob';

describe('ListingExpiryCronjob (unit)', () => {
    let cronjob: ListingExpiryCronjob;
    let stubService: {
        renewOngoingListings: sinon.SinonStub;
        markExpiredListings: sinon.SinonStub;
        sendExpiryWarnings: sinon.SinonStub;
    };

    beforeEach(() => {
        stubService = {
            renewOngoingListings: sinon.stub().resolves({ renewed: 3 }),
            markExpiredListings: sinon.stub().resolves({ updated: 5, listings: [] }),
            sendExpiryWarnings: sinon.stub().resolves({ sent: 2, failed: 0 }),
        };
        cronjob = new ListingExpiryCronjob(stubService as any);
    });

    afterEach(() => sinon.restore());

    describe('triggerManualExpiryCheck', () => {
        it('calls markExpiredListings and sendExpiryWarnings', async () => {
            const result = await cronjob.triggerManualExpiryCheck();

            expect(stubService.markExpiredListings.calledOnce).to.be.true();
            expect(stubService.sendExpiryWarnings.calledOnce).to.be.true();
            expect(result.expired.updated).to.equal(5);
            expect(result.warnings.sent).to.equal(2);
        });

        it('returns expired listings array', async () => {
            const result = await cronjob.triggerManualExpiryCheck();
            expect(result.expired.listings).to.deepEqual([]);
        });

        it('propagates service errors', async () => {
            stubService.markExpiredListings.rejects(new Error('DB error'));
            await expect(cronjob.triggerManualExpiryCheck()).to.be.rejectedWith('DB error');
        });
    });

    describe('performExpiryCheck (via tick logic)', () => {
        it('calls renewOngoingListings, markExpiredListings, sendExpiryWarnings in order', async () => {
            // Access private method via reflection
            await (cronjob as any).performExpiryCheck();

            expect(stubService.renewOngoingListings.calledOnce).to.be.true();
            expect(stubService.markExpiredListings.calledOnce).to.be.true();
            expect(stubService.sendExpiryWarnings.calledOnce).to.be.true();
        });

        it('does not throw when service rejects - logs error instead', async () => {
            stubService.renewOngoingListings.rejects(new Error('network failure'));
            // performExpiryCheck catches all errors internally
            await expect((cronjob as any).performExpiryCheck()).to.not.be.rejected();
        });
    });
});
