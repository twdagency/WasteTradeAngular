# Salesforce Inbound Webhook Setup Guide

## Overview

Hướng dẫn này giúp setup Salesforce để gọi webhooks về WasteTrade khi có thay đổi data trong Salesforce (Inbound Sync: SF → WT).

**Salesforce UAT URL**: https://letsrecycleit--uat.sandbox.my.salesforce.com/

## Webhook Endpoints (WasteTrade Backend)

**WasteTrade API URL**: `https://wastetrade-api-dev.b13devops.com`
**Salesforce UAT URL**: `https://letsrecycleit--uat.sandbox.my.salesforce.com/`

| Endpoint                                        | Mục đích                         | Trigger                     |
| ----------------------------------------------- | -------------------------------- | --------------------------- |
| `POST /salesforce/webhook/account-updated`      | Sync Account → Company           | Account updated             |
| `POST /salesforce/webhook/contact-updated`      | Sync Contact → User/CompanyUsers | Contact updated             |
| `POST /salesforce/webhook/haulage-offer-status` | Sync Haulage Offer status        | Haulage_Offers\_\_c updated |
| `POST /salesforce/webhook/haulage-documents`    | Receive documents                | Documents created           |
| `POST /salesforce/webhook/health`               | Health check                     | Manual test                 |

---

## Loop Prevention Mechanism

### How it works

Để tránh infinite loop khi sync 2 chiều (WT ↔ SF), hệ thống sử dụng field `Last_Sync_Origin__c`:

1. **WasteTrade → Salesforce**: Khi WT sync ra SF, set `Last_Sync_Origin__c = 'WT_<timestamp>'`
2. **Salesforce Trigger**: Check `Last_Sync_Origin__c` trước khi gửi webhook
    - Nếu bắt đầu bằng `WT_` → Skip webhook (update từ WasteTrade)
    - Nếu không → Gửi webhook với `originMarker = 'SF_<id>'`
3. **WasteTrade Webhook**: Check `originMarker` trong payload
    - Nếu bắt đầu bằng `WT_` → Ignore (loop prevention)
    - Nếu không → Process update

### Flow Example

```
WT update Company → Sync to SF Account (Last_Sync_Origin__c = 'WT_1703318400000')
                         ↓
SF Account trigger → Check Last_Sync_Origin__c starts with 'WT_' → SKIP webhook
                         ↓
                    LOOP PREVENTED ✅
```

---

## Prerequisites

### 1. WasteTrade Backend Configuration

Đảm bảo `.env` có:

```env
SALESFORCE_WEBHOOK_SECRET=your-secret
```

### 2. Add Last_Sync_Origin\_\_c Field

Chạy script để thêm field `Last_Sync_Origin__c` vào các object:

```bash
node scripts/add-sync-origin-field.js
```

Script sẽ thêm field vào: Account, Contact, Lead, Haulage_Offers**c, Sales_Listing**c, Wanted_Listings\_\_c

---

## Step 1: Add Remote Site Setting

**Setup → Security → Remote Site Settings → New**

```
Remote Site Name: WasteTrade_API_DEV
Remote Site URL: https://wastetrade-api-dev.b13devops.com
Description: WasteTrade API for webhook callbacks
Active: ✓
```

---

## Step 2: Create Named Credential (Recommended)

**Setup → Security → Named Credentials → New**

```
Label: WasteTrade Webhook
Name: WasteTrade_Webhook
URL: https://wastetrade-api-dev.b13devops.com
Identity Type: Anonymous
Authentication Protocol: No Authentication

Custom Headers:
  Header Name: X-Salesforce-Secret
  Header Value: your-secret

  Header Name: Content-Type
  Header Value: application/json
```

---

## Step 3: Create Apex Classes for HTTP Callouts

### 3.1 WasteTradeWebhookService.cls

**Setup → Apex Classes → New**

