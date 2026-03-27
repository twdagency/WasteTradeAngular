import { UserProfile } from '@loopback/security';
import { CompanyUserRoleEnum, UserRoleEnum } from '../enum';

export interface MyUserProfile extends UserProfile {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    name: string;
    companyName: string;
    globalRole: UserRoleEnum;
    companyRole: CompanyUserRoleEnum;
    isHaulier: boolean;
    isBuyer: boolean;
    isSeller: boolean;
    companyId: number;
    createdAt: Date;
}
