export enum AssignAdminDataType {
  USERS = 'users',
  LISTINGS = 'listings',
  OFFERS = 'offers',
  HAULAGE_OFFERS = 'haulage_offers',
  SAMPLES = 'samples',
  MFI = 'mfi',
}
export type AssignedAdminDetail = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  globalRole: string;
};

export type AssignAdmin = {
  assignedAdminId: number | null;
  assignedBy: number;
  assignedAt: string;
  assignedAdmin: AssignedAdminDetail | null;
};
export type AdminUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  globalRole: 'admin' | 'super_admin' | 'sales_admin';
};

export type GetAssignableAdminsResponse = {
  totalCount: number;
  results: AdminUser[];
};
export type AssignModalData = {
  dataId: number;
  dataType: AssignAdminDataType;
  assignedAdminId: number | null;
};
