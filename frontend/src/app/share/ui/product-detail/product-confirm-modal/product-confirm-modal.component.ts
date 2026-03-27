import { Component, inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmModalProps } from '../../confirm-modal/confirm-modal.component';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-product-confirm-modal',
  templateUrl: './product-confirm-modal.component.html',
  styleUrls: ['./product-confirm-modal.component.scss'],
  imports: [MatButtonModule, TranslateModule],
})
export class ProductConfirmModalComponent {
  @Input() title = 'Are you sure ?';

  readonly dialogRef = inject(MatDialogRef<ProductConfirmModalComponent>);
  readonly props = inject<ConfirmModalProps>(MAT_DIALOG_DATA);

  onOk() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
