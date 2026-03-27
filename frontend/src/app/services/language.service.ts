import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, makeStateKey, PLATFORM_ID, REQUEST, TransferState } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DEFAULT_LANGUAGE } from 'app/constants/common';

// Export the key to ensure consistency between server and client
export const LANGUAGE_KEY = makeStateKey<string>('language');

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private translateService = inject(TranslateService);
  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request = inject(REQUEST, { optional: true });
  private readonly router = inject(Router);

  // Static reference to the instance for utility functions
  private static instance: LanguageService;

  constructor() {
    const languageCode = this.getCurrentLanguage();
    this.updateTranslateLanguageIfNeeded(languageCode);

    // Set the static reference
    LanguageService.instance = this;
  }

  updateTranslateLanguageIfNeeded(language: string) {
    if (this.translateService.currentLang !== language) {
      this.translateService.use(language);
    }
  }

  // Static getter for accessing the instance from utility functions
  static getInstance(): LanguageService | null {
    return LanguageService.instance || null;
  }

  private getCurrentLanguageFromUrl(): string {
    // On server side, extract from REQUEST and set in TransferState
    if (!isPlatformBrowser(this.platformId)) {
      const language = this.extractLanguageFromRequest();
      this.transferState.set(LANGUAGE_KEY, language);
      return language;
    }

    // On browser side, extract language from Angular Router URL
    return this.extractLanguageFromRouterUrl();
  }

  private extractLanguageFromRequest(): string {
    if (!this.request?.url) {
      return DEFAULT_LANGUAGE;
    }

    const pathName = new URL(this.request.url).pathname;
    const urlSegments = pathName.split('/').filter((segment: string) => segment);
    const langFromUrl = urlSegments[0];

    // If URL starts with /es, it's Spanish
    if (langFromUrl === 'es') {
      return 'es';
    }

    // Otherwise, it's English (default language)
    return DEFAULT_LANGUAGE;
  }

  private extractLanguageFromRouterUrl(): string {
    try {
      const currentUrl = this.router.url;
      const urlSegments = currentUrl.split('/').filter((segment: string) => segment);
      const langFromUrl = urlSegments[0];

      // If URL starts with /es, it's Spanish
      if (langFromUrl === 'es') {
        return 'es';
      }

      // Otherwise, it's English (default language)
      return DEFAULT_LANGUAGE;
    } catch (error) {
      console.warn('Error extracting language from router URL:', error);
      return DEFAULT_LANGUAGE;
    }
  }

  getCurrentLanguage(): string {
    const urlLang = this.getCurrentLanguageFromUrl();
    this.updateTranslateLanguageIfNeeded(urlLang);
    return urlLang || DEFAULT_LANGUAGE;
  }
}
