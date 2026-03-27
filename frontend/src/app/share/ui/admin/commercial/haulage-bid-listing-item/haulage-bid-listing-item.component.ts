import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, Input, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { mapCountryCodeToName } from '@app/statics';
import { TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AssignAdminComponent } from 'app/share/ui/assign-admin/assign-admin.component';
import { NotesBtnComponent } from 'app/share/ui/notes/notes-btn/notes-btn.component';
import { AdminNoteDataType } from 'app/share/ui/notes/types/notes';
import {
  MapOnboardingStatusToColor,
  MapOnboardingStatusToLabel,
  MapOverallStatusToLabel,
  MapRegistrationStatusToLabel,
  MapUserStatusToColor,
} from 'app/share/utils/admin';
import { getListingTitle } from 'app/share/utils/offer';
import { AssignAdminDataType } from '../admin-member/assign-type/asign-type';

@Component({
  selector: 'app-haulage-bid-listing-item',
  templateUrl: './haulage-bid-listing-item.component.html',
  styleUrls: ['./haulage-bid-listing-item.component.scss'],
  imports: [TranslatePipe, DatePipe, MatButtonModule, DecimalPipe, AssignAdminComponent, NotesBtnComponent],
  providers: [TranslatePipe],
})
export class HaulageBidListingItemComponent {
  router = inject(Router);
  translate = inject(TranslatePipe);

  @Input() dataType: AssignAdminDataType = AssignAdminDataType.HAULAGE_OFFERS;
  readonly AdminNoteDataType = AdminNoteDataType;
  bid = input<any | null>(null);

  haulier = computed(() => {
    return this.bid()?.haulier;
  });
  listing = computed(() => {
    return this.bid()?.listing;
  });

  mapCountryCodeToName = mapCountryCodeToName;
  MapOverallStatusToLabel = MapOverallStatusToLabel;
  MapRegistrationStatusToLabel = MapRegistrationStatusToLabel;
  MapOnboardingStatusToLabel = MapOnboardingStatusToLabel;
  MapOnboardingStatusToColor = MapOnboardingStatusToColor;
  MapUserStatusToColor = MapUserStatusToColor as any;
  getListingTitle = getListingTitle;

  onViewDetail() {
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.adminHaulageBid}/${this.bid()?.haulageOfferId}`);
  }

  viewMaterialDetail() {
    const materialId = this.listing()?.id;
    if (!materialId) {
      return;
    }
    window.open(`${ROUTES_WITH_SLASH.adminSaleListingDetail}/${materialId}`, '_blank');
  }
}
