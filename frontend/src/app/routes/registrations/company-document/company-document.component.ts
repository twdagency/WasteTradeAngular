import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountOnboardingStatusComponent, DocumentFileInfo, FileInfo, FileUploadComponent } from '@app/ui';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { GaEventName } from 'app/constants/ga-event';
import { UnAuthLayoutComponent } from 'app/layout/un-auth-layout/un-auth-layout.component';
import { CompanyDocument, CompanyDocumentType, User } from 'app/models';
import { TooltipComponent } from 'app/routes/registrations/tooltip/tooltip.component';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { DraftRegisterService } from 'app/services/draft-register.service';
import { RegistrationsService } from 'app/services/registrations.service';
import { SeoService } from 'app/services/seo.service';
import { UploadService } from 'app/share/services/upload.service';
import { addLanguagePrefix } from 'app/utils/language.utils';
import moment from 'moment';
import { catchError, combineLatest, concatMap, filter, finalize, of, take } from 'rxjs';

@Component({
  selector: 'app-company-document',
  templateUrl: './company-document.component.html',
  styleUrls: ['./company-document.component.scss'],
  host: { ngSkipHydration: 'true' },
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    AccountOnboardingStatusComponent,
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    ReactiveFormsModule,
    UnAuthLayoutComponent,
    MatCheckboxModule,
    FileUploadComponent,
    MatDatepickerModule,
    RouterModule,
    TranslateModule,
    TooltipComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TranslatePipe],
})
export class CompanyDocumentComponent implements OnInit, OnDestroy {
  CompanyDocumentType = CompanyDocumentType;

  companyId: number | undefined;
  companyDocuments: CompanyDocument[] = [];
  environmentPermitDocuments: DocumentFileInfo[] = [];
  wasteExemptionDocuments: DocumentFileInfo[] = [];
  wasteCarrierLicenseDocuments: DocumentFileInfo[] = [];
  otherDocuments: DocumentFileInfo[] = [];

  selectedDocumentFile = signal<any[]>([]);
  selectedWasteLicenceFile = signal<any[]>([]);
  documentValid = signal<boolean | null>(null);
  wasteLicenceValid = signal<boolean | null>(null);
  onSelectUploadLater = signal<boolean | null>(null);
  submitting = signal<boolean>(false);

