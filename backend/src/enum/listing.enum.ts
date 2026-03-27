export enum ListingImageType {
    FEATURE_IMAGE = 'feature_image',
    GALLERY_IMAGE = 'gallery_image',
    MATERIAL_SPECIFICATION_DATA = 'material_specification_data',
}

export enum ListingType {
    SELL = 'sell',
    WANTED = 'wanted',
}

export enum ListingUnit {
    KG = 'kg',
    LBS = 'lbs',
    MT = 'mt',
}

export enum ECurrency {
    GBP = 'gbp',
    USD = 'usd',
    EUR = 'eur',
}

export enum RenewalPeriod {
    WEEKLY = 'weekly',
    FORTNIGHTLY = 'fortnightly',
    MONTHLY = 'monthly',
}

export enum WasteStoration {
    INDOOR = 'indoor',
    OUTDOOR = 'outdoor',
    BOTH = 'both',
    ANY = 'any',
}

export enum ListingStatus {
    AVAILABLE = 'available',
    PENDING = 'pending',
    SOLD = 'sold',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
}

export enum ListingState {
    APPROVED = 'approved',
    PENDING = 'pending',
    REJECTED = 'rejected',
}

export enum MaterialFlowIndex {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

export enum ListingRequestActionEnum {
    ACCEPT = 'accept',
    REJECT = 'reject',
    REQUEST_INFORMATION = 'request_information',
}

export enum ListingSortBy {
    CREATED_AT_ASC = 'createdAtAsc',
    CREATED_AT_DESC = 'createdAtDesc',
    COMPANY_NAME_ASC = 'companyNameAsc',
    COMPANY_NAME_DESC = 'companyNameDesc',
    MATERIAL_PACKING_ASC = 'materialPackingAsc',
    MATERIAL_PACKING_DESC = 'materialPackingDesc',
    MATERIAL_ITEM_ASC = 'materialItemAsc',
    MATERIAL_ITEM_DESC = 'materialItemDesc',
    MATERIAL_TYPE_ASC = 'materialTypeAsc',
    MATERIAL_TYPE_DESC = 'materialTypeDesc',
    COUNTRY_ASC = 'countryAsc',
    COUNTRY_DESC = 'countryDesc',
    STATUS_ASC = 'statusAsc',
    STATUS_DESC = 'statusDesc',
    STATE_ASC = 'stateAsc',
    STATE_DESC = 'stateDesc',
    AVAILABLE_LISTINGS_ASC = 'availableListingsAsc',
    AVAILABLE_LISTINGS_DESC = 'availableListingsDesc',
}
