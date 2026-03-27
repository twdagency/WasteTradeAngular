import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { CompanyMemberService } from 'app/services/company-member.service';
import { ReInviteUserRequest } from 'app/types/requests/company-user-request';
import { finalize } from 'rxjs';

type InviteUserData = {
  email: string;
  userId: string;
};

@Component({
  selector: 'app-resend-user',
  imports: [MatIconModule, TranslatePipe, TranslateModule],
  templateUrl: './resend-user.component.html',
  styleUrl: './resend-user.component.scss',
})
export class ResendUserComponent {
  data = inject<InviteUserData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ResendUserComponent>);
  private companyMemberService = inject(CompanyMemberService);
  private snackbar = inject(MatSnackBar);

  submitting = signal(false);

  handleClose() {
    this.dialogRef.close();
  }

  handleConfirm() {
    const payload: ReInviteUserRequest = {
      userId: this.data.userId,
    };
    this.companyMemberService
      .reInviteUser(payload)
      .pipe(
        finalize(() => {
          this.submitting.set(false);
        }),
      )
      .subscribe({
        next: (res) => {
          this.snackbar.open(localized$('User invitation sent successfully'), undefined, {
            duration: 3000,
          });
          this.dialogRef.close(res.data.invitation);
        },
        error: (error) => {
          this.snackbar.open(localized$('Unable to resend the invitation. Please try again later.'));
        },
      });
  }
}
