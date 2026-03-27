import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FilterParams } from 'app/models';
import {
  GetCompanyHaulierListResponse,
  GetCompanyHaulierParams,
  GetHaulageOfferLoadParams,
  GetHaulageOfferLoadResponse,
  HaulageDocumentItem,
  HaulageDocumentResponse,
  HaulageMakeOfferRequest,
  HaulageOfferDetail,
  HaulageOfferDetailResponse,
  HaulageOfferResponse,
  HaulageProfile,
  HaulageProfileResponse,
} from 'app/models/haulage.model';
import { GetHaulageLoadsResponse, GetHaulierListResponse } from 'app/types/requests/admin';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

export type HaulageFilterParams = Pick<FilterParams, 'limit' | 'skip'>;

@Injectable({
  providedIn: 'root',
})
export class HaulageService {
  private _haulier$ = new BehaviorSubject<HaulageProfile | null | undefined>(null);

  constructor(private httpClient: HttpClient) {}

  get haulier$() {
    return this._haulier$.asObservable();
  }

  getProfile(): Observable<HaulageProfileResponse> {
    return this.httpClient
      .get<HaulageProfileResponse>('/haulier/profile')
      .pipe(tap((res) => this._haulier$.next(res.data)));
  }

  updateHaulageProfile(payload: HaulageProfile) {
    return this.httpClient.patch('/haulier/profile', { ...payload });
  }

  getHaulierOffer(filter?: HaulageFilterParams): Observable<HaulageOfferResponse> {
    let params = new HttpParams();

    if (filter) {
      const encodedFilter = JSON.stringify(filter);
      params = params.set('filter', encodedFilter);
    }
    return this.httpClient.get<HaulageOfferResponse>('/haulage-offers', { params });
  }

  getOfferDetails(offerId: number): Observable<HaulageOfferDetail> {
    return this.httpClient.get<HaulageOfferDetailResponse>(`/haulage-offers/${offerId}`).pipe(map((res) => res.data));
  }

  updateOffer(offerId: number | null, payload: any) {
    return this.httpClient.patch(`/haulage-offers/${offerId}`, { ...payload });
  }

  makeOffer(payload: HaulageMakeOfferRequest) {
    return this.httpClient.post<HaulageOfferResponse>('/haulage-offers', { ...payload });
  }

  getAvailableLoads(params: GetHaulageOfferLoadParams) {
    return this.httpClient.get<GetHaulageOfferLoadResponse>('/haulage-offers/available-loads', {
      params,
    });
  }

  withdrawOffer(offerId: number) {
    return this.httpClient.delete(`/haulage-offers/${offerId}/withdraw`);
  }

  getDocuments(id: number): Observable<HaulageDocumentItem[]> {
    return this.httpClient
      .get<HaulageDocumentResponse>(`/haulage-offers/${id}/documents`)
      .pipe(map((response) => response.data));
  }

  getHauliers(params?: GetCompanyHaulierParams) {
    return this.httpClient.get<GetCompanyHaulierListResponse>('/companies/users', {
      params: {
        filter: JSON.stringify({
          ...params,
        }),
      },
    });
  }

  getLoads(offerId: number) {
    return this.httpClient
      .get<GetHaulageLoadsResponse>(`/haulage-offers/${offerId}/loads`)
      .pipe(map((res) => res.data));
  }

  markAsShipped(id: number, loadId: number) {
    const payload = { loadId };
    return this.httpClient.patch(`/haulage-offers/${id}/mark-shipped`, payload);
  }
}
