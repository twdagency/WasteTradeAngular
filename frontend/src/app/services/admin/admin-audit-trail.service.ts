import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuditTrailFilterParams, AuditTrailResponse } from 'app/models/admin/audit-trail.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminAuditTrailService {
  constructor(private httpClient: HttpClient) {}

  getAuditTrail(filter?: AuditTrailFilterParams): Observable<AuditTrailResponse> {
    let params = new HttpParams();

    if (filter) {
      const encodedFilter = JSON.stringify(filter);
      params = params.set('filter', encodedFilter);
    }
    return this.httpClient.get<AuditTrailResponse>('/audit-trails', { params });
  }

  exportAuditTrail(filter?: AuditTrailFilterParams) {
    let params = new HttpParams();
    const headers = {
      Accept: 'text/csv; charset=utf-8',
    };

    if (filter) {
      const encodedFilter = JSON.stringify(filter);
      params = params.set('filter', encodedFilter);
    }
    return this.httpClient.get('/audit-trails/export', { headers, params, responseType: 'blob' });
  }
}
