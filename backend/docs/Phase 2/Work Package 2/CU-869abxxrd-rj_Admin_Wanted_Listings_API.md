# CU-869abxxrd & CU-869abxxrj: Admin View Wanted Listings

**Epic**: 6.4.1. Admin Dashboard  
**User Stories**:
- 6.4.1.7. View Wanted Listings Table
- 6.4.1.8. View Wanted Listings Details


## API Endpoints

### GET `/listings/wanted` - Admin View All Wanted Listings

**Auth**: JWT required  
**Role**: Admin, Super Admin, Sales Admin

**Request**:
```typescript
{
  "skip": 0,
  "limit": 20,
  "where": {
    "searchTerm": "aluminum",
    "materialType": ["metal", "plastic"],
    "company": "Buyer Corp",
    "country": "Germany",
    "wantedStatus": "Material Required",
    "state": "approved"
  }
}
```

### GET `/listings/admin/{id}` - Admin View Wanted Listing Details

Same endpoint as sell listings, automatically handles wanted listings.

## Response

### Wanted Listings Table Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | number | Listing ID |
| userId | number | Buyer user ID |
| firstName | string | Buyer first name |
| lastName | string | Buyer last name |
| companyId | number | Company ID |
| companyName | string | Company name |
| createdBy.location.id | number | Buyer location ID |
| country | string | Destination country |
| locationName | string | Location name |
| city | string | Location city |
| addressLine | string | Location address |
| street | string | Location street |
| postcode | string | Location postcode |
| stateProvince | string | Location state/province |
| materialType | string | Material type required |
| materialItem | string | Material item |
| materialForm | string | Material form |
| materialPacking | string | Packaging required |
| createdAt | datetime | Date listed |
| assignedAdminId | number \| null | Assigned admin user ID |
| startDate | date | Date required from |
| quantity | number | Quantity required |
| pricePerMetricTonne | number | Guide price per MT |
| currency | string | Currency code |
| wasteStoration | string | Storage type |
| wantedStatus | string | Calculated wanted status |
| state | string | Admin state (approved/pending/rejected) |

### Wanted Status Values

| Status | Condition |
|--------|-----------|
| **Material Required** | status=available AND startDate ≤ today |
| **Material Required from DD/MM/YYYY** | status=available AND startDate > today |
| **Fulfilled** | status=sold OR state=closed |
| **Pending** | state=pending OR requires more info |
| **Rejected** | state=rejected |

## curl Examples

### Get All Wanted Listings
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/listings/wanted?filter=%7B%22skip%22%3A0%2C%22limit%22%3A20%7D' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

**Response**:
```json
{
  "results": [
    {
      "id": 456,
      "listingType": "wanted",
      "materialType": "metal",
      "materialItem": "aluminum",
      "materialForm": "cans",
      "materialPacking": "loose",
      "pricePerMetricTonne": 800,
      "currency": "eur",
      "quantity": 50,
      "wasteStoration": "indoor",
      "startDate": "2024-12-20",
      "assignedAdminId": 5,
      "status": "available",
      "wantedStatus": "Material Required from 20/12/2024",
      "state": "approved",
      "createdAt": "2024-12-05T14:30:00.000Z",
      "createdBy": {
        "user": {
          "id": 78,
          "firstName": "Maria",
          "lastName": "Schmidt",
          "email": "maria@buyer.de",
          "username": "maria.schmidt"
        },
        "company": {
          "id": 25,
          "name": "German Buyer GmbH"
        },
        "location": {
          "id": 12,
          "locationName": "Berlin Warehouse",
          "country": "Germany",
          "city": "Berlin",
          "addressLine": "456 Industrial Park",
          "street": "Hauptstrasse",
          "postcode": "10115",
          "stateProvince": "Berlin"
        }
      }
    }
  ],
  "totalCount": 42
}
```

### Filter by Wanted Status
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/listings/wanted?filter=%7B%22where%22%3A%7B%22wantedStatus%22%3A%22Material%20Required%22%7D%7D' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

### Search by Material
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/listings/wanted?filter=%7B%22where%22%3A%7B%22searchTerm%22%3A%22aluminum%22%7D%7D' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

