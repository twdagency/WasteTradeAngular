# Listing Management API Documentation

This document provides comprehensive API documentation for all listing management endpoints in the WasteTrade platform.

## Terminology

**Important**: WasteTrade has two types of listings:
- **Sales Listings** (`listingType: "sell"`) - Listings where users are SELLING waste materials (offering materials for sale)
- **Wanted Listings** (`listingType: "wanted"`) - Listings where users are BUYING waste materials (requesting materials)

**All endpoints in this document work for BOTH listing types.** The functionality for renewing, editing, marking as sold/fulfilled, and removing listings applies equally to both Sales Listings and Wanted Listings.

## Base URL
```
https://wastetrade-api-dev.b13devops.com
```

## Authentication
All endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Upload Media Files

Before creating a listing, you need to upload images and documents to get their S3 URLs.

### 1.1. Upload Single File (Featured Image)

**Endpoint:** `POST /upload-file`

**Description:** Upload a single file (typically the featured image) to AWS S3 storage. **All images are automatically watermarked** with the WasteTrade logo upon upload (tiled pattern across entire image, rotated -45 degrees, 15% opacity).

**Authentication:** Required (JWT)

**Content-Type:** `multipart/form-data`

**Request:**
- Form field name: `file`
- Accepted file types: jpg, jpeg, png, gif
- Max file size: 25 MB
- Max files: 1

**Success Response (200):**
```json
"https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/uploads/featured_image.jpg"
```

**cURL Example:**
```bash
curl -X POST "https://wastetrade-api-dev.b13devops.com/upload-file" ^
  -H "Authorization: Bearer YOUR_JWT_TOKEN" ^
  -H "Content-Type: multipart/form-data" ^
  -F "file=@featured_image.jpg"
```

---

### 1.2. Upload Multiple Files (Gallery Images)

**Endpoint:** `POST /upload-multiple-files`

**Description:** Upload multiple files (gallery images or documents) to AWS S3 storage. **All image files are automatically watermarked** with the WasteTrade logo upon upload (tiled pattern across entire image, rotated -45 degrees, 15% opacity). Non-image files (PDFs, documents) are uploaded without watermarks.

**Authentication:** Required (JWT)

**Content-Type:** `multipart/form-data`

**Request:**
- Form field name: `file` (multiple)
- Accepted file types: jpg, jpeg, png, pdf, doc, xls, docx, xlsx
- Max file size per file: 25 MB
- Max files: 10

**Success Response (200):**
```json
[
  "https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/uploads/gallery1.jpg",
  "https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/uploads/gallery2.jpg",
  "https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/uploads/gallery3.jpg"
]
```

**cURL Example:**
```bash
curl -X POST "https://wastetrade-api-dev.b13devops.com/upload-multiple-files" ^
  -H "Authorization: Bearer YOUR_JWT_TOKEN" ^
  -H "Content-Type: multipart/form-data" ^
  -F "file=@gallery1.jpg" ^
  -F "file=@gallery2.jpg" ^
  -F "file=@gallery3.jpg"
```

---

### 1.3. Upload Material Specification Data

**Endpoint:** `POST /upload-multiple-files`

**Description:** Upload material specification documents (PDF, DOC, XLS, etc.). Same endpoint as gallery images but with different file types.

**Authentication:** Required (JWT)

**Content-Type:** `multipart/form-data`

**Request:**
- Form field name: `file` (multiple)
- Accepted file types: pdf, doc, xls, docx, xlsx, jpg, jpeg, png
- Max file size per file: 25 MB
- Max files: 6

**Success Response (200):**
```json
[
  "https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/uploads/spec_sheet.pdf",
  "https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/uploads/certificate.pdf"
]
```

**cURL Example:**
```bash
curl -X POST "https://wastetrade-api-dev.b13devops.com/upload-multiple-files" ^
  -H "Authorization: Bearer YOUR_JWT_TOKEN" ^
  -H "Content-Type: multipart/form-data" ^
  -F "file=@spec_sheet.pdf" ^
  -F "file=@certificate.pdf"
```

---

## 2. Create Listing

Creates a new Sales Listing (sell) or Wanted Listing (wanted) with Phase 2 features including ongoing listings, renewal periods, and incoterms.

**Note**: Use `"listingType": "sell"` for Sales Listings or `"listingType": "wanted"` for Wanted Listings.

**Important**: Before creating a listing, upload all media files using the upload endpoints above to get their S3 URLs.

### Endpoint
```
POST /listings
```

### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body Example (Using materialWeight + weightUnit)
```json
{
  "companyId": 28,
  "locationId": 40,
  "materialType": "plastic",
  "materialItem": "bopp",
  "materialForm": "bags",
  "materialGrading": "46",
  "materialColor": "blue",
  "materialFinishing": "flakes",
  "materialPacking": "bales",
  "country": "United Kingdom",
  "listingType": "sell",
  "title": "BOPP Plastic Bales",
  "description": "High quality BOPP plastic",
  "materialWeight": 12000,
  "weightUnit": "kg",
  "numberOfLoads": 6,
  "wasteStoration": "indoor",
  "materialRemainInCountry": false,
  "currency": "usd",
  "pricePerMetricTonne": 500,
  "startDate": "2025-11-04T17:00:00.000Z",
  "listingDuration": "2025-12-05T09:17:02.193Z",
  "incoterms": "FAS",
  "additionalNotes": "Contact for bulk orders",
  "documents": [
    {
      "documentType": "feature_image",
      "documentUrl": "https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/image.jpg"
    },
    {
      "documentType": "gallery_image",
      "documentUrl": "https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/image2.jpg"
    }
  ]
}
```

**Note**: This example uses `materialWeight: 12000` + `weightUnit: "kg"` which will be auto-converted to `totalWeight: 12` Mt (12000 kg ÷ 1000 = 12 Mt).

### Alternative: Request Body Example (Using quantity × materialWeightPerUnit)
```json
{
  "companyId": 28,
  "locationId": 40,
  "materialType": "plastic",
  "materialItem": "bopp",
  "materialForm": "bags",
  "materialGrading": "46",
  "materialColor": "blue",
  "materialFinishing": "flakes",
  "materialPacking": "bales",
  "country": "United Kingdom",
  "listingType": "sell",
  "title": "BOPP Plastic Bales",
  "description": "High quality BOPP plastic",
  "quantity": 6,
  "materialWeightPerUnit": 2,
  "numberOfLoads": 6,
  "wasteStoration": "indoor",
  "materialRemainInCountry": false,
  "currency": "usd",
  "pricePerMetricTonne": 500,
  "startDate": "2025-11-04T17:00:00.000Z",
  "listingDuration": "2025-12-05T09:17:02.193Z",
  "incoterms": "FAS",
  "additionalNotes": "Contact for bulk orders",
  "documents": [
    {
      "documentType": "feature_image",
      "documentUrl": "https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/image.jpg"
    },
    {
      "documentType": "gallery_image",
      "documentUrl": "https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/image2.jpg"
    }
  ]
}
```

**Note**: This example uses `quantity: 6` × `materialWeightPerUnit: 2` which will be auto-calculated to `totalWeight: 12` Mt.

### Request Body Fields

#### Required Fields
| Field | Type | Description |
|-------|------|-------------|
| companyId | number | Company ID creating the listing |
| materialType | string | Type: plastic, efw, fibre, rubber, metal |
| listingType | string | Type: sell, wanted |
| startDate | date | Material availability start date (ISO 8601) |
| documents | array | Array of document objects (feature_image required) |

#### Material Details
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| materialItem | string | No | Material item/subtype (e.g., bopp, pet, hdpe) |
| materialForm | string | No | Material form (for plastic only) |
| materialGrading | string | No | Material grading |
| materialColor | string | No | Material color: blue, green, red, yellow, white, black, clear, mixed, natural, other |
| materialFinishing | string | No | Material finishing: flakes, pellets, granules, powder, regrinds, bales, other |
| materialPacking | string | No | Material packing: bags, bales, boxes, bulk_bags, loose, octabins_gaylords, pallets |

#### Quantity & Weight (Phase 2)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| quantity | number | No | Number of units/loads |
| materialWeightPerUnit | number | No | Weight per unit in metric tonnes (Mt) |
| materialWeight | number | No | Material weight in selected unit (min: 1). Used with `weightUnit` to calculate `totalWeight` |
| weightUnit | string | No | Weight unit: `mt`, `kg`, or `lbs`. Used with `materialWeight` to calculate `totalWeight` |
| numberOfLoads | number | No | Number of loads (min: 1) |
| totalWeight | number | No | Total weight in Mt (min: 3). **Auto-calculated** in priority order: 1) Use explicit `totalWeight`, 2) Convert `materialWeight` + `weightUnit` to Mt, 3) Calculate `quantity × materialWeightPerUnit` |
| weightPerLoad | number | No | Avg weight per load (3 decimals). **Auto-calculated**: totalWeight / numberOfLoads |

#### Location & Storage
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| locationId | number | No | Location ID (optional) |
| country | string | Yes | Country name |
| wasteStoration | string | No | Storage type: indoor, outdoor, both, any |
| materialRemainInCountry | boolean | No | Must material stay in country |

