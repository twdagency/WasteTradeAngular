import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslatePipe } from '@ngx-translate/core';
import { ROUTES } from 'app/constants/route.const';
import moment from 'moment';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { addLanguagePrefix } from '../utils/language.utils';
import { AuthService } from './auth.service';
import { LocalStorageService, REGISTRATION_DRAFT_KEY, REGISTRATION_DRAFT_TIMESTAMP_KEY } from './local-storage.service';

export interface DraftSaveRequest {
  data: any;
  email?: string;
  isAuto: boolean;
}

export interface DraftSaveResponse {
  status: string;
  message: string;
  data: null;
}

export interface DraftResumeResponse {
  status: string;
  message: string;
  data: {
    dataDraft: any;
    userLoginData: {
      id: number;
      email: string;
      accessToken: string;
      globalRole: string;
      isHaulier: boolean;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class DraftRegisterService {
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslatePipe);
  private authService = inject(AuthService);
  private localStorageService = inject(LocalStorageService);
  private platFormId = inject(PLATFORM_ID);

  // Auto-save timer management
  private autoSaveTimer: any = null;
  private autoSaveInterval = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Keys for localStorage
  private readonly REGISTRATION_DRAFT_KEY = REGISTRATION_DRAFT_KEY;
  private readonly REGISTRATION_DRAFT_TIMESTAMP_KEY = REGISTRATION_DRAFT_TIMESTAMP_KEY;

  // Resume token for current session
  private resumeToken: string | null = null;

  /**
   * Save current form data as draft
   * @param formData Current form data to save
   * @param currentUrl Current registration URL
   * @param isAutoSave Whether this is an auto-save operation
   * @returns Observable of save response
   */
  saveDraft(
    formData: any,
    currentUrl?: string,
    isAutoSave: boolean = false,
    email?: string,
  ): Observable<DraftSaveResponse> {
    const payload: DraftSaveRequest = {
      data: {
        ...formData,
        ...(currentUrl && { currentUrl }),
      },
      email,
      isAuto: isAutoSave,
    };

    return this.httpClient.post<DraftSaveResponse>('/data-drafts', payload).pipe(
      tap(() => {
        if (!isAutoSave) {
          // Only show success message and redirect for manual saves
          this.showSuccessToast();
          this.redirectAfterSave();
        }
      }),
      catchError((error) => {
        if (!isAutoSave) {
          // Only show error messages for manual saves
          this.handleSaveError();
        } else {
          // For auto-save, just log the error silently
          console.warn('Auto-save failed:', error);
        }
        return throwError(() => error);
      }),
    );
  }

  /**
   * Resume registration from token
   * @param token Resume token from email
   * @returns Observable of resume response
   */
  resumeDraft(token: string): Observable<DraftResumeResponse> {
    return this.httpClient.get<DraftResumeResponse>(`/data-drafts/latest?token=${token}`).pipe(
      catchError((error) => {
        this.handleResumeError(error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Resume registration flow - handles authentication, data retrieval, and navigation
   * @param token Resume token from URL
   * @returns Observable of draft data for the component
   */
  resumeRegistrationFlow(token: string) {
    // Store the resume token for the session
    this.setResumeToken(token);

    return this.resumeDraft(token).pipe(
      tap((response) => {
        if (response?.data) {
          const { dataDraft, userLoginData } = response.data;

          // Log the user in with the provided credentials
          if (userLoginData) {
            this.authService.setAuthData(userLoginData);
          }

          // Navigate to the correct registration step with token
          const resumeUrl = dataDraft.currentUrl || this.getDefaultRegistrationUrl();
          const urlWithoutQuery = resumeUrl.split('?')[0];

          this.router.navigate([urlWithoutQuery], {
            queryParams: { token },
            state: { draftData: dataDraft },
          });
        }
      }),
      catchError((error) => {
        this.handleResumeFlowError(error);
        return throwError(() => error);
      }),
    );
  }

  private showSuccessToast(): void {
    const message = this.translate.transform(localized$('Progress saved.'));
    this.snackBar.open(message);
  }

  private redirectAfterSave(): void {
    if (this.authService.user?.company.isHaulier) {
      this.router.navigate([addLanguagePrefix(ROUTES.availableLoads)], {
        replaceUrl: true,
      });
      return;
    }

    this.router.navigate([addLanguagePrefix('/buy')], {
      replaceUrl: true,
    });
  }

  private handleSaveError(): void {
    this.snackBar.open("We couldn't save your progress. Please try again.");
  }

  private handleResumeError(error: any): void {
    let errorMessage = error?.error?.error?.message;

    if (errorMessage === 'data-draft-token-invalid') {
      // Invalid token
      errorMessage = this.translate.transform(
        localized$('This link is invalid. Please restart the registration process.'),
      );
    } else if (errorMessage === 'data-draft-token-expired') {
      // Expired token
      errorMessage = this.translate.transform(
        localized$('This link has expired. Please restart the registration process.'),
      );
    } else {
      // Generic error
      errorMessage = this.translate.transform(
        localized$('Something went wrong. Please restart the registration process.'),
      );
    }

    this.snackBar.open(errorMessage);
  }

  private getDefaultRegistrationUrl(): string {
    // Return the first step of registration as default
    return '/create-account';
  }

  private handleResumeFlowError(error: any): void {
    let errorMessage = 'This link is invalid. Please restart the registration process.';

    if (error.status === 401 || error.status === 403) {
      errorMessage = 'This link is invalid. Please restart the registration process.';
    } else if (error.status === 410 || error.error?.message?.includes('expired')) {
      errorMessage = 'This link has expired. Please restart the registration process.';
    }

    this.snackBar.open(errorMessage);
    this.router.navigateByUrl(addLanguagePrefix('/buy')); // Redirect to marketplace
  }

  /**
   * Start tracking auto-save with a callback function
   * @param callback Function to call when auto-save timer triggers (should be saveAndResumeLater with isAutoSave = true)
   */
  trackingAutoSave(callback: () => void): void {
    if (!isPlatformBrowser(this.platFormId)) {
      return;
    }
    this.stopAutoSave(); // Stop any existing timer

    this.autoSaveTimer = setInterval(() => {
      callback();
    }, this.autoSaveInterval);
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Save draft data to localStorage (for registration page)
   * @param formData Form data to save
   */
  saveToLocalStorage(formData: any): void {
    try {
      this.localStorageService.setItem(this.REGISTRATION_DRAFT_KEY, JSON.stringify(formData));
      this.localStorageService.setItem(this.REGISTRATION_DRAFT_TIMESTAMP_KEY, moment().toISOString());
      console.log('Registration draft saved to localStorage');
    } catch (error) {
      console.warn('Failed to save registration draft to localStorage:', error);
    }
  }

  /**
   * Load draft data from localStorage
   * @returns Parsed draft data or null
   */
  loadFromLocalStorage(): any {
    try {
      const draftData = this.localStorageService.getItem(this.REGISTRATION_DRAFT_KEY);
      const timestamp = this.localStorageService.getItem(this.REGISTRATION_DRAFT_TIMESTAMP_KEY);

      if (draftData && timestamp) {
        const savedTime = moment(timestamp);
        const currentTime = moment();

        // Check if draft is not older than 1 month
        if (currentTime.diff(savedTime, 'days') < 30) {
          return JSON.parse(draftData);
        } else {
          // Clean up expired draft
          this.clearLocalStorageDraft();
        }
      }
    } catch (error) {
      console.warn('Failed to load registration draft from localStorage:', error);
    }
    return null;
  }

  /**
   * Clear draft data from localStorage
   */
  clearLocalStorageDraft(): void {
    this.localStorageService.removeItem(this.REGISTRATION_DRAFT_KEY);
    this.localStorageService.removeItem(this.REGISTRATION_DRAFT_TIMESTAMP_KEY);
  }

  /**
   * Set resume token for current session
   * @param token Resume token from URL
   */
  setResumeToken(token: string): void {
    this.resumeToken = token;
    console.log('Resume token set for current session');
  }

  /**
   * Get resume token for current session
   * @returns Resume token or null
   */
  getResumeToken(): string | null {
    return this.resumeToken;
  }

  /**
   * Clear resume token from current session
   */
  clearResumeToken(): void {
    this.resumeToken = null;
    console.log('Resume token cleared from current session');
  }

  /**
   * Clean up resources
   */
  ngOnDestroy(): void {
    this.stopAutoSave();
  }
}
