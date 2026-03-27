# Haulage Management Admin API Documentation

## Overview
This documentation covers the comprehensive backend API endpoints for the Waste Trading Platform's haulage management system. These endpoints provide administrators with full control over haulage bids, including approval workflows, shipment tracking, and status management.

**Features Implemented:**
- ✅ Haulage bid management with pagination and filtering
- ✅ Multi-step approval workflow with email notifications
- ✅ Partial and complete shipment tracking
- ✅ Dynamic status management with "Load X of X Shipped" formatting
- ✅ Comprehensive audit trail and error handling

## Authentication
All endpoints require JWT authentication with admin-level privileges. Users must have `SUPER_ADMIN` or `ADMIN` global roles.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## Base URL
```
Production: https://api.wastetrade.com
Development: https://wastetrade-api-dev.b13devops.com
Local Development: https://wastetrade-api-dev.b13devops.com
```

---

## 1. Haulage Bids Table View

### Endpoint: `GET /admin/haulage-bids`
**Task Reference:** 869abxxt1 - 6.4.1.12 View Haulage Bids

**Description:** Retrieves paginated haulage bids for admin dashboard table view with comprehensive filtering and search capabilities.

**Query Parameters:**
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| filter | string | No | JSON-encoded filter object with skip/limit (supports FE format) | `{"skip":20,"limit":20}` |
| skip | number | No | Number of records to skip (default: 0) | 0 |
| limit | number | No | Number of records to return (default: 20, max: 100) | 20 |
| status | string | No | Filter by haulage bid status | 'pending', 'approved', 'rejected' |
| textSearch | string | No | Search across material, company names | 'plastic' |
| haulierCompany | string | No | Filter by haulier company name | 'Fast Transport Ltd' |
| buyerCompany | string | No | Filter by buyer company name | 'Recycling Corp' |
| sellerCompany | string | No | Filter by seller company name | 'Manufacturing Inc' |
| dateFrom | string | No | Filter bids from date (ISO format) | '2024-01-01' |
| dateTo | string | No | Filter bids to date (ISO format) | '2024-12-31' |

> **Note:** Pagination supports both `filter={"skip":20,"limit":20}` format (FE standard) and individual `skip/limit` query params. Filter values take precedence.

**Response Example:**
```json
{
  "status": "success",
  "message": "Haulage bids retrieved successfully",
  "data": {
    "results": [
      {
        "haulageOfferId": 12345,
        "bidDate": "2024-01-15T10:30:00Z",
        "status": "pending",
        "formattedStatus": "Pending",
        "statusColor": "warning",
        "numberOfLoads": 3,
        "quantityPerLoad": 25.5,
        "haulageTotal": 1250.00,
        "currency": "GBP",
        "expectedTransitTime": "2-3",
        "transportProvider": "third_party",
        "haulier": {
          "id": 789,
          "username": "12345678",
          "companyId": 111,
          "companyName": "Fast Transport Ltd",
          "firstName": "John",
          "lastName": "Doe"
        },
        "buyer": {
          "id": 456,
          "username": "23456789",
          "companyId": 222,
          "companyName": "Recycling Corp",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "seller": {
          "id": 123,
          "username": "34567890",
          "companyId": 333,
          "companyName": "Manufacturing Inc",
          "firstName": "Bob",
          "lastName": "Wilson"
        },
        "listing": {
          "id": 999,
          "materialItem": "PET Plastic Bottles",
          "materialType": "Plastic",
          "materialPacking": "Bales",
          "incoterms": "EXW",
          "pickupLocation": "London, UK",
          "destinationLocation": "Paris, France"
        },
        "offer": {
          "quantity": 76.5,
          "pricePerMetricTonne": 450.00,
          "currency": "GBP",
          "earliestDeliveryDate": "2024-02-01",
          "latestDeliveryDate": "2024-02-15"
        }
      }
    ],
    "totalCount": 150
  }
}
```

**Table Columns Required (Frontend Implementation):**
- **Bid Date**: Formatted date/time
- **Buyer**: Company name (clickable for details), `buyer.username` for User ID display
- **Seller**: Company name (clickable for details), `seller.username` for User ID display
- **Haulier**: Company name + contact, `haulier.username` for User ID display
- **Material**: Material name (clickable for listing details)
- **Number of Loads**: Numeric value
- **Quantity per Load**: Weight in MT
- **Haulage Total**: Cost with currency
- **Status**: Formatted status with color coding
- **Actions**: "View Detail" button (opens details page)

