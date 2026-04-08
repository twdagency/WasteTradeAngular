import { UpperCasePipe } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { countries, materialTypes } from '@app/statics';
import { TelephoneFormControlComponent } from '@app/ui';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { GaEventName } from 'app/constants/ga-event';
import { UnAuthLayoutComponent } from 'app/layout/un-auth-layout/un-auth-layout.component';
import { User } from 'app/models/auth.model';
import { ContainerTypeList } from 'app/models/location.model';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { DraftRegisterService } from 'app/services/draft-register.service';
import { RegistrationsService } from 'app/services/registrations.service';
import { SeoService } from 'app/services/seo.service';
import { AccountOnboardingStatusComponent } from 'app/share/ui/account-onboarding-status/account-onboarding-status.component';
import { createMaterialSelectionController } from 'app/share/utils/material-selection';
import { scrollToFirstInvalidControl } from 'app/utils/form.utils';
import { addLanguagePrefix } from 'app/utils/language.utils';
import moment from 'moment';
import { catchError, combineLatest, filter, finalize, of, take } from 'rxjs';

@Component({
  selector: 'app-site-location-section',
  templateUrl: './site-location-section.component.html',
  styleUrls: ['./site-location-section.component.scss'],
  providers: [provideNativeDateAdapter(), TranslatePipe],
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
    MatTimepickerModule,
    MatCheckboxModule,
    UpperCasePipe,
    MatExpansionModule,
    TranslateModule,
  ],
})
export class SiteLocationSectionComponent implements OnInit, OnDestroy {
  countryList = countries;
  containerTypes = ContainerTypeList;
  materialTypes = materialTypes;
  private readonly allMaterialCodes = this.materialTypes
    .flatMap((group) => group.materials ?? [])
    .map((item) => item.code);

  formGroup = new FormGroup({
    locationName: new FormControl<string | null>(null, [Validators.required]),
    prefix: new FormControl<string | null>('mr', [Validators.required]),
    firstName: new FormControl<string | null>(null, [Validators.required]),
    lastName: new FormControl<string | null>(null, [Validators.required]),
    positionInCompany: new FormControl<string | null>(null, [Validators.required]),
    phoneNumber: new FormControl<string | null>(null, [Validators.required]),
    street: new FormControl<string | null>(null, [Validators.required]),
    postcode: new FormControl<string | null>(null, [Validators.required]),
    city: new FormControl<string | null>(null, [Validators.required]),
    country: new FormControl<string | null>(null, [Validators.required]),
    stateProvince: new FormControl<string | null>(null, [Validators.required]),
    officeOpenTime: new FormControl<Date | null>(null, [Validators.required]),
    officeCloseTime: new FormControl<Date | null>(null, [Validators.required]),
    loadingRamp: new FormControl<boolean | null>(null, [Validators.required]),
    weighbridge: new FormControl<boolean | null>(null, [Validators.required]),
    containerType: new FormArray([], [Validators.required]),
    selfLoadUnLoadCapability: new FormControl<string | null>(null, [Validators.required]),
    accessRestrictions: new FormControl<string | null>(null, []),
    toggleAccessRestriction: new FormControl<boolean | null>(null, [Validators.required]),
    acceptedMaterials: new FormArray([], [Validators.required]),
    otherMaterial: new FormControl<string | null>(null),
  });

