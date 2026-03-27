# Wanted Listing (Wanted_Listings__c)

**API Name:** `Wanted_Listings__c`

**Total Fields:** 22

---

## Standard Fields (10)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Record ID | `Id` | id | ✓ |  |  |  |
| Owner ID | `OwnerId` | reference | ✓ |  |  |  |
| Deleted | `IsDeleted` | boolean | ✓ |  |  |  |
| Wanted Listing Name | `Name` | string |  |  |  |  |
| Currency ISO Code | `CurrencyIsoCode` | picklist |  |  |  |  |
| Created Date | `CreatedDate` | datetime | ✓ |  |  |  |
| Created By ID | `CreatedById` | reference | ✓ |  |  |  |
| Last Modified Date | `LastModifiedDate` | datetime | ✓ |  |  |  |
| Last Modified By ID | `LastModifiedById` | reference | ✓ |  |  |  |
| System Modstamp | `SystemModstamp` | datetime | ✓ |  |  |  |


## Custom Fields (12)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| WasteTrade Listing ID | `WasteTrade_Listing_Id__c` | string |  | ✓ | ✓ |  |
| Company Name | `Company_Name__c` | string |  |  |  |  |
| Quantity | `Quantity__c` | double |  |  |  |  |
| Material Type | `Material_Type__c` | string |  |  |  |  |
| Available From | `Available_From__c` | datetime |  |  |  |  |
| Comments | `Comments__c` | textarea |  |  |  |  |
| Listing Status | `Listing_Status__c` | string |  |  |  |  |
| How it's packaged | `How_its_packaged__c` | string |  |  |  |  |
| Material Group | `Material_Group__c` | string |  |  |  |  |
| Author ID | `Wt_Author_ID__c` | string |  |  |  |  |
| Created Date | `Created_Date__c` | datetime |  |  |  |  |
| Last Sync Origin | `Last_Sync_Origin__c` | string |  |  |  | Auto-populated by sync process. WT_ = from WasteTr |


## Picklist Values

### Currency ISO Code (`CurrencyIsoCode`)

**Active Values:** 3

```
- "GBP" (default)
- "EUR"
- "USD"
```

