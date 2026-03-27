import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  GetMemberDetailResponse,
  GetMembersParams,
  GetMembersResponse,
  GetMfiParams,
  GetMfiResponse,
  GetSamplesParams,
  GetSamplesResponse,
  MemberRequestActionEnum,
} from 'app/types/requests/admin';
import { map } from 'rxjs';

@Injectable()
export class AdminCommercialService {
  http = inject(HttpClient);

  getMembers({ page, pageSize, ...rest }: GetMembersParams) {
    return this.http.get<GetMembersResponse>('/companies/new-members', {
      params: {
        filter: JSON.stringify({
          skip: (page - 1) * pageSize,
          limit: pageSize,
          ...rest,
        }),
      },
    });
  }

  getMemberDetail(id: number) {
    return this.http.get<GetMemberDetailResponse>(`/users/admin/${id}`);
  }

  callAction({
    id,
    action,
    rejectionReason,
    message,
    requestInfo,
    sendMessage,
    otherMessage,
  }: {
    id: number;
    action: MemberRequestActionEnum;
    rejectionReason?: string;
    message?: string;

    requestInfo?: string;
    sendMessage?: string;
    otherMessage?: string;
  }) {
    if (action === MemberRequestActionEnum.REJECT) {
      return this.http.patch(`/users/admin/${id}/${action}`, {
        rejectReason: rejectionReason,
        message: !message?.trim() ? undefined : message,
      });
    }

    if (action === MemberRequestActionEnum.ACCEPT) {
      return this.http.patch(`/users/admin/${id}/${action}`, {});
    }

    return this.http.patch(`/users/admin/${id}/${action}`, {
      infoRequestType: message || requestInfo,
      message: otherMessage || sendMessage,
    });
  }

  getSamples({ page, pageSize, ...rest }: GetSamplesParams) {
    return this.http
      .get<GetSamplesResponse>('/admin/sample-requests', {
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

  getMfi({ page, pageSize, ...rest }: GetMfiParams) {
    return this.http
      .get<GetMfiResponse>('/admin/mfi-requests', {
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
}
