import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { AddCompanyLocationResponse, CompanyLocationDetail, CompanyLocationResponse } from 'app/models';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, retry, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LocationService {
  http = inject(HttpClient);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslateService);

  private _locations$ = new BehaviorSubject<CompanyLocationDetail[] | null | undefined>([]);

  get location$() {
    return this._locations$.asObservable();
  }

  getLocations(): Observable<CompanyLocationDetail[]> {
    return this.http.get<CompanyLocationResponse>('/company-locations').pipe(
      map((res) => res.results),
      retry(3),
      tap((list) => {
        if (list.length) {
          this._locations$.next(list);
        } else {
          this._locations$.next(undefined);
        }
      }),
      catchError((err) => {
        this.snackBar.open(
          this.translate.instant(localized$(`Failed to load company locations. Please try again.`)),
          this.translate.instant(localized$('OK')),
          {
            duration: 3000,
          },
        );
        return of([]);
      }),
    );
  }

  getLocationDetail(id: number): Observable<CompanyLocationDetail | undefined> {
    return this.http.get<CompanyLocationDetail>(`/company-locations/${id}`);
  }
  updateLocation(id: number, payload: any): Observable<any> {
    return this.http.put(`/company-locations/${id}`, payload);
  }

  addLocation(payload: any): Observable<any> {
    return this.http.post<AddCompanyLocationResponse>(`/company-locations/`, payload).pipe(
      map((res) => {
        if (res) {
          return res['data'];
        }
        return undefined;
      }),
    );
  }
}
