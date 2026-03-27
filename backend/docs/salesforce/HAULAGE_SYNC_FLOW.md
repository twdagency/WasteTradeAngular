# Haulage Offers & Loads - Salesforce Sync Flow

## Quick Summary

1. **Haulier tạo bid** (WT) → PENDING → sync lên SF `Haulage_Offers__c`
2. **Admin approve** (WT) → ACCEPTED → generate loads → sync loads lên SF `Haulage_Loads__c`
3. **SF user update load** (SF) → webhook về WT → update DB → sync confirm lại SF
4. **Admin mark shipped** (WT) → update offer status → sync offer lên SF
5. **SF user update offer** (SF) → webhook về WT → update DB
6. **Cronjob** (WT) → retry sync failed records mỗi 10 phút

> **Load là gì?** Mỗi haulage offer có thể có nhiều chuyến vận chuyển (loads). VD: offer có 5 loads = 5 chuyến xe/container.
> 
> **SF user update load những gì?**
> - `collection_date__c` - Ngày lấy hàng
> - `gross_weight__c` - Trọng lượng tổng
> - `pallet_weight__c` - Trọng lượng pallet
> - `load_status__c` - Trạng thái: "Awaiting Collection" → "In Transit" → "Delivered"

---

## Overview

Haulage offers and loads sync to Salesforce objects:
- `Haulage_Offers__c` - Parent haulage bid/offer
- `Haulage_Loads__c` - Individual loads (child of haulage offer)

---

## Complete Flow (Action Location)

### Step 1: Haulier Creates Bid
| Action | Location | Code |
|--------|----------|------|
| Haulier submits bid | **WT Frontend** | `haulage-offer.service.ts` |
| HaulageOffer created (PENDING) | **WT Backend** | `haulageOffersRepository.create()` |
| Auto-sync to SF | **WT Backend** | `salesforceSyncObserver.syncHaulageOfferOnChange()` |

**Result:** `Haulage_Offers__c` created in SF with status "Pending"

---

### Step 2: Admin Approves Bid
| Action | Location | Code |
|--------|----------|------|
| Admin clicks Approve | **WT Frontend (Admin)** | `admin-haulage.service.ts` |
| Status → ACCEPTED | **WT Backend** | `haulageOfferService.processHaulageBidAction()` |
| Generate loads | **WT Backend** | `generateLoadsForHaulageOffer()` |
| Sync each load to SF | **WT Backend** | `salesforceSyncService.syncHaulageLoad()` |
| Sync offer to SF | **WT Backend** | `salesforceSyncObserver.syncHaulageOfferOnChange()` |

**Result:** 
- `Haulage_Offers__c` updated with status "Accepted"
- N x `Haulage_Loads__c` created with status "Awaiting Collection"

---

### Step 3: Load Status Updates (from SF)
| Action | Location | Code |
|--------|----------|------|
| SF user updates load fields | **Salesforce** | Manual edit |
| SF sends webhook | **SF → WT** | HTTP POST |
| WT processes update | **WT Backend** | `salesforceWebhookService.processHaulageLoadUpdate()` |
| If load = "Delivered" → update offer | **WT Backend** | Count delivered loads → update `shippedLoads`, `status` |
| Sync load back to SF | **WT Backend** | `salesforceSyncService.syncHaulageLoad()` |
| Sync offer to SF (if changed) | **WT Backend** | `salesforceSyncService.syncHaulageOffer()` |

**Editable fields from SF:**
- `collection_date__c` → collectionDate
- `gross_weight__c` → grossWeight
- `pallet_weight__c` → palletWeight
- `load_status__c` → loadStatus ("Awaiting Collection" / "In Transit" / "Delivered")

**Auto-update khi load = "Delivered":**
- Count tất cả loads có status "Delivered"
- Update offer `shippedLoads` = số loads delivered
- Update offer `status`:
  - Nếu tất cả loads delivered → SHIPPED + set `shippedDate`
  - Nếu một phần → PARTIALLY_SHIPPED

---