#### Pricing
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currency | string | Yes | Currency: gbp, usd, eur |
| pricePerMetricTonne | number | Yes | Price per metric tonne |
| incoterms | string | No | International commercial terms (e.g., EXW, FAS, FOB, CFR, CIF, DAP, DDP) |

#### Listing Duration
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| listingDuration | date | No | End date for listing (ISO 8601). If not provided, defaults to **90 days** from startDate |
| listingRenewalPeriod | string | No | Renewal: weekly, fortnightly, monthly (for ongoing listings). **Ongoing listings auto-renew at the defined period** |
| endDate | date | No | Calculated end date (auto-set from listingDuration or 90-day default). For ongoing listings, this is updated automatically on renewal |

#### Additional
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Listing title (max 255 characters) |
| description | string | No | Listing description (max 32000 characters) |
| additionalNotes | string | No | Additional notes (max 1000 characters, no phone/email/URL) |

#### For Wanted Listings Only
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| capacityPerMonth | number | Yes* | Capacity per month (*required for wanted listings) |
| materialFlowIndex | string | Yes* | MFI: high, medium, low (*required for wanted listings) |
| materialWeightWanted | number | Yes* | Weight wanted in Mt (*required for wanted listings) |

#### Document Object Structure
```json
{
  "documentType": "feature_image",  // or "gallery_image", "material_specification_data"
  "documentUrl": "https://..."
}
```

### Field Validation Rules

1. **totalWeight**: Minimum 3 metric tonnes
2. **numberOfLoads**: Minimum 1
3. **additionalNotes**: Max 1000 characters, no phone numbers, emails, or URLs
4. **description**: Max 32000 characters
5. **materialType**: Must be one of: plastic, efw, fibre, rubber, metal
6. **listingType**: Must be: sell or wanted
7. **currency**: Must be: gbp, usd, or eur
8. **wasteStoration**: Must be: indoor, outdoor, both, or any

### Auto-Calculations

1. **totalWeight** - Calculated in priority order:
   - **Priority 1**: Use explicit `totalWeight` if provided
   - **Priority 2**: Convert `materialWeight` + `weightUnit` to Mt:
     - If `weightUnit = "mt"`: `totalWeight = materialWeight`
     - If `weightUnit = "kg"`: `totalWeight = materialWeight / 1000`
     - If `weightUnit = "lbs"`: `totalWeight = materialWeight / 2204.62263`
   - **Priority 3**: Calculate from `quantity × materialWeightPerUnit`
2. **weightPerLoad** = `totalWeight / numberOfLoads` (rounded to 3 decimals, if not provided)
3. **endDate** = `startDate + 90 days` (if no listingRenewalPeriod and no listingDuration provided)
4. **incoterms** = Normalized to UPPERCASE

**Weight Conversion Formula:**
- 1 MT = 1000 Kgs = 2204.62263 Lbs

**Notes:** 
- Either `listingDuration` OR `listingRenewalPeriod` should be provided, not both
- If neither is provided, listing defaults to **90 days** duration
- **Three ways to specify weight**:
  1. Provide `totalWeight` directly (in Mt)
  2. Provide `materialWeight` + `weightUnit` (auto-converts to Mt)
  3. Provide `quantity` + `materialWeightPerUnit` (auto-calculates to Mt)
- `weightPerLoad` is auto-calculated as `totalWeight / numberOfLoads` (rounded to 3 decimals) if not provided
- `totalWeight` must be at least 3 metric tonnes
- `numberOfLoads` must be at least 1

### Response (201 Created)
```json
{
  "status": "success",
  "message": "Listing created successfully",
  "data": {
    "listing": {
      "id": 123,
      "companyId": 28,
      "locationId": 40,
      "createdByUserId": 456,
      "materialType": "plastic",
      "materialItem": "bopp",
      "materialForm": "bags",
      "materialGrading": "46",
      "materialColor": "blue",
      "materialFinishing": "flakes",
      "materialPacking": "bales",
      "country": "United Kingdom",
      "listingType": "sell",
      "title": "BOPP Plastic Bales",
      "description": "High quality BOPP plastic",
      "quantity": 6,
      "remainingQuantity": 6,
      "materialWeightPerUnit": 2,
      "numberOfLoads": 6,
      "totalWeight": 12,
      "weightPerLoad": 2.000,
      "wasteStoration": "indoor",
      "materialRemainInCountry": false,
      "currency": "usd",
      "pricePerMetricTonne": 500,
      "startDate": "2025-11-04T17:00:00.000Z",
      "endDate": "2025-12-05T09:17:02.193Z",
      "listingDuration": "2025-12-05T09:17:02.193Z",
      "incoterms": "FAS",
      "additionalNotes": "Contact for bulk orders",
      "status": "pending",
      "state": "pending",
      "isFeatured": false,
      "isUrgent": false,
      "viewCount": 0,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    },
    "documents": [...]
  }
}
```

