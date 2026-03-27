# CU Admin Dashboard 6.4.1.11 / 6.4.1.13 / 6.4.1.16 / 6.4.1.18 / 6.4.1.19 (Backend)

Tài liệu này mô tả các thay đổi Backend cho các ClickUp tasks:

- `869abxxrx` (6.4.1.11 Listings/Offers/Wanted Search/Filters)
- `869abxxt2` (6.4.1.13 Filter Haulage Bids)
- `869abxxt8` (6.4.1.16 Make an Offer on Behalf of a Haulier)
- `869abxxtd` (6.4.1.18 View Sample Request Table)
- `869abxxte` (6.4.1.19 View MFI Table)

File lấy mô tả task: `docs/Phase 2/Work Package 2/CU-AdminDashboard-6.4.1.11-13-16-18-19-TaskDetails.json`

## Auth & Base URL

- Tất cả endpoint bên dưới yêu cầu JWT admin (Admin/Super Admin/Sales Admin tuỳ endpoint).
- FE cần set header: `Authorization: Bearer <JWT>`
- Base URL theo environment (ví dụ DEV): `https://wastetrade-api-dev.b13devops.com`

## 1) 6.4.1.11 Listings/Offers/Wanted Search/Filters

### Listings (Admin)

Đã mở rộng logic `searchTerm` để:

- Tách theo token (space-separated) và áp dụng `AND` giữa các token
- Tìm theo các trường material mở rộng: `material_form`, `material_grading`, `material_color`, `material_finishing`
- Tìm theo `companyId`, `userId`

Code:

- `src/services/listing.service.ts`

#### cURL: Admin View Sell Listings (có search/filter)

```bash
curl -L -X GET 'https://wastetrade-api-dev.b13devops.com/listings/sell?filter=%7B%22skip%22%3A0%2C%22limit%22%3A20%2C%22where%22%3A%7B%22searchTerm%22%3A%22uk%20plastic%20bale%22%2C%22materialType%22%3A%5B%22plastic%22%5D%2C%22company%22%3A%22Seller%20Corp%22%2C%22country%22%3A%22UK%22%2C%22status%22%3A%22available%22%2C%22state%22%3A%22approved%22%2C%22sortBy%22%3A%22createdAtDesc%22%7D%7D' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>'
```

#### cURL: Admin View Wanted Listings (có search/filter)

```bash
curl -L -X GET 'https://wastetrade-api-dev.b13devops.com/listings/wanted?filter=%7B%22skip%22%3A0%2C%22limit%22%3A20%2C%22where%22%3A%7B%22searchTerm%22%3A%22de%20aluminum%20flake%22%2C%22materialType%22%3A%5B%22metal%22%5D%2C%22company%22%3A%22Buyer%20Corp%22%2C%22country%22%3A%22Germany%22%2C%22wantedStatus%22%3A%22Material%20Required%22%2C%22state%22%3A%22approved%22%7D%7D' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>'
```

### Offers (Admin)

Đã mở rộng logic `searchTerm` để:

- Tách theo token (space-separated) và áp dụng `AND` giữa các token
- Tìm theo các trường material mở rộng: `material_form`, `material_grading`, `material_color`, `material_finishing`
- Tìm theo `offerId`, `buyerUserId`, `sellerUserId`

Code:

- `src/services/offer.service.ts`

#### cURL: Admin View Offers (có search/filter)

```bash
curl -L -X GET 'https://wastetrade-api-dev.b13devops.com/offers/admin?filter=%7B%22skip%22%3A0%2C%22limit%22%3A20%2C%22where%22%3A%7B%22searchTerm%22%3A%22uk%20plastic%201234%22%2C%22status%22%3A%22pending%22%2C%22buyerCompanyName%22%3A%22Buyer%20Corp%22%2C%22sellerCompanyName%22%3A%22Seller%20Corp%22%7D%7D' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>'
```

## 2) 6.4.1.13 Filter Haulage Bids

### Endpoint

Endpoint hiện có:

- `GET /admin/haulage-bids`

### Query/Filter hỗ trợ

Hỗ trợ truyền filter theo 2 cách:

- Query params rời: `?skip=&limit=&status=&state=&materialType=&textSearch=&dateFrom=&dateTo=...`
- Query `filter` dạng JSON string: `?filter={"skip":0,"limit":20,"status":"pending","state":"approved","materialType":"Plastic","textSearch":"UK buyer","dateFrom":"2025-01-01","dateTo":"2025-01-31"}`

Điều kiện filter chính:

