import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AdminLayoutComponent } from 'app/layout/admin-layout/admin-layout.component';
import { AdminProfileComponent } from 'app/routes/admin-profile/admin-profile.component';
import { AdminUserManagementService } from 'app/services/admin/admin-user-management.service';
import { AuthService } from 'app/services/auth.service';
import { AddAdminDialogComponent } from 'app/share/ui/admin/add-admin-dialog/add-admin-dialog.component';
import { DialogWrapperComponent } from 'app/share/ui/dialog-wrapper/dialog-wrapper.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { Role } from 'app/types/auth';
import { LoadItem } from 'app/types/requests/offer';
import moment from 'moment';
import { AdminStatusDialogComponent } from './admin-status-dialog/admin-status-dialog.component';

@Component({
  selector: 'app-admin-detail',
  imports: [
    AdminLayoutComponent,
    MatIcon,
    TranslateModule,
    AdminProfileComponent,
    CommonModule,
    SpinnerComponent,
    MatDialogModule,
  ],
  templateUrl: './admin-detail.component.html',
  styleUrl: './admin-detail.component.scss',
})
export class AdminDetailComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  adminService = inject(AdminUserManagementService);
  dialog = inject(MatDialog);
  snackbar = inject(MatSnackBar);
  loading = signal<boolean>(false);
  translate = inject(TranslatePipe);
  authService = inject(AuthService);

  adminData = signal<any>(null);
  originalAdminData = signal<LoadItem | null>(null);

  isSuperAdmin = computed(() => this.authService.user?.user?.globalRole === Role.SUPER_ADMIN);

  dialogRef!: MatDialogRef<any>;

  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  ngOnInit(): void {
    this.loadPage();
  }
  mapResponseItemToTableData(loadItem: LoadItem) {
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return '';
      return moment(dateStr).format('DD/MM/YYYY hh:mm');
    };

    return {
      id: loadItem.id,
      firstName: loadItem.firstName,
      lastName: loadItem.lastName,
      dateOfCreation: ` ${formatDate(loadItem.createdAt)}`,
      emailAddress: loadItem.email,
      role: loadItem.globalRole,
      status: loadItem.status,
      phone: loadItem.phoneNumber,
      lastLogin: `${formatDate(loadItem.lastLoginAt)}`,
    };
  }

  loadPage() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.loading.set(true);
    this.adminService.getAdminDetail(id).subscribe({
      next: (res) => {
        this.originalAdminData.set(res.data); // Store original data
        const data = this.mapResponseItemToTableData(res.data);
        this.adminData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('API Detail lỗi:', err);
        this.loading.set(false);
      },
    });
  }

  onBack() {
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.userManagement}`);
  }

  onEditProfile() {
    const originalUser = this.originalAdminData();

    if (originalUser) {
      this.dialog.open(DialogWrapperComponent, {
        maxWidth: '980px',
        height: '836px',
        maxHeight: '90vh',
        width: '100%',
        panelClass: 'add-admin-dialog-container',
        data: {
          component: AddAdminDialogComponent,
          childData: {
            isEditMode: true,
            adminData: {
              id: originalUser.id,
              firstName: originalUser.firstName,
              lastName: originalUser.lastName,
              email: originalUser.email,
              phoneNumber: originalUser.phoneNumber || '',
              globalRole: originalUser.globalRole,
            },
            onAdminAdded: () => {
              this.loadPage(); // Reload the admin detail page
            },
          },
        },
      });
    }
  }

  handleStatus() {
    const dialogRef = this.dialog.open(AdminStatusDialogComponent, {
      maxWidth: '1000px',
      data: { status: this.adminData()?.status },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.updateStatus();
    });
  }

  updateStatus() {
    const adminId = this.adminData()?.id;
    if (!adminId) return;

    const currentStatus = this.adminData()?.status;
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';

    this.adminService.updateAdminStatus(adminId, newStatus).subscribe({
      next: (res) => {
        this.adminData.update((prev) => ({
          ...prev,
          status: newStatus,
        }));

        const message =
          newStatus === 'archived'
            ? localized$('User archived.')
            : localized$('User unarchived. Original user credential are now valid.');

        this.snackbar.open(this.translate.transform(message));
      },
      error: (err) => {
        console.error('API error:', err);
        this.snackbar.open(
          this.translate.transform(
            localized$(
              'We couldn’t update the user status right now. Please try again. If the problem persists, contact support.',
            ),
          ),
        );
      },
    });
  }
}
