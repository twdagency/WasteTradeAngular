import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MemberRowItem } from 'app/layout/company-member/members/types';
import { CompanyMemberService } from 'app/services/company-member.service';
import { ConfirmModalComponent, ConfirmModalProps } from 'app/share/ui/confirm-modal/confirm-modal.component';
import { CompanyUserRequestRoleEnum } from 'app/types/requests/company-user-request';
import { ManageRoleComponent } from '../manage-role/manage-role.component';
import { RemoveMemberComponent } from '../remove-member/remove-member.component';
import { RemoveMemberData } from '../remove-member/types';
import { ResendUserComponent } from '../resend-user/resend-user.component';

@Component({
  selector: 'app-members-row',
  imports: [TranslatePipe, TranslateModule, CommonModule, MatButtonModule, MatTooltipModule],
  templateUrl: './members-row.component.html',
  styleUrl: './members-row.component.scss',
})
export class MembersRowComponent {
  isHaulierCompany = input.required<boolean>();
  member = input.required<MemberRowItem>();
  members = input.required<MemberRowItem[]>();
  roleUpdated = output<void>();
  refresh = output<void>();
  private dialog = inject(MatDialog);
  private companyMemberService = inject(CompanyMemberService);
  private snackbar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslatePipe);

  isPending = computed(() => this.member().originalItem.status === 'pending');
  cantRemoveAdmin = computed(() => {
    const currentMember = this.member();
    const isCurrentMemberAdmin = currentMember.originalItem.companyRole === CompanyUserRequestRoleEnum.ADMIN;

    if (!isCurrentMemberAdmin) {
      return false;
    }

    const activeAdmins = this.members().filter(
      (member) =>
        member.originalItem.status === 'active' && member.originalItem.companyRole === CompanyUserRequestRoleEnum.ADMIN,
    );

    return !activeAdmins.length || (activeAdmins.length === 1 && activeAdmins[0].id === currentMember.id);
  });

  openResentModal(item: MemberRowItem) {
    const { originalItem } = item;

    const data = {
      email: originalItem.email,
      userId: item.id,
    };

    this.dialog.open(ResendUserComponent, {
      width: '960px',
      height: '268px',
      maxHeight: '268px',
      panelClass: 'resend-user-dialog',
      data,
    });
  }

  openManageModal() {
    const member = this.member();
    const originalItem = member.originalItem;

    const dialogRef = this.dialog.open(ManageRoleComponent, {
      width: '100%',
      maxWidth: '960px',
      panelClass: 'manage-user-dialog',
      data: {
        isHaulier: this.isHaulierCompany(),
        userId: originalItem?.id ?? member.id,
        currentRole: originalItem?.companyRole ?? member.formatRole,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.roleUpdated.emit();
      }
    });
  }

  openRemoveModal(item: MemberRowItem) {
    if (item.originalItem.status === 'pending') {
      this.openRemovePendingModal(item);
      return;
    }

    const data: RemoveMemberData = {
      item: item.originalItem,
      isHaulierCompany: this.isHaulierCompany(),
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
      if (result?.success) {
        this.refresh.emit();
      }
    });
  }

  openRemovePendingModal(item: MemberRowItem) {
    this.dialog
      .open<ConfirmModalComponent, ConfirmModalProps>(ConfirmModalComponent, {
        maxWidth: '500px',
        width: '100%',
        panelClass: 'px-3',
        data: {
          title: localized$('Are you sure you want to remove this pending user?'),
          cancelLabel: localized$('Cancel'),
          confirmLabel: localized$('Confirm'),
        },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((shouldRemove) => {
        if (!shouldRemove) {
          return;
        }

        this.companyMemberService
          .removePendingMember({
            userId: item.originalItem.id,
            companyId: item.originalItem.companyData.id,
          })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.snackbar.open(this.translate.transform(localized$('User removed.')));
              this.refresh.emit();
            },
            error: () => {
              this.snackbar.open(
                this.translate.transform(localized$('Unable to remove user from the company. Please try again later.')),
              );
            },
          });
      });
  }
}
