import { CompanyUserListItem } from 'app/types/requests/company-user-request';

export type MemberRowItem = {
  id: number;
  prefix: string;
  firstName: string;
  lastName: string;
  status: string;
  jobTitle: string;
  email: string;
  formatRole: string;
  originalItem: CompanyUserListItem;
};
