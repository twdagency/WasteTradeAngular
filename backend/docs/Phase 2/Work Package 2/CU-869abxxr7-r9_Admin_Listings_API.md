# CU-869abxxr7 & CU-869abxxr9: Admin View Listings

**Epic**: 6.4.1. Admin Dashboard  
**User Stories**:
- 6.4.1.5. View Listings Table
- 6.4.1.6. View Listings Details


## API Endpoints

### GET `/listings/sell` - Admin View All Sell Listings

**Auth**: JWT required  
**Role**: Admin, Super Admin, Sales Admin

**Request**:
```typescript
{
  "skip": 0,
  "limit": 20,
  "where": {
    "searchTerm": "plastic",
    "materialType": ["plastic", "metal"],
    "company": "Seller Corp",
    "country": "UK",
    "status": "available",
    "state": "approved",
    "sortBy": "createdAtDesc"
  }
}
```

### GET `/listings/admin/{id}` - Admin View Listing Details

**Auth**: JWT required  
**Role**: Admin, Super Admin, Sales Admin

**Path Parameters**:
| Field | Type | Description |
|-------|------|-------------|
| id | number | Listing ID |

## Response

### Listings Table Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | number | Listing ID |
| userId | number | Seller user ID |
| firstName | string | Seller first name |
| lastName | string | Seller last name |
| companyId | number | Company ID |
| companyName | string | Company name |
| locationId | number | Warehouse/location ID |
| locationName | string | Location name |
| country | string | Location country |
| city | string | Location city |
| addressLine | string | Location address |
| street | string | Location street |
| postcode | string | Location postcode |
| stateProvince | string | Location state/province |
| materialType | string | Material type (plastic/metal/paper) |
| materialItem | string | Material item |
| materialForm | string | Material form |
| materialPacking | string | Packaging type |
| createdAt | datetime | Date listed |
| assignedAdminId | number \| null | Assigned admin user ID |
| startDate | date | Date available from |
| numberOfOffers | number | Count of offers |
| pricePerMetricTonne | number | Guide price per MT |
| currency | string | Currency code |
| bestOffer | number | Highest offer price per MT |
| bestOfferCurrency | string | Best offer currency |
| quantity | number | Total quantity |
| remainingQuantity | number | Remaining loads |
| materialWeightPerUnit | number | Weight per load |
| status | string | Listing status (available/sold) |
| state | string | Admin state (approved/pending/rejected) |

### Listing Details Response Fields

| Field | Type | Description |
|-------|------|-------------|
| title | string | Listing title |
| description | string | Listing description |
| documents.featureImage | string | Feature image URL |
| documents.all | array | Array of all document objects |
| numberOfOffers | number | Count of valid offers |
| bestOffer | number | Highest offer price |
| bestOfferCurrency | string | Currency of best offer |
| buyerDetails.locationId | number | Buyer location ID (for popup) |
| images | array | Array of image URLs |
| materialGrading | string | Material grading |
| materialColor | string | Material color |
| materialFinishing | string | Material finishing |
| wasteStoration | string | Storage type |
| capacityPerMonth | number | Monthly capacity |
| additionalNotes | string | Additional notes |
| location.addressLine | string | Full address |
| location.city | string | City |
| location.postcode | string | Postcode |
| location.officeOpenTime | time | Site opening time |
| location.officeCloseTime | time | Site closing time |
| location.containerTypes | array | Accepted container types |
| location.accessRestrictions | string | Site restrictions |

## curl Examples

### Get All Sell Listings
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/listings/sell?filter=%7B%22skip%22%3A0%2C%22limit%22%3A20%7D' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

**Response**:
```json
{
  "results": [
    {
      "id": 123,
      "materialType": "plastic",
      "materialItem": "PET bottles",
      "createdAt": "2024-12-01T10:00:00.000Z",
      "assignedAdminId": 5,
      "startDate": "2024-12-15",
      "numberOfOffers": 3,
      "pricePerMetricTonne": 500,
      "currency": "gbp",
      "bestOffer": 520,
      "bestOfferCurrency": "gbp",
      "quantity": 100,
      "remainingQuantity": 80,
      "materialWeightPerUnit": 25,
      "status": "available",
      "state": "approved",
      "createdBy": {
        "user": {
          "id": 45,
          "firstName": "John",
          "lastName": "Smith",
          "email": "john@recyclingcorp.com",
          "username": "john.smith"
        },
        "company": {
          "id": 10,
          "name": "Recycling Corp Ltd"
        },
        "location": {
          "id": 5,
          "locationName": "London Warehouse",
          "country": "United Kingdom",
          "city": "London",
          "addressLine": "123 Industrial Estate",
          "street": "Main Road",
          "postcode": "E1 6AN",
          "stateProvince": "Greater London"
        }
      }
    }
  ],
  "totalCount": 42
}
```

### Search by Material
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/listings/sell?filter=%7B%22where%22%3A%7B%22searchTerm%22%3A%22plastic%22%7D%7D' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

### Filter by Status and Country
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/listings/sell?filter=%7B%22where%22%3A%7B%22status%22%3A%22available%22%2C%22country%22%3A%22UK%22%7D%7D' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

### Get Listing Details
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/listings/admin/123' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "listing": {
      "id": 123,
      "title": "High Quality PET Bottles",
      "description": "Clean baled PET bottles ready for collection",
      "materialType": "plastic",
      "materialItem": "PET bottles",
      "quantity": 100,
      "remainingQuantity": 80,
      "pricePerMetricTonne": 500,
      "currency": "gbp",
      "status": "available",
      "state": "approved",
      "createdAt": "2024-12-01T10:00:00.000Z",
      "startDate": "2024-12-15"
    },
    "userInformation": {
      "fullName": "John Smith",
      "email": "john@recyclingcorp.com",
      "phoneNumber": "+44123456789",
      "company": "Recycling Corp Ltd"
    },
    "storageDetails": {
      "locationName": "London Warehouse",
      "address": {
        "addressLine": "123 Industrial Estate",
        "city": "London",
        "postcode": "E1 6AN",
        "country": "United Kingdom"
      },
      "operatingHours": {
        "openTime": "08:00",
        "closeTime": "17:00"
      },
      "containerTypes": ["20ft", "40ft"],
      "accessRestrictions": "Booking required 24h in advance"
    }
  }
}
```

## Error Responses

| Status | Error | When |
|--------|-------|------|
| 401 | Unauthorized | No JWT token or invalid |
| 403 | Forbidden | User is not admin |
| 404 | Listing not found | Invalid listing ID (details endpoint) |

## Notes

- Use `POST /admin/assign` with `recordType: "listing"` to assign admin
- Use `POST /admin/notes` with `recordType: "listing"` to add notes
- Use `GET /admin/my-assigned?recordType=listing` to fetch assigned listings

