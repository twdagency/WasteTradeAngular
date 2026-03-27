/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Salesforce Sync Utility Functions
 * Extracted from SalesforceSyncService for better code organization
 */

import { SyncResult } from '../../types/salesforce';

/**
 * Escape a string value for safe use in SOQL WHERE clauses.
 * Prevents SOQL injection by escaping special characters.
 */
export function escapeSoql(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Interface for records that can be synced to Salesforce
 */
export interface SyncableRecord {
    id?: number;
    isSyncedSalesForce?: boolean;
    lastSyncedSalesForceDate?: Date;
    updatedAt?: string | Date;
    salesforceId?: string;
}

/**
 * Circuit Breaker for Salesforce API - Simple implementation
 * Prevents cascading failures when Salesforce is unavailable
 */
export class SalesforceCircuitBreaker {
    private static instance: SalesforceCircuitBreaker;
    private failures = 0;
    private lastFailureTime: Date | null = null;
    private isOpen = false;
    private readonly failureThreshold = 5;
    private readonly resetTimeoutMs = 60000; // 1 minute

    static getInstance(): SalesforceCircuitBreaker {
        if (!SalesforceCircuitBreaker.instance) {
            SalesforceCircuitBreaker.instance = new SalesforceCircuitBreaker();
        }
        return SalesforceCircuitBreaker.instance;
    }

    /**
     * Check if circuit is open (blocking requests)
     */
    isCircuitOpen(): boolean {
        if (!this.isOpen) return false;

        // Check if reset timeout has passed
        if (this.lastFailureTime && Date.now() - this.lastFailureTime.getTime() >= this.resetTimeoutMs) {
            this.reset();
            return false;
        }
        return true;
    }

    /**
     * Record a successful operation
     */
    recordSuccess(): void {
        this.failures = 0;
        if (this.isOpen) {
            this.reset();
        }
    }

    /**
     * Record a failed operation
     */
    recordFailure(): void {
        this.failures++;
        this.lastFailureTime = new Date();

        if (this.failures >= this.failureThreshold) {
            this.isOpen = true;
            SalesforceLogger.error(`Circuit breaker OPENED after ${this.failures} failures`, undefined, {
                failures: this.failures,
                willResetAt: new Date(Date.now() + this.resetTimeoutMs).toISOString(),
            });
        }
    }

    /**
     * Reset the circuit breaker
     */
    reset(): void {
        this.failures = 0;
        this.isOpen = false;
        this.lastFailureTime = null;
    }

    /**
     * Get current status
     */
    getStatus(): { isOpen: boolean; failures: number; lastFailureTime: Date | null } {
        return {
            isOpen: this.isCircuitOpen(),
            failures: this.failures,
            lastFailureTime: this.lastFailureTime,
        };
    }
}

/**
 * Simple Metrics Collector for Salesforce Sync
 */
export class SyncMetricsCollector {
    private static instance: SyncMetricsCollector;
    private metrics: Map<string, { total: number; success: number; failed: number; skipped: number }> = new Map();
    private lastSyncTime: Date | null = null;
    private lastResetTime: Date = new Date();
    private readonly resetIntervalMs = 60 * 60 * 1000; // Auto-reset every 1 hour

    static getInstance(): SyncMetricsCollector {
        if (!SyncMetricsCollector.instance) {
            SyncMetricsCollector.instance = new SyncMetricsCollector();
        }
        return SyncMetricsCollector.instance;
    }

    /**
     * Record sync result for an object type
     */
    record(objectType: string, result: { success: boolean; skipped?: boolean }): void {
        this.autoResetIfStale();
        let typeMetrics = this.metrics.get(objectType);
        if (!typeMetrics) {
            typeMetrics = { total: 0, success: 0, failed: 0, skipped: 0 };
            this.metrics.set(objectType, typeMetrics);
        }

        typeMetrics.total++;
        if (result.skipped) {
            typeMetrics.skipped++;
        } else if (result.success) {
            typeMetrics.success++;
        } else {
            typeMetrics.failed++;
        }
        this.lastSyncTime = new Date();
    }

    /**
     * Record batch sync results
     */
    recordBatch(
        objectType: string,
        results: { total: number; successful: number; failed: number; skipped: number },
    ): void {
        this.autoResetIfStale();
        let typeMetrics = this.metrics.get(objectType);
        if (!typeMetrics) {
            typeMetrics = { total: 0, success: 0, failed: 0, skipped: 0 };
            this.metrics.set(objectType, typeMetrics);
        }

        typeMetrics.total += results.total;
        typeMetrics.success += results.successful;
        typeMetrics.failed += results.failed;
        typeMetrics.skipped += results.skipped;
        this.lastSyncTime = new Date();
    }

    /**
     * Get metrics summary
     */
    getSummary(): Record<string, unknown> {
        const summary: Record<string, unknown> = {
            lastSyncTime: this.lastSyncTime?.toISOString() || null,
            byObjectType: {},
        };

        let totalAll = 0,
            successAll = 0,
            failedAll = 0,
            skippedAll = 0;

        this.metrics.forEach((m, type) => {
            (summary.byObjectType as Record<string, unknown>)[type] = {
                ...m,
                successRate: m.total > 0 ? ((m.success / m.total) * 100).toFixed(2) + '%' : '0%',
            };
            totalAll += m.total;
            successAll += m.success;
            failedAll += m.failed;
            skippedAll += m.skipped;
        });

        summary.totals = {
            total: totalAll,
            success: successAll,
            failed: failedAll,
            skipped: skippedAll,
            successRate: totalAll > 0 ? ((successAll / totalAll) * 100).toFixed(2) + '%' : '0%',
        };

        return summary;
    }

    /**
     * Auto-reset counters if older than resetIntervalMs to prevent unbounded growth
     */
    private autoResetIfStale(): void {
        if (Date.now() - this.lastResetTime.getTime() >= this.resetIntervalMs) {
            this.reset();
        }
    }

    /**
     * Reset metrics
     */
    reset(): void {
        this.metrics.clear();
        this.lastSyncTime = null;
        this.lastResetTime = new Date();
    }
}

/**
 * Centralized error handling for Salesforce operations
 */
export class SalesforceErrorHandler {
    /**
     * Extract a clean error message from various error types
     */
    static extractErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }

        if (typeof error === 'string') {
            return error;
        }

        if (error && typeof error === 'object') {
            const errorObj = error as Record<string, unknown>;

            // Handle Salesforce API errors
            if (errorObj.message && typeof errorObj.message === 'string') {
                return errorObj.message;
            }

            // Handle JSForce errors
            if (errorObj.errorCode && errorObj.message) {
                return `${errorObj.errorCode}: ${errorObj.message}`;
            }

            // Handle array of errors
            if (Array.isArray(errorObj.errors) && errorObj.errors.length > 0) {
                const firstError = errorObj.errors[0];
                if (firstError && typeof firstError === 'object' && 'message' in firstError) {
                    return String(firstError.message);
                }
            }
        }

        return 'Unknown error occurred';
    }

    /**
     * Create standardized error responses for Salesforce operations
     */
    static createErrorResponse(
        error: unknown,
        operation: string,
    ): { status: string; message: string; data: Record<string, unknown> } {
        const errorMessage = this.extractErrorMessage(error);

        return {
            status: 'error',
            message: `${operation} failed: ${errorMessage}`,
            data: { error: errorMessage },
        };
    }
}

