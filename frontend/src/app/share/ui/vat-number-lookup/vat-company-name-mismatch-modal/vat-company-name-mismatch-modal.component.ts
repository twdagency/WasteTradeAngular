import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

export interface VatCompanyNameMismatchModalData {
  enteredCompanyName: string;
  vatSenseCompanyName: string;
}

@Component({
  selector: 'app-vat-company-name-mismatch-modal',
  styleUrls: ['./vat-company-name-mismatch-modal.component.scss'],
  template: `
    <div class="wrapper">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0 fw-bold">{{ 'Company Name Mismatch' | translate }}</h2>
        <button mat-icon-button type="button" class="common-modal-close-btn" (click)="cancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <p class="mb-3">
        {{ 'The company name provided during registration' | translate }}
        (<strong>{{ data.enteredCompanyName }}</strong>)
        {{ 'does not match the company name provided during VAT lookup' | translate }}
        (<strong>{{ data.vatSenseCompanyName }}</strong>).
        {{ 'Please review and confirm your company name below.' | translate }}
      </p>

      <mat-form-field appearance="outline" class="w-100 mb-4">
        <mat-label>{{ 'Company name' | translate }}</mat-label>
        <input matInput type="text" [formControl]="nameControl" [maxlength]="100" />
        @if (nameControl.hasError('required') && nameControl.touched) {
          <mat-error>{{ 'This field is required' | translate }}</mat-error>
        }
        @if (nameControl.hasError('maxlength')) {
          <mat-error>{{ 'Company name cannot exceed 100 characters' | translate }}</mat-error>
        }
      </mat-form-field>

      <div class="d-flex justify-content-end">
        <button mat-flat-button color="primary" type="button" class="px-4 primary-btn" (click)="update()">
          {{ 'Update Company Name' | translate }}
        </button>
      </div>
    </div>
  `,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, TranslateModule, MatIcon],
})
export class VatCompanyNameMismatchModalComponent {
  private dialogRef = inject(MatDialogRef<VatCompanyNameMismatchModalComponent>);
  data = inject<VatCompanyNameMismatchModalData>(MAT_DIALOG_DATA);

  nameControl = new FormControl(this.data.vatSenseCompanyName ?? '', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(100)],
  });

  cancel(): void {
    this.dialogRef.close();
  }

  update(): void {
    this.nameControl.markAsTouched();
    if (this.nameControl.invalid) {
      return;
    }
    this.dialogRef.close({ companyName: this.nameControl.value.trim() });
  }
}
