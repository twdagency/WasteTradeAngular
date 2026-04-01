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
import { AccountOnboardingStatusComponent, TelephoneFormControlComponent } from '@app/ui';
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
  ],
  providers: [TranslatePipe],
})
export class CompanyInformationSectionComponent implements OnInit, OnDestroy {
  countryList = countries;

  formGroup = new FormGroup({
    companyType: new FormControl<string | null>(null, [Validators.required]),
    registrationNumber: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(20)]),
    vatRegistrationCountry: new FormControl<string | null>(null, [Validators.required]),
    vatNumberEuUk: new FormControl<string | null>(null, [Validators.maxLength(20)]),
    vatNumberOther: new FormControl<string | null>(null, [Validators.maxLength(20)]),
    addressLine1: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(100)]),
    postalCode: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(20)]),
    city: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    country: new FormControl<string | null>(null, [Validators.required]),
    stateProvince: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    phoneNumber: new FormControl<string | null>(null, [Validators.required]),
  });
  authService = inject(AuthService);
  submitting = signal(false);
  vatValid = signal(false);
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
        const draftData = draftDataRes?.data.dataDraft;
        let existingVat = '';

        if (draftData) {
          this.formGroup.patchValue({
            companyType: draftData.companyType ?? '',
            registrationNumber: draftData.registrationNumber ?? '',
            vatRegistrationCountry: draftData.vatRegistrationCountry ?? '',
            vatNumberEuUk: draftData.vatNumberEuUk ?? '',
            vatNumberOther: draftData.vatNumberOther ?? '',
            addressLine1: draftData.addressLine1 ?? '',
            postalCode: draftData.postalCode ?? '',
            city: draftData.city ?? '',
            country: draftData.country ?? '',
            stateProvince: draftData.stateProvince ?? '',
            phoneNumber: draftData.phoneNumber ?? '',
          });
          this.companyId = draftData.companyId || user?.company?.id;
        } else if (user?.company) {
          existingVat = user.company?.vatNumber ?? '';
          this.formGroup.patchValue({
            companyType: user.company?.companyType ?? '',
            registrationNumber: user.company?.registrationNumber ?? '',
            vatRegistrationCountry: user.company?.vatRegistrationCountry ?? '',
            addressLine1: user.company?.addressLine1 ?? '',
            postalCode: user.company?.postalCode ?? '',
            city: user.company?.city ?? '',
            country: user.company?.country ?? '',
            stateProvince: user.company?.stateProvince ?? '',
            phoneNumber: user.company.phoneNumber ?? '',
          });
          this.companyId = user.company?.id;
          this.syncVatControls(existingVat);
        }

        this.draftService.trackingAutoSave(() => this.saveAndResumeLater(true));
      });

    this.formGroup.get('vatRegistrationCountry')?.valueChanges.subscribe((country) => {
      this.vatValid.set(false);
      this.updateVatControlValidators(country);
      this.syncVatControls();
    });

    this.updateVatControlValidators(this.formGroup.get('vatRegistrationCountry')?.value);
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

    const vatCountry = this.formGroup.get('vatRegistrationCountry')?.value;
    const currentVatControl = this.getCurrentVatControl();
    if (vatCountry && vatCountry !== 'Other' && currentVatControl?.value && !this.vatValid()) {
      return;
    }

    this.formGroup.markAllAsTouched();
    const { vatNumberEuUk, vatNumberOther, ...payload }: any = this.formGroup.value;
    payload.vatNumber = currentVatControl?.value ?? '';

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
    const resumeToken = this.draftService.getResumeToken();
    const currentUrl = resumeToken ? `${this.router.url.split('?')[0]}?token=${resumeToken}` : this.router.url;

    const formData = {
      ...this.formGroup.value,
      companyId: this.companyId,
      step: 'company-information',
    };

    this.draftService.saveDraft(formData, currentUrl, isAutoSave).subscribe({
      next: () => {},
      error: (error) => {
        console.error('Failed to save draft:', error);
      },
    });
  }

  // --- VAT validation (VATSense) ---

  validateVatNumber() {
    const vatControl = this.getCurrentVatControl();
    const vatRegistrationCountryControl = this.formGroup.get('vatRegistrationCountry');

    if (vatRegistrationCountryControl?.value === 'Other') {
      this.vatValid.set(false);
      this.clearVatApiErrors();
      return;
    }

    const countryControl = this.formGroup.get('country');

    if (!vatControl) {
      return;
    }

    const rawVat = (vatControl.value ?? '').toString().trim();
    const selectedCountryCode = (countryControl?.value ?? '').toString().trim();

    if (!rawVat) {
      this.clearVatApiErrors();
      return;
    }

    if (vatControl.hasError('required') || vatControl.hasError('maxlength')) {
      return;
    }

    const regCountry = vatRegistrationCountryControl?.value;
    let countryPrefix = selectedCountryCode || (regCountry === 'UK' ? 'GB' : '');
    if (regCountry === 'EU' && !selectedCountryCode) {
      countryPrefix = '';
    }
    const vatToValidate = /^[A-Za-z]{2}/.test(rawVat) || !countryPrefix ? rawVat : `${countryPrefix}${rawVat}`;

    this.clearVatApiErrors();

    this.service
      .validateVatNumber(vatToValidate)
      .pipe(
        catchError((err) => {
          const status = err?.status ?? 0;
          if (status >= 500 || status === 0) {
            this.setVatLookupFailedError();
            this.vatValid.set(false);
          } else {
            this.setVatInvalidError();
            this.vatValid.set(false);
          }
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (!res) {
          return;
        }

        if (res.success && res.data?.valid) {
          this.clearVatApiErrors();
          this.vatValid.set(true);
          return;
        }

        const code = res.code ?? 0;
        if (!res.success && (code === 400 || code === 404)) {
          this.setVatInvalidError();
          this.vatValid.set(false);
          return;
        }

        if (!res.success) {
          this.setVatLookupFailedError();
          this.vatValid.set(false);
        }
      });
  }

  private setVatInvalidError() {
    const vatControl = this.getCurrentVatControl();
    if (!vatControl) return;
    const errors = vatControl.errors ?? {};
    vatControl.setErrors({ ...errors, invalidVat: true });
  }

  private setVatLookupFailedError() {
    const vatControl = this.getCurrentVatControl();
    if (!vatControl) return;
    const errors = vatControl.errors ?? {};
    vatControl.setErrors({ ...errors, vatLookupFailed: true });
  }

  private clearVatApiErrors() {
    const vatControl = this.getCurrentVatControl();
    if (!vatControl || !vatControl.errors) return;
    const { invalidVat, vatLookupFailed, ...otherErrors } = vatControl.errors;
    const remainingErrors = Object.keys(otherErrors).length ? otherErrors : null;
    vatControl.setErrors(remainingErrors);
  }

  private getCurrentVatControl() {
    const country = this.formGroup.get('vatRegistrationCountry')?.value;
    return country === 'Other' ? this.formGroup.get('vatNumberOther') : this.formGroup.get('vatNumberEuUk');
  }

  private updateVatControlValidators(country: string | null | undefined) {
    const euUkControl = this.formGroup.get('vatNumberEuUk');
    const otherControl = this.formGroup.get('vatNumberOther');

    if (!country) {
      otherControl?.setValidators([Validators.maxLength(20)]);
      euUkControl?.setValidators([Validators.maxLength(20)]);
    } else if (country === 'Other') {
      otherControl?.setValidators([Validators.required, Validators.maxLength(20)]);
      euUkControl?.setValidators([Validators.maxLength(20)]);
    } else {
      euUkControl?.setValidators([Validators.required, Validators.maxLength(20)]);
      otherControl?.setValidators([Validators.maxLength(20)]);
    }

    euUkControl?.updateValueAndValidity({ emitEvent: false });
    otherControl?.updateValueAndValidity({ emitEvent: false });
  }

  private syncVatControls(existingVat?: string) {
    const country = this.formGroup.get('vatRegistrationCountry')?.value;
    const valueToSet = existingVat ?? '';

    if (country === 'Other') {
      this.formGroup.get('vatNumberOther')?.setValue(valueToSet);
      this.formGroup.get('vatNumberEuUk')?.setValue(null);
    } else {
      this.formGroup.get('vatNumberEuUk')?.setValue(valueToSet);
      this.formGroup.get('vatNumberOther')?.setValue(null);
    }
  }
}
