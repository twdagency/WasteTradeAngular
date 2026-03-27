# Account (Account)

**API Name:** `Account`

**Total Fields:** 162

---

## Standard Fields (53)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Account ID | `Id` | id | ✓ |  |  |  |
| Deleted | `IsDeleted` | boolean | ✓ |  |  |  |
| Master Record ID | `MasterRecordId` | reference |  |  |  |  |
| Account Name | `Name` | string | ✓ |  |  |  |
| Account Type | `Type` | picklist |  |  |  |  |
| Parent Account ID | `ParentId` | reference |  |  |  |  |
| Billing Street | `BillingStreet` | textarea |  |  |  |  |
| Billing City | `BillingCity` | string |  |  |  |  |
| Billing State/Province | `BillingState` | string |  |  |  |  |
| Billing Zip/Postal Code | `BillingPostalCode` | string |  |  |  |  |
| Billing Country | `BillingCountry` | string |  |  |  |  |
| Billing Latitude | `BillingLatitude` | double |  |  |  |  |
| Billing Longitude | `BillingLongitude` | double |  |  |  |  |
| Billing Geocode Accuracy | `BillingGeocodeAccuracy` | picklist |  |  |  |  |
| Billing Address | `BillingAddress` | address |  |  |  |  |
| Shipping Street | `ShippingStreet` | textarea |  |  |  |  |
| Shipping City | `ShippingCity` | string |  |  |  |  |
| Shipping State/Province | `ShippingState` | string |  |  |  |  |
| Shipping Zip/Postal Code | `ShippingPostalCode` | string |  |  |  |  |
| Shipping Country | `ShippingCountry` | string |  |  |  |  |
| Shipping Latitude | `ShippingLatitude` | double |  |  |  |  |
| Shipping Longitude | `ShippingLongitude` | double |  |  |  |  |
| Shipping Geocode Accuracy | `ShippingGeocodeAccuracy` | picklist |  |  |  |  |
| Shipping Address | `ShippingAddress` | address |  |  |  |  |
| Account Phone | `Phone` | phone |  |  |  |  |
| Account Fax | `Fax` | phone |  |  |  |  |
| Account Number | `AccountNumber` | string |  |  |  |  |
| Website | `Website` | url |  |  |  |  |
| Photo URL | `PhotoUrl` | url |  |  |  |  |
| SIC Code | `Sic` | string |  |  |  |  |
| Industry | `Industry` | picklist |  |  |  |  |
| Annual Revenue | `AnnualRevenue` | currency |  |  |  |  |
| Employees | `NumberOfEmployees` | int |  |  |  |  |
| Ownership | `Ownership` | picklist |  |  |  |  |
| Ticker Symbol | `TickerSymbol` | string |  |  |  |  |
| Account Description | `Description` | textarea |  |  |  |  |
| Account Rating | `Rating` | picklist |  |  |  |  |
| Account Site | `Site` | string |  |  |  |  |
| Account Currency | `CurrencyIsoCode` | picklist |  |  |  |  |
| Owner ID | `OwnerId` | reference | ✓ |  |  |  |
| Created Date | `CreatedDate` | datetime | ✓ |  |  |  |
| Created By ID | `CreatedById` | reference | ✓ |  |  |  |
| Last Modified Date | `LastModifiedDate` | datetime | ✓ |  |  |  |
| Last Modified By ID | `LastModifiedById` | reference | ✓ |  |  |  |
| System Modstamp | `SystemModstamp` | datetime | ✓ |  |  |  |
| Last Activity | `LastActivityDate` | date |  |  |  |  |
| Last Viewed Date | `LastViewedDate` | datetime |  |  |  |  |
| Last Referenced Date | `LastReferencedDate` | datetime |  |  |  |  |
| Exclude from territory assignment rules | `IsExcludedFromRealign` | boolean | ✓ |  |  |  |
| Data.com Key | `Jigsaw` | string |  |  |  |  |
| Jigsaw Company ID | `JigsawCompanyId` | string |  |  |  |  |
| Account Source | `AccountSource` | picklist |  |  |  |  |
| SIC Description | `SicDesc` | string |  |  |  |  |


