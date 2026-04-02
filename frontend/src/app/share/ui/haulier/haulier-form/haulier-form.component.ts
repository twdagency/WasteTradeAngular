import { AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  EventEmitter,
  inject,
  input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { countries } from '@app/statics';
import {
  DocumentFileInfo,
  FileInfo,
  FileUploadComponent,
  InputWithConfirmControlComponent,
  TelephoneFormControlComponent,
} from '@app/ui';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { GaEventName } from 'app/constants/ga-event';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { containerTypeList, euCountryList, HaulageProfile } from 'app/models/haulage.model';
import { IDocument } from 'app/models/listing-material-detail.model';
import { SOCIAL_URL_PATTERN } from 'app/routes/account-settings/info/edit-social-url-form/edit-social-url-form.component';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { DraftRegisterService } from 'app/services/draft-register.service';
import { HaulageService } from 'app/services/haulage.service';
import { Permission, PermissionService } from 'app/services/permission.service';
import { RegistrationsService } from 'app/services/registrations.service';
import { base64ToFile, fileToBase64 } from 'app/share/utils/file';
import { checkPasswordStrength, pwdStrengthValidator, strictEmailValidator } from 'app/share/validators/';
import moment from 'moment';
import {
  catchError,
  combineLatest,
  concatMap,
  debounceTime,
  finalize,
  map,
  merge,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';
import { haulierAreaCover } from '../../listing/filter/constant';
import { CompanyLookupResult } from '../../vat-number-lookup/vat-number-lookup.component';
import { ExistingCompanyFoundModalComponent } from '../../vat-number-lookup/existing-company-found-modal/existing-company-found-modal.component';
import { VatCompanyNameMismatchModalComponent } from '../../vat-number-lookup/vat-company-name-mismatch-modal/vat-company-name-mismatch-modal.component';
import { companyNamesMatch } from 'app/share/utils/company-name.utils';
import { VatValidationResponse } from 'app/types/requests/company-user-request';

@Component({
  selector: 'app-haulier-form',
  templateUrl: './haulier-form.component.html',
  styleUrls: ['./haulier-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    InputWithConfirmControlComponent,
    MatInputModule,
    FileUploadComponent,
    TelephoneFormControlComponent,
    MatDatepickerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TitleCasePipe,
    TranslateModule,
    AsyncPipe,
  ],
  providers: [TranslatePipe, DatePipe],
})
export class HaulierFormComponent implements OnInit, OnDestroy {
  withAutoSave = input<boolean>();

  countryList = countries;
  euCountries = euCountryList;
  containerTypes = containerTypeList;
  haulierAreaCover = haulierAreaCover;

  @Output() hasChange: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  @ViewChild('emailComponent') emailComponent!: InputWithConfirmControlComponent;
  @ViewChild('passwordComponent') passwordComponent!: InputWithConfirmControlComponent;
  @ViewChild('fileUploadComponent') fileUploadComponent!: FileUploadComponent;

  urlValidator = Validators.pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s#?]*)?(\?[^\s#]*)?(#[^\s]*)?$/i);

  private readonly signUpOnlyControls = [
    'phoneNumberUser',
    'password',
    'phoneNumberCompany',
    'whereDidYouHearAboutUs',
    'acceptTerm',
  ] as const;

  formGroup = new FormGroup({
    // === Common fields ===
    prefix: new FormControl<string | null>('mr', [Validators.required]),
    firstName: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    lastName: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    jobTitle: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    phoneNumberUser: new FormControl<string | null>(null, [Validators.required]),
    email: new FormControl<string | null>(null, [strictEmailValidator(), Validators.required]),

    companyName: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(100)]),
    registrationNumber: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(20)]),
    vatRegistrationCountry: new FormControl<string | null>(null, [Validators.required]),
    vatNumberEuUk: new FormControl<string | null>(null, [Validators.maxLength(20)]),
    vatNumberOther: new FormControl<string | null>(null, [Validators.maxLength(20)]),
    addressLine1: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(100)]),
    postalCode: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(20)]),
    city: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    country: new FormControl<string | null>(null, [Validators.required]),
    stateProvince: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    phoneNumberCompany: new FormControl<string | null>(null, [Validators.required]),
    fleetType: new FormControl<string | null>(null, [Validators.required]),
    areasCovered: new FormArray<FormControl<string>>([], [Validators.required]),
    areaMode: new FormControl<string | null>(null),
    licenceMode: new FormControl<boolean>(true),
    containerTypes: new FormArray<FormControl<string>>([], [Validators.required]),

    password: new FormControl<string | null>(null, [Validators.required, pwdStrengthValidator]), // signup-only
    whereDidYouHearAboutUs: new FormControl<string | null>(null, [Validators.required]), // signup-only
    acceptTerm: new FormControl<boolean | null>(null, [Validators.requiredTrue]), // signup-only

    facebookUrl: new FormControl<string | null>(null, [Validators.pattern(SOCIAL_URL_PATTERN)]),
    instagramUrl: new FormControl<string | null>(null, [Validators.pattern(SOCIAL_URL_PATTERN)]),
    linkedinUrl: new FormControl<string | null>(null, [Validators.pattern(SOCIAL_URL_PATTERN)]),
    xUrl: new FormControl<string | null>(null, [Validators.pattern(SOCIAL_URL_PATTERN)]),

    companyPhoneNumber: new FormControl<string | null>(null),
    companyMobileNumber: new FormControl<string | null>(null),
  });

  vatValid = signal(false);
  vatChecking = signal(false);
  showEUcountry = signal(false);
  selectAllCountry = signal(false);
  selectAllContainerTypes = signal(false);
  fileError = signal<string | null>(null);
  expiryDateError = signal<string | null>(null);
  selectedFiles = signal<FileInfo[]>([]);
  fileUploadValid = signal<boolean>(false);
  submitting = signal<boolean>(false);
  pwdStrength = signal<string | null>(''); // weak, medium, strong
  firstLoad: boolean = true;

  router = inject(Router);
  private route = inject(ActivatedRoute);
  registrationService = inject(RegistrationsService);
  snackBar = inject(MatSnackBar);
  cd = inject(ChangeDetectorRef);
  authService = inject(AuthService);
  translate = inject(TranslatePipe);
  haulageService = inject(HaulageService);
  permissionService = inject(PermissionService);
  dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  private draftService = inject(DraftRegisterService);
  datePipe = inject(DatePipe);
  private analyticsService = inject(AnalyticsService);

  // Dialog mode
  readonly dialogRef = inject(MatDialogRef<HaulierFormComponent>, { optional: true });
  dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  isDialog = !!this.dialogData?.dialogMode;
  haulier: HaulageProfile = this.dialogData?.haulierProfile ?? null;

  licenceAdded: DocumentFileInfo[] = [];
  cantEditHaulierCompanyInfor = toSignal(
    this.permissionService.permission.pipe(
      map((permission) => !!(permission as Permission)?.setting?.cantEditHaulierCompanyInfor),
    ),
    { initialValue: false },
  );

  get emailFormControl() {
    return this.formGroup.get('email');
  }

  constructor() {
    effect(() => {
      if (this.selectAllContainerTypes()) {
        this.selectedContainerType.clear();
        containerTypeList.forEach((t) => {
          this.selectedContainerType.push(new FormControl(t.value));
        });
        this.selectedContainerType.markAsTouched();
        if (this.isDialog) {
          this.selectedContainerType.markAsTouched();
          this.formGroup.markAsDirty();
          this.formGroup.updateValueAndValidity();
        }
      }
    });

    effect(() => {
      if (this.selectAllCountry()) {
        this.selectedAreasCovered.clear();
        this.euCountries.forEach((item) => {
          this.selectedAreasCovered.push(new FormControl(item.value));
        });
        this.selectedAreasCovered.markAsTouched();
        if (this.isDialog) {
          this.selectedAreasCovered.markAsDirty();
          this.formGroup.markAsDirty();
          this.formGroup.updateValueAndValidity();
        }
      }
    });

    if (!this.isDialog) {
      this.formGroup
        .get('password')
        ?.valueChanges.pipe(takeUntilDestroyed(), debounceTime(300))
        .subscribe((password) => {
          if (!password) return;
          this.pwdStrength.set(checkPasswordStrength(password));
        });
    }
  }

  handleFormWithCompanyRolePermission() {
    // List of form fields to disable if user cannot edit haulier company info
    const fieldsToDisable = [
      'companyName',
      'registrationNumber',
      'vatRegistrationCountry',
      'vatNumberEuUk',
      'vatNumberOther',
      'addressLine1',
      'postalCode',
      'city',
      'country',
      'stateProvince',
      'phoneNumberCompany',
      'fleetType',
      'areasCovered',
      'areaMode',
      'licenceMode',
      'containerTypes',
      'facebookUrl',
      'instagramUrl',
      'linkedinUrl',
      'xUrl',
    ];

    this.permissionService.permission.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((permission) => {
      const cantEditHaulierInfo = (permission as Permission)?.setting?.cantEditHaulierCompanyInfor;

      if (cantEditHaulierInfo) {
        fieldsToDisable.forEach((fieldName) => {
          const control = this.formGroup.get(fieldName);
          if (control) {
            control.disable({ emitEvent: false });
          }
        });

        // Also disable the form arrays
        this.selectedAreasCovered.disable({ emitEvent: false });
        this.selectedContainerType.disable({ emitEvent: false });
      } else {
        // Enable fields if permission is granted (only in edit mode)
        fieldsToDisable.forEach((fieldName) => {
          const control = this.formGroup.get(fieldName);
          if (control) {
            control.enable({ emitEvent: false });
          }
        });

        // Enable form arrays
        this.selectedAreasCovered.enable({ emitEvent: false });
        this.selectedContainerType.enable({ emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    if (this.isDialog) {
      this.signUpOnlyControls.forEach((controlName) => {
        this.hideField(controlName);
      });

      this.handleFormWithCompanyRolePermission();

      this.bindFormValue();
    }

    if (this.withAutoSave()) {
      // Check for resume token from route
      const resumeToken = this.route.snapshot.queryParams['token'];

      resumeToken && this.loadDraftDataFromAPI(resumeToken);

      // Initialize auto-save functionality
      this.draftService.trackingAutoSave(() => this.autoSave());
    }
  }

  ngOnDestroy() {
    this.draftService.stopAutoSave();
  }

  private loadDraftDataFromAPI(token: string): void {
    // Get draft data from router state (passed from resume component)
    this.draftService.resumeRegistrationFlow(token).subscribe((draftDataRes) => {
      const draftData = draftDataRes?.data.dataDraft;

      if (draftData) {
        setTimeout(() => {
          this.applyDraftData(draftData);
        }, 100);
      }
    });
  }

  /**
   * Save draft to API - called when user clicks "Save & Resume Later"
   */
  async saveDraft(): Promise<void> {
    if (this.isDialog) {
      return; // Don't save drafts in dialog mode
    }

    const isValid = !!this.emailComponent.valueControl.value && !!this.passwordComponent.valueControl.value;

    if (!isValid) {
      return;
    }

    try {
      const currentUrl = this.router.url;
      const formData = await this.getDraftData();

      this.draftService.saveDraft(formData, currentUrl, false, formData.emailValue).subscribe({
        next: () => {
          // Success handled by the service (shows toast and redirects)
          console.log('Draft saved successfully');
        },
        error: (error) => {
          // Error handled by the service
          console.error('Failed to save draft:', error);
        },
      });
    } catch (error) {
      console.error('Failed to prepare draft data:', error);
    }
  }

  /**
   * Auto-save method called by the timer
   * Uses API if resume token exists, otherwise localStorage
   */
  private async autoSave(): Promise<void> {
    if (this.isDialog) {
      return; // Don't auto-save in dialog mode
    }

    const isValid = !!this.emailFormControl?.valid;

    if (isValid) {
      // If we have a resume token, auto-save to API
      try {
        const currentUrl = this.router.url;
        const formData = await this.getDraftData();

        this.draftService
          .saveDraft(formData, currentUrl, true, formData.emailValue)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              console.log('Auto-save to API completed');
            },
            error: (error) => {
              console.warn('Auto-save to API failed:', error);
            },
          });
      } catch (error) {
        console.warn('Failed to prepare auto-save data:', error);
      }
    }
  }

  private setFormArrayValues(arr: FormArray, values: string[] | undefined | null, allValue?: any[]) {
    arr.clear();
    if (values?.includes('all')) {
      allValue
        ?.map((v) => v.value)
        .forEach((v) => {
          arr.push(new FormControl(v));
        });
    } else {
      (values ?? []).forEach((v) => arr.push(new FormControl(v)));
    }
    arr.markAsTouched();
    arr.updateValueAndValidity();
  }

  bindFormValue() {
    const h = this.haulier;
    if (!h) return;

    let isCoveredEU = !['uk_only', 'worldwide'].includes(h?.areasCovered[0] ?? '');

    this.formGroup.patchValue({
      prefix: h.prefix ?? null,
      firstName: h.firstName ?? null,
      lastName: h.lastName ?? null,
      jobTitle: h.jobTitle ?? null,

      phoneNumberUser: h.phoneNumber ?? null,

      email: h.email ?? null,
      companyName: h.companyName ?? null,
      registrationNumber: h.registrationNumber ?? null,

      vatRegistrationCountry: h.vatRegistrationCountry ?? null,

      addressLine1: h.addressLine1 ?? null,
      postalCode: h.postalCode ?? null,
      city: h.city ?? null,
      country: h.country ?? null,
      stateProvince: h.stateProvince ?? null,

      // phoneNumberCompany: h.companyPhoneNumber ?? null,

      fleetType: h.fleetType ?? null,

      areaMode: !isCoveredEU ? h.areasCovered[0] : 'EU',
      licenceMode: (h.wasteCarrierLicense?.length ?? 0) > 0,

      facebookUrl: h.facebookUrl ?? null,
      instagramUrl: h.instagramUrl ?? null,
      linkedinUrl: h.linkedinUrl ?? null,
      xUrl: h.xUrl ?? null,

      companyPhoneNumber: h.companyPhoneNumber ?? null,
      companyMobileNumber: h.companyMobileNumber ?? null,
    });

    this.syncVatControls(h.vatNumber ?? '');
    this.updateVatControlValidators(h.vatRegistrationCountry ?? null);

    this.setFormArrayValues(this.selectedContainerType, h.containerTypes ?? [], containerTypeList);
    this.setFormArrayValues(this.selectedAreasCovered, h.areasCovered ?? [], euCountryList);

    this.formGroup.markAsPristine();
    this.formGroup.updateValueAndValidity({ emitEvent: false });

    if (isCoveredEU) {
      this.showEUcountry.set(true);
    }

    this.licenceAdded = (h.wasteCarrierLicense ?? []).map((doc) => {
      const rawExpiry: any = doc.expiryDate;

      let expiryDate: string | undefined;

      if (rawExpiry instanceof Date) {
        expiryDate = this.datePipe.transform(rawExpiry, 'dd/MM/yyyy') || undefined;
      } else if (typeof rawExpiry === 'string') {
        const isIso = /^\d{4}-\d{2}-\d{2}/.test(rawExpiry);

        if (isIso) {
          const date = new Date(rawExpiry);
          expiryDate = this.datePipe.transform(date, 'dd/MM/yyyy') || undefined;
        } else {
          expiryDate = rawExpiry;
        }
      } else {
        expiryDate = undefined;
      }

      return {
        documentUrl: doc.documentUrl,
        expiryDate,
        documentName: doc.fileName,
      };
    });

    this.firstLoad = false;
  }

  hideField(controlName: string) {
    const control = this.formGroup.get(controlName);
    if (!control) return;
    control.clearValidators();
    control.setErrors(null);
    control.disable({ emitEvent: false });
    control.updateValueAndValidity({ emitEvent: false });
  }

  onVatCountryChange() {
    this.vatValid.set(false);
    const country = this.formGroup.get('vatRegistrationCountry')?.value;
    this.updateVatControlValidators(country);
    this.syncVatControls();
  }

  validateVatNumber() {
    const vatControl = this.getCurrentVatControl();
    const countryControl = this.formGroup.get('country');
    const vatRegistrationCountryControl = this.formGroup.get('vatRegistrationCountry');

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
    this.vatChecking.set(true);

    this.registrationService
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
        finalize(() => this.vatChecking.set(false)),
      )
      .subscribe((res) => {
        if (!res) {
          return;
        }

        if (res.success && res.data?.valid) {
          this.clearVatApiErrors();
          this.vatValid.set(true);
          this.afterVatValidatedForHaulier(rawVat, res);
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

  getCurrentVatControl() {
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

  private afterVatValidatedForHaulier(rawVat: string, res: VatValidationResponse): void {
    const vatSenseName = res.data?.company?.company_name?.trim() ?? '';
    const entered = (this.formGroup.get('companyName')?.value ?? '').toString().trim();

    if (!vatSenseName || companyNamesMatch(entered, vatSenseName)) {
      this.lookupCompanyByVat(rawVat);
      return;
    }

    const ref = this.dialog.open(VatCompanyNameMismatchModalComponent, {
      width: '100%',
      maxWidth: '960px',
      disableClose: true,
      data: { enteredCompanyName: entered, vatSenseCompanyName: vatSenseName },
    });

    ref.afterClosed().subscribe((result?: { companyName: string }) => {
      if (!result?.companyName?.trim()) {
        this.vatValid.set(false);
        return;
      }
      this.formGroup.get('companyName')?.setValue(result.companyName.trim());
      this.lookupCompanyByVat(rawVat);
    });
  }

  private lookupCompanyByVat(vatNumber: string) {
    const normalizedVat = vatNumber.trim().replace(/\s+/g, ' ');
    if (!normalizedVat) return;

    this.registrationService
      .lookupCompanyByVat(normalizedVat, 'haulage')
      .pipe(catchError(() => of(null)))
      .subscribe((result) => {
        if (result?.data) {
          const companyData: CompanyLookupResult = {
            id: result.data.id,
            name: result.data.name,
            vatNumber: result.data.vatNumber,
            email: result.data.email,
            addressLine1: result.data.addressLine1,
            city: result.data.city,
            country: result.data.country,
            companyType: result.data.companyType,
            status: result.data.status,
          };
          this.showExistingCompanyModal(companyData);
        }
      });
  }

  private showExistingCompanyModal(company: CompanyLookupResult) {
    const authData = this.authService.user?.user;

    const userData = {
      email: this.emailComponent?.valueControl?.value || authData?.email || '',
      firstName: this.formGroup.get('firstName')?.value || authData?.firstName || '',
      lastName: this.formGroup.get('lastName')?.value || authData?.lastName || '',
    };

    const dialogRef = this.dialog.open(ExistingCompanyFoundModalComponent, {
      width: '100%',
      maxWidth: '960px',
      disableClose: true,
      data: { company, userData },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'no') {
        const vatControl = this.getCurrentVatControl();
        vatControl?.setValue('');
        this.vatValid.set(false);
      }
    });
  }

  onAreaChange(event: MatRadioChange) {
    this.selectedAreasCovered.clear();
    if (event.value === 'EU') {
      this.showEUcountry.set(true);
      this.selectedAreasCovered.setValidators(Validators.required);
    } else {
      this.showEUcountry.set(false);
      this.selectedAreasCovered.clearValidators();
      this.selectedAreasCovered.push(new FormControl(event.value));
    }
    this.selectedAreasCovered.markAsDirty();
    this.selectedAreasCovered.updateValueAndValidity();
  }

  get selectedAreasCovered() {
    return this.formGroup.get('areasCovered') as FormArray;
  }

  get selectedContainerType() {
    return this.formGroup.get('containerTypes') as FormArray;
  }

  onSelectedItem(event: MatCheckboxChange, item: string, formArray: FormArray, type: 'country' | 'container') {
    if (event.checked) {
      formArray.push(new FormControl(item));
    } else {
      const idx = formArray.controls.findIndex((control) => control.value === item);
      if (idx !== -1) {
        formArray.removeAt(idx);
      }
    }
    switch (type) {
      case 'country':
        this.selectAllCountry.set(formArray.length === this.euCountries.length);
        break;
      case 'container':
        this.selectAllContainerTypes.set(formArray.length === this.containerTypes.length);
        break;
    }
    formArray.markAsDirty();
    formArray.updateValueAndValidity();
  }

  handleFileReady(files: FileInfo[]) {
    if (files) {
      this.selectedFiles.set(files);
      if (this.hasLicenceChanged(this.selectedFiles())) {
        this.formGroup.markAsDirty();
        this.formGroup.updateValueAndValidity();
      }
    }
  }

  onLicenceChange(event: MatRadioChange) {
    this.selectedFiles.set([]);
    this.licenceAdded = [];
  }

  private buildPayloadWithVat(value: any): any {
    const { vatNumberEuUk, vatNumberOther, ...payload } = value;
    payload.vatNumber = this.getCurrentVatControl()?.value ?? '';
    return payload;
  }

  send() {
    this.formGroup.markAllAsTouched();

    const vatCountry = this.formGroup.get('vatRegistrationCountry')?.value;
    const currentVatControl = this.getCurrentVatControl();
    if (vatCountry && vatCountry !== 'Other' && currentVatControl?.value && !this.vatValid()) {
      return;
    }

    if (this.isDialog) {
      const ref = this.dialog.open(ConfirmModalComponent, {
        maxWidth: '500px',
        width: '100%',
        panelClass: 'px-3',
        data: {
          title: 'Are you sure you want to save these changes?',
          confirmLabel: 'Confirm',
          cancelLabel: 'Cancel',
        },
      });

      ref
        .afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((confirmed) => {
          if (confirmed) this.submit(this.buildPayloadWithVat(this.formGroup.value));
        });
      return;
    }

    this.submit(this.buildPayloadWithVat(this.formGroup.value));
  }

  buildDocuments() {
    const files = (this.selectedFiles() ?? []).map((f) => {
      const rawDateValue = f.expiryDate;

      let formattedDate: string | null = null;

      if (rawDateValue) {
        const momentObject = moment(rawDateValue);

        if (momentObject.isValid()) {
          formattedDate = momentObject.format('DD/MM/YYYY');
        }
      }

      return {
        ...f,
        expiryDate: formattedDate,
      };
    });

    if (!files.length) {
      const keepOld = (this.licenceAdded ?? []).map((doc) => ({
        documentType: 'waste_carrier_license' as const,
        documentUrl: doc.documentUrl,
        expiryDate: doc.expiryDate ?? null,
      }));
      return of(keepOld);
    }

    const existingDocs = files
      .filter((f: any) => 'documentUrl' in f && f.documentUrl)
      .map((f: any) => ({
        documentType: 'waste_carrier_license' as const,
        documentUrl: f.documentUrl,
        expiryDate: f.expiryDate ?? null,
      }));

    const newFiles = files.filter((f: any) => !('documentUrl' in f) && f.file);
    const uploadFiles = newFiles.map((f) => f.file as File);
    const expiryDates = newFiles.map((f) => f.expiryDate ?? null);

    if (!uploadFiles.length) {
      return of(existingDocs);
    }

    return this.registrationService.uploadFileHaulier(uploadFiles).pipe(
      concatMap((documentUrls: string[]) => {
        if (!documentUrls) {
          return of(existingDocs);
        }

        const uploadedDocs = documentUrls.map((url, index) => ({
          documentType: 'waste_carrier_license' as const,
          documentUrl: url,
          expiryDate: expiryDates[index],
        }));

        return of([...existingDocs, ...uploadedDocs]);
      }),
      catchError(() => {
        this.snackBar.open(
          this.translate.transform(localized$(`An error occurred while uploading the file. Please try again.`)),
          this.translate.transform(localized$('Ok')),
          { duration: 3000 },
        );
        return of(existingDocs);
      }),
    );
  }

  submit(value: any) {
    if (this.selectedFiles().length > 0) {
      this.submitting.set(true);
      this.buildDocuments()
        .pipe(
          switchMap((documents) => {
            const payload: any = {
              ...value,
              documents,
            };

            delete payload.acceptTerm;
            delete payload.areaMode;
            delete payload.licenceMode;

            if (this.isDialog) {
              return this.uploadHaulierProfile(payload).pipe(finalize(() => this.submitting.set(false)));
            }

            return this.registrationHaulier(payload).pipe(
              concatMap((res) => {
                if (!res) return of(null);
                this.analyticsService.trackEvent(GaEventName.SIGN_UP, { method: 'email' });
                this.authService.setToken(res.data.accessToken);
                return this.authService.checkToken();
              }),
            );
          }),
          finalize(() => this.submitting.set(false)),
        )
        .subscribe((res) => {
          if (!res) {
            return;
          }

          if (this.isDialog) {
            this.authService.checkToken().subscribe();
            this.snackBar.open(this.translate.transform('Profile updated successfully'));
            this.dialogRef?.close(true);
          } else {
            this.router.navigateByUrl(ROUTES_WITH_SLASH.accountPendingResult);
          }
        });
    } else {
      this.submitting.set(true);
      if (this.isDialog) {
        const payload = this.buildPayloadWithVat(this.formGroup.value);
        this.uploadHaulierProfile(payload)
          .pipe(finalize(() => this.submitting.set(false)))
          .subscribe((res) => {
            if (res) {
              this.authService.checkToken().subscribe();
              this.snackBar.open(this.translate.transform('Profile updated successfully'));
              this.dialogRef?.close(true);
            }
          });
      } else {
        this.registrationHaulier(this.buildPayloadWithVat(this.formGroup.value))
          .pipe(
            concatMap((res) => {
              if (!res) return of(null);
              this.analyticsService.trackEvent(GaEventName.SIGN_UP, { method: 'email' });
              this.authService.setToken(res.data.accessToken);
              return this.authService.checkToken();
            }),
            finalize(() => this.submitting.set(false)),
          )
          .subscribe((res) => {
            if (res) {
              this.router.navigateByUrl(ROUTES_WITH_SLASH.accountPendingResult);
            }
          });
      }
    }
  }

  registrationHaulier(payload: any) {
    delete payload.facebookUrl;
    delete payload.instagramUrl;
    delete payload.linkedinUrl;
    delete payload.xUrl;
    delete payload.companyPhoneNumber;
    delete payload.companyMobileNumber;

    return this.registrationService.registerHaulage(payload).pipe(
      catchError((err) => {
        if (err) {
          if (err?.error?.error?.statusCode == 422 && err?.error?.error?.message == 'existed-user') {
            this.snackBar.open(
              this.translate.transform(
                localized$(`This email already exists. Please enter an alternative email address`),
              ),
              this.translate.transform(localized$('Ok')),
              {
                duration: 3000,
              },
            );
          } else {
            this.snackBar.open(
              this.translate.transform(
                localized$(`${err?.error?.error?.message ?? 'Some thing went wrong. Please try again.'}`),
              ),
              this.translate.transform(localized$('Ok')),
              {
                duration: 3000,
              },
            );
          }
        }
        return of(null);
      }),
    );
  }

  uploadHaulierProfile(payload: any) {
    const docs: IDocument[] = Array.isArray(payload.documents) ? payload.documents : [];
    const wasteCarrierLicense = docs
      .filter((d) => !!d?.documentUrl)
      .map((d) => {
        let fileName = '';
        try {
          const url = new URL(d.documentUrl);
          fileName = url.pathname.split('/').pop() || '';
        } catch {
          const parts = String(d.documentUrl).split('/');
          fileName = parts[parts.length - 1] || '';
        }

        return {
          fileName,
          documentUrl: d.documentUrl,
          expiryDate: d.expiryDate,
        };
      });
    delete payload.documents;
    payload.wasteCarrierLicense = wasteCarrierLicense;

    (['facebookUrl', 'instagramUrl', 'linkedinUrl', 'xUrl'] as const).forEach((k) => {
      const v = payload[k];
      if (typeof v === 'string') {
        payload[k] = v.trim();
      }
      if (payload[k] == null || payload[k] === '') {
        delete payload[k];
      }
    });

    payload['companyMobileNumber'] = payload['companyMobileNumber'] ?? '';

    return this.haulageService.updateHaulageProfile(payload).pipe(
      catchError((err) => {
        if (err?.error?.error?.statusCode == 403) {
          this.snackBar.open(
            this.translate.transform(localized$(`Only hauliers can access this endpoint`)),
            this.translate.transform(localized$('Ok')),
            {
              duration: 3000,
            },
          );
        }
        this.snackBar.open(
          this.translate.transform(
            localized$(
              `We couldn’t save your profile right now. Please try again. If the problem persists, contact support.`,
            ),
          ),
          this.translate.transform(localized$('Ok')),
          {
            duration: 3000,
          },
        );
        return of(null);
      }),
    );
  }

  private hasLicenceChanged(selected = this.selectedFiles() ?? []): boolean {
    const originals = this.licenceAdded ?? [];

    if (!originals.length && !selected.length) return false;

    if (selected.some((f: any) => !!f.file)) return true;

    const map = new Map(originals.map((d) => [d.documentName, d]));

    for (const f of selected as any[]) {
      const key = f.fileName ?? f.documentName ?? '';
      const orig = map.get(key);

      if (!orig) return true;

      const o = orig.expiryDate;

      const s = f.expiryDate
        ? moment.isMoment(f.expiryDate)
          ? f.expiryDate.format('DD/MM/YYYY')
          : moment(f.expiryDate).format('DD/MM/YYYY')
        : '';

      if (o !== s) return true;
    }

    return originals.length !== selected.length;
  }

  readonly disableSaveDraft = toSignal(
    merge(
      this.formGroup.get('email')!.valueChanges,
      this.formGroup.get('password')!.valueChanges,
    ).pipe(
      map(() => {
        const emailVal = this.emailComponent?.valueControl?.value;
        const passwordVal = this.passwordComponent?.valueControl?.value;
        return !emailVal || !passwordVal;
      }),
    ),
    { initialValue: true },
  );

  readonly disableButton$ = combineLatest([
    this.formGroup.statusChanges.pipe(startWith(this.formGroup.status)),
    toObservable(this.selectedFiles),
    toObservable(this.submitting),
  ]).pipe(
    map(([status, selected, submitting]) => {
      if (submitting) return { disabled: true, hasChanges: false };

      console.log(this.formGroup.errors);

      const formInvalid = status !== 'VALID';
      const licenceMode = this.formGroup.get('licenceMode')?.value;
      const hasSelectedFiles = selected.length > 0;
      const licenceChanged = this.hasLicenceChanged(selected);

      if (!this.isDialog) {
        const disabled = formInvalid || !hasSelectedFiles || !this.fileUploadValid();
        const hasChanges = this.formGroup.dirty || hasSelectedFiles; // file change = selected > 0

        return { disabled, hasChanges };
      }

      const hasAnyLicence = !licenceMode || hasSelectedFiles || (this.licenceAdded && this.licenceAdded.length > 0);

      if (!hasAnyLicence) return { disabled: true, hasChanges: false };

      const hasChanges = this.formGroup.dirty || licenceChanged;

      if (!hasChanges) return { disabled: true, hasChanges: false };

      if (licenceMode && !this.fileUploadValid()) {
        return { disabled: true, hasChanges: true };
      }

      return { disabled: formInvalid, hasChanges };
    }),

    tap((state) => {
      this.hasChange.emit(state.hasChanges);
    }),

    map((state) => state.disabled),

    startWith(true),
    shareReplay(1),
  );

  /**
   * Add a file to the FileUploadComponent's internal FormArray
   */
  private addFileToUploadComponent(fileInfo: FileInfo): void {
    if (!this.fileUploadComponent) return;

    const validators = [];
    if (this.fileUploadComponent.expiryDateMode === 'required') {
      validators.push(Validators.required);
    }

    const fileControl = new FormGroup({
      file: new FormControl<File>(fileInfo.file),
      expiryDate: new FormControl<moment.Moment | null>(fileInfo.expiryDate || null, validators),
    });

    this.fileUploadComponent.documents.push(fileControl);
  }

  /**
   * Save current form data to localStorage with files as base64
   */
  getDraftData(): any {
    if (this.isDialog) {
      // Don't save draft data in dialog mode (edit mode)
      return;
    }

    try {
      const formValue = this.formGroup.value;

      // Get email values from the component directly
      let emailData = {};
      if (this.emailComponent) {
        emailData = {
          emailValue: this.emailComponent.valueControl.value,
          emailConfirm: this.emailComponent.confirmControl.value,
        };
      }

      // Get password values from the component directly
      let passwordData = {};
      if (this.passwordComponent) {
        passwordData = {
          passwordValue: this.passwordComponent.valueControl.value,
          passwordConfirm: this.passwordComponent.confirmControl.value,
        };
      }

      // Convert files to base64 for storage
      const filePromises = this.selectedFiles().map(async (fileInfo) => {
        if (fileInfo.file) {
          try {
            const base64 = await fileToBase64(fileInfo.file);
            return {
              name: fileInfo.file.name,
              size: fileInfo.file.size,
              type: fileInfo.file.type,
              base64: base64,
              expiryDate: fileInfo.expiryDate?.format('YYYY-MM-DD') || null,
            };
          } catch (error) {
            console.warn('Failed to convert file to base64:', error);
            return null;
          }
        }
        return null;
      });

      // Process files and save data
      const draftData = Promise.all(filePromises)
        .then((filesBase64) => {
          const validFiles = filesBase64.filter((file) => file !== null);

          const draftData = {
            ...formValue,
            ...emailData,
            ...passwordData,
            // Save areas covered array values
            areasCovered: this.selectedAreasCovered.value || [],
            // Save container types array values
            containerTypes: this.selectedContainerType.value || [],
            // Save selected files as base64
            selectedFilesBase64: validFiles,
            // Save signals state
            showEUcountry: this.showEUcountry(),
            selectAllCountry: this.selectAllCountry(),
            selectAllContainerTypes: this.selectAllContainerTypes(),
            pwdStrength: this.pwdStrength(),
            step: 'haulier_registration',
          };

          // this.draftService.saveToLocalStorage(draftData);
          return draftData;
        })
        .catch((error) => {
          console.warn('Failed to process files for localStorage:', error);

          // Fallback: save without files
          const draftData = {
            ...formValue,
            ...emailData,
            ...passwordData,
            areasCovered: this.selectedAreasCovered.value || [],
            containerTypes: this.selectedContainerType.value || [],
            selectedFilesBase64: [],
            showEUcountry: this.showEUcountry(),
            selectAllCountry: this.selectAllCountry(),
            selectAllContainerTypes: this.selectAllContainerTypes(),
            pwdStrength: this.pwdStrength(),
            step: 'haulier_registration',
          };

          // this.draftService.saveToLocalStorage(draftData);
          return draftData;
        });

      return draftData;
    } catch (error) {
      return {};
      console.warn('Failed to save haulier form draft:', error);
    }
  }

  /**
   * Apply draft data to the form
   */
  applyDraftData(draftData: any): void {
    if (this.isDialog || !draftData || draftData.step !== 'haulier_registration') {
      // Don't apply draft data in dialog mode (edit mode)
      return;
    }

    try {
      // Patch main form values
      const formValue = { ...draftData };

      // Remove non-form fields before patching
      delete formValue.areasCovered;
      delete formValue.containerTypes;
      delete formValue.selectedFilesBase64;
      delete formValue.selectedFilesInfo; // Legacy support
      delete formValue.showEUcountry;
      delete formValue.selectAllCountry;
      delete formValue.selectAllContainerTypes;
      delete formValue.pwdStrength;
      delete formValue.emailValue;
      delete formValue.emailConfirm;
      delete formValue.passwordValue;
      delete formValue.passwordConfirm;
      delete formValue.step;

      if (formValue.vatNumber && !formValue.vatNumberEuUk && !formValue.vatNumberOther) {
        const country = formValue.vatRegistrationCountry;
        if (country === 'EU' || country === 'UK') {
          formValue.vatNumberEuUk = formValue.vatNumber;
        } else {
          formValue.vatNumberOther = formValue.vatNumber;
        }
        delete formValue.vatNumber;
      }

      this.formGroup.patchValue(formValue);

      if (formValue.vatRegistrationCountry) {
        this.updateVatControlValidators(formValue.vatRegistrationCountry);
      }

      // Restore email fields separately if they exist
      setTimeout(() => {
        if (this.emailComponent && (draftData.emailValue || draftData.emailConfirm)) {
          this.emailComponent.valueControl.setValue(draftData.emailValue || null);
          this.emailComponent.confirmControl.setValue(draftData.emailConfirm || null);
        }

        // Restore password fields separately if they exist
        if (this.passwordComponent && (draftData.passwordValue || draftData.passwordConfirm)) {
          this.passwordComponent.valueControl.setValue(draftData.passwordValue || null);
          this.passwordComponent.confirmControl.setValue(draftData.passwordConfirm || null);
        }
      }, 100);

      // Restore form arrays
      if (draftData.areasCovered && Array.isArray(draftData.areasCovered)) {
        this.setFormArrayValues(this.selectedAreasCovered, draftData.areasCovered);
      }

      if (draftData.containerTypes && Array.isArray(draftData.containerTypes)) {
        this.setFormArrayValues(this.selectedContainerType, draftData.containerTypes);
      }

      // Restore signals state
      if (draftData.showEUcountry !== undefined) {
        this.showEUcountry.set(draftData.showEUcountry);
      }

      if (draftData.selectAllCountry !== undefined) {
        this.selectAllCountry.set(draftData.selectAllCountry);
      }

      if (draftData.selectAllContainerTypes !== undefined) {
        this.selectAllContainerTypes.set(draftData.selectAllContainerTypes);
      }

      if (draftData.pwdStrength) {
        this.pwdStrength.set(draftData.pwdStrength);
      }

      // Restore files from base64 - need to add files to FileUploadComponent
      if (draftData.selectedFilesBase64 && Array.isArray(draftData.selectedFilesBase64)) {
        setTimeout(() => {
          try {
            const restoredFiles: FileInfo[] = draftData.selectedFilesBase64.map((fileData: any) => {
              const file = base64ToFile(fileData.base64, fileData.name, fileData.type);

              // Create moment object for expiry date if it exists
              let expiryDate = null;
              if (fileData.expiryDate) {
                expiryDate = moment(fileData.expiryDate, 'YYYY-MM-DD');
              }

              return {
                file: file,
                expiryDate: expiryDate,
              };
            });

            this.selectedFiles.set(restoredFiles);

            // Add files to the FileUploadComponent's internal FormArray
            if (this.fileUploadComponent) {
              // Clear existing documents first
              this.fileUploadComponent.documents.clear();

              // Add each restored file to the component
              restoredFiles.forEach((fileInfo) => {
                this.addFileToUploadComponent(fileInfo);
              });
            }

            console.log('Successfully restored', restoredFiles.length, 'files from localStorage');
          } catch (error) {
            console.warn('Failed to restore files from base64:', error);
            this.selectedFiles.set([]);
          }
        }, 200); // Increased delay to ensure ViewChild is available
      } else if (draftData.selectedFilesInfo && Array.isArray(draftData.selectedFilesInfo)) {
        // Legacy support for old format (metadata only)
        console.log('Found legacy file metadata. Files need to be re-uploaded:', draftData.selectedFilesInfo);
        this.selectedFiles.set([]);
      } else {
        this.selectedFiles.set([]);
      }

      // Mark form as dirty since we've applied draft data
      this.formGroup.markAsDirty();
      this.formGroup.updateValueAndValidity();

      console.log('Haulier form draft data applied successfully');
    } catch (error) {
      console.warn('Failed to apply haulier form draft data:', error);
    }
  }

  toggleSelectAll(event: MatCheckboxChange, selectAllSignal: { set: (v: boolean) => void }, formArray: FormArray) {
    const isChecked = event.checked;

    selectAllSignal.set(isChecked);

    if (!isChecked) {
      formArray.clear();
      formArray.markAsTouched();

      if (this.isDialog) {
        this.formGroup.markAsDirty();
      }
    }
  }
}