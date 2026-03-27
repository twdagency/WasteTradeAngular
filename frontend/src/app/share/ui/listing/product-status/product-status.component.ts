import { Component, effect, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ListingMaterial, ListingState, ListingType } from 'app/models';
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
  status = signal<ProductStatus | undefined>(undefined);
  ProductStatus = ProductStatus;
  fromDate = signal<string | undefined>(undefined);
  /** Reset date for SOLD ongoing listings (Available from date) */
  resetDate = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const product = this.product();
      if (!product) {
        return;
      }

      this.resetDate.set(undefined);

      const listingType = product.listingType;
      const now = new Date();
      const startDate = product ? product!.startDate : undefined;
      const endDate = product ? product!.endDate : undefined;
      const isPending = product.state === ListingState.PENDING;
      const isFutureProduct = startDate ? moment(startDate).isAfter(now) : undefined;
      const isExpired = endDate ? moment(endDate).isBefore(now) : undefined;
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

      if (isPending) {
        this.status.set(ProductStatus.Pending);
        return;
      }

      if (isExpired) {
        this.status.set(ProductStatus.Expired);
        return;
      }

      if (isFutureProduct) {
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
