# Salesforce Integration - Complete Setup Guide

Hướng dẫn đầy đủ để setup Salesforce integration cho WasteTrade.

---

## Mục lục

1. [Prerequisites](#1-prerequisites)
2. [Tạo Connected App](#2-tạo-connected-app-trong-salesforce)
3. [Lấy Security Token](#3-lấy-security-token)
4. [Cấu hình Environment Variables](#4-cấu-hình-environment-variables)
5. [Setup Custom Objects](#5-setup-custom-objects-trong-salesforce)
6. [Test Connection](#6-test-connection)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisites

- Salesforce org với System Administrator access
- Access vào Salesforce Setup menu
- Email để nhận verification codes và security token

**Salesforce URLs:**
- UAT Sandbox: https://letsrecycleit--uat.sandbox.my.salesforce.com/
- Production: https://login.salesforce.com

---

## 2. Tạo Connected App trong Salesforce

### 2.1 Navigate to App Manager
1. Login vào Salesforce org (Sandbox hoặc Production)
2. Click **Setup** gear icon (⚙️) góc trên phải
3. Quick Find → gõ "App Manager"
4. Click **App Manager** under Apps

### 2.2 Create New Connected App
1. Click **New Connected App**
2. Điền **Basic Information**:
   - **Connected App Name**: `WasteTrade Backend Integration`
   - **API Name**: `WasteTrade_Backend_Integration`
   - **Contact Email**: Email của bạn
   - **Description**: `API integration for WasteTrade backend system`

### 2.3 Configure OAuth Settings
1. Check **Enable OAuth Settings**
2. **Callback URL**: `https://login.salesforce.com/services/oauth2/success`
3. **Selected OAuth Scopes** - thêm các scopes sau:
   - `Full access (full)`
   - `Perform requests on your behalf at any time (refresh_token, offline_access)`
   - `Access and manage your data (api)`
   - `Access your basic information (id, profile, email, address, phone)`

4. Check thêm (recommended):
   - **Require Secret for Web Server Flow**
   - **Require Secret for Refresh Token Flow**

5. Click **Save** → Đợi 2-10 phút để Connected App active

### 2.4 Lấy Client ID và Client Secret
1. Sau khi save, click **Manage Consumer Details**
2. Verify identity (email/SMS code)
3. Copy credentials:
   - **Consumer Key** → `SALESFORCE_CLIENT_ID`
   - **Consumer Secret** → `SALESFORCE_CLIENT_SECRET`

⚠️ **Lưu ý**: Lưu trữ an toàn, không commit vào git!

### 2.5 Configure OAuth Policies
1. Quay lại Connected App → **Edit Policies**
2. Cấu hình:
   - **Permitted Users**: `Admin approved users are pre-authorized`
   - **IP Relaxation**: `Relax IP restrictions` (dev) hoặc `Enforce IP restrictions` (prod)
   - **Refresh Token Policy**: `Refresh token is valid until revoked`

---

## 3. Lấy Security Token

### 3.1 Quick Link (UAT Sandbox)
https://letsrecycleit--uat.sandbox.lightning.force.com/lightning/settings/personal/ResetApiToken/home

### 3.2 Manual Steps
1. Login Salesforce
2. Click profile icon (góc trên phải) → **Settings**
3. Left sidebar: **Personal** → **Reset My Security Token**
4. Click **Reset Security Token**
5. Check email → Copy token

### 3.3 Lưu ý quan trọng
- Token tự động reset khi đổi password
- Chỉ có 1 token active tại một thời điểm
- Token không expire trừ khi reset hoặc đổi password

---

## 4. Cấu hình Environment Variables

### 4.1 Tất cả biến cần thiết

```bash
# === SALESFORCE CREDENTIALS ===
# Consumer Key từ Connected App
SALESFORCE_CLIENT_ID=your_consumer_key

# Consumer Secret từ Connected App
SALESFORCE_CLIENT_SECRET=your_consumer_secret

# Salesforce user credentials
SALESFORCE_USERNAME=your_username@company.com
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_security_token

# === ENVIRONMENT URLs ===
# Dùng 1 trong 2 tùy môi trường
SALESFORCE_SANDBOX_URL=https://test.salesforce.com
SALESFORCE_PRODUCTION_URL=https://login.salesforce.com

# === API CONFIG ===
SALESFORCE_API_VERSION=58.0
SALESFORCE_SYNC_ENABLED=true
SALESFORCE_AUTO_SYNC=false
```

### 4.2 Ví dụ cho UAT Sandbox

```bash
SALESFORCE_CLIENT_ID=3MVG9YDQS5WtC11paomhukuMyToken
SALESFORCE_CLIENT_SECRET=1234567890123456789
SALESFORCE_USERNAME=developer@b13technology.com.uat
SALESFORCE_PASSWORD=yourpassword
SALESFORCE_SECURITY_TOKEN=ABC123DEF456GHI789
SALESFORCE_SANDBOX_URL=https://test.salesforce.com
SALESFORCE_API_VERSION=58.0
SALESFORCE_SYNC_ENABLED=true
```

### 4.3 Bảng mô tả biến

| Variable | Mô tả | Required |
|----------|-------|----------|
| `SALESFORCE_CLIENT_ID` | Consumer Key từ Connected App | ✅ |
| `SALESFORCE_CLIENT_SECRET` | Consumer Secret từ Connected App | ✅ |
| `SALESFORCE_USERNAME` | Salesforce user email | ✅ |
| `SALESFORCE_PASSWORD` | Salesforce password | ✅ |
| `SALESFORCE_SECURITY_TOKEN` | Security token từ email | ✅ |
| `SALESFORCE_SANDBOX_URL` | URL cho sandbox | Dev only |
| `SALESFORCE_PRODUCTION_URL` | URL cho production | Prod only |
| `SALESFORCE_API_VERSION` | API version (58.0) | ✅ |
| `SALESFORCE_SYNC_ENABLED` | Enable/disable sync | ✅ |

---

## 5. Setup Custom Objects trong Salesforce

### 5.1 Các Custom Objects cần tạo

| Object | API Name | Mô tả |
|--------|----------|-------|
| Sales Listing | `Sales_Listing__c` | Listings bán |
| Wanted Listing | `Wanted_Listings__c` | Listings muốn mua |
| Offer | `Offers__c` | Offers/Bids |
| Haulage Offer | `Haulage_Offers__c` | Haulage offers |
| Document | `Document__c` | Company/Location documents |

### 5.2 Tạo Custom Object
1. **Setup** → **Object Manager** → **Create** → **Custom Object**
2. Điền thông tin object
3. Enable: Reports, Activities, Track Field History

### 5.3 External ID Fields (quan trọng!)

Mỗi object cần có External ID field để sync:

| Object | External ID Field |
|--------|-------------------|
| Account | `WasteTrade_Company_Id__c` |
| Lead | `WasteTrade_User_Id__c` |
| Contact | `WasteTrade_User_Id__c` |
| Sales_Listing__c | `WasteTrade_Listing_Id__c` |
| Wanted_Listings__c | `WasteTrade_Listing_Id__c` |
| Offers__c | `WasteTrade_Offer_Id__c` |
| Haulage_Offers__c | `WasteTrade_Haulage_Offer_Id__c` |

### 5.4 Tạo Missing Objects bằng Script

```powershell
cd wastetrade-backend
node scripts/create-missing-objects.js
```

Script này sẽ tạo các objects và fields còn thiếu.

### 5.5 Field-Level Security
1. **Setup** → **Users** → **Profiles**
2. Edit profile → **Custom Field-Level Security**
3. Grant Read/Edit cho tất cả custom fields

---

## 6. Test Connection

### 6.1 Test bằng Script

```powershell
cd wastetrade-backend
node scripts/test-salesforce-connection.js
```

Expected output:
```
✅ Connection successful
✅ Account object exists
✅ Lead object exists
✅ Sales_Listing__c exists
...
```

### 6.2 Test bằng API

```powershell
# Health check
Invoke-RestMethod -Uri "https://wastetrade-api-dev.b13devops.com/salesforce/health" -Method GET

# Test connection
Invoke-RestMethod -Uri "https://wastetrade-api-dev.b13devops.com/salesforce/test-connection" -Method GET

# Sync 1 company (test)
Invoke-RestMethod -Uri "https://wastetrade-api-dev.b13devops.com/salesforce/sync/companies?limit=1" -Method POST
```

### 6.3 Verify trong Salesforce

1. Login Salesforce
2. Check **Setup** → **Connected Apps OAuth Usage**
3. Xem records trong các objects:
   - Accounts: https://letsrecycleit--uat.sandbox.my.salesforce.com/lightning/o/Account/list
   - Leads: https://letsrecycleit--uat.sandbox.my.salesforce.com/lightning/o/Lead/list

---

## 7. Troubleshooting

### 7.1 Connection Errors

**Error: `INVALID_LOGIN: Invalid username, password, security token`**
- Kiểm tra username format (sandbox: `user@company.com.uat`)
- Reset security token và update .env
- Verify password đúng

**Error: `INVALID_CLIENT_ID` hoặc `INVALID_CLIENT`**
- Verify Consumer Key/Secret từ Connected App
- Đợi 2-10 phút sau khi tạo Connected App
- Check Connected App đã active chưa

**Error: `IP Restricted`**
- Edit Connected App → OAuth Policies → IP Relaxation → `Relax IP restrictions`
- Hoặc thêm server IP vào Trusted IP Ranges

### 7.2 Sync Errors

**Error: `Only absolute URLs are supported`**
- URLs trong data thiếu protocol
- Code đã auto-fix bằng cách thêm `https://`

**Error: `The requested resource does not exist`**
- Custom object hoặc field chưa tồn tại
- Chạy: `node scripts/create-missing-objects.js`

**Error: `REQUEST_LIMIT_EXCEEDED`**
- Đã giảm batch size xuống 50 và delay 2000ms
- Nếu vẫn lỗi, tăng delay thêm

### 7.3 Debug Steps

1. Check Salesforce Login History: **Setup** → **Login History**
2. Check API Usage: **Setup** → **System Overview** → **API Usage**
3. Check logs trong backend console
4. Verify credentials bằng script test

### 7.4 Quick Commands

```powershell
# Test connection
node scripts/test-salesforce-connection.js

# Create missing objects
node scripts/create-missing-objects.js

# Test sync
node scripts/test-salesforce-sync.js

# Start backend
pnpm dev
```

---

## Checklist Setup

- [ ] Tạo Connected App trong Salesforce
- [ ] Copy Consumer Key → `SALESFORCE_CLIENT_ID`
- [ ] Copy Consumer Secret → `SALESFORCE_CLIENT_SECRET`
- [ ] Reset và copy Security Token
- [ ] Cấu hình .env với tất cả credentials
- [ ] Chạy `node scripts/create-missing-objects.js`
- [ ] Test connection: `node scripts/test-salesforce-connection.js`
- [ ] Verify sync hoạt động

---

*Last Updated: December 2024*
