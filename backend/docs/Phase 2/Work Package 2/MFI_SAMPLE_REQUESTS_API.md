# MFI & Sample Requests API Documentation

## Overview

Admin API endpoints for viewing and filtering MFI (Melt Flow Index) and Sample requests with full relation data, status filtering, and pagination.

## Database Models

### MfiRequests
- **Relations**: listing, buyerUser, buyerCompany, sellerUser, sellerCompany, assignedAdmin
- **Status**: Unverified, Verified, Awaiting Payment, Pending, Tested, Inactive, Blocked
- **Key Fields**: buyerMessage, testedDate, mfiResult, Salesforce sync fields

### SampleRequests
- **Relations**: listing, buyerUser, buyerCompany, sellerUser, sellerCompany, assignedAdmin
- **Status**: Unverified, Verified, Awaiting Payment, Pending, Sent, Received, Cancelled, Inactive, Blocked
- **Key Fields**: numberOfSamples, sampleSize, buyerMessage, sentDate, receivedDate, postageLabelUrl, Salesforce sync fields

---

## API Endpoints

### 1. GET /admin/sample-requests

**Authentication**: JWT token required (Admin role)

**Query Parameters**:
- `status` (optional) - Filter by status or "All"
- `filter` (optional) - JSON string for pagination: `{"skip":0,"limit":10}`

**Defaults**: 20 items per page, sorted by createdAt DESC (latest first)

**curl Examples**:
```bash
# Get all (default 20 items)
curl -X GET "http://localhost:3000/admin/sample-requests" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by status
curl -X GET "http://localhost:3000/admin/sample-requests?status=Sample%20Requested" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Pagination (first 10)
curl -X GET "http://localhost:3000/admin/sample-requests?filter=%7B%22skip%22%3A0%2C%22limit%22%3A10%7D" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Status + pagination
curl -X GET "http://localhost:3000/admin/sample-requests?status=Sample%20Approved&filter=%7B%22skip%22%3A0%2C%22limit%22%3A10%7D" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Example**:
```json
{
  "status": "success",
  "message": "Sample requests retrieved successfully",
  "data": {
    "results": [
      {
        "id": 1,
        "listingId": 5,
        "buyerUserId": 10,
        "buyerCompanyId": 3,
        "sellerUserId": 15,
        "sellerCompanyId": 7,
        "assignedAdminId": 2,
        "numberOfSamples": 3,
        "sampleSize": "Medium (500g)",
        "buyerMessage": "Need to confirm material meets our requirements",
        "status": "Pending",
        "sentDate": null,
        "receivedDate": null,
        "postageLabelUrl": null,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "listing": {
          "id": 5,
          "title": "HDPE Plastic Scrap - High Quality",
          "materialName": "HDPE",
          "quantity": 1000,
          "unit": "kg"
        },
        "buyerUser": {
          "id": 10,
          "username": "john_buyer",
          "email": "john@buyercompany.com",
          "firstName": "John",
          "lastName": "Smith"
        },
        "buyerCompany": {
          "id": 3,
          "companyName": "Buyer Company Ltd",
          "address": "123 Industrial Park",
          "city": "London",
          "country": "United Kingdom"
        },
        "sellerUser": {
          "id": 15,
          "username": "jane_seller",
          "email": "jane@sellercompany.com",
          "firstName": "Jane",
          "lastName": "Doe"
        },
        "sellerCompany": {
          "id": 7,
          "companyName": "Seller Company Ltd",
          "address": "456 Business Avenue",
          "city": "Paris",
          "country": "France"
        },
        "assignedAdmin": {
          "id": 2,
          "username": "admin_user",
          "email": "admin@wastetrade.com"
        }
      }
    ],
    "totalCount": 100
  }
}
```

**Response Fields**:
- `results` - Array of sample requests with all relations
- `totalCount` - Total matching records (for pagination)
- Each request includes: listing details, buyer/seller user profiles, buyer/seller company details, assigned admin

---

### 2. GET /admin/mfi-requests

**Authentication**: JWT token required (Admin role)

**Query Parameters**:
- `status` (optional) - Filter by status or "All"
- `filter` (optional) - JSON string for pagination: `{"skip":0,"limit":10}`

**Defaults**: 20 items per page, sorted by createdAt DESC (latest first)

**curl Examples**:
```bash
# Get all (default 20 items)
curl -X GET "http://localhost:3000/admin/mfi-requests" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by status
curl -X GET "http://localhost:3000/admin/mfi-requests?status=Pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Pagination (first 10)
curl -X GET "http://localhost:3000/admin/mfi-requests?filter=%7B%22skip%22%3A0%2C%22limit%22%3A10%7D" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Status + pagination
curl -X GET "http://localhost:3000/admin/mfi-requests?status=Tested&filter=%7B%22skip%22%3A0%2C%22limit%22%3A10%7D" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Example**:
```json
{
  "status": "success",
  "message": "MFI requests retrieved successfully",
  "data": {
    "results": [
      {
        "id": 1,
        "listingId": 8,
        "buyerUserId": 12,
        "buyerCompanyId": 4,
        "sellerUserId": 18,
        "sellerCompanyId": 9,
        "assignedAdminId": 2,
        "buyerMessage": "Need MFI testing for quality assurance",
        "status": "Pending",
        "testedDate": null,
        "mfiResult": null,
        "createdAt": "2024-01-15T11:00:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z",
        "listing": {
          "id": 8,
          "title": "PP Plastic Granules - Industrial Grade",
          "materialName": "PP",
          "quantity": 5000,
          "unit": "kg"
        },
        "buyerUser": {
          "id": 12,
          "username": "bob_buyer",
          "email": "bob@buyercorp.com",
          "firstName": "Bob",
          "lastName": "Johnson"
        },
        "buyerCompany": {
          "id": 4,
          "companyName": "Buyer Corporation",
          "address": "789 Manufacturing Road",
          "city": "Berlin",
          "country": "Germany"
        },
        "sellerUser": {
          "id": 18,
          "username": "alice_seller",
          "email": "alice@sellercorp.com",
          "firstName": "Alice",
          "lastName": "Williams"
        },
        "sellerCompany": {
          "id": 9,
          "companyName": "Seller Corporation",
          "address": "321 Trade Boulevard",
          "city": "Madrid",
          "country": "Spain"
        },
        "assignedAdmin": {
          "id": 2,
          "username": "admin_user",
          "email": "admin@wastetrade.com"
        }
      }
    ],
    "totalCount": 100
  }
}
```

