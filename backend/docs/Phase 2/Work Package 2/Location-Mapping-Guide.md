# Location Mapping Guide for Admin Listings API

## Overview

The `location` field in listing responses has **different meanings** depending on whether it's a **sell listing** or a **wanted listing**. This document explains the correct implementation to avoid null location issues.

---

## Location Field Semantics

### Sell Listings (Listing Type: `sell`)
- **Location represents**: Seller's warehouse/pickup location
- **Data source**: `listings.location_id` → `company_locations.id`
- **Purpose**: Shows where the material is physically located for pickup
- **Example**: "Warehouse A, Manchester, UK"

### Wanted Listings (Listing Type: `wanted`)
- **Location represents**: Buyer's company headquarters/main office
- **Data source**: `companies.id` → `company_locations` WHERE `main_location = true`
- **Purpose**: Shows the buyer's company contact location
- **Example**: "ABC Corp HQ, London, UK"
- **IMPORTANT**: `listings.location_id` is **always NULL** for wanted listings in the database

---

## Database Schema

```sql
-- Sell Listings Flow
listings.location_id (NOT NULL for sell) 
  → company_locations.id 
  → Seller's warehouse location

-- Wanted Listings Flow
listings.company_id 
  → companies.id 
  → company_locations WHERE company_id = companies.id AND main_location = true
  → Buyer's main company location

-- Note: listings.location_id is NULL for wanted listings
```

---

## SQL Query Implementation

### ❌ WRONG - Don't Do This

```sql
-- This will return NULL for all wanted listings!
LEFT JOIN company_locations cl ON l.location_id = cl.id
```

### ✅ CORRECT - Sell Listings Query

```sql
LEFT JOIN company_locations cl ON l.location_id = cl.id
```

### ✅ CORRECT - Wanted Listings Query

```sql
-- Must join on company's main location, NOT listings.location_id
LEFT JOIN company_locations cl ON c.id = cl.company_id AND cl.main_location = true

-- Also select the location ID with an alias
SELECT cl.id as company_main_location_id, ...
```

---

## Response Mapping Implementation

### Field Mapping

```typescript
{
  location: row.location_name ? {
    // CRITICAL: Use company_main_location_id for wanted, location_id for sell
    id: row.company_main_location_id || row.location_id || null,
    locationName: row.location_name,
    country: row.location_country,
    city: row.location_city,
    addressLine: row.location_address_line,
    street: row.location_street,
    postcode: row.location_postcode,
    stateProvince: row.location_state_province,
  } : null
}
```

### Why Check `row.location_name`?

- If company doesn't have a main location set, `location_name` will be NULL
- Return `null` for entire location object instead of object with all null fields
- Cleaner API response

---

## Common Pitfalls & How to Avoid

### ❌ Pitfall 1: Using `listings.location_id` for wanted listings
**Problem**: All wanted listings have `location_id = NULL` in database  
**Solution**: Use company's `main_location` flag instead

### ❌ Pitfall 2: Not selecting `cl.id` in wanted query
**Problem**: `location.id` will be NULL even when location data exists  
**Solution**: Select `cl.id as company_main_location_id` in the query

### ❌ Pitfall 3: Creating location object when all fields are null
**Problem**: Returns `{ id: null, locationName: null, ... }` instead of `null`  
**Solution**: Check `row.location_name` before creating the object

### ❌ Pitfall 4: Using same JOIN for both listing types
**Problem**: Wanted listings won't have location data  
**Solution**: Use conditional JOIN based on `listingType`

---

## Code Location References

**File**: `wastetrade-backend/src/services/listing.service.ts`

### Key Sections:

1. **Documentation Comment**: Line ~1485
   - Explains the entire location mapping logic

2. **Wanted Query**: Line ~1580
   - Shows correct JOIN for wanted listings
   - Selects `company_main_location_id`

3. **Count Query**: Line ~1630
   - Conditional JOIN based on listing type

4. **Response Mapping**: Line ~1700
   - Uses `company_main_location_id || location_id`

---

## Functional Requirements Reference

**Document**: `docs/Phase 2/Work Package 2/WT Phase 2 - WP2 - Functional Overview.md`  
**Section**: 6.4.1.7 - View Wanted Listings Table

### Key Requirements:
- Buyer section must include:
  - ID
  - User Name
  - **Company**
  - **Location** (buyer's company location)
  - Country

- Location is clickable and shows modal with location details
- Separate from "Required In" country field (delivery destination)

---

## Testing Checklist

When modifying listing queries, verify:

- [ ] Sell listings show seller's warehouse location
- [ ] Wanted listings show buyer's company main location
- [ ] Location ID is not null when location data exists
- [ ] Companies without main location return `location: null`
- [ ] Both listing types use correct JOIN conditions
- [ ] Count queries match main queries for consistency

---

## Related Fields

### Don't Confuse These:

| Field | Purpose | Source |
|-------|---------|--------|
| `location` | Seller warehouse (sell) OR Buyer HQ (wanted) | `company_locations` |
| `country` | Delivery destination for wanted listings | `listings.country` |
| `locationId` | Internal reference to specific location | `listings.location_id` |

---

## Future Maintenance

⚠️ **Before changing location-related queries:**

1. Read this document
2. Understand the difference between sell and wanted location semantics
3. Test both listing types after changes
4. Verify location ID is populated correctly
5. Check null handling for companies without main location

---

## Questions?

If unclear about location mapping, refer to:
- Functional requirements: Section 6.4.1.7
- Code documentation in `listing.service.ts`
- This guide

Last Updated: 2025-12-28
