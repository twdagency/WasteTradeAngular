# Sales Listing (Sales_Listing__c)

**API Name:** `Sales_Listing__c`

**Total Fields:** 46

---

## Standard Fields (12)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Record ID | `Id` | id | ✓ |  |  |  |
| Owner ID | `OwnerId` | reference | ✓ |  |  |  |
| Deleted | `IsDeleted` | boolean | ✓ |  |  |  |
| Sales Listing Name | `Name` | string |  |  |  |  |
| Currency ISO Code | `CurrencyIsoCode` | picklist |  |  |  |  |
| Created Date | `CreatedDate` | datetime | ✓ |  |  |  |
| Created By ID | `CreatedById` | reference | ✓ |  |  |  |
| Last Modified Date | `LastModifiedDate` | datetime | ✓ |  |  |  |
| Last Modified By ID | `LastModifiedById` | reference | ✓ |  |  |  |
| System Modstamp | `SystemModstamp` | datetime | ✓ |  |  |  |
| Last Viewed Date | `LastViewedDate` | datetime |  |  |  |  |
| Last Referenced Date | `LastReferencedDate` | datetime |  |  |  |  |


## Custom Fields (34)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| WasteTrade Listing Id | `WasteTrade_Listing_Id__c` | string |  |  | ✓ |  |
| Last Sync Origin | `Last_Sync_Origin__c` | string |  |  |  | Auto-populated by sync process. WT_ = from WasteTr |
| WasteTrade Publication Status | `WasteTrade_Publication_Status__c` | picklist |  |  |  |  |
| Pickup_Location_Address | `Pickup_Location_Address__c` | textarea |  |  |  |  |
| Material | `Material__c` | picklist |  |  |  |  |
| Material Origin Country Restricted | `Material_Origin_Country_Restricted__c` | boolean | ✓ |  |  |  |
| Packaging Type | `Packaging_Type__c` | picklist |  |  |  |  |
| Storage Type | `Storage_Type__c` | picklist |  |  |  |  |
| Material Weight (MT) | `Material_Weight__c` | double |  |  |  |  |
| Indicated Price | `Indicated_Price__c` | currency |  |  |  |  |
| WasteTrade Site Id | `WasteTrade_Site_Id__c` | string |  |  | ✓ |  |
| Available From Date | `Available_From_Date__c` | date |  |  |  |  |
| Sales Listing Link | `Sales_Listing_Link__c` | url |  |  |  |  |
| Sales Listing Featured Image Link | `Sales_Listing_Featured_Image_Link__c` | url |  |  |  |  |
| Email Notification Campaign | `Email_Notification_Campaign__c` | reference |  |  |  |  |
| Generate Engagement Campaign | `Generate_Engagement_Campaign__c` | boolean | ✓ |  |  | Generates a Salesforce campaign and campaign membe |
| Sales Listing Featured Image Link 2 | `Sales_Listing_Featured_Image_Link_2__c` | url |  |  |  |  |
| Sales Listing Featured Image Link 3 | `Sales_Listing_Featured_Image_Link_3__c` | url |  |  |  |  |
| Send Engagement Email Timestamp | `Send_Engagement_Email_Timestamp__c` | datetime |  |  |  | Datetime at which Send Engagement Email checkbox w |
| Send Engagement Email | `Send_Engagement_Email__c` | boolean | ✓ |  |  | Send engagement email to associated campaign via P |
| Linked to Account Engagement | `Linked_to_Account_Engagement__c` | boolean | ✓ |  |  |  |
| Send to Account Engagement | `Send_to_Account_Engagement__c` | boolean | ✓ |  |  | Include listing in automation to fetch Pardot camp |
| Material Group | `Group__c` | string |  |  |  |  |
| Listing Status | `Listing_Status__c` | picklist |  |  |  |  |
| Material Type | `Material_Type__c` | string |  |  |  |  |
| Material Packing | `Material_Packing__c` | string |  |  |  |  |
| Sales Listing Name | `Sales_Listing_Name__c` | string |  |  |  |  |
| WasteTrade User ID | `WasteTrade_User_Id__c` | string |  |  |  |  |
| Description | `Description__c` | textarea |  |  |  |  |
| Price Per Tonne | `Price_Per_Tonne__c` | currency |  |  |  |  |
| Created Date | `Created_Date__c` | datetime |  |  |  |  |
| Available Until | `Available_Until__c` | date |  |  |  |  |
| Number of Loads | `Number_of_Loads__c` | double |  |  |  |  |
| Additional Information | `Additional_Information__c` | textarea |  |  |  |  |


## Picklist Values

### Currency ISO Code (`CurrencyIsoCode`)

**Active Values:** 3

```
- "GBP" (default)
- "EUR"
- "USD"
```

### WasteTrade Publication Status (`WasteTrade_Publication_Status__c`)

**Active Values:** 8

```
- "Draft" (default)
- "Published"
- "Archived"
- "Available"
- "Sold"
- "Expired"
- "Pending"
- "Approved"
```

### Material (`Material__c`)

**Active Values:** 14

```
- "ABS"
- "ACRYLIC"
- "EPS"
- "HDPE"
- "LDPE"
- "OTHER (MIX)"
- "OTHER (SINGLE SOURCES)"
- "PC"
- "PE"
- "PET"
- "Plastic"
- "PP"
- "PS"
- "PVC"
```

### Packaging Type (`Packaging_Type__c`)

**Active Values:** 10

```
- "Agglomerate"
- "Bags"
- "Bales"
- "Granules"
- "Loose"
- "Lumps"
- "Prime"
- "Regrind"
- "Rolls"
- "Shred"
```

### Storage Type (`Storage_Type__c`)

**Active Values:** 2

```
- "Indoors"
- "Outdoors"
```

### Listing Status (`Listing_Status__c`)

**Active Values:** 6

```
- "Approved"
- "Pending Approval"
- "Rejected"
- "Available"
- "Sold"
- "Expired"
```

