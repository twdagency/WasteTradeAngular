# Salesforce Integration Logging - Implementation Guide

## Overview

The Salesforce integration logging system tracks all synchronization operations between WasteTrade and Salesforce, providing full traceability and audit capabilities as required by the specification.

## Implementation Details

### Model: `SalesforceSyncLog`

**Location**: `src/models/salesforce-sync-log.model.ts`

**Fields**:
- `id`: Auto-generated primary key
- `recordId`: WasteTrade record ID (user ID, company ID, listing ID, etc.)
- `objectType`: Type of Salesforce object (Lead, Account, Contact, Sales_Listing__c, etc.)
- `operation`: Type of operation (CREATE, UPDATE, DELETE, CONVERT, UPSERT)
- `direction`: Direction of sync (OUTBOUND, INBOUND)
- `status`: Operation result (SUCCESS, FAILED, PENDING)
- `salesforceId`: Salesforce record ID (if available)
- `errorMessage`: Error details for failed operations
- `retryCount`: Number of retry attempts
- `createdAt`: Timestamp when operation occurred
- `updatedAt`: Last update timestamp

### Repository: `SalesforceSyncLogRepository`

**Location**: `src/repositories/salesforce-sync-log.repository.ts`

Standard CRUD repository for accessing sync logs.

### Service: `SalesforceSyncService`

**Location**: `src/services/salesforce-sync.service.ts`

**Key Methods**:

#### `logSyncOperation()`
```typescript
private async logSyncOperation(
    recordId: string,
    objectType: string,
    operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'CONVERT' | 'UPSERT',
    result: { success: boolean; salesforceId?: string; error?: string },
    retryCount = 0,
): Promise<void>
```

**Behavior**:
- Only logs **FAILED** operations to database (reduces noise)
- Successful operations are logged to console only
- Captures all required fields per specification

#### `getSyncLogs()`
```typescript
async getSyncLogs(objectType?: string): Promise<SalesforceSyncLog[]>
```

**Behavior**:
- Retrieves sync logs with optional filtering by object type
- Returns last 100 logs ordered by creation date (newest first)
- Used by admin API endpoint

#### `getFailedSyncs()`
```typescript
async getFailedSyncs(maxRetries = 3): Promise<SalesforceSyncLog[]>
```

**Behavior**:
- Returns failed operations that haven't exceeded retry limit
- Only includes failures from last 24 hours
- Used by retry cronjob

#### `clearFailedSyncs()`
```typescript
async clearFailedSyncs(): Promise<{ count: number }>
```

**Behavior**:
- Deletes all failed sync logs
- Returns count of deleted records
- Used for cleanup after manual fixes

## Logging Coverage

### Outbound Operations (WasteTrade → Salesforce)

The following operations are logged:

1. **Company Sync** → Account
   - Object Type: `Account`
   - Operations: CREATE, UPDATE, UPSERT

2. **User Sync** → Lead/Contact
   - Object Type: `Lead`, `Contact`
   - Operations: CREATE, UPDATE, CONVERT

3. **Listing Sync** → Sales_Listing__c / Wanted_Listings__c
   - Object Type: `Sales_Listing__c`, `Wanted_Listings__c`
   - Operations: CREATE, UPDATE

4. **Offer Sync** → Offers__c
   - Object Type: `Offers__c`
   - Operations: CREATE, UPDATE

5. **Haulage Offer Sync** → Haulage_Offers__c
   - Object Type: `Haulage_Offers__c`
   - Operations: CREATE, UPDATE

6. **Document Sync** → Document__c
   - Object Type: `Document__c`
   - Operations: CREATE

### Inbound Operations (Salesforce → WasteTrade)

**All inbound webhook operations are logged to database** (both success and failure).

**Webhook Endpoints**:
- `/salesforce/webhook/lead-updated` - Lead updates (Push Haulier Data)
- `/salesforce/webhook/account-updated` - Account updates (CRM Alignment)
- `/salesforce/webhook/contact-updated` - Contact updates (CRM Alignment)
- `/salesforce/webhook/haulage-offer-status` - Haulage offer status updates
- `/salesforce/webhook/haulage-documents` - Document creation

**Loop Prevention**: All inbound webhooks check for `originMarker` starting with `WT_` to prevent circular updates.

## API Endpoints

### GET `/salesforce/sync/logs`

**Description**: Retrieve sync logs with optional filtering

**Query Parameters**:
- `objectType` (optional): Filter by object type (e.g., "Account", "Lead", "Sales_Listing__c")

**Response**:
```json
{
  "status": "success",
  "message": "Found 25 sync logs",
  "data": [
    {
      "id": 123,
      "objectType": "Account",
      "status": "FAILED",
      "salesforceId": "001xx000003DGbIAAW",
      "errorMessage": "INVALID_FIELD: No such column 'Invalid_Field__c'"
    }
  ]
}
```

**Authentication**: Requires JWT token (admin only)

**Example**:
```bash
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/logs?objectType=Account" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### GET `/salesforce/sync/failed`

**Description**: Get failed sync operations that need retry

**Response**:
```json
{
  "status": "success",
  "message": "Found 5 failed sync operations",
  "data": [
    {
      "id": 124,
      "objectType": "Sales_Listing__c",
      "status": "FAILED",
      "salesforceId": null,
      "errorMessage": "UNABLE_TO_LOCK_ROW: unable to obtain exclusive access to this record"
    }
  ]
}
```

**Authentication**: Requires JWT token (admin only)

**Example**:
```bash
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/failed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### DELETE `/salesforce/sync/failed`

