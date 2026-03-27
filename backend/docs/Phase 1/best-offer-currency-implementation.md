# Best Offer Currency & Wanted Listing Status Implementation

## Overview
This document describes the implementation of:
1. Adding currency information to the best offer in the offers API response
2. Adding material requirement status for wanted listings

## Changes Made

### 1. Updated SQL Query in Offer Service
**File**: `src/services/offer.service.ts`

Modified the `getOfferById` method to include the currency of the best offer:

```sql
-- Added this line to the SQL query:
(SELECT o3.currency FROM offers o3 WHERE o3.listing_id = l.id ORDER BY o3.total_price DESC LIMIT 1) AS "best_offer_currency",
```

This query fetches the currency from the offer with the highest total price for the given listing.

### 2. Updated TypeScript Interface for Offers
**File**: `src/types/offer.ts`

Added `bestOfferCurrency` field to the `OfferDetails` interface:

```typescript
listing: Partial<Listings> & {
    numberOfOffers?: number;
    bestOffer?: number;
    bestOfferCurrency?: string;  // <- Added this field
    documents?: ListingDocuments[];
    location?: Partial<CompanyLocations> | null;
};
```

### 3. Wanted Listing Material Requirement Status

#### 3.1 Added Utility Function
**File**: `src/utils/common.ts`

Created `getMaterialRequirementStatus()` function that calculates the appropriate status based on:
- Current status and state
- Start date (material required from date)
- Rejection reason

**Status Logic:**
- **"Rejected"** - When status/state is 'rejected'
- **"Pending"** - When status/state is 'pending' (awaiting admin approval)
- **"Fulfilled"** - When status is 'sold' or state is 'closed'
- **"More Information Required"** - When rejection reason indicates more info needed
- **"Material Required"** - When available and start date is today or past
- **"Material Required from DD/MM/YYYY"** - When available and start date is in future

#### 3.2 Updated Listing Types
**File**: `src/types/listing.ts`

Added `wantedStatus` field to both listing interfaces:

```typescript
export interface ListingWithDocuments extends Listings {
    documents: ListingDocuments[];
    wantedStatus?: string; // Material requirement status for wanted listings
}

export interface ListingWithDetails extends Listings {
    documents: ListingDocuments[];
    wantedStatus?: string; // Material requirement status for wanted listings
    createdBy: {
        user: User;
        company: Companies;
        location: CompanyLocations;
    };
}
```

#### 3.3 Updated Listing Service Methods
**File**: `src/services/listing.service.ts`

Modified the following methods to include `wantedStatus` for wanted listings:
- `getListings()` - Public listing endpoint
- `getAdminListings()` - Admin listing endpoint  
- `getListingById()` - Single listing endpoint
- `getAdminListingById()` - Admin single listing endpoint

## API Response Changes

### Offers API Response
The `/offers/{id}` endpoint now includes:

```json
{
    "status": "success",
    "message": "get-offer-detail",
    "data": {
        "offer": {
            // ... offer details ...
        },
        "listing": {
            // ... listing details ...
            "bestOffer": 15,
            "bestOfferCurrency": "USD",  // <- New field
            // ... other listing details ...
        },
        // ... other response data ...
    }
}
```

### Wanted Listings API Response
All wanted listing endpoints now include:

```json
{
  "listingType": "wanted",
  "status": "available",
  "wantedStatus": "Material Required from 30/4/2025"
}
```

## Usage

### Frontend Integration
Frontend applications should:
1. For **offers**: Display both `bestOffer` and `bestOfferCurrency` together
2. For **wanted listings**: Use `wantedStatus` instead of `status` for display to users
3. Keep the original `status` field for internal logic/filtering

## Filtering Support

### Wanted Status Filtering
All listing endpoints now support filtering by `wantedStatus` for wanted listings:

**API Usage:**
```
GET /listings?wantedStatus=Material Required
GET /listings?wantedStatus[]=Pending&wantedStatus[]=Material Required
GET /admin/listings?listingType=wanted&wantedStatus=Fulfilled
```

**Supported Filter Values:**
- `"Pending"` - Awaiting admin approval
- `"Rejected"` - Rejected by admin
- `"Fulfilled"` - Sold/closed listings
- `"More Information Required"` - Admin requested more info
- `"Material Required"` - Available and needed now
- `"Material Required from DD/MM/YYYY"` - Available and needed from future date

### Example Usage
```typescript
// For wanted listings display
if (listing.listingType === 'wanted') {
  displayStatus = listing.wantedStatus || listing.status;
} else {
  displayStatus = listing.status;
}

// For offers with best offer
if (listing.bestOffer && listing.bestOfferCurrency) {
  displayBestOffer = `${listing.bestOffer} ${listing.bestOfferCurrency}`;
}

// For filtering wanted listings
const filters = {
  listingType: 'wanted',
  wantedStatus: ['Material Required', 'Pending']
};
```

## Implementation Notes

### Performance Considerations
- **Database-Level Filtering**: All filtering including `wantedStatus` is now applied at database level for optimal performance
- **SQL Condition Mapping**: `wantedStatus` values are mapped to appropriate SQL conditions based on database fields
- **Efficient Queries**: No post-processing filtering needed, all filtering happens in the database query
- **Accurate Count**: `totalCount` reflects database-level filtered results for optimal performance

### Backwards Compatibility
- Original `status` field remains unchanged
- Existing filters (`status`, `state`) continue to work as before
- `wantedStatus` is only added to wanted listings, other listings are unaffected

## Notes

- The `bestOfferCurrency` will be `null` if there are no offers for the listing
- The currency comes from the offer with the highest `total_price` for that listing
- This implementation only affects the `getOfferById` method, as other methods in the offer service don't return best offer information
- The listing service's `getAdminListings` method sets `best_offer` to `NULL`, so no changes were needed there

## Testing

To test the implementation:

1. Make sure there are offers with different currencies for a listing
2. Call `GET /offers/{id}` for an offer belonging to that listing
3. Verify that `bestOfferCurrency` field is present in the response
4. Verify that the currency matches the currency of the offer with the highest total price

## Related Documentation

- [BE - 6.6.2.9 View details for a bid (buyer activity).md](./BE%20-%206.6.2.9%20View%20details%20for%20a%20bid%20(buyer%20activity).md)
- [6.6.2.11_Admin_Offer_Actions.md](./6.6.2.11_Admin_Offer_Actions.md) 