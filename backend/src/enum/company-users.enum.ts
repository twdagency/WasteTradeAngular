export enum CompanyUserRoleEnum {
    // General
    ADMIN = 'admin',
    // Trading
    SELLER = 'seller',
    BUYER = 'buyer',
    BOTH = 'both', // both seller and buyer
    // Haulage
    HAULIER = 'haulier',
}

export enum CompanyUserStatusEnum {
    ACTIVE = 'active',
    PENDING = 'pending',
    REJECTED = 'rejected',
    REQUEST_INFORMATION = 'request_information',
}
