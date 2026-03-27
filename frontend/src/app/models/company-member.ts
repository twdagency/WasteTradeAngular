import { CompanyUserRequestRoleEnum } from 'app/types/requests/company-user-request';

export type UserRole = 'haulier' | 'trader';

export enum CompanyMemberRole {
  'company_admin' = 'company_admin',
  'haulier' = 'haulier',
  'dual' = 'dual',
  'buyer' = 'buyer',
  'seller' = 'seller',
}

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
export type GetCompanyMemberResponse = {
  results: CompanyMember[];
  totalCount: number;
};
