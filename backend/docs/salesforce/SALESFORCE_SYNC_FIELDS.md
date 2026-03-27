# Salesforce Sync Fields Reference

Complete field mapping between WasteTrade and Salesforce.

**Source Code References:**
- `src/utils/salesforce/salesforce-field-mapping.utils.ts` - Field mapping configuration
- `src/utils/salesforce/salesforce-bidirectional-mapping.utils.ts` - Value mappers
- `src/utils/salesforce/salesforce-object-mappers.utils.ts` - Outbound object builders
- `src/services/salesforce/salesforce-webhook.service.ts` - Inbound webhook handlers

---

## 1. Account → Company

**API Name:** `Account`
**Webhook:** `POST /salesforce/webhook/account-updated`
**External ID Field:** `WasteTrade_Company_Id__c`

### Inbound Sync Fields (Bidirectional)

| SF Field | WT Field | Type | Notes |
|----------|----------|------|-------|
| `Name` | `name` | string | Environment prefix stripped on inbound |
| `BillingStreet` | `addressLine1` | textarea | |
| `BillingCity` | `city` | string | |
| `BillingPostalCode` | `postalCode` | string | |
| `BillingCountry` | `country` | string | |
| `BillingState` | `stateProvince` | string | |
| `Phone` | `phoneNumber` | phone | |
| `Website` | `website` | url | |
| `Account_Status__c` | `status` | string | Via `mapCompanyStatus()` — bidirectional |
| `Company_VAT_Number__c` | `vatNumber` | string | |
| `Company_Registration_Number__c` | `registrationNumber` | string | |
| `Email__c` | `email` | email | Custom field (Account has no standard Email) |
| `Mobile` | `mobileNumber` | phone | |
| `Fax` | `mobileNumber` | phone | Fallback if `Mobile` not set (SF Fax stores secondary mobile) |

### Account_Status__c Mapping (via `mapCompanyStatus()`)

| SF Value | WT Value |
|----------|----------|
| `Pending` | `pending` |
| `Active` | `active` |
| `Rejected` | `rejected` |
| `Request Information` | `request_information` |
| `Inactive` | `rejected` (legacy fallback) |

### Outbound Only Fields (WT→SF)

| SF Field | WT Source | Notes |
|----------|-----------|-------|
| `Type` | `isHaulier` | `Haulier` if true, else `Customer` (SF account category) |
| `WasteTrade_Type__c` | `companyType` | WT business type → SF picklist (Recycler/Broker/Waste Generator/etc.) |
| `WT_Company_Interest__c` | `companyInterest` | buyer/seller/both |
| `WT_is_buyer__c` | `isBuyer` | boolean |
| `WT_is_seller__c` | `isSeller` | boolean |
| `WT_is_haulier__c` | `isHaulier` | boolean |
| `VAT_Registration_Country__c` | `vatRegistrationCountry` | Mapped to full country name |
| `Description` | `description` | + appended additional info |
| `WasteTrade_Company_Id__c` | `id` | External ID with env prefix |
| `Last_Sync_Origin__c` | - | Loop prevention marker |

### Outbound Only — Shipping/Location Fields

| SF Field | WT Source | Notes |
|----------|-----------|-------|
| `ShippingStreet` | `companyLocations[0].street` | From main location |
| `ShippingCity` | `companyLocations[0].city` | |
| `ShippingCountry` | `companyLocations[0].country` | |
| `ShippingPostalCode` | `companyLocations[0].postcode` | |
| `ShippingState` | `companyLocations[0].stateProvince` | |
| `Shipping_Street__c` | `companyLocations[0].street` | Custom duplicate for backward compat |
| `Shipping_City__c` | `companyLocations[0].city` | |
| `Shipping_Country__c` | `companyLocations[0].country` | |
| `Shipping_Zip_Postal_Code__c` | `companyLocations[0].postcode` | |
| `Shipping_State_Province__c` | `companyLocations[0].stateProvince` | |
| `Has_Loading_Ramp__c` | `companyLocations[0].loadingRamp` | boolean |
| `Has_Weigh_Bridge__c` | `companyLocations[0].weighbridge` | boolean |
| `Self_Load_Unload__c` | `companyLocations[0].selfLoadUnLoadCapability` | boolean |
| `Primary_Location_Name__c` | `companyLocations[0].locationName` | |
| `Site_Contact_First_Name__c` | `companyLocations[0].firstName` | |
| `Site_Contact_Last_Name__c` | `companyLocations[0].lastName` | |
| `Site_Contact_Phone__c` | `companyLocations[0].phoneNumber` | |
| `Site_Contact_Position__c` | `companyLocations[0].positionInCompany` | |
| `Site_Point_Contact__c` | `companyLocations[0].sitePointContact` | |
| `Access_Restrictions__c` | `companyLocations[0].accessRestrictions` | |
| `Container_Types__c` | `companyLocations[0].containerType` | Joined with `;` |
| `Site_Accepted_Materials__c` | `companyLocations[0].acceptedMaterials` | Joined with `;` |
| `Operating_Hours__c` | `officeOpenTime-officeCloseTime` | Combined |

