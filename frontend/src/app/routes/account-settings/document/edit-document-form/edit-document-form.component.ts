import { ChangeDetectorRef, Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentFileInfo, FileInfo, FileUploadComponent } from '@app/ui';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from 'app/layout/common/icon/icon.component';
import { CompanyDocument, CompanyDocumentType } from 'app/models';
import { AuthService } from 'app/services/auth.service';
import { SettingsService } from 'app/services/settings.service';
import { UploadService } from 'app/share/services/upload.service';
import { ConfirmModalComponent } from 'app/share/ui/confirm-modal/confirm-modal.component';
import moment from 'moment';
import { catchError, concatMap, finalize, of } from 'rxjs';

@Component({
  selector: 'app-edit-document-form',
  templateUrl: './edit-document-form.component.html',
  styleUrls: ['./edit-document-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    IconComponent,
    MatButtonModule,
    MatSnackBarModule,
    MatOptionModule,
    MatDialogModule,
    MatIconModule,
    MatRadioModule,
    FileUploadComponent,
    TranslateModule,
  ],
  providers: [TranslatePipe],
})
export class EditDocumentFormComponent implements OnInit {
  formGroup = new FormGroup({
    documentType: new FormControl<string | null>(null, [Validators.required]),
    wasteLicence: new FormControl<boolean | null>(null, [Validators.required]),
    otherDocumentType: new FormControl<string | null>(null),
  });
  CompanyDocumentType = CompanyDocumentType;
  companyDocuments: CompanyDocument[] = [];
  environmentPermitDocuments: DocumentFileInfo[] = [];
  wasteExemptionDocuments: DocumentFileInfo[] = [];
  wasteCarrierLicenseDocuments: DocumentFileInfo[] = [];
  otherDocuments: DocumentFileInfo[] = [];

  submitting = signal<boolean>(false);
  selectedDocumentFile = signal<any[]>([]);
  selectedWasteLicenceFile = signal<any[]>([]);
  documentValid = signal<boolean | null>(null);
  wasteLicenceValid = signal<boolean | null>(null);

  readonly dialogRef = inject(MatDialogRef<{ [key: string]: string }>);
  readonly data = inject<{ documents: CompanyDocument[] }>(MAT_DIALOG_DATA);
  cd = inject(ChangeDetectorRef);
  uploadService = inject(UploadService);
  settingsService = inject(SettingsService);
  snackBar = inject(MatSnackBar);
  authService = inject(AuthService);
  dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  translate = inject(TranslatePipe);

  get documentType() {
    return this.formGroup.get('documentType') as FormControl;
  }

  get otherDocumentType() {
    return this.formGroup.get('otherDocumentType') as FormControl;
  }

  constructor() {
    effect(() => {
      const otherFile = this.selectedDocumentFile().find((f) => f.documentType == 'other');
      if (otherFile) {
        this.formGroup.get('otherDocumentType')?.setValidators(Validators.required);
      } else {
        this.formGroup.get('otherDocumentType')?.clearValidators();
      }
      this.formGroup.get('otherDocumentType')?.updateValueAndValidity();
      this.formGroup.updateValueAndValidity();
    });
  }

  ngOnInit() {
    if (this.data?.documents?.length > 0) {
      this.companyDocuments = this.data.documents;
      this.showDocument(this.companyDocuments);
    }
  }

  ngAfterViewInit() {
    if (this.data?.documents?.length > 0) {
      this.chooseDocumentType(this.data.documents);
      this.cd.detectChanges();
    }
  }

  onLicenceChange(event: MatRadioChange) {
    if (!event.value) {
      this.wasteCarrierLicenseDocuments = [];
    } else {
      this.wasteCarrierLicenseDocuments = this.getDocumentList(
        this.companyDocuments,
        CompanyDocumentType.WasteCarrierLicense,
      );
    }
  }

  private showDocument(documents: CompanyDocument[]) {
    this.environmentPermitDocuments = this.getDocumentList(documents, CompanyDocumentType.EnvironmentalPermit);
    this.wasteExemptionDocuments = this.getDocumentList(documents, CompanyDocumentType.WasteExemption);
    this.wasteCarrierLicenseDocuments = this.getDocumentList(documents, CompanyDocumentType.WasteCarrierLicense);
    this.otherDocuments = this.getDocumentList(documents, 'other');
  }

  private getDocumentList(documents: CompanyDocument[], type: string): DocumentFileInfo[] {
    if (!documents) return [];

    if (type === 'other') {
      return documents
        .filter(
          (d) =>
            d.documentType !== CompanyDocumentType.EnvironmentalPermit &&
            d.documentType !== CompanyDocumentType.WasteExemption &&
            d.documentType !== CompanyDocumentType.WasteCarrierLicense,
        )
        .map((d) => ({
          id: d.id,
          documentType: d.documentType,
          documentName: d.documentName,
          documentUrl: d.documentUrl,
          expiryDate: d.expiryDate,
          status: d.status,
        }));
    }

    return documents
      .filter((d) => d.documentType === type)
      .map((d) => ({
        id: d.id,
        documentType: d.documentType,
        documentName: d.documentName,
        documentUrl: d.documentUrl,
        expiryDate: d.expiryDate,
        status: d.status,
      }));
  }

