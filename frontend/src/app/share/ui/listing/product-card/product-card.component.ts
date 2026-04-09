import { DecimalPipe, NgClass } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, Output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FallbackImageDirective } from '@app/directives';
import { mapCountryCodeToName } from '@app/statics';
import { TranslateModule } from '@ngx-translate/core';
import { ListingImageType, ListingMaterial, ListingState, ListingStatus, ListingType } from 'app/models';
import { AuthService } from 'app/services/auth.service';
import { getListingTitle } from 'app/share/utils/offer';
import moment from 'moment';
import { map } from 'rxjs';
import { ProductStatusComponent } from '../product-status/product-status.component';

type ProductCardVisualStatus = 'available' | 'required' | 'sold' | 'pending' | 'ongoing';

@Component({
  selector: 'app-product-card',
  imports: [
    MatIconModule,
    ProductStatusComponent,
    FallbackImageDirective,
    TranslateModule,
    DecimalPipe,
    MatTooltipModule,
    NgClass,
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input() materialInterest = true;
  @Input({ required: true }) product: ListingMaterial | undefined;
  @Input() deletable: boolean = false;
  @Output() delete = new EventEmitter();

  auth = inject(AuthService);

  mapCountryCodeToName = mapCountryCodeToName;
  getListingTitle = getListingTitle;
  userId = toSignal(this.auth.user$.pipe(map((user) => user?.userId)));
  isOwnListing = computed(() => this.userId() === this.product?.createdByUserId);

  get statusBorderClass(): string {
    const product = this.product;
    if (!product) {
      return 'border-thin';
    }

    const statusToken = this.resolveVisualStatus(product);
    if (statusToken === 'sold') {
      return 'border-thin-sold';
    }

    if (statusToken === 'pending') {
      return 'border-thin-pending';
    }

    if (statusToken === 'required') {
      return 'border-thin-required';
    }

    if (statusToken === 'ongoing') {
      return 'border-thin-ongoing';
    }

    return 'border-thin';
  }

  /** Matches app-product-status pill styling for detail icons. */
  get statusVisualKey(): string {
    if (!this.product) {
      return 'available';
    }
    return this.resolveVisualStatus(this.product);
  }

  /** Metric tonnes for “Quantity available” (listing detail semantics). */
  get quantityAvailableMt(): number | null {
    const p = this.product;
    if (!p) {
      return null;
    }

    const tw = p.totalWeight;
    if (tw != null && tw > 0) {
      return tw;
    }

    const q = p.quantity;
    const perLoad = p.materialWeightPerUnit;
    if (q != null && perLoad != null && q > 0 && perLoad > 0) {
      return q * perLoad;
    }

    if (p.listingType === ListingType.WANTED && p.materialWeightWanted != null && p.materialWeightWanted > 0) {
      return p.materialWeightWanted;
    }

    return null;
  }

  constructor() {}

  get featureImage() {
    return this.product?.documents?.find((i) => i.documentType === ListingImageType.FEATURE_IMAGE)?.documentUrl ?? '';
  }

  onDelete(e: MouseEvent) {
    if (this.product?.hasPendingOffer) return;

    e.preventDefault();
    e.stopPropagation();

    this.delete.emit();
  }

  private resolveVisualStatus(product: ListingMaterial): ProductCardVisualStatus {
    const statusValue = (product.status ?? '').toString().toLowerCase();
    const listingType = product.listingType;
    const now = new Date();
    const startDate = product.startDate;
    const endDate = product.endDate;

    const isPending = product.state === ListingState.PENDING || statusValue === ListingStatus.PENDING;
    const isExpired = (endDate ? moment(endDate).isBefore(now) : false) || statusValue === ListingStatus.EXPIRED;
    const isSold = statusValue === ListingStatus.SOLD;
    const isOngoing = (product.remainingQuantity ?? 0) < (product.quantity ?? 0);
    const isFutureProduct = startDate ? moment(startDate).isAfter(now) : false;

    if (isSold) {
      return 'sold';
    }

    if (isPending) {
      return 'pending';
    }

    if (isExpired) {
      return 'required';
    }

    if (isFutureProduct) {
      return listingType === ListingType.SELL ? 'available' : 'required';
    }

    if (isOngoing) {
      return 'ongoing';
    }

    if (listingType === ListingType.WANTED) {
      return 'required';
    }

    return 'available';
  }
}