### NOT Synced Inbound

- All `Materials_Accepted_*__c` fields (PVC, HDPE, etc.)
- License fields (`Account_License_Number__c`, dates)
- Permit fields (Environmental, Facility, Waste Carrier)
- Bank details (`Bank_Account_Name__c`, `IBAN__c`, `Sort_Code__c`)
- Account form fields (`Account_Form_*__c`)
- Rocketphone fields (`rocketphone__*__c`)

---

## 2. Contact → User/CompanyUsers

**API Name:** `Contact`
**Webhook:** `POST /salesforce/webhook/contact-updated`
**External ID Field:** `WasteTrade_User_Id__c`

### Inbound Sync Fields

| SF Field | WT Field | WT Table | Type | Notes |
|----------|----------|----------|------|-------|
| `Email` | `email` | User | email | bidirectional |
| `FirstName` | `firstName` | User | string | bidirectional |
| `LastName` | `lastName` | User | string | bidirectional |
| `Phone` | `phoneNumber` | User | phone | bidirectional |
| `MobilePhone` | `mobileNumber` | User | phone | bidirectional |
| `Salutation` | `prefix` | User | picklist | bidirectional |
| `Title` | `prefix` | User | string | Fallback if `Salutation` not set |
| `Job_Title__c` | `jobTitle` | User | string | bidirectional |
| `Company_Role__c` | `companyRole` | CompanyUsers | picklist | Via `mapCompanyRole()` |
| `Is_Primary_Contact__c` | `isPrimaryContact` | CompanyUsers | boolean | bidirectional |
| `Company_User_Status__c` | `status` | CompanyUsers | picklist | Via `mapCompanyUserStatus()` |

### Company_Role__c Mapping (via `mapCompanyRole()`)

| SF Value | WT Value |
|----------|----------|
| `ADMIN` | `admin` |
| `BUYER` | `buyer` |
| `SELLER` | `seller` |
| `HAULIER` | `haulier` |
| `DUAL` | `both` |

### Company_User_Status__c Mapping (via `mapCompanyUserStatus()`)

| SF Value | WT Value |
|----------|----------|
| `PENDING` | `pending` |
| `ACTIVE` | `active` |
| `REJECTED` | `rejected` |
| `REQUEST_INFORMATION` | `request_information` |
| `INACTIVE` | `request_information` (legacy backward compat) |

### Outbound Only Fields (WT→SF)

| SF Field | WT Source | Notes |
|----------|-----------|-------|
| `Phone` | `user.phoneNumber` | Standard phone field |
| `MobilePhone` | `user.mobileNumber` | Mobile phone |
| `Salutation` | `user.prefix` | Picklist: Mr., Ms., Mrs., Dr., Prof. |
| `Title` | `user.prefix` | Text field (duplicate of Salutation) |
| `Job_Title__c` | `user.jobTitle` | |
| `Company_Role__c` | `companyUser.companyRole` | Via `mapCompanyRole()` |
| `Is_Primary_Contact__c` | `companyUser.isPrimaryContact` | boolean |
| `Company_User_Status__c` | `companyUser.status` | Via `mapCompanyUserStatus()` |
| `No_Longer_With_Company__c` | - | Set `true` when status=rejected |
| `Site_Location_Address__c` | `primaryLocation.locationName` | From primary location |
| `MailingStreet` | primaryLocation | Full address joined |
| `WasteTrade_User_Id__c` | `user.id` | External ID with env prefix |
| `AccountId` | - | SF Account ID |
| `Last_Sync_Origin__c` | - | Loop prevention marker |

**Note:** Bidirectional fields (`Email`, `FirstName`, `LastName`, `Phone`, `MobilePhone`, `Salutation`, `Title`, `Job_Title__c`) are synced BOTH outbound (in mappers) AND inbound (via webhook).

### NOT Synced Inbound

- Material interest flags (`ABS__c`, `HDPE__c`, `PVC__c`, etc.)
- Opt-in flags (`Email_Opt_In__c`, `Marketing_Opt_In__c`, etc.)
- Site relationship (`Site__c`)
- Rocketphone fields (`rocketphone__*__c`)
- `Subsidiary_Source__c`, `WasteTrade_Company_Interest__c`

---

## 3. Lead → User (Pending Registration)

**API Name:** `Lead`
**Webhook:** `POST /salesforce/webhook/lead-updated`
**External ID Field:** `WasteTrade_User_Id__c`

### Inbound Sync Fields

| SF Field | WT Field | Type | Notes |
|----------|----------|------|-------|
| `FirstName` | `firstName` | string | |
| `LastName` | `lastName` | string | |
| `Phone` | `phoneNumber` | phone | |

### NOT Synced Inbound

- `Email` - Immutable identifier
- `Company` - Company info managed separately
- All material flags (`LDPE__c`, `HDPE__c`, etc.)
- `WasteTrade_Company_Interest__c`, `WasteTrade_Type__c`
- Marketing fields, Lead qualification fields

### Outbound Only Fields (WT→SF)

