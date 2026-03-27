export enum OnboardingStatus {
  COMPANY_INFORMATION_COMPLETE = 'company_information_complete',
  COMPANY_INFORMATION_IN_PROGRESS = 'company_information_in_progress',
  COMPANY_DOCUMENTS_ADDED = 'company_documents_added',
  COMPANY_DOCUMENTS_IN_PROGRESS = 'company_documents_in_progress',
  SITE_LOCATION_ADDED = 'site_location_added',
  SITE_LOCATION_IN_PROGRESS = 'site_location_in_progress',
}

export enum RegistrationStatus {
  IN_PROGRESS = 'in progress',
  COMPLETE = 'complete',
}

export enum OverallStatus {
  IN_PROGRESS = 'in progress',
  COMPLETE = 'complete',
  AWAITING_APPROVAL = 'awaiting approval',
}

export type ListingMemberItem = {
  user: {
    userId: number;
    companyId: number;
    name: string;
    companyType: string;
    companyName: string;
    companyCountry: string;
    registrationDate: string;
  };
  documents: CommercialDocument[]; // Updated type
  locations: Location[]; // Updated type
  onboardingStatus: OnboardingStatus;
  registrationStatus: RegistrationStatus;
  overallStatus: OverallStatus;
};

export type MemberDetail = {
  createdAt: string;
  updatedAt: string;
  id: number;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  prefix: string;
  jobTitle: string;
  phoneNumber: string;
  mobileNumber: string;
  isVerified: boolean;
  verificationToken: string | null;
  resetPasswordToken: string | null;
  resetTokenExpiresAt: string | null;
  globalRole: 'user' | 'admin' | string;
  status: 'rejected' | 'pending' | 'approved' | string;
  notificationEmailEnabled: boolean;
  notificationPushEnabled: boolean;
  notificationInAppEnabled: boolean;
  whereDidYouHearAboutUs: string | null;
  username: string | null;
  receiveEmailForOffersOnMyListings: boolean;
  receiveEmailForNewMatchingListings: boolean;
  companyId: number;
  company: Company;
};

type Company = {
  id: number;
  countryCode: string | null;
  name: string;
  registrationNumber: string | null;
  vatNumber: string | null;
  vatRegistrationCountry: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  country: string;
  stateProvince: string;
  postalCode: string;
  website: string;
  phoneNumber: string;
  mobileNumber: string;
  companyType: string;
  isHaulier: boolean;
  fleetType: string | null;
  areasCovered: string | null;
  containerTypes: string | null;
  status: string;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  favoriteMaterials: string[] | null;
  companyInterest: string;
  boxClearingAgent: boolean;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  xUrl: string;
  description: string;
  locations: Location[];
  documents: CommercialDocument[];
};

export enum CompanyDocumentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUEST_INFORMATION = 'request_information',
}

export type CommercialDocument = {
  id: number;
  uploadedByUserId: number;
  reviewedByUserId: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
  status: CompanyDocumentStatus;
  rejectionReason: string;
  reviewedAt: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  companyId: number;
};

export type Location = {
  id: number;
  locationName: string;
  firstName: string;
  mainLocation?: boolean;
  lastName: string;
  positionInCompany: string;
  phoneNumber: string;
  postcode: string;
  city: string;
  country: string;
  stateProvince: string;
  officeOpenTime: string;
  officeCloseTime: string;
  loadingRamp: boolean;
  weighbridge: boolean | null;
  containerType: string[];
  selfLoadUnLoadCapability: boolean;
  accessRestrictions: string | null;
  createdAt: string;
  updatedAt: string;
  companyId: number;
  prefix: string;
  addressLine: string;
  street: string;
  acceptedMaterials: string | null;
  siteSpecificInstructions: string | null;
  sitePointContact: string | null;
  locationDocuments: Document[];
};

type Document = {
  id: number;
  uploadedByUserId: number;
  reviewedByUserId: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
  status: string;
  rejectionReason: string;
  reviewedAt: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
};

export interface CompanySearchResult {
  id: number;
  name: string;
  vatNumber: string | null;
  country: string | null;
  status: string;
  companyInterest: string;
  isHaulier: boolean;
  isBuyer: boolean;
  isSeller: boolean;
}

export interface CompanySearchParams {
  skip: number;
  limit: number;
  where: {
    isHaulier: boolean;
    searchTerm: string;
  };
}

export interface CompanySearchResponse {
  totalCount: number;
  results: CompanySearchResult[];
}

export interface MergeCompaniesRequest {
  masterCompanyId: number;
  mergedCompanyId: number;
}

export interface MergeCompaniesResponse {
  status: string;
  message: string;
  data: {
    masterCompanyId: number;
    mergedCompanyId: number;
    movedCounts: {
      members: number;
      locations: number;
      documents: number;
      listings: number;
      offers: number;
      haulageOffers: number;
      sampleRequests: number;
      mfiRequests: number;
    };
  };
}

export type GetUserCountTabs = {
  status: string;
  message: string;
  data: {
    all: number;
    unverified: number;
    verified: number;
    rejected: number;
    inactive: number;
    blocked: number;
  };
};
