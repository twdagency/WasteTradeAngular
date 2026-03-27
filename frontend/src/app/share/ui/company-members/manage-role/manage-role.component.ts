import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { CompanyMemberService } from 'app/services/company-member.service';
import { CompanyUserRequestRoleEnum } from 'app/types/requests/company-user-request';

type ManageRoleDialogData = {
  isHaulier: boolean;
  userId: number;
  currentRole: CompanyUserRequestRoleEnum;
};

@Component({
  selector: 'app-manage-role',
  imports: [MatIconModule, TranslatePipe, TranslateModule, MatRadioModule, FormsModule, MatButtonModule],
  templateUrl: './manage-role.component.html',
  styleUrl: './manage-role.component.scss',
})
export class ManageRoleComponent {
  private dialogRef = inject(MatDialogRef<ManageRoleComponent>);
  private dialogData = inject<ManageRoleDialogData>(MAT_DIALOG_DATA);
  private companyMemberService = inject(CompanyMemberService);

  readonly CompanyUserRequestRoleEnum = CompanyUserRequestRoleEnum;

  isHaulier = this.dialogData.isHaulier;
  userId = this.dialogData.userId;
  selectedRole = signal<CompanyUserRequestRoleEnum>(this.dialogData.currentRole);
  isLoading = signal(false);

  handleClose() {
    this.dialogRef.close();
  }

  handleSave() {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.companyMemberService.assignRole({ userId: this.userId, role: this.selectedRole() }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogRef.close({ success: true, role: this.selectedRole() });
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
