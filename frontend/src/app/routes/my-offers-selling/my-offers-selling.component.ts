import { DecimalPipe } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { mapCountryCodeToName } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonLayoutComponent } from 'app/layout/common-layout/common-layout.component';
import { TableSellingOfferItem } from 'app/models/offer';
import { OfferService } from 'app/services/offer.service';
import { SeoService } from 'app/services/seo.service';
import { EmptyOfferButton, EmptyOfferComponent } from 'app/share/ui/my-offers/empty-offer/empty-offer.component';
import { SellingOfferTableComponent } from 'app/share/ui/my-offers/selling-offers/selling-offer-table/selling-offer-table.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { getCurrencySignal, getListingFeatureImage, getListingTitle } from 'app/share/utils/offer';
import { OfferDetail } from 'app/types/requests/offer';
import moment from 'moment';
import { startWith, Subject, switchMap, tap } from 'rxjs';
import { LIST_TAB_OFFER, MAP_OFFER_TYPE_TO_EMPTY_OFFER_PROP, OfferType } from './constants';

@Component({
  selector: 'app-my-offers-selling',
  imports: [
    SellingOfferTableComponent,
    MatTabsModule,
    SpinnerComponent,
    CommonLayoutComponent,
    EmptyOfferComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [OfferService, DecimalPipe, TranslatePipe],
  templateUrl: './my-offers-selling.component.html',
  styleUrl: './my-offers-selling.component.scss',
})
export class MyOffersSellingComponent implements OnInit {
  private seoService = inject(SeoService);
  private translatePipe = inject(TranslatePipe);
  listTabOffer = LIST_TAB_OFFER;
  listEmptyProps = signal<ReturnType<typeof MAP_OFFER_TYPE_TO_EMPTY_OFFER_PROP>>({} as any);

  updator = new Subject<void>();
  totalItems = signal(0);
  page = signal(1);
  fb = inject(FormBuilder);
  translate = inject(TranslateService);
  form: FormGroup = this.fb.group({
    searchTerm: [''],
  });

  items = signal<TableSellingOfferItem[] | null>(null);
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

      this.updator
        .pipe(
          startWith(null),
          tap(() => this.loading.set(true)),
          switchMap(() => {
            const searchTerm = this.form.get('searchTerm')?.value;
            return this.offerService.getSellingOffers({ page: this.page(), materialItem: searchTerm || undefined });
          }),
          tap(() => {
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

  onChangeKeyword(e: any) {
    const value = e.target.value.trim();
    if (!value) {
      this.updator.next();
    }
  }

  search() {
    this.updator.next();
  }

  mapOfferToTableItem(offerDetail: OfferDetail): TableSellingOfferItem {
    const { listing, offer, buyer } = offerDetail;

    return {
      id: offer.id,
      featureImage: getListingFeatureImage(listing.documents ?? []),
      date: moment(offer.createdAt).format('DD/MM/YYYY'),
      materialName: getListingTitle(listing),
      quantity: offer.quantity,
      currency: offer.currency ? getCurrencySignal(offer.currency) : '',
      country: mapCountryCodeToName[buyer?.location?.country],
      status: offer.status,
      bidAmount: `${this.decimal.transform(offer.offeredPricePerUnit)}/${localized$('MT')}`,
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
      title: this.translatePipe.transform(localized$('My Offers Selling')),
      description: this.translatePipe.transform(localized$('Dashboard My Sell Your Sell Bid')),
    });
    this.seoService.setNoIndex();
  }
}
