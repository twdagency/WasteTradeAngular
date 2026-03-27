import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateAdminRequest, CreateAdminResponse, EditAdminRequest, EditAdminResponse } from 'app/types/requests/admin';
import { LoadItem } from 'app/types/requests/offer';
import { Observable } from 'rxjs';

export type LoadResponse = {
  results: LoadItem[];
  totalCount: number;
};
@Injectable({
  providedIn: 'root',
})
export class AdminUserManagementService {
  constructor(private http: HttpClient) {}
  getAdmin(offset: number, limit: number): Observable<{ results: any[]; totalCount: number }> {
    const filter = {
      skip: offset.toString(),
      limit: limit.toString(),
    };

    const params = new HttpParams().set('filter', JSON.stringify(filter));

    return this.http.get<{ results: any[]; totalCount: number }>('/admins', { params });
  }

  getAdminDetail(id: number): Observable<any> {
    return this.http.get<any>(`/admins/${id}`);
  }

  updateAdminStatus(id: number, status: string) {
    return this.http.patch(`/admins/${id}/${status}`, null);
  }

  createAdmin(adminData: CreateAdminRequest): Observable<CreateAdminResponse> {
    return this.http.post<CreateAdminResponse>('/admins', adminData);
  }

  editAdmin(adminId: number, adminData: EditAdminRequest): Observable<EditAdminResponse> {
    return this.http.post<EditAdminResponse>(`/admins/${adminId}`, adminData);
  }
}