- `status` (haulage offer status)
- `state` (offer state)
- `materialType` (listing material_type)
- `textSearch` hỗ trợ token hoá theo space và dùng `AND` giữa các token
- `dateFrom/dateTo` lọc theo:
  - `haulage_offers.created_at` (ngày tạo bid) và/hoặc
  - cửa sổ delivery của `offers` (`earliest_delivery_date/latest_delivery_date`)

Code:

- `src/services/haulage-offer.service.ts`
- `src/controllers/haulage-offers.controller.ts`

### cURL examples

#### Cách 1: truyền `filter` (JSON string)

```bash
curl -L -X GET 'https://wastetrade-api-dev.b13devops.com/admin/haulage-bids?filter=%7B%22skip%22%3A0%2C%22limit%22%3A20%2C%22status%22%3A%22pending%22%2C%22state%22%3A%22approved%22%2C%22materialType%22%3A%22Plastic%22%2C%22textSearch%22%3A%22uk%20buyer%20john%40mail.com%22%2C%22dateFrom%22%3A%222025-01-01%22%2C%22dateTo%22%3A%222025-01-31%22%7D' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>'
```

#### Cách 2: truyền query params rời

```bash
curl -L -X GET 'https://wastetrade-api-dev.b13devops.com/admin/haulage-bids?skip=0&limit=20&status=pending&state=approved&materialType=Plastic&textSearch=uk%20buyer&dateFrom=2025-01-01&dateTo=2025-01-31' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>'
```

## 3) 6.4.1.16 Make an Offer on Behalf of a Haulier

### Endpoint mới

- `GET /admin/hauliers` (dropdown data)
- `POST /admin/haulage-offers` (tạo haulage offer thay mặt haulier)

### GET /admin/hauliers

Query/Filter:

- `?search=` (optional)
- `?filter={"skip":0,"limit":20,"search":"abc"}`

Trả về danh sách user thuộc company haulier (company `is_haulier=true` và `status=active`).

#### cURL: GET /admin/hauliers

```bash
curl -L -X GET 'https://wastetrade-api-dev.b13devops.com/admin/hauliers?filter=%7B%22skip%22%3A0%2C%22limit%22%3A20%2C%22search%22%3A%22waste%22%7D' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>'
```

### POST /admin/haulage-offers

Body (JSON) theo `AdminCreateHaulageOffer`:

- `offerId` (number)
- `haulierCompanyId` (number)
- `haulierUserId` (number)
- `trailerContainerType` (string)
- `completingCustomsClearance` (boolean)
- `haulageCostPerLoad` (number)
- `quantityPerLoad` (number, optional)
- `currency` (`GBP|EUR|USD`)
- `transportProvider`
- `suggestedCollectionDate` (date)
- `expectedTransitTime`
- `demurrageAtDestination` (number)
- `notes` (string, optional)

#### cURL: POST /admin/haulage-offers

```bash
curl -L -X POST 'https://wastetrade-api-dev.b13devops.com/admin/haulage-offers' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  --data-raw '{
    "offerId": 1234,
    "haulierCompanyId": 10,
    "haulierUserId": 55,
    "trailerContainerType": "40ft container",
    "completingCustomsClearance": false,
    "haulageCostPerLoad": 1200,
    "quantityPerLoad": 24,
    "currency": "GBP",
    "transportProvider": "road",
    "suggestedCollectionDate": "2025-02-10T00:00:00.000Z",
    "expectedTransitTime": "3_5_days",
    "demurrageAtDestination": 21,
    "notes": "Internal note for admin-only"
  }'
```

Rule/Validation:

- Chỉ admin mới được thao tác
- `offer` phải hợp lệ để tạo haulage offer (hiện kiểm tra `offer.status = accepted`)
- Haulier company phải `isHaulier=true` và `status=active`
- Haulier user phải thuộc company_users của haulier company
- `demurrageAtDestination >= 21`
- `suggestedCollectionDate` phải nằm trong cửa sổ buyer delivery (`earliest_delivery_date` → `latest_delivery_date`)
- `notes` không được chứa phone/email/url và giới hạn độ dài

Code:

- `src/services/haulage-offer.service.ts`
- `src/controllers/haulage-offers.controller.ts`
- `src/models/admin-create-haulage-offer.model.ts`

## 4) 6.4.1.18 View Sample Request Table

### Endpoint

- `GET /admin/sample-requests`

### Query/Filter hỗ trợ

Hỗ trợ truyền filter theo query `filter` dạng JSON string:
- `?filter={"skip":0,"limit":20,"where":{"status":"Sample Requested"}}`

### Response Schema

