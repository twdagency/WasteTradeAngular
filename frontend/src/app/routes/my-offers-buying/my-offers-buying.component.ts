import { DecimalPipe } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { mapCodeToPackaging } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonLayoutComponent } from 'app/layout/common-layout/common-layout.component';
import { TableBuyingOfferItem } from 'app/models/offer';
import { OfferService } from 'app/services/offer.service';
import { SeoService } from 'app/services/seo.service';
import { BuyingOfferTableComponent } from 'app/share/ui/my-offers/buying-offers/buying-offer-table/buying-offer-table.component';
import { EmptyOfferButton, EmptyOfferComponent } from 'app/share/ui/my-offers/empty-offer/empty-offer.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { getListingFeatureImage, getListingTitle, getLocationAddress } from 'app/share/utils/offer';
import { OfferDetail } from 'app/types/requests/offer';
import { finalize } from 'rxjs';
import { LIST_TAB_OFFER, MAP_OFFER_TYPE_TO_EMPTY_OFFER_PROP, OfferType } from './constants';

@Component({
  selector: 'app-my-offers-buying',
  imports: [
    BuyingOfferTableComponent,
    MatTabsModule,
    SpinnerComponent,
    CommonLayoutComponent,
    EmptyOfferComponent,
    TranslateModule,
  ],
  providers: [OfferService, DecimalPipe, TranslatePipe],
  templateUrl: './my-offers-buying.component.html',
  styleUrl: './my-offers-buying.component.scss',
})
export class MyOffersBuyingComponent implements OnInit {
  private seoService = inject(SeoService);
  private translatePipe = inject(TranslatePipe);
  listTabOffer = LIST_TAB_OFFER;
  listEmptyProps = signal<ReturnType<typeof MAP_OFFER_TYPE_TO_EMPTY_OFFER_PROP>>({} as any);

  totalItems = signal(0);
  page = signal(1);

  items = signal<TableBuyingOfferItem[] | null>(null);
  loading = signal(false);
  activeTab = signal<number>(0);
  emptyProps = signal<
    | {
        title: string;
        content: string;
        buttons: EmptyOfferButton[];
      }
    | undefined
  >(undefined);
  translate = inject(TranslateService);

  constructor(
    private router: Router,
    private offerService: OfferService,
    private decimal: DecimalPipe,
  ) {
    this.listEmptyProps.set(MAP_OFFER_TYPE_TO_EMPTY_OFFER_PROP(this.router));
    this.initSeo();

    // effect to fetching data and update empty props when the tab change
    effect(async () => {
      const tabKey = this.getTabKey(this.activeTab());
      this.updateEmptyProps(tabKey);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      if (tabKey !== OfferType.Received) {
        this.items.set([]);
        return;
      }

      this.loading.set(true);
      this.offerService
        .getBuyingOffers({ page: this.page() })
        .pipe(
          finalize(() => {
            this.loading.set(false);
          }),
        )
        .subscribe((res) => {
          const tableData = res.results.map((item) => this.mapOfferToTableItem(item));
          this.items.set(tableData);
          this.totalItems.set(res.totalCount);
        });
    });
  }

  mapOfferToTableItem(offerDetail: OfferDetail): TableBuyingOfferItem {
    const { listing, offer, buyer, seller } = offerDetail;

    return {
      id: offer.id,
      featureImage: getListingFeatureImage(listing?.documents ?? []),
      materialName: getListingTitle(listing),
      pickupLocation: getLocationAddress(seller?.location),
      destination: getLocationAddress(buyer?.location),
      packaging: listing.materialPacking ? mapCodeToPackaging[listing?.materialPacking] : '',
      quantity: offer.quantity,
      weightPerLoad: this.decimal.transform(listing?.materialWeightPerUnit) ?? '',
      status: offer.status,
    };
  }

  onPageChange(page: number) {
    this.page.set(page);
  }

  // get the tab key by index
  getTabKey = (index: number) => {
    const currentTab = this.listTabOffer[index];
    return currentTab.key;
  };

  updateEmptyProps = (tabKey: OfferType) => {
    const emptyProps = this.listEmptyProps()?.[tabKey];
    emptyProps && this.emptyProps.set(emptyProps);
  };

  selectTab({ index }: MatTabChangeEvent) {
    this.activeTab.set(index);
    const tabKey = this.getTabKey(index);
    this.updateEmptyProps(tabKey);
  }

  ngOnInit() {}

  private initSeo() {
    this.seoService.updateMetaTags({
      title: this.translatePipe.transform(localized$('My Offers Buying')),
      description: this.translatePipe.transform(localized$('Dashboard Buy Your Bid')),
    });
    this.seoService.setNoIndex();
  }
}
