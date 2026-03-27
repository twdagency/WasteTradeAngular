import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from 'app/layout/common/icon/icon.component';
import { User } from 'app/models';
import { SettingsService } from 'app/services/settings.service';
import { ConfirmModalComponent } from 'app/share/ui/confirm-modal/confirm-modal.component';
import { catchError, EMPTY, finalize } from 'rxjs';

@Component({
  selector: 'app-edit-notification-form',
  templateUrl: './edit-notification-form.component.html',
  styleUrls: ['./edit-notification-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatRadioModule,
    IconComponent,
    MatFormFieldModule,
    MatDialogModule,
    TranslateModule,
  ],
  providers: [TranslatePipe],
})
export class EditNotificationFormComponent implements OnInit {
  formGroup = new FormGroup({
    receiveEmailForOffersOnMyListings: new FormControl<boolean | null>(null),
    receiveEmailForNewMatchingListings: new FormControl<boolean | null>(null),
  });

  submitting = signal(false);

  readonly dialogRef = inject(MatDialogRef<User>);
  readonly data = inject<{ userInfo: User }>(MAT_DIALOG_DATA);
  destroyRef = inject(DestroyRef);
  dialog = inject(MatDialog);
  settingsService = inject(SettingsService);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);

  constructor() {}

  ngOnInit() {
    if (this.data.userInfo) {
      const user = this.data.userInfo.user;
      if (user) {
        const { receiveEmailForNewMatchingListings, receiveEmailForOffersOnMyListings } = user;
        this.formGroup.patchValue({
          receiveEmailForNewMatchingListings,
          receiveEmailForOffersOnMyListings,
        });
      }
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

    const payload: any = this.formGroup.value;

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
          .updateNotification(payload)
          .pipe(
            catchError((err) => {
              this.snackBar.open(
                this.translate.transform(
                  localized$('Failed to save notification settings. Please check your selections and try again.'),
                ),
                this.translate.transform(localized$('OK')),
                { duration: 3000 },
              );
              return EMPTY;
            }),
            finalize(() => {
              this.submitting.set(false);
            }),
          )
          .subscribe((res) => {
            this.snackBar.open(
              this.translate.transform(localized$('Your notification has been updated successfully.')),
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
