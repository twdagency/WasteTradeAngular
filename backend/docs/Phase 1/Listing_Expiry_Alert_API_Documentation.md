# Listing Expiry Alert - API Documentation

## Overview

The Listing Expiry Alert feature automatically manages the lifecycle of both Sales and Wanted listings according to the following rules:

- **Default Expiry**: All listings expire 90 days after creation per Phase 2 requirements
- **Custom Expiry**: Listings can have custom expiry dates via `endDate` field (`listingDuration` supported for backward compatibility)
- **Warning Period**: Expiry alerts are shown in the final 7 days before expiration
- **Automated Process**: Daily cronjob marks expired listings and sends email notifications
- **Visibility**: Alerts are only visible to listing owners

## 📅 Expiry Date Management

### Date Field Hierarchy
The system uses the following priority for determining listing expiry:

1. **`endDate`** - Primary expiry date field (set directly by users)
2. **`listingDuration`** - Legacy fallback field (for backward compatibility with old API clients)
3. **Default Calculation** - `createdAt` + 90 days per Phase 2 requirements

### Date Field Relationship
```typescript
// During listing creation, endDate priority:
endDate: listingData.endDate ? new Date(listingData.endDate) : 
         (listingData.listingDuration ? new Date(listingData.listingDuration) : undefined)

// Expiry calculation always uses endDate first:
expiryDate = listing.endDate || new Date(listing.createdAt.getTime() + (90 * 24 * 60 * 60 * 1000)) // Phase 2: 90 days
```

## 🔄 Automated Process

### Daily Cronjob
- **Schedule**: Runs daily at 9:00 AM (Asia/Ho_Chi_Minh timezone)
- **Actions**:
  1. **Reset SOLD ongoing listings** - Resets ongoing listings back to `available` when their reset date (`endDate`) arrives
  2. **Renew ongoing listings** - Updates `endDate` for listings with `listingRenewalPeriod` set
  3. Mark expired listings with status `expired` (excludes ongoing listings)
  4. Send email notifications for listings expiring within 7 days

### Ongoing Listings Auto-Renewal
Listings with `listingRenewalPeriod` set will automatically renew:
- **Weekly**: Adds 7 days to `endDate`
- **Fortnightly**: Adds 14 days to `endDate`
- **Monthly**: Adds 1 month to `endDate`
- Ongoing listings are **never marked as expired** - they renew indefinitely until manually removed

### Ongoing Listings Mark as Sold
When an ongoing listing is marked as sold (manually or via offer acceptance):
- Status set to `sold`, `remainingQuantity` set to 0
- **Reset date** calculated as `startDate + renewalPeriod` and stored in `endDate`
- All pending/approved offers are rejected
- Listing hidden from marketplace (visible only with "Show SOLD" filter)
- Listing shown as **"Sold (Available from DD/MM/YYYY)"** in product card and details
- On reset date, cronjob auto-resets: status → `available`, `remainingQuantity` → `quantity`, `endDate` extended

### Manual Trigger (Admin Only)
```bash
curl -X POST 'https://wastetrade-api-dev.b13devops.com/listing-expiry/check' \
-H 'Authorization: Bearer {JWT_TOKEN}' \
-H 'Content-Type: application/json'
```
Response includes `reset` (SOLD ongoing reset count), `expired`, and `warnings`.

## 📊 Expiry Information Structure

When included in API responses, expiry information follows this structure:

```json
{
  "expiryInfo": {
    "isExpired": false,
    "isNearingExpiry": true,
    "daysUntilExpiry": 5,
    "expiryDate": "2024-01-31T10:00:00.000Z"
  }
}
```

### ExpiryInfo Properties

| Property | Type | Description |
|----------|------|-------------|
| `isExpired` | boolean | True if listing has passed expiry date |
| `isNearingExpiry` | boolean | True if listing expires within 7 days |
| `daysUntilExpiry` | number | Days remaining until expiry (0 if expired) |
| `expiryDate` | string | ISO date when listing expires |

## 🔍 API Endpoints

### 1. Create Listing with Custom Expiry

**POST** `/listings`

Create a new listing with optional custom expiry date using `endDate` field (or `listingDuration` for backward compatibility).

#### Request Example:
```bash
curl -X POST 'https://wastetrade-api-dev.b13devops.com/listings' \
-H 'Authorization: Bearer {JWT_TOKEN}' \
-H 'Content-Type: application/json' \
-d '{
  "companyId": 45,
  "materialType": "plastic",
  "materialItem": "hdpe",
  "listingType": "sell",
  "title": "HDPE Plastic Waste",
  "description": "High quality HDPE plastic waste",
  "quantity": 1000,
  "currency": "gbp",
  "pricePerMetricTonne": 250,
  "country": "United Kingdom",
  "startDate": "2024-01-01T10:00:00.000Z",
  "endDate": "2024-02-15T10:00:00.000Z",
  "documents": [
    {
      "documentType": "photo",
      "documentUrl": "https://example.com/photo.jpg"
    }
  ]
}'
```