**Financial Calculations (per spec 6.4.1.12):**
- **Bid Total (GBP)**: `buyer offer/MT × total weight`. Apply 2% markup if non-GBP currency.
- **Haulage Total**: Apply 2% markup if haulage currency ≠ GBP.
- **Seller Offer**: `Final seller total = Bid total - Haulage total + PERN fee (if eligible)`
- **PERN Fee**: £5/MT when origin = UK, destination ≠ UK, and material = plastic

---

## 2. Haulage Bid Details View

### Endpoint: `GET /admin/haulage-bids/{id}`
**Task Reference:** 869abxxt4 - 6.4.1.14 View Haulage Bid Details

**Description:** Retrieves comprehensive details for a specific haulage bid, including all parties, financial calculations, and shipment information.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Haulage offer ID |

**Response Example:**
```json
{
  "status": "success",
  "message": "Haulage bid details retrieved successfully",
  "data": {
    "haulageOfferId": 12345,
    "bidDate": "2024-01-15T10:30:00Z",
    "status": "approved",
    "formattedStatus": "Approved",
    "statusColor": "success",
    "summary": {
      "numberOfLoads": 3,
      "currency": "GBP",
      "haulageBidAmount": 416.67,
      "quantityPerLoad": 25.5,
      "haulageTotal": 1250.00,
      "status": "approved"
    },
    "seller": {
      "id": 123,
      "username": "34567890",
      "companyId": 333,
      "firstName": "Bob",
      "lastName": "Wilson",
      "companyName": "Manufacturing Inc",
      "email": "bob@manufacturing.com",
      "pricePerMetricTonne": 438.52,
      "totalPrice": 33557.50,
      "pickupLocation": "123 Industrial Park, London, UK"
    },
    "buyer": {
      "id": 456,
      "username": "23456789",
      "companyId": 222,
      "firstName": "Jane",
      "lastName": "Smith",
      "companyName": "Recycling Corp",
      "email": "jane@recycling.com",
      "pricePerMetricTonne": 450.00,
      "bidAmount": 34425.00,
      "destination": "456 Business Ave, Paris, France",
      "deliveryWindow": {
        "earliest": "2024-02-01",
        "latest": "2024-02-15"
      }
    },
    "haulier": {
      "id": 789,
      "username": "12345678",
      "companyId": 111,
      "firstName": "John",
      "lastName": "Doe",
      "companyName": "Fast Transport Ltd",
      "email": "john@fasttransport.com",
      "trailerContainerType": "40ft Container",
      "numberOfLoads": 3,
      "quantityPerLoad": 25.5,
      "haulageCostPerLoad": 416.67,
      "haulageTotal": 1250.00,
      "transportProvider": "third_party",
      "suggestedCollectionDate": "2024-02-01",
      "expectedTransitTime": "2-3",
      "demurrageAtDestination": 21,
      "notes": "Standard delivery requirements"
    },
    "material": {
      "name": "PET Plastic Bottles",
      "type": "Plastic",
      "form": "Bottles",
      "grading": "Grade A",
      "color": "Clear",
      "finishing": "Cleaned",
      "packing": "Bales",
      "incoterms": "EXW",
      "loadsRemaining": 3,
      "avgWeightPerLoad": 25.5
    },
    "financial": {
      "totalWeight": 76.5,
      "bidTotal": 34425.00,
      "currency": "GBP",
      "isPERNEligible": true,
      "pernFee": 382.50,
      "finalSellerTotal": 33557.50,
      "buyerOffer": {
        "bidValuePerMT": 450.00,
        "currency": "GBP"
      },
      "sellerOffer": {
        "offerPerMT": 438.52,
        "total": 33557.50
      }
    },
    "loadDetails": {
      "totalLoads": 3,
      "shippedLoads": 0,
      "shippedDate": null
    }
  }
}
```

**Detail Page Sections Required (Frontend Implementation):**
- **Summary Banner**: Total, status, key metrics
- **Seller Information**: Contact, location, material details
- **Buyer Information**: Contact, destination, delivery window
- **Haulier Information**: Contact, transport details, costs
- **Material Information**: Complete material specifications
- **Financial Information**: All calculations and breakdowns
- **Load Details**: For accepted bids (shipment tracking)
- **Action Buttons**: Approve/Reject/Request Info/Mark Shipped

