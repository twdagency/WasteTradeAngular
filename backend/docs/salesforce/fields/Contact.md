# Contact (Contact)

**API Name:** `Contact`

**Total Fields:** 101

---

## Standard Fields (63)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Contact ID | `Id` | id | ✓ |  |  |  |
| Deleted | `IsDeleted` | boolean | ✓ |  |  |  |
| Master Record ID | `MasterRecordId` | reference |  |  |  |  |
| Account ID | `AccountId` | reference |  |  |  |  |
| Last Name | `LastName` | string | ✓ |  |  |  |
| First Name | `FirstName` | string |  |  |  |  |
| Salutation | `Salutation` | picklist |  |  |  |  |
| Full Name | `Name` | string | ✓ |  |  |  |
| Other Street | `OtherStreet` | textarea |  |  |  |  |
| Other City | `OtherCity` | string |  |  |  |  |
| Other State/Province | `OtherState` | string |  |  |  |  |
| Other Zip/Postal Code | `OtherPostalCode` | string |  |  |  |  |
| Other Country | `OtherCountry` | string |  |  |  |  |
| Other Latitude | `OtherLatitude` | double |  |  |  |  |
| Other Longitude | `OtherLongitude` | double |  |  |  |  |
| Other Geocode Accuracy | `OtherGeocodeAccuracy` | picklist |  |  |  |  |
| Other Address | `OtherAddress` | address |  |  |  |  |
| Mailing Street | `MailingStreet` | textarea |  |  |  |  |
| Mailing City | `MailingCity` | string |  |  |  |  |
| Mailing State/Province | `MailingState` | string |  |  |  |  |
| Mailing Zip/Postal Code | `MailingPostalCode` | string |  |  |  |  |
| Mailing Country | `MailingCountry` | string |  |  |  |  |
| Mailing Latitude | `MailingLatitude` | double |  |  |  |  |
| Mailing Longitude | `MailingLongitude` | double |  |  |  |  |
| Mailing Geocode Accuracy | `MailingGeocodeAccuracy` | picklist |  |  |  |  |
| Mailing Address | `MailingAddress` | address |  |  |  |  |
| Business Phone | `Phone` | phone |  |  |  |  |
| Business Fax | `Fax` | phone |  |  |  |  |
| Mobile Phone | `MobilePhone` | phone |  |  |  |  |
| Home Phone | `HomePhone` | phone |  |  |  |  |
| Other Phone | `OtherPhone` | phone |  |  |  |  |
| Asst. Phone | `AssistantPhone` | phone |  |  |  |  |
| Reports To ID | `ReportsToId` | reference |  |  |  |  |
| Email | `Email` | email |  |  |  |  |
| Title | `Title` | string |  |  |  |  |
| Department | `Department` | string |  |  |  |  |
| Assistant's Name | `AssistantName` | string |  |  |  |  |
| Lead Source | `LeadSource` | picklist |  |  |  |  |
| Birthdate | `Birthdate` | date |  |  |  |  |
| Contact Description | `Description` | textarea |  |  |  |  |
| Contact Currency | `CurrencyIsoCode` | picklist |  |  |  |  |
| Owner ID | `OwnerId` | reference | ✓ |  |  |  |
| Email Opt Out | `HasOptedOutOfEmail` | boolean | ✓ |  |  |  |
| Fax Opt Out | `HasOptedOutOfFax` | boolean | ✓ |  |  |  |
| Do Not Call | `DoNotCall` | boolean | ✓ |  |  |  |
| Created Date | `CreatedDate` | datetime | ✓ |  |  |  |
| Created By ID | `CreatedById` | reference | ✓ |  |  |  |
| Last Modified Date | `LastModifiedDate` | datetime | ✓ |  |  |  |
| Last Modified By ID | `LastModifiedById` | reference | ✓ |  |  |  |
| System Modstamp | `SystemModstamp` | datetime | ✓ |  |  |  |
| Last Activity | `LastActivityDate` | date |  |  |  |  |
| Last Stay-in-Touch Request Date | `LastCURequestDate` | datetime |  |  |  |  |
| Last Stay-in-Touch Save Date | `LastCUUpdateDate` | datetime |  |  |  |  |
| Last Viewed Date | `LastViewedDate` | datetime |  |  |  |  |
| Last Referenced Date | `LastReferencedDate` | datetime |  |  |  |  |
| Email Bounced Reason | `EmailBouncedReason` | string |  |  |  |  |
| Email Bounced Date | `EmailBouncedDate` | datetime |  |  |  |  |
| Is Email Bounced | `IsEmailBounced` | boolean | ✓ |  |  |  |
| Photo URL | `PhotoUrl` | url |  |  |  |  |
| Data.com Key | `Jigsaw` | string |  |  |  |  |
| Jigsaw Contact ID | `JigsawContactId` | string |  |  |  |  |
| Pronouns | `Pronouns` | picklist |  |  |  |  |
| Gender Identity | `GenderIdentity` | picklist |  |  |  |  |


