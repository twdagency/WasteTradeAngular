export enum OfferStatusEnum {
    PENDING = 'pending',
    APPROVED = 'approved', // NEW: Admin approved, visible to seller
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    PARTIALLY_SHIPPED = 'partially_shipped', // Load X of X shipped
    SHIPPED = 'shipped',
}

export enum OfferState {
    PENDING = 'pending', // Waiting for admin review
    ACTIVE = 'active', // Admin approved, seller can act
    CLOSED = 'closed', // Final state (accepted/rejected)
    // REMOVED: APPROVED, REJECTED (redundant with status)
}

export enum OfferRequestActionEnum {
    ACCEPT = 'accept',
    REJECT = 'reject',
    REQUEST_INFORMATION = 'request_information',
}

export enum OfferSortBy {
    BUYER_COMPANY_NAME_ASC = 'buyerCompanyNameAsc',
    BUYER_COMPANY_NAME_DESC = 'buyerCompanyNameDesc',
    SELLER_COMPANY_NAME_ASC = 'sellerCompanyNameAsc',
    SELLER_COMPANY_NAME_DESC = 'sellerCompanyNameDesc',
    BUYER_COUNTRY_ASC = 'buyerCountryAsc',
    BUYER_COUNTRY_DESC = 'buyerCountryDesc',
    SELLER_COUNTRY_ASC = 'sellerCountryAsc',
    SELLER_COUNTRY_DESC = 'sellerCountryDesc',
    BUYER_NAME_ASC = 'buyerNameAsc',
    BUYER_NAME_DESC = 'buyerNameDesc',
    SELLER_NAME_ASC = 'sellerNameAsc',
    SELLER_NAME_DESC = 'sellerNameDesc',
    STATUS_ASC = 'statusAsc',
    STATUS_DESC = 'statusDesc',
    STATE_ASC = 'stateAsc',
    STATE_DESC = 'stateDesc',
    MATERIAL_TYPE_ASC = 'materialTypeAsc',
    MATERIAL_TYPE_DESC = 'materialTypeDesc',
    MATERIAL_PACKING_ASC = 'materialPackingAsc',
    MATERIAL_PACKING_DESC = 'materialPackingDesc',
    AVAILABLE_LISTINGS_ASC = 'availableListingsAsc',
    AVAILABLE_LISTINGS_DESC = 'availableListingsDesc',
    CREATED_AT_ASC = 'createdAtAsc',
    CREATED_AT_DESC = 'createdAtDesc',
}
