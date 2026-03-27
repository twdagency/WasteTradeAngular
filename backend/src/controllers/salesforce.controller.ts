import { inject, intercept, Interceptor, InvocationContext, Next, service } from '@loopback/core';
import { get, post, del, param, response, HttpErrors, RestBindings, Request } from '@loopback/rest';
import { repository } from '@loopback/repository';
import { SalesforceBindings } from '../keys/salesforce';
import { SalesforceService } from '../services/salesforce/salesforce.service';
import { SalesforceSyncService } from '../services/salesforce/salesforce-sync.service';
import { HaulageOfferService } from '../services/haulage-offer.service';
import { CompaniesRepository, CompanyLocationsRepository } from '../repositories';
import { IDataResponse } from '../types';
import { EnvironmentEnum } from '../enum';
import { SalesforceErrorHandler, SalesforceLogger } from '../utils/salesforce/salesforce-sync.utils';
import { GENERATED_FIELDS } from '../utils/salesforce/salesforce-required-fields.config';

/** Block mutating SF admin endpoints in production */
const prodGuardInterceptor: Interceptor = async (ctx: InvocationContext, next: Next) => {
    const isProduction = process.env.NODE_ENV === EnvironmentEnum.PRODUCTION;
    if (isProduction) {
        const request = await ctx.get(RestBindings.Http.REQUEST).catch(() => null);
        const method = request?.method?.toUpperCase();
        if (method && method !== 'GET') {
            throw new HttpErrors.Forbidden(
                'Salesforce admin endpoints are disabled in production',
            );
        }
    }
    return next();
};

@intercept(prodGuardInterceptor)
export class SalesforceController {
    constructor(
        @inject(SalesforceBindings.SERVICE)
        private salesforceService: SalesforceService,

        @inject(SalesforceBindings.SYNC_SERVICE)
        private syncService: SalesforceSyncService,

        @service(HaulageOfferService)
        private haulageOfferService: HaulageOfferService,

        @repository(CompaniesRepository)
        private companiesRepository: CompaniesRepository,

        @repository(CompanyLocationsRepository)
        private companyLocationsRepository: CompanyLocationsRepository,
    ) {}

@get('/salesforce/health')
    @response(200, {
        description: 'Check if Salesforce service is available',
    })
    async health(): Promise<{ status: string; timestamp: string; circuitBreaker: unknown; metrics: unknown }> {
        const circuitStatus = this.syncService.getCircuitBreakerStatus();
        const metrics = this.syncService.getMetricsSummary();

        return {
            status: circuitStatus.isOpen ? 'degraded' : 'ok',
            timestamp: new Date().toISOString(),
            circuitBreaker: circuitStatus,
            metrics: metrics,
        };
    }

    @get('/salesforce/check-fields')
    @response(200, {
        description: 'Check for missing required fields across all Salesforce objects',
    })
    async checkFields(): Promise<IDataResponse> {
        try {
            const results = await this.salesforceService.checkMissingFields(GENERATED_FIELDS);
            const missing = results.filter(r => !r.exists);

            return {
                status: missing.length === 0 ? 'success' : 'warning',
                message: missing.length === 0
                    ? 'All required fields exist'
                    : `${missing.length} missing field(s) found`,
                data: {
                    total: results.length,
                    existing: results.filter(r => r.exists).length,
                    missing: missing.length,
                    missingFields: missing.map(r => `${r.object}.${r.field}`),
                    details: results,
                },
            };
        } catch (error) {
            return {
                status: 'error',
                message: SalesforceErrorHandler.extractErrorMessage(error),
                data: {},
            };
        }
    }

    @get('/salesforce/picklist-values/{objectName}')
    @response(200, {
        description: 'Get all picklist values for a Salesforce object',
    })
    async getPicklistValues(@param.path.string('objectName') objectName: string): Promise<IDataResponse> {
        try {
            const picklists = await this.salesforceService.getAllPicklistValues(objectName);
            return {
                status: 'success',
                message: `Picklist values for ${objectName}`,
                data: picklists,
            };
        } catch (error) {
            return {
                status: 'error',
                message: SalesforceErrorHandler.extractErrorMessage(error),
                data: {},
            };
        }
    }

