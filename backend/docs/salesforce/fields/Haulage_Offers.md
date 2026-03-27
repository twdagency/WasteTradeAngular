# Haulage Offers (Haulage_Offers__c)

**API Name:** `Haulage_Offers__c`

**Total Fields:** 41

---

## Standard Fields (13)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Record ID | `Id` | id | ✓ |  |  |  |
| Owner ID | `OwnerId` | reference | ✓ |  |  |  |
| Deleted | `IsDeleted` | boolean | ✓ |  |  |  |
| Haulage Offers Name | `Name` | string |  |  |  |  |
| Currency ISO Code | `CurrencyIsoCode` | picklist |  |  |  |  |
| Created Date | `CreatedDate` | datetime | ✓ |  |  |  |
| Created By ID | `CreatedById` | reference | ✓ |  |  |  |
| Last Modified Date | `LastModifiedDate` | datetime | ✓ |  |  |  |
| Last Modified By ID | `LastModifiedById` | reference | ✓ |  |  |  |
| System Modstamp | `SystemModstamp` | datetime | ✓ |  |  |  |
| Last Activity Date | `LastActivityDate` | date |  |  |  |  |
| Last Viewed Date | `LastViewedDate` | datetime |  |  |  |  |
| Last Referenced Date | `LastReferencedDate` | datetime |  |  |  |  |


## Custom Fields (28)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Customs Clearance | `Customs_Clearance__c` | picklist |  |  |  |  |
| Transport Provider | `Transport_Provider__c` | picklist |  |  |  |  |
| Bid ID | `bid_id__c` | string |  |  |  |  |
| Container Rate Valid Until | `container_rate_valid_until__c` | date |  |  |  |  |
| Container Type | `container_type__c` | picklist |  |  |  |  |
| Demurrage | `demurrage__c` | picklist |  |  |  |  |
| Destination Charges | `destination_charges__c` | picklist |  |  |  |  |
| Expected Transit Time | `expected__c` | picklist |  |  |  |  |
| Haulage Cost | `haulage__c` | string |  |  |  |  |
| Haulage Currency | `haulage_currency__c` | string |  |  |  |  |
| Haulage Extras | `haulage_extras__c` | string |  |  |  |  |
| Haulage Notes | `haulage_notes__c` | textarea |  |  |  |  |
| Haulage Rejection Reason | `haulage_rejection_reason__c` | string |  |  |  |  |
| Haulage Total | `haulage_total__c` | string |  |  |  |  |
| Haulier Listing Status | `haulier_listing_status__c` | picklist |  |  |  |  |
| Listing ID | `listing_id__c` | string |  |  |  |  |
| Listing Sold | `listing_sold__c` | string |  |  |  |  |
| Offer Accepted | `offer_accepted__c` | boolean | ✓ |  |  |  |
| Offer Rejected | `offer_rejected__c` | boolean | ✓ |  |  |  |
| Notes | `post_notes__c` | textarea |  |  |  |  |
| SO Details | `so_details__c` | textarea |  |  |  |  |
| SO PDF | `so_pdf__c` | string |  |  |  |  |
| Suggested Collection Date | `suggested_collection_date__c` | date |  |  |  |  |
| Trailer or Container | `trailer_or_container__c` | picklist |  |  |  |  |
| Trailer Type | `trailer_type__c` | picklist |  |  |  |  |
| Admin | `wt_haulage_admin__c` | string |  |  |  |  |
| WasteTrade Haulage Offers ID | `WasteTrade_Haulage_Offers_ID__c` | string |  |  | ✓ |  |
| Last Sync Origin | `Last_Sync_Origin__c` | string |  |  |  | Auto-populated by sync process. WT_ = from WasteTr |


## Picklist Values

### Currency ISO Code (`CurrencyIsoCode`)

**Active Values:** 3

```
- "GBP" (default)
- "EUR"
- "USD"
```

### Customs Clearance (`Customs_Clearance__c`)

**Active Values:** 3

```
- "Yes"
- "No"
- "Customs Clearance Not Required"
```

### Transport Provider (`Transport_Provider__c`)

**Active Values:** 3

```
- "Own Haulage"
- "Third Party Haulier"
- "Mixed Haulage"
```

### Container Type (`container_type__c`)

**Active Values:** 7

```
- "20' Container"
- "40' Container - Standard"
- "40' Container - High Cube"
- "45' Container - Standard"
- "45' Container - High Cube"
- "20' Open Top Container (OTCs)"
- "40' Open Top Container (OTCs)"
```

### Demurrage (`demurrage__c`)

**Active Values:** 32

```
- "0"
- "1"
- "2"
- "3"
- "4"
- "5"
- "6"
- "7"
- "8"
- "9"
- "10"
- "11"
- "12"
- "13"
- "14"
- "15"
- "16"
- "17"
- "18"
- "19"
- "20"
- "21"
- "22"
- "23"
- "24"
- "25"
- "26"
- "27"
- "28"
- "29"
- "30"
- "31"
```

### Destination Charges (`destination_charges__c`)

**Active Values:** 2

```
- "Shippers Account"
- "Receivers Account"
```

### Expected Transit Time (`expected__c`)

**Active Values:** 7

```
- "1-2 Days"
- "3-4 Days"
- "4-6 Days"
- "1 Week"
- "2 Weeks"
- "3 Weeks"
- "1 Month"
```

### Haulier Listing Status (`haulier_listing_status__c`)

**Active Values:** 7

```
- "Pending Approval"
- "Approved"
- "Rejected"
- "Available"
- "Pending"
- "Sold"
- "Expired"
```

### Trailer or Container (`trailer_or_container__c`)

**Active Values:** 2

```
- "Trailer"
- "Container"
```

### Trailer Type (`trailer_type__c`)

**Active Values:** 4

```
- "Curtain Sider"
- "Containers"
- "Tipper Trucks"
- "Walking Floor"
```

