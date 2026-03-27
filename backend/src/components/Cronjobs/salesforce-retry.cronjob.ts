import { cronJob, CronJob } from '@loopback/cron';
import { inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HaulageOfferStatus, CompanyStatus } from '../../enum';
import { HaulageOffersRepository } from '../../repositories';
import { SalesforceBindings } from '../../keys/salesforce';
import { SalesforceSyncService } from '../../services/salesforce/salesforce-sync.service';
import { HaulageOfferService } from '../../services/haulage-offer.service';
import { SalesforceLogger } from '../../utils/salesforce/salesforce-sync.utils';

@cronJob()
export class SalesforceRetryCronJob extends CronJob {
    private isRunning = false;
    private consecutiveSkips = 0;
    private readonly maxConsecutiveSkips = 6; // After 6 skips (1 hour), log a warning

    constructor(
        @inject(SalesforceBindings.SYNC_SERVICE)
        private syncService: SalesforceSyncService,
        @repository(HaulageOffersRepository)
        private haulageOffersRepository: HaulageOffersRepository,
        @inject('services.HaulageOfferService')
        private haulageOfferService: HaulageOfferService,
    ) {
        const onTick = async () => {
            await this.handleTick();
        };
        super({
            name: 'salesforce-retry-cronjob',
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onTick,
            cronTime: '0 * * * * *', // Every minute
            start: false,
            runOnInit: false,
            timeZone: 'Asia/Ho_Chi_Minh',
        });
    }

