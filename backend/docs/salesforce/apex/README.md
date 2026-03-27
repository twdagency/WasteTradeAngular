# Salesforce Apex Code - WasteTrade Webhook Integration

Hướng dẫn setup Apex code trong Salesforce để gửi webhooks về WasteTrade khi có thay đổi data.

## Prerequisites

### 1. Add Remote Site Setting

**Setup → Security → Remote Site Settings → New**

| Field | Value |
|-------|-------|
| Remote Site Name | `WasteTrade_API_DEV` |
| Remote Site URL | `https://wastetrade-api-dev.b13devops.com` |
| Description | WasteTrade API for webhook callbacks |
| Active | ✓ |

### 2. Add Last_Sync_Origin__c Field (Loop Prevention)

Chạy script trong WasteTrade backend:

```bash
cd wastetrade-backend
node scripts/add-sync-origin-field.js
```

Script sẽ thêm field `Last_Sync_Origin__c` vào: Account, Contact, Lead, Haulage_Offers__c, Haulage_Loads__c, Sales_Listing__c, Wanted_Listings__c, Offers__c

---

## Files trong folder này

| File | Mô tả |
|------|-------|
| `WasteTradeWebhookService.cls` | Apex class chính - xử lý HTTP callouts với batch processing |
| `AccountTrigger.trigger` | Trigger trên Account object (batch processing + loop prevention) |
| `ContactTrigger.trigger` | Trigger trên Contact object (batch processing + loop prevention) |
| `OffersTrigger.trigger` | Trigger trên Offers__c object (batch processing + loop prevention) |
| `HaulageOffersTrigger.trigger` | Trigger trên Haulage_Offers__c object (batch processing + loop prevention) |
| `HaulageLoadsTrigger.trigger` | Trigger trên Haulage_Loads__c object (batch processing + loop prevention) |
| `SalesListingTrigger.trigger` | Trigger trên Sales_Listing__c object (batch processing + loop prevention) |
| `WantedListingsTrigger.trigger` | Trigger trên Wanted_Listings__c object (batch processing + loop prevention) |
| `ContentDocumentLinkTrigger.trigger` | Trigger khi attach documents - insert only, no loop prevention needed |

**✨ All triggers support batch processing. All update triggers implement loop prevention via `Last_Sync_Origin__c`.**

---

## Step 1: Create Apex Class

**Setup → Apex Classes → New**

1. Copy toàn bộ nội dung từ `WasteTradeWebhookService.cls`
2. Paste vào editor
3. Click **Save**

### Verify

Mở **Developer Console → Debug → Open Execute Anonymous Window**

```apex
WasteTradeWebhookService.testWebhookHealth();
```

Check Debug Log - phải thấy:
```
Health Check Status: 200
Health Check Response: {"status":"ok",...}
```

---

## Step 2: Create Triggers

### 2.1 AccountTrigger

**Setup → Object Manager → Account → Triggers → New**

1. Copy nội dung từ `AccountTrigger.trigger`
2. Paste vào editor
3. Click **Save**

**Note**: Trigger này có batch processing và loop prevention qua `Last_Sync_Origin__c`.

### 2.2 ContactTrigger

**Setup → Object Manager → Contact → Triggers → New**

1. Copy nội dung từ `ContactTrigger.trigger`
2. Paste vào editor
3. Click **Save**

**Note**: Trigger này có batch processing và loop prevention qua `Last_Sync_Origin__c`.

### 2.3 OffersTrigger

**Setup → Object Manager → Offers__c → Triggers → New**

1. Copy nội dung từ `OffersTrigger.trigger`
2. Paste vào editor
3. Click **Save**

### 2.4 HaulageOffersTrigger

**Setup → Object Manager → Haulage_Offers__c → Triggers → New**

1. Copy nội dung từ `HaulageOffersTrigger.trigger`
2. Paste vào editor
3. Click **Save**

### 2.5 HaulageLoadsTrigger

**Setup → Object Manager → Haulage_Loads__c → Triggers → New**

