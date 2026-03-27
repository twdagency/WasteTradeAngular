import { DatePipe, DecimalPipe, SlicePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal, Signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { mapCodeToMaterialItem, mapCodeToPackaging, mapCountryCodeToName } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AdminLayoutComponent } from 'app/layout/admin-layout/admin-layout.component';
import { mapLocationContainerCodeToName, User } from 'app/models';
import { Currency } from 'app/models/currency';
import { HaulageOfferLoadItem } from 'app/models/haulage.model';
import { AdminHaulageService } from 'app/services/admin/admin-haulage.service';
import { AuthService } from 'app/services/auth.service';
import { OfferService } from 'app/services/offer.service';
import {
  HaulierOfferFormComponent,
  HaulierUIItem,
} from 'app/share/ui/haulier/haulier-offer-form/haulier-offer-form.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { getListingTitle } from 'app/share/utils/offer';
import { HaulierListItem } from 'app/types/requests/admin';
import { OfferDetail } from 'app/types/requests/offer';
import { catchError, EMPTY, filter, finalize, map } from 'rxjs';

@Component({
  selector: 'app-admin-make-haulage-offer',
  templateUrl: './admin-make-haulage-offer.component.html',
  styleUrls: ['./admin-make-haulage-offer.component.scss'],
  imports: [
    AdminLayoutComponent,
    TranslateModule,
    SpinnerComponent,
    HaulierOfferFormComponent,
    SlicePipe,
    TitleCasePipe,
    DecimalPipe,
    DatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  providers: [OfferService, TranslatePipe],
})
export class AdminMakeHaulageOfferComponent implements OnInit {
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
  submitting = signal<boolean>(false);
  haulierList = signal<HaulierUIItem[]>([]);
  selectedHaulier = signal<HaulierUIItem | null>(null);

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
  adminHaulageService = inject(AdminHaulageService);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);
  router = inject(Router);
  destroyRef = inject(DestroyRef);

  formGroup = new FormGroup({
    haulier: new FormControl<string | null>(null, [Validators.required]),
  });

  filterFn = (hauliers: HaulierUIItem[], searchTerm: string): HaulierUIItem[] => {
    return hauliers.filter((item) => {
      const company = (item.companyName || '').toLowerCase();
      const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
      const email = (item.email || '').toLowerCase();
      const username = (item.username || '').toLowerCase();
      const userId = String(item.userId || item.id);

      return (
        company.includes(searchTerm) ||
        fullName.includes(searchTerm) ||
        email.includes(searchTerm) ||
        username.includes(searchTerm) ||
        userId.includes(searchTerm)
      );
    });
  };

  displayFn = (haulier: HaulierUIItem | null): string => {
    if (!haulier) return '';
    return `${haulier.firstName} ${haulier.lastName} (${haulier.companyName || ''}) - ${haulier.username}`;
  };

  constructor() {
    this.user = toSignal(this.authService.user$);

    this.route.paramMap
      .pipe(
        map(() => {
          let route = this.route;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route.snapshot.paramMap.get('offerId');
        }),
        filter((id) => id !== null),
        takeUntilDestroyed(),
      )
      .subscribe((id) => {
        this.offerId.set(Number(id));
        this.getOfferDetails();
      });
  }

  ngOnInit() {
    this.loadAllHauliers();
  }

  getOfferDetails() {
    const offerId = this.offerId();
    if (!offerId) return;

    this.loading.set(true);
    this.offerService
      .getOfferDetail(offerId)
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((offerDetails) => {
        if (!offerDetails) return;
        this.offerDetails.set(offerDetails.data);
      });
  }

  onBack() {
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.commercialManagement}/buyers/${this.offerId()}`);
  }

  loadAllHauliers() {
    this.adminHaulageService
      .getHauliers({ limit: 1000 })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this.snackBar.open(this.translate.transform(localized$('Error fetching hauliers')), 'OK');
          return EMPTY;
        }),
      )
      .subscribe((res) => {
        if (!res) return;
        const list = res?.data?.results || [];

        // Transform HaulierListItem to HaulierUIItem
        const transformed: HaulierUIItem[] = list.map((item: HaulierListItem) => ({
          id: item.userId,
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          containerTypes: item.containerTypes,
          companyId: item.companyId,
          companyName: item.companyName,
          username: item.username,
          userId: item.userId,
        }));

        this.haulierList.set(transformed);
      });
  }

  onHaulierSelected(haulier: HaulierUIItem) {
    this.selectedHaulier.set(haulier);
  }

  onFormSubmit(payload: any) {
    if (!payload) return;
    this.submitting.set(true);
    this.adminHaulageService
      .makeOffer({
        ...payload,
        offerId: this.offerId()!,
      })
      .pipe(
        finalize(() => this.submitting.set(false)),
        catchError(() => {
          this.snackBar.open(
            this.translate.transform(
              localized$(
                'We couldn’t submit this offer right now. Please try again. If the problem persists, contact support.',
              ),
            ),
            'OK',
          );
          return EMPTY;
        }),
      )
      .subscribe((res) => {
        if (res) {
          const bidId = res?.id;
          if (!bidId) return;

          this.snackBar.open(
            this.translate.transform(localized$('The haulage offer has been submitted for review.')),
            'OK',
          );

          this.router.navigate([ROUTES_WITH_SLASH.adminHaulageBid, bidId]);
        }
      });
  }
}