/**
 * Centralized Salesforce logging utility
 * Only logs failed operations and errors to reduce noise
 */
export class SalesforceLogger {
    private static logObject(level: string, message: string, error?: unknown, metadata?: Record<string, unknown>) {
        const logEntry: Record<string, unknown> = {
            timestamp: new Date().toISOString(),
            level,
            service: 'salesforce',
            message,
        };

        if (metadata) {
            logEntry.metadata = metadata;
        }

        if (error) {
            logEntry.error = this.formatError(error);
        }

        // Only output to console for errors and warnings
        if (level === 'error' || level === 'warn') {
            console[level as 'error' | 'warn'](JSON.stringify(logEntry, null, 2));
        }
    }

    private static formatError(error: unknown): Record<string, unknown> {
        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }
        return { error: String(error) };
    }

    // Only log errors - no success logging
    static error(message: string, error?: unknown, metadata?: Record<string, unknown>) {
        this.logObject('error', message, error, metadata);
    }

    // Keep warnings for important non-error issues
    static warn(message: string, metadata?: Record<string, unknown>) {
        this.logObject('warn', message, undefined, metadata);
    }

    // Info level - silent operation, no console output
    static info(message: string, metadata?: Record<string, unknown>) {
        // Info level exists for compatibility but does not output to console
        // Only creates internal log entry for potential debugging
        const logEntry: Record<string, unknown> = {
            timestamp: new Date().toISOString(),
            level: 'info',
            service: 'salesforce',
            message,
        };

        if (metadata) {
            logEntry.metadata = metadata;
        }

        // No console output for info level - silent operation
        // This maintains API compatibility while reducing log noise
    }
}