  private chooseDocumentType(documents: CompanyDocument[]) {
    if (this.wasteCarrierLicenseDocuments.length > 0) {
      this.formGroup.patchValue({ wasteLicence: true }, { emitEvent: false });
    } else {
      this.formGroup.patchValue({ wasteLicence: false }, { emitEvent: false });
    }

    if (this.otherDocuments.length > 0) {
      this.formGroup.patchValue(
        {
          documentType: 'other',
          otherDocumentType: this.otherDocuments[0].documentType,
        },
        { emitEvent: false },
      );
    } else if (this.environmentPermitDocuments.length > 0) {
      this.formGroup.patchValue(
        {
          documentType: CompanyDocumentType.EnvironmentalPermit,
        },
        { emitEvent: false },
      );
    } else if (this.wasteExemptionDocuments.length > 0) {
      this.formGroup.patchValue(
        {
          documentType: CompanyDocumentType.WasteExemption,
        },
        { emitEvent: false },
      );
    }
  }

  handleFileReady(file: FileInfo[] | null, type: 'document' | 'licence', documentType: string) {
    if (type === 'document') {
      if (file && file.length > 0) {
        this.selectedDocumentFile.set([
          ...this.selectedDocumentFile().filter((f) => f.documentType !== documentType),
          ...file.map((f) => ({ ...f, documentType })),
        ]);
      } else {
        this.selectedDocumentFile.set(this.selectedDocumentFile().filter((f) => f.documentType !== documentType));
      }
    } else {
      this.selectedWasteLicenceFile.set(file ?? []);
    }
    this.formGroup.updateValueAndValidity();
  }

  private isDocumentsChanged(originalDocs: CompanyDocument[], selectedFiles: any[]): boolean {
    const originalMap = new Map(originalDocs.map((d) => [d.id, d]));
    const { wasteLicence } = this.formGroup.value;

    for (const file of selectedFiles) {
      const orig = originalMap.get(file.fileId ?? file.id);

      if (!orig) {
        this.formGroup.markAsDirty();
        return true;
      }
      const expiryOrig = orig.expiryDate
        ? moment(orig.expiryDate, ['YYYY-MM-DD', 'DD/MM/YYYY', moment.ISO_8601]).format('YYYY-MM-DD')
        : null;

      let expirySel: string | null = null;
      if (file.expiryDate) {
        expirySel = moment.isMoment(file.expiryDate)
          ? file.expiryDate.format('YYYY-MM-DD')
          : moment(file.expiryDate).format('YYYY-MM-DD');
      }

      if (expiryOrig !== expirySel) {
        this.formGroup.markAsDirty();
        return true;
      }
    }

    if (!wasteLicence && this.formGroup.dirty) {
      return true;
    }

    if (originalDocs.length !== selectedFiles.length) {
      this.formGroup.markAsDirty();
      return true;
    }

    return false;
  }

  get isSubmitDisabled() {
    if (this.formGroup.invalid) {
      return true;
    } else {
      const exitsFile = this.selectedDocumentFile().filter((f) => f.documentType == this.documentType.value);
      const { wasteLicence } = this.formGroup.value;
      const validDocument = exitsFile.length > 0;
      const validLicence = wasteLicence ? this.selectedWasteLicenceFile().length > 0 : true;
      const hasDocumentChanges = this.isDocumentsChanged(this.companyDocuments, [
        ...this.selectedDocumentFile(),
        ...this.selectedWasteLicenceFile(),
      ]);
      return !(validDocument && validLicence && hasDocumentChanges);
    }
  }