| SF Field | WT Source | Notes |
|----------|-----------|-------|
| `FirstName` | `user.firstName` | |
| `LastName` | `user.lastName` | |
| `Email` | `user.email` | Validated via `isValidEmail()` |
| `Phone` | `user.phoneNumber` | Fallback: mobileNumber |
| `Company` | `company.name` | With env prefix |
| `LeadSource` | `user.whereDidYouHearAboutUs` | Mapped via `mapLeadSource()` |
| `WasteTrade_User_Status__c` | `user.status` | Via `mapUserStatus()` |
| `Lead_Direction__c` | - | Default: `Inbound` |
| `Lead_Buyer_Intention__c` | - | Default: `High` |
| `Lead_Rating__c` | - | Default: `Cold` |
| `Title` | `user.prefix` | Capitalized |
| `Job_Title__c` | `user.jobTitle` | |
| `Company_Type__c` | `company.companyType` | |
| `WasteTrade_Company_Interest__c` | `company.companyInterest` | |
| `WasteTrade_User_Id__c` | `user.id` | External ID |
| `Last_Sync_Origin__c` | - | Loop prevention marker |
| `LDPE__c` .. `COMPOST__c` | materialUsers | 28 boolean checkboxes |
| `Other_Material__c` | materialUsers | Comma-joined names (100 char limit) |
| `Materials_of_Interest__c` | materialUsers | All materials summary (255 char limit) |

### WasteTrade_User_Status__c Mapping (via `mapUserStatus()`)

| WT Value | SF Value |
|----------|----------|
| `pending` | `PENDING` |
| `active` | `ACTIVE` |
| `rejected` | `REJECTED` |
| `request_information` | `REQUEST_INFORMATION` |
| `archived` | `INACTIVE` |

---

## 4. Haulage_Offers__c → HaulageOffers

**API Name:** `Haulage_Offers__c`
**Webhook:** `POST /salesforce/webhook/haulage-offer-status`
**External ID Field:** `WasteTrade_Haulage_Offers_ID__c`

### Inbound Sync Fields (SF Operations Team Manages)

| SF Field | WT Field | Type | Mapper Function |
|----------|----------|------|-----------------|
| `haulier_listing_status__c` | `status` | picklist | `mapHaulageOfferStatus()` |
| `haulage_rejection_reason__c` | `rejectionReason` | string | - |
| `post_notes__c` | `adminMessage` | textarea | - |
| `suggested_collection_date__c` | `suggestedCollectionDate` | date | - |
| `Transport_Provider__c` | `transportProvider` | picklist | `mapTransportProvider()` |
| `trailer_or_container__c` | `trailerContainerType` | picklist | - |
| `Customs_Clearance__c` | `completingCustomsClearance` | picklist | `mapCustomsClearance()` |
| `expected__c` | `expectedTransitTime` | picklist | `mapExpectedTransitTime()` |
| `demurrage__c` | `demurrageAtDestination` | picklist | - |
| `haulage__c` | `haulageCostPerLoad` | string | - |
| `haulage_total__c` | `haulageTotal` | string | - |
| `haulage_currency__c` | `currency` | string | `mapCurrency()` |

### haulier_listing_status__c Mapping (via `mapHaulageOfferStatus()`)

| SF Value | WT Value | Notes |
|----------|----------|-------|
| `Pending Approval` | `pending` | |
| `Approved` | `approved` | Preserves `accepted`/`partially_shipped`/`shipped` if current |
| `Rejected` | `rejected` | |

**Lossy mapping:** SF has 3 picklist values; WT has 8 statuses. Inbound `Approved` maps to `approved` unless current WT status is `accepted`/`partially_shipped`/`shipped` (preserved).

### Transport_Provider__c Mapping (via `mapTransportProvider()`)

| SF Value | WT Value |
|----------|----------|
| `Own Haulage` | `own_haulage` |
| `Mixed Haulage` | `mixed` |
| `Third Party Haulier` | `third_party` |

### expected__c Mapping — Transit Time (via `mapExpectedTransitTime()`)

Values identical between SF and WT: `1-2 Days`, `3-4 Days`, `4-6 Days`, `1 Week`, `2 Weeks`, `3 Weeks`, `1 Month`

### Customs_Clearance__c Mapping (via `mapCustomsClearance()`)

| SF Value | WT Value |
|----------|----------|
| `Yes` | `true` |
| `No` | `false` |
| `Customs Clearance Not Required` | `false` |

### trailer_or_container__c / trailer_type__c Values

**trailer_or_container__c:** `Trailer`, `Container`

**trailer_type__c:** `Curtain Sider`, `Containers`, `Tipper Trucks`, `Walking Floor`

**container_type__c:** `20' Container`, `40' Container - Standard`, `40' Container - High Cube`, `45' Container - Standard`, `45' Container - High Cube`, `20' Open Top Container (OTCs)`, `40' Open Top Container (OTCs)`

### Outbound Only Fields (WT→SF)

