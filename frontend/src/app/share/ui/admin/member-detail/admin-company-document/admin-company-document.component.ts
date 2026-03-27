import { DatePipe, NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule } from '@ngx-translate/core';
import { CompanyDocumentType } from 'app/models';
import { CommercialDocument, CompanyDocumentStatus, MemberDetail } from 'app/models/admin/commercial.model';
import { OfferStatus } from 'app/models/offer';
import { AuthService } from 'app/services/auth.service';
import { downloadFile } from 'app/share/utils/common';
import { getOfferStatusColor } from 'app/share/utils/offer';
import { DocumentPreviewModalComponent } from '../admin-document-preview-modal/admin-document-preview-modal.component';
import { ExpiryDatePipe } from 'app/share/pipes/expiry-date.pipe';

@Component({
  selector: 'app-admin-company-document',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    ReactiveFormsModule,
    FormsModule,
    NgTemplateOutlet,
    TitleCasePipe,
    MatTooltipModule,
    MatDialogModule,
    DatePipe,
    TranslateModule,
    ExpiryDatePipe,
  ],
  templateUrl: './admin-company-document.component.html',
  styleUrl: './admin-company-document.component.scss',
})
export class AdminCompanyDocumentComponent {
  user = input<MemberDetail>();

  documents = computed(() => this.user()?.company?.documents ?? []);

  getStatusColor(status: CompanyDocumentStatus) {
    switch (status) {
      case CompanyDocumentStatus.APPROVED:
        return '#03985C';
      case CompanyDocumentStatus.REJECTED:
        return '#D75A66';
      case CompanyDocumentStatus.PENDING:
      case CompanyDocumentStatus.REQUEST_INFORMATION:
        return '#F9A52B';
      default:
        return '#03985C';
    }
  }
  documentTypeUploaded: string = '';
  // documents: IDocument[] | undefined = undefined;
  CompanyDocumentType = CompanyDocumentType;
  documentType: CompanyDocumentType = CompanyDocumentType.EnvironmentalPermit;

  environmentPermitDocuments: CommercialDocument[] = [];
  wasteExemptionDocuments: CommercialDocument[] = [];
  wasteCarrierLicenseDocuments: CommercialDocument[] = [];
  otherDocuments: CommercialDocument[] = [];

  authService = inject(AuthService);
  dialog = inject(MatDialog);

  getDocumentStatusColor = (status: CompanyDocumentStatus): string => {
    switch (status) {
      case CompanyDocumentStatus.ACTIVE:
      case CompanyDocumentStatus.APPROVED:
        return getOfferStatusColor(OfferStatus.ACCEPTED);
      case CompanyDocumentStatus.PENDING:
      case CompanyDocumentStatus.REQUEST_INFORMATION:
        return getOfferStatusColor(OfferStatus.PENDING);
      case CompanyDocumentStatus.REJECTED:
        return getOfferStatusColor(OfferStatus.REJECTED);
    }
  };

  getDocumentStatusText = (status: CompanyDocumentStatus): string => {
    switch (status) {
      case CompanyDocumentStatus.ACTIVE:
        return localized$('Active');
      case CompanyDocumentStatus.APPROVED:
        return localized$('Approved');
      case CompanyDocumentStatus.PENDING:
        return localized$('Pending');
      case CompanyDocumentStatus.REQUEST_INFORMATION:
        return localized$('Request Information');
      case CompanyDocumentStatus.REJECTED:
        return localized$('Rejected');
      default:
        return localized$('Unknown');
    }
  };

  constructor() {
    effect(() => {
      const document = this.documents();
      if (document.length > 0) {
        this.documentTypeUploaded = [
          ...new Set(
            document
              .filter((d) => d.documentType != 'waste_carrier_license')
              .map((d) =>
                (d.documentType ?? '')
                  .split('_')
                  .map((token) => token.at(0)?.toUpperCase() + token.slice(1))
                  .join(' '),
              ),
          ),
        ].join(', ');
        this.showDocuments();
      }
    });
  }

  private showDocuments() {
    if (this.documents()) {
      this.resetDocument();
      this.documents().forEach((document) => {
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

  viewDocument(item: CommercialDocument) {
    this.dialog.open(DocumentPreviewModalComponent, {
      data: { url: item.documentUrl },
      width: '960px',
      maxWidth: '95vw',
    });
  }

  download(url: string) {
    downloadFile(url);
  }
}
