import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { strictEmailValidator } from '@app/validators';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { CompanyMemberService } from 'app/services/company-member.service';
import { CompanyUserRequestRoleEnum } from 'app/types/requests/company-user-request';
import { finalize } from 'rxjs';
import { HAULIER_ROLE_OPTIONS, ROLE_OPTIONS } from '../listing/filter/constant';

export type InviteUserModalDialogData = {
  isHaulier: boolean;
};

@Component({
  selector: 'app-invite-user',
  imports: [
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    TranslatePipe,
    TranslateModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  templateUrl: './invite-user.component.html',
  styleUrl: './invite-user.component.scss',
})
export class InviteUserComponent {
  private snackbar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<InviteUserComponent>);
  private fb = inject(FormBuilder);
  private companyMemberService = inject(CompanyMemberService);
  private dialogData = inject<InviteUserModalDialogData>(MAT_DIALOG_DATA);

  submitting = signal(false);

  inviteForm = this.fb.group({
    email: ['', [Validators.required, Validators.maxLength(250), strictEmailValidator()]],
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    role: ['', [Validators.required]],
  });

  roles = this.dialogData.isHaulier ? HAULIER_ROLE_OPTIONS : ROLE_OPTIONS;

  submit() {
    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);

    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }

    const payload = this.inviteUserPayload();

    this.companyMemberService
      .inviteUser(payload)
      .pipe(
        finalize(() => {
          this.submitting.set(false);
        }),
      )
      .subscribe({
        next: (res) => {
          this.companyMemberService.notifyMemberTabRefresh();
          this.snackbar.open(localized$('User invitation sent successfully'), undefined, {
            duration: 3000,
          });
          this.dialogRef.close(res.data.invitation);
        },
        error: (error) => this.handleCreateError(error),
      });
  }

  handleClose() {
    this.dialogRef.close();
  }

  private getInviteUserErrorMessage(errorCode?: string): string {
    const errorMessageMap: Record<string, string> = {
      'cannot-invite-admin-to-company': localized$('You cannot invite an admin to the company.'),
      'user-already-belongs-to-other-company': localized$('This user already belongs to another company.'),
      'user-already-belongs-to-this-company': localized$('This user already belongs to this company.'),
      'an-invitation-has-been-sent-to-this-user': localized$('An invitation has already been sent to this user.'),
    };

    return (
      errorMessageMap[errorCode ?? ''] ??
      localized$("We couldn't invite this user right now. Please try again. If the problem persists, contact support.")
    );
  }

  private inviteUserPayload() {
    const { email, firstName, lastName, role } = this.inviteForm.value;

    return {
      email: email!,
      firstName: firstName!,
      lastName: lastName!,
      role: role as CompanyUserRequestRoleEnum,
    };
  }

  private handleCreateError(error: any) {
    console.error('Invite user failed', error);

    const errorCode = error?.error?.error?.message;
    const message = this.getInviteUserErrorMessage(errorCode);

    this.snackbar.open(message, undefined, { duration: 4000 });
  }
}
