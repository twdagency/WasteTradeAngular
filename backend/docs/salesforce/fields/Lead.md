# Lead (Lead)

**API Name:** `Lead`

**Total Fields:** 128

---

## Standard Fields (57)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Lead ID | `Id` | id | ✓ |  |  |  |
| Deleted | `IsDeleted` | boolean | ✓ |  |  |  |
| Master Record ID | `MasterRecordId` | reference |  |  |  |  |
| Last Name | `LastName` | string | ✓ |  |  |  |
| First Name | `FirstName` | string |  |  |  |  |
| Salutation | `Salutation` | picklist |  |  |  |  |
| Full Name | `Name` | string | ✓ |  |  |  |
| Title | `Title` | string |  |  |  |  |
| Company | `Company` | string | ✓ |  |  |  |
| Street | `Street` | textarea |  |  |  |  |
| City | `City` | string |  |  |  |  |
| State/Province | `State` | string |  |  |  |  |
| Zip/Postal Code | `PostalCode` | string |  |  |  |  |
| Country | `Country` | string |  |  |  |  |
| Latitude | `Latitude` | double |  |  |  |  |
| Longitude | `Longitude` | double |  |  |  |  |
| Geocode Accuracy | `GeocodeAccuracy` | picklist |  |  |  |  |
| Address | `Address` | address |  |  |  |  |
| Phone | `Phone` | phone |  |  |  |  |
| Mobile Phone | `MobilePhone` | phone |  |  |  |  |
| Fax | `Fax` | phone |  |  |  |  |
| Email | `Email` | email |  |  |  |  |
| Website | `Website` | url |  |  |  |  |
| Photo URL | `PhotoUrl` | url |  |  |  |  |
| Description | `Description` | textarea |  |  |  |  |
| Lead Source | `LeadSource` | picklist |  |  |  |  |
| Status | `Status` | picklist | ✓ |  |  |  |
| Industry | `Industry` | picklist |  |  |  |  |
| Rating | `Rating` | picklist |  |  |  |  |
| Lead Currency | `CurrencyIsoCode` | picklist |  |  |  |  |
| Annual Revenue | `AnnualRevenue` | currency |  |  |  |  |
| Employees | `NumberOfEmployees` | int |  |  |  |  |
| Owner ID | `OwnerId` | reference | ✓ |  |  |  |
| Email Opt Out | `HasOptedOutOfEmail` | boolean | ✓ |  |  |  |
| Converted | `IsConverted` | boolean | ✓ |  |  |  |
| Converted Date | `ConvertedDate` | date |  |  |  |  |
| Converted Account ID | `ConvertedAccountId` | reference |  |  |  |  |
| Converted Contact ID | `ConvertedContactId` | reference |  |  |  |  |
| Converted Opportunity ID | `ConvertedOpportunityId` | reference |  |  |  |  |
| Unread By Owner | `IsUnreadByOwner` | boolean | ✓ |  |  |  |
| Created Date | `CreatedDate` | datetime | ✓ |  |  |  |
| Created By ID | `CreatedById` | reference | ✓ |  |  |  |
| Last Modified Date | `LastModifiedDate` | datetime | ✓ |  |  |  |
| Last Modified By ID | `LastModifiedById` | reference | ✓ |  |  |  |
| System Modstamp | `SystemModstamp` | datetime | ✓ |  |  |  |
| Last Activity | `LastActivityDate` | date |  |  |  |  |
| Do Not Call | `DoNotCall` | boolean | ✓ |  |  |  |
| Fax Opt Out | `HasOptedOutOfFax` | boolean | ✓ |  |  |  |
| Last Viewed Date | `LastViewedDate` | datetime |  |  |  |  |
| Last Referenced Date | `LastReferencedDate` | datetime |  |  |  |  |
| Last Transfer Date | `LastTransferDate` | date |  |  |  |  |
| Data.com Key | `Jigsaw` | string |  |  |  |  |
| Jigsaw Contact ID | `JigsawContactId` | string |  |  |  |  |
| Email Bounced Reason | `EmailBouncedReason` | string |  |  |  |  |
| Email Bounced Date | `EmailBouncedDate` | datetime |  |  |  |  |
| Pronouns | `Pronouns` | picklist |  |  |  |  |
| Gender Identity | `GenderIdentity` | picklist |  |  |  |  |


