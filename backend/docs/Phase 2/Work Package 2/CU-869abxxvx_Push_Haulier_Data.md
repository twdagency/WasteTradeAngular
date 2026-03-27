# CU-869abxxvx: Push Haulier Data

**Epic**: 6.5.1.1. Push Haulier Data  
**User Story**: Synchronise Haulier onboarding and verification data between WasteTrade and Salesforce  

## Overview

Bidirectional push-based synchronisation of Haulier registration and verification data between WasteTrade and Salesforce:
- **Registration** → Create/Update Lead in Salesforce
- **Verification** → Convert Lead to Account + Contact in Salesforce
- **Inbound Updates** → Salesforce pushes changes back to WasteTrade
- **Load Details** → Auto-generate loads when haulage offer accepted, sync to Salesforce Haulage_Loads__c

## Load Details Implementation

When a haulage offer is accepted, the system automatically generates load records based on `numberOfLoads` field:
- Creates `HaulageLoads` records in WasteTrade database
- Each load gets sequential number: "1 of 3", "2 of 3", "3 of 3"
- Initial status: "Awaiting Collection"
- Syncs to Salesforce `Haulage_Loads__c` object
- Admins can update load details in Salesforce (collection date, weight, status)
- Inbound webhook updates WasteTrade when Salesforce changes load data

## API Endpoints

### Inbound Webhooks (Salesforce → WasteTrade)

#### POST `/salesforce/webhook/lead-updated`
Receive Lead updates from Salesforce.

**Headers**:
- `x-salesforce-secret`: Webhook authentication secret

**Request Body**:
```json
{
  "leadId": "00Qxx000001234567",
  "externalId": "PROD_123",
  "email": "haulier@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+44 1234 567890",
  "company": "Haulier Company Ltd",
  "status": "Qualified",
  "updatedAt": "2024-12-29T10:00:00.000Z",
  "updatedBy": "SF_User_Id",
  "originMarker": "SF_20241229_100000"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Successfully updated user 123",
  "updated": true
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid webhook secret
- `400 Bad Request` - Missing external ID
- `404 Not Found` - User not found
- `409 Conflict` - Stale event (WasteTrade has newer data)

#### POST `/salesforce/webhook/account-updated`
Receive Account updates from Salesforce.

**Request Body**:
```json
{
  "accountId": "001xx000003DGbIAAW",
  "externalId": "PROD_456",
  "name": "Updated Company Name",
  "billingStreet": "123 Main St",
  "billingCity": "London",
  "billingPostalCode": "SW1A 1AA",
  "billingCountry": "UK",
  "billingState": "England",
  "phone": "+44 20 1234 5678",
  "website": "https://example.com",
  "updatedAt": "2024-12-29T10:00:00.000Z"
}
```

#### POST `/salesforce/webhook/contact-updated`
Receive Contact updates from Salesforce.

**Request Body**:
```json
{
  "contactId": "003xx000004TmiOAAS",
  "externalId": "PROD_123",
  "accountId": "001xx000003DGbIAAW",
  "accountExternalId": "PROD_456",
  "email": "updated@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+44 9876 543210",
  "companyRole": "Director",
  "isPrimaryContact": true,
  "memberStatus": "ACTIVE",
  "updatedAt": "2024-12-29T10:00:00.000Z"
}
```

#### POST `/salesforce/webhook/load-updated`
Receive Haulage Load updates from Salesforce.

**Request Body**:
```json
{
  "loadId": "a0Xxx000000AbCDEFG",
  "haulageOfferId": "PROD_789",
  "loadNumber": "1 of 3",
  "collectionDate": "2024-12-30",
  "grossWeight": "25000",
  "palletWeight": "1000",
  "loadStatus": "In Transit",
  "updatedAt": "2024-12-29T10:00:00.000Z"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Successfully updated load 123",
  "updated": true
}
```

### Sync Log Endpoints (Admin Only)

#### GET `/salesforce/sync/logs?objectType=Lead`
View sync logs with optional filtering.

**Query Parameters**:
- `objectType` (optional): Filter by object type

**Response**:
```json
{
  "status": "success",
  "message": "Found 25 sync logs",
  "data": [
    {
      "id": 123,
      "recordId": "123",
      "objectType": "Lead",
      "operation": "UPDATE",
      "direction": "INBOUND",
      "status": "SUCCESS",
      "salesforceId": "00Qxx000001234567",
      "errorMessage": null,
      "createdAt": "2024-12-29T10:00:00.000Z"
    }
  ]
}
```

#### GET `/salesforce/sync/failed`
Get failed sync operations that need retry.

#### DELETE `/salesforce/sync/failed`
Clear all failed sync logs.

## Testing Guide

### 1. Setup

```bash
# Ensure database is running
docker-compose -f docker-compose.db.yml up -d

# Set environment variables
SALESFORCE_AUTO_SYNC=true
IS_BACKGROUND=true
SALESFORCE_WEBHOOK_SECRET=your-secret-key