| SF Field | WT Source | Notes |
|----------|-----------|-------|
| `Name` | `haulageOffer.id` | With env prefix |
| `WasteTrade_Haulage_Offers_ID__c` | `haulageOffer.id` | External ID |
| `bid_id__c` | `haulageOffer.offerId` | Link to parent offer |
| `listing_id__c` | `offer.listingId` | Link to listing |
| `offer_accepted__c` | `status === 'accepted'` | boolean |
| `offer_rejected__c` | `status === 'rejected'` | boolean |
| `listing_sold__c` | `offer.status === 'accepted'` | boolean |
| `wt_haulage_admin__c` | `assignedAdminId` | Admin info |
| `haulage_notes__c` | `notes` | |
| `so_details__c` | Buyer/Seller/Haulier | Combined info |
| `haulage_extras__c` | `customsFee` | |

---

## 5. Haulage_Loads__c → HaulageLoads

**API Name:** `Haulage_Loads__c`
**Webhook:** `POST /salesforce/webhook/load-updated`
**External ID Field:** `WasteTrade_Load_Id__c`

### Inbound Sync Fields

| SF Field | WT Field | Type | Notes |
|----------|----------|------|-------|
| `load_number__c` | `loadNumber` | string | |
| `collection_date__c` | `collectionDate` | date | |
| `gross_weight__c` | `grossWeight` | string | |
| `pallet_weight__c` | `palletWeight` | string | |
| `load_status__c` | `loadStatus` | picklist | `mapLoadStatus()` |

### load_status__c Mapping (via `mapLoadStatus()`)

Values identical in Title Case: `Awaiting Collection`, `In Transit`, `Delivered`

### Outbound Only Fields (WT→SF)

| SF Field | WT Source | Notes |
|----------|-----------|-------|
| `Name` | `load.loadNumber` | With env prefix |
| `WasteTrade_Load_Id__c` | `load.id` | External ID |
| `haulage_bid_id__c` | `haulageOffer.id` | Link to parent offer |

### NOT Synced

- Carrier fields (FC/SC/TC): `fc_company_name__c`, `fc_first_name__c`, etc.
- Document fields: `annex_vii__c`, `cmr_paperwork__c`, etc.
- Customs/compliance: `basel_annex_ix__c`, `hs_code__c`, etc.
- Other: `net_weight__c`, `number_of_bales__c`, `material__c`, etc.

---

## 6. Sales_Listing__c → Listings (Bidirectional)

**API Name:** `Sales_Listing__c`
**Webhook:** `POST /salesforce/webhook/listing-status-updated`
**External ID Field:** `WasteTrade_Listing_Id__c`
**Direction:** Bidirectional — all CSV-mapped fields

### Inbound Sync Fields (SF → WT)

| SF Field | WT Field | Type | Notes |
|----------|----------|------|-------|
| `Listing_Status__c` | `status` | picklist | Via `mapListingStatus()` + state transition validation |
| `Rejection_Reason__c` | `rejectionReason` | string | |
| `Description__c` | `description` | textarea | |
| `Material_Weight__c` | `materialWeight` | double | |
| `Number_of_Loads__c` | `numberOfLoads` | integer | |
| `Packaging_Type__c` | `materialPacking` | picklist | Lowercase conversion |
| `Storage_Type__c` | `wasteStoration` | picklist | Lowercase conversion |
| `Available_From_Date__c` | `startDate` | date | |
| `CurrencyIsoCode` | `currency` | picklist | Via `mapCurrency()` — GBP/EUR/USD |
| `Material_Type__c` | `materialType` | string | Lowercase; fallback: `Material_Group__c` |
| `Material__c` | `materialItem` | picklist | |
| `Price_Per_Tonne__c` | `pricePerMetricTonne` | currency | Fallback: `Indicated_Price__c` |
| `Material_Location__c` | `locationId` | reference | Resolved by location name lookup |

### Listing_Status__c Mapping (via `mapListingStatus()`)

**Inbound (SF→WT):**

| SF Value | WT Value |
|----------|----------|
| `Pending Approval` | `pending` |
| `Approved` | `available` |
| `Available` | `available` |
| `Sold` | `sold` |
| `Expired` | `expired` |
| `Rejected` | `rejected` |

**Outbound (WT→SF):**

| WT Value | SF Value |
|----------|----------|
| `pending` | `Pending Approval` |
| `available` | `Available` |
| `active` | `Available` |
| `approved` | `Approved` |
| `expired` | `Expired` |
| `sold` | `Sold` |
| `rejected` | `Rejected` |
| `withdrawn` | `Rejected` |

**State transition validation:** `SOLD` cannot go back to `PENDING`/`AVAILABLE`; `EXPIRED` cannot go back to `PENDING`.

### All Outbound Fields

