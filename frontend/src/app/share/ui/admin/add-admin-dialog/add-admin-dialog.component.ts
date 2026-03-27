import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AdminUserManagementService } from 'app/services/admin/admin-user-management.service';
import { AuthService } from 'app/services/auth.service';
import { TelephoneFormControlComponent } from 'app/share/ui/telephone-form-control/telephone-form-control.component';
import { strictEmailValidator } from 'app/share/validators/strict-email';
import { Role } from 'app/types/auth';

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  globalRole: string;
}

export interface AddAdminDialogData {
  onAdminAdded?: () => void;
  adminData?: AdminUser; // For edit mode
  isEditMode?: boolean;
}

@Component({
  selector: 'app-add-admin-dialog',
  templateUrl: './add-admin-dialog.component.html',
  styleUrls: ['./add-admin-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatButtonModule,
    TranslateModule,
    TelephoneFormControlComponent,
  ],
})
export class AddAdminDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AddAdminDialogComponent>);
  readonly data = inject<AddAdminDialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private adminService = inject(AdminUserManagementService);
  private authService = inject(AuthService);
  private snackbar = inject(MatSnackBar);
  private router = inject(Router);

  loading = signal(false);

  addAdminForm: FormGroup;
  roles = [
    { value: Role.SUPER_ADMIN, label: 'Super Admin' },
    { value: Role.ADMIN, label: 'Admin' },
    { value: Role.SALES_ADMIN, label: 'Sales Admin' },
  ];

  constructor() {
    this.addAdminForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, strictEmailValidator()]],
      phoneNumber: ['', [Validators.required]],
      globalRole: ['', [Validators.required]],
    });

    // If in edit mode, populate form with existing data
    if (this.data.isEditMode && this.data.adminData) {
      this.addAdminForm.patchValue({
        firstName: this.data.adminData.firstName,
        lastName: this.data.adminData.lastName,
        email: this.data.adminData.email,
        phoneNumber: this.data.adminData.phoneNumber,
        globalRole: this.data.adminData.globalRole,
      });

      // If user cannot modify role, disable the role field
      if (!this.canModifyRole) {
        this.addAdminForm.get('globalRole')?.disable();
      }
    }
  }

  get currentRole() {
    return this.authService.user?.user?.globalRole;
  }

  get isEditMode() {
    return this.data.isEditMode || false;
  }

  get canModifyRole() {
    // Only Super Admin can modify roles in edit mode
    if (this.isEditMode) {
      return this.currentRole === Role.SUPER_ADMIN;
    }
    // For add mode, use existing logic
    return true;
  }

  get availableRoles() {
    // Always show all roles, but disable Super Admin if current user is not Super Admin
    return this.roles;
  }

  isRoleDisabled = (role: Role) => {
    return this.currentRole !== Role.SUPER_ADMIN && role === Role.SUPER_ADMIN;
  };

  onCancel() {
    this.dialogRef.close(false);
  }

  onSave() {
    if (this.addAdminForm.invalid) {
      this.addAdminForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const formData = this.addAdminForm.getRawValue();

    if (this.isEditMode && this.data.adminData) {
      // Edit existing admin
      this.adminService.editAdmin(this.data.adminData.id, formData).subscribe({
        next: (response) => {
          this.loading.set(false);
          // Show success message for edit
          this.snackbar.open(localized$('Admin information updated.'));
          this.data.onAdminAdded?.();
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading.set(false);
          this.handleError(error, 'edit');
        },
      });
    } else {
      // Create new admin
      this.adminService.createAdmin(formData).subscribe({
        next: (response) => {
          const newAdminId = response.data.id;
          this.snackbar.open(localized$('Admin user created.'));
          this.router.navigateByUrl(`${ROUTES_WITH_SLASH.adminDetail}/${newAdminId}`);
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading.set(false);
          this.handleError(error, 'create');
        },
      });
    }
  }

  private handleError(error: any, operation: 'create' | 'edit') {
    console.error(`Failed to ${operation} admin user`, error);

    let defaultMessage: any = localized$(
      operation === 'create'
        ? "We couldn't create this user right now. Please try again. If the problem persists, contact support."
        : "We couldn't update this user right now. Please try again. If the problem persists, contact support.",
    );

    // Handle specific error cases
    if (error.error?.error?.message) {
      switch (error.error.error.message) {
        case 'email-admin-is-already-existed':
          defaultMessage = localized$('This email is already in use by another admin.');
          break;
        default:
          // Handle other errors
          break;
      }
    }

    this.snackbar.open(defaultMessage);
  }
}