# Start backend
pnpm dev
```

### 2. Test Haulier Registration → Lead Creation

```bash
# Register new haulier (creates Lead in Salesforce)
curl -X POST "https://wastetrade-api-dev.b13devops.com/auth/register-haulier" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newhaulier@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+44 1234 567890",
    "companyName": "Test Haulier Ltd",
    "country": "UK",
    "vatNumber": "GB123456789",
    "registrationNumber": "12345678"
  }'

# Check Salesforce for new Lead
# Lead.Email = newhaulier@example.com
# Lead.ExternalId__c = PROD_{userId}
```

### 3. Test Lead Update Webhook (Salesforce → WasteTrade)

```bash
# Get admin JWT token first
TOKEN="your-admin-jwt-token"

# Simulate Salesforce Lead update
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/webhook/lead-updated" \
  -H "x-salesforce-secret: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "00Qxx000001234567",
    "externalId": "PROD_123",
    "email": "newhaulier@example.com",
    "firstName": "John",
    "lastName": "Updated",
    "phone": "+44 9999 888888",
    "status": "Qualified",
    "updatedAt": "2024-12-29T10:00:00.000Z"
  }'

# Expected response:
# {"status":"success","message":"Successfully updated user 123","updated":true}

# Verify user updated in WasteTrade
curl -X GET "https://wastetrade-api-dev.b13devops.com/users/123" \
  -H "Authorization: Bearer $TOKEN"

# Check sync logs
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/logs?objectType=Lead" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Test Verification → Lead Conversion

```bash
# Approve/verify haulier (converts Lead to Account + Contact)
curl -X PATCH "https://wastetrade-api-dev.b13devops.com/admin/users/123/approve" \
  -H "Authorization: Bearer $TOKEN"

# Check Salesforce:
# - Lead should be converted
# - Account created with company data
# - Contact created with user data
# - User.salesforceContactId populated
# - Company.salesforceAccountId populated
```

### 5. Test Loop Prevention

```bash
# Send webhook with WasteTrade origin marker
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/webhook/lead-updated" \
  -H "x-salesforce-secret: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "00Qxx000001234567",
    "externalId": "PROD_123",
    "email": "test@example.com",
    "originMarker": "WT_20241229_100000",
    "updatedAt": "2024-12-29T10:00:00.000Z"
  }'

# Expected response:
# {"status":"success","message":"Update ignored - originated from WasteTrade","updated":false,"reason":"loop_prevention"}

# Verify log created with success status
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/logs?objectType=Lead" \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Test Stale Event Rejection

```bash
# Update user in WasteTrade first
curl -X PATCH "https://wastetrade-api-dev.b13devops.com/users/123" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Latest"}'

# Try to send older webhook update
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/webhook/lead-updated" \
  -H "x-salesforce-secret: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "00Qxx000001234567",
    "externalId": "PROD_123",
    "firstName": "Older",
    "updatedAt": "2024-12-28T10:00:00.000Z"
  }'

# Expected response:
# {"status":"error","message":"Stale update - WasteTrade has newer data","updated":false,"reason":"stale_event"}
```

### 7. Test Account and Contact Webhooks

```bash
# Test Account update
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/webhook/account-updated" \
  -H "x-salesforce-secret: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "001xx000003DGbIAAW",
    "externalId": "PROD_456",
    "name": "Updated Company Name",
    "billingCountry": "UK",
    "billingCity": "London",
    "updatedAt": "2024-12-29T10:00:00.000Z"
  }'

# Test Contact update
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/webhook/contact-updated" \
  -H "x-salesforce-secret: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "003xx000004TmiOAAS",
    "externalId": "PROD_123",
    "firstName": "Jane",
    "lastName": "Updated",
    "updatedAt": "2024-12-29T10:00:00.000Z"
  }'

# Check logs for both
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/logs" \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Test Load Generation and Sync

```bash
# Accept haulage offer (generates loads automatically)
curl -X PATCH "https://wastetrade-api-dev.b13devops.com/admin/haulage-offers/456/accept" \
  -H "Authorization: Bearer $TOKEN"

# Expected: Creates 3 loads if numberOfLoads=3
# Load 1: loadNumber="1 of 3", status="Awaiting Collection"
# Load 2: loadNumber="2 of 3", status="Awaiting Collection"
# Load 3: loadNumber="3 of 3", status="Awaiting Collection"

# View loads for haulage offer
curl -X GET "https://wastetrade-api-dev.b13devops.com/haulage-offers/456/loads" \
  -H "Authorization: Bearer $TOKEN"

# Check Salesforce for Haulage_Loads__c records
# Each load should have:
# - Haulage_Offer__c = Salesforce ID of parent offer
# - load_number__c = "1 of 3", etc.
# - load_status__c = "Awaiting Collection"
```

### 9. Test Load Update Webhook (Salesforce → WasteTrade)

