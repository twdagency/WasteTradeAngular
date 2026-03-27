import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mapCodeToPackaging, mapCountryCodeToName } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { HaulierLayoutComponent } from 'app/layout/haulier-layout/haulier-layout.component';
import { FilterParams } from 'app/models';
import { HaulageOfferItem, LocationInfo } from 'app/models/haulage.model';
import { HaulageFilterParams, HaulageService } from 'app/services/haulage.service';
import { SeoService } from 'app/services/seo.service';
import { HaulageOfferRowComponent } from 'app/share/ui/haulier/haulage-offer-row/haulage-offer-row.component';
import { PaginationComponent } from 'app/share/ui/listing/pagination/pagination.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { scrollTop } from 'app/share/utils/common';
import { formatDecimalNumber, getListingTitle } from 'app/share/utils/offer';
import { catchError, EMPTY, finalize } from 'rxjs';

@Component({
  selector: 'app-current-offers',
  templateUrl: './current-offers.component.html',
  styleUrls: ['./current-offers.component.scss'],
  imports: [HaulierLayoutComponent, TranslateModule, SpinnerComponent, HaulageOfferRowComponent, PaginationComponent],
  providers: [TranslatePipe, DecimalPipe, DatePipe],
})
export class CurrentOffersComponent implements OnInit {
  items = signal<HaulageOfferItem[]>([]);
  loading = signal<boolean>(false);
  page = signal<number>(1);
  pageSize = signal<number>(10);
  filter = signal<HaulageFilterParams | undefined>(undefined);
  totalCount = signal(0);

  displayItem = computed(() => {
    if (!this.items().length) return [];

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    };

    return this.items().map((i) => {
      return {
        ...i,
        material: getListingTitle(i),
        packaging: mapCodeToPackaging[i?.materialPacking],
        pickupLocation: mapCountryCodeToName[i?.pickupLocation?.country ?? ''],
        destination: mapCountryCodeToName[i?.destination?.country ?? ''],
        noLoads: i?.numberOfLoads,
        quantityPerLoad: i?.quantityPerLoad,
        haulageTotal: this.decimalPipe.transform(formatDecimalNumber(i?.numberOfLoads * i?.quantityPerLoad)),
        materialName: getListingTitle(i),
      };
    });
  });

  haulageService = inject(HaulageService);
  translate = inject(TranslatePipe);
  snackBar = inject(MatSnackBar);
  private decimalPipe = inject(DecimalPipe);
  private datePipe = inject(DatePipe);
  private seoService = inject(SeoService);

  constructor() {
    this.filter.set({
      skip: 0,
      limit: this.pageSize(),
    });
    this.loading.set(true);
  }

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Haulier offer')),
      description: this.translate.transform(localized$('Haulier offer')),
    });

    this.refresh();
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.updateFilter({
      ...this.filter(),
      skip: (page - 1) * this.pageSize(),
    });
    this.refresh();
  }

  updateFilter(newFilter: Partial<FilterParams>) {
    this.filter.update((currentFilter) => {
      const existing = currentFilter || { skip: 0, limit: this.pageSize() };
      return {
        ...existing,
        ...newFilter,
      };
    });
  }

  getLocation(item: LocationInfo) {
    return [
      item?.addressLine,
      item?.street,
      item?.stateProvince,
      item?.city,
      mapCountryCodeToName[item?.country ?? ''],
    ].join(', ');
  }

  refresh() {
    const currentFilter = this.filter();
    this.loading.set(true);

    scrollTop();

    this.haulageService
      .getHaulierOffer(currentFilter)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
        catchError((err) => {
          const errorMessage = this.translate.transform(
            localized$(`We couldn’t load your offers. Please refresh the page or try again later.`),
          );
          this.snackBar.open(errorMessage, this.translate.transform(localized$('Ok')), {
            duration: 3000,
          });
          return EMPTY;
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.items.set(res.data.results);
          this.totalCount.set(res.data.totalCount);
        }
      });
  }
}
