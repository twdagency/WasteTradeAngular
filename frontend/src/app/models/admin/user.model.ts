import { AssignAdmin } from 'app/share/ui/admin/commercial/admin-member/assign-type/asign-type';
import { AdminNote } from 'app/share/ui/notes/types/notes';
import { CompanyUserRequestRoleEnum } from 'app/types/requests/company-user-request';
import { OverallStatus, RegistrationStatus } from './commercial.model';

export enum UserTabFilter {
  UNVERIFIED = 'unverified',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  INACTIVE = 'inactive', // Future scope
  BLOCKED = 'blocked', // Future scope
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

export type UserRole = 'haulier' | 'trader';

export type CompanyRequest = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  notes: string;
  role: UserRole;
};

export type GetCompanyRequestsResponse = {
  results: CompanyRequest[];
  totalCount: number;
};

export type CompanyMember = {
  prefix: string;
  firstName: string;
  lastName: string;
  status: string;
  jobTitle: string;
  email: string;
  role: string;
};
export type GetCompanyMemberResponse = {
  results: CompanyMember[];
  totalCount: number;
};

export type User = {
  accountType: string;
  assigneeName: string;
  userId: number;
  userName: string;
  companyName: string;
  country: string;
  registeredAt: string;
  overallStatus: OverallStatus;
  registrationStatus: RegistrationStatus;
  onboardingStatus: OnboardingStatus;
  adminNote?: AdminNote | null;
  assignAdmin: AssignAdmin | null;
};

export type GetUserMemberResponse = {
  result: UserMember[];
  totalCount: number;
};

export type UserMember = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  status: string;
  adminNote?: AdminNote | null;
  assignAdmin: AssignAdmin | null;
  overallStatus: string;
  registrationStatus: string;
  onboardingStatus: string;
  companyRole: CompanyUserRequestRoleEnum | null;
  companyData?: {
    id: number;
    name: string;
    country: string;
    isHaulier: boolean;
    isBuyer: boolean;
    isSeller: boolean;
  };
};