```apex
/**
 * WasteTrade Webhook Service
 * Handles HTTP callouts to WasteTrade API for inbound sync
 */
public class WasteTradeWebhookService {

    // Configure your WasteTrade API URL here
    private static final String API_BASE_URL = 'https://wastetrade-api-dev.b13devops.com';
    private static final String WEBHOOK_SECRET = 'your-secret'; // Match .env SALESFORCE_WEBHOOK_SECRET

    /**
     * Send Account update to WasteTrade
     */
    @future(callout=true)
    public static void sendAccountUpdate(Id accountId) {
        Account acc = [
            SELECT Id, Name, WasteTrade_Company_Id__c,
                   BillingStreet, BillingCity, BillingPostalCode,
                   BillingCountry, BillingState, Phone, Website,
                   Account_Status__c, LastModifiedDate, LastModifiedBy.Email
            FROM Account
            WHERE Id = :accountId
            LIMIT 1
        ];

        if (acc.WasteTrade_Company_Id__c == null) {
            System.debug('Skipping account without WasteTrade ID: ' + accountId);
            return;
        }

        Map<String, Object> payload = new Map<String, Object>{
            'accountId' => acc.Id,
            'externalId' => acc.WasteTrade_Company_Id__c,
            'name' => acc.Name,
            'billingStreet' => acc.BillingStreet,
            'billingCity' => acc.BillingCity,
            'billingPostalCode' => acc.BillingPostalCode,
            'billingCountry' => acc.BillingCountry,
            'billingState' => acc.BillingState,
            'phone' => acc.Phone,
            'website' => acc.Website,
            'accountStatus' => acc.Account_Status__c,
            'updatedAt' => acc.LastModifiedDate.format('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
            'updatedBy' => acc.LastModifiedBy.Email,
            'originMarker' => 'SF_' + acc.Id
        };

        sendWebhook('/salesforce/webhook/account-updated', payload);
    }

    /**
     * Send Contact update to WasteTrade
     */
    @future(callout=true)
    public static void sendContactUpdate(Id contactId) {
        Contact con = [
            SELECT Id, WasteTrade_User_Id__c, AccountId, Account.WasteTrade_Company_Id__c,
                   Email, FirstName, LastName, Phone,
                   Company_Role__c, Is_Primary_Contact__c, Company_User_Status__c,
                   LastModifiedDate, LastModifiedBy.Email
            FROM Contact
            WHERE Id = :contactId
            LIMIT 1
        ];

        if (con.WasteTrade_User_Id__c == null) {
            System.debug('Skipping contact without WasteTrade ID: ' + contactId);
            return;
        }

        Map<String, Object> payload = new Map<String, Object>{
            'contactId' => con.Id,
            'externalId' => con.WasteTrade_User_Id__c,
            'accountId' => con.AccountId,
            'accountExternalId' => con.Account.WasteTrade_Company_Id__c,
            'email' => con.Email,
            'firstName' => con.FirstName,
            'lastName' => con.LastName,
            'phone' => con.Phone,
            'companyRole' => con.Company_Role__c,
            'isPrimaryContact' => con.Is_Primary_Contact__c,
            'memberStatus' => con.Company_User_Status__c,
            'updatedAt' => con.LastModifiedDate.format('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
            'updatedBy' => con.LastModifiedBy.Email,
            'originMarker' => 'SF_' + con.Id
        };

        sendWebhook('/salesforce/webhook/contact-updated', payload);
    }

    /**
     * Send Haulage Offer status update to WasteTrade
     */
    @future(callout=true)
    public static void sendHaulageOfferStatusUpdate(Id haulageOfferId) {
        Haulage_Offers__c offer = [
            SELECT Id, WasteTrade_Haulage_Offers_ID__c, haulier_listing_status__c,
                   haulage_rejection_reason__c, post_notes__c,
                   LastModifiedDate, LastModifiedBy.Email
            FROM Haulage_Offers__c
            WHERE Id = :haulageOfferId
            LIMIT 1
        ];

        if (offer.WasteTrade_Haulage_Offers_ID__c == null) {
            System.debug('Skipping haulage offer without WasteTrade ID: ' + haulageOfferId);
            return;
        }

        // Extract numeric ID from external ID (remove DEV_/UAT_/PROD_ prefix)
        String externalId = offer.WasteTrade_Haulage_Offers_ID__c;
        String numericId = externalId.replaceAll('^(DEV_|TEST_|UAT_|PROD_)', '');

        Map<String, Object> payload = new Map<String, Object>{
            'haulageOfferId' => Integer.valueOf(numericId),
            'salesforceId' => offer.Id,
            'status' => mapHaulageStatus(offer.haulier_listing_status__c),
            'rejectionReason' => offer.haulage_rejection_reason__c,
            'adminMessage' => offer.post_notes__c,
            'updatedAt' => offer.LastModifiedDate.format('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
            'updatedBy' => offer.LastModifiedBy.Email,
            'originMarker' => 'SF_' + offer.Id
        };

        sendWebhook('/salesforce/webhook/haulage-offer-status', payload);
    }

    /**
     * Map Salesforce haulage status to WasteTrade status
     */
    private static String mapHaulageStatus(String sfStatus) {
        if (sfStatus == null) return 'PENDING';

        Map<String, String> statusMap = new Map<String, String>{
            'Pending Approval' => 'PENDING',
            'Approved' => 'ACCEPTED',
            'Rejected' => 'REJECTED'
        };

        return statusMap.containsKey(sfStatus) ? statusMap.get(sfStatus) : 'PENDING';
    }

    /**
     * Generic webhook sender
     */
    private static void sendWebhook(String endpoint, Map<String, Object> payload) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(API_BASE_URL + endpoint);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('X-Salesforce-Secret', WEBHOOK_SECRET);
        req.setBody(JSON.serialize(payload));
        req.setTimeout(30000);

        try {
            Http http = new Http();
            HttpResponse res = http.send(req);

            if (res.getStatusCode() == 200) {
                System.debug('✅ Webhook sent successfully to ' + endpoint);
            } else {
                System.debug('❌ Webhook failed: ' + res.getStatusCode() + ' - ' + res.getBody());
            }
        } catch (Exception e) {
            System.debug('❌ Webhook error: ' + e.getMessage());
        }
    }
}
```

