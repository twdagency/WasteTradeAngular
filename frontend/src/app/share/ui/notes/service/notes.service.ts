import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminNote, AdminNoteDataType, AdminNoteDetail } from '../types/notes';

@Injectable()
export class NotesService {
  constructor(private http: HttpClient) {}

  saveAdminNote(payload: { dataId: number; dataType: AdminNoteDataType; value: string }): Observable<AdminNote> {
    return this.http.post<AdminNote>('/admin-notes', payload);
  }
  getAdminNoteDetail(dataType: AdminNoteDataType, dataId: number): Observable<{ data: AdminNoteDetail }> {
    return this.http.get<{ data: AdminNoteDetail }>(`/admin-notes/${dataType}/${dataId}`);
  }
}
