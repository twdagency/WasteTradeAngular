import { NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { Component, effect, inject, Input, OnChanges, Signal, SimpleChanges } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { CompanyDocumentType, User } from 'app/models';
import { IDocument } from 'app/models/listing-material-detail.model';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { PermissionDisableDirective, PermissionTooltipDirective } from 'app/share/directives';
import { ExpiryDatePipe } from 'app/share/pipes/expiry-date.pipe';
import { getOfferStatusColor } from 'app/share/utils/offer';
import { EditDocumentFormComponent } from './edit-document-form/edit-document-form.component';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    ReactiveFormsModule,
    FormsModule,
    NgTemplateOutlet,
    TitleCasePipe,
    MatTooltipModule,
    TranslateModule,
    PermissionTooltipDirective,
    PermissionDisableDirective,
    ExpiryDatePipe,
  ],
})
export class DocumentComponent implements OnChanges {
  @Input() isReusable: boolean = false;
  @Input() externalDocument: IDocument[] = [];
  user: Signal<User | null | undefined>;
  getOfferStatusColor = getOfferStatusColor;
  documentTypeUploaded: string = '';
  documents: IDocument[] | undefined = undefined;
  CompanyDocumentType = CompanyDocumentType;
  documentType: CompanyDocumentType = CompanyDocumentType.EnvironmentalPermit;

  environmentPermitDocuments: IDocument[] = [];
  wasteExemptionDocuments: IDocument[] = [];
  wasteCarrierLicenseDocuments: IDocument[] = [];
  otherDocuments: IDocument[] = [];

  authService = inject(AuthService);
  dialog = inject(MatDialog);
  analyticsService = inject(AnalyticsService);

  constructor() {
    this.user = toSignal(this.authService.user$);

    effect(() => {
      const companyDocs = this.user()?.company?.companyDocuments ?? [];
      this.showAllTypeDocument(companyDocs);
      this.showDocuments();
    });
  }

  showAllTypeDocument(companyDocs: IDocument[]) {
    const extDocs = Array.isArray(this.externalDocument) ? this.externalDocument : [];

    const docs = this.isReusable ? extDocs : companyDocs;

    this.documents = docs;
    this.documentTypeUploaded = [
      ...new Set(
        docs
          .filter((d) => d.documentType !== CompanyDocumentType.WasteCarrierLicense)
          .map((d) =>
            d.documentType
              .split('_')
              .map((token) => token[0]?.toUpperCase() + token.slice(1))
              .join(' '),
          ),
      ),
    ].join(', ');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['externalDocument'] && this.externalDocument.length) {
      this.showAllTypeDocument(this.user()?.company?.companyDocuments ?? []);
      this.showDocuments();
    }
  }

  private showDocuments() {
    if (this.documents) {
      this.resetDocument();
      this.documents.forEach((document) => {
        switch (document.documentType) {
          case CompanyDocumentType.EnvironmentalPermit:
            this.environmentPermitDocuments.push(document);
            break;
          case CompanyDocumentType.WasteExemption:
            this.wasteExemptionDocuments.push(document);
            break;
          case CompanyDocumentType.WasteCarrierLicense:
            this.wasteCarrierLicenseDocuments.push(document);
            break;
          default:
            this.otherDocuments.push(document);
        }
      });
    }
  }

  resetDocument() {
    this.environmentPermitDocuments = [];
    this.wasteCarrierLicenseDocuments = [];
    this.wasteExemptionDocuments = [];
    this.otherDocuments = [];
  }

  extractFileName(url: string): string {
    return url.split('/').pop() || '';
  }

  openEditDocuments() {
    const dataConfig: MatDialogConfig = {
      data: { documents: this.documents },
      width: '100%',
      maxWidth: '960px',
    };
    const dialogRef = this.dialog.open(EditDocumentFormComponent, dataConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showDocuments();
      }
    });
  }

  viewDocument(item: IDocument) {
    const fileExtension = item.documentUrl.split('.').pop()?.toLowerCase();
    this.analyticsService.trackEvent('view_document', {
      file_name: item.documentName,
      file_extension: fileExtension,
    });
    window.open(item.documentUrl, '_blank');
  }
}
