import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AuthService, NOT_INITIAL_USER } from 'app/services/auth.service';
import { Role } from 'app/types/auth';
import { CompanyUserRequestRoleEnum } from 'app/types/requests/company-user-request';
import { filter, first, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompanyRoleGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const requireCompanyRole = route.data['requireCompanyRole'] as CompanyUserRequestRoleEnum[] | undefined;

    // Wait for auth guard to complete and user to be loaded
    return this.authService.user$.pipe(
      filter((user) => user !== NOT_INITIAL_USER), // Wait for auth to complete
      first(), // Take the first valid user state
      map((user) => {
        // If no company role requirement is specified, allow access
        if (!requireCompanyRole || requireCompanyRole.length === 0) {
          return true;
        }

        // If user is not loaded or null, deny access
        if (!user) {
          return false;
        }

        // Check if user is a regular USER without company role - redirect to buy page
        if (user.user?.globalRole === Role.USER && !user.companyRole) {
          // Extract language from current URL for proper redirection
          const urlSegments = state.url.split('/');
          const lang = urlSegments.includes('es') ? 'es' : 'en';

          this.router.navigateByUrl(ROUTES_WITH_SLASH.buy);
          return false;
        }

        // Check if user has required company role
        if (user.companyRole && requireCompanyRole.includes(user.companyRole)) {
          return true;
        }

        this.router.navigateByUrl(ROUTES_WITH_SLASH.buy);
        return false;
      }),
    );
  }
}
