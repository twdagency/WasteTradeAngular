import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { scrollToFirstInvalidControl } from 'app/utils/form.utils';
import { AuthService } from 'app/services/auth.service';
import { RegistrationsService } from 'app/services/registrations.service';
import { strictEmailValidator } from 'app/share/validators/strict-email';
import { of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { CompanyLookupResult } from '../vat-number-lookup.component';

interface RequestToJoinModalData {
  company: CompanyLookupResult;
  userData: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

@Component({
  selector: 'app-request-to-join-modal',
  template: `
    <div class="wrapper">
      <button mat-icon-button class="common-modal-close-btn" (click)="cancel()">
        <mat-icon>close</mat-icon>
      </button>
      <h2 class="mb-5 fw-bold">Request to Join {{ data.company.name }}</h2>

      <form [formGroup]="formGroup" (ngSubmit)="sendRequest()" class="request-form" autocomplete="on">
        <div class="mb-5">
          <label class="form-label">{{ 'EMAIL ADDRESS' | translate }} <span class="asterisk">*</span></label>
          <mat-form-field appearance="outline" class="w-100">
            <input
              matInput
              type="email"
              autocomplete="email"
              name="email"
              formControlName="email"
              [readonly]="!!userEmail()"
              class="bg-light"
            />
            @if (formGroup.get('email')?.hasError('required')) {
              <mat-error>{{ 'Please complete all required fields.' | translate }}</mat-error>
            }
            @if (formGroup.get('email')?.hasError('email')) {
              <mat-error>{{ 'Please enter a valid email address.' | translate }}</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="row mb-5">
          <div class="col-md-6">
            <label class="form-label">{{ 'FIRST NAME' | translate }} <span class="asterisk">*</span></label>
            <mat-form-field appearance="outline" class="w-100">
              <input matInput type="text" autocomplete="given-name" name="given-name" formControlName="firstName" [maxlength]="50" />
              @if (formGroup.get('firstName')?.hasError('required')) {
                <mat-error>{{ 'Please complete all required fields.' | translate }}</mat-error>
              }
              @if (formGroup.get('firstName')?.hasError('maxlength')) {
                <mat-error>{{ 'Enter a valid name, max 50 characters.' | translate }}</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="col-md-6">
            <label class="form-label">{{ 'LAST NAME' | translate }} <span class="asterisk">*</span></label>
            <mat-form-field appearance="outline" class="w-100">
              <input matInput type="text" autocomplete="family-name" name="family-name" formControlName="lastName" [maxlength]="50" />
              @if (formGroup.get('lastName')?.hasError('required')) {
                <mat-error>{{ 'Please complete all required fields.' | translate }}</mat-error>
              }
              @if (formGroup.get('lastName')?.hasError('maxlength')) {
                <mat-error>{{ 'Enter a valid name, max 50 characters.' | translate }}</mat-error>
              }
            </mat-form-field>
          </div>
        </div>

        <div class="mb-5">
          <label class="form-label">{{ 'NOTES' | translate }}</label>
          <mat-form-field appearance="outline" class="w-100">
            <textarea matInput formControlName="notes" rows="4" [maxlength]="400"></textarea>
          </mat-form-field>

          <p class="mt-2">{{ characterCount() }} of 400 max characters</p>
        </div>

        <div class="d-flex gap-3 justify-content-between">
          <button
            type="button"
            mat-stroked-button
            color="primary"
            class="px-4 outlined-button cancel-btn"
            (click)="cancel()"
            [disabled]="submitting()"
          >
            CANCEL
          </button>

          <button
            type="submit"
            mat-flat-button
            color="primary"
            class="px-4 primary-btn submit-btn"
            [disabled]="submitting()"
            [class.overlay-spinner]="submitting()"
          >
            SEND REQUEST
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./request-to-join-modal.component.scss'],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    ReactiveFormsModule,
    TranslateModule,
  ],
  providers: [TranslatePipe],
})
export class RequestToJoinModalComponent {
  private dialogRef = inject(MatDialogRef<RequestToJoinModalComponent>);
  data = inject<RequestToJoinModalData>(MAT_DIALOG_DATA);
  private registrationService = inject(RegistrationsService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private translate = inject(TranslatePipe);

  submitting = signal<boolean>(false);

  formGroup = new FormGroup({
    email: new FormControl<string>('', [Validators.required, strictEmailValidator()]),
    firstName: new FormControl<string>('', [Validators.required, Validators.maxLength(50)]),
    lastName: new FormControl<string>('', [Validators.required, Validators.maxLength(50)]),
    notes: new FormControl<string>('', [Validators.maxLength(400)]),
  });

  characterCount = signal<number>(0);

  userEmail = toSignal(this.authService.user$.pipe(map((data) => data?.user?.email)));

  constructor() {
    // Pre-fill user data from userData (passed from parent form) or auth service
    if (this.data.userData) {
      this.formGroup.patchValue({
        email: this.data.userData.email || '',
        firstName: this.data.userData.firstName || '',
        lastName: this.data.userData.lastName || '',
      });
    } else {
      // Fallback to auth service if userData not available
      this.authService.user$.subscribe((user) => {
        if (user) {
          this.formGroup.patchValue({
            email: user.user.email || '',
            firstName: user.user.firstName || '',
            lastName: user.user.lastName || '',
          });
        }
      });
    }

    // Update character count for notes
    this.formGroup.get('notes')?.valueChanges.subscribe((value) => {
      this.characterCount.set((value || '').length);
    });
  }

  sendRequest(): void {
    if (this.formGroup.invalid || this.submitting()) {
      scrollToFirstInvalidControl(this.formGroup);
      return;
    }

    this.submitting.set(true);

    const payload = {
      email: this.formGroup.value.email!,
      firstName: this.formGroup.value.firstName!,
      lastName: this.formGroup.value.lastName!,
      note: this.formGroup.value.notes || '',
      companyId: this.data.company.id,
    };

    this.registrationService
      .requestToJoinCompany(payload)
      .pipe(
        catchError((error) => {
          // Handle specific error cases based on API documentation
          let errorMessage = 'Failed to send join request. Please try again.';

          if (error?.error?.message) {
            switch (error.error.message) {
              case 'an-invitation-has-been-sent-to-this-user':
                errorMessage = localized$("You've already requested to join this company. Please wait for a decision.");
                break;
              case 'user-already-belongs-to-this-company':
                errorMessage = localized$('You already belong to this company.');
                break;
              case 'invalid-email':
                errorMessage = localized$('Please enter a valid email address.');
                break;
              default:
                errorMessage = localized$('Failed to send join request. Please try again.');
            }
          }

          if (error?.error?.error?.message === 'a-request-to-join-company-has-been-sent-by-this-user') {
            errorMessage = localized$('A join request for the email was previously sent to this company.');
          }

          this.snackBar.open(this.translate.transform(errorMessage));
          return of(null);
        }),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }

        this.authService.updateAuthAfterRequestJoinCompany();

        // Show success toast
        this.snackBar.open(this.translate.transform(localized$('Join request sent for review.')));

        // Close modal
        this.dialogRef.close({ action: 'success' });

        // Navigate to request success page based on current route
        // Check if we're in haulier or trading registration flow
        const currentUrl = this.router.url;
        if (currentUrl.includes('haulier') || currentUrl.includes('register-haulier')) {
          this.router.navigateByUrl(ROUTES_WITH_SLASH.requestSuccessHaulier);
        } else {
          this.router.navigateByUrl(ROUTES_WITH_SLASH.requestSuccessTrader);
        }
      });
  }

  cancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }
}
