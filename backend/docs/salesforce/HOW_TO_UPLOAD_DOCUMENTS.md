# How to Upload Documents to Salesforce

Guide for uploading documents to Salesforce Haulage Offers for testing.

---

## Option 1: Salesforce UI (Recommended for Testing)

### Step 1: Login to Salesforce
- URL: https://your-instance.salesforce.com
- Use your Salesforce credentials

### Step 2: Find Haulage Offer Record
1. Click **App Launcher** (9 dots icon in top-left)
2. Search for "Haulage Offers"
3. Click **Haulage Offers** tab
4. Find record with `WasteTrade_Haulage_Offers_ID__c = 'DEV_123'`
   - Use search or filters
   - External ID format: `{ENVIRONMENT}_{haulage_offer_id}`
   - Examples: `DEV_123`, `STAGING_456`, `PROD_789`

### Step 3: Upload Document
1. Open the Haulage Offer record
2. Scroll down to **Files** related list
3. Click **Upload Files** button
4. Select file from your computer (PDF, image, Word, etc.)
5. Click **Done**

### Step 4: Verify Upload
- Document appears in Files section
- Can preview/download directly in Salesforce
- Note the document title for verification

### Step 5: Wait for Sync
- WasteTrade cron runs every 10 minutes
- Document will sync to `haulage_offer_documents` table
- Check logs for: `HaulageDocs(X/Y)`

---

## Option 2: Salesforce REST API

### Prerequisites
- Salesforce access token
- Haulage Offer Salesforce ID
- File to upload (base64 encoded)

### Step 1: Get Access Token
```bash
curl -X POST https://login.salesforce.com/services/oauth2/token \
  -d "grant_type=password" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "username=YOUR_USERNAME" \
  -d "password=YOUR_PASSWORD+SECURITY_TOKEN"
```

### Step 2: Find Haulage Offer ID
```bash
curl -X GET "https://instance.salesforce.com/services/data/v58.0/query?q=SELECT+Id+FROM+Haulage_Offers__c+WHERE+WasteTrade_Haulage_Offers_ID__c='DEV_123'" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### Step 3: Upload ContentVersion
```bash
curl -X POST "https://instance.salesforce.com/services/data/v58.0/sobjects/ContentVersion" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Bill of Lading",
    "PathOnClient": "bill_of_lading.pdf",
    "VersionData": "BASE64_ENCODED_FILE_CONTENT"
  }'
```

**Response:**
```json
{
  "id": "068XXXXXXXXXXXXXXX",
  "success": true
}
```

### Step 4: Get ContentDocumentId
```bash
curl -X GET "https://instance.salesforce.com/services/data/v58.0/sobjects/ContentVersion/068XXXXXXXXXXXXXXX" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

**Extract:** `ContentDocumentId` from response

### Step 5: Link to Haulage Offer
```bash
curl -X POST "https://instance.salesforce.com/services/data/v58.0/sobjects/ContentDocumentLink" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ContentDocumentId": "069XXXXXXXXXXXXXXX",
    "LinkedEntityId": "a0XXXXXXXXXXXXXXX",
    "ShareType": "V"
  }'
```

---

## Option 3: Node.js Script (jsforce)

### Install jsforce
```bash
npm install jsforce
```

### Upload Script
```javascript
const jsforce = require('jsforce');
const fs = require('fs');

async function uploadDocument() {
  // Connect to Salesforce
  const conn = new jsforce.Connection({
    loginUrl: process.env.SALESFORCE_SANDBOX_URL || 'https://login.salesforce.com'
  });

  await conn.login(
    process.env.SALESFORCE_USERNAME,
    process.env.SALESFORCE_PASSWORD + process.env.SALESFORCE_SECURITY_TOKEN
  );

  // Find Haulage Offer
  const result = await conn.query(
    "SELECT Id FROM Haulage_Offers__c WHERE WasteTrade_Haulage_Offers_ID__c = 'DEV_123' LIMIT 1"
  );

  if (result.records.length === 0) {
    throw new Error('Haulage offer not found');
  }

  const haulageOfferId = result.records[0].Id;

  // Read file and convert to base64
  const fileContent = fs.readFileSync('path/to/document.pdf');
  const base64Content = fileContent.toString('base64');

  // Upload ContentVersion
  const cvResult = await conn.sobject('ContentVersion').create({
    Title: 'Bill of Lading',
    PathOnClient: 'bill_of_lading.pdf',
    VersionData: base64Content
  });

  console.log('ContentVersion created:', cvResult.id);

  // Get ContentDocumentId
  const cv = await conn.sobject('ContentVersion').retrieve(cvResult.id);

  // Link to Haulage Offer
  await conn.sobject('ContentDocumentLink').create({
    ContentDocumentId: cv.ContentDocumentId,
    LinkedEntityId: haulageOfferId,
    ShareType: 'V' // V = Viewer, C = Collaborator, I = Inferred
  });

  console.log('✅ Document uploaded and linked successfully');
}

uploadDocument().catch(console.error);
```

