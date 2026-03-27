# CU-869abxxnm: View Documents for Accepted Haulage Offers

**Epic**: 6.2.3. My Haulage Offers  
**User Story**: 6.2.3.4. View Documents for Accepted Haulage Offers

## API Endpoint

### GET `/haulage-offers/{id}/documents`

Retrieve documents for an accepted haulage offer.

**Auth**: JWT required  
**Role**: Haulier (company member) or Admin

**Path Parameters**:
| Field | Type | Description |
|-------|------|-------------|
| id | number | Haulage offer ID |

## Response

### Success Response (200)

| Field | Type | Description |
|-------|------|-------------|
| status | string | "success" |
| message | string | "Documents retrieved successfully" |
| data | array | Array of document objects |

**Document Object**:
| Field | Type | Description |
|-------|------|-------------|
| id | number | Document ID |
| haulageOfferId | number | Haulage offer ID |
| documentTitle | string | Document name/title |
| documentUrl | string | Downloadable URL (hosted by Salesforce) |
| salesforceId | string | Salesforce document ID |
| createdAt | datetime | Creation timestamp |
| updatedAt | datetime | Last update timestamp |

## curl Examples

### Get Documents (Success)
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/haulage-offers/123/documents' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Response**:
```json
{
  "status": "success",
  "message": "Documents retrieved successfully",
  "data": [
    {
      "id": 1,
      "haulageOfferId": 123,
      "documentTitle": "Haulage Agreement - Load 1",
      "documentUrl": "https://files.salesforce.com/doc/abc123",
      "salesforceId": "SF_DOC_123",
      "createdAt": "2024-12-14T10:00:00.000Z",
      "updatedAt": "2024-12-14T10:00:00.000Z"
    },
    {
      "id": 2,
      "haulageOfferId": 123,
      "documentTitle": "Transport Documentation",
      "documentUrl": "https://files.salesforce.com/doc/xyz789",
      "salesforceId": "SF_DOC_789",
      "createdAt": "2024-12-14T10:05:00.000Z",
      "updatedAt": "2024-12-14T10:05:00.000Z"
    }
  ]
}
```

### Empty Documents List
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/haulage-offers/456/documents' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Response**:
```json
{
  "status": "success",
  "message": "Documents retrieved successfully",
  "data": []
}
```

## Error Responses

| Status | Error | When |
|--------|-------|------|
| 400 | Documents are only available for accepted haulage offers | Offer status is not ACCEPTED/PARTIALLY_SHIPPED/SHIPPED |
| 401 | Unauthorized | No JWT token or invalid token |
| 403 | You do not have permission to view documents for this haulage offer | User is not from the haulier company and not admin |
| 404 | Haulage offer not found | Invalid haulage offer ID |

### Error Example (Not Accepted)
```bash
curl -X GET \
  'https://wastetrade-api-dev.b13devops.com/haulage-offers/789/documents' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Response**:
```json
{
  "error": {
    "statusCode": 400,
    "message": "Documents are only available for accepted haulage offers"
  }
}
```

## Notes

- Documents are generated in Salesforce (not in WasteTrade)
- WasteTrade only stores metadata (title, URL, Salesforce ID)
- Document files hosted by Salesforce
- Only visible for ACCEPTED/PARTIALLY_SHIPPED/SHIPPED haulage offers
- Company members can view their company's documents
- Admins can view all documents

---

## Test Plan

### Prerequisites
1. Backend running with `IS_BACKGROUND=true`
2. Salesforce sync enabled: `SALESFORCE_SYNC_ENABLED=true`
3. Valid Salesforce credentials in `.env`
4. At least 1 accepted haulage offer in database

### Test Scenarios

#### 1. Upload Document in Salesforce
**Steps:**
1. Login to Salesforce
2. Find haulage offer: `WasteTrade_Haulage_Offers_ID__c = 'DEV_123'`
3. Upload document (PDF/image) via Files section
4. Wait 10 minutes for cron sync

**Expected:**
- Document appears in `haulage_offer_documents` table
- Cron log shows: `HaulageDocs(1/1)`

#### 2. Call API - Success Case
**Request:**
```bash
curl -X GET 'https://wastetrade-api-dev.b13devops.com/haulage-offers/123/documents' \
  -H 'Authorization: Bearer HAULIER_TOKEN'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Documents retrieved successfully",
  "data": [
    {
      "id": 1,
      "haulageOfferId": 123,
      "documentTitle": "Bill of Lading.pdf",
      "documentUrl": "https://instance.salesforce.com/sfc/servlet.shepherd/version/download/068...",
      "salesforceId": "068XXXXXXXXXXXXXXX",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

#### 3. Call API - Empty Documents
**Request:**
```bash
curl -X GET 'https://wastetrade-api-dev.b13devops.com/haulage-offers/456/documents' \
  -H 'Authorization: Bearer HAULIER_TOKEN'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Documents retrieved successfully",
  "data": []
}
```

#### 4. Call API - Not Accepted Offer
**Request:**
```bash
curl -X GET 'https://wastetrade-api-dev.b13devops.com/haulage-offers/789/documents' \
  -H 'Authorization: Bearer HAULIER_TOKEN'
```

**Expected Response (400):**
```json
{
  "error": {
    "statusCode": 400,
    "message": "Documents are only available for accepted haulage offers"
  }
}
```

#### 5. Call API - Wrong Company
**Request:**
```bash
curl -X GET 'https://wastetrade-api-dev.b13devops.com/haulage-offers/123/documents' \
  -H 'Authorization: Bearer OTHER_HAULIER_TOKEN'
```

**Expected Response (403):**
```json
{
  "error": {
    "statusCode": 403,
    "message": "You do not have permission to view documents for this haulage offer"
  }
}
```

#### 6. Call API - Admin Access
**Request:**
```bash
curl -X GET 'https://wastetrade-api-dev.b13devops.com/haulage-offers/123/documents' \
  -H 'Authorization: Bearer ADMIN_TOKEN'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Documents retrieved successfully",
  "data": [...]
}
```

#### 7. Document Update in Salesforce
**Steps:**
1. Replace document in Salesforce with new version
2. Wait 10 minutes for cron sync
3. Call API again

**Expected:**
- `updated_at` timestamp changed in DB
- API returns updated document info

#### 8. Multiple Documents
**Steps:**
1. Upload 3 documents to same haulage offer in Salesforce
2. Wait for sync
3. Call API

**Expected:**
- All 3 documents returned in array
- Ordered by creation date

### Database Verification

```sql
-- Check synced documents
SELECT * FROM haulage_offer_documents WHERE haulage_offer_id = 123;

-- Check recent sync activity
SELECT * FROM haulage_offer_documents 
WHERE updated_at > NOW() - INTERVAL '1 hour';

-- Count documents per offer
SELECT haulage_offer_id, COUNT(*) 
FROM haulage_offer_documents 
GROUP BY haulage_offer_id;
```

### Cron Monitoring

**Check logs for:**
```
✅ Salesforce sync completed: 10/10 synced in 12.3s
📊 Breakdown: HaulageDocs(5/5)
```

**Force immediate sync (for testing):**
- Change cron to `*/1 * * * *` (every 1 minute)
- Restart backend
- Watch logs

