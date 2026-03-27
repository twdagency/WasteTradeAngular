# CU-869abxxq7 | CRM Alignment - Full Bidirectional Sync

## Overview
Implements full bidirectional Salesforce CRM alignment for all business entities. Maps WasteTrade data to Salesforce objects with both outbound (WT→SF) and inbound (SF→WT) sync capabilities.

## Sync Summary

| Object | SF Object | Bidirectional | Outbound Only | WT Only |
|--------|-----------|---------------|---------------|---------|
| Sales Listings | Sales_Listing__c | 14 | 5 | 4 |
| Wanted Listings | Wanted_Listings__c | 10 | 4 | 3 |
| Offers | Offers__c | 14 | 9 | 1 |
| Haulage Offers | Haulage_Offers__c | 24 | 15 | 0 |
| Haulage Loads | Haulage_Loads__c | 9 | 2 | 0 |
| Users (Lead) | Lead | 10 | 1 | 1 |
| Companies | Account | 6 | 1 | 0 |
| Company Users | Contact | 10 | 0 | 0 |
| Locations | Sites | 12 | 1 | 6 |
| **TOTAL** | | **109** | **38** | **15** |

See `docs/salesforce/FULL_SYNC_CHECKLIST.md` for complete field mapping.

## Implementation Summary

### Key Changes

1. **Company User Service** (`company-user.service.ts`)
   - Enhanced `createCompanyUser()` - only syncs ACTIVE users (after invite acceptance)
   - Enhanced `assignRole()` - triggers SF sync on role changes for ACTIVE users
   - Added `removeCompanyUser()` - marks user as REMOVED and syncs to SF

2. **Salesforce Mapper** (`salesforce-object-mappers.utils.ts`)
   - Updated `mapCompanyUserToContact()` to align with SF schema:
     - `companyRole` → `Role__c` (Dual, Buyer, Seller, Haulier)
     - `isPrimaryContact` → `IsCompanyAdmin__c`
     - `status` → `MemberStatus__c` (Active, Pending, No longer with company)

3. **Salesforce Observer** (`salesforce-sync.observer.ts`)
   - Updated `syncCompanyUserOnChange()` - syncs ACTIVE or REMOVED users

4. **Salesforce Sync Service** (`salesforce-sync.service.ts`)
   - Updated `syncCompanyUser()` - handles REMOVED status properly

## Sync Behavior

### Outbound (WT → SF)

**When User Accepts Invite (status = ACTIVE)**
- Creates/updates Contact in SF under company's Account
- Sets `MemberStatus__c = "Active"`
- Maps role and admin flag

**When Role Changes**
- Updates `Role__c` immediately for ACTIVE users
- Updates `IsCompanyAdmin__c` if primary contact changes

**When User Removed (status = REMOVED)**
- Updates Contact `MemberStatus__c = "No longer with company"`
- Preserves Contact record (no deletion)
- Keeps Account linkage

**Not Synced**
- PENDING/INVITED users (no SF Contact until acceptance)

### Field Mappings

| WasteTrade | Salesforce | Values |
|------------|-----------|--------|
| `companyRole` | `Role__c` | ADMIN → "Dual (Buyer & Seller)"<br>BUYER → "Buyer"<br>SELLER → "Seller"<br>HAULIER → "Haulier" |
| `isPrimaryContact` | `IsCompanyAdmin__c` | true/false |
| `status` | `MemberStatus__c` | ACTIVE → "Active"<br>PENDING/INVITED → "Pending"<br>REMOVED/REJECTED → "No longer with company" |
| `userId` | `WasteTrade_User_Id__c` | External ID for upsert |

## API Endpoints

No new endpoints - existing endpoints enhanced with SF sync:

### POST /company-users
Creates company user membership. Syncs to SF only if status = ACTIVE.

**Request:**
```json
{
  "userId": 123,
  "companyId": 456,
  "companyRole": "BUYER",
  "isPrimaryContact": false,
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Company user created successfully",
  "data": {
    "companyUser": {
      "id": 789,
      "userId": 123,
      "companyId": 456,
      "companyRole": "BUYER",
      "isPrimaryContact": false,
      "status": "ACTIVE",
      "createdAt": "2025-12-26T10:00:00Z",
      "updatedAt": "2025-12-26T10:00:00Z"
    }
  }
}
```