| SF Field | WT Source | Type | Notes |
|----------|-----------|------|-------|
| `Name` | `listing.title` | string | With env prefix |
| `WasteTrade_Listing_Id__c` | `listing.id` | string | External ID |
| `Sales_Listing_Name__c` | `listing.title` | string | Max 80 chars |
| `Sales_Listing_Link__c` | - | url | `{FRONTEND_URL}/listing/{id}` |
| `WasteTrade_User_Id__c` | `listing.createdByUserId` | string | |
| `WasteTrade_Site_Id__c` | `listing.locationId` | string | |
| `Material_Type__c` | `listing.materialType` | string | |
| `Material_Packing__c` | `listing.materialPacking` | string | |
| `Material__c` | `listing.materialType` | picklist | Via `mapMaterialPicklist()` |
| `Group__c` | `listing.materialType` | string | |
| `Packaging_Type__c` | `listing.materialPacking` | picklist | Via `mapPackagingTypePicklist()` |
| `Material_Weight__c` | `listing.quantity` | double | |
| `Number_of_Loads__c` | calculated | double | `quantity / materialWeightPerUnit` |
| `Price_Per_Tonne__c` | `listing.pricePerMetricTonne` | currency | |
| `Indicated_Price__c` | `listing.pricePerMetricTonne` | currency | |
| `CurrencyIsoCode` | `listing.currency` | picklist | GBP/EUR/USD |
| `Available_From_Date__c` | `listing.startDate` | date | |
| `Available_Until__c` | `listing.endDate` | date | |
| `Created_Date__c` | `listing.createdAt` | datetime | |
| `Listing_Status__c` | `listing.status` | picklist | Via `mapListingStatus()` |
| `WasteTrade_Publication_Status__c` | `listing.status` | picklist | Draft/Published/Archived |
| `Description__c` | `listing.description` | textarea | |
| `Additional_Information__c` | `listing.additionalNotes` | textarea | |
| `Storage_Type__c` | `listing.wasteStoration` | picklist | Via `mapStorageTypePicklist()` |
| `Material_Origin_Country_Restricted__c` | `listing.materialRemainInCountry` | boolean | |
| `Sales_Listing_Featured_Image_Link__c` | listingDocuments[0] | url | FEATURE_IMAGE type |
| `Sales_Listing_Featured_Image_Link_2__c` | listingDocuments[1] | url | |
| `Sales_Listing_Featured_Image_Link_3__c` | listingDocuments[2] | url | |
| `Send_Engagement_Email__c` | - | boolean | Default: false |
| `Generate_Engagement_Campaign__c` | - | boolean | Default: false |

### Picklist Values

**Material__c:** `ABS`, `ACRYLIC`, `EPS`, `HDPE`, `LDPE`, `OTHER (MIX)`, `OTHER (SINGLE SOURCES)`, `PC`, `PE`, `PET`, `Plastic`, `PP`, `PS`, `PVC`

**Packaging_Type__c:** `Agglomerate`, `Bags`, `Bales`, `Granules`, `Loose`, `Lumps`, `Prime`, `Regrind`, `Rolls`, `Shred`

---

## 7. Wanted_Listings__c → Listings (Bidirectional)

**API Name:** `Wanted_Listings__c`
**Webhook:** `POST /salesforce/webhook/wanted-listing-status-updated`
**External ID Field:** `WasteTrade_Listing_Id__c`
**Direction:** Bidirectional — all CSV-mapped fields

### Inbound Sync Fields (SF → WT)

| SF Field | WT Field | Type | Notes |
|----------|----------|------|-------|
| `Listing_Status__c` | `status` | picklist | Via `mapListingStatus()` |
| `Rejection_Reason__c` | `rejectionReason` | string | |
| `Quantity__c` | `materialWeightWanted` | double | |
| `MFI_Range__c` | `materialFlowIndex` | picklist | Via MFI mapping |
| `How_its_packaged__c` | `materialPacking` | string | Lowercase conversion |
| `How_its_Stored__c` | `wasteStoration` | string | Lowercase conversion |
| `Comments__c` | `additionalNotes` | textarea | |
| `Available_From__c` | `startDate` | datetime | |
| `Material_Type__c` | `materialType` | string | Lowercase; fallback: `Material_Group__c` |
| `Location_of_Waste__c` | `locationId` | reference | Resolved by location name lookup |

### MFI_Range__c Mapping (Inbound)

| SF Value | WT Value |
|----------|----------|
| `Low (0.1-10)` | `low` |
| `Medium (10-40)` | `medium` |
| `High (40+)` | `high` |

### All Outbound Fields

| SF Field | WT Source | Type |
|----------|-----------|------|
| `Name` | `listing.title` | string |
| `WasteTrade_Listing_Id__c` | `listing.id` | string |
| `Wt_Author_ID__c` | `listing.createdByUserId` | string |
| `Company_Name__c` | `listing.title` | string |
| `Material_Group__c` | `listing.materialType` | string |
| `Material_Type__c` | `listing.materialType` | string |
| `Quantity__c` | `listing.quantity` | double |
| `How_its_packaged__c` | `listing.materialPacking` | string |
| `Available_From__c` | `listing.startDate` | datetime |
| `Comments__c` | `listing.description` | textarea |
| `Listing_Status__c` | `listing.status` | string |
| `Created_Date__c` | `listing.createdAt` | datetime |

---

## 8. Offers__c → Offers (Bidirectional)

**API Name:** `Offers__c`
**Webhook:** `POST /salesforce/webhook/offer-status-updated`
**External ID Field:** `WasteTrade_Offer_Id__c`
**Direction:** Bidirectional — all CSV-mapped fields

### Inbound Sync Fields (SF → WT)

