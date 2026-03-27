# Salesforce Integration Guide

Complete guide for WasteTrade ↔ Salesforce bidirectional sync.

## Quick Start

```bash
# 1. Setup Salesforce fields
node scripts/setup-salesforce-fields.js

# 2. Deploy Apex code
node scripts/deploy-apex-triggers.js

# 3. Test webhooks
node scripts/test-crm-alignment.js
```

## What's Synced

### Outbound (WasteTrade → Salesforce)
| WasteTrade | Salesforce | Trigger |
|------------|------------|---------|
| User | Lead | Registration |
| User | Contact | Verification |
| Company | Account | Status = ACTIVE |
| CompanyUsers | Contact | Status = ACTIVE |
| Listings | Sales_Listing__c | Create/Update |
| Offers | Offers__c | Create/Update |
| HaulageOffers | Haulage_Offers__c | Create/Update |

### Inbound (Salesforce → WasteTrade)
| Salesforce | WasteTrade | Trigger |
|------------|------------|---------|
| Account | Company | Webhook |
| Contact | User/CompanyUsers | Webhook |
| Haulage_Loads__c | HaulageLoads | Webhook |
| ContentDocument | HaulageOfferDocuments | Webhook |

## External ID Fields

| Object | External ID Field | Source |
|--------|-------------------|--------|
| Account | `WasteTrade_Company_Id__c` | `Company.id` |
| Lead | `WasteTrade_User_Id__c` | `User.id` |
| Contact | `WasteTrade_User_Id__c` | `User.id` |
| Sales_Listing__c | `WasteTrade_Listing_Id__c` | `Listing.id` |
| Wanted_Listings__c | `WasteTrade_Listing_Id__c` | `Listing.id` |
| Offers__c | `WasteTrade_Offer_Id__c` | `Offer.id` |
| Haulage_Offers__c | `WasteTrade_Haulage_Offers_ID__c` | `HaulageOffer.id` |

## Loop Prevention

All synced objects use `Last_Sync_Origin__c` field:
- **Outbound**: Set to `WT_{timestamp}`
- **Inbound**: Ignore if starts with `WT_`

```typescript
// Outbound mapping
Last_Sync_Origin__c: `WT_${Date.now()}`
```

```apex
// Apex trigger check
if (record.Last_Sync_Origin__c != null && 
    record.Last_Sync_Origin__c.startsWith('WT_')) {
    continue; // Skip webhook
}
```

## Key Files

| File | Purpose |
|------|---------|
| `src/utils/salesforce-object-mappers.utils.ts` | WT → SF mappings |
| `src/utils/salesforce-mapping.utils.ts` | SF → WT mappings |
| `src/services/salesforce-sync.service.ts` | Outbound sync logic |
| `src/services/salesforce-webhook.service.ts` | Inbound webhook handlers |
| `docs/salesforce/fields/[Object].md` | Field documentation |
| `docs/salesforce/apex/[Object]Trigger.trigger` | Apex triggers |

## Environment Variables

```env
SALESFORCE_USERNAME=your-username@example.com
SALESFORCE_PASSWORD=your-password
SALESFORCE_SECURITY_TOKEN=your-token
SALESFORCE_SANDBOX_URL=https://test.salesforce.com
SALESFORCE_AUTO_SYNC=true
IS_BACKGROUND=true
SALESFORCE_WEBHOOK_SECRET=your-secret-key
```

## Scripts

```bash
node scripts/test-salesforce-connection.js   # Test connection
node scripts/check-salesforce-fields.js      # Check fields
node scripts/create-salesforce-fields.js     # Create missing fields
node scripts/export-field-configs.js         # Update field docs
node scripts/test-salesforce-sync.js         # Test sync
node scripts/test-salesforce-webhooks.js     # Test webhooks
node scripts/deploy-apex-triggers.js         # Deploy Apex
```

## API Endpoints

### Sync
```
POST /salesforce/sync/smart/companies?limit=5
POST /salesforce/sync/smart/users?limit=5
POST /salesforce/sync/smart/listings?limit=5
POST /salesforce/sync/company/{id}
POST /salesforce/sync/user/{id}
```

### Webhooks (Inbound)
```
POST /salesforce/webhook/account-updated
POST /salesforce/webhook/contact-updated
POST /salesforce/webhook/haulage-offer-status
POST /salesforce/webhook/load-updated
```

### Monitoring
```
GET /salesforce/health
GET /salesforce/sync/failed
GET /salesforce/sync/logs/{recordId}
```

## Salesforce URLs

**Sandbox:** https://letsrecycleit--uat.sandbox.my.salesforce.com

| View | Path |
|------|------|
| Accounts | `/lightning/o/Account/list` |
| Leads | `/lightning/o/Lead/list` |
| Contacts | `/lightning/o/Contact/list` |
| Sales Listings | `/lightning/o/Sales_Listing__c/list` |
| Haulage Offers | `/lightning/o/Haulage_Offers__c/list` |
| Object Manager | `/lightning/setup/ObjectManager/home` |

## Common Errors

| Error | Fix |
|-------|-----|
| `REQUIRED_FIELD_MISSING` | Add field to mapping |
| `INVALID_PICKLIST_VALUE` | Check exact spelling/case |
| `DUPLICATE_EXTERNAL_ID` | Check data integrity |
| `UNABLE_TO_LOCK_ROW` | Add retry logic |
| `REQUEST_LIMIT_EXCEEDED` | Reduce batch size |

## Troubleshooting

| Issue | Check |
|-------|-------|
| Company not syncing | Status = ACTIVE, `SALESFORCE_AUTO_SYNC=true` |
| Circular updates | `Last_Sync_Origin__c` field exists |
| Webhook 401 | `SALESFORCE_WEBHOOK_SECRET` matches |
| Stale events | `updatedAt` timestamp in payload |

## Documentation

- `SALESFORCE_SETUP_GUIDE.md` - Initial setup (Connected App, credentials)
- `SALESFORCE_IMPLEMENTATION_FLOW.md` - Step-by-step implementation
- `INBOUND_WEBHOOK_SETUP_GUIDE.md` - Webhook + Apex setup
- `HAULAGE_SYNC_FLOW.md` - Haulage-specific sync
- `SALESFORCE_LOGGING.md` - Logging implementation
- `fields/` - Field configurations (auto-generated)
- `apex/` - Apex triggers and classes
