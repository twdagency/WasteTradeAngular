import { Component, computed, Input, signal } from '@angular/core';
import { mapCountryCodeToName } from '@app/statics';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from 'app/layout/common/icon/icon.component';
import { ListingType } from 'app/models';
import { ListingMaterialDetail } from 'app/models/listing-material-detail.model';
import moment from 'moment';

@Component({
  selector: 'app-material-owner',
  imports: [IconComponent, TranslateModule],
  templateUrl: './material-owner.component.html',
  styleUrl: './material-owner.component.scss',
})
export class MaterialOwnerComponent {
  listingDetail$ = signal<ListingMaterialDetail | undefined>(undefined);
  @Input({ required: true }) set listingDetail(val: ListingMaterialDetail | undefined) {
    this.listingDetail$.set(val);
  }

  company = computed(() => this.listingDetail$()?.company);
  location = computed(() => this.listingDetail$()?.locationDetails?.address.country);
  username = computed(() => {
    const listingDetail = this.listingDetail$();
    if (listingDetail?.listing?.listingType === ListingType.SELL) {
      return listingDetail.createdBy?.user?.username;
    }

    return listingDetail?.buyerDetails?.contactPerson?.username;
  });
  listing = computed(() => this.listingDetail$()?.listing);
  isSeller = computed(() => this.listing()?.listingType === ListingType.SELL);

  mapCountryCodeToName = mapCountryCodeToName;

  formatListedOn(time: string) {
    return moment(time).format('DD/MM/YYYY');
  }
}