| SF Field | WT Field | Type | Notes |
|----------|----------|------|-------|
| `bid_status__c` | `status` | picklist | Via `mapOfferStatus()` + state transition validation |
| `Rejection_Reason__c` | `rejectionReason` | string | |
| `Offered_Price_Per_Unit__c` | `offeredPricePerUnit` | currency | |
| `Currency__c` | `currency` | string | Via `mapCurrency()` — GBP/EUR/USD |
| `Incoterms__c` | `incoterms` | string | |
| `number_of_loads_bid_on__c` | `quantity` | number | |
| `Quantity__c` | `quantity` | double | Alternative field (if `number_of_loads_bid_on__c` not set) |
| `Total_Price__c` | `totalPrice` | currency | |
| `Earliest_Delivery_Date__c` | `earliestDeliveryDate` | date | |
| `Latest_Delivery_Date__c` | `latestDeliveryDate` | date | |
| `Buyer_Location__c` | `buyerLocationId` | reference | Resolved by location name lookup |
| `Seller_Location__c` | `sellerLocationId` | reference | Resolved by location name lookup |

### bid_status__c Mapping (via `mapOfferStatus()`)

**Inbound (SF→WT):**

| SF Value | WT Value |
|----------|----------|
| `Pending` | `pending` |
| `Approved` | `approved` |
| `Accepted` | `accepted` |
| `Rejected` | `rejected` |
| `Partially_Shipped` | `partially_shipped` |
| `Shipped` | `shipped` |
| `Unsuccessful` | `rejected` (legacy) |
| `Partially Shipped` | `partially_shipped` (legacy space format) |

**Outbound (WT→SF):**

| WT Value | SF Value |
|----------|----------|
| `pending` | `Pending` |
| `approved` | `Approved` |
| `accepted` | `Accepted` |
| `rejected` | `Rejected` |
| `partially_shipped` | `Partially_Shipped` |
| `shipped` | `Shipped` |

**State transition validation:**
- `accepted` cannot revert to `pending`
- `rejected` cannot go to `pending` or `accepted`
- `shipped` cannot go to `pending`, `rejected`, or `accepted`
- `partially_shipped` cannot revert to `pending`

**Auto-set:** When status transitions to `accepted`, `acceptedAt` is set to current timestamp.

### All Outbound Fields

| SF Field | WT Source | Type | Notes |
|----------|-----------|------|-------|
| `Name` | `offer.id` | string | With env prefix |
| `WasteTrade_Offer_Id__c` | `offer.id` | string | External ID |
| `listing__c` | `offer.listingId` | string | |
| `Related_Listing__c` | `offer.listingId` | string | |
| `Quantity__c` | `offer.quantity` | double | |
| `Offered_Price_Per_Unit__c` | `offer.offeredPricePerUnit` | currency | |
| `Total_Price__c` | `offer.totalPrice` | currency | |
| `Currency__c` | `offer.currency` | string | |
| `Offer_Status__c` | `offer.status` | string | Display field |
| `Offer_State__c` | `offer.state` | string | |
| `Message__c` | `offer.message` | string | Max 255 chars |
| `Earliest_Delivery_Date__c` | `offer.earliestDeliveryDate` | date | |
| `Latest_Delivery_Date__c` | `offer.latestDeliveryDate` | date | |
| `Expires_At__c` | `offer.expiresAt` | datetime | |
| `Created_Date__c` | `offer.createdAt` | datetime | |
| `Incoterms__c` | `offer.incoterms` | string | |
| `Shipping_Port__c` | `offer.shippingPort` | string | |
| `Needs_Transport__c` | `offer.needsTransport` | boolean | |
| `bid_status__c` | `offer.status` | picklist | Via `mapOfferStatus()` |
| `bid_currency__c` | `offer.currency` | string | |
| `bid_value__c` | `offer.offeredPricePerUnit` | string | |
| `bid_accepted__c` | `status === 'accepted'` | boolean | |
| `Buyer_Country__c` | `offer.buyerCountry` | string | |
| `Buyer_User_Id__c` | `offer.buyerUserId` | string | |
| `Buyer_Full_Name__c` | `buyerUser.firstName + lastName` | string | |
| `Buyer_Company__c` | `buyerCompany.name` | string | |
| `Buyer_Company_Id__c` | `offer.buyerCompanyId` | string | |
| `Buyer_Location__c` | `buyerLocation.locationName` | string | |
| `Buyer_Location_Id__c` | `offer.buyerLocationId` | string | |
| `warehouse_address__c` | buyerLocation | textarea | Full address |
| `Pickup_Location_Address__c` | sellerLocation | textarea | Full address |
| `Delivery_Location_Address__c` | buyerLocation | textarea | Full address |
| `Seller_Country__c` | `offer.sellerCountry` | string | |
| `Seller_User_Id__c` | `offer.sellerUserId` | string | |
| `Seller_Full_Name__c` | `sellerUser.firstName + lastName` | string | |
| `Seller_Company__c` | `sellerCompany.name` | string | |
| `Seller_Company_Id__c` | `offer.sellerCompanyId` | string | |
| `Seller_Location__c` | `sellerLocation.locationName` | string | |
| `Seller_Location_Id__c` | `offer.sellerLocationId` | string | |
| `Material_Name__c` | listing | string | Via `buildMaterialName()` |
| `Material_Type__c` | `listing.materialType` | string | |
| `Material_Packing__c` | `listing.materialPacking` | string | |
| `Material_Weight__c` | `listing.materialWeightPerUnit` | double | |
| `number_of_loads_bid_on__c` | calculated | double | |
| `Rejection_Reason__c` | `offer.rejectionReason` | string | Max 255 chars |
| `Rejection_Source__c` | `offer.rejectionSource` | string | |
| `Rejected_By_User_Id__c` | `offer.rejectedByUserId` | string | |
| `Accepted_By_User_Id__c` | `offer.acceptedByUserId` | string | |
| `Accepted_At__c` | `offer.acceptedAt` | datetime | |
| `wt_offer_admin__c` | - | string | Admin action info |
| `bidder_profile__c` | - | string | Buyer profile summary |
| `bid_final_value__c` | `offer.totalPrice` | double | Only if accepted |
| `post_notes__c` | - | textarea | Combined notes |
| `listing_link__c` | - | url | Link to listing |

