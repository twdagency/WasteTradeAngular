import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CompanySearchParams,
  CompanySearchResponse,
  GetUserCountTabs,
  MergeCompaniesRequest,
  MergeCompaniesResponse,
  OnboardingStatus,
  OverallStatus,
  RegistrationStatus,
} from 'app/models/admin/commercial.model';
import { User, UserMember } from 'app/models/admin/user.model';
import { PageResult } from 'app/share/ui/list-container/list-container.component';
import { resolveAccountType } from 'app/share/utils/account-type';
import moment from 'moment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  constructor(private http: HttpClient) {}
  getMembers(filter: any): Observable<PageResult> {
    const params: any = {
      search: filter.where.searchTerm ?? undefined,
      filter: JSON.stringify(this.buildLoopbackFilter(filter)),
    };

    if (!params.search) {
      delete params.search;
    }

    return this.http.get<{ totalCount: number; results: UserMember[] }>('/users', { params }).pipe(
      map((res) => {
        return {
          totalCount: res.totalCount,
          results: res.results.map((u) => this.mapUserToTableData(u)),
        };
      }),
    );
  }

  private mapUserToTableData(user: UserMember): User {
    const formatDate = (dateStr: string) => moment(dateStr).format('DD/MM/YYYY');

    return {
      accountType: resolveAccountType(user.companyRole, user.companyData),
      assigneeName: user.assignAdmin?.assignedAdmin
        ? `${user.assignAdmin.assignedAdmin.firstName} ${user.assignAdmin.assignedAdmin.lastName}`
        : '',
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      companyName: user.companyData?.name ?? '',
      country: user.companyData?.country ?? '',
      registeredAt: formatDate(user.createdAt),
      overallStatus: user.overallStatus as OverallStatus,
      registrationStatus: user.registrationStatus as RegistrationStatus,
      onboardingStatus: user.onboardingStatus as OnboardingStatus,
      adminNote: user.adminNote ?? null,
      assignAdmin: user.assignAdmin ?? null,
    };
  }

  private buildLoopbackFilter(filter: any) {
    const where: any = {};

    if (filter.where?.overallStatus) {
      where['overallStatus'] = filter.where.overallStatus;
    }

    if (filter.where?.registrationStatus) {
      where['registrationStatus'] = filter.where.registrationStatus;
    }

    if (filter.where?.onboardingStatus) {
      where['onboardingStatus'] = filter.where.onboardingStatus;
    }

    if (filter.where?.accountType) {
      where['accountType'] = filter.where.accountType;
    }

    if (filter.where?.dateRequireFrom && filter.where?.dateRequireTo) {
      where['dateFrom'] = filter.where?.dateRequireFrom;
      where['dateTo'] = filter.where?.dateRequireTo;
    }

    if (filter.where?.state) {
      where['tabFilter'] = filter.where.state ?? '';
    }

    return {
      skip: filter.skip ?? 0,
      limit: filter.limit ?? 20,
      where,
    };
  }

  /**
   * Search companies for merge functionality
   */
  searchCompaniesForMerge(params: CompanySearchParams): Observable<CompanySearchResponse> {
    const queryParams = new URLSearchParams();

    const filter = {} as any;
    if (params?.skip !== undefined) filter.skip = params.skip;
    if (params?.limit !== undefined) filter.limit = params.limit;
    if (params?.where !== undefined) filter.where = params.where;
    queryParams.append('filter', JSON.stringify(filter));

    if (params.where.searchTerm) queryParams.append('searchTerm', params?.where.searchTerm);

    return this.http.get<CompanySearchResponse>(
      `/companies/search-for-merge${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
    );
  }

  /**
   * Merge two companies
   */
  mergeCompanies(request: MergeCompaniesRequest): Observable<MergeCompaniesResponse> {
    return this.http.post<MergeCompaniesResponse>('/companies/merge', request);
  }

  getCounts() {
    return this.http.get<GetUserCountTabs>('/users/count-tabs').pipe(map((res) => res.data));
  }
}