/**
 * Get environment prefix for Salesforce data
 * Returns short uppercase prefix: DEV, TEST, UAT, PROD
 */
export function getEnvironmentPrefix(): string {
    const env = (process.env.ENVIRONMENT ?? process.env.NODE_ENV ?? 'dev').toLowerCase();
    const prefixMap: Record<string, string> = {
        development: 'DEV',
        dev: 'DEV',
        test: 'TEST',
        testing: 'TEST',
        uat: 'UAT',
        staging: 'UAT',
        production: 'PROD',
        prod: 'PROD',
    };
    return prefixMap[env] || env.toUpperCase();
}

/**
 * Regex pattern matching all known environment prefixes (for stripping)
 */
export const ENV_PREFIX_PATTERN = /^(DEVELOPMENT|DEV|TEST|TESTING|UAT|STAGING|PRODUCTION|PROD)_/;

/**
 * Format error message for clean logging (errorCode + message only)
 */
export function formatErrorMessage(error: any): string {
    if (error === null || error === undefined) {
        return 'Unknown error';
    }

    // Handle error objects with errorCode and message
    if (error.errorCode && error.message) {
        return `${error.errorCode}: ${error.message}`;
    }

    // Handle error objects with just message
    if (error.message) {
        return error.message;
    }

    // Handle arrays of errors
    if (Array.isArray(error)) {
        return error.map((e) => formatErrorMessage(e)).join('; ');
    }

    // Handle plain objects by stringifying them
    if (typeof error === 'object') {
        try {
            return JSON.stringify(error);
        } catch (e) {
            return 'Error serializing error object';
        }
    }

    // Handle primitive values
    return String(error);
}

/**
 * Check if error is due to missing custom fields/objects
 */
export function isCustomFieldError(result: SyncResult): boolean {
    const errorMessage = result?.error?.toLowerCase() ?? '';
    return (
        errorMessage.includes('no such column') ||
        errorMessage.includes('invalid field') ||
        errorMessage.includes('invalid_field') ||
        errorMessage.includes('unknown_exception') ||
        errorMessage.includes('does not exist or is not accessible')
    );
}

/**
 * Clean data to remove undefined values and handle field length limits
 */
export function cleanSalesforceData(data: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
            // Handle string length limits for common field types
            if (typeof value === 'string') {
                const trimmedValue = value.trim();

                // Handle invalid test data with fallbacks for required fields
                if (isInvalidTestData(trimmedValue)) {
                    // Provide fallbacks for required Salesforce fields
                    if (key === 'Company') {
                        cleaned[key] = addEnvironmentPrefix('WasteTrade Company');
                        continue;
                    } else if (key === 'FirstName') {
                        cleaned[key] = 'WasteTrade';
                        continue;
                    } else if (key === 'LastName') {
                        cleaned[key] = 'User';
                        continue;
                    } else {
                        // Skip optional fields with invalid test data
                        continue;
                    }
                }

                // Validate email fields
                if (key.toLowerCase().includes('email') && !isValidEmail(trimmedValue)) {
                    continue; // Skip invalid emails
                }

                // Apply field length limits
                let processedValue = trimmedValue;
                if (key.includes('Name') || key.includes('Title') || key === 'Sales_Listing_Name__c') {
                    processedValue = trimmedValue.substring(0, 80); // Standard Name field limit
                } else if (key.includes('Email')) {
                    processedValue = trimmedValue.substring(0, 80); // Email field limit
                } else if (key.includes('Phone')) {
                    processedValue = trimmedValue.substring(0, 40); // Phone field limit
                } else if (key.includes('Country') || key.includes('State')) {
                    processedValue = trimmedValue.substring(0, 80); // Country/State field limit
                } else if (key.includes('Description') || key.includes('Message')) {
                    processedValue = trimmedValue.substring(0, 32000); // Long text field limit
                } else {
                    processedValue = trimmedValue.substring(0, 255); // Default text field limit
                }

                cleaned[key] = processedValue;
            } else {
                cleaned[key] = value;
            }
        }
    }

    return cleaned;
}

/**
 * Add environment prefix to a name/title for non-production environments
 * Skips if production or if any env prefix already present to prevent accumulation
 */
export function addEnvironmentPrefix(name: string): string {
    const env = (process.env.ENVIRONMENT ?? process.env.NODE_ENV)?.toLowerCase();
    if (env === 'production' || env === 'prod') {
        return name;
    }
    if (ENV_PREFIX_PATTERN.test(name)) {
        return name;
    }
    return `${getEnvironmentPrefix()}_${name}`;
}