---

## 9. Document__c (Outbound Only)

**API Name:** `Document__c`
**External ID Field:** `WasteTrade_Document_Id__c`
**Direction:** WT→SF only

### All Outbound Fields

| SF Field | WT Source | Type |
|----------|-----------|------|
| `Name` | `doc.documentName` | string |
| `WasteTrade_Document_Id__c` | `doc.id` | string |
| `Document_Type__c` | `doc.documentType` | string |
| `Document_URL__c` | `doc.documentUrl` | url |
| `Document_Status__c` | `doc.status` | string |
| `Uploaded_By__c` | `doc.uploadedByUserId` | string |
| `Reviewed_By__c` | `doc.reviewedByUserId` | string |
| `Rejection_Reason__c` | `doc.rejectionReason` | string |
| `Expiry_Date__c` | `doc.expiryDate` | date |
| `Reviewed_At__c` | `doc.reviewedAt` | datetime |
| `Created_Date__c` | `doc.createdAt` | datetime |

---

## 10. ContentDocument / ContentVersion / ContentDocumentLink

**Standard SF Objects for file storage**
**Direction:** WT→SF only (Files uploaded via WT, linked to SF records)

### ContentVersion Fields Used

| SF Field | WT Source | Type | Notes |
|----------|-----------|------|-------|
| `Title` | `document.title` | string | |
| `PathOnClient` | `document.fileName` | string | |
| `VersionData` | file content | base64 | |
| `FirstPublishLocationId` | parent record ID | reference | Links to Account/Contact/etc |

### ContentDocumentLink Fields

| SF Field | Value | Notes |
|----------|-------|-------|
| `LinkedEntityId` | parent record ID | The record file is attached to |
| `ContentDocumentId` | ContentDocument ID | Auto-created |
| `ShareType` | `V` | Viewer access |
| `Visibility` | `AllUsers` | |

---

## Bidirectional Mappers Reference

**File:** `src/utils/salesforce/salesforce-bidirectional-mapping.utils.ts`

```typescript
// All mappers accept (value, isInbound) parameters
// isInbound=true: SF→WT, isInbound=false: WT→SF

mapCompanyRole(value, isInbound)        // CompanyUser role
mapCompanyUserStatus(value, isInbound)  // CompanyUser status
mapCompanyStatus(value, isInbound)      // Company/Account status
mapHaulageOfferStatus(value, isInbound, currentWtStatus?) // Lossy 3→8 mapping
mapTransportProvider(value, isInbound)
mapExpectedTransitTime(value, isInbound)
mapCustomsClearance(value, isInbound)   // boolean ↔ picklist
mapTrailerContainer(value, isInbound)   // string ↔ {trailerOrContainer, trailerType}
mapCurrency(value, isInbound)           // lowercase ↔ uppercase
mapListingStatus(value, isInbound)
mapOfferStatus(value, isInbound)
mapUserRole(value, isInbound)
mapUserStatus(value, isInbound)         // Lead only
mapLoadStatus(value, isInbound)
```

---

## Loop Prevention

All synced records include `Last_Sync_Origin__c` field:
- Format: `WT_{timestamp}` for outbound (WT→SF)
- Inbound webhooks check this field and skip if starts with `WT_`

---

## Field Count Summary

| Object | Inbound Fields | Outbound | Notes |
|--------|---------------|----------|-------|
| Account | 14 | Full | `Type` outbound-only (different classification) |
| Contact | 11 | Full | All bidirectional fields synced both directions |
| Lead | 3 | Full | One-way only after Contact creation |
| Haulage_Offers__c | 12 | Full | SF ops team manages |
| Haulage_Loads__c | 5 | 3 fields | Limited inbound |
| Sales_Listing__c | 13 | Full | Bidirectional per BA confirmation |
| Wanted_Listings__c | 10 | Full | Bidirectional per BA confirmation |
| Offers__c | 12 | Full | Bidirectional per BA confirmation |
| Document__c | 0 | Full | Outbound only |
| ContentDocument/Version/Link | 0 | Yes | File storage |

