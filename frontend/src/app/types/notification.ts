export type NotiItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  linkText?: string;
  clickLink?: () => void;
};

export enum NotificationType {
  accountVerified = 'account_verified',
  accountRejected = 'account_rejected',
  profileUpdated = 'profile_updated',
  notificationEnabled = 'notifications_enabled',
  documentExpiry = 'document_expiry',
  newListing = 'listing_added',
  bidStatus = 'offer_status_updated',
  listingApproved = 'listing_approved',
  listingRejected = 'listing_rejected',
  listingMoreInfoRequired = 'listing_more_information_required',
  listingExpiryWarning = 'listing_expiry_warning',
  listingRenewed = 'listing_renewed',
  offerApproved = 'offer_approved',

  new_haulage_opportunity = 'new_haulage_opportunity',
  haulage_offer_request_information = 'haulage_offer_request_information',
  haulage_offer_approved = 'haulage_offer_approved',
  haulage_offer_rejected = 'haulage_offer_rejected',

  company_user_request_join = 'company_user_request_join',
  company_user_accepted_invite = 'company_user_accepted_invite',
  company_user_role_changed = 'company_user_role_changed',
  company_user_unlinked_from_company = 'company_user_unlinked_from_company',
}