**PERN Fee Calculation:**
- Applied when: Material origin = UK AND destination ≠ UK AND material = Packaging
- Formula: £5 per MT × total weight
- Included in final seller total calculation

---

## 2.1. Get Haulage Loads

### Endpoint: `GET /haulage-offers/{id}/loads`
**Task Reference:** 869abxxt4 - 6.4.1.14 View Haulage Bid Details (Load Details Table)

**Description:** Retrieves all loads for a specific haulage offer. Used to populate the Load Details table in the bid detail view.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Haulage offer ID |

**Response Example:**
```json
{
  "status": "success",
  "message": "Found 3 loads",
  "data": [
    {
      "id": 1,
      "loadNumber": "1 of 3",
      "collectionDate": "2024-02-01",
      "shippedDate": null,
      "grossWeight": "200MT",
      "palletWeight": "200MT",
      "loadStatus": "Awaiting Collection",
      "haulageOfferId": 12345,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "loadNumber": "2 of 3",
      "collectionDate": "2024-02-05",
      "shippedDate": "2024-02-06T14:30:00Z",
      "grossWeight": "200MT",
      "palletWeight": "200MT",
      "loadStatus": "Shipped",
      "haulageOfferId": 12345,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-02-06T14:30:00Z"
    }
  ]
}
```

**Load Details Table Columns:**
| Column | Field | Description |
|--------|-------|-------------|
| Load Number | `loadNumber` | Format: "X of Y" |
| Collection Date | `collectionDate` | Date format: dd/MM/yyyy |
| Shipped Date | `shippedDate` | Date format: dd/MM/yyyy (null if not shipped) |
| Gross Weight | `grossWeight` | Weight with unit |
| Pallet Weight | `palletWeight` | Weight with unit |
| Action | - | "Mark as Shipped" button (if `shippedDate` is null) or "Shipped" badge |

**Frontend Integration:**
```typescript
// Service method
getLoads(haulageOfferId: number | string) {
  return this.httpClient
    .get<GetHaulageLoadsResponse>(`/haulage-offers/${haulageOfferId}/loads`)
    .pipe(map((res) => res.data));
}

// Component usage
loads = signal<HaulageLoad[]>([]);

loadLoads() {
  this.haulageService.getLoads(this.bidId).subscribe((data) => {
    this.loads.set(data);
  });
}
```

