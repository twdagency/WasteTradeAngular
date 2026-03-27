import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { CompanyUserRequestRoleEnum } from 'app/types/requests/company-user-request';

type AccountTypeCompanyData = {
  isHaulier?: boolean;
  isBuyer?: boolean;
  isSeller?: boolean;
  companyType?: string | null;
} | null | undefined;

type ResolveAccountTypeLabelVariant = 'default' | 'titleCase';

export function resolveAccountType(
  companyRole: CompanyUserRequestRoleEnum | null | undefined,
  companyData: AccountTypeCompanyData,
  labelVariant: ResolveAccountTypeLabelVariant = 'default',
): string {
  if (!companyRole) return '-';

  const normalizedCompanyType = companyData?.companyType?.toLowerCase();
  const isTradingByType =
    normalizedCompanyType === CompanyUserRequestRoleEnum.BUYER ||
    normalizedCompanyType === CompanyUserRequestRoleEnum.SELLER ||
    normalizedCompanyType === CompanyUserRequestRoleEnum.BOTH;

  const isTradingCompany = Boolean(companyData?.isSeller || companyData?.isBuyer || isTradingByType);
  const isHaulierCompany = Boolean(
    companyData?.isHaulier || normalizedCompanyType === CompanyUserRequestRoleEnum.HAULIER,
  );
  const isAdminHaulier = companyRole === CompanyUserRequestRoleEnum.ADMIN && isHaulierCompany;
  const isAdminTrading = companyRole === CompanyUserRequestRoleEnum.ADMIN && isTradingCompany;

  if (companyRole === CompanyUserRequestRoleEnum.HAULIER) {
    return labelVariant === 'titleCase' ? localized$('Haulier') : localized$('haulier');
  }

  if (companyRole === CompanyUserRequestRoleEnum.BOTH) {
    return labelVariant === 'titleCase' ? localized$('Dual') : localized$('dual');
  }

  if (companyRole === CompanyUserRequestRoleEnum.BUYER) {
    return labelVariant === 'titleCase' ? localized$('Buyer') : localized$('buyer');
  }

  if (companyRole === CompanyUserRequestRoleEnum.SELLER) {
    return labelVariant === 'titleCase' ? localized$('Seller') : localized$('seller');
  }

  if (isAdminHaulier) {
    return localized$('Haulage Company Admin');
  }

  if (isAdminTrading) {
    return localized$('Trading Company Admin');
  }

  return '-';
}
