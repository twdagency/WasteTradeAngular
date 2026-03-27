import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, REQUEST } from '@angular/core';

export const ACCESS_TOKEN_KEY = 'accessToken';
export const FORGOT_PASSWORD_TIME_KEY = 'forgot-password-time';
export const REGISTRATION_DRAFT_KEY = 'registration_draft';
export const REGISTRATION_DRAFT_TIMESTAMP_KEY = 'registration_draft_timestamp';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private platformId = inject(PLATFORM_ID);
  private serverRequest = inject(REQUEST, { optional: true });

  getItem(key: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return undefined;
    }

    return localStorage.getItem(key);
  }

  setItem(key: string, value: any) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(key, value);
  }

  removeItem(key: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(key);
  }

  getAccessToken() {
    if (isPlatformBrowser(this.platformId)) {
      return this.getItem(ACCESS_TOKEN_KEY);
    }

    const header = this.serverRequest?.headers as any;
    const cookie = header ? (header.get('cookie') ?? '') : '';
    const cookies = Object.fromEntries(cookie.split('; ').map((c: string) => c.split('=')));
    const accessToken = cookies[ACCESS_TOKEN_KEY];

    return accessToken;
  }

  deleteAccessToken() {
    this.removeItem(ACCESS_TOKEN_KEY);

    // delete cookie accesstoken
    if (isPlatformBrowser(this.platformId)) {
      document.cookie = `${ACCESS_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  }
}
