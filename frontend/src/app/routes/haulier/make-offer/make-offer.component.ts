import { DatePipe, DecimalPipe, SlicePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, OnInit, Signal, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { mapCodeToMaterialItem, mapCodeToPackaging, mapCountryCodeToName } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { HaulierLayoutComponent } from 'app/layout/haulier-layout/haulier-layout.component';
import { mapLocationContainerCodeToName, User } from 'app/models';
import { Currency } from 'app/models/currency';
import { HaulageOfferLoadItem } from 'app/models/haulage.model';
import { AuthService } from 'app/services/auth.service';
import { HaulageService } from 'app/services/haulage.service';
import { OfferService } from 'app/services/offer.service';
import { SeoService } from 'app/services/seo.service';
import {
  HaulierOfferFormComponent,
  HaulierUIItem,
} from 'app/share/ui/haulier/haulier-offer-form/haulier-offer-form.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { getListingTitle } from 'app/share/utils/offer';
import { OfferDetail } from 'app/types/requests/offer';
import { catchError, EMPTY, filter, finalize, map, of } from 'rxjs';

@Component({
  selector: 'app-make-offer',
  templateUrl: './make-offer.component.html',
  styleUrls: ['./make-offer.component.scss'],
  imports: [
    HaulierLayoutComponent,
    TranslateModule,
    SpinnerComponent,
    SlicePipe,
    HaulierOfferFormComponent,
    DecimalPipe,
    DatePipe,
    TitleCasePipe,
  ],
  providers: [OfferService, TranslatePipe],
})
export class MakeOfferComponent implements OnInit {
  readonly Currency = Currency;
  mapLocationContainerCodeToName = mapLocationContainerCodeToName;
  mapCountryCodeToName = mapCountryCodeToName;
  getListingTitle = getListingTitle;
  mapCodeToMaterialItem = mapCodeToMaterialItem;
  mapCodeToMaterialPackaging = mapCodeToPackaging;

  loadDetails = signal<HaulageOfferLoadItem | null>(null);

  user: Signal<User | null | undefined>;
  offerDetails = signal<OfferDetail | null>(null);
  offerId = signal<number | null>(null);
  loading = signal<boolean>(false);
  haulierList = signal<HaulierUIItem[]>([]);

  buyerDetails = computed(() => {
    if (!this.offerDetails) return;
    return this.offerDetails()?.buyer;
  });

  sellerDetails = computed(() => {
    if (!this.offerDetails) return;
    return this.offerDetails()?.seller;
  });

  listingDetails = computed(() => {
    if (!this.offerDetails) return;
    return this.offerDetails()?.listing;
  });

  route = inject(ActivatedRoute);
  offerService = inject(OfferService);
  authService = inject(AuthService);
  haulageService = inject(HaulageService);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);
  router = inject(Router);
  seoService = inject(SeoService);

  filterFn = (hauliers: HaulierUIItem[], searchTerm: string): HaulierUIItem[] => {
    return hauliers.filter((item) => {
      const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
      const email = (item.email || '').toLowerCase();
      const id = String(item.id);
      const username = (item.username || '').toLowerCase();

      return (
        fullName.includes(searchTerm) ||
        email.includes(searchTerm) ||
        id.includes(searchTerm) ||
        username.includes(searchTerm)
      );
    });
  };

  displayFn = (haulier: HaulierUIItem | null): string => {
    if (!haulier) return '';
    return `${haulier.firstName} ${haulier.lastName}`;
  };

  constructor() {
    this.user = toSignal(this.authService.user$);

    this.route.queryParamMap
      .pipe(
        map((params) => params.get('bid_id')),
        filter((id) => id !== null),
        takeUntilDestroyed(),
      )
      .subscribe((id) => {
        this.offerId.set(Number(id));
        this.getOfferDetails();
        this.getHauliers();
      });
  }

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Haulier Submit Offer')),
      description: '',
    });
    this.seoService.setNoIndex();
  }

  getOfferDetails() {
    const offerId = this.offerId();
    if (!offerId) return;

    this.loading.set(true);
    this.offerService
      .getOfferDetail(offerId)
      .pipe(
        catchError(() => {
          this.snackBar.open(this.translate.transform(localized$('Failed to load offer details')), 'OK');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((offerDetails) => {
        if (!offerDetails) return;
        this.offerDetails.set(offerDetails.data);
      });
  }

  getHauliers() {
    this.haulageService
      .getHauliers()
      .pipe(
        takeUntilDestroyed(),
        catchError(() => {
          this.snackBar.open(this.translate.transform(localized$('Failed to load hauliers')), 'OK');
          return of({ results: [], totalCount: 0 });
        }),
      )
      .subscribe((data) => {
        const activatedMembers = data.results.filter((item) => item.status === 'active');

        // Transform to HaulierUIItem
        const transformed: HaulierUIItem[] = activatedMembers.map((item) => ({
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          containerTypes: item.companyData.containerTypes,
          companyId: item.companyData.id,
          companyName: item.companyData.name,
          role: item.companyRole,
          username: item.username,
        }));

        this.haulierList.set(transformed);
      });
  }
}
