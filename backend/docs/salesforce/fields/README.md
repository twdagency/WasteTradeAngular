# Salesforce Field Configurations

This directory contains detailed field configuration documentation for all Salesforce objects used in the WasteTrade integration.

## Files

- **Account.md** - Standard Salesforce Account object (Companies)
- **Lead.md** - Standard Salesforce Lead object (Users before conversion)
- **Sales_Listing.md** - Custom object for waste material listings
- **Wanted_Listings.md** - Custom object for wanted/buy listings
- **Offers.md** - Custom object for offers/bids on listings
- **Haulage_Offers.md** - Custom object for haulage/transport offers
- **Document.md** - Custom object for document management

## How to Update

To refresh these field configurations from Salesforce, run:

```bash
node scripts/export-field-configs.js
```

This script will:
1. Connect to Salesforce using credentials from `.env`
2. Fetch field metadata using the Salesforce Describe API
3. Generate markdown documentation for each object
4. Save files to this directory

## Field Information Included

Each file contains:

- **Object metadata** - API name, label, total field count
- **Standard fields** - Built-in Salesforce fields
- **Custom fields** - Fields ending with `__c`
- **Relationship fields** - Fields ending with `__r`
- **Picklist values** - All active picklist options with defaults

## Field Table Columns

| Column | Description |
|--------|-------------|
| Field Label | Human-readable field name |
| API Name | Technical field name used in code |
| Type | Data type (string, picklist, boolean, etc.) |
| Required | ✓ if field cannot be null |
| Unique | ✓ if field must be unique |
| External ID | ✓ if field is used for upsert operations |
| Description | Field help text (first 50 chars) |

## Using This Documentation

### For Developers

When mapping WasteTrade data to Salesforce:

1. Check the field type to ensure correct data format
2. Verify picklist values match exactly (case-sensitive)
3. Identify External ID fields for upsert operations
4. Check required fields to avoid sync failures

### For Picklist Mappings

All picklist values are listed in the "Picklist Values" section of each file. Use these exact values in your mapping functions:

```typescript
// Example from Haulage_Offers.md
Transport_Provider__c values:
- "Own Haulage"
- "Third Party Haulier"
- "Mixed Haulage"

// Mapping function should return these exact strings
export function mapTransportProvider(provider: string): string {
    const mapping = {
        'own_haulage': 'Own Haulage',
        'third_party': 'Third Party Haulier',
        'mixed': 'Mixed Haulage',
    };
    return mapping[provider] || 'Own Haulage';
}
```

## External ID Fields

External ID fields are used for upsert operations to match WasteTrade records with Salesforce records:

- **Account**: `WasteTrade_Company_ID__c`
- **Lead**: `WasteTrade_User_ID__c`
- **Sales_Listing__c**: `WasteTrade_Listing_ID__c`
- **Wanted_Listings__c**: `WasteTrade_Wanted_Listing_ID__c`
- **Offers__c**: `WasteTrade_Offer_ID__c`
- **Haulage_Offers__c**: `WasteTrade_Haulage_Offers_ID__c`
- **Document__c**: `WasteTrade_Document_ID__c`

## Notes

- Field configurations are fetched from the Salesforce environment specified in `.env`
- Sandbox and Production may have different field configurations
- Always test mappings in Sandbox before deploying to Production
- Picklist values can be added in Salesforce without code changes, but mappings may need updates