## Custom Fields (71)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Lead Buyer Intention | `Lead_Buyer_Intention__c` | picklist | ✓ |  |  |  |
| Lead Direction | `Lead_Direction__c` | picklist | ✓ |  |  |  |
| Lead Rating | `Lead_Rating__c` | picklist | ✓ |  |  |  |
| Subsidiary Source | `Subsidiary_Source__c` | picklist |  |  |  |  |
| Enquiry Message | `Enquiry_Message__c` | textarea |  |  |  |  |
| WasteTrade User Id | `WasteTrade_User_Id__c` | string |  |  | ✓ |  |
| WasteTrade Type | `WasteTrade_Type__c` | picklist |  |  |  |  |
| WasteTrade Company Interest | `WasteTrade_Company_Interest__c` | picklist |  |  |  |  |
| LDPE | `LDPE__c` | boolean | ✓ |  |  |  |
| PC | `PC__c` | boolean | ✓ |  |  |  |
| PET | `PET__c` | boolean | ✓ |  |  |  |
| PS | `PS__c` | boolean | ✓ |  |  |  |
| PVC | `PVC__c` | boolean | ✓ |  |  |  |
| HDPE | `HDPE__c` | boolean | ✓ |  |  |  |
| PP | `PP__c` | boolean | ✓ |  |  |  |
| ABS | `ABS__c` | boolean | ✓ |  |  |  |
| EPS | `EPS__c` | boolean | ✓ |  |  |  |
| ACRYLIC | `ACRYLIC__c` | boolean | ✓ |  |  |  |
| OTHER (SINGLE SOURCES) | `OTHER_SINGLE_SOURCES__c` | boolean | ✓ |  |  |  |
| OTHER (MIX) | `OTHER_MIX__c` | boolean | ✓ |  |  |  |
| Marketing Source | `Marketing_Source__c` | picklist |  |  |  |  |
| Company VAT Number | `Company_VAT_Number__c` | string |  |  |  |  |
| Company Registration Number | `Company_Registration_Number__c` | string |  |  |  |  |
| Registered Company Name | `Registered_Company_Name__c` | string |  |  |  |  |
| Engagement Source URL | `Engagement_Source_URL__c` | url |  |  |  |  |
| Business Development Representative | `Business_Development_Representative__c` | reference |  |  |  |  |
| Company VAT Check Complete | `Company_VAT_Check_Complete__c` | boolean | ✓ |  |  |  |
| Phone Opt In | `Phone_Opt_In__c` | boolean | ✓ |  |  |  |
| Email Opt In | `Email_Opt_In__c` | boolean | ✓ |  |  |  |
| Text Opt In | `Text_Opt_In__c` | boolean | ✓ |  |  |  |
| Marketing Opt In | `Marketing_Opt_In__c` | boolean | ✓ |  |  |  |
| Send Text | `Send_Text__c` | boolean | ✓ |  |  |  |
| PE | `PE__c` | boolean | ✓ |  |  |  |
| Sales Representative Name | `Sales_Representative_Name__c` | string |  |  |  |  |
| Verified | `Verified__c` | boolean | ✓ |  |  |  |
| Support User 1 | `Support_User_1__c` | reference |  |  |  |  |
| Support User 2 | `Support_User_2__c` | reference |  |  |  |  |
| FormattedMobilePhone | `rocketphone__FormattedMobilePhone__c` | string |  |  |  |  |
| Phone Number Country Code | `Phone_Number_Country_Code__c` | string |  |  |  |  |
| FormattedPhone | `rocketphone__FormattedPhone__c` | string |  |  |  |  |
| ReferenceId | `rocketphone__ReferenceId__c` | string |  |  |  |  |
| Sync Message | `rocketphone__Sync_Message__c` | textarea |  |  |  |  |
| Sync Status | `rocketphone__Sync_Status__c` | picklist |  |  |  |  |
| Last Sync Origin | `Last_Sync_Origin__c` | string |  |  |  | Auto-populated by sync process. WT_ = from WasteTr |
| WasteTrade User Status | `WasteTrade_User_Status__c` | picklist |  |  |  |  |
| efw | `efw__c` | boolean | ✓ |  |  |  |
| plastic | `plastic__c` | boolean | ✓ |  |  |  |
| fibre | `fibre__c` | boolean | ✓ |  |  |  |
| Job Title | `Job_Title__c` | string |  |  |  |  |
| Granulates | `Granulates__c` | boolean | ✓ |  |  |  |
| PA | `PA__c` | boolean | ✓ |  |  |  |
| Other | `Other__c` | boolean | ✓ |  |  |  |
| PAPER | `PAPER__c` | boolean | ✓ |  |  |  |
| WOOD | `WOOD__c` | boolean | ✓ |  |  |  |
| ELECTRONIC | `ELECTRONIC__c` | boolean | ✓ |  |  |  |
| OIL | `OIL__c` | boolean | ✓ |  |  |  |
| GLASS | `GLASS__c` | boolean | ✓ |  |  |  |
| BATTERY | `BATTERY__c` | boolean | ✓ |  |  |  |
| TIRE | `TIRE__c` | boolean | ✓ |  |  |  |
| CONCRETE | `CONCRETE__c` | boolean | ✓ |  |  |  |
| TEXTILE | `TEXTILE__c` | boolean | ✓ |  |  |  |
| METAL | `METAL__c` | boolean | ✓ |  |  |  |
| CARDBOARD | `CARDBOARD__c` | boolean | ✓ |  |  |  |
| COMPOST | `COMPOST__c` | boolean | ✓ |  |  |  |
| Other Material | `Other_Material__c` | string |  |  |  |  |
| GYPSUM | `GYPSUM__c` | boolean | ✓ |  |  |  |
| CERAMIC | `CERAMIC__c` | boolean | ✓ |  |  |  |
| ASPHALT | `ASPHALT__c` | boolean | ✓ |  |  |  |
| Company Interest | `Company_Interest__c` | picklist |  |  |  |  |
| Company Type | `Company_Type__c` | picklist |  |  |  |  |
| Materials of Interest | `Materials_of_Interest__c` | textarea |  |  |  |  |


