# Bid and Listing Workflow Specification

This document outlines the complete workflow for bid and listing management in the WasteTrade platform, including state transitions, visibility rules, and current implementation issues.

## 🎯 Exact Requirements (Vietnamese Requirements Mapped)

### Phase 1: Bid Creation by Buyer
**When bid is made by Buyer:**
```
Initial State: Bid Pending -> New bid (Listing Available) -> YES
- Offer: state = PENDING, status = PENDING
- Listing: status = AVAILABLE (unchanged)
- Visibility: Bid NOT visible to seller
```

### Phase 2: Admin Actions on Pending Bids
#### Admin REJECTS Bid:
```
Result: state = CLOSED, listing status = AVAILABLE, offer status = REJECTED
- Visibility: Bid NOT visible on listing (hidden from both seller and buyer)
```

#### Admin APPROVES Bid:
```
Result: state = ACTIVE, listing status = AVAILABLE, offer status = APPROVED
- Visibility: Bid visible on listing (seller can now see and act)
```

### Phase 3: Seller Actions on Approved Bids
**All bids visible to seller have:** `state = ACTIVE, status = APPROVED`

#### Seller ACCEPTS Bid:
```
Result: state = CLOSED, listing status = AVAILABLE, offer status = ACCEPTED
- Visibility: Bid visible on listing (both seller and buyer can see)
```

#### Seller REJECTS Bid:
```
Result: state = CLOSED, listing status = AVAILABLE, offer status = REJECTED
- Visibility: Bid visible on listing (both seller and buyer can see)
```

### 🔍 Critical Visibility Rules
**Admin Reject vs Seller Reject - SAME STATE BUT DIFFERENT VISIBILITY:**
```
Admin Reject: state = CLOSED, status = REJECTED -> NOT visible on listing
Seller Reject: state = CLOSED, status = REJECTED -> VISIBLE on listing
```

**Listing Removal Rules:** Remove listing ONLY allowed when NO bids with `state = ACTIVE`

## Overview

The WasteTrade platform manages two main entities:
- **Listings**: Waste materials offered for sale or wanted for purchase
- **Offers/Bids**: Proposals made by buyers/sellers on listings

## Current Enum Definitions

### Offer Status Enum (Current)
```typescript
export enum OfferStatusEnum {
    ACCEPTED = 'accepted',
    SHIPPED = 'shipped',
    REJECTED = 'rejected',
    PENDING = 'pending',
}
```

### Offer State Enum (Current)
```typescript
export enum OfferState {
    ACTIVE = 'active',
    APPROVED = 'approved',    // Issue: Not needed
    PENDING = 'pending',
    REJECTED = 'rejected',
    CLOSED = 'closed',
}
```

### Listing Status Enum (Current)
```typescript
export enum ListingStatus {
    AVAILABLE = 'available',
    PENDING = 'pending',
    SOLD = 'sold',
    REJECTED = 'rejected',
    // FULFILLED = 'fulfilled',  // Missing: For satisfied wanted listings
}
```

### Listing State Enum (Current)
```typescript
export enum ListingState {
    APPROVED = 'approved',
    PENDING = 'pending',
    REJECTED = 'rejected',
}
```

### Company User Status Enum (Current)
```typescript
export enum CompanyUserStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    REJECTED = 'rejected',
    REQUEST_INFORMATION = 'request_information',
}
```

## Workflow Specifications

### 1. Bid Creation and Admin Review

#### When a Bid is Made by Buyer:
- **Initial State**: `state = PENDING`, `status = PENDING`
- **Listing**: Remains `status = AVAILABLE`
- **Visibility**: Bid is NOT visible to seller until admin approval

#### Admin Actions on Pending Bids:

**Admin APPROVES Bid:**
- **Offer**: `state = ACTIVE`, `status = APPROVED` (NEW STATUS)
- **Listing**: `status = AVAILABLE` (unchanged)
- **Visibility**: Bid becomes visible to seller
- **UI**: Seller can now see and act on the bid

**Admin REJECTS Bid:**
- **Offer**: `state = CLOSED`, `status = REJECTED`
- **Listing**: `status = AVAILABLE` (unchanged)
- **Visibility**: Bid is NOT visible on listing (hidden from both seller and buyer views)

### 2. Seller Actions on Approved Bids

After admin approval, all bids visible to seller have:
- **State**: `ACTIVE`
- **Status**: `APPROVED`
- **Listing Status**: `AVAILABLE`