```bash
# Simulate Salesforce updating load details
curl -X POST "https://wastetrade-api-dev.b13devops.com/salesforce/webhook/load-updated" \
  -H "x-salesforce-secret: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "loadId": "a0Xxx000000AbCDEFG",
    "haulageOfferId": "PROD_789",
    "loadNumber": "1 of 3",
    "collectionDate": "2024-12-30",
    "grossWeight": "25000",
    "palletWeight": "1000",
    "loadStatus": "In Transit",
    "updatedAt": "2024-12-29T10:00:00.000Z"
  }'

# Verify load updated in WasteTrade
curl -X GET "https://wastetrade-api-dev.b13devops.com/haulage-offers/456/loads" \
  -H "Authorization: Bearer $TOKEN"

# Check sync logs
curl -X GET "https://wastetrade-api-dev.b13devops.com/salesforce/sync/logs?objectType=Haulage_Loads__c" \
  -H "Authorization: Bearer $TOKEN"
```

### 10. Database Verification

```sql
-- View all inbound operations
SELECT * FROM salesforce_sync_logs 
WHERE direction = 'INBOUND' 
ORDER BY created_at DESC;

-- Count by direction and status
SELECT direction, status, COUNT(*) 
FROM salesforce_sync_logs 
GROUP BY direction, status;

-- View Lead operations
SELECT * FROM salesforce_sync_logs 
WHERE object_type = 'Lead' 
ORDER BY created_at DESC;

-- Check user Salesforce IDs
SELECT id, email, salesforce_lead_id, salesforce_contact_id 
FROM users 
WHERE salesforce_lead_id IS NOT NULL;

-- Check company Salesforce IDs
SELECT id, name, salesforce_id, salesforce_account_id 
FROM companies 
WHERE salesforce_account_id IS NOT NULL;

-- View haulage loads
SELECT hl.*, ho.status as offer_status 
FROM haulage_loads hl
JOIN haulage_offers ho ON hl.haulage_offer_id = ho.id
ORDER BY hl.created_at DESC;

-- Check load sync status
SELECT id, load_number, load_status, is_synced_salesforce, salesforce_id
FROM haulage_loads
WHERE is_synced_salesforce = true;
```

## Salesforce Configuration Required

### 1. Custom Fields (Should Already Exist)

**Lead Object**:
- `ExternalId__c` (Text, External ID, Unique) - WasteTrade User ID
- `VAT_Number__c` (Text)
- `Company_Registration_Number__c` (Text)
- `Last_Sync_Origin__c` (Text) - Loop prevention marker

**Account Object**:
- `ExternalId__c` (Text, External ID, Unique) - WasteTrade Company ID
- `VAT_Number__c` (Text)
- `Company_Registration_Number__c` (Text)
- `Last_Sync_Origin__c` (Text)

**Contact Object**:
- `ExternalId__c` (Text, External ID, Unique) - WasteTrade User ID
- `Last_Sync_Origin__c` (Text)

### 2. Salesforce Flow/Process Builder

Create flows to call WasteTrade webhooks when records are updated:

**Lead Update Flow**:
- Trigger: After Update on Lead
- Condition: Check if `Last_Sync_Origin__c` != 'WasteTrade'
- Action: HTTP Callout to `https://your-domain.com/salesforce/webhook/lead-updated`

**Account Update Flow**:
- Trigger: After Update on Account
- Condition: Check if `Last_Sync_Origin__c` != 'WasteTrade'
- Action: HTTP Callout to `https://your-domain.com/salesforce/webhook/account-updated`

**Contact Update Flow**:
- Trigger: After Update on Contact
- Condition: Check if `Last_Sync_Origin__c` != 'WasteTrade'
- Action: HTTP Callout to `https://your-domain.com/salesforce/webhook/contact-updated`

**Haulage Load Update Flow** (or use Apex below):
- Trigger: After Update on Haulage_Loads__c
- Condition: Check if `Last_Sync_Origin__c` != 'WasteTrade'
- Action: HTTP Callout to `https://your-domain.com/salesforce/webhook/load-updated`

### 2.1 Apex Trigger for Load Updates 
wastetrade-backend\docs\salesforce\apex\HaulageLoadsTrigger.trigger

**Auto-Generation**:
- Triggered when haulage offer status → ACCEPTED
- Creates N loads based on `numberOfLoads` field
- Sequential numbering: "1 of 3", "2 of 3", "3 of 3"
- Initial status: "Awaiting Collection"
- Auto-syncs to Salesforce after creation

## Related Documentation

- **Push Haulier Data Spec**: `docs/Phase 2/Work Package 2/CU-869abxxvx_Push_Haulier_Data.md`
- **Logging Implementation**: `docs/Phase 2/Work Package 2/SALESFORCE_LOGGING_IMPLEMENTATION.md`
- **CRM Alignment**: `docs/Phase 2/Work Package 2/CU-869abxxq7_CRM_Alignment.md`
- **Salesforce Setup**: `docs/salesforce/README.md`
- **Field Mappings**: `docs/salesforce/fields/`
