import { DatePipe } from '@angular/common';
import { Component, computed, Input, input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AssignAdminComponent } from 'app/share/ui/assign-admin/assign-admin.component';
import { NotesBtnComponent } from 'app/share/ui/notes/notes-btn/notes-btn.component';
import { AdminNoteDataType } from 'app/share/ui/notes/types/notes';
import { SampleRequestItem } from 'app/types/requests/admin';
import { mapCountryCodeToName } from '@app/statics';
import { AssignAdminDataType } from '../admin-member/assign-type/asign-type';

@Component({
  selector: 'app-samples-listing-item',
  templateUrl: './samples-listing-item.component.html',
  styleUrls: ['./samples-listing-item.component.scss'],
  imports: [
    TranslateModule,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    AssignAdminComponent,
    NotesBtnComponent,
    MatTooltipModule,
  ],
})
export class SamplesListingItemComponent implements OnInit {
  item = input<SampleRequestItem>();
  @Input() dataType: AssignAdminDataType = AssignAdminDataType.SAMPLES;
  readonly AdminNoteDataType = AdminNoteDataType;
  mapCountryCodeToName = mapCountryCodeToName;

  // use company location instead of user location until we have real data
  location = computed(() => {
    return {
      buyer: [this.item()?.buyerCompany?.addressLine1, this.item()?.buyerCompany?.city].join(', '),
      seller: [this.item()?.sellerCompany?.addressLine1, this.item()?.sellerCompany?.city].join(', '),
    };
  });

  constructor() {}

  ngOnInit() {}

  viewUserDetails(id: number | undefined) {
    const userId = id;
    if (!userId) {
      return;
    }
    window.open(`${ROUTES_WITH_SLASH.adminMemberDetail}/${userId}`, '_blank');
  }

  viewMaterialDetail() {
    const materialId = this.item()?.listingId;
    if (!materialId) {
      return;
    }
    if (this.item()?.listing.listingType === 'sell') {
      window.open(`${ROUTES_WITH_SLASH.adminSaleListingDetail}/${materialId}`, '_blank');
    } else {
      window.open(`${ROUTES_WITH_SLASH.adminWantedListingDetail}/${materialId}`, '_blank');
    }
  }
}