```typescript
{
  status: 'success',
  message: 'Sample requests retrieved successfully',
  data: {
    results: SampleRequest[],
    totalCount: number,
    skip: number,
    limit: number
  }
}

interface SampleRequest {
  id: number;
  listingId: number;
  buyerUserId: number;
  buyerCompanyId: number;
  buyerLocation?: string;
  buyerCountry?: string;
  sellerUserId: number;
  sellerCompanyId: number;
  sellerLocation?: string;
  sellerCountry?: string;
  assignedAdminId?: number;
  numberOfSamples: number;
  sampleSize: string; // e.g., "1kg", "5kg"
  buyerMessage?: string;
  materialName?: string; // Mock material data (e.g., "NON-FERROUS - STAINLESS STEEL 304")
  status: 'Sample Requested' | 'Sample Approved' | 'Sample Dispatched' | 
          'Sample In Transit' | 'Customs Cleared' | 'Sample Delivered' | 
          'Customer Feedback Requested' | 'Feedback Provided';
  sentDate?: Date;
  receivedDate?: Date;
  postageLabelUrl?: string;
  isSyncedSalesForce: boolean;
  lastSyncedSalesForceDate?: Date;
  salesforceId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Schema

- **Table**: `sample_requests` (auto-created by LoopBack 4 from model)
- **Migration**: `[2.0.1]-insert-sample-mfi-requests-data.migration.ts` inserts 12 sample records

### Sample Data

Migration inserts 12 sample records với:
- Các status khác nhau để FE test UI
- Mock `material_name` field với các loại vật liệu: NON-FERROUS (Stainless Steel, Aluminium, Copper, Brass), PLASTICS (HDPE, PP, PET, LDPE, PVC, ABS), FERROUS (Steel Scrap, Cast Iron)

#### cURL: GET /admin/sample-requests

```bash
curl -L -X GET 'https://wastetrade-api-dev.b13devops.com/admin/sample-requests?filter=%7B%22skip%22%3A0%2C%22limit%22%3A20%7D' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>'
```

Code:
- `src/models/sample-requests.model.ts` - Model definition (LB4 auto-creates table)
- `src/repositories/sample-requests.repository.ts` - Repository
- `src/controllers/admin-requests.controller.ts` - Controller
- `src/migrations/[2.0.1]-insert-sample-mfi-requests-data.migration.ts` - Sample data

## 5) 6.4.1.19 View MFI Table

### Endpoint

- `GET /admin/mfi-requests`

### Query/Filter hỗ trợ

Hỗ trợ truyền filter theo query `filter` dạng JSON string:
- `?filter={"skip":0,"limit":20,"where":{"status":"Tested"}}`

### Response Schema

```typescript
{
  status: 'success',
  message: 'MFI requests retrieved successfully',
  data: {
    results: MfiRequest[],
    totalCount: number,
    skip: number,
    limit: number
  }
}

interface MfiRequest {
  id: number;
  listingId: number;
  buyerUserId: number;
  buyerCompanyId: number;
  buyerLocation?: string;
  buyerCountry?: string;
  sellerUserId: number;
  sellerCompanyId: number;
  sellerLocation?: string;
  sellerCountry?: string;
  assignedAdminId?: number;
  buyerMessage?: string;
  materialName?: string; // Mock material data (e.g., "PLASTICS - HDPE")
  status: 'Awaiting Payment' | 'Pending' | 'Tested';
  testedDate?: Date;
  mfiResult?: number; // MFI test result value
  isSyncedSalesForce: boolean;
  lastSyncedSalesForceDate?: Date;
  salesforceId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Schema

- **Table**: `mfi_requests` (auto-created by LoopBack 4 from model)
- **Migration**: `[2.0.1]-insert-sample-mfi-requests-data.migration.ts` inserts 12 sample records

### Sample Data

Migration inserts 12 sample records với:
- Các status khác nhau để FE test UI
- Mock `material_name` field với các loại plastic: HDPE, PP, LDPE, PET, PVC, PS, ABS, PMMA, PC, PA, POM, TPU

#### cURL: GET /admin/mfi-requests

```bash
curl -L -X GET 'https://wastetrade-api-dev.b13devops.com/admin/mfi-requests?filter=%7B%22skip%22%3A0%2C%22limit%22%3A20%7D' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <JWT>'
```

Code:
- `src/models/mfi-requests.model.ts` - Model definition (LB4 auto-creates table)
- `src/repositories/mfi-requests.repository.ts` - Repository
- `src/controllers/admin-requests.controller.ts` - Controller
- `src/migrations/[2.0.1]-insert-sample-mfi-requests-data.migration.ts` - Sample data
