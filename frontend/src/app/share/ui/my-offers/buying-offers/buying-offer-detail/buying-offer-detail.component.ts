import { DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { mapCountryCodeToName } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { ListingImageType } from 'app/models';
import { OfferStatus } from 'app/models/offer';
import { OfferService } from 'app/services/offer.service';
import { ProductDescriptionComponent } from 'app/share/ui/product-detail/product-description/product-description.component';
import { ProductImageComponent } from 'app/share/ui/product-detail/product-image/product-image.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { getListingTitle, getMaterialTypeLabel } from 'app/share/utils/offer';
import { map } from 'rxjs';
import { BidPendingComponent } from '../offer-detail-status/bid-pending/bid-pending.component';
import { BidRejectedComponent } from '../offer-detail-status/bid-rejected/bid-rejected.component';

@Component({
  selector: 'app-buying-offer-detail',
  imports: [
    ProductImageComponent,
    ProductDescriptionComponent,
    SpinnerComponent,
    MatIconModule,
    MatButtonModule,
    BidRejectedComponent,
    RouterModule,
    BidPendingComponent,
    TranslateModule,
  ],
  providers: [DecimalPipe],
  templateUrl: './buying-offer-detail.component.html',
  styleUrl: './buying-offer-detail.component.scss',
})
export class BuyingOfferDetailComponent {
  offerService = inject(OfferService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  OfferStatus = OfferStatus;
  decimal = inject(DecimalPipe);

  getListingTitle = getListingTitle;

  offerId = this.route.snapshot.params['offerId'];
  offer = toSignal(this.offerService.getOfferDetail(this.offerId!).pipe(map((res) => res.data)));
  offerStatus = computed(() => this.offer()?.offer.status);

  offerDescription = computed(() => {
    const offer = this.offer();
    if (!offer) {
      return [];
    }

    return [
      {
        label: localized$('Material'),
        icon: 'fitness_center',
        value: getMaterialTypeLabel(offer.listing.materialType),
      },
      {
        label: localized$('Average Weight per Load'),
        icon: 'pages',
        value: `${this.decimal.transform(offer.listing.materialWeightPerUnit)} MT`,
      },
      {
        label: localized$(`No. of Loads`),
        icon: 'sell',
        value: this.decimal.transform(offer.listing.quantity),
      },
      {
        label: localized$('Remaining Loads'),
        icon: 'hourglass_top',
        value: `${this.decimal.transform(offer.listing.remainingQuantity)} of ${this.decimal.transform(offer.listing.quantity)}`,
      },
      {
        label: localized$('Packaged'),
        icon: 'hourglass_top',
        value: offer.listing.materialPacking,
      },
      {
        label: localized$('Material Location'),
        icon: 'hourglass_top',
        value: mapCountryCodeToName[offer.offer.sellerCountry!],
      },
    ];
  });

  images = computed(() => {
    return (
      this.offer()
        ?.listing.documents?.filter((d) => d.documentType === ListingImageType.GALLERY_IMAGE)
        ?.map((d) => d.documentUrl) ?? []
    );
  });

  onBack() {
    this.router.navigateByUrl(ROUTES_WITH_SLASH.myOffersBuying);
  }
}
