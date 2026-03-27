export interface SalesforceConfig {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    securityToken: string;
    sandboxUrl?: string;
    productionUrl?: string;
    apiVersion: string;
    syncEnabled: boolean;
}

export interface SyncResult {
    success: boolean;
    salesforceId?: string;
    error?: string;
    isCustomObjectMissing?: boolean;
    // Lead conversion specific fields
    accountId?: string;
    contactId?: string;
    opportunityId?: string;
    skipped?: boolean; // Indicates if the record was skipped (already synced)
}

export interface BulkSyncResult {
    total: number;
    successful: number;
    failed: number;
    skipped: number; // Number of records skipped (already synced)
    errors: Array<{
        recordId: string;
        error: string;
    }>;
}

// Base Salesforce record structure
export interface SalesforceRecord {
    Id?: string;
    Name?: string;
    [key: string]: string | number | boolean | Date | null | undefined;
}

// Specific Salesforce object types
export type SalesforceAccount = SalesforceRecord;
export type SalesforceLead = SalesforceRecord;
export type SalesforceContact = SalesforceRecord;
export type SalesforceSalesListing = SalesforceRecord;
export type SalesforceOffer = SalesforceRecord;
export type SalesforceTransaction = SalesforceRecord;
export type SalesforceWantedListing = SalesforceRecord;
export type SalesforceDocument = SalesforceRecord;

export interface SalesforceQueryResult<T = SalesforceRecord> {
    totalSize: number;
    done: boolean;
    records: T[];
    nextRecordsUrl?: string;
}

export interface SalesforceCreateResult {
    id: string;
    success: boolean;
    errors: Array<Record<string, unknown>>;
}

export interface SalesforceUpdateResult {
    success: boolean;
    errors: Array<Record<string, unknown>>;
}

export interface SalesforceUpsertResult {
    id: string;
    success: boolean;
    created: boolean;
    errors: Array<Record<string, unknown>>;
}
