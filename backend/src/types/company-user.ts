import { CompanyInterest, CompanyUserRoleEnum, CompanyUserStatusEnum } from '../enum';

export interface ICompanyUser {
    companyId: number;
    userId: number;
    companyRole: CompanyUserRoleEnum;
    isPrimaryContact: boolean;
    status: CompanyUserStatusEnum;
    createdAt: string;
    updatedAt: string;
}

export interface CompanyUserListItem {
    id: number; // User Id
    prefix?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    email?: string;
    status?: 'active' | 'pending';
    companyRole: CompanyUserRoleEnum;
    companyData?: {
        id: number;
        name: string;
        country: string;
        isHaulier: boolean;
        isBuyer: boolean;
        isSeller: boolean;
        companyInterest: CompanyInterest;
    };
}
