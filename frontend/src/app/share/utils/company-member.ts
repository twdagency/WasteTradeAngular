import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { CompanyUserRequestRoleEnum } from 'app/types/requests/company-user-request';

export const formatRole = (companyRole: CompanyUserRequestRoleEnum) => {
  switch (companyRole) {
    case CompanyUserRequestRoleEnum.BOTH:
      return localized$('Dual');
    case CompanyUserRequestRoleEnum.ADMIN:
      return localized$('Company Admin');
    case CompanyUserRequestRoleEnum.SELLER:
      return localized$('Seller');
    case CompanyUserRequestRoleEnum.HAULIER:
      return localized$('Haulier');
    case CompanyUserRequestRoleEnum.BUYER:
      return localized$('Buyer');
    default:
      return companyRole;
  }
};