### PATCH /company-users/{id}/role
Updates user role. Triggers SF sync for ACTIVE users.

**Request:**
```json
{
  "userId": 123,
  "newRole": "SELLER"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Role assigned successfully",
  "data": {
    "userId": 123,
    "newRole": "SELLER"
  }
}
```

### DELETE /company-users/{id}
Removes user from company. Sets status = REMOVED and syncs to SF.

**Request:** None (path param only)

**Response:**
```json
{
  "status": "success",
  "message": "User removed from company successfully",
  "data": {
    "companyUserId": 789
  }
}
```

## Testing

### Manual Test Plan

**Test 1: User Accepts Invite**
1. Create company user with status = ACTIVE
2. Verify Contact created in SF with:
   - `MemberStatus__c = "Active"`
   - `Role__c` mapped correctly
   - `AccountId` linked to company

**Test 2: Role Change**
1. Update user role from BUYER to SELLER
2. Verify Contact updated in SF with new `Role__c`

**Test 3: User Removal**
1. Remove user from company
2. Verify Contact updated in SF with:
   - `MemberStatus__c = "No longer with company"`
   - Contact still linked to Account (not deleted)

**Test 4: Pending User (No Sync)**
1. Create company user with status = PENDING
2. Verify NO Contact created in SF

### cURL Examples

**Create Active Company User:**
```bash
curl -X POST https://wastetrade-api-dev.b13devops.com/company-users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "companyId": 456,
    "companyRole": "BUYER",
    "isPrimaryContact": false,
    "status": "ACTIVE"
  }'
```

**Update Role:**
```bash
curl -X PATCH https://wastetrade-api-dev.b13devops.com/company-users/789/role \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "newRole": "SELLER"
  }'
```

**Remove User:**
```bash
curl -X DELETE https://wastetrade-api-dev.b13devops.com/company-users/789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Frontend Integration

No FE changes required - existing company user management flows will automatically sync to SF when:
- User accepts company invite (status becomes ACTIVE)
- Admin changes user role
- Admin removes user from company

## Notes

- **No new SF fields added** - uses existing schema
- **Preserves Contact records** - removal updates status, doesn't delete
- **Loop prevention** - `Last_Sync_Origin__c` marker prevents infinite loops
- **Sync is async** - errors logged but don't fail WT operations
- **Circuit breaker** - protects against SF outages

## Commit Message

```
CU-869abxxq7 | CRM Alignment - Company User Membership Sync

