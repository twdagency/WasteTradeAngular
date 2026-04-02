import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { CompanyDocumentType } from 'app/models';
import { RegistrationsService } from 'app/services/registrations.service';
import { AuthService } from 'app/services/auth.service';
import { UploadService } from 'app/share/services/upload.service';
import { FileUploadComponent, FileInfo } from '@app/ui';
import { catchError, concatMap, finalize, of } from 'rxjs';
import moment from 'moment';

@Component({
  selector: 'app-upload-documents-dialog',
  templateUrl: './upload-documents-dialog.component.html',
  styleUrl: './upload-documents-dialog.component.scss',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslateModule,
    FileUploadComponent,
  ],
  providers: [TranslatePipe],
})
export class UploadDocumentsDialogComponent {
  private dialogRef = inject(MatDialogRef<UploadDocumentsDialogComponent>);
  private registrationsService = inject(RegistrationsService);
  private authService = inject(AuthService);
  private uploadService = inject(UploadService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslatePipe);

  CompanyDocumentType = CompanyDocumentType;

  environmentalPermit = signal(false);
  wasteExemptions = signal(false);
  other = signal(false);
  submitting = signal(false);

  otherDocumentType = new FormControl<string | null>(null, [Validators.required]);

  selectedFiles = signal<{ file: File; documentType: string; expiryDate?: moment.Moment | null }[]>([]);

  isValid = computed(() => {
    const hasSelection = this.environmentalPermit() || this.wasteExemptions() || this.other();
    if (!hasSelection) return false;

    const files = this.selectedFiles();
    const hasValidExpiry = (f: { expiryDate?: moment.Moment | null }) =>
      f.expiryDate != null && moment(f.expiryDate).isValid();

    if (this.environmentalPermit()) {
      const envFiles = files.filter((f) => f.documentType === CompanyDocumentType.EnvironmentalPermit);
      if (envFiles.length === 0 || !envFiles.every(hasValidExpiry)) return false;
    }
    if (this.wasteExemptions()) {
      const wasteFiles = files.filter((f) => f.documentType === CompanyDocumentType.WasteExemption);
      if (wasteFiles.length === 0 || !wasteFiles.every(hasValidExpiry)) return false;
    }
    if (this.other()) {
      const otherFiles = files.filter((f) => f.documentType === 'other');
      if (otherFiles.length === 0 || !otherFiles.every(hasValidExpiry)) return false;
      if (!this.otherDocumentType.value?.trim()) return false;
    }

    return true;
  });

  onFilesAdded(files: FileInfo[] | null, documentType: string) {
    const current = this.selectedFiles().filter((f) => f.documentType !== documentType);
    if (files && files.length > 0) {
      const mapped = files.map((f) => ({ file: f.file, documentType, expiryDate: f.expiryDate }));
      this.selectedFiles.set([...current, ...mapped]);
    } else {
      this.selectedFiles.set(current);
    }
  }

  onSubmit() {
    if (!this.isValid() || this.submitting()) return;

    this.submitting.set(true);

    const allFiles = this.selectedFiles().map((f) =>
      f.documentType === 'other' ? { ...f, documentType: this.otherDocumentType.value! } : f,
    );

    this.uploadService
      .uploadMultiFile(allFiles.map((f) => f.file))
      .pipe(
        catchError((err) => {
          this.snackBar.open(
            this.translate.transform(localized$('An error occurred while uploading the file. Please try again.')),
            this.translate.transform(localized$('Ok')),
            { duration: 3000 },
          );
          return of(null);
        }),
        concatMap((documentUrls) => {
          if (!documentUrls) return of(null);

          const documents = documentUrls.map((url, index) => {
            const file = allFiles[index];
            const doc: Record<string, string> = {
              documentType: file.documentType,
              documentUrl: url,
              expiryDate: moment(file.expiryDate!).format('DD/MM/YYYY'),
            };
            return doc;
          });

          return this.registrationsService.updateCompanyDocuments({
            documents,
            boxClearingAgent: false,
          });
        }),
        concatMap((result) => {
          if (!result) return of(null);
          return this.authService.checkToken();
        }),
        finalize(() => this.submitting.set(false)),
        catchError((err) => {
          this.snackBar.open(
            this.translate.transform(localized$('An error occurred. Please try again.')),
            this.translate.transform(localized$('Ok')),
            { duration: 3000 },
          );
          return of(null);
        }),
      )
      .subscribe((result) => {
        if (result) {
          this.dialogRef.close(true);
        }
      });
  }

  onClose() {
    this.dialogRef.close(false);
  }
}
