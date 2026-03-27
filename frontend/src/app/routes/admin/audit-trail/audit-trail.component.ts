import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AdminLayoutComponent } from 'app/layout/admin-layout/admin-layout.component';
import { AuditTrailDetail, AuditTrailFilterParams } from 'app/models/admin/audit-trail.model';
import { AdminAuditTrailService } from 'app/services/admin/admin-audit-trail.service';
import { actionOptions } from 'app/share/ui/listing/filter/constant';
import { FilterComponent } from 'app/share/ui/listing/filter/filter.component';
import { PaginationComponent } from 'app/share/ui/listing/pagination/pagination.component';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { scrollTop } from 'app/share/utils/common';
import { catchError, finalize, of } from 'rxjs';
import { AuditTrailDetailComponent } from './audit-trail-detail/audit-trail-detail.component';

@Component({
  selector: 'app-audit-trail',
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.scss'],
  imports: [
    AdminLayoutComponent,
    MatIconModule,
    TranslateModule,
    MatButtonModule,
    FilterComponent,
    SpinnerComponent,
    PaginationComponent,
    AuditTrailDetailComponent,
  ],
  providers: [TranslatePipe],
})
export class AuditTrailComponent implements OnInit {
  customFilterLabel = {
    dateRange: {
      name: 'Date Range',
    },
  };

  filter = signal<AuditTrailFilterParams | undefined>(undefined);
  items = signal<AuditTrailDetail[]>([]);
  loading = signal<boolean>(false);
  totalItem = signal<number>(0);
  page = signal<number>(1);
  pageSize = signal<number>(20);
  exporting = signal<boolean>(false);

  private isFirstLoad = true;

  auditTrailService = inject(AdminAuditTrailService);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);
  router = inject(Router);

  constructor() {
    this.filter.set({
      skip: 0,
      limit: this.pageSize(),
      where: {},
    });
    this.loading.set(true);
  }

  ngOnInit() {}

  onPageChange(page: number) {
    this.page.set(page);
    this.updateFilter({
      ...this.filter(),
      skip: (page - 1) * this.pageSize(),
    });
    this.refresh();
  }

  onFilterChange(filterParams: any) {
    const cleanedParams = Object.fromEntries(
      Object.entries(filterParams).filter(([_, value]) => value != null && value != '' && value != 'All'),
    );

    Object.keys(cleanedParams).forEach((key) => {
      const val = cleanedParams[key];
      if (Array.isArray(val)) {
        cleanedParams[key] = val[0];
      }
    });
    if (cleanedParams['action']) {
      const selected = actionOptions.find((a) => a.code === cleanedParams['action']);
      if (selected) {
        cleanedParams['action'] = selected.action;
        cleanedParams['method'] = selected.method;
      }
    }

    if ('dateRequireFrom' in cleanedParams && 'dateRequireTo' in cleanedParams) {
      cleanedParams['startDate'] = (cleanedParams['dateRequireFrom'] as moment.Moment).format('YYYY-MM-DD');
      cleanedParams['endDate'] = (cleanedParams['dateRequireTo'] as moment.Moment).format('YYYY-MM-DD');

      delete cleanedParams['dateRequireFrom'];
      delete cleanedParams['dateRequireTo'];
    }
    this.page.set(1);

    this.updateFilter({
      skip: 0,
      where: Object.keys(cleanedParams).length > 0 ? { ...cleanedParams } : {},
    });

    this.refresh();
  }

  updateFilter(newFilter: Partial<AuditTrailFilterParams>) {
    this.filter.update((currentFilter) => {
      const existing = currentFilter || { skip: 0, limit: this.pageSize(), where: {} };

      return {
        ...existing,
        ...newFilter,
        where: {
          ...newFilter.where,
        },
      };
    });
  }

  refresh() {
    const currentFilter = this.filter();
    this.loading.set(true);

    scrollTop();

    this.auditTrailService
      .getAuditTrail(currentFilter)
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.isFirstLoad = false;
        }),
        catchError((err) => {
          const errorMessage = this.isFirstLoad
            ? this.translate.transform(localized$(`Failed to load the Audit Trail. Please try refreshing the page.`))
            : this.translate.transform(localized$(`Unable to apply filters at this time. Please try again.`));
          this.snackBar.open(errorMessage, this.translate.transform(localized$('Ok')), {
            duration: 3000,
          });
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

  exportAuditTrail() {
    this.exporting.set(true);
    const currentFilter = this.filter();
    const filter: AuditTrailFilterParams = {
      skip: currentFilter?.skip ?? 0,
      limit: this.totalItem(),
      where: currentFilter?.where ?? {},
    };
    this.auditTrailService
      .exportAuditTrail(filter)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
        catchError((err) => {
          const errorMessage = this.translate.transform(
            localized$(`Unable to export audit trail. Please try again later.`),
          );
          this.snackBar.open(errorMessage, this.translate.transform(localized$('Ok')), {
            duration: 3000,
          });
          return of(null);
        }),
      )
      .subscribe((data) => {
        if (data) {
          const url = window.URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'audit-trails.csv';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
          this.exporting.set(false);
        }
      });
  }

  onBack() {
    this.router.navigateByUrl(ROUTES_WITH_SLASH.commercialManagement);
  }
}