/**
 * Add environment prefix to external IDs and unique fields for non-production environments
 * Skips if prefix already present to prevent accumulation on re-sync
 */
export function addEnvironmentPrefixToExternalId(externalId: string): string {
    const env = (process.env.ENVIRONMENT ?? process.env.NODE_ENV)?.toLowerCase();

    // Only add prefix for non-production environments
    if (env === 'production' || env === 'prod') {
        return externalId;
    }

    // Prevent accumulation if any env prefix already present
    if (ENV_PREFIX_PATTERN.test(externalId)) {
        return externalId;
    }

    return `${getEnvironmentPrefix()}_${externalId}`;
}

/**
 * Check if a record needs to be synced based on sync tracking fields
 */
export function needsSync(record: SyncableRecord): boolean {
    // If never synced, sync it
    if (!record.isSyncedSalesForce) {
        return true;
    }

    // If no Salesforce ID, sync it (record was not successfully synced before)
    if (!record.salesforceId) {
        return true;
    }

    // If no last sync date, sync it
    if (!record.lastSyncedSalesForceDate) {
        return true;
    }

    // If no updatedAt, sync it to be safe
    if (!record.updatedAt) {
        return true;
    }

    // Convert dates to comparable format
    const updatedAt = new Date(record.updatedAt);
    const lastSyncedAt = new Date(record.lastSyncedSalesForceDate);

    // If record was updated after last sync, sync it
    return updatedAt > lastSyncedAt;
}

/**
 * Filter records that need syncing - reusable across all entity types
 * Eliminates code duplication in syncXxxByFilter methods
 */
export function filterRecordsNeedingSync<T extends SyncableRecord>(records: T[], forceSync: boolean): T[] {
    if (forceSync) return records;
    return records.filter((record) => needsSync(record));
}

/**
 * Format currency value for Salesforce Currency fields
 * Salesforce Currency fields require:
 * - Numbers (not strings)
 * - Maximum 16 digits total
 * - 2 decimal places
 * - No currency symbols or formatting
 */
export function formatCurrencyValue(value: number | string | undefined): number | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }

    // Convert to number if it's a string
    let numericValue: number;
    if (typeof value === 'string') {
        // Remove currency symbols, commas, and other formatting
        const cleanValue = value.replace(/[£$€¥,]/g, '').trim();
        numericValue = parseFloat(cleanValue);
    } else {
        numericValue = value;
    }

    // Check if it's a valid number
    if (isNaN(numericValue)) {
        return undefined;
    }

    // Round to 2 decimal places (Salesforce requirement)
    const roundedValue = Math.round(numericValue * 100) / 100;

    // Check if the value exceeds Salesforce limits
    // Maximum 16 digits total, 2 decimal places = 14 digits before decimal
    const maxValue = Math.pow(10, 14) - 0.01; // 99999999999999.99
    if (roundedValue > maxValue) {
        return maxValue;
    }

    return roundedValue;
}

/**
 * Safely calculate number of loads for Salesforce sync
 * Prevents extremely large values that would cause Salesforce errors
 */
export function calculateSafeNumberOfLoads(
    quantity: number | undefined,
    weightPerUnit: number | undefined,
): number | undefined {
    if (!quantity || !weightPerUnit || weightPerUnit <= 0) {
        return undefined;
    }

    const calculatedLoads = Math.ceil(quantity / weightPerUnit);

    // Cap at reasonable maximum to prevent Salesforce numeric field overflow
    // Reduced from 999999999 to 99999999 to match Salesforce field precision
    const MAX_LOADS = 99999999; // Safe limit for Salesforce Number field (8 digits)

    return Math.min(calculatedLoads, MAX_LOADS);
}

/**
 * Format numeric value for Salesforce Number fields
 * Ensures the value is a valid number and handles string conversion
 */
export function formatNumericValue(value: number | string | undefined): number | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }

    // Convert to number if it's a string
    let numericValue: number;
    if (typeof value === 'string') {
        // Remove any non-numeric characters except decimal point
        const cleanValue = value.replace(/[^\d.-]/g, '').trim();
        numericValue = parseFloat(cleanValue);
    } else {
        numericValue = value;
    }

    // Check if it's a valid number
    if (isNaN(numericValue) || !isFinite(numericValue)) {
        return undefined;
    }

    // Salesforce Number(18,0) field maximum value is approximately 999,999,999,999,999,999
    // But for practical purposes and to avoid scientific notation, limit to 999,999,999
    const MAX_SAFE_VALUE = 999999999;
    const MIN_SAFE_VALUE = -999999999;

    // Clamp the value to safe range
    if (numericValue > MAX_SAFE_VALUE) {
        return MAX_SAFE_VALUE;
    }
    if (numericValue < MIN_SAFE_VALUE) {
        return MIN_SAFE_VALUE;
    }

    return numericValue;
}

