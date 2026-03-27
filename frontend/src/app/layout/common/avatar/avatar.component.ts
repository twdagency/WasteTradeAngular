import { Component, EnvironmentInjector, inject, Input, runInInjectionContext, Signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule } from '@ngx-translate/core';
import { MapRoleToName } from 'app/constants/mapping';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AuthService } from 'app/services/auth.service';
import { resolveAccountType } from 'app/share/utils/account-type';
import { ConfirmModalComponent, ConfirmModalProps } from 'app/share/ui/confirm-modal/confirm-modal.component';
import { Role } from 'app/types/auth';
import { map } from 'rxjs';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-avatar',
  imports: [MatMenuModule, RouterModule, IconComponent, MatIconModule, MatDialogModule, TranslateModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  @Input() isHaulier: boolean = false;

  compactUserName: Signal<string>;
  userName: Signal<string>;

  routes = ROUTES_WITH_SLASH;
  dialog = inject(MatDialog);
  router = inject(Router);
  private injector = inject(EnvironmentInjector);
  private authService = inject(AuthService);
  userRole = toSignal(
    this.authService.user$.pipe(
      map((user) => {
        if (!user) return '';
        if ([Role.ADMIN, Role.SALES_ADMIN, Role.SUPER_ADMIN].includes(user?.user?.globalRole))
          return MapRoleToName[user?.user?.globalRole];
        return resolveAccountType(user.companyRole, user.company, 'titleCase');
      }),
    ),
    { initialValue: '' },
  );

  constructor() {
    this.compactUserName = toSignal(
      this.authService.user$.pipe(map((user) => (user ? `${user.user.firstName[0]} ${user.user.lastName[0]}` : ''))),
      {
        initialValue: '',
      },
    );

    this.userName = toSignal(
      this.authService.user$.pipe(map((user) => (user ? `${user.user.firstName} ${user.user.lastName}` : ''))),
      {
        initialValue: '',
      },
    );
  }

  onLogout() {
    runInInjectionContext(this.injector, () => {
      this.dialog
        .open<ConfirmModalComponent, ConfirmModalProps>(ConfirmModalComponent, {
          maxWidth: '500px',
          width: '100%',
          panelClass: 'px-3',
          data: {
            title: localized$('Are you sure you want to log out?'),
          },
        })
        .afterClosed()
        .pipe(takeUntilDestroyed())
        .subscribe((shouldLogout) => {
          if (shouldLogout) {
            this.router.navigateByUrl(ROUTES_WITH_SLASH.logout);
          }
        });
    });
  }

}
