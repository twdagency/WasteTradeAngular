# Test Setup Guide

## Prerequisites

1. **Database**: PostgreSQL running with test database
2. **Environment**: `.env` file configured with test database connection
3. **Migrations**: All migrations applied including test data seeds

## Setup Steps

### 1. Run Migrations

```bash
pnpm migrate
```

This will:
- Create all database tables
- Seed test users (migration `[2.0.2]-seed-test-users.migration.ts`)
- Seed sample data for MFI/Sample requests

### 2. Test Users

The following test users are created automatically:

| Email | Password | Role | Company |
|-------|----------|------|---------|
| `admin@wastetrade.test` | `Test123!@#` | Admin | Test Admin Company |
| `seller@wastetrade.test` | `Test123!@#` | Seller | Test Seller Company |
| `buyer@wastetrade.test` | `Test123!@#` | Buyer | Test Buyer Company |
| `haulier@wastetrade.test` | `Test123!@#` | Haulier | Test Haulier Company |

### 3. Run Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- --grep "Haulage Offers"

# Run in watch mode
pnpm test:dev
```

## Test Structure

Tests use **real JWT tokens** obtained by logging in with test users:

```typescript
// Example from test-helper.ts
const haulierToken = await getHaulierToken(client);

// Use in test
await client
  .get('/haulage-offers/company-hauliers')
  .set('Authorization', `Bearer ${haulierToken}`)
  .expect(200);
```

## Environment Protection

Tests and migrations **only run in dev/local/test environments**:
- ✅ Allowed: `development`, `local`, `test`
- ❌ Blocked: `uat`, `production`, any other environment

This is enforced in:
- `test-helper.ts` - Checks environment before running tests
- `[2.0.2]-seed-test-users.migration.ts` - Only seeds in allowed environments

## Test Data Requirements

Some tests require existing data:

### Listings
- At least 1 approved sell listing (for offer tests)
- At least 1 approved wanted listing

### Offers
- At least 1 approved offer (for haulage offer tests)
- Offer must have valid delivery window dates

### Locations
- Test companies should have at least 1 location

## Creating Test Data

### Option 1: Manual via API

Use the test users to create data via API endpoints:

```bash
# Login as seller
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@wastetrade.test","password":"Test123!@#"}'

# Create listing (use returned token)
curl -X POST http://localhost:3000/listings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{...listing data...}'
```

### Option 2: Migration Script

Create a new migration to seed test listings/offers:

```typescript
// src/migrations/[2.0.3]-seed-test-listings.migration.ts
export class SeedTestListings implements Migration {
  version = '2.0.3';
  
  async up(dataSource: juggler.DataSource) {
    // Insert test listings
    await dataSource.execute(`
      INSERT INTO listings (...)
      VALUES (...)
    `);
  }
}
```

## Troubleshooting

### Login Fails

**Error**: `Login failed for admin@wastetrade.test`

**Solution**: 
1. Check migration ran: `SELECT * FROM users WHERE email LIKE '%wastetrade.test'`
2. Re-run migration: `pnpm migrate`
3. Check password hash is correct

### Test Data Not Found

**Error**: `404 Not Found` when accessing offers/listings

**Solution**:
1. Create test data manually or via migration
2. Update test to use correct IDs from your database
3. Use `.skip()` to skip tests requiring specific data

### Database Connection

**Error**: `Connection refused`

**Solution**:
1. Check PostgreSQL is running
2. Verify `.env` DATABASE_URL is correct
3. Ensure test database exists

## CI/CD Integration

For CI/CD pipelines:

1. **Setup test database**:
   ```bash
   createdb wastetrade_test
   ```

2. **Run migrations**:
   ```bash
   DATABASE_URL=postgresql://user:pass@localhost/wastetrade_test pnpm migrate
   ```

3. **Run tests**:
   ```bash
   DATABASE_URL=postgresql://user:pass@localhost/wastetrade_test pnpm test
   ```

## Test Coverage

All tests now use **real authentication** with JWT tokens:

### Phase 2 WP2 (5 files, 19 tests)
- ✅ `admin-offers.acceptance.ts` - Admin offer management
- ✅ `haulage-offers.acceptance.ts` - Haulier team bidding
- ✅ `admin-requests.acceptance.ts` - Sample/MFI requests
- ✅ `admin-haulage-bids.acceptance.ts` - Admin haulage management
- ✅ `admin-listings.acceptance.ts` - Listings filters

### Phase 2 WP1 (3 files, 11 tests)
- ✅ `haulage-profile.acceptance.ts` - Haulier profile management
- ✅ `listings-management.acceptance.ts` - Create/update listings
- ✅ `haulage-bid-actions.acceptance.ts` - Bid actions

### Phase 1 (4 files, 12 tests)
- ✅ `registration.acceptance.ts` - User registration
- ✅ `company-onboarding.acceptance.ts` - Company setup
- ✅ `admin-member-approval.acceptance.ts` - Member approval
- ✅ `offers.acceptance.ts` - Offer management

**Total: 12 test files, 42 tests**

## Notes

- Test users are **only for testing** - never use in production
- Tests use **real database** - not mocked
- Each test should be **idempotent** (can run multiple times)
- Clean up created data in `after()` hooks if needed
- Tests requiring specific IDs may need manual data setup or `.skip()`
