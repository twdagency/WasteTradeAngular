import { DecimalPipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  Input,
  OnInit,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { ListingImageType } from 'app/models';
import { OfferListingItem, OfferState } from 'app/models/offer';
import { ListingService } from 'app/services/listing.service';
import { OfferService } from 'app/services/offer.service';
import { scrollTop } from 'app/share/utils/common';
import { formatDecimalNumber, getCurrencySignal, getListingStatusColor, getListingTitle } from 'app/share/utils/offer';
import { OfferDetail } from 'app/types/requests/offer';
import moment from 'moment';
import { catchError, EMPTY, of, startWith, Subject, switchMap } from 'rxjs';
import { ConfirmModalComponent, ConfirmModalProps } from '../../confirm-modal/confirm-modal.component';
import { ProductDescriptionComponent } from '../../product-detail/product-description/product-description.component';
import { ProductImageComponent } from '../../product-detail/product-image/product-image.component';
import { SpinnerComponent } from '../../spinner/spinner.component';
import { OfferListingComponent } from '../offer-listing/offer-listing.component';

@Component({
  selector: 'app-received-offer-detail',
  imports: [
    ProductImageComponent,
    ProductDescriptionComponent,
    SpinnerComponent,
    OfferListingComponent,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    RouterModule,
    TranslateModule,
  ],
  providers: [DecimalPipe, TranslatePipe],
  templateUrl: './received-offer-detail.component.html',
  styleUrl: './received-offer-detail.component.scss',
})
export class ReceivedOfferDetailComponent implements OnInit {
  @Input({ required: true }) offerId: number | undefined;
  offer = signal<OfferDetail | undefined | null>(undefined);
  loadingListing = signal(false);
  page = signal(1);
  totalItems = signal(0);
  listingItems = signal<OfferListingItem[] | null>(null);
  updator = new Subject<void>();

  getListingTitle = getListingTitle;
  decimalPipe = inject(DecimalPipe);

  getBestOffer() {
    const offer = this.offer();

    if (!offer || !offer.listing?.bestOffer || !offer.listing.bestOfferCurrency) {
      return '-';
    }

    return `${getCurrencySignal(offer.listing.bestOfferCurrency)}${this.decimalPipe.transform(offer.listing.bestOffer ?? 0)}`;
  }

  galleryImages = computed(
    () =>
      this.offer()
        ?.listing.documents?.filter((d) => d.documentType === ListingImageType.GALLERY_IMAGE)
        .map((d) => d.documentUrl) ?? [],
  );

  offerDescription = computed(() => {
    const offer = this.offer();
    return [
      {
        label: localized$('Weight'),
        // icon: 'fitness_center',
        value: `${this.decimalPipe.transform(formatDecimalNumber((offer?.listing.materialWeightPerUnit ?? 0) * (offer?.listing.quantity ?? 0), 4))} MT`,
      },
      {
        label: localized$('Best Offer'),
        // icon: 'pages',
        value: this.getBestOffer(),
      },
      {
        label: localized$(`No. loads`),
        // icon: 'sell',
        value: this.decimalPipe.transform(offer?.listing?.quantity ?? 0),
      },
      {
        label: localized$('No. offers'),
        // icon: 'list_alt',
        value: this.decimalPipe.transform(offer?.listing?.numberOfOffers ?? 0),
      },
      {
        label: localized$('Remaining Loads'),
        // icon: 'hourglass_top',
        value: this.decimalPipe.transform(offer?.listing?.remainingQuantity),
      },
      {
        label: localized$('Status'),
        // icon: 'hourglass_top',
        color: offer?.listing.status ? getListingStatusColor(offer.listing.status as any) : 'transparent',
        class: 'fw-bold',
        value: offer?.listing.status,
      },
      // {
      //   label: 'Price per Load',
      //   icon: 'sell',
      //   value: '£250',
      // },
    ];
  });

  canRemove = computed(() => {
    return (this.listingItems() ?? []).every((i) => i.state !== OfferState.ACTIVE);
  });

  injector = inject(Injector);

  constructor(
    private router: Router,
    private offerService: OfferService,
    private listingService: ListingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslatePipe,
  ) {
    effect(async () => {
      const offer = this.offer();

      if (offer) {
        this.loadingListing.set(true);

        this.offerService.getSellingOffers({ page: this.page(), listingId: offer.listing.id }).subscribe({
          next: (res) => {
            const tableData = res.results.map((item) => this.mapOfferToTableItem(item));
            this.listingItems.set(tableData);
            this.totalItems.set(res.totalCount);
            this.loadingListing.set(false);
          },
          error: () => {
            this.loadingListing.set(false);
          },
        });
      }
    });
  }

  mapOfferToTableItem(offerDetail: OfferDetail): OfferListingItem {
    const { listing, offer, buyer } = offerDetail;

    return {
      id: offer.id,
      date: moment(offer.createdAt).format('DD/MM/YYYY'),
      buyerId: buyer.user.username,
      status: offer.status,
      state: offer.state as any,
      bidAmount: `${getCurrencySignal(offer.currency)}${this.decimalPipe.transform(offer.offeredPricePerUnit)}/MT`,
      totalPrice: `${getCurrencySignal(offer.currency)}${this.decimalPipe.transform(offer.offeredPricePerUnit * offer.quantity)}`,
      buyerStatus: buyer.company.status,
      listingId: listing.id,
      currency: offer.currency,
      value: offer.offeredPricePerUnit * offer.quantity,
    };
  }

  onPageChange(page: number) {
    this.page.set(page);
  }

  onRefresh() {
    this.updator.next();

    scrollTop();
  }

  ngOnInit(): void {
    this.setup();
  }

  setup() {
    if (!this.offerId) {
      return;
    }

    this.updator
      .pipe(
        startWith(0),
        switchMap(() => this.offerService.getOfferDetail(this.offerId!)),
        catchError((error) => {
          return of({ data: null });
        }),
      )
      .subscribe((res) => {
        this.offer.set(res.data);
      });
  }

  onRemove() {
    const listingId = this.offer()?.listing.id;
    if (!listingId) {
      return;
    }

    runInInjectionContext(this.injector, () => {
      this.dialog
        .open<ConfirmModalComponent, ConfirmModalProps>(ConfirmModalComponent, {
          maxWidth: '500px',
          width: '100%',
          panelClass: 'px-3',
          data: {
            title: localized$('Are you sure you want to remove this listing? This action cannot be undone.'),
          },
        })
        .afterClosed()
        .pipe(
          takeUntilDestroyed(),
          switchMap((shouldDelete) => {
            if (!shouldDelete) {
              return EMPTY;
            }

            return this.listingService.delete(listingId);
          }),
          catchError(() => {
            this.snackBar.open(
              this.translate.transform(localized$('Failed to remove the listing. Please try again later.')),
            );

            return EMPTY;
            // }
          }),
        )
        .subscribe(() => {
          this.snackBar.open(this.translate.transform(localized$('Your listing has been successfully removed.')));
          this.router.navigateByUrl(ROUTES_WITH_SLASH.myOffersSelling);
        });
    });
  }

  onBack() {
    this.router.navigateByUrl(ROUTES_WITH_SLASH.myOffersSelling);
  }
}
