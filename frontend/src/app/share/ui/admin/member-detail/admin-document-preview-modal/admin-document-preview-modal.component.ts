import { HttpClient } from '@angular/common/http';
import { Component, inject, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { downloadFile } from 'app/share/utils/common';

@Component({
  selector: 'app-document-preview-modal',
  templateUrl: 'admin-document-preview-modal.component.html',
  styleUrls: ['admin-document-preview-modal.component.scss'],
  standalone: true,
  imports: [MatDialogModule],
})
export class DocumentPreviewModalComponent {
  // resourceUrl: string;
  safeUrl = signal<SafeResourceUrl | undefined>(undefined);
  http = inject(HttpClient);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { url: string },
    private sanitizer: DomSanitizer,
    private dialogRef: MatDialogRef<DocumentPreviewModalComponent>,
  ) {
    const resourceUrl = data.url;
    // Only trust URLs from your own domain or a whitelist!
    this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(resourceUrl));
  }

  async download() {
    const url = this.data.url;
    downloadFile(url);
  }

  close() {
    this.dialogRef.close();
  }
}
