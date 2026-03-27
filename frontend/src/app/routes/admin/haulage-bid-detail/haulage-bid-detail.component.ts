import { DatePipe, DecimalPipe, NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  OnInit,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AdminLayoutComponent } from 'app/layout/admin-layout/admin-layout.component';
import { getStatusColor } from 'app/models/admin/haulage-bid.model';
import { Currency } from 'app/models/currency';
import {
  HaulageOfferStatus,
  HaulageRequestActionEnum,
  mapContainerCodeToName,
  TransportProviderMap,
} from 'app/models/haulage.model';
import { TruncateDecimalPipe } from 'app/pipes/truncate-decimal.pipe';
import { SiteDetailComponent } from 'app/routes/my-sites/site-detail/site-detail.component';
import { AdminHaulageService } from 'app/services/admin/admin-haulage.service';
import { AdminHaulageBidRejectModalComponent } from 'app/share/ui/admin/commercial/admin-haulage-bid-reject-modal/admin-haulage-bid-reject-modal.component';
import { AdminHaulageRequestInfoComponent } from 'app/share/ui/admin/commercial/admin-haulage-request-info/admin-haulage-request-info.component';
import { DialogWrapperComponent } from 'app/share/ui/dialog-wrapper/dialog-wrapper.component';
import { ProductConfirmModalComponent } from 'app/share/ui/product-detail/product-confirm-modal/product-confirm-modal.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { getListingTitle } from 'app/share/utils/offer';
import { HaulageLoad } from 'app/types/requests/admin';
import { catchError, EMPTY, finalize, startWith, Subject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-haulage-bid-detail',
  templateUrl: './haulage-bid-detail.component.html',
  styleUrls: ['./haulage-bid-detail.component.scss'],
  imports: [
    AdminLayoutComponent,
    TranslateModule,
    SpinnerComponent,
    MatIconModule,
    MatButtonModule,
    DatePipe,
    DecimalPipe,
    TitleCasePipe,
    NgTemplateOutlet,
    MatTooltipModule,
    TruncateDecimalPipe,
  ],
  providers: [TranslatePipe],
})
export class HaulageBidDetailComponent implements OnInit {
  loading = signal<boolean>(false);
  marking = signal<boolean>(false);
  submitting = signal<'accept' | 'reject' | 'request' | undefined>(undefined);

  getStatusColor = getStatusColor;
  getListingTitle = getListingTitle;
  mapContainerCodeToName = mapContainerCodeToName;
  transportProviderMap = TransportProviderMap;

