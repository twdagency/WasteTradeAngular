import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { mapCountryCodeToName } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { ListingMemberItem } from 'app/models/admin/commercial.model';
import { MapOnboardingStatusToColor, MapOnboardingStatusToLabel, MapUserStatusToColor } from 'app/share/utils/admin';
import { isNil } from 'lodash';
import { MapOverallStatusToLabel, MapRegistrationStatusToLabel } from './../../../../utils/admin';

@Component({
  selector: 'app-member-listing-item',
  imports: [MatButtonModule, TitleCasePipe, DatePipe, TranslateModule],
  templateUrl: './member-listing-item.component.html',
  styleUrl: './member-listing-item.component.scss',
  providers: [TranslatePipe],
})
export class MemberListingItemComponent {
  router = inject(Router);
  translate = inject(TranslatePipe);

  member = input<ListingMemberItem>();

  mapCountryCodeToName = mapCountryCodeToName;
  MapOverallStatusToLabel = MapOverallStatusToLabel;
  MapRegistrationStatusToLabel = MapRegistrationStatusToLabel;
  MapOnboardingStatusToLabel = MapOnboardingStatusToLabel;
  MapOnboardingStatusToColor = MapOnboardingStatusToColor;
  MapUserStatusToColor = MapUserStatusToColor as any;

  onViewDetail() {
    const userId = this.member()?.user.userId;
    if (isNil(userId)) {
      return;
    }

    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.adminMemberDetail}/${userId}`);
  }

  getCompanyType(type: string) {
    switch (type) {
      case 'seller':
        return localized$('SELLER');
      case 'buyer':
        return localized$('BUYER');
      case 'both':
        return localized$('DUAL');
      default:
        return localized$('SELLER');
    }
  }
}
