import { DatePipe, DecimalPipe, NgTemplateOutlet, SlicePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { mapCodeToMaterialItem, mapCodeToPackaging, mapCountryCodeToName } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { HaulierLayoutComponent } from 'app/layout/haulier-layout/haulier-layout.component';
import { mapLocationContainerCodeToName } from 'app/models';
import { Currency } from 'app/models/currency';
import {
  HaulageOfferDetail,
  HaulageOfferStatus,
  mapContainerCodeToName,
  TransportProviderMap,
} from 'app/models/haulage.model';
import { AuthService } from 'app/services/auth.service';
import { HaulageService } from 'app/services/haulage.service';
import { OfferService } from 'app/services/offer.service';
import { DialogWrapperComponent } from 'app/share/ui/dialog-wrapper/dialog-wrapper.component';
import { HaulierOfferFormComponent } from 'app/share/ui/haulier/haulier-offer-form/haulier-offer-form.component';
import { ProductConfirmModalComponent } from 'app/share/ui/product-detail/product-confirm-modal/product-confirm-modal.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { getListingTitle } from 'app/share/utils/offer';
import { HaulageLoad } from 'app/types/requests/admin';
import { isNil } from 'lodash';
import { catchError, EMPTY, filter, finalize, map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-current-offer-details',
  templateUrl: './current-offer-details.component.html',
  styleUrls: ['./current-offer-details.component.scss'],
  imports: [
    HaulierLayoutComponent,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    SpinnerComponent,
    DatePipe,
    SlicePipe,
    TitleCasePipe,
    DecimalPipe,
    MatTooltipModule,
    NgTemplateOutlet,
  ],
  providers: [TranslatePipe, OfferService],
})
export class CurrentOfferDetailsComponent implements OnInit {
  mapCountryCodeToName = mapCountryCodeToName;
  transportProviderMap = TransportProviderMap;
  mapContainerCodeToName = mapContainerCodeToName;
  mapLocationContainerCodeToName = mapLocationContainerCodeToName;
  getListingTitle = getListingTitle;

  offerDetails = signal<HaulageOfferDetail | null>(null);
  haulageOfferId = signal<number | null>(null);
  loading = signal<boolean>(false);
  loadsLoading = signal<boolean>(false);
  loads = signal<HaulageLoad[]>([]);
  marking = signal<boolean>(false);

  buyer = computed(() => {
    if (!this.offerDetails) return;
    return this.offerDetails()?.buyer;
  });

  seller = computed(() => {
    if (!this.offerDetails) return;
    return this.offerDetails()?.seller;
  });

  currencySymbol = computed(() => {
    if (this.offerDetails()?.currency == Currency.eur) {
      return '€';
    }
    if (this.offerDetails()?.currency == Currency.usd) {
      return '$';
    }
    return '£';
  });

  isAcceptedOffer = computed(() => {
    const status = this.offerDetails()?.status;
    return (
      status === HaulageOfferStatus.APPROVED ||
      status === HaulageOfferStatus.PARTIALLY_SHIPPED ||
      status === HaulageOfferStatus.SHIPPED ||
      status === HaulageOfferStatus.ACCEPTED
    );
  });

  materialInfo = computed(() => {
    if (!this.offerDetails) return;
    const details = this.offerDetails()?.material;
    return {
      materialName: getListingTitle({
        materialForm: details?.form,
        materialType: details?.type,
        materialItem: details?.item,
        materialFinishing: details?.finishing,
        materialGrading: details?.grading,
      }),
      materialItem: mapCodeToMaterialItem[details?.item || ''],
      materialPackaging: mapCodeToPackaging[details?.packing || ''],
    };
  });

  HaulageOfferStatus = HaulageOfferStatus;

