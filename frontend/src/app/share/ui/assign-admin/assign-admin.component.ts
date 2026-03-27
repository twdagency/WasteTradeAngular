import { AfterViewInit, Component, inject, Input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { AssignService } from '../admin/commercial/admin-member/assign-service/assign.service';
import { AssignAdmin, AssignAdminDataType } from '../admin/commercial/admin-member/assign-type/asign-type';

@Component({
  selector: 'app-assign-admin',
  templateUrl: './assign-admin.component.html',
  styleUrls: ['./assign-admin.component.scss'],
  imports: [MatFormFieldModule, MatSelectModule, TranslateModule, ReactiveFormsModule, MatTooltip],
})
export class AssignAdminComponent implements AfterViewInit {
  @Input() dataId!: number;
  @Input() dataType: AssignAdminDataType = AssignAdminDataType.USERS;
  @Input() assignAdmin?: AssignAdmin | null;

  private assignService = inject(AssignService);
  private snackbar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  readonly assignees = this.assignService.assignaleAdmins;
  readonly selectedValue = signal<number | null>(null);
  readonly hasError = signal(false);
  readonly submitting = signal(false);

  assigneeName = signal('');

  ngAfterViewInit(): void {
    const assignName = (() => {
      const assignedAdmin = this.assignAdmin?.assignedAdmin;
      if (!assignedAdmin) {
        return '';
      }

      return `${assignedAdmin.firstName} ${assignedAdmin.lastName}`;
    })();

    this.assigneeName.set(assignName);
  }

  onAssignChange(adminId: number | null) {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);

    this.hasError.set(false);

    this.assignService
      .assignAdmin({ dataId: this.dataId, dataType: this.dataType, assignedAdminId: adminId })
      .pipe(
        finalize(() => {
          this.submitting.set(false);
        }),
      )
      .subscribe({
        next: (res) => {
          if (!res) {
            this.assigneeName.set('');
          } else {
            const assignedAdmin = (this.assignees() ?? []).find((a) => a.id === adminId) || null;
            const name = assignedAdmin ? `${assignedAdmin.firstName} ${assignedAdmin.lastName}` : '';
            assignedAdmin && this.assigneeName.set(name);
          }

          this.snackbar.open(this.translate.instant(localized$('Assignee updated')));
          // Reset the select value to keep "Select" placeholder visible
          this.selectedValue.set(null);
        },
        error: (err) => {
          this.hasError.set(true);
          // Reset the select value on error too
          this.selectedValue.set(null);
        },
      });
  }
}
