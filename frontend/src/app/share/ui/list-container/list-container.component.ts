import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, DestroyRef, inject, Input, OnInit, signal, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { mapCountryCodeToName } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { NotesRefreshService } from 'app/share/ui/notes/service/notes-refresh.service';
import { scrollTop } from 'app/share/utils/common';
import { ItemOf } from 'app/types/utils';
import { catchError, finalize, Observable, of } from 'rxjs';
import { allFilters } from '../listing/filter/constant';
import { FilterComponent, PageType } from '../listing/filter/filter.component';
import { PaginationComponent } from '../listing/pagination/pagination.component';
import { SpinnerComponent } from '../spinner/spinner.component';

export interface PageResult {
  results: any;
  totalCount: number | string;
  data?: {
    results: any;
    totalCount: number | string;
  };
}

interface TabItem {
  id: string;
  label: string;
  filter?: string;
  filterValue?: string;
  order?: number;
}

const BASE_TAB_LIST: TabItem[] = [
  { id: 'all', label: localized$('All') },
  { id: 'approved', label: localized$('Approved'), filter: 'state', filterValue: 'approved' },
  { id: 'rejected', label: localized$('Rejected'), filter: 'state', filterValue: 'rejected' },
  { id: 'unverified', label: localized$('UnVerified'), filter: 'state', filterValue: 'pending' },
];

const LISTING_TAB_LIST: TabItem[] = [...BASE_TAB_LIST];
const WANTED_TAB_LIST: TabItem[] = [...BASE_TAB_LIST];
const OFFER_TAB_LIST: TabItem[] = [
  { id: 'all', label: localized$('All') },
  { id: 'active', label: localized$('Active'), filter: 'state', filterValue: 'active' },
  { id: 'closed', label: localized$('Closed'), filter: 'state', filterValue: 'closed' },
];
const USER_TAB_LIST: TabItem[] = [
  { id: 'all', label: localized$('All') },
  { id: 'unverified', label: localized$('UnVerified'), filter: 'state', filterValue: 'unverified' },
  { id: 'verified', label: localized$('Verified'), filter: 'state', filterValue: 'verified' },
  { id: 'rejected', label: localized$('Rejected'), filter: 'state', filterValue: 'rejected' },
  { id: 'inactive', label: localized$('Inactive'), filter: 'state', filterValue: 'inactive' },
  { id: 'blocked', label: localized$('Blocked'), filter: 'state', filterValue: 'blocked' },
];
const HAULAGE_BID_TAB_LIST: TabItem[] = [
  { id: 'all', label: localized$('All') },
  { id: 'unverified', label: localized$('Unverified'), filter: 'status', filterValue: 'unverified' },
  { id: 'verified', label: localized$('Verified'), filter: 'status', filterValue: 'verified' },
  { id: 'pending', label: localized$('Pending'), filter: 'status', filterValue: 'pending' },
  { id: 'approved', label: localized$('Approved'), filter: 'status', filterValue: 'approved' },
  { id: 'rejected', label: localized$('Rejected'), filter: 'status', filterValue: 'rejected' },
  { id: 'accepted', label: localized$('Accepted'), filter: 'status', filterValue: 'accepted' },
  { id: 'unsuccessful', label: localized$('Unsuccessful'), filter: 'status', filterValue: 'unsuccessful' },
  { id: 'inactive', label: localized$('Inactive'), filter: 'status', filterValue: 'inactive' },
  { id: 'blocked', label: localized$('Blocked'), filter: 'status', filterValue: 'blocked' },
];
const MFI_TAB_LIST: TabItem[] = [
  { id: 'all', label: localized$('All') },
  { id: 'unverified', label: localized$('Unverified'), filter: 'status', filterValue: 'Unverified' },
  { id: 'verified', label: localized$('Verified'), filter: 'status', filterValue: 'Verified' },
  { id: 'awaiting_payment', label: localized$('Awaiting Payment'), filter: 'status', filterValue: 'Awaiting Payment' },
  { id: 'pending', label: localized$('Pending'), filter: 'status', filterValue: 'Pending' },
  { id: 'tested', label: localized$('Tested'), filter: 'status', filterValue: 'Tested' },
  { id: 'inactive', label: localized$('Inactive'), filter: 'status', filterValue: 'Inactive' },
  { id: 'blocked', label: localized$('Blocked'), filter: 'status', filterValue: 'Blocked' },
];
const SAMPLES_TAB_LIST: TabItem[] = [
  { id: 'all', label: localized$('All') },
  { id: 'unverified', label: localized$('Unverified'), filter: 'status', filterValue: 'Unverified' },
  { id: 'verified', label: localized$('Verified'), filter: 'status', filterValue: 'Verified' },
  { id: 'awaiting_payment', label: localized$('Awaiting Payment'), filter: 'status', filterValue: 'Awaiting Payment' },
  { id: 'pending', label: localized$('Pending'), filter: 'status', filterValue: 'Pending' },
  { id: 'sent', label: localized$('Sent'), filter: 'status', filterValue: 'Sent' },
  { id: 'received', label: localized$('Received'), filter: 'status', filterValue: 'Received' },
  { id: 'cancelled', label: localized$('Cancelled'), filter: 'status', filterValue: 'Cancelled' },
  { id: 'inactive', label: localized$('Inactive'), filter: 'status', filterValue: 'Inactive' },
  { id: 'blocked', label: localized$('Blocked'), filter: 'status', filterValue: 'Blocked' },
];
@Component({
  selector: 'app-list-container',
  templateUrl: './list-container.component.html',
  styleUrls: ['./list-container.component.scss'],
  imports: [FilterComponent, PaginationComponent, SpinnerComponent, NgTemplateOutlet, TranslateModule, MatTabsModule],
  providers: [TranslatePipe],
})
export class ListContainerComponent implements OnInit {
  mapCountryCodeToName = mapCountryCodeToName;
  listTab: TabItem[] = [];

