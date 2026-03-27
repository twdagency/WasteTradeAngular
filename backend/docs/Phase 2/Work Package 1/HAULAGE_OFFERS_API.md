# Haulage Offers API Documentation

This document provides comprehensive API documentation for the Phase 2 Haulage Platform features.

## Table of Contents

1. [Haulage Offers](#haulage-offers)
2. [Haulier Profile](#haulier-profile)
3. [Data Models](#data-models)
4. [Error Handling](#error-handling)

---

## Haulage Offers

### 1. Create Haulage Offer

**Endpoint:** `POST /haulage-offers`

**Description:** Create a new haulage offer on an existing buyer offer. Only approved hauliers can make offers.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "offerId": 123,
  "trailerContainerType": "curtain_sider",
  "completingCustomsClearance": false,
  "haulageCostPerLoad": 500.00,
  "quantityPerLoad": 25.5,
  "currency": "gbp",
  "transportProvider": "own_haulage",
  "suggestedCollectionDate": "2025-12-01",
  "expectedTransitTime": "2-3",
  "demurrageAtDestination": 21,
  "notes": "Optional notes about the haulage offer"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| offerId | number | Yes | ID of the buyer's offer to bid on |
| trailerContainerType | string | Yes | One of: `curtain_sider`, `containers`, `tipper_trucks`, `walking_floor`. Must be in haulier's profile |
| completingCustomsClearance | boolean | No | Default: false. If false, customs fee is added (£200 GBP / €230 EUR / $250 USD) |
| haulageCostPerLoad | number | Yes | Cost per load. Numeric with max 12 digits, 2 decimal places |
| quantityPerLoad | number | No | Quantity per load (e.g., weight per load). If omitted, uses listing's `weightPerLoad` |
| currency | string | Yes | One of: `gbp`, `eur`, `usd` |
| transportProvider | string | Yes | One of: `own_haulage`, `third_party`, `mixed` |
| suggestedCollectionDate | string | Yes | Date in YYYY-MM-DD format, must be within buyer's delivery window |
| expectedTransitTime | string | Yes | One of: `1`, `2-3`, `4-5`, `6-7`, `8-10`, `11-14` (days) |
| demurrageAtDestination | number | Yes | Minimum 21 days (must be > 20) |
| notes | string | No | Max 32000 characters. No phone numbers, emails, or URLs |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Haulage offer created successfully",
  "data": {
    "id": 456,
    "offerId": 123,
    "haulierCompanyId": 789,
    "haulierUserId": 101,
    "trailerContainerType": "curtain_sider",
    "completingCustomsClearance": false,
    "numberOfLoads": 10,
    "quantityPerLoad": 25.5,
    "haulageCostPerLoad": 500.00,
    "currency": "gbp",
    "customsFee": 200.00,
    "haulageTotal": 5200.00,
    "transportProvider": "own_haulage",
    "suggestedCollectionDate": "2025-12-01T00:00:00.000Z",
    "expectedTransitTime": "2-3",
    "demurrageAtDestination": 21,
    "notes": "Optional notes",
    "status": "pending",
    "isSyncedSalesForce": false,
    "lastSyncedSalesForceDate": null,
    "salesforceId": null,
    "createdAt": "2025-11-03T00:00:00.000Z",
    "updatedAt": "2025-11-03T00:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message | Description |
|--------|---------|-------------|
| 403 | Only hauliers can make haulage offers | User's company is not a haulier |
| 403 | Your account is being verified by an administrator. You will be unable to make an offer until approved. | Haulier is not approved yet |
| 404 | Offer not found | Invalid offerId |
| 400 | Suggested collection date must be within the buyer delivery window | Date outside allowed range |
| 400 | Demurrage must be at least 21 days | Invalid demurrage value |
| 400 | Selected container type is not associated with your haulier profile | Container type not in haulier's profile |

**cURL Example:**
```bash
curl -X POST https://wastetrade-api-dev.b13devops.com/haulage-offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "offerId": 123,
    "trailerContainerType": "curtain_sider",
    "completingCustomsClearance": false,
    "haulageCostPerLoad": 500.00,
    "quantityPerLoad": 25.5,
    "currency": "gbp",
    "transportProvider": "own_haulage",
    "suggestedCollectionDate": "2025-12-01",
    "expectedTransitTime": "2-3",
    "demurrageAtDestination": 21
  }'
```

---

### 2. Get My Haulage Offers

**Endpoint:** `GET /haulage-offers`

**Description:** Retrieve all haulage offers made by the current haulier.

**Authentication:** Required (JWT)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| filter | object | LoopBack filter object for filtering, sorting, pagination |

**Filter Examples:**
```
# Get only pending offers
?filter={"where":{"status":"pending"}}

# Get with pagination
?filter={"limit":10,"skip":0}

# Sort by creation date descending
?filter={"order":"createdAt DESC"}

# Filter by status and sort
?filter={"where":{"status":"accepted"},"order":"createdAt DESC"}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Haulage offers retrieved successfully",
  "data": {
    "results": [
      {
        "id": 456,
        "offerId": 123,
        "haulierCompanyId": 789,
        "haulierUserId": 101,
        "trailerContainerType": "curtain_sider",
        "completingCustomsClearance": false,
        "numberOfLoads": 10,
        "quantityPerLoad": 25.5,
        "haulageCostPerLoad": 500.00,
        "currency": "gbp",
        "customsFee": 200.00,
        "haulageTotal": 5200.00,
        "transportProvider": "own_haulage",
        "suggestedCollectionDate": "2025-12-01T00:00:00.000Z",
        "expectedTransitTime": "2-3",
        "demurrageAtDestination": 21,
        "notes": "Optional notes",
        "status": "pending",
        "createdAt": "2025-11-03T00:00:00.000Z",
        "updatedAt": "2025-11-03T00:00:00.000Z",
        "materialName": "Non-Ferrous-Stainless Steel 304",
        "materialType": "plastic",
        "materialItem": "bopp",
        "materialPacking": "bales",
        "seller": {
          "companyId": 111,
          "companyName": "Seller Company Ltd",
          "country": "United Kingdom",
          "location": {
            "id": 333,
            "addressLine": "123 Seller Street",
            "city": "London",
            "country": "United Kingdom",
            "postcode": "SW1A 1AA"
          }
        },
        "buyer": {
          "companyId": 222,
          "companyName": "Buyer Company Ltd",
          "country": "Germany",
          "location": {
            "id": 444,
            "addressLine": "456 Buyer Street",
            "city": "Berlin",
            "country": "Germany",
            "postcode": "10115"
          }
        },
        "numOfLoadBidOn": 10,
        "desiredDeliveryWindow": "11/15/2025 - 12/15/2025"
      }
    ],
    "totalCount": 25
  }
}
```

**cURL Example:**
```bash
curl -X GET "https://wastetrade-api-dev.b13devops.com/haulage-offers?filter=%7B%22order%22%3A%22createdAt%20DESC%22%7D" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Get Haulage Offer Details

**Endpoint:** `GET /haulage-offers/{id}`

**Description:** Retrieve detailed information about a specific haulage offer, including seller and buyer details.

**Authentication:** Required (JWT)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Haulage offer ID |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "offerId": 123,
    "haulierCompanyId": 789,
    "haulierUserId": 101,
    "trailerContainerType": "curtain_sider",
    "completingCustomsClearance": false,
    "numberOfLoads": 10,
    "quantityPerLoad": 25.5,
    "haulageCostPerLoad": 500.00,
    "currency": "gbp",
    "customsFee": 200.00,
    "haulageTotal": 5200.00,
    "transportProvider": "own_haulage",
    "suggestedCollectionDate": "2025-12-01T00:00:00.000Z",
    "expectedTransitTime": "2-3",
    "demurrageAtDestination": 21,
    "notes": "Optional notes",
    "status": "pending",
    "createdAt": "2025-11-03T00:00:00.000Z",
    "updatedAt": "2025-11-03T00:00:00.000Z",
    "materialName": "Non-Ferrous-Stainless Steel 304",
    "material": {
      "type": "plastic",
      "item": "bopp",
      "form": "bags",
      "grading": "46",
      "color": "blue",
      "finishing": "flakes",
      "packing": "bales",
      "weightPerUnit": 25.5,
      "wasteStoration": "indoor"
    },
    "listing": {
      "id": 999,
      "title": "BOPP Plastic Bales"
    },
    "seller": {
      "userId": 15,
      "username": "12345678",
      "companyId": 111,
      "companyName": "Seller Company Ltd",
      "country": "United Kingdom",
      "addressLine1": "123 Main Street",
      "city": "London",
      "postalCode": "SW1A 1AA",
      "loadingTimes": {
        "openTime": "13:00:00",
        "closeTime": "14:00:00"
      },
      "siteRestrictions": "Height restriction: 4.5m max",
      "averageWeightPerLoad": 2.5,
      "location": {
        "id": 333,
        "addressLine": "123 Seller Street",
        "street": "Seller Road",
        "city": "London",
        "country": "United Kingdom",
        "postcode": "SW1A 1AA",
        "stateProvince": "Greater London",
        "containerType": "shipping_container"
      }
    },
    "buyer": {
      "userId": 199,
      "username": "87654321",
      "companyId": 222,
      "companyName": "Buyer Company Ltd",
      "country": "Germany",
      "addressLine1": "456 Main Avenue",
      "city": "Berlin",
      "postalCode": "10115",
      "loadingTimes": {
        "openTime": "12:00:00",
        "closeTime": "13:00:00"
      },
      "siteRestrictions": "Advance booking required 24h",
      "location": {
        "id": 444,
        "addressLine": "456 Buyer Street",
        "street": "Buyer Avenue",
        "city": "Berlin",
        "country": "Germany",
        "postcode": "10115",
        "stateProvince": "Berlin",
        "containerType": "shipping_container"
      }
    },
    "offer": {
      "id": 123,
      "quantity": 10,
      "earliestDeliveryDate": "2025-11-15T00:00:00.000Z",
      "latestDeliveryDate": "2025-12-15T00:00:00.000Z",
      "offeredPricePerUnit": 450.00,
      "currency": "gbp",
      "totalPrice": 4500.00,
      "incoterms": "EXW"
    },
    "numOfLoadBidOn": 10,
    "desiredDeliveryWindow": "11/15/2025 - 12/15/2025"
  }
}
```

**Response Fields:**

**Buyer Object:**
| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `userId` | number | `offers.buyer_user_id` | Buyer user ID |
| `username` | string | `users.username` | Buyer username |
| `companyId` | number | `offers.buyer_company_id` | Buyer company ID |
| `companyName` | string | `companies.name` | Buyer company name |
| `country` | string | `companies.country` | Buyer company country |
| `addressLine1` | string | `companies.address_line_1` | Buyer company address |
| `city` | string | `companies.city` | Buyer company city |
| `postalCode` | string | `companies.postal_code` | Buyer company postal code |
| `loadingTimes` | object\|null | `company_locations` | Office hours (if location exists) |
| `loadingTimes.openTime` | string | `company_locations.office_open_time` | Office opening time (HH:mm:ss) |
| `loadingTimes.closeTime` | string | `company_locations.office_close_time` | Office closing time (HH:mm:ss) |
| `siteRestrictions` | string\|null | `company_locations.access_restrictions` | Site access restrictions |
| `location` | object\|null | `company_locations` | Full location details (if exists) |

**Seller Object:**
| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `userId` | number | `offers.seller_user_id` | Seller user ID |
| `username` | string | `users.username` | Seller username |
| `companyId` | number | `offers.seller_company_id` | Seller company ID |
| `companyName` | string | `companies.name` | Seller company name |
| `country` | string | `companies.country` | Seller company country |
| `addressLine1` | string | `companies.address_line_1` | Seller company address |
| `city` | string | `companies.city` | Seller company city |
| `postalCode` | string | `companies.postal_code` | Seller company postal code |
| `loadingTimes` | object\|null | `company_locations` | Office hours (if location exists) |
| `loadingTimes.openTime` | string | `company_locations.office_open_time` | Office opening time (HH:mm:ss) |
| `loadingTimes.closeTime` | string | `company_locations.office_close_time` | Office closing time (HH:mm:ss) |
| `siteRestrictions` | string\|null | `company_locations.access_restrictions` | Site access restrictions |
| `averageWeightPerLoad` | number\|null | `listings.weight_per_load` | Average weight per load from listing |
| `location` | object\|null | `company_locations` | Full location details (if exists) |

**Offer Object:**
| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `id` | number | `offers.id` | Offer ID |
| `quantity` | number | `offers.quantity` | Quantity in the offer |
| `earliestDeliveryDate` | date | `offers.earliest_delivery_date` | Earliest delivery date |
| `latestDeliveryDate` | date | `offers.latest_delivery_date` | Latest delivery date |
| `offeredPricePerUnit` | number | `offers.offered_price_per_unit` | Price per unit |
| `currency` | string | `offers.currency` | Currency code (gbp, eur, usd) |
| `totalPrice` | number | `offers.total_price` | Total price |
| `incoterms` | string\|null | `offers.incoterms` | Incoterms (EXW, FCA, FOB, etc.) |

**Frontend Integration Examples:**

```typescript
// Display loading times
if (data.seller.loadingTimes) {
  const openTime = data.seller.loadingTimes.openTime; // "13:00:00"
  const closeTime = data.seller.loadingTimes.closeTime; // "14:00:00"
  console.log(`Loading Times: ${openTime.slice(0, 5)} - ${closeTime.slice(0, 5)}`);
  // Output: "Loading Times: 13:00 - 14:00"
}

// Display site restrictions
if (data.buyer.siteRestrictions) {
  console.log(`Site Restrictions: ${data.buyer.siteRestrictions}`);
} else {
  console.log('Site Restrictions: None');
}

// Display average weight per load (seller only)
if (data.seller.averageWeightPerLoad) {
  console.log(`Average Weight Per Load: ${data.seller.averageWeightPerLoad} MT`);
}
```

**Error Responses:**

| Status | Message | Description |
|--------|---------|-------------|
| 403 | You can only view your own haulage offers | Attempting to view another haulier's offer |
| 404 | Entity not found | Invalid haulage offer ID |

**cURL Example:**
```bash
curl -X GET https://wastetrade-api-dev.b13devops.com/haulage-offers/456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Update Haulage Offer

**Endpoint:** `PATCH /haulage-offers/{id}`

**Description:** Update a pending haulage offer. Only pending offers can be updated.

**Authentication:** Required (JWT)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Haulage offer ID |

**Request Body (all fields optional):**
```json
{
  "trailerContainerType": "containers",
  "completingCustomsClearance": true,
  "haulageCostPerLoad": 550.00,
  "currency": "eur",
  "transportProvider": "mixed",
  "suggestedCollectionDate": "2025-12-05",
  "expectedTransitTime": "4-5",
  "demurrageAtDestination": 25,
  "notes": "Updated notes"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Haulage offer updated successfully",
  "data": {
    "id": 456,
    "offerId": 123,
    "trailerContainerType": "containers",
    "completingCustomsClearance": true,
    "haulageCostPerLoad": 550.00,
    "currency": "eur",
    "customsFee": 0.00,
    "haulageTotal": 5500.00,
    "transportProvider": "mixed",
    "suggestedCollectionDate": "2025-12-05T00:00:00.000Z",
    "expectedTransitTime": "4-5",
    "demurrageAtDestination": 25,
    "notes": "Updated notes",
    "status": "pending",
    "isSyncedSalesForce": false,
    "lastSyncedSalesForceDate": null,
    "salesforceId": null,
    "updatedAt": "2025-11-03T01:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message | Description |
|--------|---------|-------------|
| 403 | You can only update your own haulage offers | Attempting to update another haulier's offer |
| 400 | Can only update pending haulage offers | Offer status is not pending |
| 400 | Demurrage must be at least 21 days | Invalid demurrage value |

**cURL Example:**
```bash
curl -X PATCH https://wastetrade-api-dev.b13devops.com/haulage-offers/456 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "haulageCostPerLoad": 550.00,
    "notes": "Updated pricing"
  }'
```

---

### 5. Withdraw Haulage Offer

**Endpoint:** `DELETE /haulage-offers/{id}/withdraw`

**Description:** Withdraw a haulage offer. Cannot withdraw accepted offers.

**Authentication:** Required (JWT)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Haulage offer ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Haulage offer withdrawn successfully",
  "data": {
    "id": 456,
    "offerId": 123,
    "haulierCompanyId": 789,
    "haulierUserId": 101,
    "trailerContainerType": "curtain_sider",
    "completingCustomsClearance": false,
    "numberOfLoads": 10,
    "quantityPerLoad": 25.5,
    "haulageCostPerLoad": 500.00,
    "currency": "gbp",
    "customsFee": 200.00,
    "haulageTotal": 5200.00,
    "transportProvider": "own_haulage",
    "suggestedCollectionDate": "2025-12-01T00:00:00.000Z",
    "expectedTransitTime": "2-3",
    "demurrageAtDestination": 21,
    "notes": "Optional notes",
    "status": "withdrawn",
    "isSyncedSalesForce": false,
    "lastSyncedSalesForceDate": null,
    "salesforceId": null,
    "createdAt": "2025-11-03T00:00:00.000Z",
    "updatedAt": "2025-11-03T02:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message | Description |
|--------|---------|-------------|
| 403 | You can only withdraw your own haulage offers | Attempting to withdraw another haulier's offer |
| 400 | Cannot withdraw an offer that has already been accepted. Please contact support@wastetrade.com | Offer is already accepted |

**cURL Example:**
```bash
curl -X DELETE https://wastetrade-api-dev.b13devops.com/haulage-offers/456/withdraw \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Haulier Profile

### 6. Get Haulier Profile

**Endpoint:** `GET /haulier/profile`

**Description:** Retrieve the current haulier's profile information.

**Authentication:** Required (JWT)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accountId": 101,
    "prefix": "Mr.",
    "firstName": "John",
    "lastName": "Smith",
    "jobTitle": "Transport Manager",
    "email": "john.smith@haulier.com",
    "phoneNumber": "+441234567890",
    "companyName": "Smith Haulage Ltd",
    "vatRegistrationCountry": "United Kingdom",
    "vatNumber": "GB123456789",
    "registrationNumber": "12345678",
    "addressLine1": "123 Transport Way",
    "addressLine2": "Industrial Estate",
    "postalCode": "AB12 3CD",
    "city": "London",
    "stateProvince": "Greater London",
    "country": "United Kingdom",
    "companyPhoneNumber": "+441234567890",
    "companyMobileNumber": "+447123456789",
    "fleetType": "own_fleet",
    "areasCovered": ["uk_only", "france", "germany"],
    "containerTypes": ["curtain_sider", "containers"],
    "wasteCarrierLicense": [
      {
        "fileName": "waste_carrier_license.pdf",
        "expiryDate": "2026-12-31T00:00:00.000Z",
        "documentUrl": "https://s3.amazonaws.com/..."
      }
    ],
    "facebookUrl": "https://facebook.com/smithhaulage",
    "instagramUrl": "https://instagram.com/smithhaulage",
    "linkedinUrl": "https://linkedin.com/company/smithhaulage",
    "xUrl": "smithhaulage",
    "status": "active"
  }
}
```

**Error Responses:**

| Status | Message | Description |
|--------|---------|-------------|
| 403 | Only hauliers can access this endpoint | User's company is not a haulier |

**cURL Example:**
```bash
curl -X GET https://wastetrade-api-dev.b13devops.com/haulier/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 7. Upload File (For License Documents)

**Endpoint:** `POST /upload-file`

**Description:** Upload a file to S3 storage. Use this endpoint to upload waste carrier license documents before updating the haulier profile.

**Authentication:** Required (JWT)

**Content-Type:** `multipart/form-data`

**Request:**
- Form field name: `file`
- Supported formats: PDF, JPG, JPEG, PNG

**Success Response (200):**
```json
"https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/uploads/waste_carrier_license.pdf"
```

**cURL Example:**
```bash
curl -X POST https://wastetrade-api-dev.b13devops.com/upload-file \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@waste_carrier_license.pdf"
```

---

### 8. Update Haulier Profile

**Endpoint:** `PATCH /haulier/profile`

**Description:** Update the current haulier's profile information including waste carrier license documents.

**Authentication:** Required (JWT)

**Note:** To update license documents, first upload the file using `POST /upload-file`, then use the returned URL in this endpoint.

**Request Body (all fields optional):**
```json
{
  "prefix": "Mr.",
  "firstName": "John",
  "lastName": "Smith",
  "jobTitle": "Transport Manager",
  "phoneNumber": "+441234567890",
  "email": "john.smith@haulier.com",
  "companyName": "Smith Haulage Ltd",
  "vatRegistrationCountry": "United Kingdom",
  "vatNumber": "GB123456789",
  "registrationNumber": "12345678",
  "addressLine1": "123 Transport Way",
  "addressLine2": "Industrial Estate",
  "postalCode": "AB12 3CD",
  "city": "London",
  "stateProvince": "Greater London",
  "country": "United Kingdom",
  "companyPhoneNumber": "+441234567890",
  "companyMobileNumber": "+447123456789",
  "fleetType": "own_fleet",
  "areasCovered": ["uk_only", "france", "germany"],
  "containerTypes": ["curtain_sider", "containers"],
  "wasteCarrierLicense": [
    {
      "fileName": "waste_carrier_license_updated.pdf",
      "documentUrl": "https://s3.amazonaws.com/bucket/license.pdf",
      "expiryDate": "2027-12-31T00:00:00.000Z"
    }
  ],
  "facebookUrl": "https://facebook.com/smithhaulage",
  "instagramUrl": "https://instagram.com/smithhaulage",
  "linkedinUrl": "https://linkedin.com/company/smithhaulage",
  "xUrl": "smithhaulage"
}
```

**Request Body Fields:**

| Field | Type | Description |
|-------|------|-------------|
| prefix | string | Title prefix (Mr., Mrs., Ms., Dr., etc.) |
| firstName | string | First name |
| lastName | string | Last name |
| jobTitle | string | Job title/position |
| phoneNumber | string | Contact phone number |
| email | string | Email address |
| companyName | string | Company name |
| vatRegistrationCountry | string | VAT registration country |
| vatNumber | string | VAT number |
| registrationNumber | string | Company registration number |
| addressLine1 | string | Address line 1 |
| addressLine2 | string | Address line 2 |
| postalCode | string | Postal/ZIP code |
| city | string | City |
| stateProvince | string | State or province |
| country | string | Country |
| companyPhoneNumber | string | Company phone number |
| companyMobileNumber | string | Company mobile number |
| fleetType | string | Fleet type: `freight_forwarder` or `own_fleet` |
| areasCovered | array | Array of coverage areas (e.g., `uk_only`, `france`, `germany`) |
| containerTypes | array | Array of container types: `curtain_sider`, `containers`, `tipper_trucks`, `walking_floor` |
| wasteCarrierLicense | array | Array of waste carrier license documents (see below) |
| facebookUrl | string | Facebook profile URL |
| instagramUrl | string | Instagram profile URL |
| linkedinUrl | string | LinkedIn profile URL |
| xUrl | string | X (Twitter) handle |

**Waste Carrier License Object:**
```json
{
  "fileName": "string",
  "documentUrl": "string",
  "expiryDate": "string (ISO 8601 date-time)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Error Responses:**

| Status | Message | Description |
|--------|---------|-------------|
| 403 | Only hauliers can access this endpoint | User's company is not a haulier |

**cURL Examples:**

#### Update Basic Profile Information
```bash
curl -X PATCH https://wastetrade-api-dev.b13devops.com/haulier/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "jobTitle": "Senior Transport Manager",
    "companyMobileNumber": "+447987654321"
  }'
```

#### Complete Workflow: Upload File + Update License

**Step 1: Upload the license file**
```bash
curl -X POST https://wastetrade-api-dev.b13devops.com/upload-file \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@waste_carrier_license_2024.pdf"

# Response: "https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/uploads/waste_carrier_license_2024.pdf"
```

**Step 2: Update profile with the uploaded file URL**
```bash
curl -X PATCH https://wastetrade-api-dev.b13devops.com/haulier/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "wasteCarrierLicense": [
      {
        "fileName": "waste_carrier_license_2024.pdf",
        "documentUrl": "https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/uploads/waste_carrier_license_2024.pdf",
        "expiryDate": "2027-12-31T00:00:00.000Z"
      }
    ]
  }'
```

#### Update Multiple Fields Including License
```bash
curl -X PATCH https://wastetrade-api-dev.b13devops.com/haulier/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "jobTitle": "Senior Transport Manager",
    "containerTypes": ["curtain_sider", "containers", "walking_floor"],
    "wasteCarrierLicense": [
      {
        "fileName": "waste_carrier_license_2024.pdf",
        "documentUrl": "https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/uploads/waste_carrier_license_2024.pdf",
        "expiryDate": "2027-12-31T00:00:00.000Z"
      }
    ]
  }'
```

---

## Data Models

### HaulageOffer

```typescript
{
  id: number;
  offerId: number;
  haulierCompanyId: number;
  haulierUserId: number;
  trailerContainerType: 'curtain_sider' | 'containers' | 'tipper_trucks' | 'walking_floor';
  completingCustomsClearance: boolean;
  numberOfLoads: number;
  quantityPerLoad: number;
  haulageCostPerLoad: number;
  currency: 'gbp' | 'eur' | 'usd';
  customsFee: number;
  haulageTotal: number;
  transportProvider: 'own_haulage' | 'third_party' | 'mixed';
  suggestedCollectionDate: Date;
  expectedTransitTime: '1' | '2-3' | '4-5' | '6-7' | '8-10' | '11-14';
  demurrageAtDestination: number;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  rejectionReason?: string;
  customRejectionReason?: string;
  adminMessage?: string;
  shippedLoads?: number;
  shippedDate?: Date;
  // Salesforce sync fields
  destinationCharges?: string;
  haulageExtras?: string;
  soDetails?: string;
  isSyncedSalesForce: boolean;
  lastSyncedSalesForceDate?: Date;
  salesforceId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Enums

**HaulageOfferStatus:**
- `pending` - Awaiting admin review
- `accepted` - Accepted by admin/buyer
- `rejected` - Rejected by admin/buyer
- `withdrawn` - Withdrawn by haulier

**TrailerContainerType:**
- `curtain_sider` - Curtain Sider
- `containers` - Containers
- `tipper_trucks` - Tipper Trucks
- `walking_floor` - Walking Floor

**TransportProvider:**
- `own_haulage` - Own Haulage
- `third_party` - Third Party
- `mixed` - Mixed

**ExpectedTransitTime:**
- `1` - 1 day
- `2-3` - 2-3 days
- `4-5` - 4-5 days
- `6-7` - 6-7 days
- `8-10` - 8-10 days
- `11-14` - 11-14 days

**Currency:**
- `gbp` - British Pound
- `eur` - Euro
- `usd` - US Dollar

**FleetType:**
- `freight_forwarder` - Freight Forwarder
- `own_fleet` - Own Fleet

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": {
    "statusCode": 400,
    "name": "BadRequestError",
    "message": "Error message here"
  }
}
```

### Common HTTP Status Codes

| Code | Name | Description |
|------|------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

### Validation Errors

When validation fails, the API returns detailed error messages:

```json
{
  "error": {
    "statusCode": 400,
    "name": "ValidationError",
    "message": "Some required information is missing. Please complete the highlighted fields.",
    "details": {
      "demurrageAtDestination": "Demurrage must be at least 21 days",
      "suggestedCollectionDate": "Date must be within buyer's delivery window"
    }
  }
}
```

---

## Frontend Integration Guide

### Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```javascript
const headers = {
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json'
};
```

### Making an Offer Flow

1. **Check Haulier Status**: Verify haulier is approved before showing "Make an Offer" button
2. **Fetch Offer Details**: Get buyer's offer details including delivery window
3. **Validate Container Types**: Disable container types not in haulier's profile
4. **Calculate Totals**: 
   - Haulage Total = (Cost per Load × Number of Loads) + Customs Fee
   - Customs Fee = £200 GBP / €230 EUR / $250 USD if not completing customs clearance, otherwise £0
5. **Validate Date**: Ensure suggested collection date is within buyer's delivery window
6. **Submit Offer**: POST to `/haulage-offers`

### Viewing Offers Flow

1. **List Offers**: GET `/haulage-offers` with filters for status
2. **View Details**: GET `/haulage-offers/{id}` for full details
3. **Show Status Badge**: Display offer status (Pending, Accepted, Rejected, Withdrawn)

### Editing Offers Flow

1. **Check Status**: Only allow editing if status is "pending"
2. **Pre-fill Form**: Load existing offer data
3. **Recalculate Totals**: Update totals when cost or customs clearance changes
4. **Submit Update**: PATCH `/haulage-offers/{id}`

### Profile Management Flow

1. **Load Profile**: GET `/haulier/profile`
2. **Show Incomplete Fields**: Display red exclamation mark for empty fields
3. **Validate Changes**: Check required fields before submission
4. **Submit Updates**: PATCH `/haulier/profile`

---

## Testing Examples

### Test Scenario 1: Create Haulage Offer

```bash
# 1. Login as haulier
curl -X POST https://wastetrade-api-dev.b13devops.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"haulier@test.com","password":"password123"}'

# 2. Create haulage offer
curl -X POST https://wastetrade-api-dev.b13devops.com/haulage-offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_FROM_STEP_1" \
  -d '{
    "offerId": 1,
    "trailerContainerType": "curtain_sider",
    "completingCustomsClearance": false,
    "haulageCostPerLoad": 500,
    "currency": "gbp",
    "transportProvider": "own_haulage",
    "suggestedCollectionDate": "2025-12-01",
    "expectedTransitTime": "2-3",
    "demurrageAtDestination": 21
  }'
```

### Test Scenario 2: View and Update Offer

```bash
# 1. Get all offers
curl -X GET https://wastetrade-api-dev.b13devops.com/haulage-offers \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Get specific offer details
curl -X GET https://wastetrade-api-dev.b13devops.com/haulage-offers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Update offer
curl -X PATCH https://wastetrade-api-dev.b13devops.com/haulage-offers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"haulageCostPerLoad": 550}'
```

### Test Scenario 3: Profile Management

```bash
# 1. Get profile
curl -X GET https://wastetrade-api-dev.b13devops.com/haulier/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Update profile
curl -X PATCH https://wastetrade-api-dev.b13devops.com/haulier/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jobTitle": "Senior Transport Manager",
    "containerTypes": ["curtain_sider", "containers", "walking_floor"]
  }'
```

---

---

## Buyer Offers API

### 9. Get Offer Details

**Endpoint:** `GET /offers/{id}`

**Description:** Retrieve detailed information about a specific buyer offer, including comprehensive seller and buyer details with locations.

**Authentication:** Required (JWT)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Offer ID |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "get-offer-detail",
  "data": {
    "offer": {
      "id": 123,
      "createdAt": "2025-11-01T00:00:00.000Z",
      "quantity": 10,
      "offeredPricePerUnit": 450.00,
      "totalPrice": 4500.00,
      "status": "approved",
      "state": "active",
      "expiresAt": "2025-12-01T00:00:00.000Z",
      "earliestDeliveryDate": "2025-11-15T00:00:00.000Z",
      "latestDeliveryDate": "2025-12-15T00:00:00.000Z",
      "currency": "gbp",
      "originalCurrency": "gbp",
      "message": "Interested in purchasing",
      "rejectionReason": null,
      "incoterms": "EXW",
      "shippingPort": "Port of London",
      "needsTransport": true,
      "listingId": 999,
      "buyerCompanyId": 222,
      "buyerLocationId": 444,
      "buyerUserId": 555,
      "buyerCountry": "Germany",
      "sellerCompanyId": 111,
      "sellerLocationId": 333,
      "sellerUserId": 666,
      "sellerCountry": "United Kingdom",
      "acceptedByUserId": null,
      "rejectedByUserId": null,
      "createdByUserId": 555,
      "updatedAt": "2025-11-01T00:00:00.000Z",
      "sellerTotalAmount": 4500.00
    },
    "listing": {
      "id": 999,
      "title": "BOPP Plastic Bales",
      "status": "active",
      "materialWeightPerUnit": 25.5,
      "materialWeightWanted": 255.0,
      "quantity": 100,
      "remainingQuantity": 90,
      "materialPacking": "bales",
      "state": "active",
      "materialType": "plastic",
      "materialItem": "bopp",
      "materialFinishing": "flakes",
      "materialForm": "bags",
      "numberOfOffers": 5,
      "bestOffer": 460.00,
      "bestOfferCurrency": "gbp",
      "originalBestOfferCurrency": "gbp",
      "documents": [],
      "location": {
        "addressLine": "123 Seller Street",
        "street": "Seller Road",
        "postcode": "SW1A 1AA",
        "city": "London",
        "country": "United Kingdom",
        "stateProvince": "Greater London"
      }
    },
    "seller": {
      "companyId": 111,
      "companyName": "Seller Company Ltd",
      "country": "United Kingdom",
      "company": {
        "status": "active",
        "addressLine1": "123 Main Street",
        "addressLine2": "Suite 100",
        "city": "London",
        "stateProvince": "Greater London",
        "postalCode": "SW1A 1AA"
      },
      "user": {
        "username": "seller_user",
        "firstName": "John",
        "lastName": "Seller"
      },
      "loadingTimes": {
        "openTime": "08:00:00",
        "closeTime": "17:00:00"
      },
      "siteRestrictions": "Height restriction: 4.5m max",
      "averageWeightPerLoad": 2.5,
      "location": {
        "id": 333,
        "addressLine": "123 Seller Street",
        "street": "Seller Road",
        "city": "London",
        "country": "United Kingdom",
        "postcode": "SW1A 1AA",
        "stateProvince": "Greater London",
        "containerType": "shipping_container"
      }
    },
    "buyer": {
      "companyId": 222,
      "companyName": "Buyer Company Ltd",
      "country": "Germany",
      "company": {
        "status": "active",
        "addressLine1": "456 Main Avenue",
        "addressLine2": "Floor 5",
        "city": "Berlin",
        "stateProvince": "Berlin",
        "postalCode": "10115"
      },
      "user": {
        "username": "buyer_user",
        "firstName": "Jane",
        "lastName": "Buyer"
      },
      "loadingTimes": {
        "openTime": "09:00:00",
        "closeTime": "18:00:00"
      },
      "siteRestrictions": "Advance booking required 24h",
      "location": {
        "id": 444,
        "addressLine": "456 Buyer Street",
        "street": "Buyer Avenue",
        "city": "Berlin",
        "country": "Germany",
        "postcode": "10115",
        "stateProvince": "Berlin",
        "containerType": "curtain_sider"
      }
    }
  }
}
```

**Response Fields:**

**Offer Object:**
- `id` - Offer ID
- `quantity` - Quantity of material in the offer
- `offeredPricePerUnit` - Price per unit offered
- `totalPrice` - Total price for the offer
- `status` - Offer status (pending, approved, accepted, rejected)
- `state` - Offer state (pending, active, closed)
- `earliestDeliveryDate` - Earliest delivery date
- `latestDeliveryDate` - Latest delivery date
- `currency` - Currency code (gbp, eur, usd)
- `incoterms` - Incoterms (EXW, FCA, etc.)
- `needsTransport` - Whether transport is needed

**Seller Object:**
- `companyId` - Seller company ID
- `companyName` - Seller company name
- `country` - Seller company country
- `company` - Company details (status, address, city, postal code)
- `user` - User details (username, firstName, lastName)
- `loadingTimes` - Office hours (openTime, closeTime in HH:mm:ss format)
- `siteRestrictions` - Site access restrictions
- `averageWeightPerLoad` - Average weight per load from listing
- `location` - Pickup location details (address, city, country, postcode, containerType)

**Buyer Object:**
- `companyId` - Buyer company ID
- `companyName` - Buyer company name
- `country` - Buyer company country
- `company` - Company details (status, address, city, postal code)
- `user` - User details (username, firstName, lastName)
- `loadingTimes` - Office hours (openTime, closeTime in HH:mm:ss format)
- `siteRestrictions` - Site access restrictions
- `location` - Delivery location details (address, city, country, postcode, containerType)

**Listing Object:**
- `id` - Listing ID
- `title` - Listing title
- `materialType` - Material type (plastic, metal, etc.)
- `materialItem` - Material item (bopp, pet, etc.)
- `materialPacking` - Packing type (bales, bags, etc.)
- `quantity` - Total quantity available
- `remainingQuantity` - Remaining quantity
- `numberOfOffers` - Number of offers on this listing
- `bestOffer` - Highest offer price
- `location` - Listing location details

**Error Responses:**

| Status | Message | Description |
|--------|---------|-------------|
| 403 | You do not have permission to view this offer | Insufficient permissions |
| 404 | Offer not found | Invalid offer ID |

**cURL Example:**
```bash
curl -X GET https://wastetrade-api-dev.b13devops.com/offers/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Frontend Integration Guide

### ✅ Consistent Field Names (Fixed)

**Haulier Profile GET/PATCH:**
- ✅ `phoneNumber` (not `telephone`)
- ✅ `companyPhoneNumber` (not `companyTelephone`)
- ✅ `companyMobileNumber` (not `companyMobile`)

**Mark as Shipped:**
- ✅ `loadsToMark` (not `shippedLoads`)

### Key Integration Points

**1. Create Haulage Offer Flow:**
```typescript
// Check haulier status first
const profile = await GET('/haulier/profile');
if (profile.data.status !== 'active') {
  showMessage('Account pending approval');
  return;
}

// Create offer
const response = await POST('/haulage-offers', {
  offerId: 123,
  trailerContainerType: 'curtain_sider',
  completingCustomsClearance: false,
  haulageCostPerLoad: 500.00,
  quantityPerLoad: 25.5,
  currency: 'gbp',
  transportProvider: 'own_haulage',
  suggestedCollectionDate: '2025-12-01',
  expectedTransitTime: '2-3',
  demurrageAtDestination: 21
});
```

**2. Update Profile Flow:**
```typescript
// Step 1: Upload license file
const fileUrl = await POST('/upload-file', formData);

// Step 2: Update profile
await PATCH('/haulier/profile', {
  phoneNumber: '+441234567890',  // ✅ Consistent field name
  companyPhoneNumber: '+441234567890',  // ✅ Consistent field name
  companyMobileNumber: '+447123456789',  // ✅ Consistent field name
  wasteCarrierLicense: [{
    fileName: 'license.pdf',
    documentUrl: fileUrl,
    expiryDate: '2027-12-31T00:00:00.000Z'
  }]
});
```

**3. Admin Mark as Shipped:**
```typescript
await PATCH(`/haulage-offers/${id}/mark-shipped`, {
  loadsToMark: 2  // ✅ Correct field name
});
```

### TypeScript Interfaces

```typescript
// Haulier Profile
interface HaulierProfile {
  accountId: number;
  prefix: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phoneNumber: string;  // ✅ Consistent
  companyName: string;
  vatRegistrationCountry: string;  // ✅ Consistent
  vatNumber: string;
  registrationNumber: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  stateProvince: string;
  country: string;
  companyPhoneNumber: string;  // ✅ Consistent
  companyMobileNumber: string;  // ✅ Consistent
  fleetType: 'freight_forwarder' | 'own_fleet';
  areasCovered: string[];
  containerTypes: string[];
  wasteCarrierLicense: Array<{
    fileName: string;
    expiryDate: string;
    documentUrl: string;
  }>;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
  status: string;
}

// Create Haulage Offer
interface CreateHaulageOfferRequest {
  offerId: number;
  trailerContainerType: string;
  completingCustomsClearance?: boolean;
  haulageCostPerLoad: number;
  quantityPerLoad?: number;
  currency: 'gbp' | 'eur' | 'usd';
  transportProvider: 'own_haulage' | 'third_party' | 'mixed';
  suggestedCollectionDate: string;
  expectedTransitTime: '1' | '2-3' | '4-5' | '6-7' | '8-10' | '11-14';
  demurrageAtDestination: number;
  notes?: string;
}

// Mark as Shipped
interface MarkAsShippedRequest {
  loadsToMark: number;  // ✅ Correct field name
}
```

---

## Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
- Currency amounts are stored with 12 digits precision, 2 decimal places
- Customs fee: £200 GBP / €230 EUR / $250 USD (approximate conversions)
- Container types must match those in the haulier's profile
- Demurrage must be at least 21 days (greater than 20)
- Notes field does not allow phone numbers, email addresses, or URLs (max 32000 characters)
- Hauliers must be approved (status: 'active') to create offers
- `numberOfLoads` and `quantityPerLoad` are auto-populated from the buyer's offer
- `customsFee` and `haulageTotal` are auto-calculated by the backend
- **Field names are consistent:** GET response matches PATCH request for haulier profile
- **Mark as Shipped:** Uses `loadsToMark` field (not `shippedLoads`)

---

## Support

For API support or questions, contact: support@wastetrade.com

