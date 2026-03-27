# Salesforce Implementation Flow

Complete workflow for implementing Salesforce integration tasks from ClickUp to production deployment.

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Implementation Checklist](#pre-implementation-checklist)
3. [Implementation Flow](#implementation-flow)
4. [Field Management](#field-management)
5. [Mapping Implementation](#mapping-implementation)
6. [Testing & Validation](#testing--validation)
7. [Deployment Checklist](#deployment-checklist)

---

## Overview

This document provides a step-by-step flow for implementing Salesforce integration tasks, ensuring all fields exist, mappings are correct, and data flows bidirectionally between WasteTrade and Salesforce.

### Key Principles

- **Check before create**: Always verify field existence before creating
- **Document everything**: Update field documentation after changes
- **Test in sandbox**: Never test directly in production
- **Bidirectional sync**: Consider both outbound (WT→SF) and inbound (SF→WT) flows
- **Loop prevention**: Always implement sync origin tracking

---

## Pre-Implementation Checklist

Before starting any Salesforce task:

- [ ] Read the ClickUp task description thoroughly
- [ ] Identify affected Salesforce objects (Account, Lead, Custom Objects)
- [ ] Identify affected WasteTrade models (Company, User, Listing, etc.)
- [ ] Check existing documentation in `docs/salesforce/`
- [ ] Verify Salesforce connection: `node scripts/test-salesforce-connection.js`
- [ ] Ensure you're working in the correct environment (Sandbox/Production)

---

## Implementation Flow

### Step 1: Analyze Requirements

**Actions:**
1. Read ClickUp task: https://app.clickup.com/t/[TASK_ID]
2. Identify data flow direction:
   - Outbound only (WT → SF)
   - Inbound only (SF → WT)
   - Bidirectional (WT ↔ SF)
3. List all fields involved
4. Identify business logic requirements

**Output:**
- Clear understanding of what needs to be implemented
- List of Salesforce objects and fields
- List of WasteTrade models and properties

---

### Step 2: Check Documentation

**Check existing field documentation:**

```bash
# View field documentation
cat docs/salesforce/fields/Account.md
cat docs/salesforce/fields/Lead.md
cat docs/salesforce/fields/Sales_Listing.md
cat docs/salesforce/fields/Haulage_Offers.md
# ... etc
```

**Key files to review:**
- `docs/salesforce/fields/README.md` - Field documentation overview
- `docs/salesforce/fields/[Object].md` - Specific object fields
- `docs/salesforce/SALESFORCE_SETUP_GUIDE.md` - Setup instructions
- `docs/salesforce/INBOUND_WEBHOOK_SETUP_GUIDE.md` - Webhook configuration

**Questions to answer:**
- Do all required fields exist in Salesforce?
- Are field types correct (text, picklist, number, etc.)?
- Are External ID fields configured?
- Are picklist values defined?

---

### Step 3: Check Field Existence

**Run field check script:**

```bash
cd wastetrade-backend
node scripts/check-salesforce-fields.js
```

**Script output will show:**
- ✅ Existing fields
- ❌ Missing fields
- ⚠️ Type mismatches

**Example output:**
```
Checking Account fields...
✅ WasteTrade_Company_Id__c (External ID)
✅ Company_Type__c (Picklist)
❌ Missing: New_Custom_Field__c
⚠️ Type mismatch: Phone (expected: Phone, got: Text)
```

---

### Step 4: Create Missing Fields

**Option A: Create via Salesforce UI**

1. **Setup → Object Manager → [Object Name]**
2. **Fields & Relationships → New**
3. Configure field:
   - **Data Type**: Text, Number, Picklist, etc.
   - **Field Label**: Human-readable name
   - **Field Name**: API name (auto-generated, ends with `__c`)
   - **Length/Precision**: As required
   - **Required**: Check if mandatory
   - **Unique**: Check if must be unique
   - **External ID**: Check if used for upsert
4. **Field-Level Security**: Grant access to profiles
5. **Page Layouts**: Add to relevant layouts
6. **Save**

**Option B: Create via Script**

```bash
# Create missing fields automatically
node scripts/create-salesforce-fields.js
```

**Script will:**
- Read field definitions from code
- Create missing fields in Salesforce
- Set field-level security
- Configure External ID flags

**Important**: After creating fields via script, you still need to:
- Add fields to page layouts manually
- Configure picklist values manually
- Set field help text manually

---

### Step 5: Configure Field Permissions

**For each new field:**

1. **Setup → Users → Profiles**
2. Select profile (e.g., "System Administrator", "Standard User")
3. **Object Settings → [Object Name]**
4. **Edit** field-level security
5. Grant **Read** and **Edit** access
6. **Save**

**Profiles to configure:**
- System Administrator
- Standard User
- Integration User (if exists)
- Any custom profiles

---

### Step 6: Configure Picklist Values

**For picklist fields:**

1. **Setup → Object Manager → [Object] → Fields & Relationships**
2. Click on picklist field
3. **New** under "Picklist Values"
4. Add values one by one or bulk add
5. Set default value if needed
6. **Save**

**Example: Transport_Provider__c**
```
Values:
- Own Haulage (default)
- Third Party Haulier
- Mixed Haulage
```

**Important**: Picklist values are case-sensitive and must match exactly in mapping code!

---

### Step 7: Update Field Documentation

**Refresh field documentation:**

```bash
cd wastetrade-backend
node scripts/export-field-configs.js
```

**Script will:**
- Connect to Salesforce
- Fetch latest field metadata
- Generate updated markdown files in `docs/salesforce/fields/`

**Verify changes:**
```bash
git diff docs/salesforce/fields/
```

**Commit documentation:**
```bash
git add docs/salesforce/fields/
git commit -m "docs: update Salesforce field documentation"
```

---

## Field Management

### Field Naming Conventions

**Salesforce API Names:**
- Custom fields end with `__c`: `WasteTrade_Company_Id__c`
- Custom objects end with `__c`: `Sales_Listing__c`
- Relationship fields end with `__r`: `Account__r`
- Standard fields: `Name`, `Email`, `Phone`

**WasteTrade Property Names:**
- camelCase: `companyId`, `companyType`
- snake_case in database: `company_id`, `company_type`

### External ID Fields

**Purpose**: Used for upsert operations to match records between systems

**Required External ID fields:**

| Salesforce Object | External ID Field | WasteTrade Source |
|-------------------|-------------------|-------------------|
| Account | `WasteTrade_Company_Id__c` | `Company.id` |
| Lead | `WasteTrade_User_Id__c` | `User.id` |
| Contact | `WasteTrade_User_Id__c` | `User.id` |
| Sales_Listing__c | `WasteTrade_Listing_Id__c` | `Listing.id` |
| Wanted_Listings__c | `WasteTrade_Listing_Id__c` | `Listing.id` |
| Offers__c | `WasteTrade_Offer_Id__c` | `Offer.id` |
| Haulage_Offers__c | `WasteTrade_Haulage_Offers_ID__c` | `HaulageOffer.id` |
| Document__c | `WasteTrade_Document_ID__c` | `Document.id` |

**Creating External ID field:**
1. Create as Text field
2. Length: 255
3. Check "External ID"
4. Check "Unique"
5. Check "Case Insensitive" (recommended)

### Loop Prevention Field

**Field**: `Last_Sync_Origin__c`

**Purpose**: Prevent infinite sync loops between WasteTrade and Salesforce

**Create via script:**
```bash
node scripts/add-sync-origin-field.js
```

**How it works:**
- WasteTrade sets `Last_Sync_Origin__c = 'WT_<timestamp>'` when syncing to SF
- Salesforce triggers check this field before sending webhooks
- If starts with `WT_`, skip webhook (update came from WasteTrade)

---

## Mapping Implementation

### Step 8: Check Existing Mappings

**Review mapping files:**

```bash
# Object mappers (WT → SF)
cat src/utils/salesforce-object-mappers.utils.ts

# Field mappers (bidirectional)
cat src/utils/salesforce-mapping.utils.ts

# Sync utilities
cat src/utils/salesforce-sync.utils.ts
```

**Key mapping functions:**

| Function | Purpose | File |
|----------|---------|------|
| `mapCompanyToAccount()` | Company → Account | salesforce-object-mappers.utils.ts |
| `mapUserToLead()` | User → Lead | salesforce-object-mappers.utils.ts |
| `mapListingToSalesListing()` | Listing → Sales_Listing__c | salesforce-object-mappers.utils.ts |
| `mapAccountToCompany()` | Account → Company | salesforce-mapping.utils.ts |
| `mapLeadToUser()` | Lead → User | salesforce-mapping.utils.ts |

---

### Step 9: Implement Outbound Mapping (WT → SF)

**Location**: `src/utils/salesforce-object-mappers.utils.ts`

**Pattern:**

```typescript
export function mapEntityToSalesforceObject(
  entity: EntityModel,
  existingSfRecord?: any
): any {
  const mapped: any = {
    // External ID for upsert
    WasteTrade_Entity_Id__c: entity.id?.toString(),
    
    // Standard fields
    Name: entity.name,
    
    // Custom fields
    Custom_Field__c: mapCustomField(entity.customField),
    
    // Picklist fields (must match exact values)
    Status__c: mapStatus(entity.status),
    
    // Loop prevention
    Last_Sync_Origin__c: `WT_${Date.now()}`,
  };

  // Handle optional fields
  if (entity.optionalField) {
    mapped.Optional_Field__c = entity.optionalField;
  }

  // Preserve Salesforce-only fields
  if (existingSfRecord) {
    mapped.Salesforce_Only_Field__c = existingSfRecord.Salesforce_Only_Field__c;
  }

  return mapped;
}

// Helper for picklist mapping
function mapStatus(status: string): string {
  const mapping: Record<string, string> = {
    'active': 'Active',
    'inactive': 'Inactive',
    'pending': 'Pending Approval',
  };
  return mapping[status] || 'Active';
}
```

**Best practices:**
- Always include External ID field
- Always set `Last_Sync_Origin__c`
- Map picklist values exactly (case-sensitive)
- Handle null/undefined values
- Preserve Salesforce-only fields
- Add JSDoc comments

---

### Step 10: Implement Inbound Mapping (SF → WT)

**Location**: `src/utils/salesforce-mapping.utils.ts`

**Pattern:**

```typescript
export function mapSalesforceObjectToEntity(
  sfRecord: any
): Partial<EntityModel> {
  const mapped: Partial<EntityModel> = {
    // Map standard fields
    name: sfRecord.Name,
    
    // Map custom fields
    customField: reverseMapCustomField(sfRecord.Custom_Field__c),
    
    // Map picklist fields
    status: reverseMapStatus(sfRecord.Status__c),
    
    // Store Salesforce ID for reference
    salesforceId: sfRecord.Id,
  };

  // Handle optional fields
  if (sfRecord.Optional_Field__c) {
    mapped.optionalField = sfRecord.Optional_Field__c;
  }

  return mapped;
}

// Helper for reverse picklist mapping
function reverseMapStatus(sfStatus: string): string {
  const mapping: Record<string, string> = {
    'Active': 'active',
    'Inactive': 'inactive',
    'Pending Approval': 'pending',
  };
  return mapping[sfStatus] || 'active';
}
```

**Best practices:**
- Handle missing fields gracefully
- Reverse map picklist values
- Store Salesforce ID for reference
- Validate data types
- Add error handling

---

### Step 11: Update Service Layer

**Outbound sync (WT → SF):**

**Location**: `src/services/salesforce-sync.service.ts`

```typescript
async syncEntityToSalesforce(entityId: number): Promise<void> {
  // 1. Fetch entity from database
  const entity = await this.entityRepository.findById(entityId);
  
  // 2. Map to Salesforce format
  const sfData = mapEntityToSalesforceObject(entity);
  
  // 3. Upsert to Salesforce
  const result = await this.salesforceService.upsertRecord(
    'Salesforce_Object__c',
    'WasteTrade_Entity_Id__c',
    sfData
  );
  
  // 4. Store Salesforce ID
  await this.entityRepository.updateById(entityId, {
    salesforceId: result.id,
    lastSyncedAt: new Date(),
  });
}
```

**Inbound sync (SF → WT):**

**Location**: `src/services/salesforce-webhook.service.ts`

```typescript
async handleEntityWebhook(payload: any): Promise<void> {
  // 1. Check loop prevention
  if (payload.Last_Sync_Origin__c?.startsWith('WT_')) {
    console.log('Skipping webhook - originated from WasteTrade');
    return;
  }
  
  // 2. Find entity by External ID
  const externalId = payload.WasteTrade_Entity_Id__c;
  const entity = await this.entityRepository.findOne({
    where: { id: parseInt(externalId) }
  });
  
  if (!entity) {
    throw new Error(`Entity not found: ${externalId}`);
  }
  
  // 3. Map Salesforce data to WasteTrade format
  const updates = mapSalesforceObjectToEntity(payload);
  
  // 4. Update entity
  await this.entityRepository.updateById(entity.id, updates);
}
```

---

### Step 12: Configure Webhooks (Inbound)

**If implementing inbound sync, configure Salesforce triggers:**

**Check existing triggers:**
```bash
cat docs/salesforce/apex/AccountTrigger.trigger
cat docs/salesforce/apex/HaulageOffersTrigger.trigger
```

**Create new trigger if needed:**

1. **Setup → Object Manager → [Object] → Triggers → New**
2. Use template from existing triggers
3. Add loop prevention check
4. Call webhook service
5. **Save**

**Deploy trigger via script:**
```bash
node scripts/deploy-apex-triggers.js
```

**Verify webhook endpoint:**
```bash
# Check webhook controller
cat src/controllers/salesforce-webhook.controller.ts

# Test webhook
node scripts/test-salesforce-webhooks.js
```

---

## Testing & Validation

### Step 13: Unit Testing

**Test mapping functions:**

```typescript
// Test file: src/__tests__/unit/salesforce-mappers.test.ts

describe('mapEntityToSalesforceObject', () => {
  it('should map all required fields', () => {
    const entity = createMockEntity();
    const result = mapEntityToSalesforceObject(entity);
    
    expect(result.WasteTrade_Entity_Id__c).toBe(entity.id.toString());
    expect(result.Name).toBe(entity.name);
    expect(result.Last_Sync_Origin__c).toMatch(/^WT_\d+$/);
  });
  
  it('should map picklist values correctly', () => {
    const entity = createMockEntity({ status: 'active' });
    const result = mapEntityToSalesforceObject(entity);
    
    expect(result.Status__c).toBe('Active');
  });
});
```

**Run tests:**
```bash
pnpm test
```

---

### Step 14: Integration Testing

**Test outbound sync (WT → SF):**

```bash
# Test connection
node scripts/test-salesforce-connection.js

# Sync single record
curl -X POST https://wastetrade-api-dev.b13devops.com/salesforce/sync/entities/1

# Verify in Salesforce UI
# Navigate to object and check record
```

**Test inbound sync (SF → WT):**

```bash
# Test webhook endpoint
node scripts/test-salesforce-webhooks.js

# Manual test: Update record in Salesforce UI
# Check WasteTrade database for updates
```

**Test via API:**

```powershell
# Health check
Invoke-RestMethod -Uri "https://wastetrade-api-dev.b13devops.com/salesforce/health" -Method GET

# Sync entities
Invoke-RestMethod -Uri "https://wastetrade-api-dev.b13devops.com/salesforce/sync/entities?limit=5" -Method POST

# Check sync status
Invoke-RestMethod -Uri "https://wastetrade-api-dev.b13devops.com/salesforce/sync-status" -Method GET
```

---

### Step 15: Verify Data Integrity

**Check in Salesforce:**

1. Navigate to object list view
2. Verify all fields populated correctly
3. Check picklist values match
4. Verify External ID fields populated
5. Check `Last_Sync_Origin__c` field

**Check in WasteTrade:**

```sql
-- Check sync status
SELECT id, name, salesforce_id, last_synced_at 
FROM entities 
WHERE salesforce_id IS NOT NULL;

-- Check recent updates
SELECT id, name, updated_at 
FROM entities 
WHERE updated_at > NOW() - INTERVAL '1 hour';
```

**Verify bidirectional sync:**

1. Update record in WasteTrade → Check Salesforce
2. Update record in Salesforce → Check WasteTrade
3. Verify no infinite loops
4. Check `Last_Sync_Origin__c` prevents loops

---

### Step 16: Error Handling

**Common errors and solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| `REQUIRED_FIELD_MISSING` | Missing required field | Add field to mapping |
| `INVALID_PICKLIST_VALUE` | Wrong picklist value | Check exact spelling/case |
| `DUPLICATE_EXTERNAL_ID` | External ID not unique | Check data integrity |
| `UNABLE_TO_LOCK_ROW` | Concurrent updates | Implement retry logic |
| `REQUEST_LIMIT_EXCEEDED` | Too many API calls | Reduce batch size, add delays |

**Implement error handling:**

```typescript
try {
  await this.salesforceService.upsertRecord(object, externalIdField, data);
} catch (error) {
  if (error.name === 'REQUIRED_FIELD_MISSING') {
    console.error('Missing required field:', error.fields);
    // Log and retry with required fields
  } else if (error.name === 'INVALID_PICKLIST_VALUE') {
    console.error('Invalid picklist value:', error.message);
    // Use default value and log warning
  } else {
    // Log and queue for retry
    await this.queueForRetry(data);
  }
}
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All fields exist in Salesforce Sandbox
- [ ] Field permissions configured
- [ ] Picklist values defined
- [ ] External ID fields configured
- [ ] Loop prevention field added
- [ ] Mappings implemented and tested
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Code reviewed

### Sandbox Deployment

- [ ] Deploy code to Sandbox environment
- [ ] Run migration scripts if needed
- [ ] Test outbound sync (WT → SF)
- [ ] Test inbound sync (SF → WT)
- [ ] Verify no infinite loops
- [ ] Check error logs
- [ ] Perform UAT with stakeholders

### Production Deployment

- [ ] Create fields in Production Salesforce
- [ ] Configure field permissions in Production
- [ ] Deploy Apex triggers to Production
- [ ] Deploy backend code to Production
- [ ] Run migration scripts
- [ ] Monitor sync for first hour
- [ ] Check error logs
- [ ] Verify data integrity
- [ ] Document any issues

### Post-Deployment

- [ ] Monitor sync performance
- [ ] Check API usage limits
- [ ] Review error logs daily
- [ ] Update runbook if needed
- [ ] Close ClickUp task
- [ ] Update team on completion

---

## Quick Reference

### Scripts

```bash
# Connection & Setup
node scripts/test-salesforce-connection.js
node scripts/create-missing-objects.js
node scripts/add-sync-origin-field.js

# Field Management
node scripts/check-salesforce-fields.js
node scripts/create-salesforce-fields.js
node scripts/export-field-configs.js

# Testing
node scripts/test-salesforce-sync.js
node scripts/test-salesforce-webhooks.js

# Deployment
node scripts/deploy-apex-triggers.js
node scripts/deploy-apex.js
```

### API Endpoints

```
GET  /salesforce/health
GET  /salesforce/test-connection
POST /salesforce/sync/companies
POST /salesforce/sync/users
POST /salesforce/sync/listings
POST /salesforce/sync/offers
POST /salesforce/sync/haulage-offers
GET  /salesforce/sync-status
POST /salesforce/webhook/account
POST /salesforce/webhook/contact
POST /salesforce/webhook/haulage-offer
```

### Documentation

- Field configs: `docs/salesforce/fields/`
- Setup guide: `docs/salesforce/SALESFORCE_SETUP_GUIDE.md`
- Webhook guide: `docs/salesforce/INBOUND_WEBHOOK_SETUP_GUIDE.md`
- Apex code: `docs/salesforce/apex/`

---

*Last Updated: December 2024*
