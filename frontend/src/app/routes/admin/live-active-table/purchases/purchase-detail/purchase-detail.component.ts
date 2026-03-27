import { CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { mapCountryCodeToName, materialTypes } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { OfferState } from 'app/models/offer';
import { Purchase } from 'app/models/purchases.model';
import { AssignAdminDataType } from 'app/share/ui/admin/commercial/admin-member/assign-type/asign-type';
import { AssignAdminComponent } from 'app/share/ui/assign-admin/assign-admin.component';
import { LocationSummaryComponent } from 'app/share/ui/location-summary/location-summary.component';
import { NotesBtnComponent } from 'app/share/ui/notes/notes-btn/notes-btn.component';
import { AdminNoteDataType } from 'app/share/ui/notes/types/notes';
import { UserSummaryComponent } from 'app/share/ui/user-summary/user-summary.component';
import { getListingTitle, getOfferStateColor, getOfferStatusColor } from 'app/share/utils/offer';

@Component({
  selector: 'app-purchase-detail',
  templateUrl: './purchase-detail.component.html',
  styleUrls: ['./purchase-detail.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    TitleCasePipe,
    DatePipe,
    CurrencyPipe,
    TranslateModule,
    DecimalPipe,
    UserSummaryComponent,
    LocationSummaryComponent,
    AssignAdminComponent,
    NotesBtnComponent,
  ],
})
export class PurchaseDetailComponent implements OnInit {
  @Input() purchase: Purchase | undefined = undefined;
  router = inject(Router);
  readonly AdminNoteDataType = AdminNoteDataType;
  @Input() dataType: AssignAdminDataType = AssignAdminDataType.OFFERS;

  mapCountryCodeToName = mapCountryCodeToName;
  materialTypes = materialTypes;
  offerState = OfferState;
  getListingTitle = getListingTitle;

  getOfferStatusColor = getOfferStatusColor;
  getOfferStateColor = getOfferStateColor;

  constructor() {}

  ngOnInit() {}

  countryCodeToName(code: string | undefined | null): string {
    if (!code) {
      return '';
    }
    return this.mapCountryCodeToName[code];
  }

  getMaterialName(): string {
    if (!this.purchase?.listing) return '';
    return getListingTitle({
      materialForm: this.purchase.listing.materialForm,
      materialItem: this.purchase.listing.materialItem,
      materialFinishing: this.purchase.listing.materialFinishing,
      materialGrading: this.purchase.listing.materialGrading,
      materialType: this.purchase.listing.materialType,
    });
  }

  getPackingName(code?: string | null): string {
    if (!code) return '';
    return this.materialTypes.flatMap((type) => type.packing).find((packing) => packing.code == code)?.name ?? '';
  }

  onViewDetail() {
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.adminBuyerActivityDetail}/${this.purchase?.offer.id}`);
  }

  mapOfferStateToLabel(state: OfferState) {
    switch (state) {
      case this.offerState.ACTIVE:
        return localized$('Active');
      case this.offerState.CLOSED:
        return localized$('Closed');
      case this.offerState.PENDING:
        return localized$('Pending');
    }
  }

  openUserDetail(userId: number | undefined) {
    if (!userId) {
      return;
    }
    window.open(`${ROUTES_WITH_SLASH.adminMemberDetail}/${userId}`, '_blank');
  }

  viewMaterialDetail() {
    const materialId = this.purchase?.listing?.id;
    if (!materialId) {
      return;
    }
    window.open(`${ROUTES_WITH_SLASH.adminSaleListingDetail}/${materialId}`, '_blank');
  }

  onHaulageOffersClick() {
    const offerId = this.purchase?.offer?.id;
    if (!offerId || !this.purchase?.offer?.haulageOffersCount) {
      return;
    }
    // Navigate to haulage bids page with offerId filter
    this.router.navigate([`${ROUTES_WITH_SLASH.commercialManagement}/haulage-bid`], {
      queryParams: { offerId: offerId }
    });
  }

  onViewLoads() {
    const haulageOfferId = this.purchase?.offer?.acceptedHaulageOfferId;
    if (!haulageOfferId) {
      return;
    }
    // Navigate to haulage bid details page
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.adminHaulageBid}/${haulageOfferId}`);
  }
}
