# Document (Document__c)

**API Name:** `Document__c`

**Total Fields:** 23

---

## Standard Fields (11)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Record ID | `Id` | id | ✓ |  |  |  |
| Owner ID | `OwnerId` | reference | ✓ |  |  |  |
| Deleted | `IsDeleted` | boolean | ✓ |  |  |  |
| Document Name | `Name` | string |  |  |  |  |
| Currency ISO Code | `CurrencyIsoCode` | picklist |  |  |  |  |
| Created Date | `CreatedDate` | datetime | ✓ |  |  |  |
| Created By ID | `CreatedById` | reference | ✓ |  |  |  |
| Last Modified Date | `LastModifiedDate` | datetime | ✓ |  |  |  |
| Last Modified By ID | `LastModifiedById` | reference | ✓ |  |  |  |
| System Modstamp | `SystemModstamp` | datetime | ✓ |  |  |  |
| Last Activity Date | `LastActivityDate` | date |  |  |  |  |


## Custom Fields (12)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| WasteTrade Haulage Offer ID | `WasteTrade_Haulage_Offer_Id__c` | double |  |  | ✓ |  |
| Account | `Account__c` | reference |  |  |  |  |
| WasteTrade Document ID | `WasteTrade_Document_Id__c` | string |  | ✓ | ✓ |  |
| Expiry Date | `Expiry_Date__c` | date |  |  |  |  |
| Rejection Reason | `Rejection_Reason__c` | string |  |  |  |  |
| Document Type | `Document_Type__c` | string |  |  |  |  |
| Reviewed At | `Reviewed_At__c` | datetime |  |  |  |  |
| Uploaded By | `Uploaded_By__c` | string |  |  |  |  |
| Reviewed By | `Reviewed_By__c` | string |  |  |  |  |
| Document URL | `Document_URL__c` | url |  |  |  |  |
| Document Status | `Document_Status__c` | string |  |  |  |  |
| Created Date | `Created_Date__c` | datetime |  |  |  |  |


## Picklist Values

### Currency ISO Code (`CurrencyIsoCode`)

**Active Values:** 3

```
- "GBP" (default)
- "EUR"
- "USD"
```