  router = inject(Router);
  route = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);
  haulageService = inject(HaulageService);
  translate = inject(TranslatePipe);
  snackBar = inject(MatSnackBar);
  offerService = inject(OfferService);
  dialog = inject(MatDialog);
  snackbar = inject(MatSnackBar);
  authService = inject(AuthService);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('offerId')),
        filter((id) => id !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((id) => {
        this.haulageOfferId.set(Number(id));
        this.setup();
      });
  }

  ngOnInit() {
    this.loadLoads();
  }

  getStatusColor(status: HaulageOfferStatus) {
    switch (status) {
      case HaulageOfferStatus.ACCEPTED:
      case HaulageOfferStatus.APPROVED:
      case HaulageOfferStatus.SHIPPED:
        return '#03985C'; // Green - success states
      case HaulageOfferStatus.REJECTED:
      case HaulageOfferStatus.WITHDRAWN:
        return '#D75A66'; // Red - rejected/cancelled states
      case HaulageOfferStatus.PENDING:
      case HaulageOfferStatus.INFORMATION_REQUESTED:
      case HaulageOfferStatus.OPEN_FOR_EDITS:
        return '#F9A52B'; // Orange - pending/action required states
      case HaulageOfferStatus.PARTIALLY_SHIPPED:
        return '#2196F3'; // Blue - in progress state
      default:
        return '#F9A52B'; // Default to orange
    }
  }

  mapCodeToStatus: Record<string, string> = {
    [HaulageOfferStatus.PENDING]: this.translate.transform(localized$('Pending')),
    [HaulageOfferStatus.APPROVED]: this.translate.transform(localized$('Approved')),
    [HaulageOfferStatus.ACCEPTED]: this.translate.transform(localized$('Accepted')),
    [HaulageOfferStatus.REJECTED]: this.translate.transform(localized$('Rejected')),
    [HaulageOfferStatus.WITHDRAWN]: this.translate.transform(localized$('Withdrawn')),
    [HaulageOfferStatus.INFORMATION_REQUESTED]: this.translate.transform(localized$('Information Requested')),
    [HaulageOfferStatus.OPEN_FOR_EDITS]: this.translate.transform(localized$('Open for Edits')),
    [HaulageOfferStatus.PARTIALLY_SHIPPED]: this.translate.transform(localized$('Partially Shipped')),
    [HaulageOfferStatus.SHIPPED]: this.translate.transform(localized$('Shipped')),
  };

  onBack() {
    this.router.navigateByUrl(ROUTES_WITH_SLASH.currentOffers);
  }

  edit() {
    const dialogRef = this.dialog.open(DialogWrapperComponent, {
      maxWidth: '960px',
      maxHeight: '85vh',
      data: {
        component: HaulierOfferFormComponent,
        childData: {
          dialogMode: true,
          offerDetail: this.offerDetails(),
        },
        wrapperData: {
          useCloseConfirm: true,
        },
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.setup();
        }
      });
  }

  withdrawOffer() {
    const haulageOfferId = this.haulageOfferId();
    if (isNil(haulageOfferId)) {
      return;
    }

    this.loading.set(true);
    this.haulageService
      .withdrawOffer(haulageOfferId)
      .pipe(
        catchError((err) => {
          this.snackBar.open(
            this.translate.transform(localized$(`We couldn’t withdraw the offer. Please refresh and try again.`)),
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
      )
      .subscribe((res: any) => {
        if (res?.status === 'success') {
          this.snackBar.open(
            this.translate.transform(localized$(`The offer has been successfully withdrawn.`)),
            this.translate.transform(localized$('OK')),
            {
              duration: 3000,
            },
          );

          this.setup();
        }
      });
  }

  loadLoads() {
    this.loadsLoading.set(true);
    this.haulageService
      .getLoads(this.haulageOfferId()!)
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        finalize(() => this.loadsLoading.set(false)),
      )
      .subscribe((data) => {
        this.loads.set(data);
      });
  }

  setup() {
    const haulageOfferId = this.haulageOfferId();
    if (isNil(haulageOfferId)) {
      return;
    }

    this.loading.set(true);

    this.haulageService
      .getOfferDetails(haulageOfferId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),

        tap((res) => {
          this.offerDetails.set(res);
        }),

        catchError((err) => {
          this.snackBar.open(
            this.translate.transform(
              localized$(`We couldn’t load the load details page. Please refresh and try again.`),
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
      )
      .subscribe();
  }

  markAsShipped(load: HaulageLoad) {
    const haulageOfferId = this.haulageOfferId();
    if (!haulageOfferId) {
      return;
    }

    const dialogRef = this.dialog.open(ProductConfirmModalComponent, {
      maxWidth: '960px',
      width: '100%',
      panelClass: 'px-3',
      data: {
        title: this.translate.transform(
          localized$(
            'Are you sure this load has been shipped and all relevant documentation is in order? This cannot be undone.',
          ),
        ),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((mark) => {
          if (!mark) {
            return EMPTY;
          }
          this.marking.set(true);

          return this.haulageService.markAsShipped(haulageOfferId, load.id!);
        }),
        catchError(() => {
          this.snackbar.open(
            this.translate.transform(
              localized$(
                'We couldn’t update the shipping status right now. Please try again. If the problem persists, contact support.',
              ),
            ),
          );

          return EMPTY;
        }),
        finalize(() => this.marking.set(false)),
      )
      .subscribe(() => {
        this.snackbar.open(this.translate.transform(localized$('Load marked as shipped successfully.')));
        this.setup();
      });
  }
}
