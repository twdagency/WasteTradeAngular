# Offers (Offers__c)

**API Name:** `Offers__c`

**Total Fields:** 84

---

## Standard Fields (12)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Record ID | `Id` | id | ✓ |  |  |  |
| Owner ID | `OwnerId` | reference | ✓ |  |  |  |
| Deleted | `IsDeleted` | boolean | ✓ |  |  |  |
| Offers Name | `Name` | string |  |  |  |  |
| Currency ISO Code | `CurrencyIsoCode` | picklist |  |  |  |  |
| Created Date | `CreatedDate` | datetime | ✓ |  |  |  |
| Created By ID | `CreatedById` | reference | ✓ |  |  |  |
| Last Modified Date | `LastModifiedDate` | datetime | ✓ |  |  |  |
| Last Modified By ID | `LastModifiedById` | reference | ✓ |  |  |  |
| System Modstamp | `SystemModstamp` | datetime | ✓ |  |  |  |
| Last Viewed Date | `LastViewedDate` | datetime |  |  |  |  |
| Last Referenced Date | `LastReferencedDate` | datetime |  |  |  |  |


## Custom Fields (72)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Admin Bid Status | `admin_bid_status__c` | picklist |  |  |  |  |
| Bid Accepted | `bid_accepted__c` | boolean | ✓ |  |  |  |
| Bid Currency | `bid_currency__c` | string |  |  |  |  |
| Bid Custom Value | `bid_custom_value__c` | double |  |  |  |  |
| Final Value | `bid_final_value__c` | double |  |  |  |  |
| Bid Status | `bid_status__c` | picklist |  |  |  |  |
| Bid Value | `bid_value__c` | string |  |  |  |  |
| Bidder Distance | `bidder_distance__c` | string |  |  |  |  |
| Bidder ID | `bidder_id__c` | string |  |  |  |  |
| Bidder Profile | `bidder_profile__c` | string |  |  |  |  |
| Bidder Username | `bidder_username__c` | string |  |  |  |  |
| Bidder Warehouse Location | `bidder_warehouse_location__c` | string |  |  |  |  |
| Buyer Earliest Delivery Date | `buyer_earliest_delivery_date__c` | date |  |  |  |  |
| Buyer Latest Delivery Date | `buyer_latest_delivery_date__c` | date |  |  |  |  |
| Buyer Loads Remaining | `buyer_loads_remaining__c` | double |  |  |  |  |
| Buyer Warehouse ID | `buyer_warehouse_id__c` | string |  |  |  |  |
| Delivery Status | `delivery_status__c` | picklist |  |  |  |  |
| Last Sync Origin | `Last_Sync_Origin__c` | string |  |  |  |  |
| Listing ID | `listing__c` | string |  |  |  |  |
| Listing Link | `listing_link__c` | url |  |  |  |  |
| Listing Sold | `listing_sold__c` | boolean | ✓ |  |  |  |
| Listing User ID | `listing_user_id__c` | string |  |  |  |  |
| Listing Username | `listing_username__c` | string |  |  |  |  |
| Number of Loads Bid on | `number_of_loads_bid_on__c` | double |  |  |  |  |
| Offer Valid Date | `offer_valid_date__c` | date |  |  |  |  |
| PO Details | `po_details__c` | textarea |  |  |  |  |
| PO PDF | `po_pdf__c` | string |  |  |  |  |
| Notes | `post_notes__c` | textarea |  |  |  |  |
| Sales Listing | `sales_listing__c` | reference |  |  |  |  |
| Warehouse Address | `warehouse_address__c` | textarea |  |  |  |  |
| Admin | `wt_offer_admin__c` | string |  |  |  |  |
| WasteTrade Offer ID | `WasteTrade_Offer_Id__c` | string |  | ✓ | ✓ |  |
| Offer State | `Offer_State__c` | string |  |  |  |  |
| Earliest Delivery Date | `Earliest_Delivery_Date__c` | date |  |  |  |  |
| Offer Status | `Offer_Status__c` | string |  |  |  |  |
| Message | `Message__c` | string |  |  |  |  |
| Quantity | `Quantity__c` | double |  |  |  |  |
| Offered Price Per Unit | `Offered_Price_Per_Unit__c` | currency |  |  |  |  |
| Currency | `Currency__c` | string |  |  |  |  |
| Related Listing | `Related_Listing__c` | string |  |  |  |  |
| Total Price | `Total_Price__c` | currency |  |  |  |  |
| Expires At | `Expires_At__c` | datetime |  |  |  |  |
| Buyer User ID | `Buyer_User_Id__c` | string |  |  |  |  |
| Buyer Country | `Buyer_Country__c` | string |  |  |  |  |
| Rejection Source | `Rejection_Source__c` | string |  |  |  |  |
| Seller Country | `Seller_Country__c` | string |  |  |  |  |
| Rejection Reason | `Rejection_Reason__c` | string |  |  |  |  |
| Shipping Port | `Shipping_Port__c` | string |  |  |  |  |
| Incoterms | `Incoterms__c` | string |  |  |  |  |
| Needs Transport | `Needs_Transport__c` | boolean | ✓ |  |  |  |
| Latest Delivery Date | `Latest_Delivery_Date__c` | date |  |  |  |  |
| Buyer Location | `Buyer_Location__c` | string |  |  |  |  |
| Created Date | `Created_Date__c` | datetime |  |  |  |  |
| Seller Company | `Seller_Company__c` | string |  |  |  |  |
| Seller Company ID | `Seller_Company_Id__c` | string |  |  |  |  |
| Seller Full Name | `Seller_Full_Name__c` | string |  |  |  |  |
| Buyer Location ID | `Buyer_Location_Id__c` | string |  |  |  |  |
| Buyer Full Name | `Buyer_Full_Name__c` | string |  |  |  |  |
| Buyer Company | `Buyer_Company__c` | string |  |  |  |  |
| Seller User ID | `Seller_User_Id__c` | string |  |  |  |  |
| Buyer Company ID | `Buyer_Company_Id__c` | string |  |  |  |  |
| Seller Location | `Seller_Location__c` | string |  |  |  |  |
| Rejected By User ID | `Rejected_By_User_Id__c` | string |  |  |  |  |
| Material Packing | `Material_Packing__c` | string |  |  |  |  |
| Material Weight | `Material_Weight__c` | double |  |  |  |  |
| Accepted At | `Accepted_At__c` | datetime |  |  |  |  |
| Accepted By User ID | `Accepted_By_User_Id__c` | string |  |  |  |  |
| Material Name | `Material_Name__c` | string |  |  |  |  |
| Material Type | `Material_Type__c` | string |  |  |  |  |
| Seller Location ID | `Seller_Location_Id__c` | string |  |  |  |  |
| Delivery Location Address | `Delivery_Location_Address__c` | textarea |  |  |  |  |
| Pickup Location Address | `Pickup_Location_Address__c` | textarea |  |  |  |  |


## Picklist Values

### Currency ISO Code (`CurrencyIsoCode`)

**Active Values:** 3

```
- "GBP" (default)
- "EUR"
- "USD"
```

### Admin Bid Status (`admin_bid_status__c`)

**Active Values:** 3

```
- "Awaiting_Approval"
- "Approved"
- "Rejected"
```

### Bid Status (`bid_status__c`)

**Active Values:** 7

```
- "Pending"
- "Accepted"
- "Unsuccessful"
- "Approved"
- "Rejected"
- "Partially_Shipped"
- "Shipped"
```

### Delivery Status (`delivery_status__c`)

**Active Values:** 3

```
- "Loaded/Dispatched"
- "Shipped"
- "Delivered"
```