  formGroup = new FormGroup({
    companyType: new FormControl<string | null>({ value: null, disabled: true }),
    environmentalPermit: new FormControl<boolean>(false),
    wasteExemption: new FormControl<boolean>(false),
    other: new FormControl<boolean>(false),
    uploadLater: new FormControl<boolean>(false),
    otherDocumentType: new FormControl<string | null>(null),
    wasteLicence: new FormControl<boolean | null>(null, [Validators.required]),
    boxClearingAgent: new FormControl<boolean | null>(null, Validators.required),
  });

  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);
  registrationService = inject(RegistrationsService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  cd = inject(ChangeDetectorRef);
  uploadService = inject(UploadService);
  draftService = inject(DraftRegisterService);
  translate = inject(TranslatePipe);
  seoService = inject(SeoService);
  analyticsService = inject(AnalyticsService);

  constructor() {
    effect(() => {
      const otherChecked = this.formGroup.get('other')?.value;
      if (otherChecked) {
        this.formGroup.get('otherDocumentType')?.setValidators(Validators.required);
      } else {
        this.formGroup.get('otherDocumentType')?.clearValidators();
      }
      this.formGroup.get('otherDocumentType')?.updateValueAndValidity();
      this.formGroup.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.setupSeo();

    // Handle resume token from URL if present
    const token = this.route.snapshot.queryParams['token'];

    combineLatest([this.authService.user$, token ? this.draftService.resumeRegistrationFlow(token) : of(undefined)])
      .pipe(
        filter(([user]) => !!user),
        take(1),
        catchError((err) => {
          if (err) {
            this.snackBar.open(
              this.translate.transform(
                localized$(
                  'An error occurred while retrieving your information. Please refresh the page or contact support if the problem persists.',
                ),
              ),
              this.translate.transform(localized$('Ok')),
              { duration: 3000 },
            );
          }
          return of([null, undefined]);
        }),
      )
      .subscribe(([user, draftDataRes]) => {
        if (!user) return;
        this.companyId = user.company?.id;
        this.companyDocuments = user.company?.companyDocuments ?? [];
        const draftData = draftDataRes?.data.dataDraft;

        // Priority 1: Use draft data if available (from resume)
        if (draftData) {
          this.applyDraftData(draftData, user);
        }
        // Priority 2: Use existing user company data
        else {
          this.formGroup.patchValue(
            {
              boxClearingAgent: user.company?.boxClearingAgent,
              companyType: user.company?.companyType,
            },
            { emitEvent: false },
          );

          this.environmentPermitDocuments = this.getDocumentList(
            this.companyDocuments,
            CompanyDocumentType.EnvironmentalPermit,
          );
          this.wasteExemptionDocuments = this.getDocumentList(
            this.companyDocuments,
            CompanyDocumentType.WasteExemption,
          );
          this.wasteCarrierLicenseDocuments = this.getDocumentList(
            this.companyDocuments,
            CompanyDocumentType.WasteCarrierLicense,
          );
          this.otherDocuments = this.getDocumentList(this.companyDocuments, 'other');

          if (this.wasteCarrierLicenseDocuments.length) {
            this.formGroup.patchValue({ wasteLicence: true }, { emitEvent: false });
          } else {
            this.formGroup.patchValue({ wasteLicence: false }, { emitEvent: false });
          }

          if (this.otherDocuments.length) {
            this.formGroup.patchValue(
              { other: true, otherDocumentType: this.otherDocuments[0].documentType },
              { emitEvent: false },
            );
          }
          if (this.environmentPermitDocuments.length) {
            this.formGroup.patchValue(
              {
                environmentalPermit: true,
              },
              { emitEvent: false },
            );
          }
          if (this.wasteExemptionDocuments.length) {
            this.formGroup.patchValue(
              {
                wasteExemption: true,
              },
              { emitEvent: false },
            );
          }

          // Initialize auto-save tracking
          this.draftService.trackingAutoSave(() => this.saveAndResumeLater(true));
        }
      });
  }

  setupSeo() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Complete your account')),
      description: this.translate.transform(
        localized$(
          'Thank you for registering! Complete your account To unlock the full features of WasteTrade and become an approved company, you need to provide some information about yourself and your company. Click COMPLETE ACCOUNT to begin setting up your company profile. Complete Account &quot;*&quot; indicates required fields 11. Company Info22. Site Location33. Documentation This field is…',
        ),
      ),
    });

    this.seoService.setNoIndex();
  }

  ngOnDestroy() {
    this.draftService.stopAutoSave();
  }

  applyDraftData(draftData: any, user: User) {
    this.companyId = draftData.companyId || user.company?.id;

    // Handle legacy draft data or new checkbox format
    let environmentalPermit = false;
    let wasteExemption = false;
    let other = false;
    let uploadLater = false;

    if (draftData.documentType) {
      // Legacy format - convert to new checkbox format
      switch (draftData.documentType) {
        case 'environmental_permit':
          environmentalPermit = true;
          break;
        case 'waste_exemption':
          wasteExemption = true;
          break;
        case 'other':
          other = true;
          break;
        case 'uploadLater':
          uploadLater = true;
          break;
      }
    } else {
      // New checkbox format
      environmentalPermit = draftData.environmentalPermit || false;
      wasteExemption = draftData.wasteExemption || false;
      other = draftData.other || false;
      uploadLater = draftData.uploadLater || false;
    }

    this.formGroup.patchValue(
      {
        boxClearingAgent: draftData.boxClearingAgent ?? user.company?.boxClearingAgent,
        companyType: draftData.companyType ?? user.company?.companyType,
        environmentalPermit,
        wasteExemption,
        other,
        uploadLater,
        otherDocumentType: draftData.otherDocumentType,
        wasteLicence: draftData.wasteLicence,
      },
      { emitEvent: false },
    );

    // Restore selected files if they exist in draft
    if (draftData.selectedDocumentFile) {
      this.environmentPermitDocuments = this.getDocumentList(
        draftData.selectedDocumentFile,
        CompanyDocumentType.EnvironmentalPermit,
      );
      this.wasteExemptionDocuments = this.getDocumentList(
        draftData.selectedDocumentFile,
        CompanyDocumentType.WasteExemption,
      );
      this.wasteCarrierLicenseDocuments = this.getDocumentList(
        draftData.selectedWasteLicenceFile,
        CompanyDocumentType.WasteCarrierLicense,
      );

      this.otherDocuments = this.getDocumentList(draftData.selectedDocumentFile, 'other');
    }
  }

  getDocumentList(documents: CompanyDocument[], type: string): DocumentFileInfo[] {
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
          documentUrl: d.documentUrl,
          expiryDate: d.expiryDate,
          documentType: d.documentType,
        }));
    }

    return documents
      .filter((d) => d.documentType === type)
      .map((d) => ({
        documentUrl: d.documentUrl,
        expiryDate: d.expiryDate,
        documentType: d.documentType,
      }));
  }

  get otherDocumentType() {
    return this.formGroup.get('otherDocumentType') as FormControl;
  }

  get environmentalPermit() {
    return this.formGroup.get('environmentalPermit') as FormControl;
  }

  get wasteExemption() {
    return this.formGroup.get('wasteExemption') as FormControl;
  }

  get other() {
    return this.formGroup.get('other') as FormControl;
  }

  get uploadLater() {
    return this.formGroup.get('uploadLater') as FormControl;
  }

  get isSubmitDisabled() {
    if (this.formGroup.invalid) {
      return true;
    } else {
      const { environmentalPermit, wasteExemption, other, uploadLater, wasteLicence } = this.formGroup.value;

      // Check if any document type is selected
      const hasSelectedDocumentType = environmentalPermit || wasteExemption || other || uploadLater;
      if (!hasSelectedDocumentType) {
        return true;
      }

      // If upload later is selected, no file validation needed for documents
      if (uploadLater) {
        const validLicence = wasteLicence ? this.selectedWasteLicenceFile().length > 0 : true;
        return !validLicence;
      }

      // Check if files are uploaded for selected document types
      let validDocuments = true;
      if (environmentalPermit) {
        const envFiles = this.selectedDocumentFile().filter(
          (f) => f.documentType === CompanyDocumentType.EnvironmentalPermit,
        );
        validDocuments = validDocuments && envFiles.length > 0;
      }
      if (wasteExemption) {
        const wasteFiles = this.selectedDocumentFile().filter(
          (f) => f.documentType === CompanyDocumentType.WasteExemption,
        );
        validDocuments = validDocuments && wasteFiles.length > 0;
      }
      if (other) {
        const otherFiles = this.selectedDocumentFile().filter((f) => f.documentType === 'other');
        validDocuments = validDocuments && otherFiles.length > 0;
      }

      const validLicence = wasteLicence ? this.selectedWasteLicenceFile().length > 0 : true;

      return !(validDocuments && validLicence);
    }
  }

  onDocumentTypeChange(type: string, checked: boolean) {
    if (type === 'uploadLater') {
      if (checked) {
        // When upload later is checked, uncheck all other document types
        this.formGroup.patchValue({
          environmentalPermit: false,
          wasteExemption: false,
          other: false,
        });
      }
    } else {
      // When any document type is checked, uncheck upload later
      if (checked) {
        this.formGroup.patchValue({
          uploadLater: false,
        });
      }
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

  onLicenceChange(event: MatRadioChange) {
    this.selectedWasteLicenceFile.set([]);
  }

  send(navigateTo: string) {
    this.formGroup.markAllAsTouched();
    const { boxClearingAgent, wasteLicence, uploadLater } = this.formGroup.value;

    const isUploadLater = uploadLater;
    const hasWasteLicence = wasteLicence;

    const documentFiles = this.selectedDocumentFile().map((f) =>
      f.documentType == 'other' ? { ...f, documentType: this.otherDocumentType.value } : f,
    );
    const licenceFiles = this.selectedWasteLicenceFile().map((f) => ({
      ...f,
      documentType: CompanyDocumentType.WasteCarrierLicense,
    }));

    const files = [...documentFiles, ...licenceFiles];

    if (isUploadLater && !hasWasteLicence) {
      this.submitWithNoFile({ boxClearingAgent, documents: [] }, navigateTo);
      return;
    }

    const fileUpload = files.filter((f) => f.file instanceof File);
    const alreadyUpload = files
      .filter((f) => !f.file)
      .map((file) => {
        if (file.expiryDate) {
          return {
            documentType: file.documentType,
            documentUrl: file.documentUrl,
            expiryDate: moment(file.expiryDate).format('DD/MM/YYYY'),
          };
        }

        return {
          documentType: file.documentType,
          documentUrl: file.documentUrl,
        };
      });

    navigateTo === '/site-location' ? this.submitting.set(true) : this.submitting.set(false);

    if (fileUpload.length > 0) {
      this.uploadService
        .uploadMultiFile(fileUpload.map((f) => f.file))
        .pipe(
          finalize(() => this.submitting.set(false)),
          catchError((err) => {
            this.snackBar.open(
              this.translate.transform(localized$('An error occurred while uploading the file. Please try again.')),
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
                  expiryDate: moment(file.expiryDate).format('DD/MM/YYYY'),
                };
              }

              return {
                documentType: file.documentType,
                documentUrl: url,
              };
            });

            return this.submitWithDocument([...documents, ...alreadyUpload], boxClearingAgent);
          }),
        )
        .subscribe((result) => {
          if (result) {
            this.analyticsService.trackEvent(GaEventName.GENERATE_LEAD, { form_type: 'company_document' });
            this.router.navigate([addLanguagePrefix(navigateTo)], {
              replaceUrl: true,
            });
          }
        });
    } else {
      this.submitWithDocument(alreadyUpload, boxClearingAgent).subscribe((result) => {
        if (result) {
          this.analyticsService.trackEvent(GaEventName.GENERATE_LEAD, { form_type: 'company_document' });
          this.router.navigate([addLanguagePrefix(navigateTo)], {
            replaceUrl: true,
          });
        }
      });
    }
  }

  private submitWithDocument(documents: any[], boxClearingAgent: boolean | null | undefined) {
    return this.registrationService
      .updateCompanyDocuments({
        boxClearingAgent,
        documents: [...documents],
      })
      .pipe(
        finalize(() => this.submitting.set(false)),
        catchError((err) => {
          this.snackBar.open(
            this.translate.transform(
              localized$(
                `${err.error?.error?.message ?? 'An error occurred while submitting. Please try again later.'}`,
              ),
            ),
            this.translate.transform(localized$('Ok')),
            {
              duration: 3000,
            },
          );
          return of(null);
        }),
        concatMap((result) => {
          if (result) return this.authService.checkToken();
          return of(null);
        }),
      );
  }

  private submitWithNoFile(payload: any, navigateTo: string) {
    this.submitting.set(true);
    this.registrationService
      .updateCompanyDocuments(payload)
      .pipe(
        finalize(() => this.submitting.set(false)),
        catchError((err) => {
          this.snackBar.open(
            this.translate.transform(
              localized$(
                `${err.error?.error?.message ?? 'An error occurred while submitting. Please try again later.'}`,
              ),
            ),
            this.translate.transform(localized$('Ok')),
            {
              duration: 3000,
            },
          );
          return of(null);
        }),
      )
      .subscribe((result) => {
        if (result) {
          this.router.navigate([addLanguagePrefix(navigateTo)], { replaceUrl: true });
        }
      });
  }

  saveAndResumeLater(isAutoSave: boolean = false) {
    // Include token in URL for resume flow
    const resumeToken = this.draftService.getResumeToken();
    const currentUrl = resumeToken ? `${this.router.url.split('?')[0]}?token=${resumeToken}` : this.router.url;

    // Get all files that need to be uploaded
    const documentFiles = this.selectedDocumentFile().map((f) =>
      f.documentType == 'other' ? { ...f, documentType: this.otherDocumentType.value } : f,
    );

    const hasWasteLicense = !!this.formGroup.value.wasteLicence;
    const licenceFiles = hasWasteLicense
      ? this.selectedWasteLicenceFile().map((f) => ({
          ...f,
          documentType: CompanyDocumentType.WasteCarrierLicense,
        }))
      : [];

    const allFiles = [...documentFiles, ...licenceFiles];
    const filesToUpload = allFiles.filter((f) => f.file instanceof File);
    const alreadyUploaded = allFiles.filter((f) => !f.file);

    // If there are files to upload, upload them first
    if (filesToUpload.length > 0) {
      this.uploadService
        .uploadMultiFile(filesToUpload.map((f) => f.file))
        .pipe(
          catchError((err) => {
            this.snackBar.open(
              this.translate.transform(localized$('An error occurred while uploading files. Please try again.')),
              this.translate.transform(localized$('Ok')),
              { duration: 3000 },
            );
            return of(null);
          }),
          concatMap((documentUrls) => {
            if (!documentUrls) return of(null);

            // Map uploaded files to document objects with URLs - follow send() method pattern
            const uploadedDocuments = documentUrls.map((url, index) => {
              const file = filesToUpload[index];
              if (file.expiryDate) {
                return {
                  documentType: file.documentType,
                  documentUrl: url,
                  expiryDate: moment(file.expiryDate).format('DD/MM/YYYY'),
                };
              }
              return {
                documentType: file.documentType,
                documentUrl: url,
              };
            });

            // Map already uploaded files to document objects - follow send() method pattern
            const existingDocuments = alreadyUploaded.map((file) => {
              if (file.expiryDate) {
                return {
                  documentType: file.documentType,
                  documentUrl: file.documentUrl,
                  expiryDate: moment(file.expiryDate).format('DD/MM/YYYY'),
                };
              }
              return {
                documentType: file.documentType,
                documentUrl: file.documentUrl,
              };
            });

            const allDocuments = [...uploadedDocuments, ...existingDocuments];

            // Separate documents by type for the draft payload
            const selectedDocumentFile = allDocuments.filter(
              (doc) => doc.documentType !== CompanyDocumentType.WasteCarrierLicense,
            );
            const selectedWasteLicenceFile = allDocuments.filter(
              (doc) => doc.documentType === CompanyDocumentType.WasteCarrierLicense,
            );

            const formData = {
              ...this.formGroup.value,
              selectedDocumentFile,
              selectedWasteLicenceFile,
              step: 'company-document',
            };

            return this.draftService.saveDraft(formData, currentUrl, isAutoSave);
          }),
        )
        .subscribe({
          next: (result) => {
            if (result) {
              // Success is handled by the service (shows toast and redirects)
            }
          },
          error: (error) => {
            // Error is handled by the service (shows error message)
            console.error('Failed to save draft:', error);
          },
        });
    } else {
      // No files to upload, save draft with existing file URLs - follow send() method pattern
      const existingDocuments = alreadyUploaded.map((file) => {
        if (file.expiryDate) {
          return {
            documentType: file.documentType,
            documentUrl: file.documentUrl,
            expiryDate: moment(file.expiryDate).format('DD/MM/YYYY'),
          };
        }
        return {
          documentType: file.documentType,
          documentUrl: file.documentUrl,
        };
      });

      // Separate documents by type for the draft payload
      const selectedDocumentFile = existingDocuments.filter(
        (doc) => doc.documentType !== CompanyDocumentType.WasteCarrierLicense,
      );
      const selectedWasteLicenceFile = existingDocuments.filter(
        (doc) => doc.documentType === CompanyDocumentType.WasteCarrierLicense,
      );

      const formData = {
        ...this.formGroup.value,
        selectedDocumentFile,
        selectedWasteLicenceFile,
        step: 'company-document',
      };

      this.draftService.saveDraft(formData, currentUrl, isAutoSave).subscribe();
    }
  }

  onBack() {
    this.router.navigateByUrl(addLanguagePrefix('/company-information'));
  }
}