    /**
     * Handle the cron tick event
     */
    private async handleTick(): Promise<void> {
        // Check if already running to prevent overlapping executions
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        const startTime = Date.now();

        try {
            if (process.env.SALESFORCE_SYNC_ENABLED !== 'true') {
                return;
            }
            if (process.env.IS_BACKGROUND === 'false') {
                return;
            }

            // Check circuit breaker status first
            const circuitStatus = this.syncService.getCircuitBreakerStatus();
            if (circuitStatus.isOpen) {
                this.consecutiveSkips++;
                if (this.consecutiveSkips >= this.maxConsecutiveSkips) {
                    SalesforceLogger.warn('⚠️  Salesforce sync skipped: Circuit breaker open for extended period', {
                        failures: circuitStatus.failures,
                        lastFailure: circuitStatus.lastFailureTime?.toISOString(),
                        consecutiveSkips: this.consecutiveSkips,
                    });
                    this.consecutiveSkips = 0; // Reset to avoid spam
                }
                return;
            }

            // Check Salesforce connection before attempting sync
            const isConnected = await this.syncService.checkSalesforceConnection();
            if (!isConnected) {
                this.consecutiveSkips++;
                if (this.consecutiveSkips === 1 || this.consecutiveSkips >= this.maxConsecutiveSkips) {
                    SalesforceLogger.warn('⚠️  Salesforce sync skipped: Connection not available');
                    if (this.consecutiveSkips >= this.maxConsecutiveSkips) {
                        this.consecutiveSkips = 0;
                    }
                }
                return;
            }

            // Reset skip counter on successful connection
            this.consecutiveSkips = 0;

            // Only sync records that truly need syncing.
            // Exclude records created OR updated within the last 5 minutes to avoid race
            // conditions with direct sync calls from create/update endpoints.
            // This is safe because updateSyncTracking() does NOT update updatedAt,
            // so only business-logic updates set updatedAt — no infinite re-sync loops.
            const recentThreshold = new Date(Date.now() - 300_000);
            const where = {
                and: [
                    {
                        or: [
                            { isSyncedSalesForce: false },
                            { lastSyncedSalesForceDate: null },
                            { salesforceId: null },
                        ],
                    },
                    { createdAt: { lt: recentThreshold } },
                    { or: [{ updatedAt: null }, { updatedAt: { lt: recentThreshold } }] },
                ],
            };

            // Phase 1: Sync Companies (Accounts) first — Contacts depend on Accounts existing
            // Only sync ACTIVE companies (non-active are skipped by syncCompany anyway)
            const companyWhere = {
                and: [...where.and, { status: CompanyStatus.ACTIVE }],
            };
            const companyResults = await this.syncService.syncCompaniesByFilter(companyWhere);

            // Phase 2: Everything else can run in parallel (Contacts now have Accounts to link to)
            const [
                userResults,
                companyUserResults,
                listingResults,
                offerResults,
                haulageOfferResults,
                haulageLoadResults,
                companyDocResults,
                locationDocResults,
            ] = await Promise.all([
                this.syncService.syncUsersByFilter(where),
                this.syncService.syncCompanyUsersByFilter(where),
                this.syncService.syncListingsByFilter(where),
                this.syncService.syncOffersByFilter(where),
                this.syncService.syncHaulageOffersByFilter(where),
                this.syncService.syncHaulageLoadsByFilter(where),
                this.syncService.syncCompanyDocumentsByFilter(where),
                this.syncService.syncLocationDocumentsByFilter(where),
            ]);

            // Sync haulage offer documents from Salesforce
            // Only sync offers that haven't been synced yet or were recently updated
            let documentsSuccessful = 0;
            let documentsFailed = 0;
            try {
                const fiveMinutesAgo = new Date(Date.now() - 1000 * 60 * 5);
                const acceptedOffers = await this.haulageOffersRepository.find({
                    where: {
                        status: {
                            inq: [
                                HaulageOfferStatus.ACCEPTED,
                                HaulageOfferStatus.PARTIALLY_SHIPPED,
                                HaulageOfferStatus.SHIPPED,
                            ],
                        },
                        or: [
                            { isSyncedSalesForce: false },
                            { lastSyncedSalesForceDate: null as unknown as Date },
                            { updatedAt: { gte: fiveMinutesAgo } },
                        ],
                    },
                    fields: ['id'],
                    limit: 50,
                });

                for (const offer of acceptedOffers) {
                    try {
                        await this.haulageOfferService.syncHaulageOfferDocumentsFromSalesforce(offer.id);
                        await this.haulageOfferService.syncHaulageLoadsFromSalesforce(offer.id);
                        documentsSuccessful++;
                    } catch (error) {
                        documentsFailed++;
                        SalesforceLogger.warn(`Haulage doc sync failed for offer ${offer.id}`, {
                            error: error instanceof Error ? error.message : 'Unknown error',
                        });
                    }
                }
            } catch (error) {
                SalesforceLogger.error('Error syncing haulage documents:', error);
            }

            // Calculate totals
            const totalRecords =
                companyResults.total +
                userResults.total +
                companyUserResults.total +
                listingResults.total +
                offerResults.total +
                haulageOfferResults.total +
                haulageLoadResults.total +
                companyDocResults.total +
                locationDocResults.total +
                documentsSuccessful +
                documentsFailed;
            const totalSuccessful =
                companyResults.successful +
                userResults.successful +
                companyUserResults.successful +
                listingResults.successful +
                offerResults.successful +
                haulageOfferResults.successful +
                haulageLoadResults.successful +
                companyDocResults.successful +
                locationDocResults.successful +
                documentsSuccessful;
            const totalFailed =
                companyResults.failed +
                userResults.failed +
                companyUserResults.failed +
                listingResults.failed +
                offerResults.failed +
                haulageOfferResults.failed +
                haulageLoadResults.failed +
                companyDocResults.failed +
                locationDocResults.failed +
                documentsFailed;
            const totalSkipped =
                (companyResults.skipped ?? 0) +
                (userResults.skipped ?? 0) +
                (companyUserResults.skipped ?? 0) +
                (listingResults.skipped ?? 0) +
                (offerResults.skipped ?? 0) +
                (haulageOfferResults.skipped ?? 0) +
                (haulageLoadResults.skipped ?? 0) +
                (companyDocResults.skipped ?? 0) +
                (locationDocResults.skipped ?? 0);

            // INBOUND SYNC: Pull updates from Salesforce to WasteTrade
            let inboundResults = {
                accounts: { updated: 0, failed: 0 },
                contacts: { updated: 0, failed: 0 },
                haulageOffers: { updated: 0, failed: 0 },
                leads: { updated: 0, failed: 0 },
                listings: { updated: 0, failed: 0 },
                wantedListings: { updated: 0, failed: 0 },
                offers: { updated: 0, failed: 0 },
            };
            try {
                const [baseResults, inboundListingResults, inboundWantedListingResults, inboundOfferResults] =
                    await Promise.all([
                        this.syncService.pullUpdatesFromSalesforce(15),
                        this.syncService.pullListingStatusUpdatesFromSalesforce(15),
                        this.syncService.pullWantedListingStatusUpdatesFromSalesforce(15),
                        this.syncService.pullOfferStatusUpdatesFromSalesforce(15),
                    ]);
                inboundResults = {
                    ...baseResults,
                    listings: inboundListingResults,
                    wantedListings: inboundWantedListingResults,
                    offers: inboundOfferResults,
                };
            } catch (error) {
                SalesforceLogger.error('Error pulling inbound updates from Salesforce:', error);
            }

            const totalInboundUpdated =
                inboundResults.accounts.updated +
                inboundResults.contacts.updated +
                inboundResults.haulageOffers.updated +
                inboundResults.leads.updated +
                inboundResults.listings.updated +
                inboundResults.wantedListings.updated +
                inboundResults.offers.updated;
            const totalInboundFailed =
                inboundResults.accounts.failed +
                inboundResults.contacts.failed +
                inboundResults.haulageOffers.failed +
                inboundResults.leads.failed +
                inboundResults.listings.failed +
                inboundResults.wantedListings.failed +
                inboundResults.offers.failed;

            // Only log summary if there were records processed
            if (totalRecords > 0 || totalInboundUpdated > 0) {
                const endTime = Date.now();
                const duration = ((endTime - startTime) / 1000).toFixed(1);

                // Build breakdown of synced objects
                const breakdown = [
                    companyResults.total > 0 ? `Companies:${companyResults.successful}/${companyResults.total}` : null,
                    userResults.total > 0 ? `Users:${userResults.successful}/${userResults.total}` : null,
                    companyUserResults.total > 0
                        ? `Contacts:${companyUserResults.successful}/${companyUserResults.total}`
                        : null,
                    listingResults.total > 0 ? `Listings:${listingResults.successful}/${listingResults.total}` : null,
                    offerResults.total > 0 ? `Offers:${offerResults.successful}/${offerResults.total}` : null,
                    haulageOfferResults.total > 0
                        ? `HaulageOffers:${haulageOfferResults.successful}/${haulageOfferResults.total}`
                        : null,
                    haulageLoadResults.total > 0
                        ? `HaulageLoads:${haulageLoadResults.successful}/${haulageLoadResults.total}`
                        : null,
                    companyDocResults.total > 0
                        ? `CompanyDocs:${companyDocResults.successful}/${companyDocResults.total}`
                        : null,
                    locationDocResults.total > 0
                        ? `LocationDocs:${locationDocResults.successful}/${locationDocResults.total}`
                        : null,
                    documentsSuccessful + documentsFailed > 0
                        ? `HaulageDocs:${documentsSuccessful}/${documentsSuccessful + documentsFailed}`
                        : null,
                ]
                    .filter(Boolean)
                    .join(' | ');

                // Single line log with all info
                const skippedInfo = totalSkipped > 0 ? ` (${totalSkipped} skipped)` : '';
                if (totalFailed > 0) {
                    SalesforceLogger.warn(
                        `⚠️  SF sync: ${totalSuccessful}/${totalRecords} in ${duration}s [${breakdown}] (${totalFailed} failed)${skippedInfo}`,
                    );
                } else {
                    SalesforceLogger.warn(`✅ SF sync: ${totalSuccessful}/${totalRecords} in ${duration}s [${breakdown}]${skippedInfo}`);
                }

                // Log inbound sync results if any
                if (totalInboundUpdated > 0 || totalInboundFailed > 0) {
                    SalesforceLogger.warn(
                        `📥 SF inbound: ${totalInboundUpdated} updated (Accounts:${inboundResults.accounts.updated} Contacts:${inboundResults.contacts.updated} Leads:${inboundResults.leads.updated} HaulageOffers:${inboundResults.haulageOffers.updated} Listings:${inboundResults.listings.updated} WantedListings:${inboundResults.wantedListings.updated} Offers:${inboundResults.offers.updated})${totalInboundFailed > 0 ? ` ${totalInboundFailed} failed` : ''}`,
                    );
                }
            }
            // Silent when no records need syncing - removed noisy log
        } catch (error) {
            SalesforceLogger.error('❌ Error in Salesforce retry cronjob:', error);
        } finally {
            this.isRunning = false;
        }
    }
}
