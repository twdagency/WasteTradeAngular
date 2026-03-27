# CU-869abxxrv & CU-869abxxrw: Admin View Offers

**Epic**: 6.4.1. Admin Dashboard  
**User Stories**:

- 6.4.1.9. View Offers Table
- 6.4.1.10. View Offers Details


## API Endpoints

### GET `/offers/admin` - Admin View All Trade Offers

**Auth**: JWT required  
**Role**: Admin, Super Admin, Sales Admin

**Request**:
```typescript
{
  "skip": 0,
  "limit": 20,
  "where": {
    "searchTerm": "plastic",
    "buyerName": "John Smith",
    "sellerName": "Supplier Ltd",
    "materialType": "plastic",
    "location": "UK",
    "status": "approved",
    "state": "active",
    "sortBy": "createdAtDesc"
  }
}
```

### GET `/offers/{id}` - View Offer Details

**Auth**: JWT required  
**Role**: Admin, Buyer (offer creator), Seller (listing owner)

**Path Parameters**:
| Field | Type | Description |
|-------|------|-------------|
| id | number | Offer ID |

## Response

### Offers Table Response Fields

| Field | Type | Description |
|-------|------|-------------|
| **Offer Info** | | |
| id | number | Offer ID |
| createdAt | datetime | Bid date |
| expiresAt | datetime | Valid until |
| quantity | number | Number of loads bid on |
| offeredPricePerUnit | number | Bid amount per MT |
| totalPrice | number | Total bid amount |
| currency | string | Bid currency |
| status | string | Bid status (pending/approved/accepted/rejected) |
| state | string | Admin state (pending/active/closed) |
| assignedAdminId | number \| null | Assigned admin user ID |
| **Buyer Info** | | |
| buyer.user.id | number | Buyer ID |
| buyer.user.firstName | string | Buyer first name |
| buyer.user.lastName | string | Buyer last name |
| buyer.company.id | number | Buyer company ID |
| buyer.company.name | string | Buyer company name |
| buyer.location.id | number | Destination location ID |
| buyer.location.locationName | string | Destination location name |
| buyer.location.city | string | Destination city |
| buyer.location.country | string | Destination country |
| buyer.country | string | Buyer country |
| **Seller Info** | | |
| seller.user.id | number | Seller ID |
| seller.user.firstName | string | Seller first name |
| seller.user.lastName | string | Seller last name |
| seller.company.id | number | Seller company ID |
| seller.company.name | string | Seller company name |
| seller.location.id | number | Pickup location ID |
| seller.location.locationName | string | Pickup location name |
| seller.location.city | string | Pickup city |
| seller.location.country | string | Pickup country |
| seller.country | string | Seller country |
| **Material/Listing Info** | | |
| listing.id | number | Listing ID |
| listing.materialType | string | Material type |
| listing.materialItem | string | Material name |
| listing.materialPacking | string | Packaging |
| listing.createdAt | datetime | Listing date |
| listing.weightPerLoad | number | AVG Weight per load (MT) |
| listing.remainingQuantity | number | Loads remaining |
| listing.guidePrice | number | Guide price per MT |
| listing.currency | string | Listing currency |
| listing.pern | number | PERN value |
| **Haulage** | | |
| haulageOffersCount | number | No. Haulage Offers count |
| hasAcceptedHaulageOffer | boolean | Flag if offer has accepted haulage offer |
| acceptedHaulageOfferId | number \| null | ID of accepted haulage offer |

### Offer Details Response Fields

| Field | Type | Description |
|-------|------|-------------|
| **Offer Details** | | |
| offer.message | string | Buyer's message |
| offer.rejectionReason | string | Rejection reason (if rejected) |
| offer.incoterms | string | Incoterms |
| offer.shippingPort | string | Shipping port |
| offer.needsTransport | boolean | Transport required |
| offer.earliestDeliveryDate | date | Earliest delivery |
| offer.latestDeliveryDate | date | Latest delivery |
| **Buyer Location Details** | | |
| buyer.location.addressLine | string | Full address |
| buyer.location.street | string | Street |
| buyer.location.postcode | string | Postcode |
| buyer.location.containerType | array | Container types accepted |
| buyer.loadingTimes.openTime | time | Site opening time |
| buyer.loadingTimes.closeTime | time | Site closing time |
| buyer.siteRestrictions | string | Site access restrictions |
| **Seller Location Details** | | |
| seller.location.addressLine | string | Full address |
| seller.location.street | string | Street |
| seller.location.postcode | string | Postcode |
| seller.location.containerType | array | Container types available |
| seller.loadingTimes.openTime | time | Site opening time |
| seller.loadingTimes.closeTime | time | Site closing time |
| seller.siteRestrictions | string | Site access restrictions |
| seller.averageWeightPerLoad | number | Avg weight per load |
| **Material/Listing Full Info** | | |
| listing.title | string | Listing title |
| listing.quantity | number | Total quantity available |
| listing.remainingQuantity | number | Loads remaining |
| listing.materialGrading | string | Material grading |
| listing.materialColor | string | Material color |
| listing.materialForm | string | Material form |
| listing.materialFinishing | string | Material finishing |
| listing.documents | array | Listing documents/images |

## curl Examples

### Get All Offers
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/offers/admin?filter=%7B%22skip%22%3A0%2C%22limit%22%3A20%7D' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

