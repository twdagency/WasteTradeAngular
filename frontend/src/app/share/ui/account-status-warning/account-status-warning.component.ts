import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AuthService } from 'app/services/auth.service';
import { BannerType } from 'app/types/requests/auth';
import { addLanguagePrefix } from 'app/utils/language.utils';
import { filter, map, switchMap } from 'rxjs';
import { UploadDocumentsDialogComponent } from '../upload-documents-dialog/upload-documents-dialog.component';

@Component({
  selector: 'app-account-status-warning',
  imports: [MatIcon, RouterModule, TranslateModule],
  templateUrl: './account-status-warning.component.html',
  styleUrl: './account-status-warning.component.scss',
})
export class AccountStatusWarningComponent {
  authService = inject(AuthService);
  router = inject(Router);
  private dialog = inject(MatDialog);
  BannerType = BannerType;
  status = toSignal(
    this.authService.user$.pipe(
      filter((user) => !!user),
      switchMap(() => this.authService.getAccountStatus()),
      map((res) => res.data),
    ),
    {
      initialValue: undefined,
    },
  );

  documentDetails = computed(() => {
    return this.status()?.documentDetails;
  }, {});

  openCompanyInformation() {
    this.router.navigateByUrl(addLanguagePrefix('/company-information'));
  }

  onUpdateDocument() {
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.settings}?tabIndex=4`);
  }

  openUploadDocumentsDialog() {
    this.dialog.open(UploadDocumentsDialogComponent, {
      width: '100%',
      maxWidth: '560px',
      disableClose: true,
    });
  }
}