  router = inject(Router);
  route = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);
  injector = inject(Injector);
  snackbar = inject(MatSnackBar);
  translate = inject(TranslatePipe);
  dialogService = inject(MatDialog);
  haulageService = inject(AdminHaulageService);

  updator = new Subject<void>();
  bidId = this.route.snapshot.params['bidId'];

  bid = toSignal(
    this.updator.pipe(
      startWith(null), // Trigger initial load
      tap(() => this.loading.set(true)),
      switchMap(() => this.haulageService.getDetail(this.bidId)),
      catchError((error) => {
        this.snackbar.open(
          this.translate.transform(localized$('Unable to load haulage offer details. Please try again.')),
        );
        return EMPTY;
      }),
      tap(() => this.loading.set(false)),
    ),
  );

  loads = signal<HaulageLoad[]>([]);
  loadsLoading = signal<boolean>(false);

  seller = computed(() => this.bid()?.seller);
  haulier = computed(() => this.bid()?.haulier);
  buyer = computed(() => this.bid()?.buyer);
  summary = computed(() => this.bid()?.summary);
  material = computed(() => this.bid()?.material);

  currency = computed(() => this.currencySymbol(this.summary()?.currency));

  canAction = computed(() => {
    return !(
      this.bid()?.status == HaulageOfferStatus.APPROVED ||
      this.bid()?.status == HaulageOfferStatus.REJECTED ||
      this.bid()?.status == HaulageOfferStatus.ACCEPTED ||
      this.bid()?.status == HaulageOfferStatus.PARTIALLY_SHIPPED ||
      this.bid()?.status == HaulageOfferStatus.SHIPPED
    );
  });

  showLoadDetails = computed(() => {
    return (
      this.bid()?.status == HaulageOfferStatus.APPROVED ||
      this.bid()?.status == HaulageOfferStatus.ACCEPTED ||
      this.bid()?.status == HaulageOfferStatus.PARTIALLY_SHIPPED ||
      this.bid()?.status == HaulageOfferStatus.SHIPPED
    );
  });

  constructor() {}

  ngOnInit() {
    this.loadLoads();
  }

  loadLoads() {
    this.loadsLoading.set(true);
    this.haulageService
      .getLoads(this.bidId)
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

  materialName() {
    if (!this.bid()) return;
    return getListingTitle({
      materialForm: this.material()?.form,
      materialType: this.material()?.type,
      materialFinishing: this.material()?.finishing,
      materialGrading: this.material()?.grading,
      materialItem: this.material()?.name,
    });
  }

  onBack() {
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.commercialManagement}/haulage-bid`);
  }

  onApprove = () => {
    const bidId = this.bid()?.haulageOfferId;
    if (!bidId || this.submitting()) {
      return;
    }

    this.submitting.set('accept');
    runInInjectionContext(this.injector, () => {
      this.haulageService
        .callAction(bidId, HaulageRequestActionEnum.APPROVE, {})
        .pipe(
          tap(() => {
            this.snackbar.open(this.translate.transform(localized$('The approval action was sent successfully.')));
            this.refresh();
          }),
          catchError(() => {
            this.snackbar.open(this.translate.transform(localized$('Failed to approve the bid. Please try again.')));
            return EMPTY;
          }),
          takeUntilDestroyed(),
          finalize(() => {
            this.submitting.set(undefined);
          }),
        )
        .subscribe();
    });
  };

  onReject = () => {
    const bidId = this.bid()?.haulageOfferId;
    if (!bidId || this.submitting()) {
      return;
    }

    this.submitting.set('reject');
    const dataConfig: MatDialogConfig = {
      width: '100%',
      maxWidth: '960px',
    };
    const dialogRef = this.dialogService.open(AdminHaulageBidRejectModalComponent, dataConfig);

    runInInjectionContext(this.injector, () => {
      dialogRef
        .afterClosed()
        .pipe(
          switchMap((params) => {
            if (!params) {
              return EMPTY;
            }

            return this.haulageService.callAction(bidId, HaulageRequestActionEnum.REJECT, params);
          }),
          tap(() => {
            this.refresh();
            this.snackbar.open(this.translate.transform(localized$('The rejection action was sent successfully.')));
          }),
          catchError(() => {
            this.snackbar.open(this.translate.transform(localized$('Failed to reject the bid. Please try again.')));
            return EMPTY;
          }),
          takeUntilDestroyed(),
          finalize(() => {
            this.submitting.set(undefined);
          }),
        )
        .subscribe();
    });
  };

  onRequestMoreInformation() {
    const bidId = this.bid()?.haulageOfferId;
    if (!bidId || this.submitting()) {
      return;
    }

    const dataConfig: MatDialogConfig = {
      width: '100%',
      maxWidth: '960px',
    };
    const dialogRef = this.dialogService.open(AdminHaulageRequestInfoComponent, dataConfig);

    runInInjectionContext(this.injector, () => {
      dialogRef
        .afterClosed()
        .pipe(
          switchMap((params) => {
            if (!params) {
              return EMPTY;
            }

            this.submitting.set('request');

            return this.haulageService.callAction(bidId, HaulageRequestActionEnum.REQUEST_INFORMATION, params);
          }),
          tap(() => {
            this.refresh();
            this.snackbar.open(
              this.translate.transform(localized$('The request information action was sent successfully.')),
            );
          }),
          catchError(() => {
            this.snackbar.open(
              this.translate.transform(localized$('Failed to request more information. Please try again.')),
            );
            return EMPTY;
          }),
          takeUntilDestroyed(),
          finalize(() => {
            this.submitting.set(undefined);
          }),
        )
        .subscribe();
    });
  }

  refresh() {
    this.updator.next();
    this.loadLoads();
  }

  markAsShipped(load: HaulageLoad) {
    const haulageOfferId = this.bid()?.haulageOfferId;
    if (!haulageOfferId) {
      return;
    }

    const dialogRef = this.dialogService.open(ProductConfirmModalComponent, {
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
        this.refresh();
      });
  }

  currencySymbol(currency: string | undefined) {
    if (!currency) return '';
    if (currency == Currency.eur) {
      return '€';
    }
    if (currency == Currency.usd) {
      return '$';
    }
    return '£';
  }

  openLocationDetail(type: 'seller' | 'buyer') {
    const locationId = type == 'seller' ? this.seller()?.locationId : this.buyer()?.locationId;
    if (!locationId) {
      return;
    }
    const dialogRef = this.dialogService.open(DialogWrapperComponent, {
      maxWidth: '980px',
      maxHeight: '85vh',
      width: '900px',
      autoFocus: false,
      data: {
        component: SiteDetailComponent,
        childData: {
          dialogMode: true,
          locationId: locationId,
        },
        wrapperData: {
          title: 'Location Detail',
        },
      },
    });
  }

  openUserDetail(userId: number | undefined) {
    if (!userId) {
      return;
    }
    window.open(`${ROUTES_WITH_SLASH.adminMemberDetail}/${userId}`, '_blank');
  }
}
