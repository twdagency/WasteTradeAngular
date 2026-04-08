import { Component, inject, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule } from '@ngx-translate/core';
import { scrollToFirstInvalidControl } from 'app/utils/form.utils';
import { tap } from 'rxjs';

interface RejectionReasonOpt {
  label: string;
  value: string;
}

enum RejectionReason {
  INCOMPLETE_DOCUMENTATION = 'incomplete_documentation',
  INVALID_COMPANY_REGISTRATION = 'invalid_company_registration',
  DUPLICATE_ACCOUNT = 'duplicate_account',
  UNVERIFIED_CONTACT_INFO = 'unverified_contact_info',
  OTHER = 'other',
}

@Component({
  selector: 'app-haulage-bid-reject-modal',
  templateUrl: './admin-haulage-bid-reject-modal.component.html',
  styleUrls: ['./admin-haulage-bid-reject-modal.component.scss'],
  imports: [
    FormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSnackBarModule,
    TranslateModule,
  ],
})
export class AdminHaulageBidRejectModalComponent {
  RejectionReason = RejectionReason;
  rejectionReasons: RejectionReasonOpt[] = [
    {
      label: localized$('Incomplete documentation'),
      value: localized$(RejectionReason.INCOMPLETE_DOCUMENTATION),
    },
    {
      label: localized$('Invalid company registration'),
      value: localized$(RejectionReason.INVALID_COMPANY_REGISTRATION),
    },
    {
      label: localized$('Duplicate account'),
      value: localized$(RejectionReason.DUPLICATE_ACCOUNT),
    },
    {
      label: localized$('Unverified contact information'),
      value: localized$(RejectionReason.UNVERIFIED_CONTACT_INFO),
    },
    {
      label: localized$('Other (Provide custom reason)'),
      value: localized$(RejectionReason.OTHER),
    },
  ];

  rejectForm = new FormGroup({
    rejectionReason: new FormControl<string | null>(null, [Validators.required]),
    message: new FormControl<string | undefined>(undefined),
  });
  injector = inject(Injector);
  snackbar = inject(MatSnackBar);

  constructor(private dialogRef: MatDialogRef<AdminHaulageBidRejectModalComponent>) {
    this.rejectForm.valueChanges
      .pipe(
        tap((v) => {
          if (v.rejectionReason === RejectionReason.OTHER) {
            this.rejectForm.get('message')?.addValidators([Validators.required]);
          } else {
            this.rejectForm.get('message')?.removeValidators([Validators.required]);
            this.rejectForm.get('message')?.setValue(undefined);
          }
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  confirm(): void {
    if (this.rejectForm.invalid) {
      scrollToFirstInvalidControl(this.rejectForm);
      return;
    }

    const { rejectionReason, message } = this.rejectForm.value;
    const params = {
      rejectionReason: rejectionReason ?? '',
      customRejectionReason: message ?? '',
    };

    this.dialogRef.close(params);
  }

  close(): void {
    this.dialogRef.close();
  }
}