### Step 4: Mark as Shipped (Manual từ WT Admin)
| Action | Location | Code |
|--------|----------|------|
| Admin clicks "Mark as Shipped" | **WT Frontend (Admin)** | `haulage-bid-detail.component.ts` |
| API call | **WT Frontend** | `PATCH /haulage-offers/{id}/mark-shipped` |
| Update offer status | **WT Backend** | `haulageOfferService.markAsShipped()` |
| Sync offer to SF | **WT Backend** | `salesforceSyncObserver.syncHaulageOfferOnChange()` |

**Khác với Step 3:**
- Step 3: SF user update từng load → tự động tính `shippedLoads`
- Step 4: WT Admin manually mark shipped → tăng `shippedLoads` theo số admin chọn

**Status transitions:**
- If partial: ACCEPTED → PARTIALLY_SHIPPED
- If all loads: ACCEPTED/PARTIALLY_SHIPPED → SHIPPED

**Note:** `markAsShipped` updates the offer's `shippedLoads` count, NOT individual load records.

---

### Step 5: SF Updates Offer Status
| Action | Location | Code |
|--------|----------|------|
| SF user changes status | **Salesforce** | Manual edit |
| SF sends webhook | **SF → WT** | HTTP POST |
| WT processes update | **WT Backend** | `salesforceWebhookService.processHaulageOfferStatusUpdate()` |

**Editable fields from SF:**
- `status__c` → status
- `rejection_reason__c` → rejectionReason
- `shipped_loads__c` → shippedLoads
- `shipped_date__c` → shippedDate

---

## Sync Mechanisms Summary

| Mechanism | Trigger | Direction | Code Location |
|-----------|---------|-----------|---------------|
| Observer | On entity change | WT → SF | `salesforce-sync.observer.ts` |
| Cronjob | Every 10 min | WT → SF | `salesforce-retry.cronjob.ts` |
| Webhook | SF sends event | SF → WT | `salesforce-webhook.service.ts` |
| Direct call | After generation | WT → SF | `haulage-offer.service.ts` |

---

## Implementation Status

| Flow Step | Status | Notes |
|-----------|--------|-------|
| 1. Create bid → sync | ✅ Done | Via observer |
| 2. Approve → generate loads → sync | ✅ Done | Direct call in `generateLoadsForHaulageOffer()` |
| 3. SF updates load → sync back | ✅ Done | Webhook + sync confirm |
| 4. Mark as shipped → sync | ✅ Done | Via observer |
| 5. SF updates offer → sync back | ✅ Done | Webhook handler |
| Cronjob retry | ✅ Done | HaulageOffers + HaulageLoads |

---

## Status Flow Diagram

```
                    WT Admin
                       ↓
PENDING ──────────→ ACCEPTED ──────────→ PARTIALLY_SHIPPED ──────────→ SHIPPED
    │                  │                        │
    │ (reject)         │ (withdraw)             │ (withdraw)
    ↓                  ↓                        ↓
REJECTED          WITHDRAWN                 WITHDRAWN
    │
    │ (request info)
    ↓
INFORMATION_REQUESTED ──→ PENDING (resubmit)
```

---

## Load Status Flow

```
Awaiting Collection → In Transit → Delivered
        ↑                              ↓
        └──────── (SF can update) ─────┘
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `haulage-offer.service.ts` | Business logic, `markAsShipped()`, `generateLoadsForHaulageOffer()` |
| `haulage-offers.controller.ts` | REST endpoints |
| `salesforce-sync.service.ts` | `syncHaulageOffer()`, `syncHaulageLoad()` |
| `salesforce-sync.observer.ts` | Auto-sync on change |
| `salesforce-webhook.service.ts` | Inbound sync from SF |
| `salesforce-retry.cronjob.ts` | Periodic retry for failed syncs |
| `salesforce-object-mappers.utils.ts` | Field mapping |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/haulage-offers/{id}/mark-shipped` | PATCH | Mark loads as shipped (Admin) |
| `/haulage-offers/{id}/action` | POST | Approve/Reject/Request Info (Admin) |
| `/salesforce/webhook/haulage-offer` | POST | Inbound from SF |
| `/salesforce/webhook/haulage-load` | POST | Inbound from SF |
