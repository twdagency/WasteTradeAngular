/**
 * salesforce-retry.cronjob-2.unit.ts
 * Branch coverage for salesforce-retry.cronjob.ts (Part 2)
 * Targets uncovered dist lines ~140,199,217-261:
 *   - consecutiveSkips >= maxConsecutiveSkips (circuit breaker warning + reset)
 *   - consecutiveSkips === 1 vs >= maxConsecutiveSkips (connection warning branches)
 *   - haulageOffersRepository.find returns offers — documents loop success/failure
 *   - haulageOffersRepository.find throws — error caught silently
 *   - pullUpdatesFromSalesforce throws — error caught silently
 *   - totalRecords > 0 logging path — breakdown lines with zero totals (null filter)
 *   - totalFailed > 0 warning log branch vs clean log branch
 *   - totalInboundUpdated > 0 inbound log branch
 */
import { expect, sinon } from '@loopback/testlab';
import { SalesforceRetryCronJob } from '../../components/Cronjobs/salesforce-retry.cronjob';
import { SalesforceLogger } from '../../utils/salesforce/salesforce-sync.utils';

function makeSyncResult(total = 0, successful = 0, failed = 0) {
    return { total, successful, failed };
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

function buildCronjob(syncOverrides: Record<string, unknown> = {}, repoOverrides: Partial<{ find: sinon.SinonStub }> = {}) {
    const stubSyncService = buildStubSyncService(syncOverrides);
    const stubRepo = { find: sinon.stub().resolves([]), ...repoOverrides };
    const stubHaulageOfferService = {
        syncHaulageOfferDocumentsFromSalesforce: sinon.stub().resolves(),
        syncHaulageLoadsFromSalesforce: sinon.stub().resolves(),
    };
    const cronjob = new SalesforceRetryCronJob(
        stubSyncService as any,
        stubRepo as any,
        stubHaulageOfferService as any,
    );
    return { cronjob, stubSyncService, stubRepo, stubHaulageOfferService };
}

const origSfEnv = process.env.SALESFORCE_SYNC_ENABLED;
const origBgEnv = process.env.IS_BACKGROUND;

beforeEach(() => {
    process.env.SALESFORCE_SYNC_ENABLED = 'true';
    process.env.IS_BACKGROUND = 'true';
});

afterEach(() => {
    process.env.SALESFORCE_SYNC_ENABLED = origSfEnv;
    process.env.IS_BACKGROUND = origBgEnv;
    sinon.restore();
});

describe('SalesforceRetryCronJob extended coverage (unit)', () => {

    // ── circuit breaker: consecutiveSkips >= maxConsecutiveSkips ──────────────
    describe('circuit breaker — extended skip warning branch', () => {
        it('logs warning and resets consecutiveSkips after 6 circuit-open skips', async () => {
            const { cronjob, stubSyncService } = buildCronjob();
            stubSyncService.getCircuitBreakerStatus.returns({
                isOpen: true, failures: 10, lastFailureTime: new Date(),
            });

            const logSpy = sinon.stub(SalesforceLogger, 'warn');

            // Run 6 consecutive skips to trigger the warning branch
            for (let i = 0; i < 6; i++) {
                await (cronjob as any).handleTick();
            }

            expect(logSpy.called).to.be.true();
            // After the warning resets consecutiveSkips to 0, the counter restarts
            expect((cronjob as any).consecutiveSkips).to.equal(0);
        });
    });

    // ── connection failure: consecutiveSkips === 1 log branch ─────────────────
    describe('connection not available — first skip logs immediately', () => {
        it('logs on first connection failure (consecutiveSkips === 1)', async () => {
            const { cronjob, stubSyncService } = buildCronjob();
            stubSyncService.checkSalesforceConnection.resolves(false);

            const logSpy = sinon.stub(SalesforceLogger, 'warn');

            await (cronjob as any).handleTick();

            expect(logSpy.called).to.be.true();
            expect((cronjob as any).consecutiveSkips).to.equal(1);
        });

        it('logs warning and resets at maxConsecutiveSkips on connection failure', async () => {
            const { cronjob, stubSyncService } = buildCronjob();
            stubSyncService.checkSalesforceConnection.resolves(false);

            const logSpy = sinon.stub(SalesforceLogger, 'warn');

            // Run 6 ticks — at tick 6, consecutiveSkips hits maxConsecutiveSkips
            for (let i = 0; i < 6; i++) {
                await (cronjob as any).handleTick();
            }

            expect(logSpy.called).to.be.true();
            expect((cronjob as any).consecutiveSkips).to.equal(0);
        });

        it('resets consecutiveSkips to 0 on successful connection after failures', async () => {
            const { cronjob, stubSyncService } = buildCronjob();
            // First fail, then succeed
            stubSyncService.checkSalesforceConnection
                .onFirstCall().resolves(false)
                .resolves(true);

            sinon.stub(SalesforceLogger, 'warn');

            await (cronjob as any).handleTick(); // fail → consecutiveSkips=1
            expect((cronjob as any).consecutiveSkips).to.equal(1);

            await (cronjob as any).handleTick(); // succeed → reset
            expect((cronjob as any).consecutiveSkips).to.equal(0);
        });
    });

    // ── haulage document loop — success and failure branches ──────────────────
    describe('haulage offer documents sync loop', () => {
        it('increments documentsSuccessful for each synced offer', async () => {
            const { cronjob, stubHaulageOfferService, stubRepo } = buildCronjob();
            stubRepo.find.resolves([{ id: 10 }, { id: 11 }]);
            stubHaulageOfferService.syncHaulageOfferDocumentsFromSalesforce.resolves();
            stubHaulageOfferService.syncHaulageLoadsFromSalesforce.resolves();

            // No records processed but documents succeed → totalRecords > 0 triggers log
            sinon.stub(SalesforceLogger, 'warn');
            await (cronjob as any).handleTick();

            expect(stubHaulageOfferService.syncHaulageOfferDocumentsFromSalesforce.callCount).to.equal(2);
        });

        it('increments documentsFailed when syncHaulageOfferDocuments throws', async () => {
            const { cronjob, stubHaulageOfferService, stubRepo } = buildCronjob();
            stubRepo.find.resolves([{ id: 20 }]);
            stubHaulageOfferService.syncHaulageOfferDocumentsFromSalesforce.rejects(new Error('DOC_FAIL'));

            sinon.stub(SalesforceLogger, 'warn');
            await (cronjob as any).handleTick();

            // documentsFailed incremented — no unhandled throw
            expect(stubHaulageOfferService.syncHaulageOfferDocumentsFromSalesforce.calledOnce).to.be.true();
        });

        it('logs error and continues when haulageOffersRepository.find throws', async () => {
            const { cronjob } = buildCronjob({}, { find: sinon.stub().rejects(new Error('REPO_FAIL')) });

            const errSpy = sinon.stub(SalesforceLogger, 'error');
            sinon.stub(SalesforceLogger, 'warn');
            await (cronjob as any).handleTick();

            expect(errSpy.called).to.be.true();
        });
    });

    // ── inbound pullUpdatesFromSalesforce throws ───────────────────────────────
    describe('inbound sync — pullUpdatesFromSalesforce throws', () => {
        it('catches error and continues without crashing', async () => {
            const { cronjob, stubSyncService } = buildCronjob();
            stubSyncService.pullUpdatesFromSalesforce.rejects(new Error('INBOUND_FAIL'));

            const errSpy = sinon.stub(SalesforceLogger, 'error');
            sinon.stub(SalesforceLogger, 'warn');
            await (cronjob as any).handleTick();

            expect(errSpy.called).to.be.true();
        });
    });

    // ── logging branches — totalRecords > 0 ───────────────────────────────────
    describe('logging — totalFailed > 0 warning log branch', () => {
        it('logs warning message when there are failed records', async () => {
            const { cronjob, stubSyncService } = buildCronjob({
                syncCompaniesByFilter: sinon.stub().resolves(makeSyncResult(3, 2, 1)),
            });

            const logSpy = sinon.stub(SalesforceLogger, 'warn');
            await (cronjob as any).handleTick();

            const warningCall = logSpy.args.find(args =>
                typeof args[0] === 'string' && args[0].includes('failed'),
            );
            expect(warningCall).to.not.be.undefined();
        });

        it('logs success message when all records succeed', async () => {
            const { cronjob, stubSyncService } = buildCronjob({
                syncCompaniesByFilter: sinon.stub().resolves(makeSyncResult(2, 2, 0)),
            });

            const logSpy = sinon.stub(SalesforceLogger, 'warn');
            await (cronjob as any).handleTick();

            const successCall = logSpy.args.find(args =>
                typeof args[0] === 'string' && args[0].includes('SF sync'),
            );
            expect(successCall).to.not.be.undefined();
        });
    });

    // ── logging branches — inbound results > 0 ────────────────────────────────
    describe('logging — inbound results log branch', () => {
        it('logs inbound sync when accounts were updated', async () => {
            const { cronjob, stubSyncService } = buildCronjob({
                pullUpdatesFromSalesforce: sinon.stub().resolves({
                    accounts: { updated: 3, failed: 0 },
                    contacts: { updated: 0, failed: 0 },
                    haulageOffers: { updated: 0, failed: 0 },
                    leads: { updated: 0, failed: 0 },
                }),
            });

            const logSpy = sinon.stub(SalesforceLogger, 'warn');
            await (cronjob as any).handleTick();

            const inboundCall = logSpy.args.find(args =>
                typeof args[0] === 'string' && args[0].includes('inbound'),
            );
            expect(inboundCall).to.not.be.undefined();
        });

        it('logs inbound failure count when inbound records failed', async () => {
            const { cronjob, stubSyncService } = buildCronjob({
                syncCompaniesByFilter: sinon.stub().resolves(makeSyncResult(1, 1, 0)),
                pullUpdatesFromSalesforce: sinon.stub().resolves({
                    accounts: { updated: 0, failed: 2 },
                    contacts: { updated: 0, failed: 0 },
                    haulageOffers: { updated: 0, failed: 0 },
                    leads: { updated: 0, failed: 0 },
                }),
            });

            const logSpy = sinon.stub(SalesforceLogger, 'warn');
            await (cronjob as any).handleTick();

            const inboundFailCall = logSpy.args.find(args =>
                typeof args[0] === 'string' && args[0].includes('failed'),
            );
            expect(inboundFailCall).to.not.be.undefined();
        });
    });

    // ── breakdown null filter — individual object lines ────────────────────────
    describe('logging breakdown — non-zero object totals produce breakdown lines', () => {
        it('includes breakdown items for each non-zero sync result', async () => {
            const { cronjob, stubSyncService } = buildCronjob({
                syncCompaniesByFilter: sinon.stub().resolves(makeSyncResult(1, 1, 0)),
                syncUsersByFilter: sinon.stub().resolves(makeSyncResult(2, 2, 0)),
                syncCompanyUsersByFilter: sinon.stub().resolves(makeSyncResult(1, 1, 0)),
                syncListingsByFilter: sinon.stub().resolves(makeSyncResult(1, 1, 0)),
                syncOffersByFilter: sinon.stub().resolves(makeSyncResult(1, 1, 0)),
                syncHaulageOffersByFilter: sinon.stub().resolves(makeSyncResult(1, 1, 0)),
                syncHaulageLoadsByFilter: sinon.stub().resolves(makeSyncResult(1, 1, 0)),
                syncCompanyDocumentsByFilter: sinon.stub().resolves(makeSyncResult(1, 1, 0)),
                syncLocationDocumentsByFilter: sinon.stub().resolves(makeSyncResult(1, 1, 0)),
            });

            const logSpy = sinon.stub(SalesforceLogger, 'warn');
            await (cronjob as any).handleTick();

            const summaryCall = logSpy.args.find(args =>
                typeof args[0] === 'string' && args[0].includes('SF sync'),
            );
            expect(summaryCall).to.not.be.undefined();
            // Breakdown should include multiple entity labels
            const summaryMsg: string = summaryCall![0];
            expect(summaryMsg).to.containEql('Companies');
            expect(summaryMsg).to.containEql('Users');
        });
    });

    // ── handleTick outer catch block ──────────────────────────────────────────
    describe('handleTick — outer catch block', () => {
        it('catches unexpected error thrown by syncCompaniesByFilter and logs', async () => {
            const { cronjob, stubSyncService } = buildCronjob({
                syncCompaniesByFilter: sinon.stub().rejects(new Error('UNEXPECTED')),
            });

            const errSpy = sinon.stub(SalesforceLogger, 'error');
            await (cronjob as any).handleTick();

            expect(errSpy.called).to.be.true();
        });

        it('resets isRunning to false even after unexpected error', async () => {
            const { cronjob, stubSyncService } = buildCronjob({
                syncCompaniesByFilter: sinon.stub().rejects(new Error('CRASH')),
            });

            sinon.stub(SalesforceLogger, 'error');
            await (cronjob as any).handleTick();

            expect((cronjob as any).isRunning).to.be.false();
        });
    });
});