---

## Step 4: Create Apex Triggers

### 4.1 AccountTrigger.trigger

**Setup → Apex Triggers → New (on Account)**

```apex
trigger AccountTrigger on Account (after update) {
    if (Trigger.isAfter && Trigger.isUpdate) {
        for (Account acc : Trigger.new) {
            Account oldAcc = Trigger.oldMap.get(acc.Id);

            // Only sync if has WasteTrade ID and relevant fields changed
            if (acc.WasteTrade_Company_Id__c != null) {
                Boolean shouldSync =
                    acc.Name != oldAcc.Name ||
                    acc.BillingStreet != oldAcc.BillingStreet ||
                    acc.BillingCity != oldAcc.BillingCity ||
                    acc.BillingPostalCode != oldAcc.BillingPostalCode ||
                    acc.BillingCountry != oldAcc.BillingCountry ||
                    acc.Phone != oldAcc.Phone ||
                    acc.Website != oldAcc.Website;

                if (shouldSync) {
                    WasteTradeWebhookService.sendAccountUpdate(acc.Id);
                }
            }
        }
    }
}
```

### 4.2 ContactTrigger.trigger

**Setup → Apex Triggers → New (on Contact)**

```apex
trigger ContactTrigger on Contact (after update) {
    if (Trigger.isAfter && Trigger.isUpdate) {
        for (Contact con : Trigger.new) {
            Contact oldCon = Trigger.oldMap.get(con.Id);

            // Only sync if has WasteTrade ID and relevant fields changed
            if (con.WasteTrade_User_Id__c != null) {
                Boolean shouldSync =
                    con.FirstName != oldCon.FirstName ||
                    con.LastName != oldCon.LastName ||
                    con.Phone != oldCon.Phone ||
                    con.Company_Role__c != oldCon.Company_Role__c ||
                    con.Is_Primary_Contact__c != oldCon.Is_Primary_Contact__c ||
                    con.Company_User_Status__c != oldCon.Company_User_Status__c;

                if (shouldSync) {
                    WasteTradeWebhookService.sendContactUpdate(con.Id);
                }
            }
        }
    }
}
```

### 4.3 HaulageOffersTrigger.trigger

**Setup → Apex Triggers → New (on Haulage_Offers\_\_c)**

```apex
trigger HaulageOffersTrigger on Haulage_Offers__c (after update) {
    if (Trigger.isAfter && Trigger.isUpdate) {
        for (Haulage_Offers__c offer : Trigger.new) {
            Haulage_Offers__c oldOffer = Trigger.oldMap.get(offer.Id);

            // Only sync if has WasteTrade ID and status changed
            if (offer.WasteTrade_Haulage_Offers_ID__c != null) {
                Boolean shouldSync =
                    offer.haulier_listing_status__c != oldOffer.haulier_listing_status__c ||
                    offer.haulage_rejection_reason__c != oldOffer.haulage_rejection_reason__c;

                if (shouldSync) {
                    WasteTradeWebhookService.sendHaulageOfferStatusUpdate(offer.Id);
                }
            }
        }
    }
}
```

---

## Step 5: Test Webhooks

### 5.1 Test Health Check

**Developer Console → Execute Anonymous**

```apex
HttpRequest req = new HttpRequest();
req.setEndpoint('https://wastetrade-api-dev.b13devops.com/salesforce/webhook/health');
req.setMethod('POST');
req.setHeader('Content-Type', 'application/json');

Http http = new Http();
HttpResponse res = http.send(req);

System.debug('Status: ' + res.getStatusCode());
System.debug('Body: ' + res.getBody());
```

