import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { SellerCompaniesResponse } from 'app/models';
import { Companies, CompaniesResponse } from 'app/models/purchases.model';
import { WantedCompanies, WantedCompaniesResponse } from 'app/models/wanted.model';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  companies$?: Observable<{ buyer: Companies[]; seller: Companies[] }>;
  sellerCompanies$?: Observable<Companies[]>;
  wantedCompanies$?: Observable<WantedCompanies[]>;
  http = inject(HttpClient);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslateService);

  getOfferCompanies(): Observable<{ buyer: Companies[]; seller: Companies[] }> {
    if (!this.companies$) {
      this.companies$ = this.http.get<CompaniesResponse>('/offers/admin/companies').pipe(
        map((res) => ({
          buyer: res.data.buyerCompanies,
          seller: res.data.sellerCompanies,
        })),
        shareReplay({ bufferSize: 1, refCount: true }),
        catchError((err) => {
          this.companies$ = undefined;
          this.snackBar.open(
            this.translate.instant(localized$(`Failed to load companies. Please try again.`)),
            this.translate.instant(localized$('OK')),
            {
              duration: 3000,
            },
          );
          return of({ buyer: [], seller: [] });
        }),
      );
    }
    return this.companies$;
  }

  getCompanies(filter: string): Observable<Companies[]> {
    if (!this.sellerCompanies$) {
      this.sellerCompanies$ = this.http
        .get<SellerCompaniesResponse>(`/listings/admin/companies?listingType=${filter}`)
        .pipe(
          map((res) => {
            return res.data.companies;
          }),
          shareReplay({ bufferSize: 1, refCount: true }),
          catchError((err) => {
            this.sellerCompanies$ = undefined;
            this.snackBar.open(
              this.translate.instant(localized$(`Failed to load companies. Please try again.`)),
              this.translate.instant(localized$('OK')),
              {
                duration: 3000,
              },
            );
            return of([]);
          }),
        );
    }
    return this.sellerCompanies$;
  }

  getWantedCompanies(filter: string): Observable<WantedCompanies[]> {
    if (!this.wantedCompanies$) {
      this.wantedCompanies$ = this.http
        .get<WantedCompaniesResponse>(`/listings/admin/companies?listingType=${filter}`)
        .pipe(
          map((res) => {
            return res.data.companies;
          }),
          shareReplay({ bufferSize: 1, refCount: true }),
          catchError((err) => {
            this.wantedCompanies$ = undefined;
            this.snackBar.open(
              this.translate.instant(localized$(`Failed to load companies. Please try again.`)),
              this.translate.instant(localized$('OK')),
              {
                duration: 3000,
              },
            );
            return of([]);
          }),
        );
    }
    return this.wantedCompanies$;
  }

  clearCache(): void {
    this.companies$ = undefined;
    this.sellerCompanies$ = undefined;
  }
}
