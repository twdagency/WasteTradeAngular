import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  ApproveRequestResponse,
  AssignRoleRequest,
  AssignRoleResponse,
  GetCompanyUsersParams,
  GetCompanyUsersResponse,
  GetIncomingRequestsParams,
  GetIncomingRequestsResponse,
  InviteUserRequest,
  InviteUserResponse,
  ReInviteUserRequest,
  RejectRequestResponse,
  RemoveMemberParams,
  RemoveMemberResponse,
  RemovePendingMemberRequest,
  RemovePendingMemberResponse,
  SearchUsersForReassignmentParams,
  SearchUsersForReassignmentResponse,
} from 'app/types/requests/company-user-request';
import { Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class CompanyMemberService {
  private http = inject(HttpClient);
  private memberTabRefreshSubject = new Subject<void>();
  memberTabRefresh$ = this.memberTabRefreshSubject.asObservable();

  getMembers(params?: GetCompanyUsersParams): Observable<GetCompanyUsersResponse> {
    const queryParams = new URLSearchParams();

    if (params?.filter) {
      queryParams.append('filter', JSON.stringify(params.filter));
    }

    if (params?.searchTerm) {
      queryParams.append('searchTerm', params.searchTerm);
    }

    const url = `/companies/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.http.get<GetCompanyUsersResponse>(url);
  }

  getIncomingRequests(params?: GetIncomingRequestsParams): Observable<GetIncomingRequestsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/company-user-requests${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.http.get<GetIncomingRequestsResponse>(url);
  }

  approveIncomingRequest(id: number): Observable<ApproveRequestResponse> {
    return this.http.post<ApproveRequestResponse>(`/company-user-requests/${id}/approve`, undefined);
  }

  rejectIncomingRequest(id: number): Observable<RejectRequestResponse> {
    return this.http.post<RejectRequestResponse>(`/company-user-requests/${id}/reject`, undefined);
  }

  inviteUser(payload: InviteUserRequest) {
    return this.http.post<InviteUserResponse>('/company-user-requests/invite', payload);
  }

  reInviteUser(payload: ReInviteUserRequest) {
    return this.http.post<InviteUserResponse>('/company-user-requests/resend-invitation', payload);
  }

  assignRole(payload: AssignRoleRequest): Observable<AssignRoleResponse> {
    return this.http.patch<AssignRoleResponse>('/company-users/assign-role', payload);
  }

  searchUsersForReassignment(
    params?: SearchUsersForReassignmentParams,
  ): Observable<SearchUsersForReassignmentResponse> {
    const queryParams = new URLSearchParams();

    const filter = {} as any;
    if (params?.skip !== undefined) filter.skip = params.skip;
    if (params?.limit !== undefined) filter.limit = params.limit;
    if (params?.companyId !== undefined) filter.where = { companyId: params.companyId };
    if (filter) queryParams.append('filter', JSON.stringify(filter));
    if (params?.search) queryParams.append('searchTerm', params.search);

    const url = `/companies/users/search-for-reassignment${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.http.get<SearchUsersForReassignmentResponse>(url);
  }

  removeMember(payload: RemoveMemberParams): Observable<RemoveMemberResponse> {
    return this.http.post<RemoveMemberResponse>('/companies/users/reassign', payload);
  }

  removePendingMember(payload: RemovePendingMemberRequest): Observable<RemovePendingMemberResponse> {
    return this.http.post<RemovePendingMemberResponse>('/companies/users/remove-pending', payload);
  }

  notifyMemberTabRefresh(): void {
    this.memberTabRefreshSubject.next();
  }
}
