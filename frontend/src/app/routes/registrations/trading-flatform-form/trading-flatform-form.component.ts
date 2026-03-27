import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import { Component, effect, inject, OnDestroy, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { materialTypes } from '@app/statics';
import { InputWithConfirmControlComponent, TelephoneFormControlComponent } from '@app/ui';
import { checkPasswordStrength, pwdStrengthValidator } from '@app/validators';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { GaEventName } from 'app/constants/ga-event';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { UnAuthLayoutComponent } from 'app/layout/un-auth-layout/un-auth-layout.component';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { DraftRegisterService } from 'app/services/draft-register.service';
import { RegistrationsService } from 'app/services/registrations.service';
import { SeoService } from 'app/services/seo.service';
import { createMaterialSelectionController } from 'app/share/utils/material-selection';
import { addLanguagePrefix } from 'app/utils/language.utils';
import { catchError, concatMap, finalize, of } from 'rxjs';

@Component({
  selector: 'app-trading-flatform-form',
  templateUrl: './trading-flatform-form.component.html',
  styleUrls: ['./trading-flatform-form.component.scss'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule,
    ReactiveFormsModule,
    InputWithConfirmControlComponent,
    TelephoneFormControlComponent,
    UnAuthLayoutComponent,
    TitleCasePipe,
    UpperCasePipe,
    MatExpansionModule,
    TranslateModule,
  ],
  providers: [TranslatePipe],
})
export class TradingFlatformFormComponent implements OnInit, OnDestroy {
  materialsAccept = materialTypes;
  private readonly allMaterialCodes = this.materialsAccept
    .flatMap((group) => group.materials ?? [])
    .map((item) => item.code);

  @ViewChild('emailComponent') emailComponent!: InputWithConfirmControlComponent;
  @ViewChild('passwordComponent') passwordComponent!: InputWithConfirmControlComponent;
  private draftService = inject(DraftRegisterService);

  formGroup = new FormGroup({
    prefix: new FormControl<string | null>('mr', [Validators.required]),
    firstName: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    lastName: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    jobTitle: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    phoneNumber: new FormControl<string | null>(null, [Validators.required]),
    email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
    password: new FormControl<string | null>(null, [Validators.required, pwdStrengthValidator]),
    whereDidYouHearAboutUs: new FormControl<string | null>(null, [Validators.required]),
    otherMaterial: new FormControl<string | null>(null, [Validators.maxLength(100)]),
    companyName: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(100)]),
    companyInterest: new FormControl<string | null>(null, [Validators.required]),
    favoriteMaterials: new FormArray([], [Validators.required]),
    acceptTerm: new FormControl<boolean | null>(null, [Validators.requiredTrue]),
  });

  selectAllMaterial!: WritableSignal<boolean>;
  expandAllMaterials!: WritableSignal<boolean>;
  expandedMaterialGroup!: WritableSignal<string | null>;
  toggleSelectAllMaterials!: () => void;
  onMaterialPanelToggle!: (name: string, expanded: boolean) => void;
  private updateSelectAllMaterialState!: () => void;
  selectedType = signal<string | null>(null);
  showOtherMaterial = signal(false);
  submitting = signal(false);
  pwdStrength = signal<string | null>(''); // weak, medium, strong
  router = inject(Router);
  service = inject(RegistrationsService);
  snackBar = inject(MatSnackBar);
  authService = inject(AuthService);
  translate = inject(TranslatePipe);
  seoService = inject(SeoService);
  analyticsService = inject(AnalyticsService);

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
      const { favoriteMaterials, otherMaterial } = this.formGroup.controls;
      if (this.showOtherMaterial()) {
        otherMaterial.setValidators([Validators.required]);
        favoriteMaterials.clearValidators();
      } else {
        otherMaterial.clearValidators();
        otherMaterial.setValue(null);
        otherMaterial.markAsUntouched();
        favoriteMaterials.setValidators([Validators.required]);
      }

      favoriteMaterials.updateValueAndValidity();
      otherMaterial.updateValueAndValidity();
    });
    this.formGroup
      .get('password')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((value) => {
        if (value) {
          this.pwdStrength.set(checkPasswordStrength(value));
        }
      });
  }

  ngOnInit() {
    this.setupSeo();

    // Check for draft data from localStorage
    this.loadDraftData();

    // Initialize auto-save functionality
    this.draftService.trackingAutoSave(() => this.saveToLocalStorage());
  }

  setupSeo() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Create Account')),
      description: this.translate.transform(
        localized$(
          'Do you have a WasteTrade account? Login Register Create Account NEW – vers 2 &quot;*&quot; indicates required fields Unique ID Name* PREFIX* Dr.MissMr.Mrs.Ms.Mx.Prof.Rev. FIRST NAME* LAST NAME* COMPANY NAME**TELEPHONE** Email* ENTER EMAIL* CONFIRM EMAIL* Password* ENTER PASSWORD* CONFIRM PASSWORD* Strength indicator WHERE DID YOU HEAR ABOUT US?**Google SearchPRSE Trade ShowPlastics Live Trade ShowSustainability showK-ShowInterplasPlast 2023Word…',
        ),
      ),
    });
  }

  ngOnDestroy() {
    this.draftService.stopAutoSave();
  }

  goLogin() {
    this.router.navigateByUrl(ROUTES_WITH_SLASH.login);
  }

  private loadDraftData(): void {
    const draftData = this.draftService.loadFromLocalStorage();
    if (draftData) {
      setTimeout(() => {
        this.applyDraftData(draftData);
      }, 100);
    }
  }

  private applyDraftData(draftData: any): void {
    if (!draftData || draftData.step !== 'registration') {
      return;
    }

    // Apply form values
    this.formGroup.patchValue({
      prefix: draftData.prefix || 'mr',
      firstName: draftData.firstName || null,
      lastName: draftData.lastName || null,
      jobTitle: draftData.jobTitle || null,
      phoneNumber: draftData.phoneNumber || null,
      email: draftData.email || null,
      password: draftData.password || null,
      whereDidYouHearAboutUs: draftData.whereDidYouHearAboutUs || null,
      otherMaterial: draftData.otherMaterial || null,
      companyName: draftData.companyName || null,
      companyInterest: draftData.companyInterest || null,
      acceptTerm: draftData.acceptTerm || null,
    });

    // Restore email fields separately if they exist
    if (this.emailComponent && (draftData.emailValue || draftData.emailConfirm)) {
      this.emailComponent.valueControl.setValue(draftData.emailValue || null);
      this.emailComponent.confirmControl.setValue(draftData.emailConfirm || null);
    }

    // Restore password fields separately if they exist
    if (this.passwordComponent && (draftData.passwordValue || draftData.passwordConfirm)) {
      this.passwordComponent.valueControl.setValue(draftData.passwordValue || null);
      this.passwordComponent.confirmControl.setValue(draftData.passwordConfirm || null);
    }

    // Restore favorite materials
    if (draftData.favoriteMaterials && Array.isArray(draftData.favoriteMaterials)) {
      const draftMaterials = draftData.favoriteMaterials.filter((item: string) => !!item);
      const validDraftMaterials = draftMaterials.filter((code: string) => this.allMaterialCodes.includes(code));
      const isAllSelected =
        this.allMaterialCodes.length > 0 && validDraftMaterials.length === this.allMaterialCodes.length;

      this.materials.clear();
      if (!isAllSelected) {
        validDraftMaterials.forEach((material: string) => {
          this.materials.push(new FormControl(material));
        });
      }
      this.materials.markAsTouched();
      this.materials.updateValueAndValidity();
    }
    this.updateSelectAllMaterialState();
    this.expandAllMaterials.set(false);
    this.expandedMaterialGroup.set(null);

    // Set UI state
    if (draftData.otherMaterial) {
      this.showOtherMaterial.set(true);
    }

    // Update form validity after restoration
    this.formGroup.updateValueAndValidity();
  }

  private saveToLocalStorage(): void {
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

    const formData = {
      ...this.formGroup.value,
      ...emailData,
      ...passwordData,
      favoriteMaterials: this.materials.value,
      step: 'registration',
    };
    this.draftService.saveToLocalStorage(formData);
  }

  get materials() {
    return this.formGroup.get('favoriteMaterials') as FormArray;
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

  send() {
    if (this.formGroup.invalid) {
      return;
    }

    this.formGroup.markAllAsTouched();
    const {
      favoriteMaterials,
      companyInterest,
      email,
      password,
      firstName,
      lastName,
      companyName,
      prefix,
      jobTitle,
      whereDidYouHearAboutUs,
      phoneNumber,
      otherMaterial,
    } = this.formGroup.value;
    const payload: any = {
      email,
      password,
      firstName,
      lastName,
      prefix,
      jobTitle,
      phoneNumber,
      whereDidYouHearAboutUs,
      companyName,
      companyInterest,
      favoriteMaterials,
    };

    if (this.showOtherMaterial()) {
      payload.otherMaterial = otherMaterial;
    }

    this.submitting.set(true);
    this.service
      .registerTrading(payload)
      .pipe(
        finalize(() => {
          this.submitting.set(false);
        }),
        catchError((err) => {
          if (err) {
            if (err?.error?.error?.statusCode == 422 && err?.error?.error?.message == 'existed-user') {
              // Set error on email field to highlight it visually
              this.emailComponent.valueControl.setErrors({ emailExists: true });
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
        concatMap((res) => {
          if (!res) {
            return of(null);
          }
          this.authService.setToken(res.data.accessToken);
          return this.authService.checkToken();
        }),
      )
      .subscribe((result) => {
        if (result) {
          this.analyticsService.trackEvent(GaEventName.SIGN_UP, { method: 'email' });
          this.router.navigate([addLanguagePrefix('/complete-your-account')]);
        }
      });
  }
}