## Custom Fields (109)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Supplier Code | `Supplier_Code__c` | string |  |  |  |  |
| Company Registration Number | `Company_Registration_Number__c` | string |  |  |  |  |
| Company VAT Number | `Company_VAT_Number__c` | string |  |  |  |  |
| Registered Company Name | `Registered_Company_Name__c` | string |  |  |  |  |
| Payment Terms (Days) | `Payment_Terms_Days__c` | double |  |  |  |  |
| Business Development Representative | `Business_Development_Representative__c` | reference |  |  |  |  |
| Billing and Shipping Address Identical? | `Billing_and_Shipping_Address_Identical__c` | boolean | ✓ |  |  |  |
| Engagement Source URL | `Engagement_Source_URL__c` | url |  |  |  |  |
| Account License Number | `Account_License_Number__c` | string |  |  |  |  |
| Account License Start Date | `Account_License_Start_Date__c` | date |  |  |  |  |
| Account License End Date | `Account_License_End_Date__c` | date |  |  |  |  |
| Territory Index | `Territory_Index__c` | double |  |  |  |  |
| Account Number | `Account_Number__c` | string | ✓ |  |  |  |
| Account Form Current Section | `Account_Form_Current_Section__c` | double |  |  |  |  |
| Account Form Main Contact Id | `Account_Form_Main_Contact_Id__c` | string |  |  |  |  |
| Account Form Main Contact Name | `Account_Form_Main_Contact_Name__c` | string |  |  |  |  |
| Account Form Main Site Id | `Account_Form_Main_Site_Id__c` | string |  |  |  |  |
| Account Form Submission Date | `Account_Form_Submission_Date__c` | datetime |  |  |  |  |
| Account Form Submitted By | `Account_Form_Submitted_By__c` | string |  |  |  |  |
| Account Form Submitted Position | `Account_Form_Submitted_Position__c` | string |  |  |  |  |
| Account Form Submitted | `Account_Form_Submitted__c` | boolean | ✓ |  |  |  |
| Account Region | `Account_Region__c` | picklist |  |  |  |  |
| Bank Account Name | `Bank_Account_Name__c` | string |  |  |  |  |
| Bank Account Number | `Bank_Account_Number__c` | string |  |  |  |  |
| Cipher Text | `Cipher_Text__c` | string |  |  |  |  |
| Container | `Container__c` | boolean | ✓ |  |  |  |
| Countries Shipped To | `Countries_Shipped_To__c` | textarea |  |  |  |  |
| Credit Limit Offered | `Credit_Limit_Offered__c` | currency |  |  |  |  |
| Credit Limit Requested | `Credit_Limit_Requested__c` | currency |  |  |  |  |
| Curtainsider Trailer | `Curtainsider_Trailer__c` | boolean | ✓ |  |  |  |
| Disposal Code | `Disposal_Code__c` | string |  |  |  |  |
| EORI Number | `EORI_Number__c` | string |  |  |  |  |
| Environmental Permit End Date | `Environmental_Permit_End_Date__c` | date |  |  |  |  |
| Environmental Permit Number | `Environmental_Permit_Number__c` | string |  |  |  |  |
| Environmental Permit Start Date | `Environmental_Permit_Start_Date__c` | date |  |  |  |  |
| Export Clearance | `Export_Clearance__c` | boolean | ✓ |  |  |  |
| Facility Code | `Facility_Code__c` | string |  |  |  |  |
| Facility Permit End Date | `Facility_Permit_End_Date__c` | date |  |  |  |  |
| Facility Permit Number | `Facility_Permit_Number__c` | string |  |  |  |  |
| Facility Permit Start Date | `Facility_Permit_Start_Date__c` | date |  |  |  |  |
| IBAN | `IBAN__c` | string |  |  |  |  |
| Import Clearance | `Import_Clearance__c` | boolean | ✓ |  |  |  |
| Local Council Authority | `Local_Council_Authority__c` | string |  |  |  |  |
| Primary Licence Type | `Primary_Licence_Type__c` | picklist |  |  |  |  |
| Proprietors/Partners Name: | `Proprietors_Partners_Name__c` | string |  |  |  |  |
| Registered Waste Exemption End Date | `Registered_Waste_Exemption_End_Date__c` | date |  |  |  |  |
| Registered Waste Exemption Number | `Registered_Waste_Exemption_Number__c` | string |  |  |  |  |
| Registered Waste Exemption Start Date | `Registered_Waste_Exemption_Start_Date__c` | date |  |  |  |  |
| Shipping Type | `Shipping_Type__c` | picklist |  |  |  |  |
| Sort Code | `Sort_Code__c` | string |  |  |  |  |
| Walking Floor | `Walking_Floor__c` | boolean | ✓ |  |  |  |
| Waste Carrier Licence End Date | `Waste_Carrier_Licence_End_Date__c` | date |  |  |  |  |
| Waste Carrier Licence Number | `Waste_Carrier_Licence_Number__c` | string |  |  |  |  |
| Waste Carrier Licence Start Date | `Waste_Carrier_Licence_Start_Date__c` | date |  |  |  |  |
| Account Form URL | `Account_Form_URL__c` | string |  |  |  |  |
| Verified | `Verified__c` | boolean | ✓ |  |  |  |
| Complete Account | `Complete_Account__c` | picklist |  |  |  |  |
| Country | `Country__c` | picklist |  |  |  |  |
| Trade Reference | `Trade_Reference__c` | boolean | ✓ |  |  |  |
| WasteTrade Type | `WasteTrade_Type__c` | picklist |  |  |  |  |
| Archived | `Archived__c` | boolean | ✓ |  |  |  |
| Dual Trading Primary Type | `Dual_Trading_Primary_Type__c` | picklist |  |  |  |  |
| Subsidiary Source | `Subsidiary_Source__c` | picklist |  |  |  |  |
| Sales Representative Name | `Sales_Representative_Name__c` | string |  |  |  |  |
| FormattedPhone | `rocketphone__FormattedPhone__c` | string |  |  |  |  |
| ReferenceId | `rocketphone__ReferenceId__c` | string |  |  |  |  |
| Sync Status | `rocketphone__Sync_Status__c` | picklist |  |  |  |  |
| Account Status | `Account_Status__c` | string |  |  |  |  |
| Last Sync Origin | `Last_Sync_Origin__c` | string |  |  |  | Auto-populated by sync process. WT_ = from WasteTr |
| Site Point Contact | `Site_Point_Contact__c` | string |  |  |  |  |
| WT Is Buyer | `WT_is_buyer__c` | boolean | ✓ |  |  |  |
| WT Is Seller | `WT_is_seller__c` | boolean | ✓ |  |  |  |
| WT Is Haulier | `WT_is_haulier__c` | boolean | ✓ |  |  |  |
| Fleet Type | `Fleet_Type__c` | picklist |  |  |  |  |
| Areas Covered | `Areas_Covered__c` | picklist |  |  |  |  |
| EU Countries | `EU_Countries__c` | multipicklist |  |  |  |  |
| Container Types | `WT_Container_Types__c` | multipicklist |  |  |  |  |
| Materials Accepted PVC | `Materials_Accepted_PVC__c` | boolean | ✓ |  |  |  |
| Materials Accepted HDPE | `Materials_Accepted_HDPE__c` | boolean | ✓ |  |  |  |
| Materials Accepted Acrylic | `Materials_Accepted_Acrylic__c` | boolean | ✓ |  |  |  |
| Materials Accepted LDPE | `Materials_Accepted_LDPE__c` | boolean | ✓ |  |  |  |
| Materials Accepted ABS | `Materials_Accepted_ABS__c` | boolean | ✓ |  |  |  |
| Materials Accepted PP | `Materials_Accepted_PP__c` | boolean | ✓ |  |  |  |
| Materials Accepted PS | `Materials_Accepted_PS__c` | boolean | ✓ |  |  |  |
| Materials Accepted PET | `Materials_Accepted_PET__c` | boolean | ✓ |  |  |  |
| Materials Accepted PA | `Materials_Accepted_PA__c` | boolean | ✓ |  |  |  |
| Materials Accepted PC | `Materials_Accepted_PC__c` | boolean | ✓ |  |  |  |
| Company Interest | `WT_Company_Interest__c` | string |  |  |  |  |
| Shipping City | `Shipping_City__c` | string |  |  |  |  |
| VAT Registration Country | `VAT_Registration_Country__c` | string |  |  |  |  |
| Shipping Country | `Shipping_Country__c` | string |  |  |  |  |
| WasteTrade Company ID | `WasteTrade_Company_Id__c` | string |  | ✓ | ✓ |  |
| Email | `Email__c` | email |  |  |  |  |
| WasteTrade Company Interest | `WasteTrade_Company_Interest__c` | string |  |  |  |  |
| Shipping Street | `Shipping_Street__c` | string |  |  |  |  |
| Has Loading Ramp | `Has_Loading_Ramp__c` | boolean | ✓ |  |  |  |
| Site Contact Position | `Site_Contact_Position__c` | string |  |  |  |  |
| Primary Location Name | `Primary_Location_Name__c` | string |  |  |  |  |
| Site Contact Last Name | `Site_Contact_Last_Name__c` | string |  |  |  |  |
| Site Contact First Name | `Site_Contact_First_Name__c` | string |  |  |  |  |
| Site Contact Phone | `Site_Contact_Phone__c` | phone |  |  |  |  |
| Shipping Zip/Postal Code | `Shipping_Zip_Postal_Code__c` | string |  |  |  |  |
| Has Weigh Bridge | `Has_Weigh_Bridge__c` | boolean | ✓ |  |  |  |
| Self Load/Unload | `Self_Load_Unload__c` | boolean | ✓ |  |  |  |
| Shipping State/Province | `Shipping_State_Province__c` | string |  |  |  |  |
| Access Restrictions | `Access_Restrictions__c` | string |  |  |  |  |
| Operating Hours | `Operating_Hours__c` | string |  |  |  |  |
| Container Types | `Container_Types__c` | string |  |  |  |  |
| Site_Accepted_Materials | `Site_Accepted_Materials__c` | textarea |  |  |  |  |


