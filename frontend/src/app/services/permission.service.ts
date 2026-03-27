import { inject, Injectable } from '@angular/core';
import { CompanyUserRequestRoleEnum } from 'app/types/requests/company-user-request';
import { filter, map, Observable } from 'rxjs';
import { AuthService, NOT_INITIAL_USER } from './auth.service';

export type Permission = {
  setting: {
    cantEditCompanyInfo?: boolean;
    cantEditMaterialPreferences?: boolean;
    cantEditCompanyDocument?: boolean;
    cantEditCompanyNotification?: boolean;
    cantEditHaulierCompanyInfor?: boolean;
  };
  cantUseBuyerManagePermission?: boolean;
  cantUseSellerManagePermission?: boolean;
  cantBidding?: boolean;
  cantOfferManagement?: boolean;
};

const BuyerPermission: Permission = {
  setting: {
    cantEditCompanyInfo: true,
    cantEditMaterialPreferences: true,
    cantEditCompanyNotification: true,
    cantEditCompanyDocument: true,
  },
  cantUseSellerManagePermission: true,
  cantOfferManagement: true,
};

const BothPermission: Permission = {
  setting: {
    cantEditCompanyInfo: true,
    cantEditMaterialPreferences: true,
    cantEditCompanyNotification: true,
    cantEditCompanyDocument: true,
  },
};

const SellerPermission: Permission = {
  setting: {
    cantEditCompanyInfo: true,
    cantEditMaterialPreferences: true,
    cantEditCompanyNotification: true,
    cantEditCompanyDocument: true,
  },
  cantUseBuyerManagePermission: true,
  cantBidding: true,
};

const HaulierPermission: Permission = {
  setting: {
    cantEditHaulierCompanyInfor: true,
  },
};

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly authSevice = inject(AuthService);

  permission: Observable<Permission | {}> = this.authSevice.user$.pipe(
    filter((user) => user !== NOT_INITIAL_USER),
    map((user) => {
      const companyRole = user?.companyRole;

      switch (companyRole) {
        case CompanyUserRequestRoleEnum.ADMIN:
          return {};
        case CompanyUserRequestRoleEnum.BOTH: {
          return BothPermission;
        }
        case CompanyUserRequestRoleEnum.BUYER: {
          return BuyerPermission;
        }
        case CompanyUserRequestRoleEnum.SELLER: {
          return SellerPermission;
        }
        case CompanyUserRequestRoleEnum.HAULIER: {
          return HaulierPermission;
        }
        default: {
          return {};
        }
      }
    }),
  );
}
