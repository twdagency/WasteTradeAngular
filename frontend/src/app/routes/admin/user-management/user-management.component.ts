import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { AdminLayoutComponent } from 'app/layout/admin-layout/admin-layout.component';
import { AdminUserManagementService } from 'app/services/admin/admin-user-management.service';
import { AddAdminDialogComponent } from 'app/share/ui/admin/add-admin-dialog/add-admin-dialog.component';
import { DialogWrapperComponent } from 'app/share/ui/dialog-wrapper/dialog-wrapper.component';
import { PaginationComponent } from 'app/share/ui/listing/pagination/pagination.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { UserRowComponent } from 'app/share/ui/user-row/user-row.component';
import { LoadItem } from 'app/types/requests/offer';
import moment from 'moment';
@Component({
  selector: 'app-user-management',
  imports: [
    PaginationComponent,
    AdminLayoutComponent,
    SpinnerComponent,
    TranslateModule,
    UserRowComponent,
    MatFormField,
    MatSelect,
    MatOption,
    MatIcon,
    CommonModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent {
  loading = signal<boolean>(false);
  page = signal(1);
  totalCount = signal(0);
  size = signal(20);
  displayItems = signal<any[]>([]);
  originalUserData = signal<LoadItem[]>([]);

  private dialog = inject(MatDialog);
  private userManagementService = inject(AdminUserManagementService);
  ngOnInit(): void {
    this.loadAdmin();
  }

  mapResponseItemToTableData(loadItem: LoadItem) {
    const formatDate = (dateStr: string) => moment(dateStr).format('DD/MM/YYYY');

    return {
      id: loadItem.id,
      firstName: loadItem.firstName,
      lastName: loadItem.lastName,
      dateOfCreation: ` ${formatDate(loadItem.createdAt)}`,
      emailAddress: loadItem.email,
      role: loadItem.globalRole,
      status: loadItem.status,
      phoneNumber: loadItem.phoneNumber, // Include phone number for edit
    };
  }

  loadAdmin(offset = 0, limit = this.size()) {
    this.loading.set(true);

    this.userManagementService.getAdmin(offset, limit).subscribe({
      next: (res) => {
        this.originalUserData.set(res.results || []); // Store original data
        const items = res.results.map((item) => this.mapResponseItemToTableData(item)) || [];
        this.displayItems.set(items);
        this.totalCount.set(res.totalCount || 0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('API call failed', err);
        this.loading.set(false);
      },
    });
  }
  onPageChange(newPage: number) {
    this.page.set(newPage);
    const offset = (newPage - 1) * this.size();
    this.loadAdmin(offset);
  }
  onPageSizeChange(newSize: number) {
    this.size.set(newSize);
    this.page.set(1);
    this.loadAdmin();
  }

  get startIndex(): number {
    return (this.page() - 1) * this.size() + 1;
  }

  get endIndex(): number {
    return Math.min(this.page() * this.size(), this.totalCount());
  }

  openAddAdminDialog() {
    this.dialog.open(DialogWrapperComponent, {
      maxWidth: '980px',
      height: '836px',
      maxHeight: '90vh',
      width: '100%',
      panelClass: 'add-admin-dialog-container',
      data: {
        component: AddAdminDialogComponent,
        childData: {
          onAdminAdded: () => {
            this.loadAdmin(); // Reload the admin list
          },
        },
      },
    });
  }
}
