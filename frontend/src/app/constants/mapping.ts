import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { Role } from 'app/types/auth';

export const MapRoleToName: any = {
  [Role.ADMIN]: localized$('Admin'),
  [Role.SALES_ADMIN]: localized$('Sales Admin'),
  [Role.SUPER_ADMIN]: localized$('Super Admin'),
};
