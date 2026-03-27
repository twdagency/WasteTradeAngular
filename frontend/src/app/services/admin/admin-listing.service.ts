import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GetListingDetailResponse, ListingActionParams, ListingRequestActionEnum } from 'app/types/requests/admin';

@Injectable()
export class AdminListingService {
  private httpClient = inject(HttpClient);

  getDetail(listingId: string | number) {
    return this.httpClient.get<GetListingDetailResponse>(`/listings/admin/${listingId}`);
  }

  callAction(listingId: string | number, actionType: ListingRequestActionEnum, params: ListingActionParams) {
    return this.httpClient.patch(`/listings/admin/${listingId}/${actionType}`, params);
  }
}