  close() {
    if (this.formGroup.pristine) {
      this.dialogRef.close(false);
      return;
    }

    this.dialog
      .open(ConfirmModalComponent, {
        maxWidth: '500px',
        width: '100%',
        panelClass: 'px-3',
        data: {
          title: 'You have unsaved changes. Are you sure you want to close without saving?',
          confirmLabel: 'Confirm',
          cancelLabel: 'Cancel',
        },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((close) => {
        if (!close) return;

        this.dialogRef.close(false);
      });
  }

  submit() {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

    this.dialog
      .open(ConfirmModalComponent, {
        maxWidth: '500px',
        width: '100%',
        panelClass: 'px-3',
        data: {
          title: 'Are you sure you want to save these changes?',
          confirmLabel: 'Confirm',
          cancelLabel: 'Cancel',
        },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((shouldSaveChange) => {
        if (!shouldSaveChange) return;

        this.submitting.set(true);

        const documentFiles = this.selectedDocumentFile().map((f) =>
          f.documentType == 'other' ? { ...f, documentType: this.otherDocumentType.value } : f,
        );
        const licenceFiles = this.selectedWasteLicenceFile().map((f) => ({
          ...f,
          documentType: CompanyDocumentType.WasteCarrierLicense,
        }));

        const files = [...documentFiles, ...licenceFiles];
        const fileUpload = files.filter((f) => f.file instanceof File);

        let alreadyUpload = [
          ...this.wasteCarrierLicenseDocuments.filter((doc) =>
            this.selectedWasteLicenceFile()
              .filter((f) => !(f.file instanceof File))
              .some((f) => f.documentType === CompanyDocumentType.WasteCarrierLicense && f.fileId === doc.id),
          ),
          ...this.environmentPermitDocuments.filter((doc) =>
            this.selectedDocumentFile()
              .filter((f) => !(f.file instanceof File))
              .some((f) => f.documentType === CompanyDocumentType.EnvironmentalPermit && f.fileId === doc.id),
          ),
          ...this.wasteExemptionDocuments.filter((doc) =>
            this.selectedDocumentFile()
              .filter((f) => !(f.file instanceof File))
              .some((f) => f.documentType === CompanyDocumentType.WasteExemption && f.fileId === doc.id),
          ),
          ...this.otherDocuments.filter((doc) =>
            this.selectedDocumentFile()
              .filter((f) => !(f.file instanceof File))
              .some(
                (f) =>
                  f.documentType !== CompanyDocumentType.EnvironmentalPermit &&
                  f.documentType !== CompanyDocumentType.WasteExemption &&
                  f.documentType !== CompanyDocumentType.WasteCarrierLicense &&
                  f.fileId === doc.id,
              ),
          ),
        ].map((doc) => {
          const selectedFile =
            doc.documentType === CompanyDocumentType.WasteCarrierLicense
              ? this.selectedWasteLicenceFile().find((f) => f.fileId === doc.id)
              : this.selectedDocumentFile().find((f) => f.fileId === doc.id);
          if (selectedFile && selectedFile.expiryDate) {
            return {
              ...doc,
              expiryDate: moment(selectedFile.expiryDate).format('DD/MM/YYYY'),
            };
          }
          if (!doc.expiryDate) delete doc.expiryDate;
          return doc;
        });

        if (fileUpload.length > 0) {
          this.uploadService
            .uploadMultiFile(fileUpload.map((f) => f.file))
            .pipe(
              finalize(() => this.submitting.set(false)),
              catchError((err) => {
                this.snackBar.open(
                  this.translate.transform(
                    localized$('Document upload failed. Please check the file size and format and try again.'),
                  ),
                  this.translate.transform(localized$('Ok')),
                  {
                    duration: 3000,
                  },
                );
                return of(null);
              }),
              concatMap((documentUrls) => {
                if (!documentUrls) return of(null);

                const documents = documentUrls.map((url, index) => {
                  const file = fileUpload[index];
                  if (file.expiryDate) {
                    return {
                      documentType: file.documentType,
                      documentUrl: url,
                      documentName: file.file.name,
                      expiryDate: moment(file.expiryDate).format('DD/MM/YYYY'),
                    };
                  }

                  return {
                    documentType: file.documentType,
                    documentUrl: url,
                    documentName: file.file.name,
                  };
                });
                return this.submitWithDocument([...documents, ...alreadyUpload]);
              }),
            )
            .subscribe((result) => {
              if (result) {
                this.snackBar.open(
                  this.translate.transform(localized$('Your Company Document has been updated successfully.')),
                  this.translate.transform(localized$('OK')),
                  {
                    duration: 3000,
                  },
                );
                this.dialogRef.close(true);
              }
            });
        } else {
          this.submitWithDocument([...alreadyUpload]).subscribe((result) => {
            if (result) {
              this.snackBar.open(
                this.translate.transform(localized$('Your Company Document has been updated successfully.')),
                this.translate.transform(localized$('OK')),
                {
                  duration: 3000,
                },
              );
              this.dialogRef.close(true);
            }
          });
        }
      });
  }

  private submitWithDocument(documents: any[]) {
    return this.settingsService.updateCompanyDocument(documents).pipe(
      finalize(() => this.submitting.set(false)),
      catchError((err) => {
        this.snackBar.open(
          this.translate.transform(localized$('Company Document update failed. Please try again later.')),
          this.translate.transform(localized$('Ok')),
          {
            duration: 3000,
          },
        );
        return of(null);
      }),
      concatMap((result: any) => {
        if (result) return this.authService.checkToken();
        return of(null);
      }),
    );
  }
}
