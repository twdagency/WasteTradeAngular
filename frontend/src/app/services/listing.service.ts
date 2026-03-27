import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  FilterParams,
  ListingMaterialPayload,
  ListingResponse,
  RenewListingResponse,
  SellListingResponse,
} from 'app/models';
import { ListingMaterialDetailResponse, RequestInformationPayload } from 'app/models/listing-material-detail.model';
import { WantedListingResponse } from 'app/models/wanted.model';
import { ListingSortBy } from 'app/share/ui/listing/filter/constant';
import { cloneDeep } from 'lodash';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ListingService {
  snackBar = inject(MatSnackBar);

  constructor(private httpClient: HttpClient) {}

  createListing(payload: Partial<ListingMaterialPayload>) {
    return this.httpClient.post('/listings', payload);
  }

  editListing(listingId: number | null, payload: any) {
    return this.httpClient.patch(`/listings/${listingId}`, { ...payload });
  }

  get(filter?: FilterParams): Observable<ListingResponse> {
    let params = new HttpParams();

    if (filter) {
      const encodedFilter = JSON.stringify(filter);
      params = params.set('filter', encodedFilter);
    }

    return this.httpClient.get<ListingResponse>('/listings', { params });
  }

  getMyListing(filter?: FilterParams): Observable<ListingResponse> {
    let params = new HttpParams();

    if (filter) {
      const encodedFilter = JSON.stringify(filter);
      params = params.set('filter', encodedFilter);
    }

    return this.httpClient.get<ListingResponse>('/listings/user', { params });
  }

  getDetail(listingId: number) {
    return this.httpClient.get<ListingMaterialDetailResponse>(`/listings/${listingId}`);
  }

  delete(listingId: number) {
    return this.httpClient.delete(`/listings/${listingId}`);
  }

  sold(listingId: number) {
    return this.httpClient.patch(`/listings/${listingId}/mark-sold`, {
      status: 'sold',
    });
  }

  getListingsSell(filter?: any) {
    let params = new HttpParams();

    const finalFilter = cloneDeep(filter);
    if (finalFilter) {
      if (!finalFilter.where.sortBy) {
        finalFilter.where.sortBy = ListingSortBy.AVAILABLE_LISTINGS_ASC;
      }

      const encodedFilter = JSON.stringify(finalFilter);
      params = params.set('filter', encodedFilter);
    }
    return this.httpClient.get<SellListingResponse>('/listings/sell', { params }).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load listings. Please refresh the page to try again.'));
      }),
    );
  }

  getListingsWanted(filter?: any) {
    let params = new HttpParams();

    const finalFilter = cloneDeep(filter);
    if (finalFilter) {
      if (!finalFilter.where.sortBy) {
        finalFilter.where.sortBy = ListingSortBy.AVAILABLE_LISTINGS_ASC;
      }

      const encodedFilter = JSON.stringify(finalFilter);
      params = params.set('filter', encodedFilter);
    }
    return this.httpClient.get<WantedListingResponse>('/listings/wanted', { params }).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load listings. Please refresh the page to try again.'));
      }),
    );
  }

  requestInformation(payload: RequestInformationPayload) {
    return this.httpClient.post('/listing-requests', payload);
  }

  renewListing(listingId: string, payload: any) {
    return this.httpClient.patch<RenewListingResponse>(`/listings/${listingId}/renew`, payload);
  }
}
