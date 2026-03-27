export enum HaulageOfferStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    WITHDRAWN = 'withdrawn',
    INFORMATION_REQUESTED = 'information_requested',
    OPEN_FOR_EDITS = 'open_for_edits',
    PARTIALLY_SHIPPED = 'partially_shipped',
    SHIPPED = 'shipped',
}

export enum TransportProvider {
    OWN_HAULAGE = 'own_haulage',
    THIRD_PARTY = 'third_party',
    MIXED = 'mixed',
}

export enum ExpectedTransitTime {
    ONE_TWO_DAYS = '1-2 Days',
    THREE_FOUR_DAYS = '3-4 Days',
    FOUR_SIX_DAYS = '4-6 Days',
    ONE_WEEK = '1 Week',
    TWO_WEEKS = '2 Weeks',
    THREE_WEEKS = '3 Weeks',
    ONE_MONTH = '1 Month',
}

export enum HaulageBidAction {
    APPROVE = 'approve',
    REJECT = 'reject',
    REQUEST_INFORMATION = 'request_information',
}

export enum HaulageBidRejectionReason {
    INCOMPLETE_DOCUMENTATION = 'incomplete_documentation',
    INVALID_COMPANY_REGISTRATION = 'invalid_company_registration',
    DUPLICATE_ACCOUNT = 'duplicate_account',
    UNVERIFIED_CONTACT_INFO = 'unverified_contact_info',
    OTHER = 'other',
}

// SF picklist values for trailer_type__c (1:1 mapping)
export enum TrailerType {
    CURTAIN_SIDER = 'Curtain Sider',
    CONTAINERS = 'Containers',
    TIPPER_TRUCKS = 'Tipper Trucks',
    WALKING_FLOOR = 'Walking Floor',
}
