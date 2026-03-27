import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { HaulageRequestActionEnum } from 'app/models/haulage.model';
import {
  AdminMakeOfferRequest,
  AdminMakeOfferResponse,
  GetHaulageBidDetailResponse,
  GetHaulageBidParams,
  GetHaulageBidResponse,
  GetHaulageLoadsResponse,
  GetHaulierFilterParams,
  GetHaulierListResponse,
  HaulierListItem,
  ListingActionParams,
} from 'app/types/requests/admin';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminHaulageService {
  private httpClient = inject(HttpClient);
  private snackbar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  getHaulageBids({ page, pageSize, ...rest }: GetHaulageBidParams) {
    return this.httpClient
      .get<GetHaulageBidResponse>('/admin/haulage-bids', {
        params: {
          filter: JSON.stringify({
            skip: (page - 1) * pageSize,
            limit: pageSize,
            ...rest,
          }),
        },
      })
      .pipe(map((res) => res.data));
  }

  getPendingHaulageBidsCount() {
    return this.httpClient
      .get<GetHaulageBidResponse>('/admin/haulage-bids', {
        params: {
          status: 'pending',
        },
      })
      .pipe(map((res) => res.data));
  }

  getDetail(id: number | string) {
    return this.httpClient.get<GetHaulageBidDetailResponse>(`/admin/haulage-bids/${id}`).pipe(map((res) => res.data));
  }

  callAction(bidId: string | number, actionType: HaulageRequestActionEnum, params: ListingActionParams) {
    const payload = {
      action: actionType,
      ...params,
    };
    return this.httpClient.patch(`/haulage-offers/${bidId}/actions`, payload);
  }

  markAsShipped(id: number, loadId: number) {
    const payload = { loadId };
    return this.httpClient.patch(`/haulage-offers/${id}/mark-shipped`, payload);
  }

  getHauliers(params?: GetHaulierFilterParams) {
    return this.httpClient.get<GetHaulierListResponse>('/admin/hauliers', {
      params: {
        filter: JSON.stringify({
          ...params,
        }),
      },
    });
  }

  makeOffer(payload: AdminMakeOfferRequest): Observable<AdminMakeOfferResponse> {
    return this.httpClient.post('/admin/haulage-offers', payload).pipe(map((res: any) => res.data));
  }

  getLoads(haulageOfferId: number | string) {
    return this.httpClient
      .get<GetHaulageLoadsResponse>(`/haulage-offers/${haulageOfferId}/loads`)
      .pipe(map((res) => res.data));
  }
}