#### Request Body Fields (Date-Related):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startDate` | string (ISO date) | Yes | When listing becomes active |
| `endDate` | string (ISO date) | No | Custom expiry date (must be future date) |
| `listingDuration` | string (ISO date) | No | Legacy field for backward compatibility (use `endDate` instead) |
| `listingRenewalPeriod` | string | No | Auto-renewal interval (`daily`, `weekly`, `monthly`, `yearly`) |

#### Response:
```json
{
  "status": "success",
  "data": {
    "listing": {
      "id": 789,
      "title": "HDPE Plastic Waste",
      "materialType": "plastic",
      "listingType": "sell",
      "status": "pending",
      "state": "pending",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "startDate": "2024-01-01T10:00:00.000Z",
      "endDate": "2024-02-15T10:00:00.000Z",
      "listingDuration": "2024-02-15T10:00:00.000Z",
      "listingRenewalPeriod": null,
      "companyId": 45,
      "createdByUserId": 67
    },
    "documents": [...]
  },
  "message": "Listing created successfully"
}
```

#### Business Logic:
- **Primary**: If `endDate` is provided, it's used directly as the expiry date
- **Fallback**: If `endDate` is not provided but `listingDuration` is, then `listingDuration` is copied to `endDate`
- **Default**: If neither is provided, `endDate` is automatically set to 90 days from `startDate` (Phase 2 requirement)
- Custom expiry dates must be future dates or validation error occurs
- **Recommendation**: Use `endDate` for new implementations, `listingDuration` is maintained for backward compatibility

### 2. Get Single Listing with Expiry Info

**GET** `/listings/{id}`

#### Response Example:
```bash
curl -X GET 'https://wastetrade-api-dev.b13devops.com/listings/123' \
-H 'Authorization: Bearer {JWT_TOKEN}' \
-H 'accept: application/json'
```

```json
{
  "status": "success",
  "data": {
    "listing": {
      "id": 123,
      "title": "Plastic Waste - HDPE",
      "materialType": "plastic",
      "listingType": "sell",
      "status": "available",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "endDate": "2024-01-31T10:00:00.000Z",
      "listingDuration": "2024-01-31T10:00:00.000Z",
      "companyId": 45,
      "createdByUserId": 67,
      "expiryInfo": {
        "isExpired": false,
        "isNearingExpiry": true,
        "daysUntilExpiry": 5,
        "expiryDate": "2024-01-31T10:00:00.000Z"
      },
      "documents": [...]
    },
    "company": {...}
  }
}
```

### 3. Get Expired Listings (Admin Only)

**GET** `/listing-expiry/expired`

Lists all listings that should be marked as expired.

```bash
curl -X GET 'https://wastetrade-api-dev.b13devops.com/listing-expiry/expired' \
-H 'Authorization: Bearer {ADMIN_JWT_TOKEN}' \
-H 'accept: application/json'
```

#### Response:
```json
{
  "status": "success",
  "data": {
    "listings": [
      {
        "id": 456,
        "title": "Metal Scrap",
        "status": "available",
        "createdAt": "2023-11-15T10:00:00.000Z",
        "materialType": "metal",
        "listingType": "sell"
      }
    ],
    "count": 1
  }
}
```

### 4. Get Listings Nearing Expiry (Admin Only)

**GET** `/listing-expiry/warnings`

Lists all listings that need expiry warnings (expire within 7 days).

```bash
curl -X GET 'https://wastetrade-api-dev.b13devops.com/listing-expiry/warnings' \
-H 'Authorization: Bearer {ADMIN_JWT_TOKEN}' \
-H 'accept: application/json'
```

#### Response:
```json
{
  "status": "success",
  "data": {
    "listings": [
      {
        "id": 789,
        "title": "Paper Waste",
        "status": "available",
        "createdAt": "2024-01-20T10:00:00.000Z",
        "materialType": "fibre",
        "listingType": "wanted"
      }
    ],
    "count": 1
  }
}
```

### 5. Manual Expiry Check (Admin Only)

**POST** `/listing-expiry/check`

Manually triggers the expiry check process.

```bash
curl -X POST 'https://wastetrade-api-dev.b13devops.com/listing-expiry/check' \
-H 'Authorization: Bearer {ADMIN_JWT_TOKEN}' \
-H 'Content-Type: application/json'
```

#### Response:
```json
{
  "status": "success",
  "data": {
    "expired": {
      "updated": 3,
      "listings": [...]
    },
    "warnings": {
      "sent": 5,
      "failed": 0
    }
  }
}
```

## 📧 Email Notifications

### Expiry Warning Email
- **Trigger**: Sent to listing owners when listings expire within 7 days
- **Frequency**: Once per day maximum
- **Recipients**: Original listing creators only

