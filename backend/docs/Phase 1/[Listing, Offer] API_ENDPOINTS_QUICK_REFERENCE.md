# API Endpoints Quick Reference

Simple reference for all GET/filter endpoints in the WasteTrade API.

## 🗂️ Listings Endpoints

### GET /listings
**Public listings with advanced filtering**
```bash
GET /listings?filter[where][materialType]=plastic&filter[where][country]=UK
```

### GET /listings/sell (Admin Only)
**Admin view of sell listings**
```bash
GET /listings/sell?filter[where][company]=WasteCorp&filter[where][status]=available
```

### GET /listings/wanted (Admin Only) 
**Admin view of wanted listings**
```bash
GET /listings/wanted?filter[where][materialType]=plastic&filter[where][state]=approved
```

### GET /listings/user
**Current user's own listings**
```bash
GET /listings/user?filter[where][listingType]=sell&filter[where][status][eq]=sold
```

## 🤝 Offers Endpoints

### GET /offers
**User's offers (buyer/seller view)**
```bash
GET /offers?filter[where][isSeller]=true&filter[where][listingId]=123
```

### GET /offers/admin (Admin Only)
**Admin view of all offers**
```bash
GET /offers/admin?filter[where][searchTerm]=plastic&filter[where][status]=pending
```

## 🔧 Filter Parameters by Endpoint

### 📋 ALL Endpoints (Common)
**Pagination:**
- `filter[skip]=0` - Skip records
- `filter[limit]=20` - Limit results

---

### 🗂️ LISTINGS Endpoints

#### GET /listings (Public)
**Available filters:**
- `filter[where][searchTerm]=plastic` - Search materials
- `filter[where][materialType]=plastic` - Material type
- `filter[where][materialItem]=hdpe` - Material item  
- `filter[where][materialPacking]=bales` - Packing type
- `filter[where][country]=UK` - Country filter
- `filter[where][listingType]=sell` - sell or wanted
- `filter[where][status]=available` - Listing status
- `filter[where][wasteStoration]=indoor` - Storage type
- `filter[where][sortBy]=createdAtDesc` - Sort results

#### GET /listings/user (User's Own)
**Available filters:** Same as `/listings` above

#### GET /listings/sell & /listings/wanted (Admin Only)  
**Available filters:** All from `/listings` PLUS:
- `filter[where][company]=WasteCorp` - Company name
- `filter[where][name]=John` - User name
- `filter[where][dateRequireFrom]=2024-01-01` - Date from
- `filter[where][dateRequireTo]=2024-12-31` - Date to

---

### 🤝 OFFERS Endpoints

#### GET /offers (User View)
**Available filters:**
- `filter[where][isSeller]=true` - View as seller/buyer
- `filter[where][listingId]=123` - Specific listing
- `filter[where][materialItem]=hdpe` - Material item

#### GET /offers/admin (Admin Only)
**Available filters:**
- `filter[where][searchTerm]=plastic` - Global search
- `filter[where][buyerName]=John` - Buyer name
- `filter[where][sellerName]=Jane` - Seller name  
- `filter[where][buyerCompanyName]=BuyerCorp` - Buyer company
- `filter[where][sellerCompanyName]=SellerCorp` - Seller company
- `filter[where][materialType]=plastic` - Material type
- `filter[where][location]=UK` - Location filter
- `filter[where][status]=pending` - Offer status
- `filter[where][sortBy]=createdAtDesc` - Sort results

## 📋 Examples by Endpoint

### /listings Examples
```bash
# Basic search
GET /listings?filter[where][materialType]=plastic&filter[where][country]=UK

# Exclude sold listings
GET /listings?filter[where][status][neq]=sold&filter[limit]=20
```

### /listings/user Examples  
```bash
# User's sell listings only
GET /listings/user?filter[where][listingType]=sell&filter[where][sortBy]=createdAtDesc

# User's available listings  
GET /listings/user?filter[where][status]=available
```

### /listings/sell & /listings/wanted Examples (Admin)
```bash
# Admin: Company filter
GET /listings/sell?filter[where][company]=WasteCorp&filter[where][status]=pending

# Admin: Date range
GET /listings/wanted?filter[where][dateRequireFrom]=2024-01-01&filter[where][materialType]=plastic
```

### /offers Examples
```bash
# View as seller
GET /offers?filter[where][isSeller]=true&filter[where][listingId]=123

# View as buyer
GET /offers?filter[where][isSeller]=false
```

### /offers/admin Examples (Admin)
```bash
# Search by material
GET /offers/admin?filter[where][searchTerm]=hdpe&filter[where][status]=pending

# Filter by companies
GET /offers/admin?filter[where][buyerCompanyName]=BuyerCorp&filter[where][location]=UK
```

## 🎯 Enum Values

**Material Types**: plastic, efw, fibre, rubber, metal
**Listing Types**: sell, wanted  
**Listing Status**: available, pending, sold, rejected, expired
**Listing State**: approved, pending, rejected
**Offer Status**: pending, approved, accepted, rejected, shipped
**Offer State**: pending, active, closed
**Storage Types**: indoor, outdoor, both, any
**Currencies**: gbp, usd, eur
**Packing Types**: bags, bales, boxes, bulk_bags, loose, octabins_gaylords, pallets

## 🔐 Authentication

All endpoints except public `/listings` require JWT token:
```bash
Authorization: Bearer your-jwt-token
``` 