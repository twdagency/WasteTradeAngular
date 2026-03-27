import { Component, inject, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { GaEventName } from 'app/constants/ga-event';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { CommonLayoutComponent } from 'app/layout/common-layout/common-layout.component';
import { FilterParams, ListingMaterial } from 'app/models';
import { AnalyticsService } from 'app/services/analytics.service';
import { ListingService } from 'app/services/listing.service';
import { SeoService } from 'app/services/seo.service';
import { FilterComponent } from 'app/share/ui/listing/filter/filter.component';
import { ListingFooterComponent } from 'app/share/ui/listing/listing-footer/listing-footer.component';
import { PaginationComponent } from 'app/share/ui/listing/pagination/pagination.component';
import { ProductGridComponent } from 'app/share/ui/listing/product-grid/product-grid.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { UnsuccessfulSearchComponent } from 'app/share/ui/unsuccessful-search/unsuccessful-search.component';
import { scrollTop } from 'app/share/utils/common';
import { getListingTitle } from 'app/share/utils/offer';
import { catchError, finalize, of } from 'rxjs';

export const PAGE_SIZE = 10;
@Component({
  selector: 'app-wanted-material',
  templateUrl: './wanted-material.component.html',
  styleUrls: ['./wanted-material.component.scss'],
  imports: [
    CommonLayoutComponent,
    FilterComponent,
    ProductGridComponent,
    PaginationComponent,
    ListingFooterComponent,
    SpinnerComponent,
    TranslateModule,
    UnsuccessfulSearchComponent,
  ],
  providers: [TranslatePipe],
})
export class WantedMaterialComponent implements OnInit {
  items = signal<ListingMaterial[]>([]);
  filter = signal<FilterParams | undefined>(undefined);
  loading = signal<boolean>(false);
  totalItem = signal<number>(0);
  page = signal<number>(1);
  searchTerm = signal<string | null>(null);

  listingService = inject(ListingService);
  snackBar = inject(MatSnackBar);
  router = inject(Router);
  route = inject(ActivatedRoute);
  translate = inject(TranslatePipe);
  private seoService = inject(SeoService);
  private analyticsService = inject(AnalyticsService);

  private isFirstLoad = true;

  constructor() {
    this.filter.set({
      skip: 0,
      limit: PAGE_SIZE,
      where: {
        listingType: 'wanted',
      },
    });
    this.loading.set(true);
  }

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Wanted')),
    });
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.updateFilter({
      ...this.filter(),
      skip: (page - 1) * PAGE_SIZE,
    });
    this.refresh();
  }

  onFilterChange(filterParams: any) {
    const cleanedParams = Object.fromEntries(
      Object.entries(filterParams).filter(([_, value]) => value != null && value != '' && value != 'All'),
    );
    this.page.set(1);
    this.trackListingFilter(cleanedParams);
    this.updateFilter({
      skip: 0,
      where: Object.keys(cleanedParams).length > 0 ? { ...cleanedParams } : { listingType: 'wanted' },
    });

    this.refresh();
  }

  updateFilter(newFilter: Partial<FilterParams>) {
    this.filter.update((currentFilter) => {
      const existing = currentFilter || { skip: 0, limit: PAGE_SIZE, where: {} };

      return {
        ...existing,
        ...newFilter,
        where: {
          listingType: 'wanted',
          ...newFilter.where,
        },
      };
    });
  }

  refresh() {
    const currentFilter = this.filter();
    this.loading.set(true);

    scrollTop();

    this.listingService
      .get(currentFilter)
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.isFirstLoad = false;
        }),
        catchError((err) => {
          const errorMessage = this.isFirstLoad
            ? this.translate.transform(localized$(`Failed to load the Wanted Section. Please try refreshing the page.`))
            : this.translate.transform(localized$(`Unable to apply filters at this time. Please try again.`));
          this.snackBar.open(errorMessage, this.translate.transform(localized$('Ok')), {
            duration: 3000,
          });
          return of(null);
        }),
      )
      .subscribe((data) => {
        if (data) {
          this.analyticsService.trackEvent(GaEventName.VIEW_ITEM_LIST, {
            item_list_name: [...data.results.map((item) => getListingTitle(item))].join(', '),
          });
          this.items.set(data.results);
          this.totalItem.set(typeof data.totalCount == 'string' ? parseInt(data.totalCount) : data.totalCount);
        }
      });
  }

  onSelect(item: ListingMaterial) {
    this.analyticsService.trackEvent(GaEventName.SELECT_ITEM, {
      item_list_id: item?.id,
      item_list_name: getListingTitle(item),
      item: item?.id,
    });
    this.router.navigate([ROUTES_WITH_SLASH.wantedListingOfferDetail, item.id], {
      queryParams: { fromWanted: true },
    });
  }

  trackListingFilter(filterParams: any) {
    if (filterParams['searchTerm']) {
      this.analyticsService.trackEvent(GaEventName.SEARCH, {
        search_term: filterParams['searchTerm'],
      });
    }

    const entries = Object.entries(filterParams);

    entries.forEach(([key, value]) => {
      if (key !== 'searchTerm' && value !== null && value !== undefined && value !== '') {
        this.analyticsService.trackEvent(GaEventName.LISTING_FILTER, {
          filter_category: key,
          filter_value: value.toString(),
        });
      }
    });
  }
}
