# Salesforce Script Utilities

Shared utilities for Salesforce integration scripts. These modules provide reusable functions to avoid code duplication.

## Modules

### salesforce-utils.js

Core Salesforce operations using jsforce and Metadata API.

**Connection Management:**
- `createConnection()` - Create authenticated Salesforce connection

**Field Operations:**
- `checkFieldExists(conn, fieldName)` - Check if custom field exists
- `createField(conn, fieldDefinition)` - Create custom field
- `processFields(conn, fields, options)` - Batch process multiple fields
- `getObjectFields(conn, objectName, options)` - Get object field metadata
- `checkRequiredFields(conn, objectName, fieldNames)` - Verify required fields exist

**Field Builders:**
- `createPicklistField(object, field, label, values, options)` - Build picklist definition
- `createTextField(object, field, label, options)` - Build text field definition

**Apex Operations:**
- `getApexClass(conn, className)` - Query Apex class metadata

**Utilities:**
- `printSummary(results, label)` - Print formatted summary

### webhook-utils.js

Webhook testing and health check utilities.

**Testing:**
- `testWebhook(endpoint, options)` - Test single webhook endpoint
- `testWebhooks(endpoints, options)` - Test multiple endpoints
- `waitForService(healthEndpoint, options)` - Wait for service to be ready

## Usage Examples

### Creating Fields

```javascript
const { 
    createConnection, 
    processFields, 
    createPicklistField 
} = require('./lib/salesforce-utils');

const fields = [
    createPicklistField('Contact', 'Status__c', 'Status', [
        { value: 'ACTIVE', label: 'Active', isDefault: true },
        { value: 'INACTIVE', label: 'Inactive' },
    ]),
];

const conn = await createConnection();
const results = await processFields(conn, fields);
```

### Testing Webhooks

```javascript
const { testWebhooks } = require('./lib/webhook-utils');

const endpoints = [
    '/api/webhook/test',
    '/api/health',
];

const results = await testWebhooks(endpoints);
console.log(`Passed: ${results.passed}, Failed: ${results.failed}`);
```

### Checking Fields

```javascript
const { 
    createConnection, 
    checkRequiredFields 
} = require('./lib/salesforce-utils');

const conn = await createConnection();
const results = await checkRequiredFields(conn, 'Contact', [
    'Email__c',
    'Phone__c',
]);

console.log(results); // { Email__c: true, Phone__c: false }
```

## Environment Variables

All utilities use standard Salesforce environment variables:

- `SALESFORCE_USERNAME` - Salesforce username
- `SALESFORCE_PASSWORD` - Salesforce password
- `SALESFORCE_SECURITY_TOKEN` - Security token
- `SALESFORCE_SANDBOX_URL` - Sandbox login URL
- `SALESFORCE_PRODUCTION_URL` - Production login URL
- `SALESFORCE_API_VERSION` - API version (default: 58.0)
- `API_URL` - Backend API URL for webhook testing
- `SALESFORCE_WEBHOOK_SECRET` - Webhook authentication secret

## Salesforce Objects

The config includes all WasteTrade-related Salesforce objects:

**Standard Objects:**
- `Account` - Company/organization records
- `Contact` - User/person records
- `Lead` - Potential customer records

**Custom Objects - Listings:**
- `Sales_Listing__c` - Waste material listings for sale
- `Wanted_Listings__c` - Wanted/buy listings

**Custom Objects - Offers:**
- `Offers__c` - Purchase offers on listings
- `Haulage_Offers__c` - Transportation service offers

**Custom Objects - Documents:**
- `Document__c` - Document metadata records
- `ContentVersion` - File versions (standard)
- `ContentDocument` - File records (standard)
- `ContentDocumentLink` - File-to-record links (standard)