### cURL Examples

#### Example 1: Using materialWeight + weightUnit (Kg)
```bash
curl -X POST "https://wastetrade-api-dev.b13devops.com/listings" ^
  -H "Authorization: Bearer YOUR_JWT_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"companyId\":28,\"locationId\":40,\"materialType\":\"plastic\",\"materialItem\":\"bopp\",\"materialForm\":\"bags\",\"materialGrading\":\"46\",\"materialColor\":\"blue\",\"materialFinishing\":\"flakes\",\"materialPacking\":\"bales\",\"country\":\"United Kingdom\",\"listingType\":\"sell\",\"title\":\"BOPP Plastic Bales\",\"description\":\"High quality BOPP plastic\",\"materialWeight\":12000,\"weightUnit\":\"kg\",\"numberOfLoads\":6,\"wasteStoration\":\"indoor\",\"materialRemainInCountry\":false,\"currency\":\"usd\",\"pricePerMetricTonne\":500,\"startDate\":\"2025-11-04T17:00:00.000Z\",\"listingDuration\":\"2025-12-05T09:17:02.193Z\",\"incoterms\":\"FAS\",\"additionalNotes\":\"Contact for bulk orders\",\"documents\":[{\"documentType\":\"feature_image\",\"documentUrl\":\"https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/image.jpg\"}]}"
```

#### Example 2: Using materialWeight + weightUnit (Lbs)
```bash
curl -X POST "https://wastetrade-api-dev.b13devops.com/listings" ^
  -H "Authorization: Bearer YOUR_JWT_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"companyId\":28,\"materialType\":\"plastic\",\"materialItem\":\"pet\",\"country\":\"United States\",\"listingType\":\"sell\",\"title\":\"PET Bottles\",\"materialWeight\":26455,\"weightUnit\":\"lbs\",\"numberOfLoads\":4,\"currency\":\"usd\",\"pricePerMetricTonne\":400,\"startDate\":\"2025-11-04T17:00:00.000Z\",\"documents\":[{\"documentType\":\"feature_image\",\"documentUrl\":\"https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/image.jpg\"}]}"
```
**Note**: 26455 lbs ÷ 2204.62263 = ~12 Mt

#### Example 3: Using materialWeight + weightUnit (Mt)
```bash
curl -X POST "https://wastetrade-api-dev.b13devops.com/listings" ^
  -H "Authorization: Bearer YOUR_JWT_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"companyId\":28,\"materialType\":\"plastic\",\"listingType\":\"sell\",\"title\":\"Mixed Plastics\",\"materialWeight\":12,\"weightUnit\":\"mt\",\"numberOfLoads\":3,\"currency\":\"gbp\",\"pricePerMetricTonne\":350,\"startDate\":\"2025-11-04T17:00:00.000Z\",\"documents\":[{\"documentType\":\"feature_image\",\"documentUrl\":\"https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/image.jpg\"}]}"
```

#### Example 4: Using quantity × materialWeightPerUnit (Traditional Method)
```bash
curl -X POST "https://wastetrade-api-dev.b13devops.com/listings" ^
  -H "Authorization: Bearer YOUR_JWT_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"companyId\":28,\"locationId\":40,\"materialType\":\"plastic\",\"materialItem\":\"bopp\",\"materialForm\":\"bags\",\"materialGrading\":\"46\",\"materialColor\":\"blue\",\"materialFinishing\":\"flakes\",\"materialPacking\":\"bales\",\"country\":\"United Kingdom\",\"listingType\":\"sell\",\"title\":\"BOPP Plastic Bales\",\"description\":\"High quality BOPP plastic\",\"quantity\":6,\"materialWeightPerUnit\":2,\"numberOfLoads\":6,\"wasteStoration\":\"indoor\",\"materialRemainInCountry\":false,\"currency\":\"usd\",\"pricePerMetricTonne\":500,\"startDate\":\"2025-11-04T17:00:00.000Z\",\"listingDuration\":\"2025-12-05T09:17:02.193Z\",\"incoterms\":\"FAS\",\"additionalNotes\":\"Contact for bulk orders\",\"documents\":[{\"documentType\":\"feature_image\",\"documentUrl\":\"https://wastetrade-resources-dev.s3.eu-west-2.amazonaws.com/image.jpg\"}]}"
```

