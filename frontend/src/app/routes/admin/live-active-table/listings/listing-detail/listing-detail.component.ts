import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { mapCountryCodeToName, materialTypes } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { ListingState, ListingStatus, SellListingDetail } from 'app/models';
import { AssignAdminDataType } from 'app/share/ui/admin/commercial/admin-member/assign-type/asign-type';
import { AssignAdminComponent } from 'app/share/ui/assign-admin/assign-admin.component';
import { LocationSummaryComponent } from 'app/share/ui/location-summary/location-summary.component';
import { NotesBtnComponent } from 'app/share/ui/notes/notes-btn/notes-btn.component';
import { AdminNoteDataType } from 'app/share/ui/notes/types/notes';
import { UserSummaryComponent } from 'app/share/ui/user-summary/user-summary.component';
import {
  getCurrencySignal,
  getListingStateColor,
  getListingStatusColor,
  getListingTitle,
  getOfferStateColor,
  getOfferStatusColor,
} from 'app/share/utils/offer';
@Component({
  selector: 'app-listing-detail',
  templateUrl: './listing-detail.component.html',
  styleUrls: ['./listing-detail.component.scss'],
  imports: [
    MatIconModule,
    MatButtonModule,
    DatePipe,
    TitleCasePipe,
    DecimalPipe,
    TranslateModule,
    LocationSummaryComponent,
    UserSummaryComponent,
    AssignAdminComponent,
    NotesBtnComponent,
  ],
})
export class ListingDetailComponent {
  mapCountryCodeToName = mapCountryCodeToName;
  materialTypes = materialTypes;
  getOfferStatusColor = getOfferStatusColor;
  getOfferStateColor = getOfferStateColor;
  getListingStatusColor = getListingStatusColor;
  getListingStateColor = getListingStateColor;
  getCurrencySignal = getCurrencySignal;
  getListingTitle = getListingTitle;
  readonly AdminNoteDataType = AdminNoteDataType;

  router = inject(Router);

  @Input() listing: SellListingDetail | undefined = undefined;
  @Input() dataType: AssignAdminDataType = AssignAdminDataType.LISTINGS;

  countryCodeToName(code: string | undefined | null): string {
    if (!code) {
      return '';
    }
    return this.mapCountryCodeToName[code];
  }

  getMaterialName(): string {
    if (!this.listing) return '';
    return getListingTitle({
      materialForm: this.listing.material_form,
      materialItem: this.listing.material_item,
      materialFinishing: this.listing.material_finishing,
      materialGrading: this.listing.material_grading,
      materialType: this.listing.material_type,
    });
  }

  getWeight(weight: number | undefined | null) {
    if (weight) {
      return weight * 1000;
    }
    return '';
  }

  onViewDetail() {
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.adminSaleListingDetail}/${this.listing!.id}`);
  }

  getListingStatusText(status?: ListingStatus | null): string {
    if (status == null) return '';

    switch (status) {
      case ListingStatus.AVAILABLE:
        return localized$('available');
      case ListingStatus.PENDING:
        return localized$('pending');
      case ListingStatus.SOLD:
        return localized$('sold');
      case ListingStatus.REJECTED:
        return localized$('rejected');
      default:
        return '';
    }
  }

  getListingStateText(status?: ListingState | null): string {
    if (status == null) return '';

    switch (status) {
      case ListingState.APPROVED:
        return localized$('approved');
      case ListingState.PENDING:
        return localized$('pending');
      case ListingState.REJECTED:
        return localized$('rejected');
      default:
        return '';
    }
  }

  viewUserDetail(userId: number | undefined) {
    if (!userId) {
      return;
    }
    window.open(`${ROUTES_WITH_SLASH.adminMemberDetail}/${userId}`, '_blank');
  }

  searchOffers() {
    this.router.navigate([ROUTES_WITH_SLASH.commercialManagement, 'buyers'], {
      queryParams: { listingId: this.listing?.id },
    });
  }
}
