import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@app/environments';
import { FULL_PAGINATION_LIMIT } from 'app/constants/common';
import { ROUTES } from 'app/constants/route.const';
import { getDefaultRouteByRole } from 'app/guards/auth/utils';
import { User } from 'app/models/auth.model';
import { Role } from 'app/types/auth';
import { BehaviorSubject, catchError, filter, map, of, switchMap, tap } from 'rxjs';
import {
  RequestForgotPasswordParams,
  RequestLoginParams,
  RequestSetPasswordParams,
  ResponseAccountStatus,
  ResponseGetCompanyLocation,
  ResponseLogin,
  ResponseMe,
  ResquestGetCompanyLocationParams,
} from '../types/requests/auth';
import { addLanguagePrefix } from '../utils/language.utils';
import { ACCESS_TOKEN_KEY, LocalStorageService } from './local-storage.service';

export const NOT_INITIAL_USER = null;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _user$ = new BehaviorSubject<User | null | undefined>(NOT_INITIAL_USER);
  private _accountStatus$ = new BehaviorSubject<ResponseAccountStatus['data'] | null>(null);
  private platformId = inject(PLATFORM_ID);
  private localStorageService = inject(LocalStorageService);
  accessToken: string | undefined;

  get accountStatus() {
    return this._accountStatus$.asObservable();
  }

  get isNotFinishCheckAuth() {
    return this._user$.value === NOT_INITIAL_USER;
  }

  get user$() {
    return this._user$.asObservable();
  }

  get user() {
    return this._user$.value;
  }

  get isHaulierUser(): boolean {
    return this.user?.company?.isHaulier ?? false;
  }

  get isTradingUser(): boolean {
    return !this.isHaulierUser;
  }

  get isWaitingForCompanyAdmin() {
    return this.user?.user?.globalRole === Role.USER && !this.user?.companyRole;
  }

  get companyLocations$() {
    return this.user$.pipe(
      filter((user) => !!user),
      switchMap((user) =>
        this.getCompanyLocation({ companyId: user?.companyId, limit: FULL_PAGINATION_LIMIT, page: 1 }),
      ),
    );
  }

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login({ email, password }: RequestLoginParams) {
    return this.http
      .post<ResponseLogin>('/login', {
        email,
        password,
      })
      .pipe(
        map((res) => res.data.user),
        switchMap((loginData) => {
          if (!loginData) {
            throw new Error('Invalid login data');
          }

          // Only set token in localStorage if in browser
          if (isPlatformBrowser(this.platformId)) {
            document.cookie = `${ACCESS_TOKEN_KEY}=${loginData.accessToken}; path=/; SameSite=Lax${environment.production ? '; secure' : ''}`;
            this.setToken(loginData.accessToken);
          }

          // get the user data
          return this.getMe();
        }),
        tap((user) => {
          this._user$.next(user);
        }),
      );
  }

  forgotPassword(params: RequestForgotPasswordParams) {
    return this.http.post('/forgot-password', params);
  }

  setPassword(params: RequestSetPasswordParams) {
    return this.http.post('/reset-password', params);
  }

  setToken(token: string) {
    // store user data in local storage for the auth interceptor
    this.localStorageService.setItem(ACCESS_TOKEN_KEY, token);
  }

  setAuthData(authData: { id: number; email: string; accessToken: string; globalRole: string; isHaulier: boolean }) {
    // Set the access token for API calls
    if (isPlatformBrowser(this.platformId)) {
      document.cookie = `accessToken=${authData.accessToken}; path=/; SameSite=Lax${environment.production ? '; secure' : ''}`;
      this.setToken(authData.accessToken);
    }

    // Get the full user data using the token
    this.getMe()
      .pipe(
        tap((user) => {
          this._user$.next(user);
        }),
        catchError((error) => {
          console.error('Failed to get user data after setting auth:', error);
          this.logout();

          return of(undefined);
        }),
      )
      .subscribe();
  }

  updateAuthAfterRequestJoinCompany() {
    this.getMe()
      .pipe(
        tap((user) => {
          this._user$.next(user);
        }),
        catchError((error) => {
          console.error('Failed to get user data after setting auth:', error);
          this.logout();

          return of(undefined);
        }),
      )
      .subscribe();
  }

  checkToken() {
    const accessToken = this.localStorageService.getAccessToken();

    let source = of<User | undefined>(undefined);

    if (accessToken) {
      source = this.getMe().pipe(
        catchError(() => {
          return of(undefined);
        }),
      );
    }

    return source.pipe(
      tap((me) => {
        this._user$.next(me);
      }),
    );
  }

  getDefaultRouteByRole() {
    const user = this._user$.value;

    if (!user) {
      return ROUTES.login;
    }

    return getDefaultRouteByRole(user);
  }

  getMe() {
    return this.http.get<ResponseMe>('/users/me').pipe(
      map((res) => {
        const user = res.data?.companyUser;
        if (user.company) {
          user.company.companyDocuments = res.data.companyDocuments;
        }
        return user;
      }),
    );
  }

  getAccountStatus() {
    return this.http.get<ResponseAccountStatus>('/users/me/account-status').pipe(
      tap((res) => {
        this._accountStatus$.next(res.data);
      }),
    );
  }

  getCompanyLocation({ companyId, page, limit }: ResquestGetCompanyLocationParams) {
    const safeLimit = limit ?? 10;
    const skip = (page - 1) * safeLimit;

    const encodedFilter = JSON.stringify({
      skip,
      limit: safeLimit,
      where: {
        companyId,
      },
    });

    let params = new HttpParams({
      fromObject: {
        filter: encodedFilter,
      },
    });

    params.set('filter', encodedFilter);

    return this.http.get<ResponseGetCompanyLocation>('/company-locations', {
      params,
    });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      this.localStorageService.deleteAccessToken();
    }
    this._user$.next(undefined);
    this.router.navigateByUrl(addLanguagePrefix(ROUTES.login));
  }
}