**cURL Example:**
```bash
curl -X GET "https://api.wastetrade.com/haulage-offers/12345/loads" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 3. Haulage Bid Approval Actions

### Endpoint: `PATCH /haulage-offers/{id}/actions`
**Task Reference:** 869abxxt7 - 6.4.1.15 Haulier Bid Approval Actions

**Description:** Performs admin actions on haulage bids (approve, reject, request information, open for edits).

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Haulage offer ID |

**Request Body:**
```json
{
  "action": "approve | reject | request_information",
  "rejectionReason": "incomplete_documentation | invalid_company_registration | duplicate_account | unverified_contact_info | other",
  "customRejectionReason": "Custom rejection message (optional)",
  "message": "Message for information request (required for request_information action)",
  "sendEmail": true
}
```

**Request Body Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| action | string | Yes | Action to perform: `approve`, `reject`, `request_information` |
| rejectionReason | string | No | Required when action is `reject` or `request_information`. One of: `incomplete_documentation`, `invalid_company_registration`, `duplicate_account`, `unverified_contact_info`, `other`. **Saved to database.** |
| customRejectionReason | string | No | Required when rejectionReason is `other`. **Saved to database.** |
| message | string | No | Required when action is `request_information` |
| sendEmail | boolean | No | Whether to send email notification (default: true) |

**Action Types & Workflows:**

#### Approve Action
- **Process**: Sets status to "approved", sends email notifications to both haulier and seller
- **Email Templates**:
  - Haulier: "Your haulage bid for [Material] has been approved. Please prepare for collection."
  - Seller: "A haulage bid for your [Material] listing has been approved. The haulier will prepare for collection."
- **UI Requirements**: Simple confirmation modal with "Approve" button

#### Reject Action
- **Process**: Sets status to "rejected", sends email to haulier with rejection reason
- **Rejection Reasons**:
  - `incomplete_documentation`: Missing required documentation
  - `invalid_company_registration`: Company registration issues
  - `duplicate_account`: Duplicate company/user account
  - `unverified_contact_info`: Contact information not verified
  - `other`: Other reason (requires customRejectionReason)
- **UI Requirements**: Modal with reason dropdown and custom reason textarea

#### Request Information
- **Process**: Sets status to "information_requested", sends email with admin message
- **Templates**: Predefined request types + custom message support
- **UI Requirements**: Modal with message textarea and predefined request types

**Response Example:**
```json
{
  "status": "success",
  "message": "Haulage bid approve completed successfully",
  "data": {
    "id": 12345,
    "status": "approved",
    // ... full haulage offer object
  }
}
```

---

## 4. Mark as Shipped (Shipment Tracking)

### Endpoint: `PATCH /haulage-offers/{id}/mark-shipped`
**Task Reference:** 869abxxt9 - 6.4.1.17 Mark Listing as Shipped

**Description:** Marks haulage offer loads as shipped. Supports partial and complete shipment tracking with "Load X of X" progression.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Haulage offer ID |

**Request Body:**
```json
{
  "loadsToMark": 2
}
```

**Business Rules & Validation:**
- ✅ Haulage offer must be in `accepted` status
- ✅ LoadsToMark cannot exceed remaining unshipped loads
- ✅ Admin authentication required
- ✅ Confirmation modal required: "Are you sure this load has been shipped and all relevant documentation is in order? This cannot be undone."

**Status Progression Logic:**
1. `accepted` → `partially_shipped` (when some loads shipped)
2. `partially_shipped` → `shipped` (when all loads shipped)
3. `accepted` → `shipped` (when all loads shipped at once)

**Response Example:**
```json
{
  "status": "success",
  "message": "Successfully marked 2 load(s) as shipped. Status updated to partially_shipped.",
  "data": {
    "id": 12345,
    "status": "partially_shipped",
    "shippedLoads": 2,
    "shippedDate": "2024-02-15T14:30:00Z",
    "numberOfLoads": 3
  }
}
```

**Error Handling:**
```json
{
  "error": {
    "statusCode": 400,
    "message": "Cannot mark 2 loads as shipped. Only 1 loads remaining."
  }
}
```

**UI Action Permissions:**
- Show "Mark as Shipped" only for accepted bids
- Show individual load buttons for accepted offers
- Disable button when all loads are shipped
- Display load counts in confirmation modal

---

## 5. Status Management System

### 5.1 Get Status Catalogue

### Endpoint: `GET /admin/status-catalogue`
**Task Reference:** 869abxxtg - 6.4.1.20 System Defined Status & State

**Description:** Retrieves system-defined status and state options for all entity types. Provides structured data for dropdowns, filters, and consistent UI terminology.

**Response Example:**
```json
{
  "status": "success",
  "message": "Status catalogue retrieved successfully",
  "data": {
    "listingStatuses": [
      {
        "value": "pending",
        "label": "Pending - Awaiting admin approval"
      },
      {
        "value": "available",
        "label": "Available - Ready for trading"
      },
      {
        "value": "available_from_date",
        "label": "Available from Date"
      },
      {
        "value": "ongoing",
        "label": "Ongoing - Recurring listing"
      },
      {
        "value": "sold",
        "label": "Sold - All loads sold"
      },
      {
        "value": "expired",
        "label": "Expired - End date reached"
      },
      {
        "value": "rejected",
        "label": "Rejected - Admin rejected"
      }
    ],
    "wantedListingStatuses": [
      {
        "value": "pending",
        "label": "Pending - More information required"
      },
      {
        "value": "material_required",
        "label": "Material Required - Ready now"
      },
      {
        "value": "material_required_from_date",
        "label": "Material Required from Date"
      },
      {
        "value": "fulfilled",
        "label": "Fulfilled - Requirements met"
      },
      {
        "value": "rejected",
        "label": "Rejected - Admin rejected"
      }
    ],
    "tradeBidStatuses": [
      {
        "value": "pending",
        "label": "Pending - Awaiting action"
      },
      {
        "value": "accepted",
        "label": "Accepted - User accepted bid"
      },
      {
        "value": "rejected",
        "label": "Rejected - User rejected bid"
      },
      {
        "value": "partially_shipped",
        "label": "Load X of X Shipped"
      },
      {
        "value": "shipped",
        "label": "Shipped - All loads shipped"
      }
    ],
    "haulageBidStatuses": [
      {
        "value": "pending",
        "label": "Pending - Awaiting review"
      },
      {
        "value": "approved",
        "label": "Approved - Admin approved"
      },
      {
        "value": "accepted",
        "label": "Accepted - User accepted"
      },
      {
        "value": "rejected",
        "label": "Rejected - Admin rejected"
      },
      {
        "value": "information_requested",
        "label": "More Information Required"
      },
      {
        "value": "partially_shipped",
        "label": "Load X of X Shipped"
      },
      {
        "value": "shipped",
        "label": "Shipped - All loads shipped"
      }
    ],
    "adminStates": [
      {
        "value": "pending",
        "label": "Pending - Awaiting admin approval/information"
      },
      {
        "value": "approved",
        "label": "Approved - Visible to users, normal trading"
      },
      {
        "value": "rejected",
        "label": "Rejected - Not visible"
      }
    ]
  }
}
```

### 5.2 Get Formatted Shipping Status

### Endpoint: `GET /admin/shipping-status/{status}`

**Description:** Formats shipping status with dynamic "Load X of X Shipped" display and color coding for UI consistency.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | Yes | Raw status value |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| totalLoads | number | Yes | Total number of loads |
| shippedLoads | number | No | Number of shipped loads |

**Response Examples:**

**For Partial Shipment:**
```
GET /admin/shipping-status/partially_shipped?totalLoads=5&shippedLoads=2
```

```json
{
  "status": "success",
  "message": "Shipping status formatted successfully",
  "data": {
    "formattedStatus": "Load 2 of 5 Shipped",
    "color": "warning"
  }
}
```

**For Standard Status:**
```
GET /admin/shipping-status/approved?totalLoads=5
```

```json
{
  "status": "success",
  "message": "Shipping status formatted successfully",
  "data": {
    "formattedStatus": "Approved",
    "color": "success"
  }
}
```

**Status Color Mapping:**
- `success`: Green (approved, accepted, shipped, fulfilled, material_required)
- `warning`: Orange (pending, information_requested, partially_shipped)
- `danger`: Red (rejected, expired)
- `info`: Blue (ongoing)
- `secondary`: Gray (default)

---

## 6. Frontend Integration Guidelines

### ✅ Field Name Fixes Applied

**Mark as Shipped Request:**
```json
{
  "loadsToMark": 2
}
```
✅ Use `loadsToMark` (not `shippedLoads` or `totalLoads`)

**Haulage Bid Actions Request:**
```json
{
  "action": "approve",
  "rejectionReason": "incomplete_documentation",
  "customRejectionReason": "...",
  "message": "...",
  "sendEmail": true
}
```
✅ `sendEmail` field is optional (default: true)

### Quick Integration Examples

**TypeScript:**
```typescript
// Mark as Shipped
await fetch(`/haulage-offers/${id}/mark-shipped`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    loadsToMark: 2  // ✅ Correct field name
  })
});