/**
 * Convert DD/MM/YYYY date string to ISO format for Salesforce
 */
export function convertDateToSalesforceFormat(dateString: string | null | undefined): string | undefined {
    if (!dateString) return undefined;

    try {
        // Try DD/MM/YYYY format first
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
            const year = parseInt(parts[2], 10);
            const date = new Date(year, month, day);

            // Return in YYYY-MM-DD format for Salesforce
            return date.toISOString().split('T')[0];
        }

        // Fallback to standard Date parsing
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }

        return undefined;
    } catch {
        return undefined;
    }
}

/**
 * Build material name from listing data
 */
export function buildMaterialName(listing: any): string {
    if (!listing) {
        return 'Unknown Material';
    }

    const parts = [];

    if (listing.materialType) parts.push(listing.materialType);
    if (listing.materialItem) parts.push(listing.materialItem);
    if (listing.materialForm) parts.push(listing.materialForm);
    if (listing.materialGrading) parts.push(listing.materialGrading);
    if (listing.materialColor) parts.push(listing.materialColor);
    if (listing.materialFinishing) parts.push(listing.materialFinishing);

    return parts.filter((part) => part && part !== 'N/A').join(' - ') || listing.title || 'Unknown Material';
}

/**
 * Parse error message to extract missing field information
 */
export function parseMissingFieldError(errorMessage: string): { objectName: string; fieldName: string } | null {
    // Pattern: "No such column 'FieldName__c' on sobject of type ObjectName"
    const match = errorMessage.match(/No such column '([^']+)' on sobject of type (\w+)/);

    if (match) {
        return {
            fieldName: match[1],
            objectName: match[2],
        };
    }

    // Alternative pattern: "Invalid field: ObjectName.FieldName__c"
    const altMatch = errorMessage.match(/Invalid field: (\w+)\.([^.\s]+)/);

    if (altMatch) {
        return {
            objectName: altMatch[1],
            fieldName: altMatch[2],
        };
    }

    return null;
}

/**
 * Check if a value is invalid test data that should not be synced
 */
function isInvalidTestData(value: string): boolean {
    const invalidTestValues = [
        'string',
        'test',
        'example',
        'placeholder',
        'dummy',
        'sample',
        'null',
        'undefined',
        'N/A',
        'n/a',
        'TBD',
        'tbd',
        'TODO',
        'todo',
    ];

    const lowerValue = value.toLowerCase();
    return invalidTestValues.includes(lowerValue) || lowerValue.length < 2;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Configuration utilities for Salesforce sync operations
 */
export class SalesforceConfigUtils {
    /**
     * Get batch size for parallel processing
     *
     * SALESFORCE RATE LIMITS (2025):
     * - Bulk API 2.0: Up to 10,000 records per batch
     * - REST API: 15,000-100,000+ daily calls (license dependent)
     * - Concurrent requests: Up to 25 parallel requests
     *
     * OPTIMIZED SETTINGS (REDUCED FOR STABILITY):
     * - 20 records: Reduced from 50 to minimize rate limit errors and retries
     * - Smaller batches = fewer concurrent requests = more stable
     * - Reduces "Only absolute URLs are supported" errors (often caused by rate limiting)
     * - Trade-off: Slower but more reliable sync
     */
    static getBatchSize(): number {
        return 20;
    }

    /**
     * Get delay between batches
     *
     * SALESFORCE RATE LIMITS:
     * - REST API: 100 requests/minute (per user)
     * - Each batch of 20 runs in parallel, so 20 requests fire at once
     * - 2s delay between batches keeps us well under limits
     *   (20 req/batch × ~5 batches/10s = ~100 req/min at peak)
     */
    static getBatchDelay(): number {
        return 2000;
    }

    /**
     * Check if sync is enabled (only requires SALESFORCE_SYNC_ENABLED env var)
     */
    static isSyncEnabled(): boolean {
        return process.env.SALESFORCE_SYNC_ENABLED !== 'false';
    }

    /**
     * Get simplified sync configuration
     */
    static getSyncConfig() {
        return {
            enabled: this.isSyncEnabled(),
            batchSize: this.getBatchSize(),
            batchDelay: this.getBatchDelay(),
            environment: process.env.ENVIRONMENT ?? process.env.NODE_ENV ?? 'development',
        };
    }
}
