import { Component, EnvironmentInjector, inject, OnInit, runInInjectionContext, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { CommonLayoutComponent } from 'app/layout/common-layout/common-layout.component';
import { FilterParams, ListingMaterial } from 'app/models';
import { ListingService } from 'app/services/listing.service';
import { SeoService } from 'app/services/seo.service';
import { ConfirmModalComponent, ConfirmModalProps } from 'app/share/ui/confirm-modal/confirm-modal.component';
import { FilterComponent } from 'app/share/ui/listing/filter/filter.component';
import { ListingFooterComponent } from 'app/share/ui/listing/listing-footer/listing-footer.component';
import { PaginationComponent } from 'app/share/ui/listing/pagination/pagination.component';
import { ProductGridComponent } from 'app/share/ui/listing/product-grid/product-grid.component';
import { ProductConfirmModalComponent } from 'app/share/ui/product-detail/product-confirm-modal/product-confirm-modal.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { UnsuccessfulSearchComponent } from 'app/share/ui/unsuccessful-search/unsuccessful-search.component';
import { scrollTop } from 'app/share/utils/common';
import { catchError, EMPTY, filter, finalize, map, of, switchMap } from 'rxjs';
import { PAGE_SIZE } from '../wanted-material/wanted-material.component';

@Component({
  selector: 'app-sale-listing',
  imports: [
    CommonLayoutComponent,
    FilterComponent,
    ProductGridComponent,
    PaginationComponent,
    ListingFooterComponent,
    MatDialogModule,
    SpinnerComponent,
    UnsuccessfulSearchComponent,
    TranslateModule,
  ],
  providers: [TranslatePipe],
  templateUrl: './sale-listing.component.html',
  styleUrl: './sale-listing.component.scss',
})
export class SaleListingComponent implements OnInit {
  listingType: 'sell' | 'wanted' = 'sell';
  private seoService = inject(SeoService);

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
  dialog = inject(MatDialog);
  translate = inject(TranslatePipe);
  private injector = inject(EnvironmentInjector);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let currentRoute: ActivatedRoute = this.route;
          while (currentRoute.firstChild) {
            currentRoute = currentRoute.firstChild;
          }
          return currentRoute;
        }),
        switchMap((child: ActivatedRoute) => child.data),
        takeUntilDestroyed(),
      )
      .subscribe((data: Data) => {
        this.listingType = data['listingType'] ?? 'sell';
        if (this.listingType) {
          this.filter.set({
            skip: 0,
            limit: PAGE_SIZE,
            where: { listingType: this.listingType },
          });
          this.loading.set(true);
          this.updateSeo();
        }
      });
  }

  ngOnInit() {}

  private updateSeo() {
    const title =
      this.listingType === 'sell'
        ? this.translate.transform(localized$('My Current Listings'))
        : this.translate.transform(localized$('My Wanted Listings'));
    const description =
      this.listingType === 'sell'
        ? this.translate.transform(localized$('Dashboard My Listings Create New Listing Add Listing'))
        : this.translate.transform(localized$('Dashboard My Wanted Listings Create New Listing Add Listing'));

    this.seoService.updateMetaTags({ title, description });
    this.seoService.setNoIndex();
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
    this.updateFilter({
      skip: 0,
      where: Object.keys(cleanedParams).length > 0 ? { ...cleanedParams } : {},
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
          listingType: existing.where.listingType,
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
      .getMyListing(currentFilter)
      .pipe(
        finalize(() => this.loading.set(false)),
        catchError((err) => {
          this.snackBar.open(
            `${err.error?.error?.message ?? this.translate.transform(localized$('Unknown error'))}`,
            this.translate.transform(localized$('Ok')),
            {
              duration: 3000,
            },
          );
          return of(null);
        }),
      )
      .subscribe((data) => {
        if (data) {
          this.items.set(data.results);
          this.totalItem.set(typeof data.totalCount == 'string' ? parseInt(data.totalCount) : data.totalCount);
        }
      });
  }

  onSelect(item: ListingMaterial) {
    const isWantedListingsPage = this.router.url.includes(ROUTES_WITH_SLASH.wantedListings);
    this.router.navigate([ROUTES_WITH_SLASH.listingOfferDetail, item.id], {
      queryParams: isWantedListingsPage ? { fromWantedListings: true } : { fromSaleListings: true },
    });
  }

  deleteItem(item: ListingMaterial) {
    runInInjectionContext(this.injector, () => {
      this.dialog
        .open<ConfirmModalComponent, ConfirmModalProps>(ProductConfirmModalComponent, {
          maxWidth: '960px',
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

            return this.listingService.delete(item.id);
          }),
          catchError(() => {
            // if (err?.error?.error?.statusCode == 403) {
            //   this.snackBar.open('You do not have permission to remove this listing.', 'Ok', {
            //     duration: 3000,
            //   });
            // } else {
            this.snackBar.open(
              this.translate.transform(localized$('Failed to remove the listing. Please try again later.')),
            );

            return EMPTY;
            // }
          }),
        )
        .subscribe(() => {
          this.snackBar.open(this.translate.transform(localized$('Your listing has been successfully removed.')));
          this.refresh();
        });
    });
  }
}