#### Email Content:
- Listing details (ID, title, material type)
- Days remaining until expiry
- Call-to-action to renew listing

### Email Template Variables:
- `{{firstName}}` - User's first name
- `{{lastName}}` - User's last name
- `{{listingType}}` - "Sales" or "Wanted"
- `{{listingId}}` - Listing ID
- `{{listingTitle}}` - Listing title
- `{{materialType}}` - Material type
- `{{daysRemaining}}` - Days until expiry

## 🎨 Frontend Integration Guide

### 1. Product Card Display

When displaying listing cards, check for `expiryInfo` and show alerts:

```javascript
// Example: React component
function ListingCard({ listing }) {
  const { expiryInfo } = listing;
  
  return (
    <div className="listing-card">
      {/* Existing card content */}
      
      {expiryInfo?.isNearingExpiry && (
        <div className="expiry-alert warning">
          ⚠️ Expires in {expiryInfo.daysUntilExpiry} days
        </div>
      )}
      
      {expiryInfo?.isExpired && (
        <div className="expiry-alert expired">
          ❌ This listing has expired
        </div>
      )}
    </div>
  );
}
```

### 2. Product Page Display

Show detailed expiry information on listing detail pages:

```javascript
function ListingDetailPage({ listing }) {
  const { expiryInfo } = listing;
  
  return (
    <div className="listing-detail">
      {/* Existing content */}
      
      {expiryInfo?.isNearingExpiry && (
        <div className="expiry-banner">
          <h4>⚠️ Listing Expiring Soon</h4>
          <p>
            This listing will expire in {expiryInfo.daysUntilExpiry} days 
            on {new Date(expiryInfo.expiryDate).toLocaleDateString()}.
          </p>
          <button onClick={handleRenewListing}>Renew Listing</button>
        </div>
      )}
    </div>
  );
}
```

### 3. Owner-Only Display

Ensure expiry alerts are only shown to listing owners:

```javascript
function shouldShowExpiryAlert(listing, currentUser) {
  return listing.createdByUserId === currentUser.id && 
         listing.expiryInfo;
}
```

## 🔧 Business Rules

1. **Expiry Calculation**: 
   - Uses `endDate` if available (derived from `listingDuration` during creation)
   - Falls back to 30 days from `createdAt` timestamp per requirements (currently 31 days in code)
2. **Warning Period**: Final 7 days before expiry
3. **Status Updates**: Expired listings get `status: "expired"`
4. **Email Frequency**: Maximum once per day per listing
5. **Visibility**: Only visible to listing owners
6. **Listing Types**: Applies to both "sell" and "wanted" listings
7. **Custom Expiry**: Users can set custom expiry via `endDate` field during creation (`listingDuration` supported for backward compatibility)

## 🚀 Testing

### Test Expiry Calculation
```bash
# Get listings nearing expiry
curl -X GET 'https://wastetrade-api-dev.b13devops.com/listing-expiry/warnings' \
-H 'Authorization: Bearer {ADMIN_TOKEN}'

# Manually trigger expiry check
curl -X POST 'https://wastetrade-api-dev.b13devops.com/listing-expiry/check' \
-H 'Authorization: Bearer {ADMIN_TOKEN}'
```

### Test Data Requirements
- Create listings with `createdAt` dates 25+ days ago (for default expiry testing)
- Create listings with custom `endDate` dates (for custom expiry testing)
- Create listings with `listingDuration` dates (for backward compatibility testing)
- Verify `expiryInfo` appears in listing responses with correct dates
- Check that `endDate` is properly calculated from `listingDuration`
- Verify email notifications are sent at appropriate times

## 🔍 Error Handling

- Missing `expiryInfo`: Treat as non-expiring listing
- Invalid dates: Fall back to creation date + 30 days (per requirements)
- API errors: Show generic "Unable to load expiry info" message

## ⚠️ Implementation Notes

### Phase 2 Update
**UPDATED**: The default listing expiry has been changed from 30/31 days to **90 days** as per Phase 2 requirements.

- **Phase 1**: Default listing expiry was 30 days (implemented as 31 days)
- **Phase 2**: Default listing expiry is now **90 days** (read-only, no custom date entry)
- **Implementation**: Updated in `ListingExpiryService.calculateExpiryInfo()` and `ListingService.createListing()`

**Code Location**:
```typescript
// File: src/services/listing-expiry.service.ts
// Line ~41: Now uses 90 days
expiryDate.setDate(expiryDate.getDate() + 90);
```

**Phase 2 Behavior**:
- Non-ongoing listings: Automatically expire 90 days from `startDate`
- Ongoing listings (with `listingRenewalPeriod`): No expiry date set
- Frontend: Listing duration field is read-only at 90 days

## 📞 Support

For implementation questions or issues:
- Check console logs for cronjob execution
- Verify email service configuration
- Test with admin endpoints for debugging
- **Note the 30 vs 31 day discrepancy** when troubleshooting expiry calculations 