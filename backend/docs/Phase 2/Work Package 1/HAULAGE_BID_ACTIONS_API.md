# Haulage Bid Approval Actions API

## Overview
This API provides functionality for **administrators** to take approval actions on haulier bids through the Admin dashboard details page. The following actions are available:

- **Approve**: Approve the haulage bid and send automated email notification
- **Reject**: Reject the haulage bid with predefined reasons and send automated email notification
- **Request Information**: Request more information with a custom message and send notification
- **Open for Edits**: Open the bid to allow the haulier to make changes and resubmit

## Task Reference
**Phase 2 - 6.4.1.15**: Haulier Bid Approval Actions (Admin functionality)

## Endpoint

### POST `/haulage-offers/{id}/actions`

**Description**: Handle haulage bid approval actions
**Task**: BE - 6.4.1.15. Haulier Bid Approval Actions

#### Request Parameters

- **Path Parameters**:
  - `id` (number, required): The ID of the haulage offer

- **Request Body**:
  ```json
  {
    "action": "approve" | "reject" | "request_information" | "open_for_edits",
    "message": "string (optional, required for request_information)",
    "rejectionReason": "price_too_high | unsuitable_equipment | insufficient_transit_time | lack_of_coverage | poor_rating | incomplete_documentation | other (optional, for reject action)",
    "customRejectionReason": "string (optional, for reject action when rejectionReason is 'other')"
  }
  ```

#### Response

**Success Response (200)**:
```json
{
  "status": "success",
  "message": "Haulage bid approve completed successfully",
  "data": {
    "id": 123,
    "status": "approved",
    // ... other haulage offer fields
  }
}
```

**Error Responses**:
- `404 Not Found`: Haulage offer not found
- `403 Forbidden`: Only administrators can perform actions on haulage bids
- `400 Bad Request`: Invalid action or invalid haulage offer status

## Actions Details

### 1. Approve Bid
- **Status Change**: `pending` → `approved`
- **Email Sent**: Automated approval email to haulier
- **Notification**: In-app notification to haulier AND seller

### 2. Reject Bid
- **Status Change**: `pending` → `rejected`
- **Rejection Reasons**:
  - `incomplete_documentation`: Incomplete documentation
  - `invalid_company_registration`: Invalid company registration
  - `duplicate_account`: Duplicate account
  - `unverified_contact_info`: Unverified contact information
  - `other`: Other reason (requires `customRejectionReason`)
- **Email Sent**: Automated rejection email with reason
- **Notification**: In-app notification to haulier

### 3. Request More Information
- **Status Change**: `pending` → `information_requested`
- **Required Field**: `message` (custom message to haulier)
- **Email Sent**: Automated email with the custom message
- **Notification**: In-app notification to haulier

### 4. Open Bid for Edits
- **Status Change**: `pending` → `open_for_edits`
- **Email Sent**: Automated email informing haulier they can edit their bid
- **Notification**: In-app notification to haulier

## Valid Status Transitions

The following actions can only be performed on haulage offers with these statuses:

| Current Status | Available Actions |
|----------------|------------------|
| `pending` | approve, reject, request_information, open_for_edits |
| `information_requested` | approve, reject, request_information, open_for_edits |
| `open_for_edits` | approve, reject, request_information, open_for_edits |

## Email Templates

All actions trigger automated emails to the haulier using the following templates:

1. **Haulage Bid Approved**: `getHaulageBidApprovedEmailTemplate`
2. **Haulage Bid Rejected**: `getHaulageBidRejectedEmailTemplate`
3. **Request Information**: `getHaulageBidRequestInformationEmailTemplate`
4. **Open for Edits**: `getHaulageBidOpenForEditsEmailTemplate`

## Database Schema Updates

### New Enums

```typescript
export enum HaulageBidAction {
    APPROVE = 'approve',
    REJECT = 'reject',
    REQUEST_INFORMATION = 'request_information',
    OPEN_FOR_EDITS = 'open_for_edits',
}

export enum HaulageBidRejectionReason {
    PRICE_TOO_HIGH = 'price_too_high',
    UNSUITABLE_EQUIPMENT = 'unsuitable_equipment',
    INSUFFICIENT_TRANSIT_TIME = 'insufficient_transit_time',
    LACK_OF_COVERAGE = 'lack_of_coverage',
    POOR_RATING = 'poor_rating',
    INCOMPLETE_DOCUMENTATION = 'incomplete_documentation',
    OTHER = 'other',
}
```

### Extended HaulageOfferStatus

```typescript
export enum HaulageOfferStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    WITHDRAWN = 'withdrawn',
    INFORMATION_REQUESTED = 'information_requested',
    OPEN_FOR_EDITS = 'open_for_edits',
}
```

## Usage Examples

### Approve a Haulage Bid
```bash
curl -X PATCH "https://api.wastetrade.com/haulage-offers/123/actions" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve"
  }'
```

### Reject a Haulage Bid
```bash
curl -X PATCH "https://api.wastetrade.com/haulage-offers/123/actions" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reject",
    "rejectionReason": "price_too_high"
  }'
```

### Request More Information
```bash
curl -X PATCH "https://api.wastetrade.com/haulage-offers/123/actions" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "request_information",
    "message": "Can you provide more details about your insurance coverage?"
  }'
```

### Open Bid for Edits
```bash
curl -X PATCH "https://api.wastetrade.com/haulage-offers/123/actions" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "open_for_edits"
  }'
```

## Security & Permissions

- Only administrators (ADMIN or SUPER_ADMIN roles) can perform actions on haulage bids
- All actions require JWT authentication with admin privileges
- Actions are logged for audit purposes
- Email notifications are sent to verified haulier email addresses
- Sellers receive notifications when bids are approved

## Integration Notes

- This API integrates with the existing email service for notifications
- Uses the existing notification system for in-app alerts
- Compatible with the current haulage offer workflow
- Maintains data consistency with existing status management

## Future Enhancements

- Audit trail logging for all bid actions
- Bulk action support for multiple haulage bids
- Integration with external logistics systems
- Advanced filtering and search for bid management