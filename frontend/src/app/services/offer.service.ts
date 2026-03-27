import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { PurchaseFilterParams, PurchaseResponse } from 'app/models/purchases.model';

import { TranslateService } from '@ngx-translate/core';
import { ListingSortBy } from 'app/share/ui/listing/filter/constant';
import {
  RequestCreateBidParams,
  RequestGetBuyingOffersResponse,
  RequestGetOfferDetailResponse,
  RequestGetOffersParams,
  RequestGetSellingOffersResponse,
} from 'app/types/requests/offer';
import { cloneDeep } from 'lodash';
import { catchError, throwError } from 'rxjs';

// Since its a stateless service, I make it provided in root
@Injectable()
export class OfferService {
  constructor(
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private translate: TranslateService,
  ) {}

  getOfferDetail(id: number) {
    return this.http.get<RequestGetOfferDetailResponse>(`/offers/${id}`).pipe(
      catchError((err) => {
        this.snackbar.open(
          this.translate.instant(localized$('Unable to load offer details. Please refresh the page and try again.')),
        );

        throw err;
      }),
    );
  }

  getSellingOffers({ listingId, page, materialItem }: Omit<RequestGetOffersParams, 'isSeller'>) {
    const params = new HttpParams({
      fromObject: {
        filter: JSON.stringify({
          limit: 10,
          skip: (page - 1) * 10,
          where: {
            isSeller: true,
            listingId,
            materialItem,
          },
        }),
      },
    });

    return this.http
      .get<RequestGetSellingOffersResponse>('/offers', {
        params,
      })
      .pipe(
        catchError((err) => {
          this.snackbar.open(
            this.translate.instant(localized$('Unable to load offer details. Please refresh the page and try again.')),
          );

          throw err;
        }),
      );
  }

  getBuyingOffers({ listingId, page }: Omit<RequestGetOffersParams, 'isSeller'>) {
    const params = new HttpParams({
      fromObject: {
        filter: JSON.stringify({
          limit: 10,
          skip: (page - 1) * 10,
          where: {
            isSeller: false,
            listingId,
          },
        }),
      },
    });

    return this.http
      .get<RequestGetBuyingOffersResponse>('/offers', {
        params,
      })
      .pipe(
        catchError((err) => {
          this.snackbar.open(
            this.translate.instant(localized$('Unable to load offer details. Please refresh the page and try again.')),
          );

          throw err;
        }),
      );
  }

  // getOfferListing({ listingId, page, isSeller }: Required<RequestGetOffersParams>) {
  //   return this.getSellingOffers({ listingId, page, isSeller });
  // }

  createBid(params: RequestCreateBidParams) {
    return this.http.post(`/offers`, params).pipe(
      catchError((err) => {
        this.snackbar.open(
          this.translate.instant(
            localized$('Failed to accept the bid. Please check your network connection and try again.'),
          ),
        );

        throw err;
      }),
    );
  }

  acceptBid(id: number) {
    return this.http.patch(`/offers/${id}/accept`, undefined).pipe(
      catchError((err) => {
        this.snackbar.open(
          this.translate.instant(
            localized$('Failed to accept the bid. Please check your network connection and try again.'),
          ),
        );

        throw err;
      }),
    );
  }

  rejectBid(id: number, reason: string) {
    return this.http
      .patch(`/offers/${id}/reject`, {
        rejectionReason: reason,
      })
      .pipe(
        catchError((err) => {
          this.snackbar.open(this.translate.instant(localized$('Failed to reject the bid. Please try again later.')));

          throw err;
        }),
      );
  }

  getPurchases(filter?: PurchaseFilterParams) {
    let params = new HttpParams();

    const finalFilter = cloneDeep(filter);
    if (finalFilter) {
      if (!finalFilter.where.sortBy) {
        finalFilter.where.sortBy = ListingSortBy.AVAILABLE_LISTINGS_ASC;
      }

      const encodedFilter = JSON.stringify(finalFilter);
      params = params.set('filter', encodedFilter);
    }

    return this.http.get<PurchaseResponse>('/offers/admin', { params }).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load purchase data. Please try refreshing the page.'));
      }),
    );
  }
}