## Picklist Values

### Salutation (`Salutation`)

**Active Values:** 5

```
- "Mr."
- "Ms."
- "Mrs."
- "Dr."
- "Prof."
```

### Geocode Accuracy (`GeocodeAccuracy`)

**Active Values:** 11

```
- "Address"
- "NearAddress"
- "Block"
- "Street"
- "ExtendedZip"
- "Zip"
- "Neighborhood"
- "City"
- "County"
- "State"
- "Unknown"
```

### Lead Source (`LeadSource`)

**Active Values:** 11

```
- "Advertisement"
- "Customer Event"
- "Employee Referral"
- "External Referral"
- "Google AdWords"
- "Other"
- "Partner"
- "Purchased List"
- "Trade Show"
- "Webinar"
- "Website"
```

### Status (`Status`)

**Active Values:** 6

```
- "Unqualified"
- "New" (default)
- "Working"
- "Nurturing"
- "Qualified"
- "Open - Not Contacted"
```

### Industry (`Industry`)

**Active Values:** 32

```
- "Agriculture"
- "Apparel"
- "Banking"
- "Biotechnology"
- "Chemicals"
- "Communications"
- "Construction"
- "Consulting"
- "Education"
- "Electronics"
- "Energy"
- "Engineering"
- "Entertainment"
- "Environmental"
- "Finance"
- "Food & Beverage"
- "Government"
- "Healthcare"
- "Hospitality"
- "Insurance"
- "Machinery"
- "Manufacturing"
- "Media"
- "Not For Profit"
- "Other"
- "Recreation"
- "Retail"
- "Shipping"
- "Technology"
- "Telecommunications"
- "Transportation"
- "Utilities"
```

### Rating (`Rating`)

**Active Values:** 3

```
- "Hot"
- "Warm"
- "Cold"
```

### Lead Currency (`CurrencyIsoCode`)

**Active Values:** 3

```
- "GBP" (default)
- "EUR"
- "USD"
```

### Pronouns (`Pronouns`)

**Active Values:** 6

```
- "He/Him"
- "She/Her"
- "They/Them"
- "He/They"
- "She/They"
- "Not Listed"
```

### Gender Identity (`GenderIdentity`)

**Active Values:** 4

```
- "Male"
- "Female"
- "Nonbinary"
- "Not Listed"
```

### Lead Buyer Intention (`Lead_Buyer_Intention__c`)

**Active Values:** 2

```
- "High"
- "Low"
```

### Lead Direction (`Lead_Direction__c`)

**Active Values:** 2

```
- "Inbound"
- "Outbound"
```

### Lead Rating (`Lead_Rating__c`)

**Active Values:** 3

```
- "Hot"
- "Warm"
- "Cold"
```

### Subsidiary Source (`Subsidiary_Source__c`)

**Active Values:** 3

```
- "LRI"
- "WasteTrade"
- "Pakire"
```

### WasteTrade Type (`WasteTrade_Type__c`)

**Active Values:** 7

```
- "Waste Generator"
- "Recycler"
- "Local Authority / Government"
- "Broker"
- "Waste Management Facility"
- "Other"
- "Both"
```

### WasteTrade Company Interest (`WasteTrade_Company_Interest__c`)

**Active Values:** 3

```
- "Buyer"
- "Seller"
- "Both"
```

### Marketing Source (`Marketing_Source__c`)

**Active Values:** 6

```
- "Google Search"
- "K-Show"
- "Plastic Live Trade Show"
- "PRSE Trade Show"
- "Sustainability Now"
- "Word of Mouth"
```

### Sync Status (`rocketphone__Sync_Status__c`)

**Active Values:** 4

```
- "Awaiting"
- "Success"
- "Failed"
- "Preparing"
```

### WasteTrade User Status (`WasteTrade_User_Status__c`)

**Active Values:** 5

```
- "PENDING"
- "ACTIVE" (default)
- "REJECTED"
- "INACTIVE"
- "REQUEST_INFORMATION"
```

### Company Interest (`Company_Interest__c`)

**Active Values:** 5

```
- "Buying"
- "Selling"
- "Both"
- "Transport"
- "Processing"
```

### Company Type (`Company_Type__c`)

**Active Values:** 11

```
- "Trading"
- "Haulier"
- "Producer"
- "Processor"
- "Other"
- "waste_producer"
- "broker"
- "recycler"
- "manufacturer"
- "Both"
- "Type 1"
```

