import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ManageRoleComponent } from 'app/share/ui/company-members/manage-role/manage-role.component';
import { RemoveMemberComponent } from 'app/share/ui/company-members/remove-member/remove-member.component';
import { RemoveMemberData } from 'app/share/ui/company-members/remove-member/types';
import { CompanyUserListItem } from 'app/types/requests/company-user-request';
import { TableRowItem } from '../../types/index.types';
@Component({
  selector: 'app-admin-members-row',
  imports: [TranslatePipe, TranslateModule, CommonModule],
  templateUrl: './admin-members-row.component.html',
  styleUrl: './admin-members-row.component.scss',
})
export class AdminMembersRowComponent {
  member = input.required<TableRowItem>();
  roleUpdated = output<void>();
  refresh = output<void>();
  dialog = inject(MatDialog);
  readonly companyId = input.required<number>();

  get isHaulierCompany() {
    return this.member().isHaulierCompany;
  }

  openManageRoleModal() {
    const member = this.member();

    const dialogRef = this.dialog.open(ManageRoleComponent, {
      width: '100%',
      maxWidth: '960px',
      panelClass: 'manage-user-dialog',
      data: {
        isHaulier: this.isHaulierCompany,
        userId: member.id,
        currentRole: member.originalRole,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.roleUpdated.emit();
      }
    });
  }

  openRemoveModal(item: TableRowItem) {
    const itemData: CompanyUserListItem = {
      ...item.originalData,
    };
    const data: RemoveMemberData = {
      isHaulierCompany: item.isHaulierCompany,
      companyId: this.companyId(),
      item: itemData,
    };

    const dialogRef = this.dialog.open(RemoveMemberComponent, {
      width: '100%',
      maxWidth: '960px',
      height: '582px',
      maxHeight: '582px',
      panelClass: 'remove-user-dialog',
      data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.success) {
        this.refresh.emit();
      }
    });
  }
}
