import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from 'app/layout/common/icon/icon.component';
import { AdditionalUrl } from 'app/models';
import { SettingsService } from 'app/services/settings.service';
import { ConfirmModalComponent } from 'app/share/ui/confirm-modal/confirm-modal.component';
import { scrollToFirstInvalidControl } from 'app/utils/form.utils';
import { catchError, EMPTY, finalize } from 'rxjs';

export const SOCIAL_URL_PATTERN =
  /^(?!http[A-Za-z0-9-]*\.)(?:https?:\/\/)?(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,6}(?:\/[A-Za-z0-9\-._~:\/?#[\]@!$&'()*+,;=%]*)?$/;

@Component({
  selector: 'app-edit-social-url-form',
  templateUrl: './edit-social-url-form.component.html',
  styleUrls: ['./edit-social-url-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    IconComponent,
    MatButtonModule,
    MatSnackBarModule,
    MatOptionModule,
    MatDialogModule,
    MatIconModule,
    TranslateModule,
  ],
  providers: [TranslatePipe],
})
export class EditSocialUrlFormComponent implements OnInit {
  formGroup = new FormGroup({
    facebookUrl: new FormControl<string | null>(null, [Validators.pattern(SOCIAL_URL_PATTERN)]),
    instagramUrl: new FormControl<string | null>(null, [Validators.pattern(SOCIAL_URL_PATTERN)]),
    linkedinUrl: new FormControl<string | null>(null, [Validators.pattern(SOCIAL_URL_PATTERN)]),
    xUrl: new FormControl<string | null>(null, [Validators.pattern(SOCIAL_URL_PATTERN)]),
    additionalSocialMediaUrls: new FormArray([]),
  });

  newUrl = new FormGroup({
    name: new FormControl<string | null>(null),
    url: new FormControl<string | null>(null, Validators.pattern(SOCIAL_URL_PATTERN)),
  });

  readonly dialogRef = inject(MatDialogRef<{ [key: string]: string }>);
  readonly data = inject<{
    urlInfo: { [key: string]: string };
    companyId: number;
    additionalSocialMediaUrls: AdditionalUrl[];
  }>(MAT_DIALOG_DATA);
  snackBar = inject(MatSnackBar);
  settingsService = inject(SettingsService);
  submitting = signal(false);
  dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  translate = inject(TranslatePipe);

  get additionalUrls() {
    return this.formGroup.get('additionalSocialMediaUrls') as FormArray;
  }

  constructor() {}

  ngOnInit() {
    if (this.data.urlInfo) {
      const { urlInfo, additionalSocialMediaUrls } = this.data;
      if (urlInfo) {
        this.formGroup.patchValue({
          facebookUrl: urlInfo['facebookUrl'] ?? null,
          instagramUrl: urlInfo['instagramUrl'] ?? null,
          linkedinUrl: urlInfo['linkedinUrl'] ?? null,
          xUrl: urlInfo['xUrl'] ?? null,
        });
        if (additionalSocialMediaUrls && additionalSocialMediaUrls.length > 0) {
          additionalSocialMediaUrls.forEach((social) => {
            const urlGroup = new FormGroup({
              name: new FormControl<string | null>(social.name),
              url: new FormControl<string | null>(social.url, Validators.pattern(SOCIAL_URL_PATTERN)),
            });
            this.additionalUrls.push(urlGroup);
          });
          this.additionalUrls.updateValueAndValidity();
        }
      }

      this.formGroup.updateValueAndValidity();
    }
  }

  addUrlGroup() {
    const { name, url } = this.newUrl.value;
    if (name && url) {
      const urlGroup = new FormGroup({
        name: new FormControl<string | null>(name),
        url: new FormControl<string | null>(url, Validators.pattern(SOCIAL_URL_PATTERN)),
      });

      this.resetForm();
      this.additionalUrls.push(urlGroup);
      this.additionalUrls.markAsDirty();
      this.formGroup.markAsDirty();
      this.formGroup.updateValueAndValidity();
    }
  }

  resetForm() {
    this.newUrl.reset();
    this.newUrl.markAsPristine();
    this.newUrl.markAsUntouched();
    this.newUrl.updateValueAndValidity();
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

    if (this.formGroup.invalid) {
      scrollToFirstInvalidControl(this.formGroup);
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
        if (!shouldSaveChange) return;

        this.submitting.set(true);
        this.settingsService
          .updateCompany(this.data.companyId, payload)
          .pipe(
            catchError((err) => {
              this.snackBar.open(
                this.translate.transform(localized$('Social Url update failed. Please try again later.')),
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
              this.translate.transform(localized$('Your Social Url has been updated successfully.')),
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