## Picklist Values

### Account Type (`Type`)

**Active Values:** 10

```
- "Competitor"
- "Contractor"
- "Customer"
- "Customs Agent"
- "Customs Clearance"
- "Dual Trading"
- "Freight Forwarders"
- "Haulier"
- "Supplier"
- "Other"
```

### Billing Geocode Accuracy (`BillingGeocodeAccuracy`)

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

### Shipping Geocode Accuracy (`ShippingGeocodeAccuracy`)

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

### Ownership (`Ownership`)

**Active Values:** 4

```
- "Public"
- "Private"
- "Subsidiary"
- "Other"
```

### Account Rating (`Rating`)

**Active Values:** 3

```
- "Hot"
- "Warm"
- "Cold"
```

### Account Currency (`CurrencyIsoCode`)

**Active Values:** 3

```
- "GBP" (default)
- "EUR"
- "USD"
```

### Account Source (`AccountSource`)

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

### Account Region (`Account_Region__c`)

**Active Values:** 3

```
- "UK"
- "EU"
- "International"
```

### Primary Licence Type (`Primary_Licence_Type__c`)

**Active Values:** 4

```
- "Waste Carrier Licence"
- "Environmental Permit"
- "Registered Waste Exemption"
- "Facility Permit"
```

### Shipping Type (`Shipping_Type__c`)

