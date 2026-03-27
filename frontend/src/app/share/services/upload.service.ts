import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(private httpClient: HttpClient) {}

  uploadMultiFile(files: File[]): Observable<string[]> {
    const formData = new FormData();
    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file, file.name);
      });
    }
    return this.httpClient.post<string[]>('/upload-multiple-files', formData, {});
  }
}
