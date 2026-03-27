export interface AuditTrailDetail {
  createdAt: string;
  updatedAt: string;
  id: number;
  type: string;
  action: string;
  method: string;
  ipAddress: string;
  userAgent: string;
  requestBody: any;
  responseStatus: number;
  loggedUserName: string;
  loggedUserRole: string;
  loggedCompanyName: string;
  siteType: string;
  userId: number;
  companyId: number;
}

export enum AuditTrailUserRoleEnum {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  HAULIER = 'Haulier',
  TRADER = 'Trader',
  SELLER = 'Seller',
  BUYER = 'Buyer',
}

export enum AuditTrailSiteTypeEnum {
  HAULIER = 'Haulier',
  TRADER = 'Trader',
  WASTE_TRADE = 'WasteTrade',
}

export interface AuditTrailResponse {
  results: AuditTrailDetail[];
  totalCount: number;
}

export interface AuditTrailFilterParams {
  skip: number;
  limit: number;
  where: {
    startDate?: string;
    endDate?: string;
    loggedUserName?: string;
    loggedCompanyName?: string;
    loggedUserRole?: AuditTrailUserRoleEnum;
  };
}
