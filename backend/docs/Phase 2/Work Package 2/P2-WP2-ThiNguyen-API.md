# Multi-User Company Accounts - API Documentation

## Overview

This document provides the API specifications for the Multi-User Company Accounts functionality, covering user invitation, approval/rejection, company user management, role assignment, and user reassignment features.

## Table of Contents

- [6.3.3.1 Invite User to Company](#6331-invite-user-to-company)
- [6.3.3.2 Invitation Email](#6332-invitation-email)
- [6.3.3.3 Join Existing Company during Registration](#6333-join-existing-company-during-registration)
- [6.3.3.4 Approve or Decline Join Requests](#6334-approve-or-decline-join-requests)
- [6.3.3.5 Manage Company Users](#6335-manage-company-users)
- [6.3.3.6 Assign Roles & Basic Permissions](#6336-assign-roles--basic-permissions)
- [User Search for Reassignment](#user-search-for-reassignment)
- [User Reassignment](#user-reassignment)
- [6.3.3.9 Admin Management of Company Users](#6339-admin-management-of-company-users)
- [6.4.1.2 Admin Users Tables](#6412-admin-users-tables)
- [6.4.1.3 Admin Search Users Tables](#6413-admin-search-users-tables)
- [6.4.1.4 Admin Filter Users Tables](#6414-admin-filter-users-tables)
- [6.4.1.21 Notes](#642121-notes)
- [6.4.1.22 Assign Admin](#642122-assign-admin)
- [Error Handling](#error-handling)
- [Error Message Constants](#error-message-constants)

## 6.3.3.1 Invite User to Company

### API Endpoint: Send User Invitation

**POST** `/company-user-requests/invite`

#### Description

Allows company admins to invite new users to join their company by email.

#### Authentication

- **Required**: JWT Token
- **Role**: Company Admin

#### Request Body

```json
{
    "email": "thinguyen+trader02@b13technology.com",
    "firstName": "Thi",
    "lastName": "Nguyen",
    "role": "both"
}
```

#### Role Enum Values

```typescript
export enum CompanyUserRequestRoleEnum {
    // General
    ADMIN = 'admin',
    // Trading
    SELLER = 'seller',
    BUYER = 'buyer',
    BOTH = 'both', // both seller and buyer
    // Haulage
    HAULIER = 'haulier',
}
```

**Valid role values:**

- `admin` - Company Admin
- `seller` - Seller only
- `buyer` - Buyer only
- `both` - Both seller and buyer
- `haulier` - Haulier

#### Request Type Enum Values

```typescript
export enum CompanyUserRequestTypeEnum {
    REQUEST = 'request',
    INVITE = 'invite',
}
```

**Valid request type values:**

- `request` - User requested to join company
- `invite` - User invited by company admin

#### Field Validation

| Field     | Type   |
| --------- | ------ |
| email     | string |
| firstName | string |
| lastName  | string |
| role      | string |

#### Response

**Success (201 Created)**

```json
{
    "status": "success",
    "message": "User invitation sent successfully",
    "data": {
        "id": 7,
        "userId": 290,
        "email": "thinguyen+trader02@b13technology.com",
        "role": "both",
        "status": "pending",
        "expiresAt": "2025-12-27T14:39:15.727Z"
    }
}
```

**Error Responses**

```json
// Email already exists in this company
{
  "error": {
    "statusCode": 400,
    "message": "user-already-belongs-to-this-company"
  }
}

// Email already exists in another company
{
  "error": {
    "statusCode": 400,
    "message": "user-already-belongs-to-other-company"
  }
}

// Invalid email format
{
  "error": {
    "statusCode": 400,
    "message": "invalid-email"
  }
}

// Cannot invite admin to company
{
  "error": {
    "statusCode": 400,
    "message": "cannot-invite-admin-to-company"
  }
}

// Invitation already sent
{
  "error": {
    "statusCode": 400,
    "message": "an-invitation-has-been-sent-to-this-user"
  }
}
```

---

---

## 6.3.3.2 Invitation Email

### API Endpoint: Accept Invitation (Set Password)

**POST** `/reset-password`

#### Description

Allows invited users to accept company invitations by setting their password. This endpoint handles both new user invitations and existing user invitations.

#### Authentication

- **Required**: None (uses invitation token)

#### URL Type Enum Values

```typescript
export enum UrlTypeEnum {
    RESET_PASSWORD = 'reset_password',
    INVITE_JOIN_COMPANY = 'invite_join_company',
    REQUEST_JOIN_COMPANY = 'request_join_company',
}
```

#### URL From Email

- **Invite**: https://wastetrade-dev.b13devops.com/login?reset_pass=1&key=token&urlType=invite_join_company
- **Request to Join**: https://wastetrade-dev.b13devops.com/login?reset_pass=1&key=token&urlType=request_join_company

#### Request Body

```json
{
    "resetPasswordToken": "invitation-token-from-email",
    "newPassword": "newPassword123",
    "confirmNewPassword": "newPassword123",
    "urlType": "invite_join_company" // New field
}
```

#### Field Validation

| Field              | Type        |
| ------------------ | ----------- |
| resetPasswordToken | string      |
| newPassword        | string      |
| confirmNewPassword | string      |
| urlType            | UrlTypeEnum |

#### Response

**Success (204 No Content)**

```
HTTP 204 No Content
```

#### Error Responses

```json
// Invalid or expired token
{
  "error": {
    "statusCode": 400,
    "message": "invalid-token"
  }
}

// Token expired
{
  "error": {
    "statusCode": 400,
    "message": "token-expired"
  }
}

// Invalid password
{
  "error": {
    "statusCode": 400,
    "message": "invalid-password"
  }
}
```

---

## 6.3.3.3 Join Existing Company during Registration

### API Endpoint: VAT Number Lookup

**GET** `/companies/by-vat-number/{vatNumber}/trading`
**GET** `/companies/by-vat-number/{vatNumber}/haulage`

#### Description

Looks up existing companies by VAT number during registration to allow users to request joining existing companies instead of creating duplicates.

#### Authentication

- **Required**: JWT Token (Trader)
- **Not Required**: (Haulier)

#### Path Parameters

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| vatNumber | string | VAT number to lookup |

#### Response

**Success (200 OK)**

```json
{
    "id": 5,
    "countryCode": null,
    "name": "Waste Hauling Co",
    "registrationNumber": null,
    "email": "thinguyen@b13technology.com",
    "vatNumber": "GB1234567892",
    "vatRegistrationCountry": null,
    "addressLine1": "123 Haulier St",
    "addressLine2": null,
    "city": "London",
    "country": "United Kingdom",
    "stateProvince": "England",
    "postalCode": "AB1 2CD",
    "website": "test.com",
    "phoneNumber": "9876543210",
    "mobileNumber": null,
    "companyType": "manufacturer",
    "favoriteMaterials": [],
    "otherMaterial": null,
    "companyInterest": "both",
    "isHaulier": false,
    "boxClearingAgent": true,
    "fleetType": null,
    "areasCovered": null,
    "containerTypes": null,
    "status": "pending",
    "verifiedAt": null,
    "facebookUrl": null,
    "instagramUrl": null,
    "linkedinUrl": null,
    "xUrl": null,
    "additionalSocialMediaUrls": null,
    "description": "test",
    "isSeller": true,
    "isBuyer": true,
    "rejectionReason": null,
    "infoRequestType": null,
    "adminMessage": null,
    "createdAt": "2025-04-29T19:20:25.950Z",
    "updatedAt": "2025-04-29T19:20:25.950Z",
    "isSyncedSalesForce": true,
    "lastSyncedSalesForceDate": "2025-07-18T04:32:29.397Z",
    "salesforceId": "001UE00000U2TV6YAN"
}
```

**Error Responses**

```json
// Company not found
{
    "error": {
        "statusCode": 404,
        "message": "company-not-found"
    }
}
```

### API Endpoint: Request to Join Company

**POST** `/company-user-requests/request-to-join`

#### Description

Allows users to request joining an existing company during registration after VAT number lookup finds a match.

#### Authentication

- **Required**: JWT Token (Trader)
- **Not Required**: (Haulier)

#### Request Body

```json
{
    "companyId": 5,
    "email": "thinguyen+trader03@b13technology.com",
    "firstName": "Thi",
    "lastName": "Nguyen",
    "note": "note"
}
```

#### Field Validation

| Field     | Type   |
| --------- | ------ |
| companyId | number |
| email     | string |
| firstName | string |
| lastName  | string |
| note      | string |

#### Response

**Success (200 OK)**

```json
{
    "status": "success",
    "message": "User invitation sent successfully",
    "data": {
        "id": 8,
        "userId": 291,
        "email": "thinguyen+haulier01@b13technology.com",
        "role": "haulier",
        "status": "pending",
        "expiresAt": "2025-12-27T15:09:57.360Z"
    }
}
```

#### Error Responses

```json
// Duplicate request
{
  "error": {
    "statusCode": 400,
    "message": "an-invitation-has-been-sent-to-this-user"
  }
}

// User already belongs to company
{
  "error": {
    "statusCode": 400,
    "message": "user-already-belongs-to-this-company"
  }
}

// Invalid email
{
  "error": {
    "statusCode": 400,
    "message": "invalid-email"
  }
}
```

---

## 6.3.3.4 Approve or Decline Join Requests

### API Endpoint: Get Company User Requests (Incoming Requests tab)

**GET** `/company-user-requests`

#### Description

Retrieves a paginated list of users within the company, including both active members and pending invites.

#### Authentication

- **Required**: JWT Token
- **Role**: Company Admin or Global Admin

#### Query Parameters

| Parameter | Type   | Default | Description                                         |
| --------- | ------ | ------- | --------------------------------------------------- |
| filter    | object | {}      | LoopBack filter object for pagination and filtering |

#### Filter Object Structure

```json
{
    "skip": 0,
    "limit": 10
}
```

#### Response

**Success (200 OK)**

```json
{
    "totalCount": 1,
    "results": [
        {
            "id": 16,
            "userId": 298,
            "email": "thinguyen+traderrequest03@b13technology.com",
            "username": "82700372",
            "firstName": "John",
            "lastName": "Doe",
            "note": "note"
        }
    ]
}
```

### API Endpoint: Approve User Request

**POST** `/company-user-requests/{id}/approve`

#### Description

Allows company admins to approve pending user join requests.

#### Authentication

- **Required**: JWT Token
- **Role**: Company Admin

#### Request Params

```json
{
    "id": 123 // companyUserRequestId, not userId
}
```

#### Response

**Success (200 OK)**

```json
{
    "success": true,
    "message": "User request approved successfully"
}
```

**Error Responses**

```json
// User request not found
{
  "error": {
    "statusCode": 404,
    "message": "not-found-company-user-request"
  }
}

// Insufficient permissions
{
  "error": {
    "statusCode": 403,
    "message": "forbidden"
  }
}
```

### API Endpoint: Reject User Request

**POST** `/company-user-requests/{id}/reject`

#### Description

Allows company admins to reject pending user join requests.

#### Authentication

- **Required**: JWT Token
- **Role**: Company Admin

#### Request Params

```json
{
    "id": 123 // companyUserRequestId, not userId
}
```

#### Response

**Success (200 OK)**

```json
{
    "success": true,
    "message": "User request rejected successfully"
}
```

**Error Responses**

```json
// User request not found
{
  "error": {
    "statusCode": 404,
    "message": "not-found-company-user-request"
  }
}

// Insufficient permissions
{
  "error": {
    "statusCode": 403,
    "message": "forbidden"
  }
}
```

---

## 6.3.3.5 Manage Company Users

### API Endpoint: Get Company Users List (Members tab)

**GET** `/companies/users`

#### Description

Retrieves a paginated list of users within the company, including both active members and pending invites.

#### Authentication

- **Required**: JWT Token
- **Role**: Company Admin or Global Admin

#### Query Parameters

| Parameter  | Type   | Default | Description                                         |
| ---------- | ------ | ------- | --------------------------------------------------- |
| filter     | object | {}      | LoopBack filter object for pagination and filtering |
| searchTerm | string | ""      | Search term for user fields                         |

#### Filter Object Structure

```json
{
    "skip": 0,
    "limit": 20,
    "where": {
        "role": "", // CompanyUserRequestRoleEnum - Empty or undefined to get all
        "status": "", // "active" | "pending" - Empty or undefined to get all
        "tabFilter": "" // UserTabFilter - Empty or undefined to get all
    }
}
```

#### Response

**Success (200 OK)**

```json
{
    "totalCount": 15,
    "results": [
        {
            "id": 305,
            "prefix": "mr",
            "firstName": "asdasd",
            "lastName": "asdad",
            "jobTitle": "asdasd",
            "email": "duyta+3@yopmail.com",
            "status": "active",
            "companyRole": "buyer",
            "companyData": {
                "id": 5,
                "name": "Waste Hauling Co",
                "country": "United Kingdom",
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": true,
                "companyInterest": "both"
            }
        },
        {
            "id": 309,
            "prefix": "mr",
            "firstName": "asdasd",
            "lastName": "asdad",
            "jobTitle": "asdasd",
            "email": "duyta+9@yopmail.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 5,
                "name": "Waste Hauling Co",
                "country": "United Kingdom",
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": true,
                "companyInterest": "both"
            }
        },
        {
            "id": 303,
            "prefix": "mr",
            "firstName": "asdasd",
            "lastName": "asdasd",
            "jobTitle": "aasdas",
            "email": "duyta+2@yopmail.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 5,
                "name": "Waste Hauling Co",
                "country": "United Kingdom",
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": true,
                "companyInterest": "both"
            }
        },
        {
            "id": 308,
            "prefix": "mr",
            "firstName": "asdasd",
            "lastName": "asdad",
            "jobTitle": "asdasd",
            "email": "duyta+10@yopmail.com",
            "status": "active",
            "companyRole": "both",
            "companyData": {
                "id": 5,
                "name": "Waste Hauling Co",
                "country": "United Kingdom",
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": true,
                "companyInterest": "both"
            }
        },
        {
            "id": 306,
            "prefix": "mr",
            "firstName": "asdasd",
            "lastName": "asdad",
            "jobTitle": "asdasd",
            "email": "duyta+4@yopmail.com",
            "status": "active",
            "companyRole": "both",
            "companyData": {
                "id": 5,
                "name": "Waste Hauling Co",
                "country": "United Kingdom",
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": true,
                "companyInterest": "both"
            }
        },
        {
            "id": 307,
            "prefix": null,
            "firstName": "Bee",
            "lastName": "Ta",
            "jobTitle": null,
            "email": "duyta+7@yopmail.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 5,
                "name": "Waste Hauling Co",
                "country": "United Kingdom",
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": true,
                "companyInterest": "both"
            }
        },
        {
            "id": 304,
            "prefix": "mr",
            "firstName": "John",
            "lastName": "Doe",
            "jobTitle": "trader",
            "email": "thinguyen+traderrequest06@b13technology.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 5,
                "name": "Waste Hauling Co",
                "country": "United Kingdom",
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": true,
                "companyInterest": "both"
            }
        },
        {
            "id": 298,
            "prefix": "mr",
            "firstName": "John",
            "lastName": "Doe",
            "jobTitle": "trader",
            "email": "thinguyen+traderrequest03@b13technology.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 5,
                "name": "Waste Hauling Co",
                "country": "United Kingdom",
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": true,
                "companyInterest": "both"
            }
        },
        {
            "id": 292,
            "prefix": null,
            "firstName": "Thi",
            "lastName": "Nguyen",
            "jobTitle": null,
            "email": "thinguyen+trader03@b13technology.com",
            "status": "active",
            "companyRole": "both",
            "companyData": {
                "id": 5,
                "name": "Waste Hauling Co",
                "country": "United Kingdom",
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": true,
                "companyInterest": "both"
            }
        },
        {
            "id": 6,
            "prefix": "mr",
            "firstName": "Thi asdffdssdsddđvvvvbb",
            "lastName": "Nguyenavvvvvv",
            "jobTitle": "Haulier Manager",
            "email": "nguyenleanhthi7@gmail.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 5,
                "name": "Waste Hauling Co",
                "country": "United Kingdom",
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": true,
                "companyInterest": "both"
            }
        }
    ]
}
```

---

### API Endpoint: Resend invitation

**POST** `/company-user-requests/resend-invitation`

#### Description

Resend Invitation

#### Authentication

- **Required**: JWT Token
- **Role**: Company Admin

#### Body Request

```json
{
    "userId": 123
}
```

#### Response

**Success (200 OK)**

```json
{
    "success": true,
    "message": "Invitation sent successfully"
}
```

## 6.3.3.6 Assign Roles & Basic Permissions

### API Endpoint: Assign User Role

**PATCH** `/company-users/assign-role`

#### Description

Allows company admins to assign or update roles for company members.

#### Authentication

- **Required**: JWT Token
- **Role**: Company Admin and Global Admin

#### Request Body

```json
{
    "userId": 123,
    "role": "both"
}
```

#### Valid Roles

**Trading Platform:**

- `admin` - Company Admin
- `both` - Dual (Buyer & Seller)
- `buyer` - Buyer only
- `seller` - Seller only

**Haulier Platform:**

- `admin` - Company Admin
- `haulier` - Haulier Member

#### Response

**Success (200 OK)**

```json
{
    "success": true,
    "message": "User role updated successfully",
    "data": {
        "id": 123,
        "userId": 456,
        "companyId": 789,
        "role": "both",
        "updatedAt": "2024-01-01T00:00:00Z"
    }
}
```

**Error Responses**

```json
// Company user not found
{
  "error": {
    "statusCode": 404,
    "message": "user-not-found"
  }
}

// Invalid role
{
  "error": {
    "statusCode": 400,
    "message": "invalid-status"
  }
}

// Insufficient permissions
{
  "error": {
    "statusCode": 403,
    "message": "forbidden"
  }
}
```

---

## User Search for Reassignment

### API Endpoint: Search Users for Reassignment

**GET** `/companies/users/search-for-reassignment`

#### Description

Searches active company users for reassignment purposes. Returns a simplified user list with essential fields only.

#### API Login update

New field in login response: companyRole

#### Authentication

- **Required**: JWT Token
- **Role**: Company Admin

#### Query Parameters

| Parameter  | Type   | Default | Description                 |
| ---------- | ------ | ------- | --------------------------- |
| searchTerm | string | ""      | Search term for user fields |
| filter     | object | 0       | Number of records to skip   |

#### Filter Object Structure

```json
{
    "skip": 0,
    "limit": 10,
    "where": {
        "companyId": 123
    }
}
```

#### Response

**Success (200 OK)**

```json
{
    "totalCount": 25,
    "results": [
        {
            "id": 123,
            "email": "john.doe@company.com",
            "username": "johndoe",
            "firstName": "John",
            "lastName": "Doe",
            "companyRole": "admin"
        },
        {
            "id": 456,
            "email": "jane.smith@company.com",
            "username": "janesmith",
            "firstName": "Jane",
            "lastName": "Smith",
            "companyRole": "buyer"
        }
    ]
}
```

## User Reassignment

### API Endpoint: Reassign User Data

**POST** `/companies/users/reassign`

#### Description

Transfers all company-related data from one user to another within the same company. This includes listings, offers, notifications, and other associated data.

#### Authentication

- **Required**: JWT Token
- **Role**: Company Admin

#### Request Body

```json
{
    "oldUserId": 123,
    "newUserId": 456,
    "companyId": 123
}
```

#### Response

**Success (200 OK)**

```json
{
    "success": true,
    "message": "Successfully reassigned all data from user 123 to user 456"
}
```

#### Error Responses

```json
// User not found in company
{
  "error": {
    "statusCode": 404,
    "message": "user-not-found"
  }
}

// Insufficient permissions
{
  "error": {
    "statusCode": 403,
    "message": "forbidden"
  }
}

// User not associated with company
{
  "error": {
    "statusCode": 400,
    "message": "user-not-found"
  }
}

// Server error
{
  "error": {
    "statusCode": 500,
    "message": "server-error"
  }
}
```

#### Data Transfer Coverage

The following data is transferred during reassignment:

- **Listings**: `created_by_user_id`, `assigned_admin_id`
- **Offers**: `buyer_user_id`, `seller_user_id`, `created_by_user_id`, `accepted_by_user_id`, `rejected_by_user_id`, `assigned_admin_id`
- **Haulage Offers**: `haulier_user_id`, `assigned_admin_id`
- **Sample Requests**: `buyer_user_id`, `seller_user_id`
- **MFI Requests**: `buyer_user_id`, `seller_user_id`

---

## 6.3.3.8 Company Notifications

This section documents the notification payloads related to Multi-User Company Accounts so FE can render correct titles and summaries.

### Notification: New Join Request Submitted (to Company Admins)

**Trigger**: A user submits a request to join a company.

**Audience**: Company Admins of the target company.

**Notification Payload**

```json
{
    "type": "company_user_request_join",
    "data": {
        "userId": 123,
        "companyId": 456,
        "firstName": "John",
        "lastName": "Doe",
        "companyName": "Waste Hauling Co"
    }
}
```

**FE Rendering**

- **Title**: `New Join Request`
- **Summary**: `"<First Name> <Last Name> requested to join <Company Name>. Review Requests"`

Suggested CTA: link to **Incoming Requests** tab for that company.

---

### Notification: Invite Accepted (to Company Admins)

**Trigger**: An invited user accepts a company invitation.

**Audience**: Company Admins of the company that sent the invite.

**Notification Payload**

```json
{
    "type": "company_user_accepted_invite",
    "data": {
        "userId": 123,
        "companyId": 456,
        "firstName": "John",
        "lastName": "Doe",
        "companyName": "Waste Hauling Co"
    }
}
```

**FE Rendering**

- **Title**: `Company Invite Accepted`
- **Summary**: `"<First Name> <Last Name> has accepted to join <Company Name>."`

Suggested CTA: link to **Members** tab for that company.

---

### Notification: Role Updated (to affected user)

**Trigger**: A company admin (or global admin) changes the user’s company role.

**Audience**: The user whose role was updated.

**Notification Payload**

```json
{
    "type": "company_user_role_changed",
    "data": {
        "userId": 123,
        "companyId": 456,
        "firstName": "John",
        "lastName": "Doe",
        "companyName": "Waste Hauling Co",
        "newRole": "admin",
        "oldRole": "buyer"
    }
}
```

**FE Rendering**

- **Title**: `Role Updated`
- **Summary**: `"Your role is now <New Role>. Permissions updated. View Role"`

Suggested CTA: link to the user’s **My Account / Company Role** view.

---

### Notification: Removed from Company (to affected user)

**Trigger**: A user is removed/unlinked from a company.

**Audience**: The user whose access was removed.

**Notification Payload**

```json
{
    "type": "company_user_unlinked_from_company",
    "data": {
        "userId": 123,
        "companyId": 456,
        "firstName": "John",
        "lastName": "Doe",
        "companyName": "Waste Hauling Co"
    }
}
```

**FE Rendering**

- **Title**: `Removed from Company`
- **Summary**: `"Your access to <Company Name> has been removed. You will need to populate your profile with updated company details."`

Suggested CTA: link to **Profile / Company selection** flow for creating / joining a new company.

---

## 6.3.3.9 Admin Management of Company Users

### API Endpoint: Get Company Users List (Members tab)

**GET** `/companies/users`

#### Description

Retrieves a paginated list of users within the company, including both active members and pending invites.

#### Authentication

- **Required**: JWT Token
- **Role**: Company Admin or Global Admin

#### Query Parameters

| Parameter  | Type   | Default | Description                                         |
| ---------- | ------ | ------- | --------------------------------------------------- |
| filter     | object | {}      | LoopBack filter object for pagination and filtering |
| searchTerm | string | ""      | Search term for user fields                         |

#### Filter Object Structure

```json
{
    "skip": 0,
    "limit": 10,
    "where": {
        "role": "", // CompanyUserRequestRoleEnum - Empty or undefined to get all
        "status": "", // "active" | "pending" - Empty or undefined to get all
        "companyId": 123 // For global admin, send undefined | null | 0 to get members for all company
    }
}
```

#### Response

**Success (200 OK)**

```json
{
    "totalCount": 246,
    "results": [
        {
            "id": 43,
            "prefix": "mr",
            "firstName": "123",
            "lastName": "23312",
            "jobTitle": "trgdf",
            "email": "sd.b13a@yopmail.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 26,
                "name": "1433",
                "country": null,
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": false,
                "companyInterest": "both"
            }
        },
        {
            "id": 72,
            "prefix": "mr",
            "firstName": "aaa",
            "lastName": "bbbb",
            "jobTitle": "weqeqw",
            "email": "trading9999@test.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 55,
                "name": "AAA",
                "country": "AD",
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": false,
                "companyInterest": "both"
            }
        },
        {
            "id": 69,
            "prefix": "mr",
            "firstName": "AAA",
            "lastName": "BBB",
            "jobTitle": "AAA",
            "email": "haulier222@test.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 52,
                "name": "AA",
                "country": "AD",
                "isHaulier": true,
                "isBuyer": true,
                "isSeller": false,
                "companyInterest": null
            }
        },
        {
            "id": 66,
            "prefix": "mr",
            "firstName": "abc",
            "lastName": "abc",
            "jobTitle": "QA",
            "email": "abc123@yopmail.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 49,
                "name": "b13",
                "country": "GB",
                "isHaulier": true,
                "isBuyer": true,
                "isSeller": false,
                "companyInterest": null
            }
        },
        {
            "id": 170,
            "prefix": "mr",
            "firstName": "ABC",
            "lastName": "DEF",
            "jobTitle": "CEO",
            "email": "abc.b13@abc.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 136,
                "name": "b13",
                "country": null,
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": true,
                "companyInterest": "both"
            }
        },
        {
            "id": 181,
            "prefix": "mr",
            "firstName": "Acc",
            "lastName": "Verified",
            "jobTitle": "ewfg",
            "email": "acc.b13@yopmail.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 147,
                "name": "fdfd",
                "country": "AM",
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": true,
                "companyInterest": "both"
            }
        },
        {
            "id": 205,
            "prefix": "mr",
            "firstName": "ádasd",
            "lastName": "asdasd",
            "jobTitle": "sdasdasd",
            "email": "duyta+333@b13technology.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 171,
                "name": "asdasdasd",
                "country": "AL",
                "isHaulier": false,
                "isBuyer": false,
                "isSeller": true,
                "companyInterest": "seller"
            }
        },
        {
            "id": 214,
            "prefix": "mr",
            "firstName": "ádasd",
            "lastName": "asdasd",
            "jobTitle": "sdasdasd",
            "email": "duyta+335@b13technology.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 180,
                "name": "sdasdasd",
                "country": null,
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": true,
                "companyInterest": "both"
            }
        },
        {
            "id": 177,
            "prefix": "dr",
            "firstName": "Adrienne",
            "lastName": "Olson",
            "jobTitle": "Corporate Division Manager",
            "email": "tuytran+769@b13technology.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 143,
                "name": "Little Inc",
                "country": "AL",
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": false,
                "companyInterest": "buyer"
            }
        },
        {
            "id": 190,
            "prefix": "mr",
            "firstName": "Alessia",
            "lastName": "Sauer",
            "jobTitle": "Product Operations Representative",
            "email": "tuytranhaulier+3@b13technology.com",
            "status": "active",
            "companyRole": "admin",
            "companyData": {
                "id": 156,
                "name": "Roberts - Barrows",
                "country": "United Kingdom",
                "isHaulier": true,
                "isBuyer": true,
                "isSeller": false,
                "companyInterest": null
            }
        }
    ]
}
```

---

### API Endpoint: Remove (unlink) Company User

**POST** `/companies/users/remove`

#### Description

Transfers all company-related data from one user to another within the same company. This includes listings, offers, notifications, and other associated data.

#### Authentication

- **Required**: JWT Token
- **Role**: Company Admin

#### Request Body

```json
{
    "userId": 123,
    "companyId": 456
}
```

#### Response

**Success (200 OK)**

```json
{
    "success": true,
    "message": "Successfully reassigned all data from user 123 to user 456"
}
```

---

### API Endpoint: Search Companies for Merge

**GET** `/companies/search-for-merge`

#### Description

Search companies by VAT number or name to use in the "Merge Company" flow. Supports typeahead and pagination.

#### Authentication

- **Required**: JWT Token
- **Role**: Global Admin

#### Query Parameters

| Parameter  | Type   | Default | Description                                               |
| ---------- | ------ | ------- | --------------------------------------------------------- |
| filter     | object | {}      | LoopBack filter object for pagination (`skip`, `limit`)   |
| searchTerm | string | ""      | Case-insensitive search on company `name` or `vat_number` |

#### Filter Object Structure

```json
{
    "skip": 0,
    "limit": 5,
    "where": {
        "isHaulier": false
    }
}
```

#### Response

**Success (200 OK)**

```json
{
    "totalCount": 32,
    "results": [
        {
            "id": 242,
            "name": "asdasd",
            "vatNumber": null,
            "country": null,
            "status": "pending",
            "companyInterest": "both",
            "isHaulier": false,
            "isBuyer": true,
            "isSeller": true
        },
        {
            "id": 241,
            "name": "asdasd",
            "vatNumber": null,
            "country": null,
            "status": "pending",
            "companyInterest": "both",
            "isHaulier": false,
            "isBuyer": true,
            "isSeller": true
        },
        {
            "id": 240,
            "name": "asdasd",
            "vatNumber": null,
            "country": null,
            "status": "pending",
            "companyInterest": "both",
            "isHaulier": false,
            "isBuyer": true,
            "isSeller": true
        },
        {
            "id": 239,
            "name": "asdasd",
            "vatNumber": null,
            "country": null,
            "status": "pending",
            "companyInterest": "both",
            "isHaulier": false,
            "isBuyer": true,
            "isSeller": true
        },
        {
            "id": 216,
            "name": "WT",
            "vatNumber": "ASDASD",
            "country": "AS",
            "status": "pending",
            "companyInterest": "both",
            "isHaulier": false,
            "isBuyer": true,
            "isSeller": true
        }
    ]
}
```

---

### API Endpoint: Merge Companies

**POST** `/companies/merge`

#### Description

Merge two companies into a single master company. All members, locations, listings, offers, haulage offers, documents, sample requests, and MFI requests from the merged company are reassigned to the master. The merged company is then deleted.

The merge is **atomic**: on failure, no partial state persists and both companies remain unchanged.

#### Authentication

- **Required**: JWT Token
- **Role**: Global Admin

#### Request Body

```json
{
    "masterCompanyId": 123,
    "mergedCompanyId": 456
}
```

- `masterCompanyId`: ID of the company that will remain as the **Master**.
- `mergedCompanyId`: ID of the company that will be **absorbed and deleted**.

**Validation**

- If `masterCompanyId` equals `mergedCompanyId`, the API returns:

```json
{
    "error": {
        "statusCode": 400,
        "message": "Select a different company"
    }
}
```

#### What Happens During Merge

- **Profile & Settings**: Master company’s profile and settings remain; merged company is deleted.
- **Members**:
    - All `company_users` from the merged company move to the master.
    - Duplicate memberships are collapsed; the user keeps the **highest privilege** role across both companies:
        - Priority order: `admin` > `both` > `seller` / `buyer` > `haulier`.
- **Locations**: All `company_locations.company_id` from merged → master.
- **Documents**: All `company_documents.company_id` from merged → master.
- **Join Requests**: All `company_user_requests.company_id` from merged → master.
- **Listings**: All `listings.company_id` from merged → master.
- **Offers**:
    - `offers.buyer_company_id` and `offers.seller_company_id` from merged → master.
- **Haulage Offers**:
    - `haulage_offers.haulier_company_id` from merged → master.
- **Sample Requests**:
    - `sample_requests.buyer_company_id` and `sample_requests.seller_company_id` from merged → master.
- **MFI Requests**:
    - `mfi_requests.buyer_company_id` and `mfi_requests.seller_company_id` from merged → master.
- **Audit Trail**:
    - Audit entries are created for both companies (master and merged) including actor, company IDs, counts moved, and pre-merge Name/VAT info.

#### Response

**Success (200 OK)**

```json
{
    "status": "success",
    "message": "Companies merged successfully",
    "data": {
        "masterCompanyId": 241,
        "mergedCompanyId": 242,
        "movedCounts": {
            "members": 0,
            "locations": 0,
            "documents": 0,
            "listings": 0,
            "offers": 0,
            "haulageOffers": 0,
            "sampleRequests": 0,
            "mfiRequests": 0
        }
    }
}
```

## 6.4.1.2 Admin Users Tables

## 6.4.1.3 Admin Search Users Tables

## 6.4.1.4 Admin Filter Users Tables

### API Endpoint: Admin Get Users List

**GET** `/users`

#### Description

Retrieves a paginated and filterable list of all users in the system for admin dashboard management. Supports tabs, search, and advanced filtering capabilities.

#### Authentication

- **Required**: JWT Token
- **Role**: Global Admin

#### Query Parameters

| Parameter | Type   | Default | Description                                         |
| --------- | ------ | ------- | --------------------------------------------------- |
| filter    | object | {}      | LoopBack filter object for pagination and filtering |
| search    | string | ""      | Search term across multiple fields                  |

#### Tab Filter Values

```typescript
export enum UserTabFilter {
    UNVERIFIED = 'unverified',
    VERIFIED = 'verified',
    REJECTED = 'rejected',
    INACTIVE = 'inactive', // Future scope
    BLOCKED = 'blocked', // Future scope
}
```

#### Filter Object Structure

```json
{
    "skip": 0,
    "limit": 10,
    "where": {
        "tabFilter": "",
        "/overallStatus": "complete",
        "/registrationStatus": "complete",
        "/onboardingStatus": "company_documents_in_progress",
        "accountType": "buyer",
        "/dateFrom": "2024-01-01",
        "/dateTo": "2024-12-31"
    }
}
```

#### Account Type Filter Values

```typescript
export enum UserAccountType {
    BUYER = 'buyer',
    SELLER = 'seller',
    DUAL = 'dual',
    HAULIER = 'haulier',
    TRADING_COMPANY_ADMIN = 'trading_company_admin',
    HAULAGE_COMPANY_ADMIN = 'haulage_company_admin',
}
```

#### Status Filter Values

```typescript
export enum UserOverallStatus {
    COMPLETE = 'complete',
    AWAITING_APPROVAL = 'awaiting_approval',
    IN_PROGRESS = 'in progress',
}

export enum UserRegistrationStatus {
    COMPLETE = 'complete',
    IN_PROGRESS = 'in progress',
}

export enum OnboardingStatus {
    COMPANY_INFORMATION_COMPLETE = 'company_information_complete',
    COMPANY_INFORMATION_IN_PROGRESS = 'company_information_in_progress',
    COMPANY_DOCUMENTS_ADDED = 'company_documents_added',
    COMPANY_DOCUMENTS_IN_PROGRESS = 'company_documents_in_progress',
    SITE_LOCATION_ADDED = 'site_location_added',
    SITE_LOCATION_IN_PROGRESS = 'site_location_in_progress',
}
```

#### Response

**Success (200 OK)**

```json
{
    "totalCount": 1,
    "results": [
        {
            "id": 305,
            "username": "15736707",
            "firstName": "asdasd",
            "lastName": "asdad",
            "email": "duyta+3@yopmail.com",
            "createdAt": "2025-12-21T15:01:52.412Z",
            "status": "active",
            "assignedAdminId": null,
            "overallStatus": "awaiting approval",
            "registrationStatus": "in progress",
            "onboardingStatus": "company_documents_in_progress",
            "companyRole": "buyer",
            "companyData": {
                "id": 5,
                "name": "Waste Hauling Co",
                "country": "United Kingdom",
                "isHaulier": false,
                "isBuyer": true,
                "isSeller": true,
                "companyInterest": "both"
            }
        }
    ]
}
```

### API Endpoint: Admin Get Users Count Tabs

**GET** `/users/count-tabs`

#### Description

Get users count tabs

#### Authentication

- **Required**: JWT Token
- **Role**: Global Admin

#### Tab Filter Values

```typescript
export enum UserTabFilter {
    UNVERIFIED = 'unverified',
    VERIFIED = 'verified',
    REJECTED = 'rejected',
    INACTIVE = 'inactive', // Future scope
    BLOCKED = 'blocked', // Future scope
}
```

#### Response

**Success (200 OK)**

```json
{
    "status": "success",
    "message": "User counts retrieved successfully",
    "data": {
        "all": 257,
        "unverified": 10,
        "verified": 234,
        "rejected": 13,
        "inactive": 0,
        "blocked": 0
    }
}
```

## 6.4.1.21 Notes

### Admin Note in List Responses

The `adminNote` object is included in the response of all admin list endpoints for the following data types:

- **Users**: `GET /users` (admin only)
- **Listings**: `GET /listings/sell` and `GET /listings/wanted` (admin only)
- **Offers**: `GET /offers/admin` (admin only)
- **Haulage Offers**: `GET /admin/haulage-bids` (admin only)
- **Sample Requests**: `GET /admin/sample-requests` (admin only)
- **MFI Requests**: `GET /admin/mfi-requests` (admin only)

The `adminNote` object structure:

```json
{
    "adminNote": {
        "value": "Note content here",
        "updatedBy": 123,
        "updatedAt": "2024-01-01T00:00:00Z"
    }
}
```

Or `null` if no note has been added.

### API Endpoint: Create or Update Admin Note

**POST** `/admin-notes`

#### Description

Creates or updates an admin note for a specific data object. If a note already exists for the object, it will be updated; otherwise, a new note will be created.

#### Authentication

- **Required**: JWT Token
- **Role**: Global Admin (super_admin, admin, sales_admin)

#### Request Body

```json
{
    "dataId": 123,
    "dataType": "users",
    "value": "This user requires additional verification"
}
```

#### Data Type Enum Values

```typescript
export enum AdminNoteDataType {
    USERS = 'users',
    LISTINGS = 'listings',
    OFFERS = 'offers',
    HAULAGE_OFFERS = 'haulage_offers',
    SAMPLES = 'samples',
    MFI = 'mfi',
}
```

**Valid data type values:**

- `users` - User records
- `listings` - Listing records
- `offers` - Offer records
- `haulage_offers` - Haulage offer records
- `samples` - Sample request records
- `mfi` - MFI request records

#### Field Validation

| Field    | Type   | Required | Description                         |
| -------- | ------ | -------- | ----------------------------------- |
| dataId   | number | Yes      | ID of the object to add/update note |
| dataType | string | Yes      | Type of the data object (enum)      |
| value    | string | Yes      | Note content                        |

#### Response

**Success (200 OK)**

```json
{
    "value": "This user requires additional verification",
    "updatedBy": 123,
    "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses**

```json
// Record not found
{
  "error": {
    "statusCode": 404,
    "message": "User with id 123 not found"
  }
}

// Invalid data type
{
  "error": {
    "statusCode": 400,
    "message": "Invalid data type: invalid_type"
  }
}

// Unauthorized access
{
  "error": {
    "statusCode": 403,
    "message": "forbidden"
  }
}
```

### API Endpoint: Get Admin Note Detail

**GET** `/admin-notes/{dataType}/{dataId}`

#### Description

Retrieves the detailed information of an admin note for a specific data object, including the user who last updated the note.

#### Authentication

- **Required**: JWT Token
- **Role**: Global Admin (super_admin, admin, sales_admin)

#### Path Parameters

| Parameter | Type   | Required | Description                    |
| --------- | ------ | -------- | ------------------------------ |
| dataType  | string | Yes      | Type of the data object (enum) |
| dataId    | number | Yes      | ID of the object               |

#### Data Type Enum Values

Same as POST `/admin-notes` endpoint above.

#### Response

**Success (200 OK)**

```json
{
    "status": "success",
    "message": "Admin note retrieved successfully",
    "data": {
        "value": "This user requires additional verification",
        "updatedAt": "2024-01-01T00:00:00Z",
        "updatedBy": {
            "id": 123,
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@example.com",
            "role": "admin"
        }
    }
}
```

**Error Responses**

```json
// Admin note not found
{
  "error": {
    "statusCode": 404,
    "message": "Admin note not found"
  }
}

// Record not found
{
  "error": {
    "statusCode": 404,
    "message": "User with id 123 not found"
  }
}

// Invalid data type
{
  "error": {
    "statusCode": 400,
    "message": "Invalid data type: invalid_type"
  }
}

// Unauthorized access
{
  "error": {
    "statusCode": 403,
    "message": "forbidden"
  }
}
```

## 6.4.1.22 Assign Admin

### Assign Admin in List Responses

The `assignAdmin` object is included in the response of all admin list endpoints for the following data types:

- **Users**: `GET /users` (admin only)
- **Listings**: `GET /listings/sell` and `GET /listings/wanted` (admin only)
- **Offers**: `GET /offers/admin` (admin only)
- **Haulage Offers**: `GET /admin/haulage-bids` (admin only)
- **Sample Requests**: `GET /admin/sample-requests` (admin only)
- **MFI Requests**: `GET /admin/mfi-requests` (admin only)

The `assignAdmin` object structure:

```json
{
    "assignAdmin": {
        "assignedAdminId": 123,
        "assignedBy": 456,
        "assignedAt": "2024-01-01T00:00:00Z",
        "assignedAdmin": {
            "id": 123,
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@example.com",
            "globalRole": "admin"
        }
    }
}
```

Or `null` if no admin has been assigned. The `assignedAdmin` nested object contains the full details of the assigned admin user.

### API Endpoint: Get Admins Available for Assignment

**GET** `/admin-assignments`

#### Description

Retrieves a paginated list of admin users available for assignment. Only returns users with global admin roles (super_admin, admin, sales_admin).

#### Authentication

- **Required**: JWT Token
- **Role**: Global Admin (super_admin, admin, sales_admin)

#### Query Parameters

| Parameter | Type   | Default | Description                           |
| --------- | ------ | ------- | ------------------------------------- |
| filter    | object | {}      | LoopBack filter object for pagination |

#### Filter Object Structure

```json
{
    "skip": 0,
    "limit": 20
}
```

#### Response

**Success (200 OK)**

```json
{
    "totalCount": 15,
    "results": [
        {
            "id": 123,
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@example.com",
            "globalRole": "admin"
        },
        {
            "id": 456,
            "firstName": "Jane",
            "lastName": "Smith",
            "email": "jane.smith@example.com",
            "globalRole": "super_admin"
        }
    ]
}
```

#### Error Responses

```json
// Unauthorized access
{
    "error": {
        "statusCode": 403,
        "message": "forbidden"
    }
}
```

### API Endpoint: Assign or Unassign Admin

**POST** `/admin-assignments`

#### Description

Assigns an admin user to a specific data object or unassigns the current admin. If `assignedAdminId` is provided, it will assign that admin; if `null`, it will unassign the current admin.

#### Authentication

- **Required**: JWT Token
- **Role**: Global Admin (super_admin, admin, sales_admin)

#### Request Body

```json
{
    "dataId": 123,
    "dataType": "users",
    "assignedAdminId": 456
}
```

To unassign an admin:

```json
{
    "dataId": 123,
    "dataType": "users",
    "assignedAdminId": null // null | undefined | unset
}
```

#### Data Type Enum Values

```typescript
export enum AssignAdminDataType {
    USERS = 'users',
    LISTINGS = 'listings',
    OFFERS = 'offers',
    HAULAGE_OFFERS = 'haulage_offers',
    SAMPLES = 'samples',
    MFI = 'mfi',
}
```

**Valid data type values:**

- `users` - User records
- `listings` - Listing records
- `offers` - Offer records
- `haulage_offers` - Haulage offer records
- `samples` - Sample request records
- `mfi` - MFI request records

#### Field Validation

| Field           | Type           | Required | Description                                    |
| --------------- | -------------- | -------- | ---------------------------------------------- |
| dataId          | number         | Yes      | ID of the object to assign/unassign admin      |
| dataType        | string         | Yes      | Type of the data object (enum)                 |
| assignedAdminId | number \| null | Yes      | ID of the admin to assign, or null to unassign |

#### Response

**Success (200 OK)**

```json
{
    "assignedAdminId": 456,
    "assignedBy": 789,
    "assignedAt": "2024-01-01T00:00:00Z"
}
```

When unassigning (assignedAdminId is null):

```json
{
    "assignedAdminId": null,
    "assignedBy": 789,
    "assignedAt": "2024-01-01T00:00:00Z"
}
```

#### Error Responses

```json
// Record not found
{
  "error": {
    "statusCode": 404,
    "message": "User with id 123 not found"
  }
}

// Admin user not found
{
  "error": {
    "statusCode": 404,
    "message": "Admin user with id 456 not found"
  }
}

// User is not an admin
{
  "error": {
    "statusCode": 400,
    "message": "User 456 is not an admin"
  }
}

// Invalid data type
{
  "error": {
    "statusCode": 400,
    "message": "Invalid data type: invalid_type"
  }
}

// Unauthorized access
{
  "error": {
    "statusCode": 403,
    "message": "forbidden"
  }
}
```

## Error Handling

### Error Responses

```json
// Invalid tab filter
{
    "error": {
        "statusCode": 400,
        "message": "invalid-tab-filter"
    }
}

// Invalid date format
{
    "error": {
        "statusCode": 400,
        "message": "invalid-date-format"
    }
}

// Unauthorized access
{
    "error": {
        "statusCode": 403,
        "message": "forbidden"
    }
}

// Authentication required
{
    "error": {
        "statusCode": 401,
        "message": "unauthorized"
    }
}
```

## Error Message Constants

The API uses standardized error message constants defined in the application. Here are the relevant ones for Multi-User Company Account operations:

### Company User Request Messages

```typescript
  cannotInviteAdminToCompany: 'cannot-invite-admin-to-company',
  globalAdminCannotRequestToJoinCompany: 'global-admin-cannot-request-to-join-company',
  userAlreadyBelongsToOtherCompany: 'user-already-belongs-to-other-company',
  userAlreadyBelongsToThisCompany: 'user-already-belongs-to-this-company',
  anInvitationHasBeenSentToThisUser: 'an-invitation-has-been-sent-to-this-user',
  notFoundCompanyUserRequest: 'not-found-company-user-request',
  aRequestToJoinCompanyHasBeenSentByThisUser: 'a-request-to-join-company-has-been-sent-by-this-user',
  emailDoesNotMatch: 'email-does-not-match',
```
