export enum UserRoleEnum {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    SALES_ADMIN = 'sales_admin',
    USER = 'user',
}

export enum UserStatus {
    ARCHIVED = 'archived', // Only status for admin user
    ACTIVE = 'active',
    PENDING = 'pending',
    REQUEST_INFORMATION = 'request_information',
    REJECTED = 'rejected',
}

export enum WhereDidYouHearAboutUs {
    GOOGLE_SEARCH = 'google_search',
    PRSE_TRADE_SHOW = 'prse_trade_show',
    PLASTICS_LIVE_TRADE_SHOW = 'plastics_live_trade_show',
    SUSTAINABILITY_SHOW = 'sustainability_show',
    K_SHOW = 'k_show',
    INTERPACK = 'interpack',
    PLAST_2023 = 'plast_2023',
    WORD_OF_MOUTH = 'word_of_mouth',
}

export enum UserPrefix {
    DR = 'dr',
    MR = 'mr',
    MRS = 'mrs',
    MISS = 'miss',
    MS = 'ms',
    MX = 'mx',
    PROF = 'prof',
    REV = 'rev',
}

export enum UserTabFilter {
    ALL = 'all',
    UNVERIFIED = 'unverified',
    VERIFIED = 'verified',
    REJECTED = 'rejected',
    INACTIVE = 'inactive',
}

export enum UserAccountType {
    BUYER = 'buyer',
    SELLER = 'seller',
    DUAL = 'dual',
    HAULIER = 'haulier',
    TRADING_COMPANY_ADMIN = 'trading_company_admin',
    HAULAGE_COMPANY_ADMIN = 'haulage_company_admin',
}

export enum UserOverallStatus {
    COMPLETE = 'complete',
    AWAITING_APPROVAL = 'awaiting approval',
    IN_PROGRESS = 'in progress',
}

export enum UserRegistrationStatus {
    COMPLETE = 'complete',
    IN_PROGRESS = 'in progress',
}
