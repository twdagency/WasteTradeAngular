import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { AdminUserService } from 'app/services/admin/admin-user.service';

export interface ReviewMergeModalData {
  masterCompany: {
    id: number;
    name: string;
    vatNumber: string;
    country: string;
  };
  mergedCompany: {
    id: number;
    name: string;
    vatNumber: string;
    country: string;
  };
  masterChoice: 'target' | 'source';
}

export interface MergeResponse {
  status: string;
  message: string;
  data: {
    masterCompanyId: number;
    mergedCompanyId: number;
    movedCounts: {
      members: number;
      locations: number;
      documents: number;
      listings: number;
      offers: number;
      haulageOffers: number;
      sampleRequests: number;
      mfiRequests: number;
    };
  };
}

@Component({
  selector: 'app-review-merge-modal',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, TranslateModule],
  templateUrl: './review-merge-modal.component.html',
  styleUrl: './review-merge-modal.component.scss',
})
export class ReviewMergeModalComponent {
  private dialogRef = inject(MatDialogRef<ReviewMergeModalComponent>);
  private adminUserService = inject(AdminUserService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslatePipe);

  data: ReviewMergeModalData = inject(MAT_DIALOG_DATA);

  // State
  merging = signal(false);

  onConfirmMerge() {
    this.merging.set(true);

    const mergeRequest = {
      masterCompanyId: this.data.masterCompany.id,
      mergedCompanyId: this.data.mergedCompany.id,
    };

    this.adminUserService.mergeCompanies(mergeRequest).subscribe({
      next: (response: MergeResponse) => {
        this.merging.set(false);

        // Show success message
        this.snackBar.open(this.translate.transform(localized$('Companies merged successfully')));

        // Close modal with success result
        this.dialogRef.close({ success: true, result: response });
      },
      error: (error) => {
        this.merging.set(false);
        console.error('Merge failed:', error);

        // Show error message
        this.snackBar.open(this.translate.transform(localized$('Failed to merge companies. Please try again.')));

        // Close modal with error
        this.dialogRef.close({ success: false, error });
      },
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  handleClose() {
    this.dialogRef.close();
  }
}
