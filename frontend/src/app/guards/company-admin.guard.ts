import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AuthService, NOT_INITIAL_USER } from 'app/services/auth.service';
import { CompanyUserRequestRoleEnum } from 'app/types/requests/company-user-request';
import { filter, first, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompanyAdminGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): Observable<boolean> {
    return this.authService.user$.pipe(
      filter((user) => user !== NOT_INITIAL_USER),
      first(),
      map((user) => {
        if (!user) {
          return false;
        }

        if (user.companyRole === CompanyUserRequestRoleEnum.ADMIN) {
          return true;
        }

        if (user.companyRole === CompanyUserRequestRoleEnum.HAULIER) {
          this.router.navigateByUrl(ROUTES_WITH_SLASH.availableLoads);
        } else {
          this.router.navigateByUrl(ROUTES_WITH_SLASH.buy);
        }
        return false;
      }),
    );
  }
}