### Get Wanted Listing Details
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/listings/admin/456' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "listing": {
      "id": 456,
      "listingType": "wanted",
      "materialType": "metal",
      "materialItem": "aluminum",
      "quantity": 50,
      "pricePerMetricTonne": 800,
      "currency": "eur",
      "status": "available",
      "state": "approved",
      "wantedStatus": "Material Required from 20/12/2024",
      "country": "Germany",
      "createdAt": "2024-12-05T14:30:00.000Z",
      "startDate": "2024-12-20"
    },
    "userInformation": {
      "fullName": "Maria Schmidt",
      "email": "maria@buyer.de",
      "phoneNumber": "+49123456789",
      "company": "German Buyer GmbH"
    }
  }
}
```

## Error Responses

| Status | Error | When |
|--------|-------|------|
| 401 | Unauthorized | No JWT token or invalid |
| 403 | Forbidden | User is not admin |
| 404 | Listing not found | Invalid listing ID |

## Notes

- Use `POST /admin/assign` with `recordType: "wanted_listing"` to assign admin
- Use `POST /admin/notes` with `recordType: "wanted_listing"` to add notes
- Use `GET /admin/my-assigned?recordType=wanted_listing` to fetch assigned wanted listings
- Same endpoint as sell listings (`/listings/admin/{id}`), automatically handles both types
- Wanted status is calculated dynamically based on dates
- Location details returned when `locationId` is set, otherwise falls back to `country` field

## curl Examples

### Get All Wanted Listings
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/listings/wanted?filter=%7B%22skip%22%3A0%2C%22limit%22%3A20%7D' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

**Response**:
```json
{
  "results": [
    {
      "id": 456,
      "listingType": "wanted",
      "materialType": "metal",
      "materialItem": "aluminum",
      "materialForm": "cans",
      "materialPacking": "loose",
      "pricePerMetricTonne": 800,
      "currency": "eur",
      "quantity": 50,
      "wasteStoration": "indoor",
      "startDate": "2024-12-20",
      "assignedAdminId": 5,
      "status": "available",
      "wantedStatus": "Material Required from 20/12/2024",
      "state": "approved",
      "createdAt": "2024-12-05T14:30:00.000Z",
      "createdBy": {
        "user": {
          "id": 78,
          "firstName": "Maria",
          "lastName": "Schmidt",
          "email": "maria@buyer.de",
          "username": "maria.schmidt"
        },
        "company": {
          "id": 25,
          "name": "German Buyer GmbH"
        },
        "location": {
          "id": 12,
          "locationName": "Berlin Warehouse",
          "country": "Germany",
          "city": "Berlin",
          "addressLine": "456 Industrial Park",
          "street": "Hauptstrasse",
          "postcode": "10115",
          "stateProvince": "Berlin"
        }
      }
    }
  ],
  "totalCount": 42
}
```

### Filter by Wanted Status
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/listings/wanted?filter=%7B%22where%22%3A%7B%22wantedStatus%22%3A%22Material%20Required%22%7D%7D' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

### Search by Material
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/listings/wanted?filter=%7B%22where%22%3A%7B%22searchTerm%22%3A%22aluminum%22%7D%7D' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

### Get Wanted Listing Details
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/listings/admin/456' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "listing": {
      "id": 456,
      "listingType": "wanted",
      "materialType": "metal",
      "materialItem": "aluminum",
      "quantity": 50,
      "pricePerMetricTonne": 800,
      "currency": "eur",
      "status": "available",
      "state": "approved",
      "wantedStatus": "Material Required from 20/12/2024",
      "country": "Germany",
      "createdAt": "2024-12-05T14:30:00.000Z",
      "startDate": "2024-12-20"
    },
    "userInformation": {
      "fullName": "Maria Schmidt",
      "email": "maria@buyer.de",
      "phoneNumber": "+49123456789",
      "company": "German Buyer GmbH"
    }
  }
}
```

## Error Responses

| Status | Error | When |
|--------|-------|------|
| 401 | Unauthorized | No JWT token or invalid |
| 403 | Forbidden | User is not admin |
| 404 | Listing not found | Invalid listing ID |

## Frontend Integration

### Wanted Listings Table UI
1. **Clickable Buyer ID** → opens user details in new tab
2. **Clickable Location** → opens location modal showing full details
3. **View Details button** → opens wanted listing details page
4. **Status Display**: Use calculated `wantedStatus` field
5. **Date Format**: For "Material Required from {date}", format date as DD/MM/YYYY

### Location Modal
- Title: "Location details – {locationName}"
- Show: Full address, operating hours, container types, access restrictions
- Read-only display
- Same as sell listings location modal

### Differences from Sell Listings
- **Status logic** - uses date-based calculation for "Material Required"
- **No best offer** - wanted listings don't track offers the same way
- **Location handling** - wanted listings can have location details (if locationId is set) or just country (if no locationId)

## Notes

- ✅ **Updated** - Full location details now included in response
- All location fields (city, address, postcode, etc.) **now returned in createdBy.location**
- **Same endpoint** as sell listings (`/listings/admin/{id}`), automatically handles both types
- Uses `listingType` field to differentiate
- **Wanted status** is calculated dynamically based on dates
- Location details returned when `locationId` is set, otherwise falls back to `country` field
- All filtering, sorting, pagination work identically to sell listings

