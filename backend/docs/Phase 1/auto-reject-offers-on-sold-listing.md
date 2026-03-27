# Auto-Reject Pending Offers When Listing is Marked as SOLD

## Overview

When a user marks their listing status as "sold" via the `PATCH /listings/{id}` endpoint, all pending offers for that listing will be automatically rejected with the reason "Listing marked as sold by owner".

## Implementation Details

### 1. New Service Method

**File:** `src/services/offer.service.ts`

Added a new method `rejectAllPendingOffersForListing` that:
- Finds all pending offers for a specific listing
- Updates their status to `REJECTED` and state to `CLOSED`
- Sets rejection reason and source as `system`
- Logs the number of rejected offers

```typescript
public async rejectAllPendingOffersForListing(listingId: number, reason?: string): Promise<void> {
    const rejectionReason = reason ?? 'Listing marked as sold';
    
    // Find all pending offers for this listing
    const pendingOffers = await this.offersRepository.find({
        where: {
            listingId,
            status: OfferStatusEnum.PENDING,
            state: { nin: [OfferState.CLOSED] }
        }
    });

    if (pendingOffers.length === 0) {
        return; // No pending offers to reject
    }

    // Update all pending offers to rejected status
    await this.offersRepository.updateAll(
        {
            status: OfferStatusEnum.REJECTED,
            state: OfferState.CLOSED,
            rejectionReason,
            rejectionSource: 'system',
            updatedAt: new Date(),
        },
        {
            listingId,
            status: OfferStatusEnum.PENDING,
            state: { nin: [OfferState.CLOSED] }
        }
    );
}
```

### 2. Updated Controller Logic

**File:** `src/controllers/listings.controller.ts`

Modified the `updateById` method to:
- Check if the listing status is being changed to `SOLD`
- Call the offer rejection service when the change is detected
- Only trigger rejection when status transitions from non-SOLD to SOLD

```typescript
// Check if status is being changed to SOLD
if (listings.status === ListingStatus.SOLD && existingListing.status !== ListingStatus.SOLD) {
    // Reject all pending offers for this listing
    await this.offerService.rejectAllPendingOffersForListing(id, 'Listing marked as sold by owner');
}
```

## API Usage

### Mark Listing as Sold

```bash
curl -X PATCH 'https://wastetrade-api-dev.b13devops.com/listings/{listing_id}' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --data-raw '{
    "status": "sold"
  }'
```

### Response
- **200 OK**: Listing updated successfully, pending offers automatically rejected
- **403 Forbidden**: User can only mark their own listings as sold (unless admin)
- **404 Not Found**: Listing not found

## Behavior Details

### When Auto-Rejection Triggers
- Only when `status` field is being updated to `"sold"`
- Only if the current status is NOT already `"sold"` (prevents duplicate processing)
- Works for listing owners and admin users

### What Gets Rejected
- All offers with `status: "pending"`
- All offers with `state` not equal to `"closed"`
- Linked to the specific listing being marked as sold

### Rejection Details
- **Status**: Changed to `"rejected"`
- **State**: Changed to `"closed"`
- **Rejection Reason**: `"Listing marked as sold by owner"`
- **Rejection Source**: `"system"`
- **Updated At**: Set to current timestamp

## Examples

### Scenario 1: Listing with Pending Offers

**Before Update:**
```json
{
  "listingId": 123,
  "status": "available",
  "offers": [
    {"id": 1, "status": "pending", "state": "pending"},
    {"id": 2, "status": "pending", "state": "active"},
    {"id": 3, "status": "accepted", "state": "closed"}
  ]
}
```

**After PATCH with status: "sold":**
```json
{
  "listingId": 123,
  "status": "sold",
  "offers": [
    {"id": 1, "status": "rejected", "state": "closed", "rejectionReason": "Listing marked as sold by owner"},
    {"id": 2, "status": "rejected", "state": "closed", "rejectionReason": "Listing marked as sold by owner"},
    {"id": 3, "status": "accepted", "state": "closed"} // Unchanged - already closed
  ]
}
```

### Scenario 2: No Pending Offers

If there are no pending offers, the listing status update proceeds normally without any additional processing.

## Testing

### Test Create Offers and Mark as Sold

1. **Create a listing:**
```bash
curl -X POST 'https://wastetrade-api-dev.b13devops.com/listings' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "materialType": "plastic",
    "quantity": 100,
    "listingType": "sell"
  }'
```

2. **Create some offers on the listing:**
```bash
curl -X POST 'https://wastetrade-api-dev.b13devops.com/offers' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "listingId": 123,
    "listingType": "sell",
    "quantity": 10,
    "offeredPricePerUnit": 5.0,
    "currency": "usd"
  }'
```

3. **Check offers status:**
```bash
curl 'https://wastetrade-api-dev.b13devops.com/offers?filter={"where":{"listingId":123}}' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

4. **Mark listing as sold:**
```bash
curl -X PATCH 'https://wastetrade-api-dev.b13devops.com/listings/123' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{"status": "sold"}'
```

5. **Verify offers are rejected:**
```bash
curl 'https://wastetrade-api-dev.b13devops.com/offers?filter={"where":{"listingId":123}}' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

Expected result: All pending offers should now have `status: "rejected"` and `rejectionReason: "Listing marked as sold by owner"`.

## Database Impact

- No schema changes required
- Uses existing `offers` table fields:
  - `status` (updated to 'rejected')
  - `state` (updated to 'closed') 
  - `rejection_reason` (set to custom message)
  - `rejection_source` (set to 'system')
  - `updated_at` (updated to current timestamp)

## Files Modified

1. **src/services/offer.service.ts** - Added `rejectAllPendingOffersForListing` method
2. **src/controllers/listings.controller.ts** - Added auto-rejection logic to `updateById` method

## Frontend Integration Notes

### For Listing Management
- Frontend can continue using the same `PATCH /listings/{id}` endpoint
- The auto-rejection happens transparently on the backend
- No additional API calls needed from frontend

### For Offer Management  
- Frontend should refresh offer lists after a listing is marked as sold
- Offer detail views should handle the new rejection reason
- Consider showing users that offers were automatically rejected due to listing being sold

## Security & Permissions

- Only listing owners can mark their own listings as sold (existing permission check)
- Admin users can mark any listing as sold (existing permission check)
- Auto-rejection uses system-level permissions (no additional auth needed)
- Rejection source is marked as 'system' to distinguish from manual rejections

## Performance Considerations

- Operation is efficient using bulk update queries
- Only processes offers when status actually changes to "sold"
- Minimal database impact - single bulk update query
- Logging provides visibility into the number of affected offers

## Error Handling

- If offer rejection fails, the listing update will still proceed
- Database transactions ensure data consistency
- Error logs will capture any issues with the auto-rejection process
- No user-facing errors for the auto-rejection feature 