---

## Design Principles

1. **WasteTrade is system of record** — All business logic lives in WT
2. **SF is consumer/reporting system** — Operations team views and limited updates
3. **Only mapped fields accepted inbound** — Unmapped fields ignored
4. **Non-writable fields rejected** — Returns `field_not_writable_from_sf` error
5. **External IDs required** — All synced objects must have WT external ID field
6. **Last_Sync_Origin__c tracking** — Auto-populated to track sync direction
7. **Timestamp validation** — Stale updates rejected based on `updatedAt` using `<=`

---

## Important Notes & Gotchas

### 1. Account Type vs WasteTrade_Type__c — Different Fields

**`Type`** (standard SF field) = Account category: `Customer`, `Haulier`, `Supplier`, etc. Set from `isHaulier` flag. **Outbound only** — NOT synced inbound because SF `Type` values don't match WT `CompanyType` enum.

**`WasteTrade_Type__c`** (custom field) = WT business type. Mapping:

| WT CompanyType | SF WasteTrade_Type__c |
|---------------|----------------------|
| `manufacturer` | `Waste Management Facility` |
| `processor` | `Waste Management Facility` |
| `recycler` | `Recycler` |
| `broker` | `Broker` |
| `waste_producer` | `Waste Generator` |

### 2. Account Status — String Field, Not Picklist

`Account_Status__c` is a **custom string field**, NOT a picklist. Values mapped via `mapCompanyStatus()`: `Pending`, `Active`, `Rejected`, `Request Information`. Legacy `Inactive` → `rejected`.

### 3. Contact Status & Role — CompanyUsers Table

NOT in User table — role and status are company-specific:
- `Company_Role__c` → `companyUsers.companyRole`
- `Company_User_Status__c` → `companyUsers.status`
- Webhook finds CompanyUser by `userId + companyId` (from accountExternalId)
- **INACTIVE → request_information** (legacy backward compat, NOT `inactive`)

### 4. Lead → User — One-Way Only

Lead updates sync to User, but User changes don't sync back to Lead. Lead is for pending registrations only. Once Contact is created, Lead is abandoned. Material interests are 28 boolean checkboxes fetched from `materialUsers` table.

### 5. Haulage Offers — Lossy Status Mapping

SF has 3 picklist values (`Pending Approval`, `Approved`, `Rejected`); WT has 8 statuses. `mapHaulageOfferStatus()` preserves current WT status when SF `Approved` maps ambiguously (e.g. won't overwrite `accepted`/`partially_shipped`/`shipped` with `approved`).

### 6. Haulage Loads — Limited Inbound

Only 5 fields synced inbound. Carrier fields (FC/SC/TC), document fields, customs/compliance fields NOT synced. Lookup to parent offer via `haulage_bid_id__c` external ID.

### 7. Environment Prefix

All external IDs include prefix: `DEV_{id}`, `UAT_{id}`, `PROD_{id}`. Inbound: stripped via `extractWasteTradeId()`. Outbound: added via `addEnvironmentPrefixToExternalId()`. Prefix on `Name` fields stripped via `ENV_PREFIX_PATTERN` regex.

### 8. Duplicate Event Detection

Within 1 second = likely duplicate (simple timestamp comparison). Not foolproof — production should track processed event IDs.

### 9. Stale Update Rejection

Uses `<=` not `<` — same timestamp = reject (safety first). Prevents race conditions.

### 10. Shipping Address Duplication

Account has BOTH standard and custom shipping fields synced outbound for backward compatibility. Inbound only reads standard fields.

### 11. Contact Email — Immutable Identifier

Email is bidirectional but used as unique identifier for User lookup. If email changes in SF, old User won't be found.

### 12. Offer/Listing State Transitions

Inbound status changes validated against `invalidTransitions` map. Invalid transitions silently skipped (field not updated, no error thrown).

### 13. Document Sync — Separate Flow

Documents use ContentDocument/ContentVersion, uploaded via separate file upload API, linked to parent records via ContentDocumentLink. File storage in AWS S3, metadata in SF.

### 14. Webhook Validation — 6-Step Process

1. Loop prevention marker (`Last_Sync_Origin__c` starts with `WT_`)
2. Schema version (`mappingVersion` matches `MAPPING_SCHEMA_VERSION` = `1.1.0`)
3. Timestamp (stale update check using `<=`)
4. Field writability (only mapped fields allowed)
5. External ID format (environment prefix validation)
6. Record existence (by ID or external ID lookup)

### 15. Currency Mapping

SF uses uppercase (`GBP`, `EUR`, `USD`). WT uses lowercase (`gbp`, `eur`, `usd`). `mapCurrency()` handles conversion in both directions.

### 16. Location Resolution

Inbound location fields (`Material_Location__c`, `Buyer_Location__c`, `Seller_Location__c`, `Location_of_Waste__c`) are resolved by looking up `CompanyLocations` by `locationName`. If not found, field is skipped (no error).
