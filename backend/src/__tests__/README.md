# Tests

## Quick Start

```bash

# 2. Run all tests
pnpm test

# 3. Run in dev mode (watch)
pnpm test:dev
```

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Structure

- `acceptance/` - API endpoint integration tests (uses real JWT tokens)
- `unit/` - Unit tests for services and utilities

## Test Users

Tests use real JWT tokens from these test users (auto-created by migration):
src\migrations\[1.0.12]-create-preset-admin-accounts.migration.ts

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- --grep "Haulage Offers"

# Run in dev mode (watch)
pnpm test:dev
```

## Test Coverage by Phase

### Phase 2 - Work Package 2

#### Admin Offers (`admin-offers.acceptance.ts`)
- GET /offers/admin - View paginated offers
- GET /offers/admin - Filter by search term
- GET /offers/:id - View offer details with locations

#### Haulage Offers (`haulage-offers.acceptance.ts`)
- GET /haulage-offers/company-hauliers - Get approved hauliers
- GET /haulage-offers/company-hauliers - Search hauliers
- POST /haulage-offers - Create bid for self
- POST /haulage-offers - Create bid for team member

#### Admin Haulage Bids (`admin-haulage-bids.acceptance.ts`)
- GET /admin/haulage-bids - View all bids
- GET /admin/haulage-bids - Filter by status/material/date
- GET /admin/hauliers - Get hauliers dropdown
- POST /admin/haulage-offers - Create offer on behalf of haulier

#### Admin Listings (`admin-listings.acceptance.ts`)
- GET /listings/sell - View all sell listings
- GET /listings/sell - Filter by search/material/status
- GET /listings/wanted - View all wanted listings
- GET /listings/wanted - Filter by search/material/status

### Phase 2 - Work Package 1

#### Haulier Profile (`haulage-profile.acceptance.ts`)
- GET /haulier/profile - Retrieve haulier profile
- PATCH /haulier/profile - Update profile fields
- PATCH /haulier/profile - Update waste carrier license

#### Listings Management (`listings-management.acceptance.ts`)
- POST /listings - Create sell listing with materialWeight + weightUnit
- POST /listings - Create wanted listing with required fields
- PATCH /listings/:id - Update listing
- PATCH /listings/:id/renew - Renew listing for 2 weeks
- PATCH /listings/:id/mark-sold - Mark listing as sold/fulfilled
- DELETE /listings/:id - Remove listing

#### Haulage Bid Actions (`haulage-bid-actions.acceptance.ts`)
- POST /haulage-offers/:id/actions - Approve haulage bid
- POST /haulage-offers/:id/actions - Reject haulage bid with reason

### Phase 1

#### Registration (`registration.acceptance.ts`)
- POST /register-trading - Register new trading user
- POST /register-haulage - Register new haulage user

#### Company Onboarding (`company-onboarding.acceptance.ts`)
- PATCH /companies/:id - Update company information
- POST /company-locations - Create company location
- POST /company-documents - Upload company document

#### Admin Member Approval (`admin-member-approval.acceptance.ts`)
- PATCH /users/admin/:id/:requestAction - Approve member
- PATCH /users/admin/:id/:requestAction - Reject member with reason
- GET /users/admin/:id - Retrieve member details for review

#### Offers (`offers.acceptance.ts`)
- POST /offers - Create offer on listing
- GET /offers - Retrieve user offers
- PATCH /offers/:id/accept - Seller accepts offer

## Notes

- Tests use mock JWT tokens (replace with actual tokens for real testing)
- Tests assume database is seeded with sample data
- Each test focuses on happy path only (no error cases)
- Maximum 2 tests per API endpoint
