import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { countries } from '@app/statics';
import { AccountOnboardingStatusComponent, TelephoneFormControlComponent, VatNumberLookupComponent } from '@app/ui';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { GaEventName } from 'app/constants/ga-event';
import { UnAuthLayoutComponent } from 'app/layout/un-auth-layout/un-auth-layout.component';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { DraftRegisterService } from 'app/services/draft-register.service';
import { RegistrationsService } from 'app/services/registrations.service';
import { SeoService } from 'app/services/seo.service';
import { addLanguagePrefix } from 'app/utils/language.utils';
import { catchError, combineLatest, concatMap, filter, finalize, of, take } from 'rxjs';

@Component({
  selector: 'app-company-information-section',
  templateUrl: './company-information-section.component.html',
  styleUrls: ['./company-information-section.component.scss'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    AccountOnboardingStatusComponent,
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    RouterModule,
    ReactiveFormsModule,
    UnAuthLayoutComponent,
    TelephoneFormControlComponent,
    TranslateModule,
    VatNumberLookupComponent,
  ],
  providers: [TranslatePipe],
})
export class CompanyInformationSectionComponent implements OnInit, OnDestroy {
  countryList = countries;

  formGroup = new FormGroup({
    companyType: new FormControl<string | null>(null, [Validators.required]),
    registrationNumber: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(20)]),
    vatRegistrationCountry: new FormControl<string | null>(null, [Validators.required]),
    vatNumber: new FormControl<string | null>(null, [Validators.maxLength(20)]),
    addressLine1: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(100)]),
    postalCode: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(20)]),
    city: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    country: new FormControl<string | null>(null, [Validators.required]),
    stateProvince: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    phoneNumber: new FormControl<string | null>(null, [Validators.required]),
  });
  authService = inject(AuthService);
  submitting = signal(false);
  service = inject(RegistrationsService);
  snackBar = inject(MatSnackBar);
  router = inject(Router);
  route = inject(ActivatedRoute);
  draftService = inject(DraftRegisterService);
  companyId: number | undefined;
  translate = inject(TranslatePipe);
  seoService = inject(SeoService);
  analyticsService = inject(AnalyticsService);

  ngOnInit() {
    this.setupSeo();

    // Handle resume token from URL if present
    const token = this.route.snapshot.queryParams['token'];

    combineLatest([this.authService.user$, token ? this.draftService.resumeRegistrationFlow(token) : of(undefined)])
      .pipe(
        filter(([user]) => !!user),
        take(1),
        catchError((err) => {
          if (err) {
            this.snackBar.open(
              this.translate.transform(
                localized$(
                  `An error occurred while retrieving your information. Please refresh the page or contact support if the problem persists.`,
                ),
              ),
              this.translate.transform(localized$('Ok')),
              { duration: 3000 },
            );
          }
          return of([null, undefined]);
        }),
      )
      .subscribe(([user, draftDataRes]) => {
        let formData = {};
        const draftData = draftDataRes?.data.dataDraft;

        // Priority 1: Use draft data if available (from resume)
        if (draftData) {
          formData = {
            companyType: draftData.companyType ?? '',
            registrationNumber: draftData.registrationNumber ?? '',
            vatRegistrationCountry: draftData.vatRegistrationCountry ?? '',
            vatNumber: draftData.vatNumber ?? '',
            addressLine1: draftData.addressLine1 ?? '',
            postalCode: draftData.postalCode ?? '',
            city: draftData.city ?? '',
            country: draftData.country ?? '',
            stateProvince: draftData.stateProvince ?? '',
            phoneNumber: draftData.phoneNumber ?? '',
          };
          this.companyId = draftData.companyId || user?.company?.id;
        }
        // Priority 2: Use existing user company data
        else if (user?.company) {
          formData = {
            companyType: user.company?.companyType ?? '',
            registrationNumber: user.company?.registrationNumber ?? '',
            vatRegistrationCountry: user.company?.vatRegistrationCountry ?? '',
            vatNumber: user.company?.vatNumber ?? '',
            addressLine1: user.company?.addressLine1 ?? '',
            postalCode: user.company?.postalCode ?? '',
            city: user.company?.city ?? '',
            country: user.company?.country ?? '',
            stateProvince: user.company?.stateProvince ?? '',
            phoneNumber: user.company.phoneNumber ?? '',
          };
          this.companyId = user.company?.id;
        }

        // Apply the form data
        this.formGroup.patchValue(formData);

        // Initialize auto-save tracking
        this.draftService.trackingAutoSave(() => this.saveAndResumeLater(true));
      });
  }

  setupSeo() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Complete your account')),
      description: this.translate.transform(
        localized$(
          'Thank you for registering! Complete your account To unlock the full features of WasteTrade and become an approved company, you need to provide some information about yourself and your company. Click COMPLETE ACCOUNT to begin setting up your company profile. Complete Account &quot;*&quot; indicates required fields 11. Company Info22. Site Location33. Documentation This field is…',
        ),
      ),
    });
  }

  ngOnDestroy() {
    this.draftService.stopAutoSave();
  }

  submit(navigateTo: string) {
    if (this.formGroup.invalid || !this.companyId) {
      return;
    }

    this.formGroup.markAllAsTouched();
    const { ...payload }: any = this.formGroup.value;

    navigateTo === '/company-document' ? this.submitting.set(true) : this.submitting.set(false);

    this.service
      .updateCompanyInfo(this.companyId, payload)
      .pipe(
        finalize(() => {
          this.submitting.set(false);
        }),
        catchError((err) => {
          if (err) {
            this.snackBar.open(
              this.translate.transform(
                localized$(`Failed to submit your information due to a network error. Please try again.`),
              ),
              this.translate.transform(localized$('Ok')),
              {
                duration: 3000,
              },
            );
          }
          return of(null);
        }),
        // refresh /me to set latest user data into auth service
        concatMap((res) => {
          if (res) {
            return this.authService.checkToken();
          }
          return of(null);
        }),
      )
      .subscribe((result) => {
        if (result) {
          this.analyticsService.trackEvent(GaEventName.GENERATE_LEAD, { form_type: 'company_information' });

          this.router.navigate([addLanguagePrefix(navigateTo)], {
            replaceUrl: true,
          });
        }
      });
  }

  saveAndResumeLater(isAutoSave: boolean = false) {
    // Include token in URL for resume flow
    const resumeToken = this.draftService.getResumeToken();
    const currentUrl = resumeToken ? `${this.router.url.split('?')[0]}?token=${resumeToken}` : this.router.url;

    const formData = {
      ...this.formGroup.value,
      companyId: this.companyId,
      step: 'company-information',
    };

    this.draftService.saveDraft(formData, currentUrl, isAutoSave).subscribe({
      next: () => {
        // Success is handled by the service (shows toast and redirects)
      },
      error: (error) => {
        // Error is handled by the service (shows error message)
        console.error('Failed to save draft:', error);
      },
    });
  }
}
