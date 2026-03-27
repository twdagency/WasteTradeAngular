/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BindingScope, inject, injectable } from '@loopback/core';
import { HttpErrors } from '@loopback/rest';
import * as jsforce from 'jsforce';
import { SalesforceBindings } from '../../keys/salesforce';
import { SalesforceConfig, SyncResult } from '../../types/salesforce';
import { SalesforceErrorHandler, SalesforceLogger } from '../../utils/salesforce/salesforce-sync.utils';

@injectable({ scope: BindingScope.TRANSIENT })
export class SalesforceService {
    private connection: jsforce.Connection | null = null;
    private isConnecting = false;
    private connectionSemaphore = 0;
    private readonly maxConcurrentRequests = 10; // Limit concurrent requests per connection

    constructor(
        @inject(SalesforceBindings.CONFIG)
        private config: SalesforceConfig,
    ) {}

    /**
     * Sleep utility for retry delays
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Check if error is retryable
     */
    private isRetryableError(error: any): boolean {
        const retryableErrors = [
            'ECONNRESET',
            'ECONNREFUSED',
            'ETIMEDOUT',
            'ENOTFOUND',
            'SOCKET_TIMEOUT',
            'REQUEST_TIMEOUT',
        ];

        const errorMessage = error?.message?.toUpperCase() || '';
        const errorCode = error?.code?.toUpperCase() || '';

        return retryableErrors.some(
            (retryableError) => errorMessage.includes(retryableError) || errorCode.includes(retryableError),
        );
    }

    /**
     * Execute operation with retry logic (silent retries, only log final failure)
     */
    private async executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
        let lastError: any;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;

                if (attempt === maxRetries || !this.isRetryableError(error)) {
                    // Only log on final failure
                    if (attempt > 1) {
                        SalesforceLogger.warn(`Operation failed after ${attempt} attempts`, {
                            totalAttempts: attempt,
                            error: SalesforceErrorHandler.extractErrorMessage(error),
                        });
                    }
                    throw error;
                }

                // Silent retry - no logging during intermediate attempts
                const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
                await this.sleep(delay);

