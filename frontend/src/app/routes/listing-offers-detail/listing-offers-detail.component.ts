import { Component, computed, DestroyRef, inject, Signal, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { mapCodeToPackaging, mapCountryCodeToName } from '@app/statics';
import { CommonLayoutComponent } from 'app/layout/common-layout/common-layout.component';
import { ListingImageType, ListingMaterial, ListingType, User } from 'app/models';
import { ListingMaterialDetail } from 'app/models/listing-material-detail.model';
import { ListingService } from 'app/services/listing.service';
import { MaterialActionComponent } from 'app/share/ui/product-detail/material-action/material-action.component';
import { MaterialOwnerComponent } from 'app/share/ui/product-detail/material-owner/material-owner.component';
import { ProductDescriptionComponent } from 'app/share/ui/product-detail/product-description/product-description.component';
import { ProductImageComponent } from 'app/share/ui/product-detail/product-image/product-image.component';
import { ShareListingComponent } from 'app/share/ui/product-detail/share-listing/share-listing.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { catchError, EMPTY, filter, finalize, forkJoin, map, of, switchMap, tap } from 'rxjs';

import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { GaEventName } from 'app/constants/ga-event';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { IconComponent } from 'app/layout/common/icon/icon.component';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { SeoService } from 'app/services/seo.service';
import { ProductExpiryComponent } from 'app/share/ui/listing/product-expiry/product-expiry.component';
import { ProductGridComponent } from 'app/share/ui/listing/product-grid/product-grid.component';
import { ProductStatusComponent } from 'app/share/ui/listing/product-status/product-status.component';
import { ReviewStatusComponent } from 'app/share/ui/product-detail/review-status/review-status.component';
import { getListingTitle, getMaterialTypeLabel } from 'app/share/utils/offer';

@Component({
  selector: 'app-listing-offers-detail',
  imports: [
    ProductImageComponent,
    ProductExpiryComponent,
    MaterialOwnerComponent,
    ProductDescriptionComponent,
    SpinnerComponent,
    MatButtonModule,
    CommonLayoutComponent,
    ShareListingComponent,
    MaterialActionComponent,
    IconComponent,
    ProductStatusComponent,
    ReviewStatusComponent,
    MatIconModule,
    RouterModule,
    ProductGridComponent,
    TranslateModule,
  ],
  providers: [DecimalPipe, TranslatePipe],
  templateUrl: './listing-offers-detail.component.html',
  styleUrl: './listing-offers-detail.component.scss',
})
export class ListingOffersDetailComponent {
  mapCountryCodeToName = mapCountryCodeToName;
  relateListing: ListingMaterial[] = [];

  listingService = inject(ListingService);
  snackBar = inject(MatSnackBar);
  router = inject(Router);
  route = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);
  auth = inject(AuthService);
  decimal = inject(DecimalPipe);
  translate = inject(TranslatePipe);
  seoService = inject(SeoService);
  analyticsService = inject(AnalyticsService);
  authService = inject(AuthService);

  offerId = signal<number | undefined>(undefined);
  listingDetail = signal<ListingMaterialDetail | undefined>(undefined);
  isSeller = computed(() => this.listingDetail()?.listing?.listingType === ListingType.SELL);
  loading = signal(false);
  loadingRelateListing = signal(false);
  userId = toSignal(this.auth.user$.pipe(map((user) => user?.userId)));
  isOwnListing = computed(() => this.userId() === this.listingDetail()?.listing.createdByUserId);

  getListingTitle = getListingTitle;

  images: string[] = [];
  featureImage: string = '';
  descriptionItems = computed(() => {
    const detail = this.listingDetail();

    if (detail?.listing?.listingType === ListingType.WANTED) {
      return [
        {
          label: this.translate.transform('Material Type'),
          icon: 'recycling',
          value: getMaterialTypeLabel(detail?.listing?.materialType ?? ''),
        },
        {
          label: this.translate.transform(localized$('Material Location')),
          icon: 'location_on',
          value: detail?.listing.country ? mapCountryCodeToName[detail?.listing.country] : '-',
        },
        {
          label: this.translate.transform(localized$(`Quantity`)),
          customIcon: '/assets/images/icons/dumbbell.svg',
          value: `${this.decimal.transform(detail?.listing.materialWeightWanted ?? 0)} ${this.translate.transform(localized$('MT'))}`,
        },
        {
          label: this.translate.transform(localized$(`Packaging`)),
          customIcon: '/assets/images/icons/cube.svg',
          value: `${detail?.listing?.materialPacking ? mapCodeToPackaging[detail?.listing?.materialPacking] : '-'}`,
        },
        {
          label: this.translate.transform(localized$(`Description`)),
          icon: 'article',
          value: `${detail?.listing?.additionalNotes ?? '-'}`,
        },
      ];
    }

    const country = detail?.locationDetails.address.country
      ? mapCountryCodeToName[detail.locationDetails.address.country]
      : '';

    return [
      {
        label: this.translate.transform(localized$('Material')),
        icon: 'recycling',
        value: getMaterialTypeLabel(detail?.listing?.materialType ?? ''),
      },
      {
        label: this.translate.transform(localized$('Quantity available')),
        icon: 'inventory_2',
        value:
          detail?.listing.totalWeight != null
            ? `${this.decimal.transform(detail.listing.totalWeight) ?? '-'} ${this.translate.transform(localized$('MT'))}`
            : '-',
      },
      {
        label: this.translate.transform(localized$(`No. of Loads`)),
        icon: 'view_module',
        value: this.decimal.transform(detail?.listing.quantity ?? 0),
      },
      {
        label: this.translate.transform(localized$('Remaining Loads')),
        icon: 'hourglass_top',
        value:
          detail?.listing.remainingQuantity != null
            ? `${this.decimal.transform(detail.listing.remainingQuantity ?? 0)} of ${this.decimal.transform(detail.listing.quantity ?? 0)}`
            : '',
      },
      {
        label: this.translate.transform(localized$('Average Weight per Load')),
        icon: 'fitness_center',
        value:
          detail?.listing.weightPerLoad != null && detail?.listing.weightPerLoad > 0
            ? `${detail?.listing.weightPerLoad} MT`
            : '-',
      },
      {
        label: this.translate.transform(localized$('Material Location')),
        icon: 'location_on',
        value: country,
      },
    ];
  });

  user: Signal<User | undefined | null>;

  constructor() {
    this.user = toSignal(this.authService.user$);

    this.route.paramMap
      .pipe(
        map((params) => params.get('offerId')),
        filter((id) => id !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((id) => {
        this.offerId.set(Number(id));
        this.setup().subscribe();
      });
  }

  setup() {
    this.loading.set(true);

    const getListingService$ = this.listingService
      .get({
        skip: 0,
        limit: 10,
        where: { listingType: this.listingDetail()?.listing.listingType },
      })
      .pipe(
        map((res) => res.results.filter((item) => item.id !== this.offerId()).slice(0, 4)),
        tap((res) => {
          this.relateListing = res;
        }),
        finalize(() => {
          this.loadingRelateListing.set(false);
        }),
      );

    const getDetail$ = this.listingService.getDetail(this.offerId()!).pipe(
      tap((res) => {
        this.listingDetail.set(res.data);
        this.analyticsService.trackEvent(GaEventName.VIEW_ITEM, {
          item: res?.data?.listing?.id,
        });
        this.featureImage =
          res.data.listing?.documents.find((i) => i.documentType === ListingImageType.FEATURE_IMAGE)?.documentUrl ?? '';
        this.images =
          res.data.listing?.documents
            .filter((i) => i.documentType === ListingImageType.GALLERY_IMAGE)
            .map((d) => d.documentUrl) ?? [];
      }),

      switchMap(() => {
        const imageUrl = this.featureImage || this.images[0];
        if (!imageUrl) {
          return of(null);
        }
        return this.seoService.getImageDimensions(imageUrl);
      }),

      tap((dimensions) => {
        const imageUrl = this.featureImage || this.images[0];
        this.seoService.updateMetaTags({
          title: getListingTitle(this.listingDetail()!.listing),
          description: '.',
          image: imageUrl,
          imageWidth: dimensions?.width?.toString(),
          imageHeight: dimensions?.height?.toString(),
        });
      }),

      catchError((err) => {
        this.snackBar.open(
          this.translate.transform(
            localized$(`${err.error?.error?.message || 'Failed to load details. Please refresh the page.'}`),
          ),
          this.translate.transform(localized$('OK')),
          {
            duration: 3000,
          },
        );
        return EMPTY;
      }),

      finalize(() => {
        this.loading.set(false);
      }),
      takeUntilDestroyed(this.destroyRef),
    );

    return forkJoin([getDetail$, getListingService$]);
  }

  refetch() {
    this.setup().subscribe();
  }

  onSelect(item: ListingMaterial) {
    this.analyticsService.trackEvent(GaEventName.SELECT_ITEM, {
      item_list_id: item?.id,
      item_list_name: getListingTitle(item),
      item: item.id,
    });
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.listingOfferDetail}/${item.id}`);
  }

  onBack() {
    const previousUrl = this.getPreviousUrl();
    if (previousUrl) {
      this.router.navigateByUrl(previousUrl);
      return;
    }

    this.router.navigateByUrl(this.getBackRoute());
  }

  private getPreviousUrl(): string | null {
    const queryParams = this.route.snapshot.queryParamMap;
    if (queryParams.get('fromWanted') === 'true') {
      return ROUTES_WITH_SLASH.wanted;
    }

    if (queryParams.get('fromSaleListings') === 'true') {
      return ROUTES_WITH_SLASH.saleListings;
    }

    if (queryParams.get('fromWantedListings') === 'true') {
      return ROUTES_WITH_SLASH.wantedListings;
    }

    const previousNavigationUrl = this.router.lastSuccessfulNavigation?.previousNavigation?.finalUrl?.toString();
    if (previousNavigationUrl && previousNavigationUrl !== this.router.url) {
      return previousNavigationUrl;
    }

    return ROUTES_WITH_SLASH.buy;
  }

  private getBackRoute() {
    const createdByUserId = this.listingDetail()?.listing.createdByUserId;
    const userId = this.user()?.userId;
    const listingType = this.listingDetail()?.listing.listingType;

    if (createdByUserId === userId && listingType === ListingType.SELL) {
      return ROUTES_WITH_SLASH.saleListings;
    }

    if (createdByUserId === userId && listingType === ListingType.WANTED) {
      return ROUTES_WITH_SLASH.wantedListings;
    }

    if (createdByUserId !== userId && listingType === ListingType.SELL) {
      return ROUTES_WITH_SLASH.buy;
    }

    return ROUTES_WITH_SLASH.wanted;
  }

  handleRenewListing(result: boolean) {
    if (result) {
      this.refetch();
    }
  }
}
