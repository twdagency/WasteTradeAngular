import { CompanyUserListItem } from 'app/types/requests/company-user-request';

export type RemoveMemberData = {
  isHaulierCompany: boolean;
  item: CompanyUserListItem;
  companyId?: number;
};
