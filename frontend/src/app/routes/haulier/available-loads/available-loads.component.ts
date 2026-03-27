import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mapCodeToPackaging, mapCountryCodeToName } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HaulierLayoutComponent } from 'app/layout/haulier-layout/haulier-layout.component';
import { GetHaulageOfferLoadParams, HaulageOfferLoadItem } from 'app/models/haulage.model';
import { AuthService } from 'app/services/auth.service';
import { HaulageService } from 'app/services/haulage.service';
import { SeoService } from 'app/services/seo.service';
import { HaulageLoadRowComponent } from 'app/share/ui/haulier/haulage-load-row/haulage-load-row';
import { FilterComponent } from 'app/share/ui/listing/filter/filter.component';
import { PaginationComponent } from 'app/share/ui/listing/pagination/pagination.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { removeNilProperties } from 'app/share/utils/common';
import { formatDecimalNumber, getListingTitle } from 'app/share/utils/offer';
import { BannerType } from 'app/types/requests/auth';
import moment from 'moment';
import { filter, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-available-loads',
  templateUrl: './available-loads.component.html',
  styleUrls: ['./available-loads.component.scss'],
  imports: [
    HaulierLayoutComponent,
    TranslateModule,
    SpinnerComponent,
    HaulageLoadRowComponent,
    PaginationComponent,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    FilterComponent,
  ],
  providers: [DecimalPipe, TranslatePipe],
})
export class AvailableLoadsComponent implements OnInit {
  private seoService = inject(SeoService);
  private translatePipe = inject(TranslatePipe);
  loading = signal<boolean>(false);
  page = signal(1);
  totalCount = signal(0);
  perPage = 10;

  displayItems = signal<any[]>([]);
  private searchTerm = signal('');

  private filters = signal<Record<string, any>>({});

  private haulageService = inject(HaulageService);
  private decimalPipe = inject(DecimalPipe);
  authService = inject(AuthService);
  private snackbar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  BannerType = BannerType;

  isApproved = toSignal(
    this.authService.user$.pipe(
      filter(Boolean),
      switchMap(() => this.authService.accountStatus),
      map((res) => {
        const data = res as { bannerType?: BannerType };
        return ![
          BannerType.INCOMPLETE_ONBOARDING,
          BannerType.VERIFICATION_PENDING,
          BannerType.VERIFICATION_FAILED,
        ].includes(data?.bannerType as BannerType);
      }),
    ),
    { initialValue: undefined },
  );

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: this.translatePipe.transform(localized$('Haulier Dashboard')),
      description: this.translatePipe.transform(localized$('Haulier Dashboard')),
    });
    this.seoService.setNoIndex();
  }

  mapLoadResponseItemToTableData(loadItem: HaulageOfferLoadItem) {
    return {
      offerId: loadItem.offerId,
      listingId: loadItem.listingId,
      material: getListingTitle(loadItem),
      expiresAt: loadItem.expiresAt,
      packaging: mapCodeToPackaging[loadItem.materialPacking],
      pickupLocation: mapCountryCodeToName[loadItem.pickupLocation.country],
      destination: mapCountryCodeToName[loadItem.destination.country],
      noLoads: loadItem.numberOfLoads,
      quantityPerLoad: loadItem.quantityPerLoad,
      haulageTotal: this.decimalPipe.transform(formatDecimalNumber(loadItem.numberOfLoads * loadItem.quantityPerLoad)),
      deliveryWindow: `${moment(loadItem.earliestDeliveryDate).format('DD/MM/YYYY')} -\n${moment(loadItem.latestDeliveryDate).format('DD/MM/YYYY')}`,
    };
  }

  fetchLoads() {
    this.loading.set(true);

    const skip = (this.page() - 1) * this.perPage;

    const {
      pickupCountry,
      destinationCountry,
      dateRequireFrom,
      dateRequireTo,
      haulierMaterialType,
      haulierMaterialItem,
      haulierMaterialPacking,
    } = this.filters();

    const params: GetHaulageOfferLoadParams = {
      limit: this.perPage,
      textSearch: this.searchTerm(),
      skip,
      pickupCountry,
      destinationCountry,
      deliveryDateFrom: dateRequireFrom,
      deliveryDateTo: dateRequireTo,
      materialType: haulierMaterialType?.length ? haulierMaterialType.join(',') : undefined,
      materialItem: haulierMaterialItem?.length ? haulierMaterialItem.toString() : undefined,
      materialPacking: haulierMaterialPacking?.length ? haulierMaterialPacking.toString() : undefined,
    };
    const safeParams = removeNilProperties(params);

    this.haulageService.getAvailableLoads(safeParams as GetHaulageOfferLoadParams).subscribe({
      next: (res) => {
        let items = res.results.map((item) => this.mapLoadResponseItemToTableData(item)) || [];

        this.displayItems.set(items);
        this.totalCount.set(res.totalCount || 0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('API call failed', err);
        this.loading.set(false);
        this.snackbar.open(
          this.translate.instant(localized$('Failed to load results. Please check your connection and try again.')),
        );
      },
    });
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
    this.fetchLoads();
  }

  onSearch(inputValue: string) {
    this.searchTerm.set(inputValue.trim());
    this.page.set(1);
    this.fetchLoads();
  }

  onFilterChanged(filter: any) {
    this.page.set(1);
    this.filters.set(filter);
    this.fetchLoads();
  }
}
