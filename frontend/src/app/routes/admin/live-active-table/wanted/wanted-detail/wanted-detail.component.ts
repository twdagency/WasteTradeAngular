import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { mapCountryCodeToName, materialTypes } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { ListingStatus } from 'app/models';
import { WantedListingDetail } from 'app/models/wanted.model';
import { AssignAdminDataType } from 'app/share/ui/admin/commercial/admin-member/assign-type/asign-type';
import { AssignAdminComponent } from 'app/share/ui/assign-admin/assign-admin.component';
import { LocationSummaryComponent } from 'app/share/ui/location-summary/location-summary.component';
import { NotesBtnComponent } from 'app/share/ui/notes/notes-btn/notes-btn.component';
import { AdminNoteDataType } from 'app/share/ui/notes/types/notes';
import { UserSummaryComponent } from 'app/share/ui/user-summary/user-summary.component';
import { getListingStateColor, getListingStatusColor } from 'app/share/utils/offer';
import { getListingTitle } from './../../../../../share/utils/offer';

@Component({
  selector: 'app-wanted-detail',
  templateUrl: './wanted-detail.component.html',
  styleUrls: ['./wanted-detail.component.scss'],
  imports: [
    DatePipe,
    TitleCasePipe,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
    DecimalPipe,
    UserSummaryComponent,
    LocationSummaryComponent,
    AssignAdminComponent,
    NotesBtnComponent,
  ],
})
export class WantedDetailComponent implements OnInit {
  @Input() wanted: WantedListingDetail | undefined = undefined;
  mapCountryCodeToName = mapCountryCodeToName;
  materialTypes = materialTypes;
  getListingStateColor = getListingStateColor;
  getListingStatusColor = getListingStatusColor;
  getListingTitle = getListingTitle;

  @Input() dataType: AssignAdminDataType = AssignAdminDataType.LISTINGS;
  readonly AdminNoteDataType = AdminNoteDataType;

  router = inject(Router);

  constructor() {}

  ngOnInit() {}

  countryCodeToName(code: string | undefined | null): string {
    if (!code) {
      return '';
    }
    return this.mapCountryCodeToName[code];
  }

  getPackingName(code?: string | null): string {
    if (!code) return '';
    return this.materialTypes.flatMap((type) => type.packing).find((packing) => packing.code == code)?.name ?? '';
  }

  getMaterialName(code?: string | null): string {
    if (!code) return '';
    return getListingTitle({
      materialForm: this.wanted?.material_form,
      materialItem: this.wanted?.material_item,
      materialFinishing: this.wanted?.material_finishing,
      materialGrading: this.wanted?.material_grading,
      materialType: this.wanted?.material_type,
    });
  }

  onViewDetail() {
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.adminWantedListingDetail}/${this.wanted!.id}`);
  }

  mappingListingStatus(status?: ListingStatus) {
    switch (status) {
      case ListingStatus.SOLD:
        return localized$('Fulfilled');
      case ListingStatus.AVAILABLE:
        return localized$('available');
      case ListingStatus.PENDING:
        return localized$('pending');
      case ListingStatus.REJECTED:
        return localized$('rejected');
      case ListingStatus.EXPIRED:
        return localized$('Expired');
      default:
        return status;
    }
  }

  openUserDetail(userId: number | undefined) {
    if (!userId) {
      return;
    }
    window.open(`${ROUTES_WITH_SLASH.adminMemberDetail}/${userId}`, '_blank');
  }
}