### Error Responses

#### 400 Bad Request
```json
{
  "error": {
    "statusCode": 400,
    "name": "BadRequestError",
    "message": "Cannot set both listingDuration and listingRenewalPeriod"
  }
}
```

#### 401 Unauthorized
```json
{
  "error": {
    "statusCode": 401,
    "name": "UnauthorizedError",
    "message": "Authorization header not found"
  }
}
```

#### 422 Unprocessable Entity
```json
{
  "error": {
    "statusCode": 422,
    "name": "UnprocessableEntityError",
    "message": "Total weight must be at least 3 metric tonnes"
  }
}
```

---

## 3. Edit Listing

Updates an existing Sales Listing or Wanted Listing. Only the listing owner or admin can edit. Listings with existing offers cannot be edited.

**Applies to**: Both `listingType: "sell"` and `listingType: "wanted"`

### Endpoint
```
PATCH /listings/{id}
```

### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Listing ID |

### Request Body
```json
{
  "quantity": 8,
  "numberOfLoads": 4,
  "totalWeight": 16,
  "weightPerLoad": 4.000,
  "pricePerMetricTonne": 550,
  "additionalNotes": "Updated quantity and price",
  "incoterms": "CIF"
}
```

**Note:** All fields are optional. Only include fields you want to update.

### Response (200 OK)
```json
{
  "status": "success",
  "message": "Listing updated successfully and sent for admin approval.",
  "data": {
    "listing": {
      "id": 123,
      "materialType": "plastic",
      "materialItem": "bopp",
      "quantity": 8,
      "remainingQuantity": 8,
      "numberOfLoads": 4,
      "totalWeight": 16,
      "weightPerLoad": 4.000,
      "pricePerMetricTonne": 550,
      "status": "pending",
      "state": "pending",
      "incoterms": "CIF",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    }
  }
}
```

### cURL Example
```bash
curl -X PATCH "https://wastetrade-api-dev.b13devops.com/listings/123" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." ^
  -H "Content-Type: application/json" ^
  -d "{\"quantity\":8,\"numberOfLoads\":4,\"totalWeight\":16,\"weightPerLoad\":4.000,\"pricePerMetricTonne\":550,\"incoterms\":\"CIF\"}"
```

### Error Responses

#### 400 Bad Request - Listing Under Review
```json
{
  "error": {
    "statusCode": 400,
    "name": "BadRequestError",
    "message": "This listing cannot be edited because it is under Admin review. If you need to edit this listing, please contact support@wastetrade.com."
  }
}
```

#### 400 Bad Request - Listing Has Offers
```json
{
  "error": {
    "statusCode": 400,
    "name": "BadRequestError",
    "message": "This listing cannot be edited because it has received an offer. If you need to edit this listing, please contact support@wastetrade.com."
  }
}
```

#### 403 Forbidden
```json
{
  "error": {
    "statusCode": 403,
    "name": "ForbiddenError",
    "message": "You don't have permission to edit this listing."
  }
}
```

#### 404 Not Found
```json
{
  "error": {
    "statusCode": 404,
    "name": "NotFoundError",
    "message": "Listing not found"
  }
}
```

---

## 4. Renew Listing

Extends the expiry date of any Sales Listing or Wanted Listing by 2 weeks (14 days) or 90 days. Only available for one-time listings (not ongoing listings with auto-renewal).

**Applies to**: Both `listingType: "sell"` and `listingType: "wanted"`

### Endpoint
```
PATCH /listings/{id}/renew
```

### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Listing ID |

### Request Body
```json
{
  "renewalPeriod": "2_weeks"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| renewalPeriod | string | Yes | Renewal period: "2_weeks" (14 days) or "90_days" |

### Response (200 OK)
```json
{
  "status": "success",
  "message": "Listing renewed. New end date: 29/01/2024",
  "data": {
    "listing": {
      "id": 123,
      "materialType": "plastic",
      "endDate": "2024-01-29T23:59:59.000Z",
      "status": "available",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    },
    "newEndDate": "2024-01-29T23:59:59.000Z"
  }
}
```

### cURL Examples

#### Renew for 2 weeks
```bash
curl -X PATCH "https://wastetrade-api-dev.b13devops.com/listings/123/renew" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." ^
  -H "Content-Type: application/json" ^
  -d "{\"renewalPeriod\":\"2_weeks\"}"
```

#### Renew for 90 days
```bash
curl -X PATCH "https://wastetrade-api-dev.b13devops.com/listings/123/renew" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." ^
  -H "Content-Type: application/json" ^
  -d "{\"renewalPeriod\":\"90_days\"}"
