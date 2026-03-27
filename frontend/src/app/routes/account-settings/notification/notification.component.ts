import { Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { User } from 'app/models';
import { AuthService } from 'app/services/auth.service';
import { PermissionDisableDirective, PermissionTooltipDirective } from 'app/share/directives';
import { EditNotificationFormComponent } from './edit-notification-form/edit-notification-form.component';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    TranslateModule,
    PermissionTooltipDirective,
    PermissionDisableDirective,
  ],
})
export class NotificationComponent {
  user: Signal<User | null | undefined>;

  dialog = inject(MatDialog);
  authService = inject(AuthService);

  constructor() {
    this.user = toSignal(this.authService.user$);
  }

  onEditNotifications() {
    const dataConfig: MatDialogConfig = {
      data: { userInfo: this.user() },
      width: '100%',
      maxWidth: '980px',
    };
    const dialogRef = this.dialog.open(EditNotificationFormComponent, dataConfig);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.checkToken().subscribe();
      }
    });
  }
}