#### Seller ACCEPTS Bid:
- **Offer**: `state = CLOSED`, `status = ACCEPTED`
- **Listing**: `status = AVAILABLE` (unchanged)
- **Visibility**: Bid remains visible on listing for both seller and buyer

#### Seller REJECTS Bid:
- **Offer**: `state = CLOSED`, `status = REJECTED`
- **Listing**: `status = AVAILABLE` (unchanged)
- **Visibility**: Bid remains visible on listing for both seller and buyer

### 3. Listing Management

#### New Listing Creation:
- **Initial State**: `state = PENDING`, `status = PENDING`
- **Visibility**: Only visible to owner, NOT visible to other users

#### Admin Actions on Listings:

**Admin APPROVES Listing:**
- **Listing**: `state = APPROVED`, `status = AVAILABLE`
- **Visibility**: Becomes visible to all users

**Admin REJECTS Listing:**
- **Listing**: `state = REJECTED`, `status = REJECTED`
- **Visibility**: Only visible to owner

### 4. Listing Removal Rules

**Listing can only be removed when:**
- No bids exist with `state = ACTIVE`
- This prevents removal of listings with pending seller decisions

## 📋 Current Implementation Issues (From Feedback)

### Issue 1: OfferState Cleanup
**Problem:** `OfferState.APPROVED` and `OfferState.REJECTED` are unnecessary
**Solution:** Remove these from OfferState enum, use OfferStatus instead

### Issue 2: Missing APPROVED Status
**Problem:** `OfferStatus` missing `APPROVED` when admin approves bid
**Solution:** Add `APPROVED = 'approved'` to OfferStatusEnum

### Issue 3: Listing Visibility (Pending)
**Problem:** Sell listing with `state = PENDING, status = PENDING` visible to all users
**Solution:** Only owner can see pending listings, others see after admin approval
**Code Location:** `src/services/listing.service.ts` Lines 283-286

### Issue 4: Bid Visibility (Pending/Rejected)
**Problem:** Seller can see pending/rejected bids
**Solution:** Seller only sees bids after admin approval (`state = ACTIVE, status = APPROVED`)

### Issue 5: Wrong Admin Approval Status
**Problem:** Admin approval sets `status = ACCEPTED` instead of `APPROVED`
**Current Code:** Line 854 `status: OfferStatusEnum.ACCEPTED` ❌
**Solution:** Admin approval should set `status = APPROVED`
**Code Location:** `src/services/offer.service.ts` Line 854

### ✅ State/Status Assignment Verification
**Good News:** After code review, state and status are correctly assigned to their respective properties:
- `state: OfferState.ACTIVE` ✅ Correct assignment
- `status: OfferStatusEnum.ACCEPTED` ❌ Wrong value (should be APPROVED)
- No evidence of "state save to status, status save to state" swapping issue

### Issue 6: Incorrect Status Flow
**Problem:** Status goes `PENDING -> ACCEPTED/REJECTED` (skips APPROVED)
**Solution:** Must be `PENDING -> APPROVED -> ACCEPTED/REJECTED`
**Code Location:** `src/services/offer.service.ts` Line 720

### Issue 7: UI Cannot Accept Approved Bids
**Problem:** Bid approved by admin shows `status = ACCEPTED`, seller cannot accept
**Solution:** Admin approval should set `status = APPROVED`, then seller can accept

## Proposed Enum Changes

### Updated Offer Status Enum
```typescript
export enum OfferStatusEnum {
    PENDING = 'pending',      // Initial state when bid is made
    APPROVED = 'approved',    // NEW: Admin approved, visible to seller
    ACCEPTED = 'accepted',    // Seller accepted the approved bid
    REJECTED = 'rejected',    // Admin or seller rejected
    SHIPPED = 'shipped',      // Existing status for completed transactions
}
```

### Updated Offer State Enum
```typescript
export enum OfferState {
    PENDING = 'pending',     // Waiting for admin review
    ACTIVE = 'active',       // Admin approved, seller can act
    CLOSED = 'closed',       // Final state (accepted/rejected)
    // REMOVED: APPROVED (redundant with status)
}
```

### Updated Listing Status Enum
```typescript
export enum ListingStatus {
    PENDING = 'pending',      // Waiting for admin approval
    AVAILABLE = 'available',  // Admin approved, accepting offers
    SOLD = 'sold',           // Sell listing - all quantity sold
    FULFILLED = 'fulfilled',  // NEW: Wanted listing - requirement satisfied
    REJECTED = 'rejected',    // Admin rejected
}
```

## Implementation References