  tabCounts = signal<Record<string, number>>({});
  selectedTab = signal<number>(0);

  @Input() displayFilter: string[] = [];
  @Input() customOptionValues: Record<ItemOf<typeof allFilters>['value'], any> = {};
  @Input() fetchFn!: (filter: any) => import('rxjs').Observable<PageResult>;
  @Input() fetchCountFn?: () => Observable<Record<string, number>> = undefined;
  @Input() pageSize = 20;
  @Input() pageType: PageType = 'default';
  @Input() emptyMessage: string = '';
  @Input() isCountryFilter: boolean = false;
  @Input() listingType: 'sell' | 'wanted' | 'offer' | 'user' | 'haulage' | 'samples' | 'mfi' = 'sell';
  @Input() paramKey: string = 'listingId';
  @Input() useFilter: boolean = true;

  @ContentChild(TemplateRef) itemTemplate!: TemplateRef<any>;

  private isFirstLoad = true;

  page = signal(1);
  filter = signal<any>({ skip: 0, limit: this.pageSize, where: {} });
  searchTerm = signal<string | null>(null);
  loading = signal(false);
  items = signal<any[]>([]);
  total = signal(0);
  noResults = signal(false);
  invalidPage = signal(false);
  tabFilter = signal<Record<string, string> | null>(null);
  listingId = signal<string | null>(null);
  cleanFilterSignal = signal(false);

  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);
  route = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);
  notesRefreshService = inject(NotesRefreshService);

  constructor() {
    this.loading.set(true);
  }

  ngOnInit() {
    this.setupTab();
    let isFirstLoad = true;

    this.notesRefreshService.refresh$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.refresh();
    });

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const idFromUrl = params[this.paramKey];
      const currentListingIdInFilter = this.filter().where[this.paramKey];

      if (idFromUrl) {
        this.listingId.set(idFromUrl);
        if (!isFirstLoad && currentListingIdInFilter !== idFromUrl) {
          this.filter.update((cur) => ({
            ...cur,
            skip: 0,
            where: { ...cur.where, [this.paramKey]: idFromUrl },
          }));
          this.refresh();
        } else if (isFirstLoad) {
          this.filter().where[this.paramKey] = idFromUrl;
        }
      } else {
        this.listingId.set(null);
        if (currentListingIdInFilter) {
          this.filter.update((cur) => {
            const newWhere = { ...cur.where };
            delete newWhere[this.paramKey];
            return { ...cur, skip: 0, where: newWhere };
          });
        }
      }

      this.refresh();
      isFirstLoad = false;
    });
  }

  onPageChange(p: number) {
    this.page.set(p);
    this.updateFilter({
      skip: (p - 1) * this.pageSize,
      where: {
        ...this.filter().where,
      },
    });
    this.refresh();
  }

  onFilterChange(filterParams: any) {
    const cleanedParams = Object.fromEntries(
      Object.entries(filterParams).filter(([_, value]) => value != null && value != '' && value != 'createdAtDesc'),
    );

    if ('country' in cleanedParams) {
      if (!this.isCountryFilter) {
        cleanedParams['location'] = cleanedParams['country'];
        delete cleanedParams['country'];
      } else {
        cleanedParams['country'] = cleanedParams['country'];
      }
    }

    if ('sortBy' in cleanedParams) {
      cleanedParams['sortBy'] = Array.isArray(cleanedParams['sortBy'])
        ? cleanedParams['sortBy'][0]
        : cleanedParams['sortBy'];
    }

    if (this.pageType == 'wanted') {
      if ('buyerName' in cleanedParams) {
        cleanedParams['name'] = cleanedParams['buyerName'];
        delete cleanedParams['buyerName'];
      }
      Object.keys(cleanedParams).forEach((key) => {
        const val = cleanedParams[key];
        if (Array.isArray(val)) {
          cleanedParams[key] = val[0];
        }
      });
    }

    this.page.set(1);

    this.updateFilter({ skip: 0, where: { ...cleanedParams } });
    this.refresh();
  }

  private updateFilter(part: Partial<any>) {
    this.filter.update((cur) => {
      const base = cur ?? { skip: 0, limit: this.pageSize, where: {} };

      const where = { ...(part['where'] ?? {}) };

      const currentTabFilter = this.tabFilter();
      if (currentTabFilter) {
        Object.assign(where, currentTabFilter);
      }

      if (this.searchTerm()) {
        where['searchTerm'] = this.searchTerm();
      }

      if (this.listingId()) {
        where[this.paramKey] = this.listingId();
      }

      return {
        ...base,
        ...part,
        where,
      };
    });
  }

  private refresh() {
    this.loading.set(true);

    scrollTop();

    this.fetchFn(this.filter())
      .pipe(
        finalize(() => this.loading.set(false)),
        catchError((err) => {
          if (err) {
            this.snackBar.open(
              this.translate.transform(localized$(`${err.message}`)),
              this.translate.transform(localized$('OK')),
              { duration: 3000 },
            );
          }
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          const items = (res.results || res?.data?.results) ?? [];
          this.items.set(items);

          typeof res.totalCount === 'string'
            ? this.total.set(parseInt(res.totalCount))
            : this.total.set(res.totalCount);

          this.invalidPage.set(this.total() > 0 && items.length === 0);
          this.noResults.set(this.total() === 0 && items.length === 0);
        }
      });

    this.fetchCountFn?.()?.subscribe((data) => {
      this.tabCounts.set(data);
    });
  }

  countryCodeToName(code: string | undefined | null): string {
    if (!code) {
      return '';
    }
    return this.mapCountryCodeToName[code];
  }

  onTabChange(event: MatTabChangeEvent) {
    const selectedTab = this.listTab[event.index];
    this.selectedTab.set(event.index);
    const tabKeysToClean = this.getTabFilterKeys();

    const newTabFilter =
      selectedTab.filter && selectedTab.filterValue ? { [selectedTab.filter]: selectedTab.filterValue } : {};

    this.tabFilter.set(newTabFilter);
    this.page.set(1);

    this.filter.update((cur) => {
      const updatedWhere = { ...cur.where };

      tabKeysToClean.forEach((key) => {
        if (key in updatedWhere) {
          delete updatedWhere[key];
        }
      });

      return {
        ...cur,
        skip: 0,
        where: {
          ...updatedWhere,
          ...newTabFilter,
        },
      };
    });

    // remove all filters when "All" tab is selected
    selectedTab.id === 'all' ? this.cleanFilterSignal.set(true) : this.cleanFilterSignal.set(false);

    this.refresh();
  }

  private reorderTabs(tabs: TabItem[]): TabItem[] {
    const defaultTabs = tabs.filter((t) => t.order === undefined);

    const fixedTabs = tabs.filter((t) => t.order !== undefined).sort((a, b) => a.order! - b.order!);

    const result = [...defaultTabs];

    fixedTabs.forEach((tab) => {
      result.splice(tab.order!, 0, tab);
    });

    return result;
  }

  private getTabFilterKeys(): string[] {
    const keys = this.listTab.map((tab) => tab.filter).filter((f): f is string => !!f);
    return [...new Set(keys)];
  }

  setupTab() {
    switch (this.listingType) {
      case 'sell':
        this.listTab = LISTING_TAB_LIST;
        break;
      case 'wanted':
        this.listTab = WANTED_TAB_LIST;
        break;
      case 'offer':
        this.listTab = OFFER_TAB_LIST;
        break;
      case 'user':
        this.listTab = USER_TAB_LIST;
        break;
      case 'haulage':
        this.listTab = HAULAGE_BID_TAB_LIST;
        break;
      case 'samples':
        this.listTab = SAMPLES_TAB_LIST;
        break;
      case 'mfi':
        this.listTab = MFI_TAB_LIST;
        break;
      default:
        this.listTab = BASE_TAB_LIST;
    }

    this.listTab = this.reorderTabs(this.listTab);
  }
}