// Approve Bid
await fetch(`/haulage-offers/${id}/actions`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'approve',
    sendEmail: true  // ✅ Optional, default: true
  })
});

// Reject Bid
await fetch(`/haulage-offers/${id}/actions`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'reject',
    rejectionReason: 'incomplete_documentation',
    customRejectionReason: 'Missing insurance certificates',
    sendEmail: true
  })
});
```

## 6.1. Original Frontend Integration Guidelines

### 6.1 State Management
- Implement real-time status updates using the formatted status endpoint
- Cache status catalogue for dropdowns and filters
- Handle pagination for large datasets (default 20, max 100 records)

### 6.2 Status Display
- Always use `formattedStatus` for user-facing display
- Use `statusColor` for consistent UI styling
- Implement color-coded badges: green (success), orange (warning), red (danger), blue (info)

### 6.3 Modal/Dialog Guidelines

#### Approval Modal
- Simple confirmation with "Approve" button
- Clear messaging about email notifications

#### Rejection Modal
- Include reason selection dropdown with pre-defined options
- Custom reason textarea (required when "other" selected)
- Clear messaging about email notifications

#### Request Information Modal
- Include message textarea for custom admin messages
- Predefined request type selections
- Character limit and validation

#### Mark Shipped Modal
- Show current load counts: "Marking 2 of 5 loads as shipped"
- Confirmation text: "Are you sure this load has been shipped and all relevant documentation is in order? This cannot be undone."
- Show current date for shipped date

### 6.4 Action Permissions
- Show action buttons only when bid is in valid state
- Hide approve/reject buttons for already processed bids
- Show "Mark as Shipped" only for accepted bids
- Disable shipped button when all loads are shipped

### 6.5 Real-time Updates
- Implement polling or WebSocket for status updates
- Refresh table data after actions are completed
- Show success/error messages from API responses
- Auto-refresh after successful actions

### 6.6 Loading States
- Show loading spinners during API calls
- Implement skeleton loaders for table data
- Provide feedback for long-running operations
- Disable buttons during processing

### 6.7 Error Handling
- Use user-friendly error messages from API responses
- Implement retry mechanisms for failed requests
- Show contextual error messages for validation failures
- Provide support contact information for persistent issues

---

## 7. Error Handling

### Standard Error Response Format:
```json
{
  "error": {
    "statusCode": 401,
    "name": "UnauthorizedError",
    "message": "Unauthorized access"
  }
}
```

### Common HTTP Status Codes:
- `200`: Success
- `400`: Bad Request (validation errors, business rule violations)
- `401`: Unauthorized (invalid authentication or insufficient permissions)
- `404`: Not Found (resource does not exist)
- `500`: Internal Server Error (unexpected server errors)

### User-Friendly Error Messages:
- `"Failed to load offers. Please refresh the page to try again."`
- `"No haulage offers found. Check back later."`
- `"We couldn't load the shipping modal. Please try again later."`
- `"We couldn't update the shipping status right now. Please try again. If the problem persists, contact support."`
- `"Failed to approve the bid. Please try again."`
- `"Failed to reject the bid. Please try again."`
- `"Failed to request more information. Please try again."`
- `"Failed to send email. Please check the email configuration."`

---

## 8. Testing Endpoints

### Example cURL Commands:

```bash
# Get haulage bids (with pagination - individual params)
curl -X GET "https://api.wastetrade.com/admin/haulage-bids?skip=0&limit=20&status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Get haulage bids (with pagination - filter object format, FE standard)
curl -X GET 'https://api.wastetrade.com/admin/haulage-bids?filter={"skip":20,"limit":20}' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Get haulage bid details
curl -X GET "https://api.wastetrade.com/admin/haulage-bids/12345" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Approve a bid
curl -X PATCH "https://api.wastetrade.com/haulage-offers/12345/actions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "approve"}'

