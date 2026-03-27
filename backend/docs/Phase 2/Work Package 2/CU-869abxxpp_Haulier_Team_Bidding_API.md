# CU-869abxxpp: Haulier Team Bidding

**Epic**: 6.3.3. Multi-User Company Accounts  
**User Story**: 6.3.3.7. Haulier Team Bidding  

## Overview

Multiple users within a haulier company can create haulage offers. Any company member can select which approved haulier in their company creates the bid.

**Features**:
- `haulage_offers` table tracks `haulier_user_id` and `haulier_company_id`
- Company members can select approved hauliers from dropdown
- Searchable by user name, email, username
- Only approved hauliers shown

## API Endpoints

### GET `/haulage-offers/company-hauliers`

Get approved hauliers in current user's company for dropdown selection.

**Auth**: JWT required  
**Role**: Haulier company member

**Query Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| search | string | No | Search by name, email, or username |

**Response**:
```json
{
  "status": "success",
  "message": "Approved hauliers retrieved successfully",
  "data": [
    {
      "id": 318,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "username": "12345678"
    }
  ]
}
```

### POST `/haulage-offers`

Create a haulage offer.

**Auth**: JWT required  
**Role**: Haulier (approved company member)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| offerId | number | Yes | Trade offer ID to bid on |
| haulierUserId | number | No | **NEW**: Select which haulier creates the bid |
| trailerContainerType | string | Yes | Container/trailer type |
| completingCustomsClearance | boolean | No | Whether haulier handles customs |
| haulageCostPerLoad | number | Yes | Cost per load |
| quantityPerLoad | number | No | Quantity per load (MT) |
| currency | string | Yes | Currency code (gbp/usd/eur) |
| transportProvider | string | Yes | Transport provider type |
| suggestedCollectionDate | date | Yes | Collection date (within buyer window) |
| expectedTransitTime | string | Yes | Transit time |
| demurrageAtDestination | number | Yes | Demurrage days (min 21) |
| notes | string | No | Additional notes |

## Response Fields

### Success Response (201)

| Field | Type | Description |
|-------|------|-------------|
| id | number | Haulage offer ID |
| offerId | number | Trade offer ID |
| haulierUserId | number | **User who created the offer** |
| haulierCompanyId | number | **Haulier company ID** |
| haulageTotal | number | Total cost |
| currency | string | Currency code |
| status | string | Initial status (pending) |
| createdAt | datetime | Creation timestamp |

## curl Examples

### Get Company Hauliers
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/haulage-offers/company-hauliers?search=john' \
  -H 'Authorization: Bearer HAULIER_JWT_TOKEN'
```

**Response**:
```json
{
  "status": "success",
  "message": "Approved hauliers retrieved successfully",
  "data": [
    {
      "id": 318,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "username": "12345678"
    }
  ]
}
```

### Create Haulage Offer (Self)
```bash
curl -X POST \
  'https://wastetrade-api-dev.b13devops.com/haulage-offers' \
  -H 'Authorization: Bearer HAULIER_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "offerId": 2241,
    "trailerContainerType": "curtain_slider_standard",
    "completingCustomsClearance": true,
    "haulageCostPerLoad": 8,
    "currency": "usd",
    "transportProvider": "mixed",
    "suggestedCollectionDate": "2025-12-30T17:00:00.000Z",
    "expectedTransitTime": "4-5",
    "demurrageAtDestination": 29
  }'
```

### Create Haulage Offer (Select Team Member)
```bash
curl -X POST \
  'https://wastetrade-api-dev.b13devops.com/haulage-offers' \
  -H 'Authorization: Bearer COMPANY_MEMBER_JWT' \
  -H 'Content-Type: application/json' \
  -d '{
    "offerId": 2241,
    "haulierUserId": 318,
    "trailerContainerType": "curtain_slider_standard",
    "completingCustomsClearance": true,
    "haulageCostPerLoad": 8,
    "currency": "usd",
    "transportProvider": "mixed",
    "suggestedCollectionDate": "2025-12-30T17:00:00.000Z",
    "expectedTransitTime": "4-5",
    "demurrageAtDestination": 29
  }'
```

**Response**:
```json
{
  "status": "success",
  "message": "Haulage offer created successfully",
  "data": {
    "id": 456,
    "offerId": 2241,
    "haulierUserId": 318,
    "haulierCompanyId": 182,
    "trailerContainerType": "curtain_slider_standard",
    "haulageCostPerLoad": 8,
    "currency": "usd",
    "status": "pending",
    "createdAt": "2025-12-26T10:00:00.000Z"
  }
}
```

## Error Responses

| Status | Error | When |
|--------|-------|------|
| 400 | Selected haulier is not an approved member of your company | Invalid or unapproved haulierUserId |
| 400 | Container type not supported by haulier | Company profile doesn't include this container type |
| 401 | Unauthorized | No JWT token or invalid token |
| 403 | Only hauliers can make haulage offers | Company not a haulier |
| 403 | Only approved hauliers can create offers | Company not approved |
| 404 | Trade offer not found | Invalid offer ID |

## Frontend Integration

### 1. Haulier Dropdown (All Company Members)
```typescript
// Fetch approved hauliers
const response = await fetch('/haulage-offers/company-hauliers?search=' + searchTerm);
const { data } = await response.json();

// Display dropdown
// - Searchable by name, email, username
// - Show: "John Doe (john@example.com)"
// - Guidance: "Only approved hauliers within your company are shown here."
```

### 2. Create Bid
```typescript
const payload = {
  offerId: 2241,
  haulierUserId: selectedHaulierId, // Optional: include if user selected from dropdown
  trailerContainerType: "curtain_slider_standard",
  // ... other fields
};

// If no selection, omit haulierUserId (uses current user)
```

### 3. My Haulage Offers Table
- Shows `createdByUserName` to identify who created each offer
- All company members can view all company's offers
- Container type dropdown disables options not in company profile

## Validation Rules

1. **haulierUserId** (optional):
   - If provided, must be approved member of same company
   - If omitted, uses current user's ID

2. **Container types**:
   - Validated against company profile `containerTypes` field
   - Only enabled types shown in dropdown

3. **Company approval**:
   - Only approved haulier companies can create offers
   - Individual users must also be approved

## Notes

- ✅ **Enhanced** - Added team member selection
- Any company member can select approved hauliers
- Dropdown shows only approved members
- System validates selected user belongs to company
- Backward compatible: omitting `haulierUserId` uses current user