### Current Code Locations
- **Offer Enums**: `src/enum/offer.enum.ts`
- **Listing Enums**: `src/enum/listing.enum.ts`
- **Offer Model**: `src/models/offers.model.ts`
- **Listing Model**: `src/models/listings.model.ts`
- **Offer Service**: `src/services/offer.service.ts`
- **Listing Service**: `src/services/listing.service.ts`
- **Offer Controller**: `src/controllers/offers.controller.ts`
- **Listing Controller**: `src/controllers/listings.controller.ts`

### Key Methods to Update
- `OfferService.handleAdminRequestAction()` - Lines 854-904 ❌ Sets wrong status (ACCEPTED vs APPROVED)
- `OfferService.createOffer()` - Lines 637-706
- `OfferService.handleRequestAction()` - Lines 709-775 ❌ Checks wrong status (PENDING vs APPROVED)
- `ListingService.handleAdminRequestAction()` - Lines 753-806
- `ListingService.getListings()` - Lines 283-286 ❌ Shows PENDING listings to all users

### Database Schema Impact
- **offers.status** column: Add 'approved' to enum constraint
- **offers.state** column: Remove 'approved' from enum constraint
- **listings.status** column: Add 'fulfilled' to enum constraint
- Migration required for existing data

## Visibility Rules Summary

| Entity | State | Status | Visible to Owner | Visible to Others | Visible to Seller |
|--------|-------|--------|------------------|-------------------|-------------------|
| Listing | PENDING | PENDING | ✅ | ❌ | N/A |
| Listing | APPROVED | AVAILABLE | ✅ | ✅ | N/A |
| Listing | REJECTED | REJECTED | ✅ | ❌ | N/A |
| Offer | PENDING | PENDING | ✅ | ❌ | ❌ |
| Offer | ACTIVE | APPROVED | ✅ | ✅ | ✅ |
| Offer | CLOSED | ACCEPTED | ✅ | ✅ | ✅ |
| Offer | CLOSED | REJECTED (Admin) | ✅ | ❌ | ❌ |
| Offer | CLOSED | REJECTED (Seller) | ✅ | ✅ | ✅ |

## Next Steps

1. **Update Enums**: Modify offer status/state and listing status enums
2. **Database Migration**: Update enum constraints and existing data
3. **Service Layer**: Update business logic for new status flow and FULFILLED workflow
4. **API Layer**: Update controllers and validation
5. **Testing**: Verify all workflows and visibility rules
6. **Documentation**: Update API documentation

## 🎯 State/Status Transition Table

| Action | From State | From Status | To State | To Status | Visibility |
|--------|------------|-------------|----------|-----------|------------|
| **Buyer creates bid** | - | - | PENDING | PENDING | Owner only |
| **Admin approves bid** | PENDING | PENDING | ACTIVE | APPROVED | Seller can see |
| **Admin rejects bid** | PENDING | PENDING | CLOSED | REJECTED | Hidden from listing |
| **Seller accepts bid** | ACTIVE | APPROVED | CLOSED | ACCEPTED | Visible on listing |
| **Seller rejects bid** | ACTIVE | APPROVED | CLOSED | REJECTED | Only visible to owner (buyer) and admins |

## 🚨 Critical Implementation Notes

### 1. Track Rejection Source
Need to distinguish between admin rejection vs seller rejection for visibility rules:
- **Current**: Uses `rejectedByUserId` field
- **Issue**: Cannot determine if rejector was admin or seller without additional query
- **Solution**: Add `rejectionSource: 'admin' | 'seller'` enum field

### 2. Visibility Logic Requirements
```typescript
// Listing Visibility: Only show to non-owners if APPROVED + AVAILABLE
if (listing.state === ListingState.APPROVED && listing.status === ListingStatus.AVAILABLE) {
    // Show to all users
} else if (listing.createdByUserId === currentUserId) {
    // Show to owner only
}

// Offer Visibility: Implemented in OfferService.getOffers()
if (isSeller) {
    // Seller only sees bids after admin approval (state = ACTIVE, status = APPROVED)
    // OR their own rejected bids (rejectionSource = 'seller')
    // OR accepted bids (status = ACCEPTED)
    conditions.push(`(
        (o.state = 'active' AND o.status = 'approved') OR
        (o.state = 'closed' AND o.status = 'accepted') OR
        (o.state = 'closed' AND o.status = 'rejected' AND o.rejection_source = 'seller')
    )`);
} else {
    // Buyer sees all their own bids (they created them)
    // No additional filtering needed for buyers viewing their own bids
}
``` 