**Active Values:** 3

```
- "Domestically"
- "Internationally"
- "Both"
```

### Complete Account (`Complete_Account__c`)

**Active Values:** 2

```
- "Yes"
- "No"
```

### Country (`Country__c`)

**Active Values:** 196

```
- "Afghanistan"
- "Albania"
- "Algeria"
- "Andorra"
- "Angola"
- "Antigua & Deps"
- "Argentina"
- "Armenia"
- "Australia"
- "Austria"
- "Azerbaijan"
- "Bahamas"
- "Bahrain"
- "Bangladesh"
- "Barbados"
- "Belarus"
- "Belgium"
- "Belize"
- "Benin"
- "Bhutan"
- "Bolivia"
- "Bosnia Herzegovina"
- "Botswana"
- "Brazil"
- "Brunei"
- "Bulgaria"
- "Burkina"
- "Burundi"
- "Cambodia"
- "Cameroon"
- "Canada"
- "Cape Verde"
- "Central African Rep"
- "Chad"
- "Chile"
- "China"
- "Colombia"
- "Comoros"
- "Congo"
- "Congo {Democratic Rep}"
- "Costa Rica"
- "Croatia"
- "Cuba"
- "Cyprus"
- "Czech Republic"
- "Denmark"
- "Djibouti"
- "Dominica"
- "Dominican Republic"
- "East Timor"
- "Ecuador"
- "Egypt"
- "El Salvador"
- "Equatorial Guinea"
- "Eritrea"
- "Estonia"
- "Ethiopia"
- "Fiji"
- "Finland"
- "France"
- "Gabon"
- "Gambia"
- "Georgia"
- "Germany"
- "Ghana"
- "Greece"
- "Grenada"
- "Guatemala"
- "Guinea"
- "Guinea-Bissau"
- "Guyana"
- "Haiti"
- "Honduras"
- "Hungary"
- "Iceland"
- "India"
- "Indonesia"
- "Iran"
- "Iraq"
- "Ireland {Republic}"
- "Israel"
- "Italy"
- "Ivory Coast"
- "Jamaica"
- "Japan"
- "Jordan"
- "Kazakhstan"
- "Kenya"
- "Kiribati"
- "Korea North"
- "Korea South"
- "Kosovo"
- "Kuwait"
- "Kyrgyzstan"
- "Laos"
- "Latvia"
- "Lebanon"
- "Lesotho"
- "Liberia"
- "Libya"
- "Liechtenstein"
- "Lithuania"
- "Luxembourg"
- "Macedonia"
- "Madagascar"
- "Malawi"
- "Malaysia"
- "Maldives"
- "Mali"
- "Malta"
- "Marshall Islands"
- "Mauritania"
- "Mauritius"
- "Mexico"
- "Micronesia"
- "Moldova"
- "Monaco"
- "Mongolia"
- "Montenegro"
- "Morocco"
- "Mozambique"
- "Myanmar, {Burma}"
- "Namibia"
- "Nauru"
- "Nepal"
- "Netherlands"
- "New Zealand"
- "Nicaragua"
- "Niger"
- "Nigeria"
- "Norway"
- "Oman"
- "Pakistan"
- "Palau"
- "Panama"
- "Papua New Guinea"
- "Paraguay"
- "Peru"
- "Philippines"
- "Poland"
- "Portugal"
- "Qatar"
- "Romania"
- "Russian Federation"
- "Rwanda"
- "St Kitts & Nevis"
- "St Lucia"
- "Saint Vincent & the Grenadines"
- "Samoa"
- "San Marino"
- "Sao Tome & Principe"
- "Saudi Arabia"
- "Senegal"
- "Serbia"
- "Seychelles"
- "Sierra Leone"
- "Singapore"
- "Slovakia"
- "Slovenia"
- "Solomon Islands"
- "Somalia"
- "South Africa"
- "South Sudan"
- "Spain"
- "Sri Lanka"
- "Sudan"
- "Suriname"
- "Swaziland"
- "Sweden"
- "Switzerland"
- "Syria"
- "Taiwan"
- "Tajikistan"
- "Tanzania"
- "Thailand"
- "Togo"
- "Tonga"
- "Trinidad & Tobago"
- "Tunisia"
- "Turkey"
- "Turkmenistan"
- "Tuvalu"
- "Uganda"
- "Ukraine"
- "United Arab Emirates"
- "United Kingdom"
- "United States"
- "Uruguay"
- "Uzbekistan"
- "Vanuatu"
- "Vatican City"
- "Venezuela"
- "Vietnam"
- "Yemen"
- "Zambia"
- "Zimbabwe"
```

### WasteTrade Type (`WasteTrade_Type__c`)

**Active Values:** 6

```
- "Waste Generator"
- "Recycler"
- "Local Authority / Government"
- "Broker"
- "Waste Management Facility"
- "Other"
```

### Dual Trading Primary Type (`Dual_Trading_Primary_Type__c`)

**Active Values:** 2

```
- "Supplier"
- "Customer"
```

### Subsidiary Source (`Subsidiary_Source__c`)

**Active Values:** 3

```
- "LRI"
- "WasteTrade"
- "Pakire"
```

### Sync Status (`rocketphone__Sync_Status__c`)

**Active Values:** 3

```
- "Awaiting"
- "Success"
- "Failed"
```

### Fleet Type (`Fleet_Type__c`)

**Active Values:** 2

```
- "Freight Forwarder"
- "Own Fleet"
```

### Areas Covered (`Areas_Covered__c`)

**Active Values:** 3

```
- "UK Only"
- "Within EU"
- "Worldwide"
```

