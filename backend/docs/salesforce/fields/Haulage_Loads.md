# Haulage Loads (Haulage_Loads__c)

**API Name:** `Haulage_Loads__c`

**Total Fields:** 92

---

## Standard Fields (12)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Record ID | `Id` | id | ✓ |  |  |  |
| Owner ID | `OwnerId` | reference | ✓ |  |  |  |
| Deleted | `IsDeleted` | boolean | ✓ |  |  |  |
| Haulage Loads Name | `Name` | string |  |  |  |  |
| Currency ISO Code | `CurrencyIsoCode` | picklist |  |  |  |  |
| Created Date | `CreatedDate` | datetime | ✓ |  |  |  |
| Created By ID | `CreatedById` | reference | ✓ |  |  |  |
| Last Modified Date | `LastModifiedDate` | datetime | ✓ |  |  |  |
| Last Modified By ID | `LastModifiedById` | reference | ✓ |  |  |  |
| System Modstamp | `SystemModstamp` | datetime | ✓ |  |  |  |
| Last Viewed Date | `LastViewedDate` | datetime |  |  |  |  |
| Last Referenced Date | `LastReferencedDate` | datetime |  |  |  |  |


## Custom Fields (80)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Haulage Offer | `Haulage_Offer__c` | reference |  |  |  |  |
| Loading Photos | `Loading_Photos__c` | textarea |  |  |  |  |
| Annex VII | `annex_vii__c` | boolean | ✓ |  |  |  |
| Annex VII PDF | `annex_vii_pdf__c` | string |  |  |  |  |
| Basel Annex IX | `basel_annex_ix__c` | string |  |  |  |  |
| CMR Paperwork | `cmr_paperwork__c` | boolean | ✓ |  |  |  |
| CMR PDF | `cmr_pdf__c` | string |  |  |  |  |
| Collection Date | `collection_date__c` | date |  |  |  |  |
| Commercial Invoice | `commercial_invoice__c` | boolean | ✓ |  |  |  |
| Destination Country | `destination_country__c` | string |  |  |  |  |
| Duty of Care | `duty_of_care__c` | boolean | ✓ |  |  |  |
| Duty of Care PDF | `duty_of_care_pdf__c` | string |  |  |  |  |
| EC List of Wastes | `ec_list_of_wastes__c` | string |  |  |  |  |
| Export Country | `export_country__c` | string |  |  |  |  |
| FC Address Line 2 | `fc_address_line_2__c` | string |  |  |  |  |
| FC City | `fc_city__c` | string |  |  |  |  |
| FC Company Name | `fc_company_name__c` | string |  |  |  |  |
| FC Country | `fc_country__c` | string |  |  |  |  |
| FC County | `fc_county__c` | string |  |  |  |  |
| FC Date of Transfer | `fc_date_of_transfer__c` | date |  |  |  |  |
| FC Email | `fc_email__c` | string |  |  |  |  |
| FC First Name | `fc_first_name__c` | string |  |  |  |  |
| FC Means of Transport | `fc_means_of_transport__c` | string |  |  |  |  |
| FC Post Code | `fc_post_code__c` | string |  |  |  |  |
| FC Second Name | `fc_second_name__c` | string |  |  |  |  |
| FC Street Address | `fc_street_address__c` | string |  |  |  |  |
| FC Telephone | `fc_telephone__c` | string |  |  |  |  |
| FC Vehicle Registration | `fc_vehicle_registration__c` | string |  |  |  |  |
| Green List | `green_list__c` | boolean | ✓ |  |  |  |
| Green List PDF | `green_list_pdf__c` | string |  |  |  |  |
| Gross Weight | `gross_weight__c` | string |  |  |  |  |
| Haulage Bid ID | `haulage_bid_id__c` | string |  |  |  |  |
| HS Code | `hs_code__c` | string |  |  |  |  |
| Load Invoice | `load_invoice__c` | boolean | ✓ |  |  |  |
| Load Number | `load_number__c` | string |  |  |  |  |
| Load Status | `load_status__c` | picklist |  |  |  |  |
| Material | `material__c` | string |  |  |  |  |
| National Code | `national_code__c` | string |  |  |  |  |
| Net Weight | `net_weight__c` | string |  |  |  |  |
| Number of Bales | `number_of_bales__c` | string |  |  |  |  |
| OECD | `oecd__c` | string |  |  |  |  |
| Packing List | `packing_list__c` | boolean | ✓ |  |  |  |
| Packing Slip PDF | `packing_slip_pdf__c` | string |  |  |  |  |
| Pallet Weight | `pallet_weight__c` | string |  |  |  |  |
| Purchase Order | `purchase_order__c` | boolean | ✓ |  |  |  |
| Sales Order | `sales_order__c` | boolean | ✓ |  |  |  |
| SC Address Line 2 | `sc_address_line_2__c` | string |  |  |  |  |
| SC City | `sc_city__c` | string |  |  |  |  |
| SC Company Name | `sc_company_name__c` | string |  |  |  |  |
| SC Country | `sc_country__c` | string |  |  |  |  |
| SC County | `sc_county__c` | string |  |  |  |  |
| SC Date of Transfer | `sc_date_of_transfer__c` | date |  |  |  |  |
| SC Email | `sc_email__c` | string |  |  |  |  |
| SC First Name | `sc_first_name__c` | string |  |  |  |  |
| SC Means of Transport | `sc_means_of_transport__c` | string |  |  |  |  |
| SC Post Code | `sc_post_code__c` | string |  |  |  |  |
| SC Second Name | `sc_second_name__c` | string |  |  |  |  |
| SC Street Address | `sc_street_address__c` | string |  |  |  |  |
| SC Telephone | `sc_telephone__c` | string |  |  |  |  |
| SC Vehicle Registration | `sc_vehicle_registration__c` | string |  |  |  |  |
| Seller Agreed Collection Date | `seller_agreed_collection_date__c` | boolean | ✓ |  |  |  |
| TC Address Line 2 | `tc_address_line_2__c` | string |  |  |  |  |
| TC City | `tc_city__c` | string |  |  |  |  |
| TC Company Name | `tc_company_name__c` | string |  |  |  |  |
| TC Country | `tc_country__c` | string |  |  |  |  |
| TC County | `tc_county__c` | string |  |  |  |  |
| TC Date of Transfer | `tc_date_of_transfer__c` | date |  |  |  |  |
| TC Email | `tc_email__c` | string |  |  |  |  |
| TC First Name | `tc_first_name__c` | string |  |  |  |  |
| TC Last Name | `tc_last_name__c` | string |  |  |  |  |
| TC Means of Transport | `tc_means_of_transport__c` | string |  |  |  |  |
| TC Post Code | `tc_post_code__c` | string |  |  |  |  |
| TC Street Address | `tc_street_address__c` | string |  |  |  |  |
| TC Telephone | `tc_telephone__c` | string |  |  |  |  |
| TC Vehicle Registration | `tc_vehicle_registration__c` | string |  |  |  |  |
| Trailer Number | `trailer_number__c` | string |  |  |  |  |
| Last Sync Origin | `Last_Sync_Origin__c` | string |  |  |  |  |
| WasteTrade Load Id | `WasteTrade_Load_Id__c` | string | ✓ |  | ✓ |  |
| shipped date | `shipped_date__c` | date |  |  |  |  |
| Site Location Address | `Site_Location_Address__c` | string |  |  |  |  |


## Picklist Values

### Currency ISO Code (`CurrencyIsoCode`)

**Active Values:** 3

```
- "GBP" (default)
- "EUR"
- "USD"
```

### Load Status (`load_status__c`)

**Active Values:** 3

```
- "Awaiting Collection"
- "In Transit"
- "Delivered"
```