### Run Script
```bash
node upload-document.js
```

---

## Salesforce Document Architecture

```
ContentVersion (File metadata + binary data)
  ├─ Id: "068..." (Version ID)
  ├─ Title: "Bill of Lading.pdf"
  ├─ PathOnClient: "bill_of_lading.pdf"
  ├─ VersionData: <binary content>
  └─ ContentDocumentId: "069..." (Document container)
       │
       ▼
ContentDocument (File container)
  ├─ Id: "069..." (Document ID)
  ├─ Title: "Bill of Lading.pdf"
  └─ LatestPublishedVersionId: "068..."
       │
       ▼
ContentDocumentLink (Link to record)
  ├─ Id: "06A..." (Link ID)
  ├─ ContentDocumentId: "069..."
  ├─ LinkedEntityId: "a0X..." (Haulage Offer ID)
  └─ ShareType: "V" (Viewer permission)
```

---

## Testing Workflow

### 1. Upload Document (Salesforce UI)
```
1. Login to Salesforce
2. Find Haulage Offer: WasteTrade_Haulage_Offers_ID__c = 'DEV_123'
3. Upload file via Files section
4. Verify document appears
```

### 2. Wait for Sync (10 minutes)
```
- Cron runs every 10 minutes
- Check backend logs for: HaulageDocs(X/Y)
- Or force immediate sync by changing cron to */1 * * * *
```

### 3. Verify in Database
```sql
SELECT * FROM haulage_offer_documents 
WHERE haulage_offer_id = 123;
```

### 4. Call API
```bash
curl -X GET 'https://wastetrade-api-dev.b13devops.com/haulage-offers/123/documents' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

**Expected Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "haulageOfferId": 123,
      "documentTitle": "Bill of Lading.pdf",
      "documentUrl": "https://instance.salesforce.com/sfc/servlet.shepherd/version/download/068...",
      "salesforceId": "068XXXXXXXXXXXXXXX"
    }
  ]
}
```

---

## Troubleshooting

### Document not syncing to WasteTrade
1. Check Salesforce external ID: `WasteTrade_Haulage_Offers_ID__c`
2. Verify format: `{ENVIRONMENT}_{haulage_offer_id}`
3. Check haulage offer status: must be ACCEPTED/PARTIALLY_SHIPPED/SHIPPED
4. Check cron logs for errors
5. Verify Salesforce credentials in `.env`

### Document not appearing in Salesforce
1. Check file size (max 2GB for ContentVersion)
2. Verify file type is supported
3. Check user permissions in Salesforce
4. Verify ContentDocumentLink was created

### API returns empty array
1. Wait 10 minutes for cron sync
2. Check database: `SELECT * FROM haulage_offer_documents;`
3. Verify haulage offer status
4. Check cron is running: `IS_BACKGROUND=true`

---

## File Size Limits

| Object | Limit |
|--------|-------|
| ContentVersion | 2 GB per file |
| Total Files per Record | No limit |
| API Upload | 50 MB per request |

---

## Supported File Types

- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Images**: JPG, PNG, GIF, BMP, TIFF
- **Other**: TXT, CSV, ZIP, etc.

---

## Quick Test

**Fastest way to test:**
1. Login Salesforce UI
2. Find any Haulage Offer with status ACCEPTED
3. Upload a small PDF (< 1MB)
4. Wait 10 minutes
5. Call API: `GET /haulage-offers/{id}/documents`
6. Verify document appears in response
