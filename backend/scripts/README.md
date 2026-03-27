# Salesforce Integration Scripts

Utility scripts for managing Salesforce integration, field setup, and testing.

## Quick Reference

```bash
# Connection & Setup
node scripts/test-salesforce-connection.js    # Test connection and check objects
node scripts/setup-salesforce-fields.js       # Create missing custom fields and verify webhooks
node scripts/check-salesforce-fields.js       # Verify required fields exist

# Data Export
node scripts/export-field-configs.js          # Export field configs to markdown

# Testing
node scripts/test-salesforce-webhooks.js health   # Test health endpoint
node scripts/test-salesforce-webhooks.js account  # Test Account trigger
node scripts/test-salesforce-webhooks.js contact  # Test Contact trigger
node scripts/test-salesforce-webhooks.js haulage  # Test Haulage trigger
node scripts/test-salesforce-webhooks.js all      # Test all triggers
```

## Architecture

### Shared Utilities (`lib/`)

All scripts use shared utilities to avoid code duplication:

- **`salesforce-utils.js`** - Core Salesforce operations (connection, fields, Apex)
- **`webhook-utils.js`** - Webhook testing utilities
- **`salesforce-config.js`** - Centralized configuration (objects, fields, mappings)

### Configuration (`salesforce-config.js`)

Centralized configuration includes:

- **Object Names** - All Salesforce objects used in WasteTrade
- **Field Definitions** - Custom field metadata for creation
- **Required Fields** - Fields needed for each object
- **Field Mappings** - WasteTrade to Salesforce field mappings
- **Apex Classes** - Apex class names and methods
- **Webhook Endpoints** - API endpoints for webhooks

## Salesforce Objects

### Standard Objects
- `Account` - Company/organization records
- `Contact` - User/person records  
- `Lead` - Potential customer records

### Custom Objects - Listings
- `Sales_Listing__c` - Waste material listings for sale
- `Wanted_Listings__c` - Wanted/buy listings

### Custom Objects - Offers
- `Offers__c` - Purchase offers on listings
- `Haulage_Offers__c` - Transportation service offers

### Custom Objects - Documents
- `Document__c` - Document metadata records
- `ContentVersion` - File versions (standard)
- `ContentDocument` - File records (standard)
- `ContentDocumentLink` - File-to-record links (standard)

## Scripts

### 1. test-salesforce-connection.js

Tests Salesforce connection and verifies object accessibility.

**What it does:**
- Validates environment variables
- Tests authentication
- Checks all custom objects exist
- Verifies query permissions
- Shows API version info
- Displays user profile

**Usage:**
```bash
node scripts/test-salesforce-connection.js
```

**When to use:**
- First time setup
- Troubleshooting connection issues
- Verifying permissions after profile changes

---

### 2. setup-salesforce-fields.js

Creates missing custom fields in Salesforce and verifies webhook endpoints.

**What it does:**
- Creates all missing custom fields defined in `salesforce-config.js`
- Tests webhook endpoints
- Provides deployment instructions

**Usage:**
```bash
node scripts/setup-salesforce-fields.js
```

**When to use:**
- Initial Salesforce setup
- Adding new environments (sandbox, production)
- After Salesforce org refresh

**Note:** Fields created via Metadata API may need deployment to be visible.

---

### 3. check-salesforce-fields.js

Verifies all required custom fields exist on Salesforce objects.

**What it does:**
- Checks Contact required fields
- Checks Account required fields
- Checks Haulage_Offers__c fields
- Verifies Apex class exists
- Checks Apex class methods

**Usage:**
```bash
node scripts/check-salesforce-fields.js
```

**When to use:**
- After running setup script
- Before deploying triggers
- Troubleshooting sync issues
- Verifying field deployment

---

### 4. export-field-configs.js

Exports complete field configurations to markdown documentation.

**What it does:**
- Fetches all fields from each object
- Groups by standard/custom/relationship
- Lists picklist values
- Generates markdown tables
- Saves to `docs/salesforce/fields/`

**Usage:**
```bash
node scripts/export-field-configs.js
```

**When to use:**
- Documenting Salesforce schema
- Onboarding new developers
- Planning field mappings
- Auditing field usage

**Output:** `docs/salesforce/fields/*.md`

---

### 5. test-salesforce-webhooks.js

Tests Salesforce webhook triggers by updating records.

