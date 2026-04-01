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
  PENDING = 'pending',
  REJECTED = 'rejected',
  REQUEST_INFORMATION = 'request_information',
}

export enum CompanyUserRequestTypeEnum {
  REQUEST = 'request',
  INVITE = 'invite',
}

export type InviteUserRequest = {
  email: string;
  firstName: string;
  lastName: string;
  role: CompanyUserRequestRoleEnum;
};

export type ReInviteUserRequest = {
  userId: string;
};

export type InviteUserResponse = {
  status: 'success';
  message: string;
  data: {
    invitation: CompanyUserInvitation;
  };
};

export type CompanyUserInvitation = {
  id: number;
  userId: number;
  email: string;
  role: CompanyUserRequestRoleEnum;
  status: CompanyUserRequestStatusEnum;
  expiresAt: string;
};

// VAT Validation (VATSense) Types
export interface VatValidationResponse {
  success: boolean;
  code: number;
  data?: {
    valid: boolean;
    company?: {
      vat_number: string;
      country_code: string;
      company_name: string;
      company_address: string;
    };
  };
}

// VAT Number Lookup Types
export type VatLookupParams = {
  vatNumber: string;
  type: 'trading' | 'haulage';
};

export type VatLookupResponse = {
  id: number;
  countryCode: string | null;
  name: string;
  registrationNumber: string | null;
  email: string;
  vatNumber: string;
  vatRegistrationCountry: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  country: string;
  stateProvince: string;
  postalCode: string;
  website: string;
  phoneNumber: string;
  mobileNumber: string | null;
  companyType: string;
  favoriteMaterials: any[];
  otherMaterial: string | null;
  companyInterest: string;
  isHaulier: boolean;
  boxClearingAgent: boolean;
  fleetType: string | null;
  areasCovered: string | null;
  containerTypes: string | null;
  status: string;
  verifiedAt: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  xUrl: string | null;
  additionalSocialMediaUrls: string | null;
  description: string;
  isSeller: boolean;
  isBuyer: boolean;
  rejectionReason: string | null;
  infoRequestType: string | null;
  adminMessage: string | null;
  createdAt: string;
  updatedAt: string;
  isSyncedSalesForce: boolean;
  lastSyncedSalesForceDate: string;
  salesforceId: string;
};

// Request to Join Company Types
export type RequestToJoinCompanyRequest = {
  email: string;
  firstName: string;
  lastName: string;
  note: string;
  companyId: number;
};

export type RequestToJoinCompanyResponse = {
  status: 'success';
  message: string;
  data: {
    id: number;
    userId: number;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
  };
};

// Incoming Requests Types
export type GetIncomingRequestsParams = {
  page?: number;
  limit?: number;
};

export type IncomingRequestItem = {
  id: number;
  userId: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  note: string;
};

export type GetIncomingRequestsResponse = {
  results: IncomingRequestItem[];
  totalCount: number;
};

// Approve Request Types
export type ApproveRequestParams = {
  id: number;
};

export type ApproveRequestResponse = {
  status: 'success';
  message: string;
  data: {
    id: number;
    status: string;
    updatedAt: string;
  };
};

// Reject Request Types
export type RejectRequestParams = {
  id: number;
};

export type RejectRequestResponse = {
  status: 'success';
  message: string;
  data: {
    id: number;
    status: string;
    updatedAt: string;
  };
};

// Company Users List Types
export type GetCompanyUsersParams = {
  filter?: {
    skip?: number;
    limit?: number;
    where?: {
      role?: CompanyUserRequestRoleEnum | '';
      status?: 'active' | 'pending' | '';
      companyId?: number;
    };
  };
  searchTerm?: string;
};

export type CompanyUserListItem = {
  id: number;
  prefix: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  userStatus: string;
  status: 'active' | 'pending';
  companyRole: CompanyUserRequestRoleEnum;
  companyData: {
    id: number;
    name: string;
    country: string;
    isHaulier: boolean;
    isBuyer: boolean;
    isSeller: boolean;
    companyInterest: string;
    containerTypes: any;
  };
};

export type GetCompanyUsersResponse = {
  totalCount: number;
  results: CompanyUserListItem[];
};

// Error Response Types
export type ApiErrorResponse = {
  error: {
    statusCode: number;
    message: string;
  };
};

// Assign Role Types
export type AssignRoleRequest = {
  userId: number;
  role: CompanyUserRequestRoleEnum;
};

export type AssignRoleResponse = {
  status: 'success';
  message: string;
};

// Search Users for Reassignment Types
export type SearchUsersForReassignmentParams = {
  search?: string;
  skip?: number;
  limit?: number;
  companyId?: number;
};

export type SearchUsersForReassignmentItem = {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  companyRole: CompanyUserRequestRoleEnum;
};

export type SearchUsersForReassignmentResponse = {
  totalCount: number;
  results: SearchUsersForReassignmentItem[];
};

export type RemoveMemberParams = {
  oldUserId: number;
  newUserId: number;
  companyId?: number;
};

export type RemoveMemberResponse = {
  success: true;
  message: string;
};

export type RemovePendingMemberRequest = {
  userId: number;
  companyId: number;
};

export type RemovePendingMemberResponse = {
  success: boolean;
  message: string;
};