# Reject a bid with reason
curl -X PATCH "https://api.wastetrade.com/haulage-offers/12345/actions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reject",
    "rejectionReason": "incomplete_documentation",
    "customRejectionReason": "Missing insurance certificates"
  }'

# Request more information
curl -X PATCH "https://api.wastetrade.com/haulage-offers/12345/actions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "request_information",
    "message": "Please provide your company insurance details and verify your contact information."
  }'

# Mark as shipped (partial)
curl -X PATCH "https://api.wastetrade.com/haulage-offers/12345/mark-shipped" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"loadsToMark": 2}'

# Get status catalogue
curl -X GET "https://api.wastetrade.com/admin/status-catalogue" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Get formatted shipping status
curl -X GET "https://api.wastetrade.com/admin/shipping-status/partially_shipped?totalLoads=5&shippedLoads=2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 9. Postman Collection

```json
{
  "info": {
    "name": "WasteTrade - Haulage Management Admin APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "description": "Complete API collection for Waste Trading Platform Haulage Management System"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://wastetrade-api-dev.b13devops.com"
    },
    {
      "key": "jwt_token",
      "value": "your_jwt_token_here"
    }
  ],
  "item": [
    {
      "name": "Haulage Bids Management",
      "item": [
        {
          "name": "Get Haulage Bids",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "url": {
              "raw": "{{base_url}}/admin/haulage-bids?skip=0&limit=20",
              "host": ["{{base_url}}"],
              "path": ["admin", "haulage-bids"],
              "query": [
                {
                  "key": "skip",
                  "value": "0"
                },
                {
                  "key": "limit",
                  "value": "20"
                }
              ]
            }
          }
        },
        {
          "name": "Get Haulage Bid Details",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "url": {
              "raw": "{{base_url}}/admin/haulage-bids/12345",
              "host": ["{{base_url}}"],
              "path": ["admin", "haulage-bids", "12345"]
            }
          }
        }
      ]
    },
    {
      "name": "Bid Actions",
      "item": [
        {
          "name": "Approve Bid",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"action\": \"approve\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/haulage-offers/12345/actions",
              "host": ["{{base_url}}"],
              "path": ["haulage-offers", "12345", "actions"]
            }
          }
        },
        {
          "name": "Reject Bid",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"action\": \"reject\",\n  \"rejectionReason\": \"incomplete_documentation\",\n  \"customRejectionReason\": \"Missing required documentation\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/haulage-offers/12345/actions",
              "host": ["{{base_url}}"],
              "path": ["haulage-offers", "12345", "actions"]
            }
          }
        },
        {
          "name": "Request Information",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"action\": \"request_information\",\n  \"message\": \"Please provide additional documentation\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/haulage-offers/12345/actions",
              "host": ["{{base_url}}"],
              "path": ["haulage-offers", "12345", "actions"]
            }
          }
        }
      ]
    },
    {
      "name": "Shipment Management",
      "item": [
        {
          "name": "Mark as Shipped",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"loadsToMark\": 2\n}"
            },
            "url": {
              "raw": "{{base_url}}/haulage-offers/12345/mark-shipped",
              "host": ["{{base_url}}"],
              "path": ["haulage-offers", "12345", "mark-shipped"]
            }
          }
        }
      ]
    },
    {
      "name": "Status Management",
      "item": [
        {
          "name": "Get Status Catalogue",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "url": {
              "raw": "{{base_url}}/admin/status-catalogue",
              "host": ["{{base_url}}"],
              "path": ["admin", "status-catalogue"]
            }
          }
        },
        {
          "name": "Get Formatted Status",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "url": {
              "raw": "{{base_url}}/admin/shipping-status/partially_shipped?totalLoads=5&shippedLoads=2",
              "host": ["{{base_url}}"],
              "path": ["admin", "shipping-status", "partially_shipped"],
              "query": [
                {
                  "key": "totalLoads",
                  "value": "5"
                },
                {
                  "key": "shippedLoads",
                  "value": "2"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

---

## 10. Implementation Summary

### Sprint 2 Tasks Delivered

| Task | ClickUp ID | Feature | Status |
|------|------------|---------|--------|
| Haulage Bids Table | 869abxxt1 | Admin dashboard with pagination, filtering, search | ✅ Complete |
| Bid Approval Actions | 869abxxt7 | Multi-step approval workflow with notifications | ✅ Complete |
| Bid Details View | 869abxxt4 | Comprehensive bid information display | ✅ Complete |
| Mark as Shipped | 869abxxt9 | Partial/complete shipment tracking | ✅ Complete |
| Status Management | 869abxxtg | Dynamic status system with "Load X of X" formatting | ✅ Complete |

### Key Features Implemented

#### Business Logic
- ✅ Complete haulage bid lifecycle management
- ✅ Multi-role approval workflows (admin → user)
- ✅ Partial shipment tracking with "Load X of X" display
- ✅ PERN fee calculations for UK exports
- ✅ Comprehensive financial calculations

#### Security & Validation
- ✅ Role-based access control (admin only)
- ✅ Business rule validation (status prerequisites)
- ✅ Load quantity validation (prevent over-shipping)
- ✅ JWT authentication for all endpoints

#### Integration Features
- ✅ Email notifications for all bid actions
- ✅ Dynamic status formatting with color coding
- ✅ Centralized status management system
- ✅ Comprehensive error handling

#### UI Support
- ✅ Formatted status display with colors
- ✅ Pagination and filtering support
- ✅ Search capabilities across multiple fields
- ✅ Structured data for frontend components

### Production Readiness

The API endpoints are production-ready with:
- **Comprehensive Error Handling**: User-friendly messages and proper HTTP status codes
- **Performance Optimized**: Efficient SQL queries with proper indexing considerations
- **Scalable Architecture**: Following LoopBack 4 best practices
- **Complete Documentation**: Full API specs with examples and integration guidelines
- **Testing Support**: Postman collection and cURL examples

The implementation provides all necessary endpoints for frontend integration with detailed documentation, examples, and error handling to support a complete admin portal for haulage management.

---

**Version:** 1.0.0
**Last Updated:** January 2024
**API Version:** v1
**Documentation:** Complete Sprint 2 Implementation
**Contact:** backend@wastetrade.com