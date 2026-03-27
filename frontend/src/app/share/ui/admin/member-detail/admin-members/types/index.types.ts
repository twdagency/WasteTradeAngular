import { CompanyMember } from 'app/models/company-member';
import { CompanyUserRequestRoleEnum } from 'app/types/requests/company-user-request';

export type TableRowItem = {
  id: number;
  prefix: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'pending';
  jobTitle: string;
  email: string;
  role: string;
  originalRole: CompanyUserRequestRoleEnum;
  isHaulierCompany: boolean;
  originalData: CompanyMember;
};
