import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { RequestToJoinModalComponent } from '../request-to-join-modal/request-to-join-modal.component';
import { CompanyLookupResult } from '../vat-number-lookup.component';

interface ExistingCompanyModalData {
  company: CompanyLookupResult;
  userData: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

@Component({
  selector: 'app-existing-company-found-modal',
  template: `
    <div class="wrapper">
      <div class="d-flex justify-content-between align-items-center mb-5">
        <h2 class="mb-0 fw-bold">Existing Company Found</h2>
        <button mat-icon-button class="common-modal-close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="mb-5">
        <p class="mb-0">
          This VAT Number exists on the WasteTrade platform as <strong>{{ data.company.name }}</strong
          >.
        </p>
        <p>Would you like to request to join this existing company?</p>

        <p class="mb-3">
          <strong>IF YES</strong>, you will receive a decision email after the company admin reviews your join request.
        </p>

        <p class="mb-0"><strong>IF NOT</strong>, you must enter a unique VAT Number to continue.</p>
      </div>

      <div class="d-flex gap-3 justify-content-between">
        <button mat-stroked-button color="primary" class="px-4 outlined-button cancel-btn" (click)="selectNo()">
          NO, USE A DIFFERENT VAT NUMBER
        </button>

        <button mat-flat-button color="primary" class="px-4 primary-btn submit-btn" (click)="selectYes()">
          YES, REQUEST TO JOIN
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./existing-company-found-modal.scss'],
  imports: [MatDialogModule, MatButtonModule, TranslateModule, MatIcon],
})
export class ExistingCompanyFoundModalComponent {
  private dialogRef = inject(MatDialogRef<ExistingCompanyFoundModalComponent>);
  data = inject<ExistingCompanyModalData>(MAT_DIALOG_DATA);
  private dialog = inject(MatDialog);
  requestModalCancel$ = new Subject<void>();

  selectNo(): void {
    this.dialogRef.close({ action: 'no' });
  }

  selectYes(): void {
    // Close this modal and open the request to join modal
    this.dialogRef.close({ action: 'yes' });

    // Open request to join modal with company and user data
    const requestModalRef = this.dialog.open(RequestToJoinModalComponent, {
      width: '100%',
      maxWidth: '960px',
      disableClose: true,
      data: {
        company: this.data.company,
        userData: this.data.userData,
      },
    });

    requestModalRef.afterClosed().subscribe((result) => {
      if (result?.action === 'cancel') {
        this.requestModalCancel$.next();
      }
    });
  }

  close(): void {
    this.dialogRef.close({ action: 'no' });
  }
}