## Custom Fields (38)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Full Name | `Full_Name__c` | string |  |  |  |  |
| Full Name | `Full_Name_Link__c` | string |  |  |  |  |
| WasteTrade User Id | `WasteTrade_User_Id__c` | string |  | ✓ | ✓ |  |
| Site Role | `Site_Role__c` | string |  |  |  |  |
| Site | `Site__c` | reference |  |  |  |  |
| ABS | `ABS__c` | boolean | ✓ |  |  |  |
| ACRYLIC | `ACRYLIC__c` | boolean | ✓ |  |  |  |
| EPS | `EPS__c` | boolean | ✓ |  |  |  |
| HDPE | `HDPE__c` | boolean | ✓ |  |  |  |
| LDPE | `LDPE__c` | boolean | ✓ |  |  |  |
| OTHER (MIX) | `OTHER_MIX__c` | boolean | ✓ |  |  |  |
| OTHER (SINGLE SOURCES) | `OTHER_SINGLE_SOURCES__c` | boolean | ✓ |  |  |  |
| PC | `PC__c` | boolean | ✓ |  |  |  |
| PET | `PET__c` | boolean | ✓ |  |  |  |
| PE | `PE__c` | boolean | ✓ |  |  |  |
| PP | `PP__c` | boolean | ✓ |  |  |  |
| PS | `PS__c` | boolean | ✓ |  |  |  |
| PVC | `PVC__c` | boolean | ✓ |  |  |  |
| Subsidiary Source | `Subsidiary_Source__c` | string |  |  |  |  |
| WasteTrade Company Interest | `WasteTrade_Company_Interest__c` | picklist |  |  |  |  |
| Email Opt In | `Email_Opt_In__c` | boolean | ✓ |  |  |  |
| Marketing Opt In | `Marketing_Opt_In__c` | boolean | ✓ |  |  |  |
| Phone Opt In | `Phone_Opt_In__c` | boolean | ✓ |  |  |  |
| Text Opt In | `Text_Opt_In__c` | boolean | ✓ |  |  |  |
| No Longer With Company | `No_Longer_With_Company__c` | boolean | ✓ |  |  |  |
| FormattedMobilePhone | `rocketphone__FormattedMobilePhone__c` | string |  |  |  |  |
| FormattedPhone | `rocketphone__FormattedPhone__c` | string |  |  |  |  |
| ReferenceId | `rocketphone__ReferenceId__c` | string |  |  |  |  |
| Conversation Report | `rocketphone__Summary_of_Calls__c` | textarea |  |  |  |  |
| Sync Message | `rocketphone__Sync_Message__c` | textarea |  |  |  |  |
| Sync Status | `rocketphone__Sync_Status__c` | picklist |  |  |  |  |
| Last Sync Origin | `Last_Sync_Origin__c` | string |  |  |  | Auto-populated by sync process. WT_ = from WasteTr |
| Is Primary Contact | `Is_Primary_Contact__c` | boolean | ✓ |  |  |  |
| Company Role | `Company_Role__c` | picklist |  |  |  |  |
| Company User Status | `Company_User_Status__c` | picklist |  |  |  |  |
| Site Location Address | `Site_Location_Address__c` | string |  |  |  |  |
| Job Title | `Job_Title__c` | string |  |  |  |  |
| plastic | `plastic__c` | boolean | ✓ |  |  |  |


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

### Other Geocode Accuracy (`OtherGeocodeAccuracy`)

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

### Mailing Geocode Accuracy (`MailingGeocodeAccuracy`)

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

### Contact Currency (`CurrencyIsoCode`)

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

### WasteTrade Company Interest (`WasteTrade_Company_Interest__c`)

**Active Values:** 3

```
- "Buyer"
- "Seller"
- "Both"
```

### Sync Status (`rocketphone__Sync_Status__c`)

**Active Values:** 4

```
- "Awaiting"
- "Success"
- "Failed"
- "Preparing"
```

### Company Role (`Company_Role__c`)

**Active Values:** 5

```
- "ADMIN"
- "BUYER"
- "SELLER"
- "HAULIER"
- "DUAL"
```

### Company User Status (`Company_User_Status__c`)

**Active Values:** 5

```
- "PENDING"
- "ACTIVE" (default)
- "REJECTED"
- "INACTIVE"
- "REQUEST_INFORMATION"
```

