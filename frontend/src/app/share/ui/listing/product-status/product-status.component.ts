import { Component, effect, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ListingMaterial, ListingState, ListingStatus, ListingType } from 'app/models';
import { Listing } from 'app/models/listing-material-detail.model';
import { ProductStatus } from 'app/models/product.model';
import moment from 'moment';

@Component({
  selector: 'app-product-status',
  imports: [MatIconModule, TranslateModule],
  templateUrl: './product-status.component.html',
  styleUrl: './product-status.component.scss',
})
export class ProductStatusComponent {
  product = input<ListingMaterial | Listing | undefined>(undefined);
  /**
   * Listing detail already shows review/pending elsewhere; use pre-change pill behaviour
   * (renewal → Ongoing, no Pending in this pill).
   */
  suppressPendingPill = input(false);
  status = signal<ProductStatus | undefined>(undefined);
  ProductStatus = ProductStatus;
  fromDate = signal<string | undefined>(undefined);
  /** Reset date for SOLD ongoing listings (Available from date) */
  resetDate = signal<string | undefined>(undefined);
  /** Sell renewal listing: start date is still a future calendar day → show Available From, not Ongoing */
  listingStartIsFutureDay = signal(false);

  constructor() {
    effect(() => {
      const product = this.product();
      if (!product) {
        this.listingStartIsFutureDay.set(false);
        return;
      }

      this.resetDate.set(undefined);
      this.fromDate.set(undefined);

      const listingType = product.listingType;
      const now = new Date();
      const startDate = product ? product!.startDate : undefined;
      const endDate = product ? product!.endDate : undefined;
      const isPending =
        product.state === ListingState.PENDING || product.status === ListingStatus.PENDING;
      const startDay = startDate ? moment(startDate).startOf('day') : null;
      const todayStart = moment().startOf('day');
      const isFutureProduct = startDay ? startDay.isAfter(todayStart) : false;
      this.listingStartIsFutureDay.set(!!startDay && startDay.isAfter(todayStart));
      const isExpired =
        listingType === ListingType.WANTED
          ? false
          : endDate
            ? moment(endDate).isBefore(now)
            : undefined;
      const isSold = product.status === 'sold';
      const hasRenewalPeriod = !!product.listingRenewalPeriod;
      const isOnGoing = (product.remainingQuantity ?? 0) < (product.quantity ?? 0);

      if (isSold) {
        // For ongoing listings, show reset date (Available from endDate)
        if (hasRenewalPeriod && endDate) {
          this.resetDate.set(moment(endDate).format('DD/MM/YYYY'));
        }
        this.status.set(ProductStatus.Sold);
        return;
      }

      if (isPending && !this.suppressPendingPill()) {
        this.status.set(ProductStatus.Pending);
        return;
      }

      if (isExpired) {
        this.status.set(ProductStatus.Expired);
        return;
      }

      if (isFutureProduct && startDate) {
        this.fromDate.set(moment(startDate).format('DD/MM/YYYY'));
        this.status.set(listingType === ListingType.SELL ? ProductStatus.Available : ProductStatus.Required);
        return;
      }

      if (isOnGoing) {
        this.status.set(ProductStatus.Ongoing);
        return;
      }

      this.status.set(listingType === ListingType.SELL ? ProductStatus.Available : ProductStatus.Required);
    });
  }
}
