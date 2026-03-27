import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { mapCodeToMaterialItem, mapCodeToPackaging, mapCountryCodeToName } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AdminLayoutComponent } from 'app/layout/admin-layout/admin-layout.component';
import { ListingImageType, ListingStatus, ListingType } from 'app/models';
import { DateFormatPipe } from 'app/pipes/date.pipe';
import { AdminListingService } from 'app/services/admin/admin-listing.service';
import { ListingDetailActionsComponent } from 'app/share/ui/admin/listing-detail-actions/listing-detail-actions.component';
import { LocationSummaryComponent } from 'app/share/ui/location-summary/location-summary.component';
import { ProductImageComponent } from 'app/share/ui/product-detail/product-image/product-image.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { UserSummaryComponent } from 'app/share/ui/user-summary/user-summary.component';
import {
  getCurrencyLabel,
  getCurrencySignal,
  getListingStateColor,
  getListingStatusColor,
  getListingTitle,
  getMaterialTypeLabel,
} from 'app/share/utils/offer';
import { catchError, EMPTY, map, startWith, Subject, switchMap, tap } from 'rxjs';
import { register, SwiperContainer } from 'swiper/element';

register();
@Component({
  selector: 'app-detail-wanted-listing',
  imports: [
    AdminLayoutComponent,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    SpinnerComponent,
    ListingDetailActionsComponent,
    TitleCasePipe,
    DecimalPipe,
    TranslateModule,
    DatePipe,
    UserSummaryComponent,
    LocationSummaryComponent,
  ],
  templateUrl: './detail-wanted-listing.component.html',
  styleUrl: './detail-wanted-listing.component.scss',
  providers: [AdminListingService, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DetailWantedListingComponent {
  activeRoute = inject(ActivatedRoute);
  router = inject(Router);
  adminListingService = inject(AdminListingService);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);
  listingId = this.activeRoute.snapshot.params['listingId'] as string;
  loadingListing = signal(true);
  listingDetailUpdator$ = new Subject<void>();

  mapCountryCodeToName = mapCountryCodeToName;
  getListingStateColor = getListingStateColor;
  getListingStatusColor = getListingStatusColor;
  getMaterialTypeLabel = getMaterialTypeLabel;
  mapCodeToMaterialItem = mapCodeToMaterialItem;
  mapCodeToPackaging = mapCodeToPackaging;
  getCurrencySignal = getCurrencySignal;
  getCurrencyLabel = getCurrencyLabel;

  images: string[] = [];
  featureImage: string = '';

  listingDetail = toSignal(
    this.listingDetailUpdator$.pipe(
      startWith(0),
      tap(() => this.loadingListing.set(true)),
      switchMap(() => this.adminListingService.getDetail(this.listingId)),
      map((res) => res.data),
      catchError((err) => {
        this.snackBar.open(this.translate.transform(localized$('Something went wrong.')));
        return EMPTY;
      }),
      tap((value) => {
        if (value.listing.listingType !== ListingType.WANTED) {
          this.router.navigateByUrl(ROUTES_WITH_SLASH.commercialManagement);
        }

        this.loadingListing.set(false);
      }),
      map((data) => {
        return {
          ...data,
          userInformation: {
            ...data?.userInformation,
            id: data.listing.createdByUserId,
          },
        };
      }),
      takeUntilDestroyed(),
    ),
  );

  storageDetails = computed(() => {
    if (!this.listingDetail()?.storageDetails) return;
    const { address } = this.listingDetail()!.storageDetails;
    return {
      id: this.listingDetail()?.storageDetails?.id,
      address: [
        address.addressLine,
        address.street,
        address.city,
        address.stateProvince,
        address.postcode,
        address.country,
      ].join(', '),
    };
  });

  constructor() {
    effect(() => {
      const documents = this.listingDetail()?.documents;
      if (!documents) return;

      this.featureImage = documents?.featureImage ?? '';
      this.images =
        documents?.all?.filter((i) => i.documentType === ListingImageType.GALLERY_IMAGE).map((d) => d.documentUrl) ??
        [];

      setTimeout(() => {
        this.initSwiper();
      }, 0);
    });
  }

  reloadListingDetail() {
    this.listingDetailUpdator$.next();
  }

  onBack() {
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.commercialManagement}/wanted`);
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

  viewLocationDetail(id: number | undefined) {
    if (!id) return;
  }

  getListingTitle(materialInformation: any) {
    return getListingTitle({ ...materialInformation, materialItem: materialInformation.materialName });
  }
  swiperEl: SwiperContainer | undefined = undefined;

  slideIndex = signal(0);
  @ViewChild('swiperContainer') swiperContainer: ElementRef | undefined;

  ngAfterViewInit() {
    this.swiperEl = this.swiperContainer?.nativeElement;
  }

  initSwiper() {
    const el = this.swiperContainer?.nativeElement;
    if (!el) return;

    this.swiperEl = el as SwiperContainer;

    if (this.swiperEl.swiper) {
      this.swiperEl.swiper.destroy(true, true);
    }

    const swiperParams = {
      navigation: true,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      on: {
        slideChange: (s: any) => {
          this.slideIndex.set(s.realIndex);
        },
      },
    };

    Object.assign(this.swiperEl, swiperParams);

    if (typeof this.swiperEl.initialize === 'function') {
      this.swiperEl.initialize();
    }
  }

  get fullSlideLength() {
    if (!this.swiperEl?.swiper?.slides?.length) {
      return 0;
    }

    return this.swiperEl.swiper.slides.length;
  }
}