1. Copy nội dung từ `HaulageLoadsTrigger.trigger`
2. Paste vào editor
3. Click **Save**

### 2.6 SalesListingTrigger

**Setup → Object Manager → Sales_Listing__c → Triggers → New**

1. Copy nội dung từ `SalesListingTrigger.trigger`
2. Paste vào editor
3. Click **Save**

### 2.7 WantedListingsTrigger

**Setup → Object Manager → Wanted_Listings__c → Triggers → New**

1. Copy nội dung từ `WantedListingsTrigger.trigger`
2. Paste vào editor
3. Click **Save**

### 2.8 ContentDocumentLinkTrigger

**Setup → Object Manager → ContentDocumentLink → Triggers → New**

1. Copy nội dung từ `ContentDocumentLinkTrigger.trigger`
2. Paste vào editor
3. Click **Save**

**Note**: This trigger fires on `after insert` only (document attachments). No loop prevention needed — WT never pushes documents to SF.

---

## Alternative: Create Triggers via Developer Console

1. Mở **Developer Console** (click gear icon → Developer Console)
2. **File → New → Apex Trigger**
3. Chọn Object (Account, Contact, etc.)
4. Đặt tên trigger
5. Paste code và Save

---

## Testing

### Test Account Webhook

```apex
// Find an account with WasteTrade ID
Account acc = [SELECT Id, Name FROM Account WHERE WasteTrade_Company_Id__c != null LIMIT 1];

// Update to trigger webhook
acc.Name = acc.Name + ' (Test)';
update acc;

// Check Debug Logs for webhook result
```

### Test Contact Webhook

```apex
// Find a contact with WasteTrade ID
Contact con = [SELECT Id, Company_Role__c FROM Contact WHERE WasteTrade_User_Id__c != null LIMIT 1];

// Update role to trigger webhook
con.Company_Role__c = 'ADMIN';
update con;
```

### Test Haulage Offer Webhook

```apex
// Find a haulage offer with WasteTrade ID
Haulage_Offers__c offer = [SELECT Id, haulier_listing_status__c FROM Haulage_Offers__c WHERE WasteTrade_Haulage_Offers_ID__c != null LIMIT 1];

// Update status to trigger webhook
offer.haulier_listing_status__c = 'Approved';
update offer;
```

### Test Document Webhook

1. Mở một Haulage Offer record có `WasteTrade_Haulage_Offers_ID__c`
2. Upload một file vào **Files** related list
3. Check Debug Logs - webhook sẽ được gửi

---

## Loop Prevention

### Overview

All `after update` triggers implement loop prevention via the `Last_Sync_Origin__c` field. The `ContentDocumentLinkTrigger` fires on `after insert` only and does not require loop prevention (WT never pushes documents to SF).

### Objects with Loop Prevention

| Object | Trigger | `Last_Sync_Origin__c` field |
|--------|---------|--------------------------|
| Account | AccountTrigger | ✅ |
| Contact | ContactTrigger | ✅ |
| Offers__c | OffersTrigger | ✅ |
| Haulage_Offers__c | HaulageOffersTrigger | ✅ |
| Haulage_Loads__c | HaulageLoadsTrigger | ✅ |
| Sales_Listing__c | SalesListingTrigger | ✅ |
| Wanted_Listings__c | WantedListingsTrigger | ✅ |
| ContentDocumentLink | ContentDocumentLinkTrigger | N/A (insert only) |

### How it works

1. **WasteTrade → Salesforce**: Khi WT sync ra SF, set `Last_Sync_Origin__c = 'WT_<timestamp>'`
2. **Salesforce Trigger**: Check nếu `Last_Sync_Origin__c` **VỪA ĐƯỢC THAY ĐỔI** trong transaction này
   - Nếu origin vừa được set thành `WT_*` → Skip webhook (update từ WasteTrade)
   - Nếu origin không thay đổi (user edit trực tiếp trên SF) → Gửi webhook

### Logic (Apex)

