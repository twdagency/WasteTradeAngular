import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from 'app/layout/common/icon/icon.component';

@Component({
  selector: 'app-create-account-modal',
  templateUrl: './create-account-modal.component.html',
  styleUrls: ['./create-account-modal.component.scss'],
  imports: [MatDialogModule, MatButtonModule, IconComponent, TranslateModule],
})
export class CreateAccountModalComponent {
  constructor(private dialogRef: MatDialogRef<CreateAccountModalComponent>) {}

  registerAsBuyerSeller(): void {
    this.dialogRef.close('buyer-seller');
  }

  registerAsHaulier(): void {
    this.dialogRef.close('haulier');
  }
}