### 5.2 Test Account Update

```apex
// Find an account with WasteTrade ID
Account acc = [SELECT Id, Name FROM Account WHERE WasteTrade_Company_Id__c != null LIMIT 1];

// Update name to trigger webhook
acc.Name = acc.Name + ' (Test)';
update acc;

// Check debug logs for webhook result
```

### 5.3 Test Contact Update

```apex
// Find a contact with WasteTrade ID
Contact con = [SELECT Id, Company_Role__c FROM Contact WHERE WasteTrade_User_Id__c != null LIMIT 1];

// Update role to trigger webhook
con.Company_Role__c = 'ADMIN';
update con;
```

---

## Field Mapping Reference

### Account → Company

| Salesforce Field           | WasteTrade Field | Notes                   |
| -------------------------- | ---------------- | ----------------------- |
| `WasteTrade_Company_Id__c` | `id`             | External ID (required)  |
| `Name`                     | `name`           | Remove env prefix       |
| `BillingStreet`            | `addressLine1`   |                         |
| `BillingCity`              | `city`           |                         |
| `BillingPostalCode`        | `postalCode`     |                         |
| `BillingCountry`           | `country`        |                         |
| `BillingState`             | `stateProvince`  |                         |
| `Phone`                    | `phoneNumber`    |                         |
| `Website`                  | `website`        |                         |
| `Account_Status__c`        | `status`         | PENDING/ACTIVE/REJECTED |

### Contact → User/CompanyUsers

| Salesforce Field                   | WasteTrade Field                | Notes                      |
| ---------------------------------- | ------------------------------- | -------------------------- |
| `WasteTrade_User_Id__c`            | `user.id`                       | External ID (required)     |
| `Account.WasteTrade_Company_Id__c` | `companyUsers.companyId`        | For CompanyUsers lookup    |
| `FirstName`                        | `user.firstName`                |                            |
| `LastName`                         | `user.lastName`                 |                            |
| `Phone`                            | `user.phoneNumber`              |                            |
| `Company_Role__c`                  | `companyUsers.companyRole`      | ADMIN/BUYER/SELLER/HAULIER |
| `Is_Primary_Contact__c`            | `companyUsers.isPrimaryContact` | Boolean                    |
| `Company_User_Status__c`           | `companyUsers.status`           | PENDING/ACTIVE/REJECTED    |

### Haulage_Offers\_\_c → HaulageOffers

| Salesforce Field                  | WasteTrade Field  | Notes                  |
| --------------------------------- | ----------------- | ---------------------- |
| `WasteTrade_Haulage_Offers_ID__c` | `id`              | External ID (required) |
| `haulier_listing_status__c`       | `status`          | Map to enum            |
| `haulage_rejection_reason__c`     | `rejectionReason` |                        |
| `post_notes__c`                   | `adminMessage`    |                        |

---

## Troubleshooting

### Webhook Not Firing

1. Check trigger is active: **Setup → Apex Triggers**
2. Check record has `WasteTrade_*_Id__c` field populated
3. Check Debug Logs for errors

### Authentication Failed (401)

1. Verify `SALESFORCE_WEBHOOK_SECRET` matches in both systems
2. Check header name is `X-Salesforce-Secret`

### Stale Update (409)

- WasteTrade has newer data - this is expected behavior
- No action needed

### Connection Timeout

1. Check Remote Site Setting is active
2. Verify WasteTrade API is accessible
3. Increase timeout in Apex code

---

## Checklist

### Salesforce Setup

- [ ] Remote Site Setting created
- [ ] Named Credential created (optional)
- [ ] `WasteTradeWebhookService` Apex class created
- [ ] `AccountTrigger` created and active
- [ ] `ContactTrigger` created and active
- [ ] `HaulageOffersTrigger` created and active

### WasteTrade Setup

- [ ] `SALESFORCE_WEBHOOK_SECRET` configured in `.env`
- [ ] Backend deployed with webhook endpoints

### Testing

- [ ] Health check returns 200
- [ ] Account update triggers webhook
- [ ] Contact update triggers webhook
- [ ] Haulage offer status update triggers webhook

---

## Notes

- **Loop Prevention**: Webhooks include `originMarker` starting with `SF_` to prevent infinite loops
- **Stale Updates**: WasteTrade rejects updates older than its current data
- **Async Processing**: Triggers use `@future(callout=true)` for async HTTP calls
- **Error Handling**: Failed webhooks are logged but don't block Salesforce operations
