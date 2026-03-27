import { Component, DestroyRef, effect, forwardRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from 'app/services/auth.service';
import { RegistrationsService } from 'app/services/registrations.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ExistingCompanyFoundModalComponent } from './existing-company-found-modal/existing-company-found-modal.component';

export interface CompanyLookupResult {
  id: number;
  name: string;
  vatNumber: string;
  // Extended properties from API response
  email?: string;
  addressLine1?: string;
  city?: string;
  country?: string;
  companyType?: string;
  status?: string;
}

@Component({
  selector: 'app-vat-number-lookup',
  template: `
    <mat-form-field appearance="outline" class="w-100">
      <input
        matInput
        type="text"
        [formControl]="vatControl"
        [placeholder]="'Type here' | translate"
        [maxlength]="20"
        style="padding-right: 40px"
        (blur)="onVatInputBlur()"
      />
      @if (isLoading()) {
        <div class="d-inline-block position-absolute" style="top: 18px; right: 10px">
          <mat-spinner matSuffix diameter="20"></mat-spinner>
        </div>
      }
      @if (vatControl.hasError('required') && (vatControl.touched || vatControl.dirty)) {
        <mat-error>{{ 'This field is required' | translate }}</mat-error>
      }
      @if (vatControl.hasError('maxlength')) {
        <mat-error>{{ 'VAT Number cannot exceed 20 characters' | translate }}</mat-error>
      }
    </mat-form-field>
  `,
  imports: [MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, ReactiveFormsModule, TranslatePipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VatNumberLookupComponent),
      multi: true,
    },
  ],
})
export class VatNumberLookupComponent implements ControlValueAccessor {
  label = input<string>('VAT Number');
  isRequired = input<boolean>(false);
  registrationType = input<'trading' | 'haulage'>('trading');
  isDialogMode = input<boolean>(false);

  readonly emailFormControl = input<any>();
  readonly firstNameFormControl = input<any>();
  readonly lastNameFormControl = input<any>();

  vatControl = new FormControl<string>('');
  isLoading = signal<boolean>(false);

  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private registrationService = inject(RegistrationsService);
  private authService = inject(AuthService);

  // ControlValueAccessor properties
  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor() {
    // Setup validators based on isRequired input
    effect(() => {
      const validators = this.isRequired()
        ? [Validators.required, Validators.maxLength(20)]
        : [Validators.maxLength(20)];
      this.vatControl.setValidators(validators);
      this.vatControl.updateValueAndValidity();
    });

    // Setup VAT lookup on blur with debounce
    // VAT lookup will be triggered on blur event only

    // Emit value changes to parent
    this.vatControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (this.isDialogMode()) {
        const control = this.vatControl;
        if (!control.dirty && !control.touched) {
          // ignore programmatic updates while still pristine in dialog mode
          return;
        }
      }
      this.onChange(value || '');
    });
  }

  private normalizeVatNumber(value: string): string {
    if (!value) return '';

    // Trim whitespace and remove duplicate spaces
    return value.trim().replace(/\s+/g, ' ');
  }

  private showExistingCompanyModal(company: CompanyLookupResult): void {
    const authData = this.authService.user?.user;

    // Get user data from form controls
    const userData = {
      email: this.emailFormControl()?.value || authData?.email || '',
      firstName: this.firstNameFormControl()?.value || authData?.firstName || '',
      lastName: this.lastNameFormControl()?.value || authData?.lastName || '',
    };

    const dialogRef = this.dialog.open(ExistingCompanyFoundModalComponent, {
      width: '100%',
      maxWidth: '960px',
      disableClose: true,
      data: { company, userData },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'no') {
        // Clear VAT number input for user to re-enter
        this.vatControl.setValue('');
        this.onChange('');
      } else if (result?.action === 'yes') {
        // Keep the VAT number and proceed to request modal
        // The modal will handle showing the request modal
      }
    });
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.vatControl.setValue(value || '', { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;

    // Also trigger onTouched when the input loses focus
    // this.vatControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.onTouched());
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.vatControl.disable();
    } else {
      this.vatControl.enable();
    }
  }

  // Public method to get form control for validation
  get formControl() {
    return this.vatControl;
  }

  // Handle VAT lookup on input blur
  onVatInputBlur(): void {
    this.onTouched();
    const value = this.vatControl.value;
    const trimmed = (value || '').trim();

    // Only lookup if there's a value
    if (!trimmed) {
      return;
    }

    const normalizedVat = this.normalizeVatNumber(trimmed);
    if (!normalizedVat) {
      return;
    }

    // Set loading state
    this.isLoading.set(true);

    // Perform VAT lookup
    this.registrationService
      .lookupCompanyByVat(normalizedVat, this.registrationType())
      .pipe(
        catchError((error) => {
          console.warn('VAT lookup failed:', error);
          this.isLoading.set(false);
          return of(null);
        }),
      )
      .subscribe((result) => {
        this.isLoading.set(false);
        if (result?.data) {
          // Map the full API response to our CompanyLookupResult interface
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
}