**Response Fields**:
- `results` - Array of MFI requests with all relations
- `totalCount` - Total matching records (for pagination)
- Each request includes: listing details, buyer/seller user profiles, buyer/seller company details, assigned admin, test results (if tested)

---

## Frontend Integration Guide

### Display Fields

**Sample Requests Card/Table**:
- Buyer username (clickable → `/admin/users/{buyerUserId}`)
- Buyer company name + address (city, country)
- Seller username (clickable → `/admin/users/{sellerUserId}`)
- Seller company name + address (city, country)
- Material name (from listing)
- Number of samples + sample size
- Status badge (color-coded)
- Created date (formatted)

**MFI Requests Card/Table**:
- Buyer username (clickable → `/admin/users/{buyerUserId}`)
- Buyer company name + address (city, country)
- Seller username (clickable → `/admin/users/{sellerUserId}`)
- Seller company name + address (city, country)
- Material name (from listing)
- Status badge (color-coded)
- MFI result (if tested)
- Tested date (if tested)
- Created date (formatted)

### Status Filter Tabs

**Sample Requests**: All, Unverified, Verified, Awaiting Payment, Pending, Sent, Received, Cancelled, Inactive, Blocked

**MFI Requests**: All, Unverified, Verified, Awaiting Payment, Pending, Tested, Inactive, Blocked

### Pagination

- Default: 20 items per page
- Calculate skip: `currentPage * pageSize`
- Total pages: `Math.ceil(totalCount / pageSize)`

---

## Test Data

Migration generates:
- 30 users (buyers, sellers, admins)
- 10 companies
- 20 listings
- 100 MFI requests (various statuses)
- 100 Sample requests (various statuses)

All with real database relations.

**Run**: `cd wastetrade-backend && pnpm run migrate`

---

## Testing Steps

1. Start backend: `pnpm dev`
2. Run migration: `pnpm run migrate`
3. Login as admin to get JWT token
4. Test endpoints with curl examples above
5. Verify: status 200, correct structure, all relations populated, filtering works, pagination works

---

## Files

- Models: `src/models/mfi-requests.model.ts`, `src/models/sample-requests.model.ts`
- Enums: `src/enum/mfi-request.enum.ts`, `src/enum/sample-request.enum.ts`
- Controller: `src/controllers/admin-requests.controller.ts`
- Migration: `src/migrations/[2.0.8]-generate-mfi-sample-test-data.migration.ts`

---

## Search Terms

MFI requests, Sample requests, Admin API, Status filtering, Pagination, Material testing, Quality assurance, WasteTrade admin portal