**What it does:**
- Tests health endpoint
- Updates Account to trigger webhook
- Updates Contact to trigger webhook
- Updates Haulage Offer to trigger webhook
- Provides test results

**Usage:**
```bash
# Test specific trigger
node scripts/test-salesforce-webhooks.js health
node scripts/test-salesforce-webhooks.js account
node scripts/test-salesforce-webhooks.js contact
node scripts/test-salesforce-webhooks.js haulage

# Test all triggers
node scripts/test-salesforce-webhooks.js all
```

**When to use:**
- After deploying Apex triggers
- Testing webhook connectivity
- Debugging sync issues
- Verifying trigger logic

**Requirements:**
- Apex triggers deployed
- Test records with WasteTrade IDs
- Backend API running (for webhook receipt)

---

## Environment Variables

Required in `.env` file:

```bash
# Salesforce Authentication
SALESFORCE_USERNAME=your-username@example.com
SALESFORCE_PASSWORD=your-password
SALESFORCE_SECURITY_TOKEN=your-security-token

# Salesforce URLs
SALESFORCE_SANDBOX_URL=https://test.salesforce.com
SALESFORCE_PRODUCTION_URL=https://login.salesforce.com

# API Configuration
SALESFORCE_API_VERSION=64.0
API_URL=http://localhost:3000

# Webhook Security
SALESFORCE_WEBHOOK_SECRET=your-webhook-secret

# Sync Configuration
SALESFORCE_AUTO_SYNC=true
IS_BACKGROUND=true
```

## Common Workflows

### Initial Setup (New Environment)

1. Configure `.env` with Salesforce credentials
2. Test connection: `node scripts/test-salesforce-connection.js`
3. Create fields: `node scripts/setup-salesforce-fields.js`
4. Verify fields: `node scripts/check-salesforce-fields.js`
5. Deploy Apex triggers (see `docs/salesforce/apex/`)
6. Test webhooks: `node scripts/test-salesforce-webhooks.js all`

### Troubleshooting Sync Issues

1. Check connection: `node scripts/test-salesforce-connection.js`
2. Verify fields: `node scripts/check-salesforce-fields.js`
3. Test specific webhook: `node scripts/test-salesforce-webhooks.js [type]`
4. Check Salesforce debug logs
5. Check WasteTrade backend logs

### Documentation Updates

1. Export field configs: `node scripts/export-field-configs.js`
2. Review generated markdown in `docs/salesforce/fields/`
3. Update field mappings in code if needed

## Best Practices

### DO:
- ✅ Test connection before running other scripts
- ✅ Use shared utilities for new scripts
- ✅ Update config file when adding new objects
- ✅ Document new scripts in this README
- ✅ Check Salesforce debug logs after webhook tests
- ✅ Run scripts in sandbox before production

### DON'T:
- ❌ Add new Salesforce fields without manual configuration
- ❌ Hardcode object names (use config)
- ❌ Duplicate connection logic (use utilities)
- ❌ Run scripts in production without testing
- ❌ Commit credentials to version control
- ❌ Modify existing fields via scripts

## Troubleshooting

### Connection Errors

**Error:** `INVALID_LOGIN`
- Check username and password
- Verify security token is current
- Check IP whitelist in Salesforce
- Verify user account is active

**Error:** `API_DISABLED_FOR_ORG`
- Enable API access in Salesforce
- Check user profile has API permission

### Field Creation Errors

**Error:** `Property 'picklist' not valid`
- API version mismatch
- Use `valueSet` instead of `picklist`
- Check `salesforce-config.js` field definitions

**Error:** `INSUFFICIENT_ACCESS`
- User needs "Modify All Data" permission
- Or "Customize Application" permission
- Check user profile permissions

### Webhook Test Errors

**Error:** `No records found`
- Create test records with WasteTrade IDs
- Use Salesforce UI or data loader
- Check external ID fields exist

**Error:** `Connection refused`
- Start WasteTrade backend API
- Check `API_URL` in `.env`
- Verify webhook secret matches

## Additional Resources

- **Apex Triggers:** `docs/salesforce/apex/`
- **Field Documentation:** `docs/salesforce/fields/`
- **Utility Documentation:** `scripts/lib/README.md`
- **CRM Alignment Guide:** `scripts/README_CRM_ALIGNMENT.md`

## Support

For issues or questions:
1. Check this README
2. Review Salesforce debug logs
3. Check WasteTrade backend logs
4. Review field mappings in `salesforce-config.js`
5. Contact development team
