export enum UserTabFilter {
  UNVERIFIED = 'unverified',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
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
  AWAITING_APPROVAL = 'awaiting_approval',
  IN_PROGRESS = 'in progress',
}

export enum UserRegistrationStatus {
  COMPLETE = 'complete',
  IN_PROGRESS = 'in progress',
}

export enum OnboardingStatus {
  COMPANY_INFORMATION_COMPLETE = 'company_information_complete',
  COMPANY_INFORMATION_IN_PROGRESS = 'company_information_in_progress',
  COMPANY_DOCUMENTS_ADDED = 'company_documents_added',
  COMPANY_DOCUMENTS_IN_PROGRESS = 'company_documents_in_progress',
  SITE_LOCATION_ADDED = 'site_location_added',
  SITE_LOCATION_IN_PROGRESS = 'site_location_in_progress',
}
