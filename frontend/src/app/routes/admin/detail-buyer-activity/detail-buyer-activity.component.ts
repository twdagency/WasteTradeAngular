import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { mapCodeToMaterialItem, mapCodeToPackaging, mapCountryCodeToName } from '@app/statics';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { AdminLayoutComponent } from 'app/layout/admin-layout/admin-layout.component';
import { AdminOfferService } from 'app/services/admin/admin-offer.service';
import { OfferDetailActionsComponent } from 'app/share/ui/admin/offer-detail-actions/offer-detail-actions.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import {
  getCurrencyLabel,
  getCurrencySignal,
  getListingTitle,
  getOfferStateColor,
  getOfferStatusColor,
} from 'app/share/utils/offer';
import { catchError, EMPTY, map, startWith, Subject, switchMap, tap } from 'rxjs';

import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { ContainerTypeList, mapLocationContainerCodeToName } from 'app/models';
import { OfferState } from 'app/models/offer';
import { LocationSummaryComponent } from 'app/share/ui/location-summary/location-summary.component';
import { UserSummaryComponent } from 'app/share/ui/user-summary/user-summary.component';

@Component({
  selector: 'app-detail-buyer-activity',
  imports: [
    AdminLayoutComponent,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    SpinnerComponent,
    OfferDetailActionsComponent,
    TitleCasePipe,
    DecimalPipe,
    TranslateModule,
    DatePipe,
    UserSummaryComponent,
    LocationSummaryComponent,
  ],
  providers: [AdminOfferService, TranslatePipe],
  templateUrl: './detail-buyer-activity.component.html',
  styleUrl: './detail-buyer-activity.component.scss',
})
export class DetailBuyerActivityComponent {
  getOfferStatusColor = getOfferStatusColor;

  activeRoute = inject(ActivatedRoute);
  router = inject(Router);
  adminOfferService = inject(AdminOfferService);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);
  offerId = this.activeRoute.snapshot.params['offerId'] as string;
  loadingOffer = signal(true);
  offerDetailUpdator$ = new Subject<void>();
  getCurrencySignal = getCurrencySignal;
  getCurrencyLabel = getCurrencyLabel;
  getOfferStateColor = getOfferStateColor;
  mapCountryCodeToName = mapCountryCodeToName;
  mapLocationContainerCodeToName = mapLocationContainerCodeToName;
  mapCodeToMaterialItem = mapCodeToMaterialItem;
  mapCodeToMaterialPackaging = mapCodeToPackaging;
  getListingTitle = getListingTitle;
  containerList = ContainerTypeList;

  offerDetail = toSignal(
    this.offerDetailUpdator$.pipe(
      startWith(0),
      tap(() => this.loadingOffer.set(true)),
      switchMap(() => this.adminOfferService.getDetail(this.offerId)),
      map((res) => res.data),
      catchError((err) => {
        this.snackBar.open(this.translate.transform(localized$('Something went wrong.')));
        return EMPTY;
      }),
      tap(() => {
        this.loadingOffer.set(false);
      }),
      map((data) => {
        const sellerId = data?.offer?.sellerUserId ?? null;
        const buyerId = data?.offer?.buyerUserId ?? null;

        return {
          ...data,
          seller: {
            ...data?.seller,
            user: {
              ...data?.seller?.user,
              id: sellerId,
            },
          },
          buyer: {
            ...data?.buyer,
            user: {
              ...data?.buyer?.user,
              id: buyerId,
            },
          },
        };
      }),
      takeUntilDestroyed(),
    ),
  );

  sellerDetails = computed(() => {
    if (!this.offerDetail) return;
    return this.offerDetail()?.seller;
  });

  buyerDetails = computed(() => {
    if (!this.offerDetail) return;
    return this.offerDetail()?.buyer;
  });

  listingDetails = computed(() => {
    if (!this.offerDetail) return;
    return this.offerDetail()?.listing;
  });

  sellerContainerTypes = computed(() => {
    const containerType = this.sellerDetails()?.location?.containerType;
    return this.processContainerTypes(containerType);
  });

  buyerContainerTypes = computed(() => {
    const containerType = this.buyerDetails()?.location?.containerType;
    return this.processContainerTypes(containerType);
  });

  reloadOfferDetail() {
    this.offerDetailUpdator$.next();
  }

  onBack() {
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.commercialManagement}/buyers`);
  }

  onHaulageOffersClick() {
    const haulageOffersCount = this.offerDetail()?.offer?.haulageOffersCount;
    if (!haulageOffersCount) {
      return;
    }
    // Navigate to haulage bids page with offerId filter
    this.router.navigate([`${ROUTES_WITH_SLASH.commercialManagement}/haulage-bid`], {
      queryParams: { offerId: this.offerId },
    });
  }

  onViewLoads() {
    const haulageOfferId = this.offerDetail()?.offer?.acceptedHaulageOfferId;
    if (!haulageOfferId) {
      return;
    }
    // Navigate to haulage bid details page
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.adminHaulageBid}/${haulageOfferId}`);
  }

  mapOfferStateToLabel(state: OfferState) {
    switch (state) {
      case OfferState.ACTIVE:
        return localized$('Active');
      case OfferState.CLOSED:
        return localized$('Closed');
      case OfferState.PENDING:
        return localized$('Pending');
    }
  }

  openUserDetail(userId: number | undefined) {
    if (!userId) {
      return;
    }
    window.open(`${ROUTES_WITH_SLASH.adminMemberDetail}/${userId}`, '_blank');
  }

  private processContainerTypes(containerType: string[] | undefined): string[] {
    if (!containerType || containerType.length === 0) return ['-'];

    if (containerType.includes('all')) {
      return this.containerList.map((ct) => ct.name);
    }

    return containerType.map((ct) => this.mapLocationContainerCodeToName[ct] || ct);
  }
}
