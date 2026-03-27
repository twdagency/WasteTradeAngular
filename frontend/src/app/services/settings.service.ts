import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UpdateCompanyPayload, UpdateDocumentPayload, UpdateDocumentResponse, UpdateProfilePayload } from 'app/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(private httpClient: HttpClient) {}

  updateProfile(data: UpdateProfilePayload): Observable<any> {
    return this.httpClient.patch('/users/me', data);
  }

  updateCompany(id: number, data: UpdateCompanyPayload): Observable<any> {
    return this.httpClient.patch(`/companies/${id}`, data);
  }

  updateMaterialPreferences(id: number, payload: any): Observable<any> {
    return this.httpClient.patch(`/companies/${id}`, payload);
  }

  updateCompanyDocument(payload: Partial<UpdateDocumentPayload>[]): Observable<UpdateDocumentResponse> {
    return this.httpClient.post<UpdateDocumentResponse>('/company-documents/me', payload);
  }

  updateNotification(payload: { [key: string]: boolean }): Observable<any> {
    return this.httpClient.patch('/users/me', payload);
  }
}
