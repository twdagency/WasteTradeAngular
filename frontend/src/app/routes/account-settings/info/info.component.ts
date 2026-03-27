import { TitleCasePipe } from '@angular/common';
import { Component, effect, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { mapCountryCodeToName } from '@app/statics';
import { TranslateModule } from '@ngx-translate/core';
import { Company, User } from 'app/models';
import { AuthService } from 'app/services/auth.service';
import { PermissionDisableDirective, PermissionTooltipDirective } from 'app/share/directives';
import { MAP_COMPANY_TYPE_TO_LABEL } from 'app/share/utils/account-setting';
import { EditBusinessAddressFormComponent } from './edit-business-address-form/edit-business-address-form.component';
import { EditCompanyInformationFormComponent } from './edit-company-information-form/edit-company-information-form.component';
import { EditSocialUrlFormComponent } from './edit-social-url-form/edit-social-url-form.component';
@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    TitleCasePipe,
    TranslateModule,
    PermissionTooltipDirective,
    PermissionDisableDirective,
  ],
})
export class InfoComponent {
  mapCountryCodeToName = mapCountryCodeToName;
  user: Signal<User | null | undefined>;

  company: Company | undefined = undefined;

  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  readonly MAP_COMPANY_TYPE_TO_LABEL = MAP_COMPANY_TYPE_TO_LABEL as any;

  constructor() {
    this.user = toSignal(this.authService.user$);
    effect(() => {
      if (this.user()?.company) {
        this.company = this.user()?.company;
      }
    });
  }

  openEditCompanyInfo() {
    const dataConfig: MatDialogConfig = {
      data: { companyInfo: this.company },
      width: '100%',
      maxWidth: '960px',
    };
    const dialogRef = this.dialog.open(EditCompanyInformationFormComponent, dataConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.checkToken().subscribe();
      }
    });
  }

  openEditBusinessAddress() {
    const dataConfig: MatDialogConfig = {
      data: { companyInfo: this.company },
      width: '100%',
      maxWidth: '960px',
    };
    const dialogRef = this.dialog.open(EditBusinessAddressFormComponent, dataConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.checkToken().subscribe();
      }
    });
  }

  openEditSocialUrl() {
    const { facebookUrl, instagramUrl, linkedinUrl, xUrl, additionalSocialMediaUrls } = this.company || {};

    const dataConfig: MatDialogConfig = {
      data: {
        urlInfo: { facebookUrl, instagramUrl, linkedinUrl, xUrl },
        additionalSocialMediaUrls,
        companyId: this.company?.id,
      },
      width: '100%',
      maxWidth: '960px',
    };
    const dialogRef = this.dialog.open(EditSocialUrlFormComponent, dataConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.checkToken().subscribe();
      }
    });
  }

  countryCodeToName(code: string | undefined): string {
    if (!code) {
      return '';
    }
    return this.mapCountryCodeToName[code];
  }

  safeUrl(url: string): SafeUrl {
    if (!url) return '';

    // Check if URL already has a protocol
    if (!url.match(/^https?:\/\//)) {
      url = `https://${url}`;
    }

    // Sanitize the URL
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
