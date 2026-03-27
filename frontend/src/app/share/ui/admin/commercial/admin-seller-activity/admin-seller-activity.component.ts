import { Component } from '@angular/core';
import { ListingsComponent } from 'app/routes/admin/live-active-table/listings/listings.component';

@Component({
  selector: 'app-admin-seller-activity',
  imports: [ListingsComponent],
  templateUrl: './admin-seller-activity.component.html',
  styleUrl: './admin-seller-activity.component.scss',
})
export class AdminSellerActivityComponent {
  // snackBar = inject(MatSnackBar);
  // pageSize = 10;
  // filter = signal<any>({ skip: 0, limit: this.pageSize, where: {} });
  // mapCountryCodeToName = mapCountryCodeToName;
  // loading = signal(false);
  // page = signal(1);
  // // searchTerm = signal<string | null>(null);
  // items = signal<any[]>([]);
  // total = signal(0);
  // countryCodeToName(code: string | undefined | null): string {
  //   if (!code) {
  //     return '';
  //   }
  //   return this.mapCountryCodeToName[code];
  // }
  // onFilterChange(filterParams: any) {
  //   const cleanedParams = Object.fromEntries(
  //     Object.entries(filterParams).filter(([_, value]) => value != null && value != '' && value != 'createdAtDesc'),
  //   );
  //   if ('country' in cleanedParams) {
  //     // if (!this.isCountryFilter) {
  //     //   cleanedParams['location'] = [this.countryCodeToName(cleanedParams['country'] as string)];
  //     //   delete cleanedParams['country'];
  //     // } else {
  //     //   cleanedParams['country'] = [this.countryCodeToName(cleanedParams['country'] as string)];
  //     // }
  //     // if (!this.isCountryFilter) {
  //     //   cleanedParams['location'] = [this.countryCodeToName(cleanedParams['country'] as string)];
  //     //   delete cleanedParams['country'];
  //     // } else {
  //     cleanedParams['country'] = [this.countryCodeToName(cleanedParams['country'] as string)];
  //     // }
  //   }
  //   if ('sortBy' in cleanedParams) {
  //     cleanedParams['sortBy'] = Array.isArray(cleanedParams['sortBy'])
  //       ? cleanedParams['sortBy'][0]
  //       : cleanedParams['sortBy'];
  //   }
  //   this.updateFilter({ skip: 0, where: { ...cleanedParams } });
  //   this.fetchData();
  // }
  // private updateFilter(part: Partial<any>) {
  //   this.filter.update((cur) => {
  //     const base = cur ?? { skip: 0, limit: this.pageSize, where: {} };
  //     const where = { ...(part['where'] ?? {}) };
  //     // if (this.searchTerm()) {
  //     //   where['searchTerm'] = this.searchTerm();
  //     // }
  //     return {
  //       ...base,
  //       ...part,
  //       where,
  //     };
  //   });
  // }
  // private fetchData() {
  //   this.loading.set(true);
  //   window.scrollTo({
  //     top: 0,
  //     behavior: 'smooth',
  //   });
  //   this.fetchFn(this.filter())
  //     .pipe(
  //       finalize(() => this.loading.set(false)),
  //       catchError((err) => {
  //         if (err) {
  //           this.snackBar.open(err.message, 'OK', { duration: 3000 });
  //         }
  //         return of(null);
  //       }),
  //     )
  //     .subscribe((res) => {
  //       if (res) {
  //         this.items.set(res.results);
  //         typeof res.totalCount === 'string'
  //           ? this.total.set(parseInt(res.totalCount))
  //           : this.total.set(res.totalCount);
  //       }
  //     });
  // }
}
