import { Role } from 'app/types/auth';
import { CompanyUserRequestRoleEnum } from 'app/types/requests/company-user-request';
import { IDocument } from './listing-material-detail.model';

export enum CompanyStatus {
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export type Company = {
  id: number;
  countryCode: string | null;
  name: string;
  registrationNumber: string | null;
  vatNumber: string;
  vatRegistrationCountry: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  country: string;
  stateProvince: string;
  postalCode: string;
  website: string | null;
  phoneNumber: string;
  mobileNumber: string;
  companyType?: string;
  favoriteMaterials: string[];
  otherMaterial: string | null;
  materialInterest: string | null;
  companyInterest: string;
  description: string;
  email: string;
  boxClearingAgent: boolean;
  isHaulier: boolean;
  fleetType: string | null;
  areasCovered: string | null;
  containerTypes: string[] | null;
  status: CompanyStatus;
  verifiedAt: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  xUrl: string | null;
  additionalSocialMediaUrls: AdditionalUrl[];
  createdAt: string;
  updatedAt: string;
  companyDocuments: IDocument[];
};

export interface AdditionalUrl {
  name: string;
  url: string;
}

export type UserInfor = {
  id: number;
  username: number;
  email: string;
  firstName: string;
  lastName: string;
  prefix: string;
  jobTitle: string;
  phoneNumber: string;
  mobileNumber: string;
  isVerified: boolean;
  verificationToken: string | null;
  resetTokenExpiresAt: string | null;
  globalRole: Role;
  status: 'active' | 'inactive';
  notificationEmailEnabled: boolean;
  notificationPushEnabled: boolean;
  notificationInAppEnabled: boolean;
  receiveEmailForOffersOnMyListings: boolean | null;
  receiveEmailForNewMatchingListings: boolean | null;
  favoriteMaterials: string | null;
  companyInterest: string | null;
  whereDidYouHearAboutUs: string;
  createdAt: string;
  updatedAt: string;
};

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  REQUEST_INFORMATION = 'request_information',
  REJECTED = 'rejected',
}

export type User = {
  id: number;
  companyRole: CompanyUserRequestRoleEnum;
  isPrimaryContact: boolean;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  companyId: number;
  userId: number;
  company: Company;
  user: UserInfor;
};

export type CompanyDocument = IDocument;