  submitting = signal<boolean>(false);
  selectAllContainerTypes = signal<boolean>(false);
  showAccessRestriction = signal<boolean>(false);
  usePreviousAddress = signal<boolean>(false);
  user = signal<User | undefined>(undefined);
  selectAllMaterial!: WritableSignal<boolean>;
  expandAllMaterials!: WritableSignal<boolean>;
  expandedMaterialGroup!: WritableSignal<string | null>;
  toggleSelectAllMaterials!: () => void;
  onMaterialPanelToggle!: (name: string, expanded: boolean) => void;
  private updateSelectAllMaterialState!: () => void;
  showOtherMaterial = signal(false);
  selectPreviousAddress = signal(false);

  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);
  registrationService = inject(RegistrationsService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  draftService = inject(DraftRegisterService);
  translate = inject(TranslatePipe);
  seoService = inject(SeoService);
  analyticsService = inject(AnalyticsService);

  materialsAccept = computed(() => {
    const userMaterial = this.user()?.company?.favoriteMaterials || [];
    return this.materialTypes
      .flatMap((type) => type.materials)
      .filter((material) => userMaterial.includes(material.code))
      .map((i) => i.code);
  });

  constructor() {
    const materialSelection = createMaterialSelectionController({
      allMaterialCodes: this.allMaterialCodes,
      materials: this.materials,
      markTouchedOnSelectAll: true,
      onSelectionChanged: () => {
        this.formGroup.updateValueAndValidity();
      },
    });

    this.selectAllMaterial = materialSelection.selectAllMaterial;
    this.expandAllMaterials = materialSelection.expandAllMaterials;
    this.expandedMaterialGroup = materialSelection.expandedMaterialGroup;
    this.toggleSelectAllMaterials = materialSelection.toggleSelectAllMaterials;
    this.onMaterialPanelToggle = materialSelection.onMaterialPanelToggle;
    this.updateSelectAllMaterialState = materialSelection.updateSelectAllMaterialState;

    effect(() => {
      if (this.showAccessRestriction()) {
        this.formGroup.get('accessRestrictions')?.setValidators([Validators.required]);
      } else {
        this.formGroup.get('accessRestrictions')?.clearValidators();
        this.formGroup.get('accessRestrictions')?.markAsUntouched();
      }
      this.formGroup.get('accessRestrictions')?.updateValueAndValidity();
    });

    effect(() => {
      if (this.selectAllContainerTypes()) {
        this.containerType.clear();
        this.containerTypes.forEach((type) => {
          this.containerType.push(new FormControl(type.value));
        });
      } else {
        this.containerType.clear();
      }
    });

    effect(() => {
      const controls = this.formGroup.controls;
      const addressFields = [
        controls.street,
        controls.postcode,
        controls.city,
        controls.country,
        controls.stateProvince,
      ];

      if (this.selectPreviousAddress()) {
        this.formGroup.patchValue(
          {
            street: this.user()?.company.addressLine1,
            postcode: this.user()?.company.postalCode,
            city: this.user()?.company.city,
            country: this.user()?.company.country,
            stateProvince: this.user()?.company.stateProvince,
          },
          { onlySelf: true },
        );
      } else {
        addressFields.forEach((control) => {
          control.enable();
          control.setValidators(Validators.required);
          control.updateValueAndValidity();
          control.reset();
        });
      }

      this.formGroup.updateValueAndValidity();
    });

    effect(() => {
      const { acceptedMaterials, otherMaterial } = this.formGroup.controls;
      if (this.showOtherMaterial()) {
        otherMaterial.setValidators([Validators.required]);
        acceptedMaterials.clearValidators();
      } else {
        otherMaterial.clearValidators();
        otherMaterial.setValue(null);
        otherMaterial.markAsUntouched();
        acceptedMaterials.setValidators([Validators.required]);
      }

      acceptedMaterials.updateValueAndValidity();
      otherMaterial.updateValueAndValidity();
    });

    this.formGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const { street, postcode, city, country, stateProvince } = value;
      const previousAddress = this.user()?.company;
      if (previousAddress) {
        if (
          previousAddress.addressLine1 !== street ||
          previousAddress.postalCode != postcode ||
          previousAddress.city != city ||
          previousAddress.country != country ||
          previousAddress.stateProvince != stateProvince
        ) {
          this.selectPreviousAddress.set(false);
        }
      }
    });
  }

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
        if (user) {
          this.user.set(user);
          const draftData = draftDataRes?.data.dataDraft;

          // Priority 1: Use draft data if available (from resume)
          if (draftData) {
            this.applyDraftData(draftData, user);
          }
          // Priority 2: Use existing user data
          else {
            this.formGroup.patchValue({
              prefix: user.user.prefix ?? '',
              firstName: user.user.firstName ?? '',
              lastName: user.user.lastName ?? '',
              phoneNumber: user.user.phoneNumber ?? '',
              otherMaterial: user.company.otherMaterial ?? '',
              positionInCompany: user.user.jobTitle ?? '',
            });

            if (user.company.otherMaterial) this.showOtherMaterial.set(true);

            if (user.company.favoriteMaterials && user.company.favoriteMaterials.length > 0) {
              const { favoriteMaterials } = user.company;
              favoriteMaterials.forEach((m) => {
                this.materials.push(new FormControl(m));
              });
              this.materials.updateValueAndValidity();
            }
          }

          this.formGroup.updateValueAndValidity();

          // Initialize auto-save tracking
          this.draftService.trackingAutoSave(() => this.saveAndResumeLater(true));
        }
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

    this.seoService.setNoIndex();
  }

  ngOnDestroy() {
    this.draftService.stopAutoSave();
  }

  applyDraftData(draftData: any, user: User) {
    // Parse time strings back to Date objects for time controls using moment.js
    // The saved time is in UTC format, so we need to convert it to local timezone
    const parseTime = (timeString: string | null) => {
      if (!timeString) return null;
      const today = moment().format('YYYY-MM-DD');
      const utcTime = moment.utc(`${today} ${timeString}`, 'YYYY-MM-DD HH:mm:ss', true);
      return utcTime.isValid() ? utcTime.local().toDate() : null;
    };

    setTimeout(() => {
      this.formGroup.patchValue({
        locationName: draftData.locationName,
        prefix: draftData.prefix ?? user.user.prefix ?? '',
        firstName: draftData.firstName ?? user.user.firstName ?? '',
        lastName: draftData.lastName ?? user.user.lastName ?? '',
        positionInCompany: draftData.positionInCompany ?? user.user.jobTitle ?? '',
        phoneNumber: draftData.phoneNumber ?? user.user.phoneNumber ?? '',
        street: draftData.street,
        postcode: draftData.postcode,
        city: draftData.city,
        country: draftData.country,
        stateProvince: draftData.stateProvince,
        officeOpenTime: parseTime(draftData.officeOpenTime),
        officeCloseTime: parseTime(draftData.officeCloseTime),
        loadingRamp: draftData.loadingRamp,
        weighbridge: draftData.weighbridge,
        selfLoadUnLoadCapability: draftData.selfLoadUnLoadCapability,
        accessRestrictions: draftData.accessRestrictions === 'N/a' ? null : draftData.accessRestrictions,
        toggleAccessRestriction: draftData.accessRestrictions && draftData.accessRestrictions !== 'N/a',
        otherMaterial: draftData.otherMaterial,
      });

      // Restore container types
      if (draftData.containerType && Array.isArray(draftData.containerType)) {
        this.containerType.clear();
        draftData.containerType.forEach((type: string) => {
          this.containerType.push(new FormControl(type));
        });
      }

      // Restore accepted materials
      if (draftData.acceptedMaterials && Array.isArray(draftData.acceptedMaterials)) {
        this.materials.clear();
        draftData.acceptedMaterials.forEach((material: string) => {
          this.materials.push(new FormControl(material));
        });
      }
      this.updateSelectAllMaterialState();
      this.expandAllMaterials.set(false);
      this.expandedMaterialGroup.set(null);

      // Set UI state based on draft data
      if (draftData.accessRestrictions && draftData.accessRestrictions !== 'N/a') {
        this.showAccessRestriction.set(true);
      }
      if (draftData.otherMaterial) {
        this.showOtherMaterial.set(true);
      }
    }, 100);
  }

  get containerType() {
    return this.formGroup.get('containerType') as FormArray;
  }

  get materials(): FormArray {
    return this.formGroup.get('acceptedMaterials') as FormArray;
  }

  onSelectedItem(event: MatCheckboxChange, item: string) {
    if (event.checked) {
      this.containerType.push(new FormControl(item));
    } else {
      const idx = this.containerType.controls.findIndex((control) => control.value === item);
      if (idx !== -1) {
        this.containerType.removeAt(idx);
      }
    }
    this.containerType.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
  }

  onSelectedMaterial(event: MatCheckboxChange, item: string) {
    if (event.checked) {
      this.materials.push(new FormControl(item));
    } else {
      const idx = this.materials.controls.findIndex((control) => control.value === item);
      if (idx !== -1) {
        this.materials.removeAt(idx);
      }
    }
    this.materials.markAsTouched();
    this.materials.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
    this.updateSelectAllMaterialState();
  }

  send(navigateTo: string) {
    if (this.formGroup.invalid) {
      scrollToFirstInvalidControl(this.formGroup);
      return;
    }

    const { toggleAccessRestriction, officeCloseTime, officeOpenTime, ...value } = this.formGroup.value;
    const payload: any = {
      ...value,
      officeCloseTime: officeCloseTime?.toISOString().split('T')[1].split('.')[0],
      officeOpenTime: officeOpenTime?.toISOString().split('T')[1].split('.')[0],
      companyId: this.user()?.companyId,
      accessRestrictions: value.accessRestrictions ?? 'N/a',
      mainLocation: this.selectPreviousAddress(),
    };

    navigateTo === '/account-complete-result' ? this.submitting.set(true) : this.submitting.set(false);
    this.registrationService
      .updateCompanyLocation(payload)
      .pipe(
        finalize(() => {
          this.submitting.set(false);
        }),
        catchError((err) => {
          if (err) {
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
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (response) {
          this.analyticsService.trackEvent(GaEventName.GENERATE_LEAD, { form_type: 'site_location' });
          // For account completion, we don't need to preserve the token
          this.router.navigateByUrl(addLanguagePrefix('/account-complete-result'), {
            replaceUrl: true,
          });
        }
      });
  }

  saveAndResumeLater(isAutoSave: boolean = false) {
    // Include token in URL for resume flow
    const resumeToken = this.draftService.getResumeToken();
    const currentUrl = resumeToken ? `${this.router.url.split('?')[0]}?token=${resumeToken}` : this.router.url;
    const { toggleAccessRestriction, officeCloseTime, officeOpenTime, ...value } = this.formGroup.value;

    // Follow the same pattern as send() method for time conversion
    const formData = {
      ...value,
      officeCloseTime: officeCloseTime?.toISOString().split('T')[1].split('.')[0],
      officeOpenTime: officeOpenTime?.toISOString().split('T')[1].split('.')[0],
      companyId: this.user()?.company?.id,
      accessRestrictions: value.accessRestrictions ?? 'N/a',
      step: 'site-location',
    };

    this.draftService.saveDraft(formData, currentUrl, isAutoSave).subscribe();
  }

  onBack() {
    this.router.navigateByUrl(addLanguagePrefix('/company-document'));
  }
}
