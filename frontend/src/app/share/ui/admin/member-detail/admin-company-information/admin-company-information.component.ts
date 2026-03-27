import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { mapCountryCodeToName } from '@app/statics';
import { TranslateModule } from '@ngx-translate/core';
import { MemberDetail } from 'app/models/admin/commercial.model';

@Component({
  selector: 'app-admin-company-information',
  imports: [TitleCasePipe, MatIconModule, MatSnackBarModule, TranslateModule],
  templateUrl: './admin-company-information.component.html',
  styleUrl: './admin-company-information.component.scss',
})
export class AdminCompanyInformationComponent {
  company = input<MemberDetail['company']>();
  mapCountryCodeToName = mapCountryCodeToName;

  dialog = inject(MatDialog);

  countryCodeToName(code: string | undefined): string {
    if (!code) {
      return '';
    }
    return this.mapCountryCodeToName[code];
  }

  location = computed(() => {
    const location = this.company() ?? ({} as any);
    const data = [
      location.addressLine1,
      location.city,
      location.country ? mapCountryCodeToName[location.country] : undefined,
    ].filter((i) => !!i);
    return data.join(', ');
  });
}
