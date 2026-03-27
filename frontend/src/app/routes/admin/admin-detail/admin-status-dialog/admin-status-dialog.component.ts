import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-status-dialog',
  imports: [TranslateModule, MatIcon],
  templateUrl: './admin-status-dialog.component.html',
  styleUrl: './admin-status-dialog.component.scss',
})
export class AdminStatusDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AdminStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { status: string },
  ) {}
}
