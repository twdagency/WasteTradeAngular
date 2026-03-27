import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MemberDetail } from 'app/models/admin/commercial.model';

@Component({
  selector: 'app-admin-personal-information',
  imports: [TitleCasePipe, TranslateModule],
  templateUrl: './admin-personal-information.component.html',
  styleUrl: './admin-personal-information.component.scss',
})
export class AdminPersonalInformationComponent {
  userDetail = input<MemberDetail>();
  dialog = inject(MatDialog);

  compactName = computed(() => {
    const userValue = this.userDetail();
    if (!userValue) {
      return '';
    }

    const firstName = userValue.firstName || '';
    const lastName = userValue.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  });
}
