import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { IconComponent } from 'app/layout/common/icon/icon.component';
import { CompanyLocationDetail } from 'app/models';

@Component({
  selector: 'app-confirm-delete-location-modal',
  templateUrl: './confirm-delete-location-modal.component.html',
  styleUrls: ['./confirm-delete-location-modal.component.scss'],
  imports: [MatButtonModule, IconComponent, MatDialogModule],
})
export class ConfirmDeleteLocationModalComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ConfirmDeleteLocationModalComponent>);
  readonly data = inject<{ location: CompanyLocationDetail; index: number | null }>(MAT_DIALOG_DATA);

  ngOnInit(): void {}

  onOk() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