```apex
// WRONG - BUG: Always skip if has WT_ prefix (even from a previous sync)
// This permanently suppresses webhooks after WT syncs once
if (record.Last_Sync_Origin__c != null && record.Last_Sync_Origin__c.startsWith('WT_')) {
    continue; // ❌ Breaks SF→WT sync permanently after first WT push
}

// CORRECT: Only skip if origin was JUST changed in THIS transaction
Boolean originJustSet = record.Last_Sync_Origin__c != oldRecord.Last_Sync_Origin__c
                        && record.Last_Sync_Origin__c != null
                        && record.Last_Sync_Origin__c.startsWith('WT_');
if (originJustSet) {
    continue; // ✅ Only skip when WT just pushed — allows SF user edits afterward
}
```

**Important**: All triggers use the `originJustSet` pattern (not the naive `startsWith` check). The naive check is a known bug that would permanently silence the webhook after any WT-originated update.

### Flow

```
WT update Company → Sync to SF Account (Last_Sync_Origin__c = 'WT_xxx')
                         ↓
SF Account trigger → Last_Sync_Origin__c JUST CHANGED to 'WT_*'?
                         ↓ YES
              SKIP webhook → LOOP PREVENTED ✅

User edit SF Account → Last_Sync_Origin__c NOT CHANGED (still 'WT_xxx')
                         ↓
SF Account trigger → Last_Sync_Origin__c JUST CHANGED?
                         ↓ NO
              SEND webhook → WT receives update ✅
```

### Script to add field on all objects

```bash
cd wastetrade-backend
node scripts/add-sync-origin-field.js
```

Script adds `Last_Sync_Origin__c` to: Account, Contact, Lead, Haulage_Offers__c, Haulage_Loads__c, Sales_Listing__c, Wanted_Listings__c, Offers__c

---

## Troubleshooting

### Webhook Not Firing

1. Check trigger is active: **Setup → Object Manager → [Object] → Triggers**
2. Check record has `WasteTrade_*_Id__c` field populated
3. Check Debug Logs for errors

### Authentication Failed (401)

1. Verify `WEBHOOK_SECRET` in Apex class matches `.env` `SALESFORCE_WEBHOOK_SECRET`
2. Check header name is `X-Salesforce-Secret`

### Connection Error

1. Check Remote Site Setting is active
2. Verify WasteTrade API is accessible
3. Check timeout settings

### Loop Prevention Not Working

1. Verify `Last_Sync_Origin__c` field exists on the object
2. Check field is included in SOQL query in Apex class
3. Verify WasteTrade is setting the field when syncing

---

## Configuration

### WasteTrade API URL

Update `API_BASE_URL` trong `WasteTradeWebhookService.cls`:

```apex
// DEV
private static final String API_BASE_URL = 'https://wastetrade-api-dev.b13devops.com';

// UAT
private static final String API_BASE_URL = 'https://api-uat.wastetrade.com';

// PROD
private static final String API_BASE_URL = 'https://api.wastetrade.com';
```

### Webhook Secret

Update `WEBHOOK_SECRET` trong `WasteTradeWebhookService.cls`:

```apex
private static final String WEBHOOK_SECRET = 'your-secret';
```

Phải match với `SALESFORCE_WEBHOOK_SECRET` trong WasteTrade `.env`

---

## Checklist

- [ ] Remote Site Setting created (DEV / UAT / TEST)
- [ ] `Last_Sync_Origin__c` field added on all objects (run `node scripts/add-sync-origin-field.js`)
- [ ] `WasteTradeWebhookService` Apex class created
- [ ] `AccountTrigger` created and active
- [ ] `ContactTrigger` created and active
- [ ] `OffersTrigger` created and active
- [ ] `HaulageOffersTrigger` created and active
- [ ] `HaulageLoadsTrigger` created and active
- [ ] `SalesListingTrigger` created and active
- [ ] `WantedListingsTrigger` created and active
- [ ] `ContentDocumentLinkTrigger` created and active
- [ ] Health check returns 200
- [ ] Test webhooks working
- [ ] Loop prevention verified: WT push → no echo webhook fired
