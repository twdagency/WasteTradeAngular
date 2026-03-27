import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { countries } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from 'app/layout/common/icon/icon.component';
import { Company } from 'app/models';
import { SettingsService } from 'app/services/settings.service';
import { ConfirmModalComponent } from 'app/share/ui/confirm-modal/confirm-modal.component';
import { MAP_COMPANY_TYPE_TO_LABEL } from 'app/share/utils/account-setting';
import { catchError, EMPTY, finalize } from 'rxjs';

@Component({
  selector: 'app-edit-company-information-form',
  templateUrl: './edit-company-information-form.component.html',
  styleUrls: ['./edit-company-information-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    IconComponent,
    MatButtonModule,
    MatSnackBarModule,
    MatOptionModule,
    MatSelectModule,
    MatDialogModule,
    TranslateModule,
  ],
  providers: [TranslatePipe],
})
export class EditCompanyInformationFormComponent implements OnInit {
  countryList = countries;
  businessAddress: any = {};
  formGroup = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(100)]),
    website: new FormControl<string | null>(null, [
      Validators.pattern(
        /^(?:https?:\/\/)?(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,6}(?:\/[A-Za-z0-9\-._~:\/?#[\]@!$&'()*+,;=%]*)?$/,
      ),
    ]),
    registrationNumber: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    vatNumber: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(20)]),
    companyType: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(20)]),
    companyInterest: new FormControl<string | null>(null, [Validators.required]),
    description: new FormControl<string | null>(null, [Validators.maxLength(500)]),
  });

  readonly MAP_COMPANY_TYPE_TO_LABEL = MAP_COMPANY_TYPE_TO_LABEL;

  readonly dialogRef = inject(MatDialogRef<Company>);
  readonly data = inject<{ companyInfo: Company }>(MAT_DIALOG_DATA);
  snackBar = inject(MatSnackBar);
  settingsService = inject(SettingsService);
  submitting = signal(false);
  dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  translate = inject(TranslatePipe);

  constructor() {}

  ngOnInit() {
    if (this.data.companyInfo) {
      const { companyInfo } = this.data;
      this.businessAddress = {
        email: companyInfo?.email,
        addressLine1: companyInfo?.addressLine1,
        postalCode: companyInfo?.postalCode,
        city: companyInfo?.city,
        country: companyInfo?.country,
        stateProvince: companyInfo?.stateProvince,
        phoneNumber: companyInfo?.phoneNumber,
      };
      this.formGroup.patchValue({
        name: companyInfo?.name,
        registrationNumber: companyInfo?.registrationNumber,
        vatNumber: companyInfo?.vatNumber,
        website: companyInfo?.website,
        companyType: companyInfo?.companyType,
        companyInterest: companyInfo?.companyInterest,
        description: companyInfo?.description,
      });

      this.formGroup.updateValueAndValidity();
    }
  }

  close() {
    if (this.formGroup.pristine) {
      this.dialogRef.close(false);
      return;
    }

    this.dialog
      .open(ConfirmModalComponent, {
        maxWidth: '500px',
        width: '100%',
        panelClass: 'px-3',
        data: {
          title: 'You have unsaved changes. Are you sure you want to close without saving?',
          confirmLabel: 'Confirm',
          cancelLabel: 'Cancel',
        },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((close) => {
        if (!close) return;

        this.dialogRef.close(false);
      });
  }

  submit() {
    if (this.formGroup.pristine) {
      this.snackBar.open(
        this.translate.transform(localized$(`No changes detected. Please modify your profile details before saving.`)),
        this.translate.transform(localized$(`OK`)),
        {
          duration: 3000,
        },
      );
      return;
    }

    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

    const payload: any = { ...this.formGroup.value, ...this.businessAddress };

    this.dialog
      .open(ConfirmModalComponent, {
        maxWidth: '500px',
        width: '100%',
        panelClass: 'px-3',
        data: {
          title: 'Are you sure you want to save these changes?',
          confirmLabel: 'Confirm',
          cancelLabel: 'Cancel',
        },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((shouldSaveChange) => {
        if (!shouldSaveChange) return;

        this.submitting.set(true);
        this.settingsService
          .updateCompany(this.data.companyInfo?.id, payload)
          .pipe(
            catchError((err) => {
              this.snackBar.open(
                this.translate.transform(localized$(`Failed to save changes. Please check your inputs and try again.`)),
                this.translate.transform(localized$(`OK`)),
                {
                  duration: 3000,
                },
              );
              return EMPTY;
            }),
            finalize(() => {
              this.submitting.set(false);
            }),
          )
          .subscribe((res) => {
            this.snackBar.open(
              this.translate.transform(localized$(`Your Company Information has been updated successfully.`)),
              this.translate.transform(localized$(`OK`)),
              {
                duration: 3000,
              },
            );
            this.dialogRef.close(true);
          });
      });
  }
}
