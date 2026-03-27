import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { AdminUser, AssignAdmin, AssignAdminDataType, GetAssignableAdminsResponse } from '../assign-type/asign-type';

@Injectable({
  providedIn: 'root',
})
export class AssignService {
  assignaleAdmins = signal<AdminUser[] | undefined>(undefined);
  private translate = inject(TranslateService);

  constructor(private http: HttpClient) {}

  getAssignableAdmins(skip = 0, limit = 999): Observable<GetAssignableAdminsResponse> {
    return this.http
      .get<GetAssignableAdminsResponse>('/admin-assignments', {
        params: { skip: skip.toString(), limit: limit.toString() },
      })
      .pipe(
        catchError(() => {
          this.translate.instant(localized$('We couldn’t load admins. Please try again.'));
          return of({
            totalCount: 0,
            results: [],
          });
        }),
        tap((res) => {
          this.assignaleAdmins.set(res.results);
        }),
      );
  }

  assignAdmin(payload: {
    dataId: number;
    dataType: AssignAdminDataType;
    assignedAdminId: number | null;
  }): Observable<AssignAdmin> {
    return this.http.post<AssignAdmin>('/admin-assignments', payload);
  }
}