```

### Error Responses

#### 400 Bad Request - Already Sold
```json
{
  "error": {
    "statusCode": 400,
    "name": "BadRequestError",
    "message": "Sold listings cannot be renewed."
  }
}
```

#### 400 Bad Request - Rejected Listing
```json
{
  "error": {
    "statusCode": 400,
    "name": "BadRequestError",
    "message": "This listing is not eligible for renewal."
  }
}
```

#### 400 Bad Request - Ongoing Listing
```json
{
  "error": {
    "statusCode": 400,
    "name": "BadRequestError",
    "message": "Ongoing listings renew automatically. Manual renewal is not available."
  }
}
```

#### 403 Forbidden
```json
{
  "error": {
    "statusCode": 403,
    "name": "ForbiddenError",
    "message": "You can only renew your own listings"
  }
}
```

---

## 5. Mark Listing as Sold/Fulfilled

Manually marks a listing as sold (for Sales Listings) or fulfilled (for Wanted Listings). This will reject all pending offers on the listing.

**Applies to**: Both `listingType: "sell"` and `listingType: "wanted"`
- For Sales Listings: Status changes to "sold" (material has been sold)
- For Wanted Listings: Status changes to "sold" (material requirement has been fulfilled)

**Ongoing Listings Behavior**:
- Reset date calculated as `startDate + renewalPeriod` and stored in `endDate`
- Status shown as "Sold (Available from DD/MM/YYYY)" on product card and details
- Daily cronjob auto-resets to "available" when reset date arrives, restoring `remainingQuantity`

### Endpoint
```
PATCH /listings/{id}/mark-sold
```

### Request Headers
```
Authorization: Bearer <jwt_token>
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Listing ID |

### Response (200 OK)
```json
{
  "status": "success",
  "message": "Listing marked as sold successfully.",
  "data": {
    "listing": {
      "id": 123,
      "materialType": "plastic",
      "status": "sold",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    }
  }
}
```

### cURL Example
```bash
curl -X PATCH "https://wastetrade-api-dev.b13devops.com/listings/123/mark-sold" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Error Responses

#### 400 Bad Request - Already Sold
```json
{
  "error": {
    "statusCode": 400,
    "name": "BadRequestError",
    "message": "This listing is already marked as sold."
  }
}
```

#### 400 Bad Request - Not Approved
```json
{
  "error": {
    "statusCode": 400,
    "name": "BadRequestError",
    "message": "Only approved listings can be marked as sold."
  }
}
```

#### 400 Bad Request - Not Available
```json
{
  "error": {
    "statusCode": 400,
    "name": "BadRequestError",
    "message": "Only available listings can be marked as sold."
  }
}
```

#### 403 Forbidden
```json
{
  "error": {
    "statusCode": 403,
    "name": "ForbiddenError",
    "message": "You can only mark your own listings as sold"
  }
}
```

---

## 6. Remove Listing

Deletes any Sales Listing or Wanted Listing. Listings with accepted offers cannot be deleted. All pending offers will be rejected with reason "Listing removed".

**Applies to**: Both `listingType: "sell"` and `listingType: "wanted"`

### Endpoint
```
DELETE /listings/{id}
```

### Request Headers
```
Authorization: Bearer <jwt_token>
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Listing ID |

### Response (204 No Content)
No response body. HTTP status code 204 indicates successful deletion.

### cURL Example
```bash
curl -X DELETE "https://wastetrade-api-dev.b13devops.com/listings/123" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Error Responses

#### 400 Bad Request - Has Accepted Offers
```json
{
  "error": {
    "statusCode": 400,
    "name": "BadRequestError",
    "message": "You can't delete this listing because there is an existing offer on it."
  }
}
```

#### 403 Forbidden
```json
{
  "error": {
    "statusCode": 403,
    "name": "ForbiddenError",
    "message": "You do not have permission to remove this listing."
  }
}
```

#### 404 Not Found
```json
{
  "error": {
    "statusCode": 404,
    "name": "NotFoundError",
    "message": "Listing not found"
  }
}
```

---

## 7. Get Listing Details

Retrieves detailed information about a specific listing.

### Endpoint
```
GET /listings/{id}
```

### Request Headers
```
Authorization: Bearer <jwt_token>
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Listing ID |

### Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "listing": {
      "id": 123,
      "materialType": "plastic",
      "materialItem": "bopp",
      "materialForm": "bags",
      "materialGrading": "46",
      "materialColor": "blue",
      "materialFinishing": "flakes",
      "materialPacking": "bales",
      "quantity": 6,
      "remainingQuantity": 6,
      "materialWeightPerUnit": 2,
      "numberOfLoads": 6,
      "totalWeight": 12,
      "weightPerLoad": 2.000,
      "pricePerMetricTonne": 500,
      "status": "available",
      "state": "approved",
      "listingType": "sell",
      "listingRenewalPeriod": "fortnightly",
      "incoterms": "FOB",
      "startDate": "2024-01-15T10:30:00.000Z",
      "endDate": "2024-02-15T10:30:00.000Z",
      "locationId": 1,
      "location": {
        "id": 1,
        "city": "London",
        "country": "UK"
      },
      "company": {
        "id": 10,
        "name": "Acme Recycling Ltd"
      },
      "documents": [
        {
          "id": 1,
          "name": "Material Certificate",
          "url": "https://s3.amazonaws.com/bucket/cert.pdf",
          "type": "certificate"
        }
      ],
      "createdByUserId": 456,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### cURL Example
```bash
curl -X GET "https://wastetrade-api-dev.b13devops.com/listings/123" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 8. List All Listings

Retrieves a paginated list of all available listings with filtering options.

### Endpoint
```
GET /listings
```

### Request Headers
```
Authorization: Bearer <jwt_token>
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20, max: 100) |
| materialType | string | No | Filter by material type |
| status | string | No | Filter by status (available/pending/sold/expired) |
| listingType | string | No | Filter by listing type (sell/wanted) |
| minPrice | number | No | Minimum price per metric tonne |
| maxPrice | number | No | Maximum price per metric tonne |

### Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "listings": [
      {
        "id": 123,
        "materialType": "plastic",
        "materialItem": "bopp",
        "quantity": 6,
        "numberOfLoads": 6,
        "totalWeight": 12,
        "weightPerLoad": 2.000,
        "pricePerMetricTonne": 500,
        "status": "available",
        "listingType": "sell",
        "incoterms": "FOB",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  }
}
```

### cURL Example
```bash
curl -X GET "https://wastetrade-api-dev.b13devops.com/listings?page=1&limit=20&materialType=plastic&status=available" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Common Error Codes

| Status Code | Error Name | Description |
|-------------|------------|-------------|
| 400 | BadRequestError | Invalid request data or business logic violation |
| 401 | UnauthorizedError | Missing or invalid authentication token |
| 403 | ForbiddenError | User doesn't have permission for this action |
| 404 | NotFoundError | Requested resource not found |
| 422 | UnprocessableEntityError | Validation error |
| 500 | InternalServerError | Server error |

---

## Listing Status Flow

```
CREATE → PENDING (awaiting admin approval)
         ↓
      APPROVED
         ↓
      AVAILABLE (active listing)
         ↓
      SOLD / EXPIRED / REJECTED
```

### Status Definitions

- **PENDING**: Listing is awaiting admin approval
- **AVAILABLE**: Listing is active and can receive offers
- **SOLD**: Listing has been sold (manually or through transaction)
- **EXPIRED**: Listing has passed its end date
- **REJECTED**: Listing was rejected by admin

### State Definitions

- **PENDING**: Awaiting admin review
- **APPROVED**: Approved by admin
- **REJECTED**: Rejected by admin

---

## Frontend Integration Guidelines

