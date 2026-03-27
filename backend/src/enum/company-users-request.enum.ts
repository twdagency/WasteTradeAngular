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

export enum CompanyUserRequestStatusEnum {
    REQUESTED = 'requested',
    PENDING = 'pending',
}

export enum CompanyUserRequestTypeEnum {
    REQUEST = 'request',
    INVITE = 'invite',
}
