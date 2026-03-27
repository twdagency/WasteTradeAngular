import { expect, sinon } from '@loopback/testlab';
import { SalesforceRetryCronJob } from '../../components/Cronjobs/salesforce-retry.cronjob';

function makeSyncResult(n = 0) {
    return { total: n, successful: n, failed: 0 };
}

function buildStubSyncService(overrides: Record<string, unknown> = {}) {
    return {
        getCircuitBreakerStatus: sinon.stub().returns({ isOpen: false, failures: 0, lastFailureTime: null }),
        checkSalesforceConnection: sinon.stub().resolves(true),
        syncCompaniesByFilter: sinon.stub().resolves(makeSyncResult()),
        syncUsersByFilter: sinon.stub().resolves(makeSyncResult()),
        syncCompanyUsersByFilter: sinon.stub().resolves(makeSyncResult()),
        syncListingsByFilter: sinon.stub().resolves(makeSyncResult()),
        syncOffersByFilter: sinon.stub().resolves(makeSyncResult()),
        syncHaulageOffersByFilter: sinon.stub().resolves(makeSyncResult()),
        syncHaulageLoadsByFilter: sinon.stub().resolves(makeSyncResult()),
        syncCompanyDocumentsByFilter: sinon.stub().resolves(makeSyncResult()),
        syncLocationDocumentsByFilter: sinon.stub().resolves(makeSyncResult()),
        pullUpdatesFromSalesforce: sinon.stub().resolves({
            accounts: { updated: 0, failed: 0 },
            contacts: { updated: 0, failed: 0 },
            haulageOffers: { updated: 0, failed: 0 },
            leads: { updated: 0, failed: 0 },
        }),
        pullListingStatusUpdatesFromSalesforce: sinon.stub().resolves({ updated: 0, failed: 0 }),
        pullWantedListingStatusUpdatesFromSalesforce: sinon.stub().resolves({ updated: 0, failed: 0 }),
        pullOfferStatusUpdatesFromSalesforce: sinon.stub().resolves({ updated: 0, failed: 0 }),
        ...overrides,
    };
}

describe('SalesforceRetryCronJob (unit)', () => {
    let stubSyncService: ReturnType<typeof buildStubSyncService>;
    let stubRepo: { find: sinon.SinonStub };
    let stubHaulageOfferService: {
        syncHaulageOfferDocumentsFromSalesforce: sinon.SinonStub;
        syncHaulageLoadsFromSalesforce: sinon.SinonStub;
    };
    let cronjob: SalesforceRetryCronJob;
    const origSfEnv = process.env.SALESFORCE_SYNC_ENABLED;
    const origBgEnv = process.env.IS_BACKGROUND;

    beforeEach(() => {
        process.env.SALESFORCE_SYNC_ENABLED = 'true';
        process.env.IS_BACKGROUND = 'true';

        stubRepo = { find: sinon.stub().resolves([]) };
        stubHaulageOfferService = {
            syncHaulageOfferDocumentsFromSalesforce: sinon.stub().resolves(),
            syncHaulageLoadsFromSalesforce: sinon.stub().resolves(),
        };
        stubSyncService = buildStubSyncService();
        cronjob = new SalesforceRetryCronJob(
            stubSyncService as any,
            stubRepo as any,
            stubHaulageOfferService as any,
        );
    });

    afterEach(() => {
        process.env.SALESFORCE_SYNC_ENABLED = origSfEnv;
        process.env.IS_BACKGROUND = origBgEnv;
        sinon.restore();
    });

    describe('handleTick - env guards', () => {
        it('skips sync when SALESFORCE_SYNC_ENABLED is not true', async () => {
            process.env.SALESFORCE_SYNC_ENABLED = 'false';
            await (cronjob as any).handleTick();
            expect(stubSyncService.syncCompaniesByFilter.called).to.be.false();
        });

        it('skips sync when IS_BACKGROUND is false', async () => {
            process.env.IS_BACKGROUND = 'false';
            await (cronjob as any).handleTick();
            expect(stubSyncService.syncCompaniesByFilter.called).to.be.false();
        });
    });

    describe('handleTick - circuit breaker', () => {
        it('skips sync when circuit breaker is open', async () => {
            stubSyncService.getCircuitBreakerStatus.returns({
                isOpen: true, failures: 5, lastFailureTime: new Date(),
            });
            await (cronjob as any).handleTick();
            expect(stubSyncService.syncCompaniesByFilter.called).to.be.false();
        });
    });

    describe('handleTick - connection check', () => {
        it('skips sync when Salesforce not connected', async () => {
            stubSyncService.checkSalesforceConnection.resolves(false);
            await (cronjob as any).handleTick();
            expect(stubSyncService.syncCompaniesByFilter.called).to.be.false();
        });

        it('runs full sync when connection available', async () => {
            await (cronjob as any).handleTick();
            expect(stubSyncService.syncCompaniesByFilter.calledOnce).to.be.true();
            expect(stubSyncService.syncUsersByFilter.calledOnce).to.be.true();
        });
    });

    describe('handleTick - overlapping execution guard', () => {
        it('does not run again while already running', async () => {
            let resolveFirst!: () => void;
            stubSyncService.syncCompaniesByFilter.onFirstCall().returns(
                new Promise<typeof makeSyncResult>((res) => { resolveFirst = () => res(makeSyncResult() as any); }),
            );

            const first = (cronjob as any).handleTick();
            // Second tick while first is still in progress — should be skipped
            await (cronjob as any).handleTick();

            resolveFirst();
            await first;

            // syncCompaniesByFilter called only once (second tick skipped)
            expect(stubSyncService.syncCompaniesByFilter.callCount).to.equal(1);
        });
    });
});
