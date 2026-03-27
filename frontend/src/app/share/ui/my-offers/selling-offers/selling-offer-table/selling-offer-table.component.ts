import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { FallbackImageDirective } from '@app/directives';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { OfferStatus, TableSellingOfferItem } from 'app/models/offer';
import { getListingFeatureImage, getOfferStatusColor } from 'app/share/utils/offer';
import { addLanguagePrefix } from 'app/utils/language.utils';
import { PaginationComponent } from '../../../listing/pagination/pagination.component';

@Component({
  selector: 'app-selling-offer-table',
  imports: [
    PaginationComponent,
    MatButtonModule,
    RouterModule,
    FallbackImageDirective,
    TitleCasePipe,
    DecimalPipe,
    TranslateModule,
  ],
  templateUrl: './selling-offer-table.component.html',
  styleUrl: './selling-offer-table.component.scss',
})
export class SellingOfferTableComponent {
  @Input() totalItems: number = 0;
  @Input() page: number = 1;
  @Input() items: TableSellingOfferItem[] = [];
  @Output() pageChange = new EventEmitter<number>();

  router = inject(Router);

  getOfferStatusColor = getOfferStatusColor;
  getListingFeatureImage = getListingFeatureImage;

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }

  mapOfferStatusToLabel(status: OfferStatus) {
    switch (status) {
      case OfferStatus.ACCEPTED:
        return localized$('Accepted');
      case OfferStatus.REJECTED:
        return localized$('Rejected');
      case OfferStatus.PENDING:
        return localized$('Pending');
      case OfferStatus.APPROVED:
        return localized$('Approved');
      case OfferStatus.SHIPPED:
        return localized$('Shipped');
      default:
        return localized$('Unknown');
    }
  }

  view(id: number) {
    if (!id) return;
    // this.router.navigate([addLanguagePrefix(ROUTES_WITH_SLASH.offerDetail), id]);
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.offerDetail}/${id}`);
  }
}
