import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { HaulageOfferStatus } from 'app/models/haulage.model';
import { HaulageDocumentsComponent } from '../haulage-documents/haulage-documents.component';

@Component({
  selector: 'app-haulage-offer-row',
  templateUrl: './haulage-offer-row.component.html',
  styleUrls: ['./haulage-offer-row.component.scss'],
  imports: [TranslateModule, MatButtonModule, TitleCasePipe, DecimalPipe, DatePipe],
  providers: [TranslatePipe],
})
export class HaulageOfferRowComponent implements OnInit {
  @Input() item: any;

  route = inject(Router);
  translate = inject(TranslatePipe);
  dialog = inject(MatDialog);

  mapCodeToStatus: Record<string, string> = {
    [HaulageOfferStatus.PENDING]: this.translate.transform(localized$('Pending')),
    [HaulageOfferStatus.APPROVED]: this.translate.transform(localized$('Approved')),
    [HaulageOfferStatus.ACCEPTED]: this.translate.transform(localized$('Accepted')),
    [HaulageOfferStatus.REJECTED]: this.translate.transform(localized$('Rejected')),
    [HaulageOfferStatus.WITHDRAWN]: this.translate.transform(localized$('Withdrawn')),
    [HaulageOfferStatus.INFORMATION_REQUESTED]: this.translate.transform(localized$('Information Requested')),
    [HaulageOfferStatus.OPEN_FOR_EDITS]: this.translate.transform(localized$('Open for Edits')),
    [HaulageOfferStatus.PARTIALLY_SHIPPED]: this.translate.transform(localized$('Partially Shipped')),
    [HaulageOfferStatus.SHIPPED]: this.translate.transform(localized$('Shipped')),
  };

  getStatusColor(state: HaulageOfferStatus) {
    switch (state) {
      case HaulageOfferStatus.ACCEPTED:
      case HaulageOfferStatus.APPROVED:
      case HaulageOfferStatus.SHIPPED:
        return '#03985C'; // Green - success states
      case HaulageOfferStatus.REJECTED:
      case HaulageOfferStatus.WITHDRAWN:
        return '#D75A66'; // Red - rejected/cancelled states
      case HaulageOfferStatus.PENDING:
      case HaulageOfferStatus.INFORMATION_REQUESTED:
      case HaulageOfferStatus.OPEN_FOR_EDITS:
        return '#F9A52B'; // Orange - pending/action required states
      case HaulageOfferStatus.PARTIALLY_SHIPPED:
        return '#2196F3'; // Blue - in progress state
      default:
        return '#F9A52B'; // Default to orange
    }
  }

  HaulierOffersStatus = HaulageOfferStatus;

  constructor() {}

  ngOnInit() {}

  goToPage() {
    if (this.item) {
      this.route.navigate([ROUTES_WITH_SLASH.currentOffers, this.item?.id]);
    }
  }

  viewDocuments() {
    this.dialog.open(HaulageDocumentsComponent, {
      maxWidth: '980px',
      maxHeight: '90vh',
      minHeight: '400px',
      width: '100%',
      panelClass: 'view-document-container',
      data: {
        haulageOfferId: this.item?.id,
      },
    });
  }
}