**Description**: Clear all failed sync logs

**Response**:
```json
{
  "status": "success",
  "message": "Cleared 5 failed sync logs",
  "data": {
    "count": 5
  }
}
```

**Authentication**: Requires JWT token (admin only)

**Example**:
```bash
curl -X DELETE "https://wastetrade-api-dev.b13devops.com/salesforce/sync/failed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing Guide

### 1. Setup Test Environment

```bash
# Ensure database is running
docker-compose -f docker-compose.db.yml up -d

# Run migrations to create sync logs table
pnpm migrate

# Start backend
pnpm dev
```

### 2. Test Outbound Sync Logging

#### Test Company Sync
```bash
# Trigger company sync
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/sync/companies?forceSync=true&limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Check logs
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/logs?objectType=Account" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Test Listing Sync
```bash
# Trigger listing sync
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/sync/listings?forceSync=true&limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Check logs
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/logs?objectType=Sales_Listing__c" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Test Offer Sync
```bash
# Trigger offer sync
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/sync/offers?forceSync=true&limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Check logs
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/logs?objectType=Offers__c" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### 3. Test Failed Sync Logging

#### Simulate Failure
```bash
# Temporarily break Salesforce connection (set invalid credentials in .env)
SALESFORCE_USERNAME=invalid@example.com

# Restart backend
pnpm dev

# Trigger sync (will fail)
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/sync/companies?limit=1" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Check failed logs
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/failed" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Test Retry Logic
```bash
# Fix credentials in .env
SALESFORCE_USERNAME=your-real-username@example.com

# Restart backend
pnpm dev

# Trigger retry cronjob manually
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/retry/failed" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Verify failures cleared
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/failed" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### 4. Test Inbound Webhook Logging

#### Test Lead Update Webhook
```bash
# Simulate Salesforce Lead update
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/webhook/lead-updated" \
  -H "x-salesforce-secret: YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "00Qxx000001234567",
    "externalId": "PROD_123",
    "email": "updated@example.com",
    "firstName": "John",
    "lastName": "Updated",
    "phone": "+44 1234 567890",
    "status": "Qualified",
    "updatedAt": "2024-12-29T10:00:00.000Z"
  }'

# Check logs for inbound operation
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/logs?objectType=Lead" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Verify in database
# SELECT * FROM salesforce_sync_logs WHERE direction = 'INBOUND' AND object_type = 'Lead';
```

#### Test Account Update Webhook
```bash
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/webhook/account-updated" \
  -H "x-salesforce-secret: YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "001xx000003DGbIAAW",
    "externalId": "PROD_456",
    "name": "Updated Company Name",
    "billingCountry": "UK",
    "updatedAt": "2024-12-29T10:00:00.000Z"
  }'

# Check logs
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/logs?objectType=Account" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Test Contact Update Webhook
```bash
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/webhook/contact-updated" \
  -H "x-salesforce-secret: YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "003xx000004TmiOAAS",
    "externalId": "PROD_123",
    "email": "updated@example.com",
    "firstName": "Jane",
    "lastName": "Updated",
    "phone": "+44 9876 543210",
    "updatedAt": "2024-12-29T10:00:00.000Z"
  }'

# Check logs
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/logs?objectType=Contact" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Test Loop Prevention
```bash
# Send webhook with WasteTrade origin marker
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/webhook/lead-updated" \
  -H "x-salesforce-secret: YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "00Qxx000001234567",
    "externalId": "PROD_123",
    "email": "test@example.com",
    "originMarker": "WT_20241229_100000",
    "updatedAt": "2024-12-29T10:00:00.000Z"
  }'

# Should return: "Update ignored - originated from WasteTrade"
# Log should still be created with success status
```

### 5. Test Log Cleanup

```bash
# Clear all failed logs
curl -X DELETE "https://wastetrade-api-dev.b13devops.com/salesforce/sync/failed" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Verify cleared
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/failed" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### 6. Database Verification

```sql
-- View all sync logs
SELECT * FROM salesforce_sync_logs ORDER BY created_at DESC LIMIT 20;

-- Count by status and direction
SELECT direction, status, COUNT(*) 
FROM salesforce_sync_logs 
GROUP BY direction, status;

-- Count by object type
SELECT object_type, COUNT(*) FROM salesforce_sync_logs GROUP BY object_type;

-- View inbound operations
SELECT * FROM salesforce_sync_logs 
WHERE direction = 'INBOUND' 
ORDER BY created_at DESC 
LIMIT 10;

-- View recent failures
SELECT * FROM salesforce_sync_logs 
WHERE status = 'FAILED' 
ORDER BY created_at DESC 
LIMIT 10;

-- View logs for specific record
SELECT * FROM salesforce_sync_logs 
WHERE record_id = '123' 
ORDER BY created_at DESC;
```

## Related Documentation

- **Salesforce Setup**: `docs/salesforce/README.md`
- **CRM Alignment**: `docs/Phase 2/Work Package 2/CU-869abxxq7_CRM_Alignment.md`
- **Push Haulier Data**: `docs/Phase 2/Work Package 2/CU-869abxxvx_Push_Haulier_Data.md`
- **Webhook Setup**: `docs/salesforce/INBOUND_WEBHOOK_SETUP_GUIDE.md`