### 1. Authentication Setup
Store the JWT token after login and include it in all API requests:
```javascript
const token = localStorage.getItem('jwt_token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### 2. Create Listing Form
```javascript
async function createListing(listingData) {
  const response = await fetch('https://wastetrade-api-dev.b13devops.com/listings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(listingData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return await response.json();
}
```

### 3. Edit Listing Form
- Reuse the create listing form
- Pre-populate fields with existing listing data
- Only send changed fields in PATCH request
- Disable editing if listing has offers (check offer count first)
- Show appropriate error messages for different scenarios

### 4. Renew Listing
```javascript
async function renewListing(listingId, renewalPeriod) {
  const response = await fetch(`https://wastetrade-api-dev.b13devops.com/listings/${listingId}/renew`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ renewalPeriod })
  });
  
  return await response.json();
}
```

### 5. Mark as Sold
```javascript
async function markAsSold(listingId) {
  const response = await fetch(`https://wastetrade-api-dev.b13devops.com/listings/${listingId}/mark-sold`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

### 6. Delete Listing
```javascript
async function deleteListing(listingId) {
  const response = await fetch(`https://wastetrade-api-dev.b13devops.com/listings/${listingId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 204) {
    return { success: true };
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
}
```

### 7. Ongoing Listings Auto-Renewal

**Important**: Listings with `listingRenewalPeriod` set will automatically renew at the specified period.

#### How Auto-Renewal Works

1. **Creating an Ongoing Listing**:
   - Set `listingRenewalPeriod` to `"weekly"`, `"fortnightly"`, or `"monthly"`
   - The `endDate` is calculated based on the renewal period from `startDate`
   - Example: Weekly listing created on Jan 1st will have `endDate` of Jan 8th

2. **Automatic Renewal Process**:
   - A cron job runs daily at 9:00 AM (Asia/Ho_Chi_Minh timezone)
   - Identifies ongoing listings that have reached their `endDate`
   - Updates the `endDate` to the next period:
     - **Weekly**: Adds 7 days
     - **Fortnightly**: Adds 14 days
     - **Monthly**: Adds 1 month
   - Listing status remains `available` or `pending` (not marked as expired)

3. **Renewal Periods**:
   - `weekly`: Renews every 7 days
   - `fortnightly`: Renews every 14 days
   - `monthly`: Renews every month

4. **Stopping Auto-Renewal**:
   - Edit the listing and remove the `listingRenewalPeriod` (set to `null`)
   - Or remove/delete the listing
   - Or mark the listing as sold/fulfilled

#### Example: Creating an Ongoing Listing
```json
{
  "materialType": "plastic",
  "listingType": "sell",
  "listingRenewalPeriod": "monthly",
  "startDate": "2024-01-01T00:00:00.000Z",
  // ... other fields
}
```

The listing will automatically renew on Feb 1st, Mar 1st, Apr 1st, etc.

### 8. Complete Workflow: Upload Files + Create Listing

```javascript
async function createListingWithMedia(listingData, featuredImage, galleryImages, specDocuments) {
  try {
    // Step 1: Upload featured image
    const featuredImageUrl = await uploadSingleFile(featuredImage);
    
    // Step 2: Upload gallery images (if any)
    const galleryImageUrls = galleryImages.length > 0 
      ? await uploadMultipleFiles(galleryImages)
      : [];
    
    // Step 3: Upload specification documents (if any)
    const specDocUrls = specDocuments.length > 0
      ? await uploadMultipleFiles(specDocuments)
      : [];
    
    // Step 4: Build documents array
    const documents = [
      {
        documentType: 'feature_image',
        documentUrl: featuredImageUrl
      },
      ...galleryImageUrls.map(url => ({
        documentType: 'gallery_image',
        documentUrl: url
      })),
      ...specDocUrls.map(url => ({
        documentType: 'material_specification_data',
        documentUrl: url
      }))
    ];
    
    // Step 5: Create listing with document URLs
    const listing = await createListing({
      ...listingData,
      documents
    });
    
    showSuccessMessage('Listing created successfully');
    return listing;
    
  } catch (error) {
    showErrorMessage(error.message);
    throw error;
  }
}

// Helper function to upload single file
async function uploadSingleFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('https://wastetrade-api-dev.b13devops.com/upload-file', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload file');
  }
  
  return await response.json(); // Returns URL string
}

// Helper function to upload multiple files
async function uploadMultipleFiles(files) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('file', file);
  });
  
  const response = await fetch('https://wastetrade-api-dev.b13devops.com/upload-multiple-files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload files');
  }
  
  return await response.json(); // Returns array of URL strings
}
```

### 9. Error Handling
```javascript
try {
  await createListing(data);
  showSuccessMessage('Listing created successfully');
} catch (error) {
  if (error.message.includes('Admin review')) {
    showWarningMessage(error.message);
  } else if (error.message.includes('permission')) {
    showErrorMessage('You do not have permission for this action');
  } else {
    showErrorMessage(error.message);
  }
}
```

### 10. Document Type Reference

| Document Type | Usage | Required | Max Files |
|---------------|-------|----------|-----------|
| `feature_image` | Main listing image | Yes | 1 |
| `gallery_image` | Additional product images | No | 6 |
| `material_specification_data` | Spec sheets, certificates | No | 6 |

**Important Notes:**
- Featured image is **mandatory** for all listings
- Gallery images are **optional** (max 6 files)
- Material specification data is **optional** (max 6 files)
- **All images are automatically watermarked** with the WasteTrade logo (tiled pattern across entire image, -45° rotation, 15% opacity)
- Watermarks are applied to: JPEG, PNG, WebP, TIFF, GIF formats
- Non-image files (PDFs, documents) are not watermarked
- Watermark pattern provides full image protection (not just corner watermark)
- Files must be uploaded **before** creating the listing
- Upload endpoints return S3 URLs that must be included in the listing creation request