    @get('/salesforce/metrics')
    @response(200, {
        description: 'Get Salesforce sync metrics',
    })
    async getMetrics(): Promise<IDataResponse> {
        return {
            status: 'success',
            message: 'Salesforce sync metrics',
            data: this.syncService.getMetricsSummary(),
        };
    }

    @get('/salesforce/circuit-breaker')
    @response(200, {
        description: 'Get circuit breaker status',
    })
    async getCircuitBreakerStatus(): Promise<IDataResponse> {
        return {
            status: 'success',
            message: 'Circuit breaker status',
            data: this.syncService.getCircuitBreakerStatus(),
        };
    }

    @post('/salesforce/circuit-breaker/reset')
    @response(200, {
        description: 'Reset circuit breaker',
    })
    async resetCircuitBreaker(): Promise<IDataResponse> {
        this.syncService.resetCircuitBreaker();
        return {
            status: 'success',
            message: 'Circuit breaker reset successfully',
            data: this.syncService.getCircuitBreakerStatus(),
        };
    }

    @post('/salesforce/test-sync-all')
    @response(200, {
        description: 'Test sync all object types with 1 record each to verify Salesforce objects exist',
    })
    async testSyncAll(@param.query.boolean('forceSync') forceSync = true): Promise<IDataResponse> {
        const results: Record<string, any> = {};
        const errors: string[] = [];
        const missingObjects: string[] = [];

        // Test each object type with limit=1
        const testCases = [
            { name: 'companies', fn: () => this.syncService.bulkSyncCompanies(forceSync, 1), object: 'Account' },
            { name: 'users', fn: () => this.syncService.bulkSyncUsersAsLeads(forceSync, 1), object: 'Lead' },
            { name: 'listings', fn: () => this.syncService.syncAllListings(forceSync, 1), object: 'Sales_Listing__c' },
            {
                name: 'wantedListings',
                fn: () => this.syncService.syncAllWantedListings(forceSync, 1),
                object: 'Wanted_Listings__c',
            },
            { name: 'offers', fn: () => this.syncService.syncAllOffers(forceSync, 1), object: 'Offers__c' },
            {
                name: 'haulageOffers',
                fn: () => this.syncService.syncAllHaulageOffers(forceSync, 1),
                object: 'Haulage_Offers__c',
            },
            {
                name: 'companyDocuments',
                fn: () => this.syncService.syncAllCompanyDocuments(forceSync, 1),
                object: 'Document__c',
            },
            {
                name: 'locationDocuments',
                fn: () => this.syncService.syncAllLocationDocuments(forceSync, 1),
                object: 'Document__c',
            },
        ];

        for (const test of testCases) {
            try {
                const result = await test.fn();
                results[test.name] = {
                    success: result.successful > 0 || result.skipped > 0,
                    total: result.total,
                    successful: result.successful,
                    failed: result.failed,
                    skipped: result.skipped,
                    customObjectMissing: (result as any).customObjectMissing,
                };

                if ((result as any).customObjectMissing) {
                    missingObjects.push(test.object);
                } else if (result.failed > 0 && result.successful === 0) {
                    errors.push(`${test.name}: ${result.errors?.[0]?.error || 'Unknown error'}`);
                }
            } catch (error) {
                results[test.name] = {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
                errors.push(`${test.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        const allSuccess = Object.values(results).every((r: any) => r.success);

        return {
            status: allSuccess ? 'success' : missingObjects.length > 0 ? 'missing_objects' : 'partial_success',
            message:
                missingObjects.length > 0
                    ? `Missing Salesforce objects: ${missingObjects.join(', ')}`
                    : allSuccess
                      ? 'All object types synced successfully'
                      : `Some syncs failed: ${errors.join('; ')}`,
            data: {
                results,
                summary: {
                    totalTypes: testCases.length,
                    successfulTypes: Object.values(results).filter((r: any) => r.success).length,
                    failedTypes: Object.values(results).filter((r: any) => !r.success).length,
                    missingObjects,
                    errors,
                },
            },
        };
    }

    @get('/salesforce/test-connection')
    @response(200, {
        description: 'Test Salesforce connection',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        connected: { type: 'boolean' },
                    },
                },
            },
        },
    })
    async testConnection(): Promise<IDataResponse> {
        try {
            const isConnected = await this.salesforceService.testConnection();
            // Salesforce connection test completed

            return {
                status: 'success',
                message: isConnected ? 'Successfully connected to Salesforce' : 'Failed to connect to Salesforce',
                data: { connected: isConnected },
            };
        } catch (error) {
            SalesforceLogger.error('Error testing Salesforce connection', error);

            return {
                status: 'error',
                message: 'Error testing Salesforce connection',
                data: { connected: false, error: SalesforceErrorHandler.extractErrorMessage(error) },
            };
        }
    }

    @post('/salesforce/sync/companies')
    @response(200, {
        description: 'Sync all companies to Salesforce',
    })
    async syncAllCompanies(
        @param.query.boolean('forceSync') forceSync = false,
        @param.query.number('limit') limit?: number,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.bulkSyncCompanies(forceSync, limit);
            return {
                status: 'success',
                message: `Synced ${result.successful}/${result.total} companies successfully (${result.skipped} skipped)`,
                data: result,
            };
        } catch (error) {
            SalesforceLogger.error('Error syncing companies', error);
            return {
                status: 'error',
                message: 'Error syncing companies',
                data: { error: SalesforceErrorHandler.extractErrorMessage(error) },
            };
        }
    }

    @post('/salesforce/sync/company/{id}')
    @response(200, {
        description: 'Sync specific company to Salesforce',
    })
    async syncCompany(
        @param.path.number('id') companyId: number,
        @param.query.boolean('forceSync') forceSync = false,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncCompany(companyId, forceSync);
            return {
                status: result.success ? 'success' : 'error',
                message: result.success ? 'Company synced successfully' : `Sync failed: ${result.error}`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing company',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/users')
    @response(200, {
        description: 'Sync all users to Salesforce as Leads',
    })
    async syncAllUsers(
        @param.query.boolean('forceSync') forceSync = false,
        @param.query.number('limit') limit?: number,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.bulkSyncUsersAsLeads(forceSync, limit);
            return {
                status: 'success',
                message: `Synced ${result.successful}/${result.total} users successfully (${result.skipped} skipped)`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing users',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/user/{id}')
    @response(200, {
        description: 'Sync specific user to Salesforce as Lead',
    })
    async syncUser(
        @param.path.number('id') userId: number,
        @param.query.boolean('forceSync') forceSync = false,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncUserAsLead(userId, forceSync);
            return {
                status: result.success ? 'success' : 'error',
                message: result.success ? 'User synced successfully' : `Sync failed: ${result.error}`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing user',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/convert-lead/{userId}')
    @response(200, {
        description: 'Convert Lead to Account and Contact',
    })
    async convertLead(@param.path.number('userId') userId: number): Promise<IDataResponse> {
        try {
            const result = await this.syncService.convertLeadToAccountContact(userId);
            // Lead conversion completed - only log if failed
            if (!result.success) {
                SalesforceLogger.error('Lead conversion failed', result.error, { userId });
            }
            return {
                status: result.success ? 'success' : 'error',
                message: result.success
                    ? 'Lead converted successfully'
                    : `Conversion failed: ${JSON.stringify(result.error)}`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error converting lead',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/company-users')
    @response(200, {
        description: 'Sync all company users (memberships) to Salesforce as Contacts',
    })
    async syncAllCompanyUsers(
        @param.query.boolean('forceSync') forceSync = false,
        @param.query.number('limit') limit?: number,
    ): Promise<IDataResponse> {
        try {
            const where: Record<string, unknown> = {};
            if (limit) {
                where.limit = limit;
            }
            const result = await this.syncService.syncCompanyUsersByFilter(where, forceSync);
            return {
                status: 'success',
                message: `Synced ${result.successful}/${result.total} contacts successfully (${result.skipped} skipped)`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing company users',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/company-user/{id}')
    @response(200, {
        description: 'Sync specific company user (membership) to Salesforce as Contact',
    })
    async syncCompanyUser(
        @param.path.number('id') companyUserId: number,
        @param.query.boolean('forceSync') forceSync = false,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncCompanyUser(companyUserId, forceSync);
            return {
                status: result.success ? 'success' : 'error',
                message: result.success ? 'Contact synced successfully' : `Sync failed: ${result.error}`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing company user',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/listing/{id}')
    @response(200, {
        description: 'Sync specific listing to Salesforce',
    })
    async syncListing(
        @param.path.number('id') listingId: number,
        @param.query.boolean('forceSync') forceSync = false,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncListing(listingId, forceSync);
            return {
                status: result.success ? 'success' : 'error',
                message: result.success ? 'Listing synced successfully' : `Sync failed: ${result.error}`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing listing',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/all')
    @response(200, {
        description: 'Sync all data to Salesforce (companies, users, listings, offers, documents)',
    })
    async syncAll(
        @param.query.boolean('forceSync') forceSync = false,
        @param.query.number('limit') limit?: number,
    ): Promise<IDataResponse> {
        try {
            // Starting full Salesforce sync - only log if errors occur

            // Sync all data types in logical order
            // 1. Companies (Accounts) first — Contacts depend on Accounts existing
            const companyResults = await this.syncService.bulkSyncCompanies(forceSync, limit);
            // 2. Users as Leads
            const userResults = await this.syncService.bulkSyncUsersAsLeads(forceSync, limit);
            // 3. Company Users as Contacts (only ACTIVE, depends on Accounts)
            const companyUserResults = await this.syncService.syncCompanyUsersByFilter({}, forceSync);
            // 4. Everything else
            const listingResults = await this.syncService.syncAllListings(forceSync, limit);
            const offerResults = await this.syncService.syncAllOffers(forceSync, limit);
            const companyDocResults = await this.syncService.syncAllCompanyDocuments(forceSync, limit);
            const locationDocResults = await this.syncService.syncAllLocationDocuments(forceSync, limit);

            // Calculate totals
            const totalRecords =
                companyResults.total +
                userResults.total +
                companyUserResults.total +
                listingResults.total +
                offerResults.total +
                companyDocResults.total +
                locationDocResults.total;
            const totalSuccessful =
                companyResults.successful +
                userResults.successful +
                companyUserResults.successful +
                listingResults.successful +
                offerResults.successful +
                companyDocResults.successful +
                locationDocResults.successful;
            const totalFailed =
                companyResults.failed +
                userResults.failed +
                companyUserResults.failed +
                listingResults.failed +
                offerResults.failed +
                companyDocResults.failed +
                locationDocResults.failed;
            const totalSkipped =
                companyResults.skipped +
                userResults.skipped +
                companyUserResults.skipped +
                listingResults.skipped +
                offerResults.skipped +
                companyDocResults.skipped +
                locationDocResults.skipped;

            // Full sync completed - only log if there were failures
            if (totalFailed > 0) {
                SalesforceLogger.error(`Full sync completed with ${totalFailed} failures`, undefined, {
                    totalRecords,
                    totalSuccessful,
                    totalFailed,
                    totalSkipped,
                    forceSync,
                    limit,
                });
            }

            return {
                status: totalFailed === 0 ? 'success' : 'partial_success',
                message: `Full sync completed: ${totalSuccessful}/${totalRecords} successful, ${totalFailed} failed, ${totalSkipped} skipped`,
                data: {
                    summary: {
                        total: totalRecords,
                        successful: totalSuccessful,
                        failed: totalFailed,
                        skipped: totalSkipped,
                        forceSync,
                        limit: limit ?? 'none',
                    },
                    companies: companyResults,
                    users: userResults,
                    companyUsers: companyUserResults,
                    listings: listingResults,
                    offers: offerResults,
                    companyDocuments: companyDocResults,
                    locationDocuments: locationDocResults,
                },
            };
        } catch (error) {
            SalesforceLogger.error('Error during full sync', error, { forceSync, limit });
            return {
                status: 'error',
                message: 'Error during full sync',
                data: { error: SalesforceErrorHandler.extractErrorMessage(error) },
            };
        }
    }

    @get('/salesforce/sync/logs')
    @response(200, {
        description: 'Get sync logs for a specific record',
    })
    async getSyncLogs(@param.query.string('objectType') objectType?: string): Promise<IDataResponse> {
        try {
            const logs = await this.syncService.getSyncLogs(objectType);
            return {
                status: 'success',
                message: `Found ${logs.length} sync logs`,
                data: logs,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error retrieving sync logs',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @get('/salesforce/sync/failed')
    @response(200, {
        description: 'Get failed sync operations that need retry',
    })
    async getFailedSyncs(): Promise<IDataResponse> {
        try {
            const failedSyncs = await this.syncService.getFailedSyncs();
            return {
                status: 'success',
                message: `Found ${failedSyncs.length} failed sync operations`,
                data: failedSyncs,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error retrieving failed sync operations',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @del('/salesforce/sync/failed')
    @response(200, {
        description: 'Clear all failed sync logs',
    })
    async clearFailedSyncs(): Promise<IDataResponse> {
        try {
            const result = await this.syncService.clearFailedSyncs();
            return {
                status: 'success',
                message: `Cleared ${result.count} failed sync logs`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error clearing failed sync logs',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/offers/{offerId}')
    @response(200, {
        description: 'Sync specific offer to Salesforce',
    })
    async syncOffer(
        @param.path.number('offerId') offerId: number,
        @param.query.boolean('forceSync') forceSync = false,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncOffer(offerId, forceSync);
            return {
                status: result.success ? 'success' : 'error',
                message: result.success ? 'Offer synced successfully' : 'Offer sync failed',
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing offer',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/offers')
    @response(200, {
        description: 'Sync all offers to Salesforce',
    })
    async syncAllOffers(
        @param.query.boolean('forceSync') forceSync = false,
        @param.query.number('limit') limit?: number,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncAllOffers(forceSync, limit);
            return {
                status: 'success',
                message: `Synced ${result.successful} offers, ${result.failed} failed, ${result.skipped} skipped`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing offers',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/haulage-offers/{haulageOfferId}')
    @response(200, {
        description: 'Sync specific haulage offer to Salesforce',
    })
    async syncHaulageOffer(
        @param.path.number('haulageOfferId') haulageOfferId: number,
        @param.query.boolean('forceSync') forceSync = false,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncHaulageOffer(haulageOfferId, forceSync);
            return {
                status: result.success ? 'success' : 'error',
                message: result.success ? 'Haulage offer synced successfully' : 'Haulage offer sync failed',
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing haulage offer',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/haulage-offers')
    @response(200, {
        description: 'Sync all haulage offers to Salesforce',
    })
    async syncAllHaulageOffers(
        @param.query.boolean('forceSync') forceSync = false,
        @param.query.number('limit') limit?: number,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncAllHaulageOffers(forceSync, limit);
            return {
                status: 'success',
                message: `Synced ${result.successful} haulage offers, ${result.failed} failed, ${result.skipped} skipped`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing haulage offers',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/haulage-load/{loadId}')
    @response(200, {
        description: 'Sync specific haulage load to Salesforce',
    })
    async syncHaulageLoad(
        @param.path.number('loadId') loadId: number,
        @param.query.boolean('forceSync') forceSync = false,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncHaulageLoad(loadId, forceSync);
            return {
                status: result.success ? 'success' : 'error',
                message: result.success ? 'Haulage load synced successfully' : 'Haulage load sync failed',
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing haulage load',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/haulage-loads')
    @response(200, {
        description: 'Sync all haulage loads to Salesforce',
    })
    async syncAllHaulageLoads(
        @param.query.boolean('forceSync') forceSync = false,
        @param.query.number('limit') limit?: number,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncHaulageLoadsByFilter({}, forceSync);
            return {
                status: 'success',
                message: `Synced ${result.successful} haulage loads, ${result.failed} failed, ${result.skipped} skipped`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing haulage loads',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/pull/haulage-loads/{haulageOfferId}')
    @response(200, {
        description: 'Pull haulage load updates from Salesforce to WasteTrade',
    })
    async pullHaulageLoadsFromSalesforce(
        @param.path.number('haulageOfferId') haulageOfferId: number,
    ): Promise<IDataResponse> {
        try {
            // Force sync = true to always pull latest data from SF
            await this.haulageOfferService.syncHaulageLoadsFromSalesforce(haulageOfferId, true);

            // Return updated loads
            const result = await this.haulageOfferService.getLoadsForHaulageOffer(haulageOfferId);
            return {
                status: 'success',
                message: `Pulled load updates from Salesforce for haulage offer ${haulageOfferId}`,
                data: result.data,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error pulling haulage loads from Salesforce',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/pull-updates')
    @response(200, {
        description: 'Pull all updates from Salesforce to WasteTrade (Accounts, Contacts, Haulage Offers)',
    })
    async pullUpdatesFromSalesforce(
        @param.query.number('sinceMinutes') sinceMinutes = 60,
        @param.query.boolean('forceAll') forceAll = false,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.pullUpdatesFromSalesforce(sinceMinutes, forceAll);
            const totalUpdated = result.accounts.updated + result.contacts.updated + result.haulageOffers.updated;
            const totalFailed = result.accounts.failed + result.contacts.failed + result.haulageOffers.failed;

            return {
                status: totalFailed === 0 ? 'success' : 'partial_success',
                message: `Pulled ${totalUpdated} updates from Salesforce (${totalFailed} failed)`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error pulling updates from Salesforce',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/pull/haulage-offer/{haulageOfferId}')
    @response(200, {
        description: 'Pull single haulage offer updates from Salesforce to WasteTrade',
    })
    async pullSingleHaulageOffer(
        @param.path.number('haulageOfferId') haulageOfferId: number,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.pullSingleHaulageOfferFromSalesforce(haulageOfferId);
            return {
                status: result.success ? 'success' : 'error',
                message: result.success ? `Haulage offer ${haulageOfferId} updated from Salesforce` : result.error || 'Failed to pull',
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error pulling haulage offer from Salesforce',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/documents/company/{documentId}')
    @response(200, {
        description: 'Sync specific company document to Salesforce',
    })
    async syncCompanyDocument(
        @param.path.number('documentId') documentId: number,
        @param.query.boolean('forceSync') forceSync = false,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncCompanyDocument(documentId, forceSync);
            return {
                status: result.success ? 'success' : 'error',
                message: result.success ? 'Document synced successfully' : 'Document sync failed',
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing document',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/documents/company')
    @response(200, {
        description: 'Sync all company documents to Salesforce',
    })
    async syncAllCompanyDocuments(@param.query.boolean('forceSync') forceSync = false): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncAllCompanyDocuments(forceSync);
            return {
                status: 'success',
                message: `Synced ${result.successful} documents, ${result.failed} failed, ${result.skipped} skipped`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing company documents',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/documents/location/{documentId}')
    @response(200, {
        description: 'Sync specific location document to Salesforce',
    })
    async syncLocationDocument(
        @param.path.number('documentId') documentId: number,
        @param.query.boolean('forceSync') forceSync = false,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncLocationDocument(documentId, forceSync);
            return {
                status: result.success ? 'success' : 'error',
                message: result.success ? 'Document synced successfully' : 'Document sync failed',
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing location document',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/documents/location')
    @response(200, {
        description: 'Sync all location documents to Salesforce',
    })
    async syncAllLocationDocuments(@param.query.boolean('forceSync') forceSync = false): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncAllLocationDocuments(forceSync);
            return {
                status: 'success',
                message: `Synced ${result.successful} location documents, ${result.failed} failed, ${result.skipped} skipped`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing location documents',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/wanted-listing/{listingId}')
    @response(200, {
        description: 'Sync specific wanted listing to Salesforce',
    })
    async syncWantedListing(
        @param.path.number('listingId') listingId: number,
        @param.query.boolean('forceSync') forceSync = false,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncWantedListing(listingId, forceSync);
            return {
                status: result.success ? 'success' : 'error',
                message: result.success ? 'Wanted listing synced successfully' : 'Wanted listing sync failed',
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing wanted listing',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/all-listings')
    @response(200, {
        description: 'Sync all listings (both regular and wanted) to Salesforce',
    })
    async syncAllListings(
        @param.query.boolean('forceSync') forceSync = false,
        @param.query.number('limit') limit?: number,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncAllListings(forceSync, limit);
            return {
                status: 'success',
                message: `Synced ${result.successful} listings, ${result.failed} failed, ${result.skipped} skipped`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing all listings',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/all-wanted-listings')
    @response(200, {
        description: 'Sync all wanted listings to Salesforce',
    })
    async syncAllWantedListings(
        @param.query.boolean('forceSync') forceSync = false,
        @param.query.number('limit') limit?: number,
    ): Promise<IDataResponse> {
        try {
            const result = await this.syncService.syncAllWantedListings(forceSync, limit);
            return {
                status: 'success',
                message: `Synced ${result.successful} wanted listings, ${result.failed} failed, ${result.skipped} skipped`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing all wanted listings',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/sync/modified-after')
    @response(200, {
        description: 'Sync records modified after a specific date',
    })
    async syncRecordsModifiedAfter(
        @param.query.string('modifiedAfter') modifiedAfterParam?: string,
        @param.query.string('recordType')
        recordType:
            | 'companies'
            | 'users'
            | 'listings'
            | 'offers'
            | 'company_documents'
            | 'location_documents' = 'companies',
        @param.query.boolean('forceSync') forceSync = false,
    ): Promise<IDataResponse> {
        try {
            // Default to today if no date provided
            const modifiedAfter = modifiedAfterParam
                ? new Date(modifiedAfterParam)
                : new Date(new Date().setHours(0, 0, 0, 0)); // Start of today

            // Validate date
            if (isNaN(modifiedAfter.getTime())) {
                return {
                    status: 'error',
                    message: 'Invalid date format. Please use ISO date format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)',
                    data: {},
                };
            }

            const result = await this.syncService.syncRecordsModifiedAfter(modifiedAfter, recordType, forceSync);
            return {
                status: 'success',
                message: `Synced ${result.successful}/${result.total} ${recordType} successfully`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error syncing records',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/cleanup/pending-companies')
    @response(200, {
        description:
            'Cleanup Accounts in Salesforce for companies that are still PENDING (created before verification fix)',
    })
    async cleanupPendingCompanyAccounts(): Promise<IDataResponse> {
        try {
            const result = await this.syncService.cleanupPendingCompanyAccounts();
            return {
                status: 'success',
                message: `Cleanup completed: ${result.found} pending companies found, ${result.deleted} Accounts deleted, ${result.failed} failures`,
                data: result,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error during cleanup',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @post('/salesforce/trigger-cron')
    @response(200, {
        description: 'Manually trigger the Salesforce sync cron job (same logic as 10-minute cron)',
    })
    async triggerCron(): Promise<IDataResponse> {
        try {
            const startTime = Date.now();

            // Check circuit breaker
            const circuitStatus = this.syncService.getCircuitBreakerStatus();
            if (circuitStatus.isOpen) {
                return {
                    status: 'error',
                    message: 'Circuit breaker is open - Salesforce unavailable',
                    data: circuitStatus,
                };
            }

            // Check connection
            const isConnected = await this.syncService.checkSalesforceConnection();
            if (!isConnected) {
                return {
                    status: 'error',
                    message: 'Salesforce connection not available',
                    data: { connected: false },
                };
            }

            // Sync records modified in last 10 minutes or not synced yet
            const tenMinutesAgo = new Date(Date.now() - 1000 * 60 * 10);
            const where = {
                or: [
                    { isSyncedSalesForce: false },
                    { lastSyncedSalesForceDate: null },
                    { salesforceId: null },
                    { updatedAt: { gte: tenMinutesAgo } },
                ],
            };

            const [
                companyResults,
                userResults,
                listingResults,
                offerResults,
                haulageOfferResults,
                companyDocResults,
                locationDocResults,
            ] = await Promise.all([
                this.syncService.syncCompaniesByFilter(where),
                this.syncService.syncUsersByFilter(where),
                this.syncService.syncListingsByFilter(where),
                this.syncService.syncOffersByFilter(where),
                this.syncService.syncHaulageOffersByFilter(where),
                this.syncService.syncCompanyDocumentsByFilter(where),
                this.syncService.syncLocationDocumentsByFilter(where),
            ]);

            const totalRecords =
                companyResults.total +
                userResults.total +
                listingResults.total +
                offerResults.total +
                haulageOfferResults.total +
                companyDocResults.total +
                locationDocResults.total;
            const totalSuccessful =
                companyResults.successful +
                userResults.successful +
                listingResults.successful +
                offerResults.successful +
                haulageOfferResults.successful +
                companyDocResults.successful +
                locationDocResults.successful;
            const totalFailed =
                companyResults.failed +
                userResults.failed +
                listingResults.failed +
                offerResults.failed +
                haulageOfferResults.failed +
                companyDocResults.failed +
                locationDocResults.failed;

            const duration = (Date.now() - startTime) / 1000;

            return {
                status: totalFailed === 0 ? 'success' : 'partial_success',
                message: `Cron sync completed: ${totalSuccessful}/${totalRecords} synced, ${totalFailed} failed in ${duration}s`,
                data: {
                    summary: {
                        total: totalRecords,
                        successful: totalSuccessful,
                        failed: totalFailed,
                        duration: `${duration}s`,
                    },
                    companies: companyResults,
                    users: userResults,
                    listings: listingResults,
                    offers: offerResults,
                    haulageOffers: haulageOfferResults,
                    companyDocuments: companyDocResults,
                    locationDocuments: locationDocResults,
                },
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error triggering cron sync',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @get('/salesforce/haulage-offers/{id}/documents')
    @response(200, {
        description: 'Get documents for a haulage offer from Salesforce (for testing)',
    })
    async getHaulageOfferDocuments(@param.path.number('id') haulageOfferId: number): Promise<IDataResponse> {
        try {
            const envPrefix = process.env.ENVIRONMENT || 'DEV';
            const externalId = `${envPrefix}_${haulageOfferId}`;

            const docs = await this.salesforceService.queryHaulageOfferDocuments(externalId);

            return {
                status: 'success',
                message: `Found ${docs.length} documents`,
                data: docs,
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Error querying documents',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }

    @del('/salesforce/haulage-loads')
    @response(200, {
        description: 'Delete all haulage loads from WT database and Salesforce (non-production only)',
    })
    async deleteAllHaulageLoads(): Promise<IDataResponse> {
        const env = (process.env.ENVIRONMENT ?? process.env.NODE_ENV ?? '').toLowerCase();
        if (env !== 'dev' && env !== 'development') {
            throw new HttpErrors.Forbidden('This endpoint is only available in the dev environment');
        }

        try {
            const result = await this.syncService.deleteAllHaulageLoads();

            return {
                status: 'success',
                message: `Deleted ${result.db.deleted} loads, created ${result.db.created} new loads, deleted ${result.sf.deleted} SF records (${result.sf.errors} errors), updated ${result.offersUpdated} offers`,
                data: result,
            };
        } catch (error) {
            SalesforceLogger.error('[Cleanup] Haulage loads cleanup failed', error);
            return {
                status: 'error',
                message: 'Error deleting haulage loads',
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            };
        }
    }
}