                // Reset connection on connection errors
                if (this.isRetryableError(error)) {
                    this.connection = null;
                }
            }
        }

        throw lastError;
    }

    /**
     * Initialize connection to Salesforce
     */
    async connect(): Promise<void> {
        if (this.isConnecting) {
            // Wait for existing connection attempt with timeout (15s max)
            const maxWait = 15000;
            const start = Date.now();
            while (this.isConnecting) {
                if (Date.now() - start > maxWait) {
                    throw new HttpErrors.ServiceUnavailable('Salesforce connection timeout - another connection attempt is hanging');
                }
                await this.sleep(500);
            }
            return;
        }

        try {
            this.isConnecting = true;

            if (!this.config.syncEnabled) {
                SalesforceLogger.warn('Salesforce sync is disabled');
                return;
            }

            // Use sandbox URL if provided, otherwise production
            const loginUrl = this.config.sandboxUrl || this.config.productionUrl || 'https://login.salesforce.com';

            this.connection = new jsforce.Connection({
                loginUrl,
                version: this.config.apiVersion ?? '58.0',
            });

            // Login with username, password + security token
            await this.connection.login(this.config.username, this.config.password + this.config.securityToken);

            SalesforceLogger.info('Successfully connected to Salesforce');
        } catch (error) {
            SalesforceLogger.error('Failed to connect to Salesforce', error, {
                username: this.config.username,
                hasPassword: !!this.config.password,
                hasToken: !!this.config.securityToken,
            });
            this.connection = null;
            throw new HttpErrors.ServiceUnavailable('Salesforce connection failed');
        } finally {
            this.isConnecting = false;
        }
    }

    /**
     * Check if Salesforce connection is available and healthy
     */
    async isConnected(): Promise<boolean> {
        try {
            // If no connection exists, try to establish one
            if (!this.connection) {
                await this.connect();
            }

            // If still no connection after connect attempt, return false
            if (!this.connection) {
                return false;
            }

            // Test connection with a simple query
            await this.connection.query('SELECT Id FROM User LIMIT 1');
            return true;
        } catch (error) {
            SalesforceLogger.warn('Salesforce connection check failed', {
                error: SalesforceErrorHandler.extractErrorMessage(error),
                username: this.config.username,
            });
            this.connection = null;
            return false;
        }
    }

    /**
     * Get Salesforce object type from record ID prefix
     * Common prefixes: Lead = 00Q, Contact = 003, Account = 001
     */
    private getObjectTypeFromId(recordId: string): string | null {
        if (!recordId || recordId.length < 3) return null;

        const prefix = recordId.substring(0, 3);
        const prefixMap: Record<string, string> = {
            '00Q': 'Lead',
            '003': 'Contact',
            '001': 'Account',
            '006': 'Opportunity',
        };

        return prefixMap[prefix] || null;
    }

    /**
     * Ensure connection is established
     * Ensure connection is established with concurrency control
     */
    private async ensureConnection(): Promise<jsforce.Connection> {
        // Wait if too many concurrent requests
        while (this.connectionSemaphore >= this.maxConcurrentRequests) {
            await this.sleep(50); // Wait 50ms before checking again
        }

        if (!this.connection) {
            await this.connect();
        }

        if (!this.connection) {
            throw new HttpErrors.ServiceUnavailable('Salesforce connection not available');
        }

        // Increment semaphore to track concurrent usage
        this.connectionSemaphore++;

        return this.connection;
    }

    /**
     * Release connection semaphore after operation
     */
    private releaseConnection(): void {
        if (this.connectionSemaphore > 0) {
            this.connectionSemaphore--;
        }
    }

    /**
     * Create a record in Salesforce
     */
    async createRecord(objectType: string, data: Record<string, any>, suppressErrorLog = false): Promise<SyncResult> {
        try {
            return await this.executeWithRetry(async () => {
                const conn = await this.ensureConnection();
                try {
                    const result = await conn.sobject(objectType).create(data);

                    // jsforce returns an array for single records, so we need to handle both cases
                    const resultArray = Array.isArray(result) ? result : [result];
                    const firstResult = resultArray[0];

                    if (firstResult.success) {
                        return {
                            success: true,
                            salesforceId: firstResult.id,
                        };
                    } else {
                        return {
                            success: false,
                            error: firstResult.errors?.join(', ') ?? 'Unknown error',
                        };
                    }
                } finally {
                    this.releaseConnection();
                }
            });
        } catch (error) {
            // Semaphore already released by finally block above — do not release again
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error creating ${objectType}`, error, { objectType, data });
            }
            return {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };
        }
    }

    /**
     * Update a record in Salesforce
     */
    async updateRecord(
        objectType: string,
        id: string,
        data: Record<string, any>,
        suppressErrorLog = false,
    ): Promise<SyncResult> {
        try {
            const conn = await this.ensureConnection();
            try {
                const result = await conn.sobject(objectType).update({ Id: id, ...data });

                // jsforce returns an array for single records, so we need to handle both cases
                const resultArray = Array.isArray(result) ? result : [result];
                const firstResult = resultArray[0];

                if (firstResult.success) {
                    return {
                        success: true,
                        salesforceId: firstResult.id,
                    };
                } else {
                    return {
                        success: false,
                        error: firstResult.errors?.join(', ') ?? 'Unknown error',
                    };
                }
            } finally {
                this.releaseConnection();
            }
        } catch (error) {
            // Semaphore already released by finally block above — do not release again
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error updating ${objectType}`, error, { objectType, id, data });
            }
            return {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };
        }
    }

    /**
     * Delete a record in Salesforce
     */
    async deleteRecord(objectType: string, id: string, suppressErrorLog = false): Promise<SyncResult> {
        try {
            const conn = await this.ensureConnection();
            try {
                const result = await conn.sobject(objectType).destroy(id);

                if (result.success) {
                    return {
                        success: true,
                        salesforceId: result.id,
                    };
                } else {
                    return {
                        success: false,
                        error: result.errors?.join(', ') || 'Unknown error',
                    };
                }
            } finally {
                this.releaseConnection();
            }
        } catch (error) {
            // Semaphore already released by finally block above — do not release again
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error deleting ${objectType}`, error, { objectType, id });
            }
            return {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };
        }
    }

    /**
     * Bulk delete records from Salesforce by querying and destroying in batches.
     * Uses SOQL to find records, then destroys in batches of 200 (SF API limit).
     */
    async bulkDeleteByQuery(
        objectType: string,
        soqlWhereClause: string,
    ): Promise<{ deleted: number; errors: number }> {
        let totalDeleted = 0;
        let totalErrors = 0;
        let hasMore = true;

        while (hasMore) {
            const conn = await this.ensureConnection();
            try {
                const result = await conn.query(
                    `SELECT Id FROM ${objectType} WHERE ${soqlWhereClause} LIMIT 200`,
                );
                const records = result.records as Array<{ Id: string }>;

                if (records.length === 0) {
                    hasMore = false;
                    break;
                }

                const ids = records.map(r => r.Id);
                const deleteResult = await conn.sobject(objectType).destroy(ids);
                const results = Array.isArray(deleteResult) ? deleteResult : [deleteResult];

                for (const r of results) {
                    if (r.success) totalDeleted++;
                    else totalErrors++;
                }

                SalesforceLogger.info(`Bulk delete batch: ${totalDeleted} deleted, ${totalErrors} errors`, {
                    objectType,
                });

                // If we got fewer than 200, no more records
                if (records.length < 200) {
                    hasMore = false;
                }
            } finally {
                this.releaseConnection();
            }
        }

        return { deleted: totalDeleted, errors: totalErrors };
    }

    /**
     * Find a record by external ID
     */
    async findByExternalId(
        objectType: string,
        externalIdField: string,
        externalId: string,
        suppressErrorLog = false,
    ): Promise<any> {
        try {
            const conn = await this.ensureConnection();
            try {
                const result = await conn.sobject(objectType).find({ [externalIdField]: externalId });
                return result.length > 0 ? result[0] : null;
            } finally {
                this.releaseConnection();
            }
        } catch (error) {
            // Semaphore already released by finally block above — do not release again
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error finding ${objectType} by external ID`, error, {
                    objectType,
                    externalIdField,
                    externalId,
                });
            }
            return null;
        }
    }

    /**
     * Upsert a record (update if exists, create if not)
     * With automatic field stripping on "resource does not exist" errors
     */
    async upsertRecord(
        objectType: string,
        externalIdField: string,
        data: Record<string, any>,
        suppressErrorLog = false,
    ): Promise<SyncResult> {
        try {
            const conn = await this.ensureConnection();
            try {
                const result = await conn.sobject(objectType).upsert(data, externalIdField);

                // jsforce returns an array for single records, so we need to handle both cases
                const resultArray = Array.isArray(result) ? result : [result];
                const firstResult = resultArray[0];

                if (firstResult.success) {
                    return {
                        success: true,
                        salesforceId: firstResult.id,
                    };
                } else {
                    return {
                        success: false,
                        error: firstResult.errors?.join(', ') ?? 'Unknown error',
                    };
                }
            } finally {
                this.releaseConnection();
            }
        } catch (error) {
            // Semaphore already released by finally block above — do not release again

            // Check if error is due to a specific missing/invalid field
            const errorMessage = SalesforceErrorHandler.extractErrorMessage(error);
            if (
                errorMessage.includes('No such column') ||
                errorMessage.includes('INVALID_FIELD')
            ) {
                // Retry by stripping only the problematic field, not all custom fields
                const problemField = this.extractProblemField(errorMessage);
                if (problemField) {
                    SalesforceLogger.warn(`Field error detected, retrying without: ${problemField}`, {
                        objectType,
                        problemField,
                        originalError: errorMessage,
                    });
                    return this.upsertWithoutProblemField(objectType, externalIdField, data, problemField, suppressErrorLog);
                }

                // Cannot identify specific field — fall back to standard fields only
                SalesforceLogger.warn(`Field error detected, retrying with standard fields only`, {
                    objectType,
                    originalError: errorMessage,
                });
                return this.upsertWithStandardFieldsOnly(objectType, externalIdField, data, suppressErrorLog);
            }

            if (errorMessage.includes('requested resource does not exist')) {
                SalesforceLogger.warn(`Resource not found, retrying with standard fields only`, {
                    objectType,
                    originalError: errorMessage,
                });
                return this.upsertWithStandardFieldsOnly(objectType, externalIdField, data, suppressErrorLog);
            }

            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error upserting ${objectType}`, error, { objectType, externalIdField, data });
            }

            // Handle duplicate detection errors — retry upsert with allowSave header
            const errorName = (error as any).name || (error as any).errorCode || '';
            if (errorName === 'DUPLICATES_DETECTED') {
                return this.upsertWithDuplicateBypass(objectType, externalIdField, data);
            }

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Retry upsert with Sforce-Duplicate-Rule-Header to bypass duplicate detection rules.
     * Uses raw REST API since jsforce doesn't expose custom headers on SObject.upsert().
     */
    private async upsertWithDuplicateBypass(
        objectType: string,
        externalIdField: string,
        data: Record<string, any>,
    ): Promise<SyncResult> {
        try {
            const conn = await this.ensureConnection();
            try {
                const externalIdValue = data[externalIdField];
                if (!externalIdValue) {
                    SalesforceLogger.error('Missing external ID value for duplicate bypass', null, {
                        objectType,
                        externalIdField,
                    });
                    return { success: false, error: 'Missing external ID value' };
                }

                // Build the body without the external ID field (Salesforce REST API requirement for PATCH upsert)
                const body: Record<string, any> = {};
                for (const [key, value] of Object.entries(data)) {
                    if (key !== externalIdField) {
                        body[key] = value;
                    }
                }

                const url =
                    `/services/data/v${conn.version}/sobjects/${objectType}` +
                    `/${externalIdField}/${encodeURIComponent(String(externalIdValue))}`;

                const response = await conn.request({
                    method: 'PATCH',
                    url,
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json',
                        'Sforce-Duplicate-Rule-Header': 'allowSave=true',
                    },
                });

                // PATCH upsert returns 204 (no body) for updates, or { id, success } for creates
                const resultId = (response as any)?.id;
                SalesforceLogger.info('Duplicate bypass upsert succeeded', { objectType, salesforceId: resultId });
                return { success: true, salesforceId: resultId };
            } finally {
                this.releaseConnection();
            }
        } catch (error) {
            // Semaphore already released by finally block above — do not release again
            const errorMessage = SalesforceErrorHandler.extractErrorMessage(error);
            SalesforceLogger.error('Duplicate bypass upsert failed', error, { objectType });
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Retry upsert with only standard fields (no custom fields ending with __c)
     */
    private async upsertWithStandardFieldsOnly(
        objectType: string,
        externalIdField: string,
        data: Record<string, any>,
        suppressErrorLog = false,
    ): Promise<SyncResult> {
        try {
            // Strip out all custom fields (ending with __c) except the external ID field
            const standardData: Record<string, any> = {};
            for (const [key, value] of Object.entries(data)) {
                if (!key.endsWith('__c') || key === externalIdField) {
                    standardData[key] = value;
                }
            }

            SalesforceLogger.info(`Retrying upsert with ${Object.keys(standardData).length} standard fields`, {
                objectType,
                originalFieldCount: Object.keys(data).length,
                standardFieldCount: Object.keys(standardData).length,
            });

            const conn = await this.ensureConnection();
            try {
                const result = await conn.sobject(objectType).upsert(standardData, externalIdField);

                const resultArray = Array.isArray(result) ? result : [result];
                const firstResult = resultArray[0];

                if (firstResult.success) {
                    SalesforceLogger.info(`Successfully synced with standard fields only`, {
                        objectType,
                        salesforceId: firstResult.id,
                    });
                    return {
                        success: true,
                        salesforceId: firstResult.id,
                    };
                } else {
                    return {
                        success: false,
                        error: firstResult.errors?.join(', ') ?? 'Unknown error',
                    };
                }
            } finally {
                this.releaseConnection();
            }
        } catch (error) {
            // Semaphore already released by finally block above — do not release again
            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error upserting ${objectType} with standard fields`, error, { objectType });
            }
            return {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };
        }
    }

    /**
     * Extract the problematic field name from a Salesforce error message
     */
    private extractProblemField(errorMessage: string): string | null {
        // Pattern: "No such column 'FieldName__c' on sobject of type ObjectName"
        const match = errorMessage.match(/No such column '([^']+)'/);
        if (match) return match[1];

        // Pattern: "Invalid field: ObjectName.FieldName__c"
        const altMatch = errorMessage.match(/Invalid field:?\s*\w*\.?([^\s.]+__c)/i);
        if (altMatch) return altMatch[1];

        return null;
    }

    /**
     * Retry upsert after removing only the specific problematic field
     * Preserves all other custom fields (unlike upsertWithStandardFieldsOnly)
     */
    private async upsertWithoutProblemField(
        objectType: string,
        externalIdField: string,
        data: Record<string, any>,
        problemField: string,
        suppressErrorLog = false,
    ): Promise<SyncResult> {
        try {
            const filteredData: Record<string, any> = {};
            for (const [key, value] of Object.entries(data)) {
                if (key !== problemField) {
                    filteredData[key] = value;
                }
            }

            const conn = await this.ensureConnection();
            try {
                const result = await conn.sobject(objectType).upsert(filteredData, externalIdField);
                const resultArray = Array.isArray(result) ? result : [result];
                const firstResult = resultArray[0];

                if (firstResult.success) {
                    return { success: true, salesforceId: firstResult.id };
                } else {
                    return { success: false, error: firstResult.errors?.join(', ') ?? 'Unknown error' };
                }
            } finally {
                this.releaseConnection();
            }
        } catch (error) {
            // Semaphore already released by finally block above — do not release again

            // If another field error, try removing that field too (recursive, max depth handled by SF)
            const errorMessage = SalesforceErrorHandler.extractErrorMessage(error);
            const anotherProblemField = this.extractProblemField(errorMessage);
            if (anotherProblemField && anotherProblemField !== problemField) {
                SalesforceLogger.warn(`Additional field error, also removing: ${anotherProblemField}`, {
                    objectType,
                    problemField: anotherProblemField,
                });
                const filteredData: Record<string, any> = {};
                for (const [key, value] of Object.entries(data)) {
                    if (key !== problemField && key !== anotherProblemField) {
                        filteredData[key] = value;
                    }
                }
                // Final attempt — if this fails too, let it propagate
                try {
                    const conn = await this.ensureConnection();
                    try {
                        const result = await conn.sobject(objectType).upsert(filteredData, externalIdField);
                        const resultArray = Array.isArray(result) ? result : [result];
                        const firstResult = resultArray[0];
                        if (firstResult.success) {
                            return { success: true, salesforceId: firstResult.id };
                        }
                        return { success: false, error: firstResult.errors?.join(', ') ?? 'Unknown error' };
                    } finally {
                        this.releaseConnection();
                    }
                } catch (finalError) {
                    // Semaphore already released by finally block above
                    return { success: false, error: SalesforceErrorHandler.extractErrorMessage(finalError) };
                }
            }

            if (!suppressErrorLog) {
                SalesforceLogger.error(`Error upserting ${objectType} without field ${problemField}`, error, { objectType });
            }
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Convert Lead to Account and Contact using proper Salesforce convertLead API
     */
    async convertLead(leadId: string, accountId?: string, contactId?: string): Promise<SyncResult> {
        try {
            const conn = await this.ensureConnection();

            // First, get a valid converted status from the LeadStatus object
            let convertedStatus = 'Qualified'; // Default fallback
            try {
                const statusQuery = 'SELECT MasterLabel FROM LeadStatus WHERE IsConverted = true LIMIT 1';
                const statusResult = await conn.query(statusQuery);
                if (statusResult.records && statusResult.records.length > 0) {
                    convertedStatus = statusResult.records[0].MasterLabel as string;
                }
            } catch (statusError) {
                SalesforceLogger.warn('Could not query LeadStatus, using default status', {
                    leadId,
                    error: SalesforceErrorHandler.extractErrorMessage(statusError),
                });
            }

            // Use the proper convertLead SOAP API call
            // If accountId is provided, link to existing Account instead of creating a new one
            const leadConvert: Record<string, unknown> = {
                convertedStatus: convertedStatus,
                leadId: leadId,
                doNotCreateOpportunity: true,
                overwriteLeadSource: false,
                sendNotificationEmail: false,
            };
            if (accountId) {
                leadConvert.accountId = accountId;
            }
            // Pass contactId to merge into existing Contact (prevents duplicate when same email exists cross-env)
            if (contactId) {
                leadConvert.contactId = contactId;
            }
            const leadConverts = [leadConvert];

            SalesforceLogger.info('Converting Lead', { leadId, convertedStatus });

            // Call the SOAP convertLead method
            const result = await conn.soap.convertLead(leadConverts);

            // Handle the result (can be array or single object)
            const resultArray = Array.isArray(result) ? result : [result];
            const firstResult = resultArray[0];

            SalesforceLogger.info('Lead conversion result', { leadId, result: firstResult });

            if (firstResult.success) {
                return {
                    success: true,
                    salesforceId: firstResult.leadId ?? undefined,
                    accountId: firstResult.accountId ?? undefined,
                    contactId: firstResult.contactId ?? undefined,
                    opportunityId: firstResult.opportunityId ?? undefined,
                };
            } else {
                // Handle errors properly - they might be objects or arrays
                let errorMessage = 'Lead conversion failed';
                if (firstResult.errors) {
                    if (Array.isArray(firstResult.errors)) {
                        errorMessage = firstResult.errors
                            .map((err) => {
                                if (typeof err === 'object' && err !== null) {
                                    return err.message || JSON.stringify(err);
                                }
                                return String(err);
                            })
                            .join(', ');
                    } else {
                        errorMessage = String(firstResult.errors);
                    }
                }

                // Check if lead was already converted - retrieve converted IDs
                if (errorMessage.includes('already converted') || errorMessage.includes('CONVERTED_LEAD_ERROR')) {
                    return this.getConvertedLeadResult(conn, leadId);
                }

                return {
                    success: false,
                    error: errorMessage,
                };
            }
        } catch (error) {
            const errorMsg = SalesforceErrorHandler.extractErrorMessage(error);

            // Check if lead was already converted - retrieve converted IDs
            if (errorMsg.includes('already converted') || errorMsg.includes('CONVERTED_LEAD_ERROR')) {
                try {
                    const conn = await this.ensureConnection();
                    return this.getConvertedLeadResult(conn, leadId);
                } catch {
                    return { success: true, skipped: true, error: 'Lead already converted' };
                }
            }
            
            SalesforceLogger.error('Error converting lead', error, { leadId });
            return {
                success: false,
                error: errorMsg,
            };
        }
    }

    /**
     * Query converted Lead's Account/Contact IDs when Lead was already converted
     */
    private async getConvertedLeadResult(conn: any, leadId: string): Promise<SyncResult> {
        try {
            const query = `SELECT ConvertedAccountId, ConvertedContactId FROM Lead WHERE Id = '${leadId}' AND IsConverted = true LIMIT 1`;
            const result = await conn.query(query);
            if (result.records?.length > 0) {
                const record = result.records[0];
                return {
                    success: true,
                    skipped: true,
                    accountId: record.ConvertedAccountId ?? undefined,
                    contactId: record.ConvertedContactId ?? undefined,
                    error: 'Lead already converted',
                };
            }
        } catch (queryError) {
            SalesforceLogger.warn('Could not query converted Lead IDs', { leadId, error: SalesforceErrorHandler.extractErrorMessage(queryError) });
        }
        return { success: true, skipped: true, error: 'Lead already converted' };
    }

    /**
     * Test connection
     */
    async testConnection(): Promise<boolean> {
        try {
            const conn = await this.ensureConnection();
            await conn.query('SELECT Id FROM User LIMIT 1');
            return true;
        } catch (error) {
            SalesforceLogger.error('Connection test failed', error);
            return false;
        }
    }

    /**
     * Execute SOQL query
     */
    async query(soql: string): Promise<{ records: Record<string, unknown>[] }> {
        try {
            const conn = await this.ensureConnection();
            const result = await conn.query(soql);
            return {
                records: result.records as Record<string, unknown>[],
            };
        } catch (error) {
            SalesforceLogger.error('Query failed', error, { soql });
            return { records: [] };
        }
    }

    /**
     * Create a custom object with fields
     */
    async createCustomObject(
        objectName: string,
        label: string,
        pluralLabel: string,
        fields: Array<{
            fullName: string;
            label: string;
            type: string;
            length?: number;
            precision?: number;
            scale?: number;
            required?: boolean;
            unique?: boolean;
            externalId?: boolean;
            description?: string;
            defaultValue?: string | boolean | number;
        }>,
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const conn = await this.ensureConnection();

            // First create the custom object
            const customObject = {
                fullName: objectName,
                label,
                pluralLabel,
                nameField: {
                    type: 'Text',
                    label: 'Name',
                },
                deploymentStatus: 'Deployed',
                sharingModel: 'ReadWrite',
            };

            const objectResult = await conn.metadata.create('CustomObject', customObject);
            const objectSuccess = Array.isArray(objectResult) ? objectResult[0]?.success : objectResult.success;

            if (!objectSuccess) {
                const error = Array.isArray(objectResult)
                    ? this.extractErrorMessage(objectResult[0]?.errors)
                    : this.extractErrorMessage(objectResult.errors);
                return { success: false, error: `Failed to create object: ${error}` };
            }

            SalesforceLogger.info('Successfully created custom object', { objectName });

            // Then create the custom fields in batches
            if (fields.length > 0) {
                const customFields = fields.map((field) => ({
                    fullName: `${objectName}.${field.fullName}`,
                    label: field.label,
                    type: field.type,
                    ...(field.length && { length: field.length }),
                    ...(field.precision && { precision: field.precision }),
                    ...(field.scale && { scale: field.scale }),
                    ...(field.required !== undefined && { required: field.required }),
                    ...(field.unique !== undefined && { unique: field.unique }),
                    ...(field.externalId !== undefined && { externalId: field.externalId }),
                    ...(field.description && { description: field.description }),
                    ...(field.defaultValue !== undefined && { defaultValue: field.defaultValue }),
                }));

                const fieldResults = await this.createCustomFields(objectName, customFields);
                const resultArray = Array.isArray(fieldResults) ? fieldResults : [fieldResults];

                const successful = resultArray.filter((r) => r.success).length;
                const failed = resultArray.filter((r) => !r.success);

                if (failed.length === 0) {
                    SalesforceLogger.info('Successfully created custom fields', { objectName, successful });
                } else {
                    const errors = failed.map((f) => f.errors?.join(', ')).join('; ');
                    SalesforceLogger.error('Some fields failed to create', null, {
                        objectName,
                        successful,
                        failed: failed.length,
                        errors,
                    });
                    return { success: false, error: `Object created but some fields failed: ${errors}` };
                }
            }

            return { success: true };
        } catch (error) {
            SalesforceLogger.error('Error creating custom object', error, { objectName });
            return {
                success: false,
                error: SalesforceErrorHandler.extractErrorMessage(error),
            };
        }
    }

    /**
     * Create custom fields on an object (handles batching for Salesforce 10-record limit)
     * Also sets Field Level Security to make fields visible to all profiles
     */
    async createCustomFields(objectName: string, fields: any[]): Promise<any> {
        const conn = await this.ensureConnection();

        if (fields.length === 0) {
            return { success: true, message: 'No fields to create' };
        }

        const BATCH_SIZE = 10; // Salesforce limit
        const results: any[] = [];

        // Process fields in batches of 10
        for (let i = 0; i < fields.length; i += BATCH_SIZE) {
            const batch = fields.slice(i, i + BATCH_SIZE);

            SalesforceLogger.info('Creating field batch', {
                objectName,
                batchNumber: Math.floor(i / BATCH_SIZE) + 1,
                totalBatches: Math.ceil(fields.length / BATCH_SIZE),
                batchSize: batch.length,
            });

            try {
                const batchResult = await conn.metadata.create('CustomField', batch);
                results.push(...(Array.isArray(batchResult) ? batchResult : [batchResult]));

                // Add a small delay between batches to avoid rate limiting
                if (i + BATCH_SIZE < fields.length) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            } catch (error) {
                SalesforceLogger.error('Error creating field batch', error, {
                    objectName,
                    batchNumber: Math.floor(i / BATCH_SIZE) + 1,
                });
                throw error;
            }
        }
        return results;
    }

    /**
     * Query documents for a haulage offer from Salesforce
     * Returns ContentVersion records linked to the haulage offer
     */
    async queryHaulageOfferDocuments(
        haulageOfferId: string,
    ): Promise<Array<{ Id: string; Title: string; ContentDocumentId: string; FileType: string; ContentSize: number }>> {
        try {
            const conn = await this.ensureConnection();

            // Step 1: Get the Haulage Offer Salesforce ID
            const haulageOfferQuery = `
                SELECT Id 
                FROM Haulage_Offers__c 
                WHERE WasteTrade_Haulage_Offers_ID__c = '${haulageOfferId}'
                LIMIT 1
            `;
            const haulageOfferResult = await conn.query(haulageOfferQuery);
            
            if (!haulageOfferResult.records || haulageOfferResult.records.length === 0) {
                SalesforceLogger.warn('Haulage offer not found in Salesforce', { haulageOfferId });
                return [];
            }

            const salesforceHaulageOfferId = (haulageOfferResult.records[0] as any).Id;

            // Step 2: Get ContentDocumentIds linked to this Haulage Offer
            const linkQuery = `
                SELECT ContentDocumentId
                FROM ContentDocumentLink
                WHERE LinkedEntityId = '${salesforceHaulageOfferId}'
            `;
            const linkResult = await conn.query(linkQuery);

            if (!linkResult.records || linkResult.records.length === 0) {
                return [];
            }

            const contentDocumentIds = linkResult.records.map((record: any) => record.ContentDocumentId);

            // Step 3: Get ContentVersion records for these documents
            const versionQuery = `
                SELECT 
                    Id,
                    Title,
                    ContentDocumentId,
                    FileType,
                    ContentSize,
                    CreatedDate,
                    LastModifiedDate
                FROM ContentVersion
                WHERE ContentDocumentId IN ('${contentDocumentIds.join("','")}')
                AND IsLatest = true
                ORDER BY CreatedDate DESC
            `;

            const result = await conn.query(versionQuery);
            return result.records as any[];
        } catch (error) {
            SalesforceLogger.error('Failed to query haulage offer documents', error, { haulageOfferId });
            return [];
        }
    }

    /**
     * Query haulage loads by Salesforce IDs directly
     * Used for force pull from Salesforce
     */
    async queryHaulageLoadsByIds(salesforceIds: string[]): Promise<any[]> {
        if (!salesforceIds || salesforceIds.length === 0) {
            return [];
        }

        try {
            const conn = await this.ensureConnection();
            const idsString = salesforceIds.map(id => `'${id}'`).join(',');
            
            const query = `
                SELECT 
                    Id,
                    Name,
                    load_number__c,
                    collection_date__c,
                    gross_weight__c,
                    pallet_weight__c,
                    net_weight__c,
                    load_status__c,
                    haulage_bid_id__c,
                    WasteTrade_Load_Id__c,
                    Last_Sync_Origin__c,
                    LastModifiedDate
                FROM Haulage_Loads__c
                WHERE Id IN (${idsString})
            `;

            const result = await conn.query(query);
            return result.records as any[];
        } catch (error) {
            SalesforceLogger.error('Failed to query haulage loads by IDs', error, { salesforceIds });
            return [];
        }
    }

    /**
     * Build Salesforce download URL for a ContentVersion
     */
    buildDocumentDownloadUrl(versionId: string): string {
        const instanceUrl = this.config.sandboxUrl || this.config.productionUrl || process.env.SALESFORCE_INSTANCE_URL || '';
        return `${instanceUrl}/sfc/servlet.shepherd/version/download/${versionId}`;
    }

    /**
     * Delete custom fields from an object
     */
    async deleteCustomFields(objectName: string, fieldNames: string[]): Promise<any> {
        const conn = await this.ensureConnection();

        if (fieldNames.length === 0) {
            return { success: true, message: 'No fields to delete' };
        }

        // Build full field names for deletion
        const fullFieldNames = fieldNames.map((fieldName) => `${objectName}.${fieldName}`);

        SalesforceLogger.info('Deleting custom fields', {
            objectName,
            fieldCount: fullFieldNames.length,
            fullFieldNames,
        });

        const BATCH_SIZE = 10; // Salesforce limit
        const results: any[] = [];

        // Process fields in batches of 10
        for (let i = 0; i < fullFieldNames.length; i += BATCH_SIZE) {
            const batch = fullFieldNames.slice(i, i + BATCH_SIZE);

            SalesforceLogger.info('Deleting field batch', {
                objectName,
                batchNumber: Math.floor(i / BATCH_SIZE) + 1,
                totalBatches: Math.ceil(fullFieldNames.length / BATCH_SIZE),
                batchSize: batch.length,
            });

            try {
                const batchResult = await conn.metadata.delete('CustomField', batch);
                results.push(...(Array.isArray(batchResult) ? batchResult : [batchResult]));

                // Add a small delay between batches to avoid rate limiting
                if (i + BATCH_SIZE < fullFieldNames.length) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            } catch (error) {
                SalesforceLogger.error('Error deleting field batch', error, {
                    objectName,
                    batchNumber: Math.floor(i / BATCH_SIZE) + 1,
                });
                // Continue with other batches even if one fails
                results.push({ success: false, error: SalesforceErrorHandler.extractErrorMessage(error) });
            }
        }

        return results;
    }

    /**
     * Check if a custom object exists
     */
    async checkObjectExists(objectName: string): Promise<boolean> {
        try {
            const conn = await this.ensureConnection();
            const result = await conn.metadata.read('CustomObject', objectName);
            return result && result.fullName === objectName;
        } catch (error) {
            // Object doesn't exist or other error
            return false;
        }
    }

    /**
     * Get object metadata including fields
     */
    async getObjectMetadata(objectName: string): Promise<any> {
        try {
            const conn = await this.ensureConnection();
            return await conn.metadata.read('CustomObject', objectName);
        } catch (error) {
            SalesforceLogger.error('Error getting object metadata', error, { objectName });
            throw error;
        }
    }

    /**
     * Get picklist values for a specific field using describe API
     * More reliable than metadata API for getting active picklist values
     */
    async getPicklistValues(objectName: string, fieldName: string): Promise<string[]> {
        try {
            const conn = await this.ensureConnection();
            const describe = await conn.sobject(objectName).describe();
            const field = describe.fields.find((f: any) => f.name === fieldName);

            if (!field || field.type !== 'picklist' || !field.picklistValues) {
                return [];
            }

            return field.picklistValues.filter((v: any) => v.active).map((v: any) => v.value);
        } catch (error) {
            SalesforceLogger.error('Error getting picklist values', error, { objectName, fieldName });
            return [];
        }
    }

    /**
     * Get all picklist fields and their values for an object
     */
    async getAllPicklistValues(objectName: string): Promise<Record<string, string[]>> {
        try {
            const conn = await this.ensureConnection();
            const describe = await conn.sobject(objectName).describe();

            const picklists: Record<string, string[]> = {};

            for (const field of describe.fields) {
                if (field.type === 'picklist' && field.picklistValues) {
                    picklists[field.name] = field.picklistValues.filter((v: any) => v.active).map((v: any) => v.value);
                }
            }

            return picklists;
        } catch (error) {
            SalesforceLogger.error('Error getting all picklist values', error, { objectName });
            return {};
        }
    }

    /**
     * Check required fields across Salesforce objects and return missing ones
     */
    async checkMissingFields(
        requiredFieldsByObject: Record<string, string[]>,
    ): Promise<{ object: string; field: string; exists: boolean }[]> {
        const conn = await this.ensureConnection();
        const results: { object: string; field: string; exists: boolean }[] = [];

        for (const [objectName, fieldNames] of Object.entries(requiredFieldsByObject)) {
            try {
                const describe = await conn.sobject(objectName).describe();
                const existingFields = new Set(describe.fields.map((f: any) => f.name));

                for (const fieldName of fieldNames) {
                    results.push({
                        object: objectName,
                        field: fieldName,
                        exists: existingFields.has(fieldName),
                    });
                }
            } catch (error) {
                for (const fieldName of fieldNames) {
                    results.push({ object: objectName, field: fieldName, exists: false });
                }
            }
        }

        return results;
    }

    /**
     * Extract error message from Salesforce metadata errors
     */
    private extractErrorMessage(errors: Record<string, unknown>[] | undefined): string {
        if (!errors || errors.length === 0) {
            return 'Unknown error';
        }
        const error = errors[0];
        if (error.message) {
            return error.message as string;
        }
        if (error.fullName) {
            return `Error creating object ${error.fullName}: ${error.message || 'Unknown error'}`;
        }
        return JSON.stringify(error);
    }
}