**Response**:
```json
{
  "results": [
    {
      "offer": {
        "id": 789,
        "createdAt": "2024-12-10T14:00:00.000Z",
        "expiresAt": "2024-12-20T14:00:00.000Z",
        "quantity": 10,
        "offeredPricePerUnit": 520,
        "totalPrice": 5200,
        "currency": "gbp",
        "status": "approved",
        "state": "active",
        "assignedAdminId": 5
      },
      "buyer": {
        "user": {
          "id": 45,
          "firstName": "John",
          "lastName": "Buyer",
          "email": "john@buyer.com"
        },
        "company": {
          "id": 20,
          "name": "Buyer Corp Ltd"
        },
        "location": {
          "id": 8,
          "locationName": "Manchester Warehouse",
          "city": "Manchester",
          "country": "United Kingdom"
        },
        "country": "United Kingdom"
      },
      "seller": {
        "user": {
          "id": 67,
          "firstName": "Jane",
          "lastName": "Seller",
          "email": "jane@seller.com"
        },
        "company": {
          "id": 15,
          "name": "Recycling Ltd"
        },
        "location": {
          "id": 5,
          "locationName": "London Depot",
          "city": "London",
          "country": "United Kingdom"
        },
        "country": "United Kingdom"
      },
      "listing": {
        "id": 123,
        "materialType": "plastic",
        "materialItem": "PET bottles",
        "materialPacking": "baled",
        "weightPerLoad": 25,
        "guidePrice": 500,
        "currency": "gbp",
        "pern": 15
      },
      "haulageOffersCount": 2,
      "hasAcceptedHaulageOffer": true,
      "acceptedHaulageOfferId": 456
    }
  ],
  "totalCount": 156,
  "skip": 0,
  "limit": 20
}
```

### Filter by Buyer
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/offers/admin?filter=%7B%22where%22%3A%7B%22buyerName%22%3A%22John%22%7D%7D' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

### Search by Material
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/offers/admin?filter=%7B%22where%22%3A%7B%22searchTerm%22%3A%22PET%22%7D%7D' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

### Get Offer Details
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/offers/789' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

**Response**:
```json
{
  "status": "success",
  "message": "get-offer-detail",
  "data": {
    "offer": {
      "id": 789,
      "createdAt": "2024-12-10T14:00:00.000Z",
      "quantity": 10,
      "offeredPricePerUnit": 520,
      "totalPrice": 5200,
      "currency": "gbp",
      "status": "approved",
      "state": "active",
      "assignedAdminId": 5,
      "message": "Urgent requirement, can collect immediately",
      "incoterms": "EXW",
      "earliestDeliveryDate": "2024-12-15",
      "latestDeliveryDate": "2024-12-25"
    },
    "buyer": {
      "companyId": 20,
      "companyName": "Buyer Corp Ltd",
      "country": "United Kingdom",
      "user": {
        "firstName": "John",
        "lastName": "Buyer"
      },
      "location": {
        "id": 8,
        "addressLine": "Unit 5 Industrial Estate",
        "city": "Manchester",
        "country": "United Kingdom",
        "postcode": "M1 1AA",
        "containerType": ["20ft", "40ft"]
      },
      "loadingTimes": {
        "openTime": "08:00",
        "closeTime": "18:00"
      },
      "siteRestrictions": "Booking required 24h advance"
    },
    "seller": {
      "companyId": 15,
      "companyName": "Recycling Ltd",
      "country": "United Kingdom",
      "user": {
        "firstName": "Jane",
        "lastName": "Seller"
      },
      "location": {
        "id": 5,
        "addressLine": "123 Waste Road",
        "city": "London",
        "country": "United Kingdom",
        "postcode": "E1 6AN",
        "containerType": ["40ft_hc"]
      },
      "loadingTimes": {
        "openTime": "07:00",
        "closeTime": "17:00"
      },
      "averageWeightPerLoad": 25
    },
    "listing": {
      "id": 123,
      "title": "High Quality PET Bottles",
      "materialType": "plastic",
      "materialItem": "PET bottles",
      "materialPacking": "baled",
      "materialGrading": "grade_a",
      "materialColor": "clear",
      "weightPerLoad": 25,
      "quantity": 100,
      "remainingQuantity": 90,
      "pricePerMetricTonne": 500,
      "pern": 15,
      "documents": [
        {
          "id": 1,
          "documentUrl": "https://s3.amazonaws.com/doc1.pdf",
          "documentTitle": "Material Certificate"
        }
      ]
    }
  }
}
```

## Error Responses

| Status | Error | When |
|--------|-------|------|
| 401 | Unauthorized | No JWT token or invalid |
| 403 | Forbidden | User not admin and not offer participant |
| 404 | Offer not found | Invalid offer ID |

## Notes

- Use `POST /admin/assign` with `recordType: "offer"` to assign admin
- Use `POST /admin/notes` with `recordType: "offer"` to add notes
- Use `GET /admin/my-assigned?recordType=offer` to fetch assigned offers
- **Haulage Integration**: The 3 haulage fields (`haulageOffersCount`, `hasAcceptedHaulageOffer`, `acceptedHaulageOfferId`) are only available in admin API (`GET /offers/admin`). User APIs do NOT include these fields.
- See [OFFER_HAULAGE_INTEGRATION.md](../Work%20Package%201/OFFER_HAULAGE_INTEGRATION.md) for detailed haulage integration documentation
