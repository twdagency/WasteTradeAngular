import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TelephoneFormControlComponent } from '@app/ui';
import { strictEmailValidator } from '@app/validators';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from 'app/layout/common/icon/icon.component';
import { User } from 'app/models';
import { SettingsService } from 'app/services/settings.service';
import { ConfirmModalComponent } from 'app/share/ui/confirm-modal/confirm-modal.component';
import { catchError, EMPTY, finalize } from 'rxjs';

@Component({
  selector: 'app-edit-profile-form',
  templateUrl: './edit-profile-form.component.html',
  styleUrls: ['./edit-profile-form.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    IconComponent,
    MatButtonModule,
    MatSnackBarModule,
    MatOptionModule,
    TelephoneFormControlComponent,
    MatSelectModule,
    MatDialogModule,
    TranslateModule,
  ],
  providers: [TranslatePipe],
})
export class EditProfileFormComponent implements OnInit {
  formGroup = new FormGroup({
    prefix: new FormControl<string | null>('mr', [Validators.required]),
    firstName: new FormControl<string | null>(null, [
      Validators.required,
      Validators.maxLength(50),
      Validators.pattern(/^[\p{L}\s]+$/u),
    ]),
    lastName: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    jobTitle: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    phoneNumber: new FormControl<string | null>(null, [Validators.required]),
    email: new FormControl<string | null>(null, [Validators.required, strictEmailValidator()]),
  });

  submitting = signal(false);

  readonly dialogRef = inject(MatDialogRef<User>);
  readonly data = inject<{ userInfo: User }>(MAT_DIALOG_DATA);
  settingsService = inject(SettingsService);
  snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  translate = inject(TranslatePipe);

  constructor() {}

  ngOnInit() {
    if (this.data?.userInfo) {
      const { userInfo } = this.data;
      this.formGroup.patchValue({
        prefix: userInfo?.user?.prefix || 'mr',
        firstName: userInfo?.user?.firstName,
        lastName: userInfo?.user?.lastName,
        jobTitle: userInfo?.user?.jobTitle,
        phoneNumber: userInfo?.user?.phoneNumber,
        email: userInfo.user.email,
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
        this.translate.transform(localized$('No changes detected. Please modify your profile details before saving.')),
        this.translate.transform(localized$('OK')),
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

    const payload = this.formGroup.value;

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
        if (!shouldSaveChange) {
          return;
        }
        this.submitting.set(true);

        this.settingsService
          .updateProfile(payload)
          .pipe(
            catchError((err) => {
              this.snackBar.open(
                this.translate.transform(localized$('Profile update failed. Please try again later.')),
                this.translate.transform(localized$('OK')),
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
              this.translate.transform(localized$('Your profile has been updated successfully.')),
              this.translate.transform(localized$('OK')),
              {
                duration: 3000,
              },
            );
            this.dialogRef.close(true);
          });
      });
  }
}
