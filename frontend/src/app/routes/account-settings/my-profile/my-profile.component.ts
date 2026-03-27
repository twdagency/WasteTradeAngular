import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { User } from 'app/models';
import { AuthService } from 'app/services/auth.service';
import { EditProfileFormComponent } from './edit-profile-form/edit-profile-form.component';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
  imports: [MatButtonModule, MatIconModule, TitleCasePipe, TranslateModule],
})
export class MyProfileComponent {
  user: Signal<User | undefined | null>;

  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  authService = inject(AuthService);

  constructor() {
    this.user = toSignal(this.authService.user$);
  }

  userInitials = computed(() => {
    const userValue = this.user();
    if (userValue) {
      const firstName = userValue.user.firstName || '';
      const lastName = userValue.user.lastName || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return '';
  });

  onEditProfile() {
    const dataConfig: MatDialogConfig = {
      data: { userInfo: this.user() },
      width: '100%',
      maxWidth: '980px',
    };
    const dialogRef = this.dialog.open(EditProfileFormComponent, dataConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.checkToken().subscribe();
      }
    });
  }
}
