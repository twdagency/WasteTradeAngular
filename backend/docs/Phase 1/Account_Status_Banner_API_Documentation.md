# Account Status Banner API

## Endpoint
```
GET /users/me/account-status
```

**Auth Required**: JWT token in Authorization header

## Response

### Success (200)
```json
{
  "status": "success",
  "message": "Account status retrieved successfully",
  "data": {
    "showBanner": true,
    "bannerType": "incomplete_onboarding",
    "message": "Complete account (all onboarding steps are not complete)"
  }
}
```

### No Banner
```json
{
  "data": {
    "showBanner": false,
    "message": "Account is active and complete"
  }
}
```

## Banner Types

| Type | When | Message |
|------|------|---------|
| `incomplete_onboarding` | Missing company info/docs | "Complete account (all onboarding steps are not complete)" |
| `verification_pending` | Company under review | "Your account is being verified" |
| `verification_failed` | Company rejected | "Verification failed, please contact the WasteTrade team at support@wastetrade.com" |
| `document_expiring` | Documents expire in 30 days | "{Document Name} is due to expire on {Date}. Please upload the latest version to keep your access." |

## Document Expiring Response
```json
{
  "data": {
    "showBanner": true,
    "bannerType": "document_expiring",
    "message": "Waste Carrier License is due to expire on 15/02/2025. Please upload the latest version to keep your access.",
    "documentDetails": {
      "name": "Waste Carrier License",
      "expiryDate": "15/02/2025",
      "daysRemaining": 25
    }
  }
}
```

## Frontend Integration

### 1. Fetch Status
```javascript
const response = await fetch('/api/users/me/account-status', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const result = await response.json();

if (result.data.showBanner) {
  showBanner(result.data);
}
```

### 2. Display Banner
```javascript
function showBanner(data) {
  const banner = document.createElement('div');
  banner.className = `banner ${data.bannerType}`;
  banner.innerHTML = `
    <span>${data.message}</span>
    ${getActionButton(data.bannerType)}
  `;
  document.body.prepend(banner);
}

function getActionButton(type) {
  switch (type) {
    case 'incomplete_onboarding':
      return '<button onclick="location.href=\'/onboarding\'">Complete Account</button>';
    case 'verification_failed':
      return '<button onclick="location.href=\'mailto:support@wastetrade.com\'">Contact Support</button>';
    case 'document_expiring':
      return '<button onclick="location.href=\'/documents\'">Update Documents</button>';
    default:
      return '';
  }
}
```

## Test with cURL
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://wastetrade-api-dev.b13devops.com/users/me/account-status
```

That's it! 🎯 