- Sync company users to SF Contacts only when ACTIVE
- Trigger SF sync on role changes for ACTIVE users
- Handle user removal by updating MemberStatus__c
- Map roles to SF schema (Role__c, IsCompanyAdmin__c, MemberStatus__c)
- Skip PENDING/INVITED users from SF sync
```

---

## Inbound Sync (SF → WT)

### Webhook Endpoints

| Endpoint | SF Object | Description |
|----------|-----------|-------------|
| `POST /salesforce/webhook/listing-status-updated` | Sales_Listing__c | Sync listing updates |
| `POST /salesforce/webhook/wanted-listing-status-updated` | Wanted_Listings__c | Sync wanted listing updates |
| `POST /salesforce/webhook/offer-status-updated` | Offers__c | Sync offer/bid updates |
| `POST /salesforce/webhook/haulage-offer-status` | Haulage_Offers__c | Sync haulage offer updates |

### Inbound Field Mappings

#### Sales_Listing__c → Listings (14 fields)
| SF Field | WT Field |
|----------|----------|
| `Listing_Status__c` | status |
| `Description__c` | description |
| `Material_Weight__c` | materialWeight |
| `Number_of_Loads__c` | numberOfLoads |
| `Packaging_Type__c` | materialPacking |
| `Storage_Type__c` | wasteStoration |
| `Available_From_Date__c` | startDate |
| `CurrencyIsoCode` | currency |
| `Material_Type__c` | materialType |
| `Material__c` | materialItem |
| `Price_Per_Tonne__c` | pricePerMetricTonne |
| `Indicated_Price__c` | pricePerMetricTonne |
| `Material_Location__c` | locationId |

#### Wanted_Listings__c → Listings (10 fields)
| SF Field | WT Field |
|----------|----------|
| `Listing_Status__c` | status |
| `Quantity__c` | quantity |
| `MFI_Range__c` | mfiRange |
| `How_its_packaged__c` | materialPacking |
| `How_its_Stored__c` | wasteStoration |
| `Comments__c` | description |
| `Available_From__c` | startDate |
| `Material_Type__c` | materialType |
| `Material_Group__c` | materialType |
| `Location_of_Waste__c` | locationId |

#### Offers__c → Offers (14 fields)
| SF Field | WT Field |
|----------|----------|
| `bid_status__c` | status |
| `Rejection_Reason__c` | rejectionReason |
| `Offered_Price_Per_Unit__c` | offeredPricePerUnit |
| `Currency__c` | currency |
| `Incoterms__c` | incoterms |
| `number_of_loads_bid_on__c` | quantity |
| `Quantity__c` | quantity |
| `Total_Price__c` | totalPrice |
| `Earliest_Delivery_Date__c` | earliestDeliveryDate |
| `Latest_Delivery_Date__c` | latestDeliveryDate |
| `Buyer_Location__c` | buyerLocationId |
| `Seller_Location__c` | sellerLocationId |

#### Haulage_Offers__c → HaulageOffers (24 fields)
| SF Field | WT Field |
|----------|----------|
| `haulier_listing_status__c` | status |
| `haulage_rejection_reason__c` | rejectionReason |
| `post_notes__c` | adminMessage |
| `suggested_collection_date__c` | suggestedCollectionDate |
| `Transport_Provider__c` | transportProvider |
| `trailer_type__c` | trailerContainerType |
| `Customs_Clearance__c` | completingCustomsClearance |
| `expected__c` | expectedTransitTime |
| `demurrage__c` | demurrageAtDestination |
| `haulage__c` | haulageCostPerLoad |
| `haulage_total__c` | haulageTotal |
| `haulage_currency__c` | currency |
| `haulage_notes__c` | notes |
| `number_of_loads_bid_on__c` | numberOfLoads |
| `Quantity__c` | quantityPerLoad |
| `offer_accepted__c` | (status=ACCEPTED) |
| `offer_rejected__c` | (status=REJECTED) |
| `destination_charges__c` | destinationCharges |
| `haulage_extras__c` | haulageExtras |
| `so_details__c` | soDetails |

### New HaulageOffers Model Fields

Added 3 new fields to `HaulageOffers` model for bidirectional sync:

```typescript
// wastetrade-backend/src/models/haulage-offers.model.ts
@property({
    type: 'string',
    jsonSchema: { nullable: true },
    postgresql: { columnName: 'destination_charges', dataType: 'character varying', dataLength: 50, nullable: 'YES' },
})
destinationCharges?: string;

@property({
    type: 'string',
    jsonSchema: { nullable: true },
    postgresql: { columnName: 'haulage_extras', dataType: 'text', nullable: 'YES' },
})
haulageExtras?: string;

@property({
    type: 'string',
    jsonSchema: { nullable: true },
    postgresql: { columnName: 'so_details', dataType: 'text', nullable: 'YES' },
})
soDetails?: string;
```

### Apex Triggers (SF Side)

Updated triggers to detect field changes and call webhooks:

- `SalesListingTrigger.trigger` - 14 fields monitored
- `WantedListingsTrigger.trigger` - 10 fields monitored
- `OffersTrigger.trigger` - 12 fields monitored
- `HaulageOffersTrigger.trigger` - 28 fields monitored

See `docs/salesforce/apex/` for trigger code.

### Loop Prevention

All webhooks include `originMarker` field:
- If `originMarker` starts with `WT_`, update is ignored (originated from WasteTrade)
- Prevents infinite sync loops between systems

### Timestamp Validation

All inbound updates check `updatedAt` timestamp:
- If SF timestamp ≤ WT timestamp, update is rejected as stale
- Ensures most recent data wins

### Documentation

- `docs/salesforce/FULL_SYNC_CHECKLIST.md` - Complete field mapping (162 fields)
- `docs/salesforce/INBOUND_SYNC_CHECKLIST.md` - Inbound sync implementation status
- `docs/salesforce/INBOUND_WEBHOOK_SETUP_GUIDE.md` - SF webhook setup guide
