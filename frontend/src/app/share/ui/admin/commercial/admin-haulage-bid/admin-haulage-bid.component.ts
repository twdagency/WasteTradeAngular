import { DecimalPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { getStatusColor, HaulageBidItem } from 'app/models/admin/haulage-bid.model';
import { Currency } from 'app/models/currency';
import { AdminHaulageService } from 'app/services/admin/admin-haulage.service';
import { allFilters } from 'app/share/ui/listing/filter/constant';
import { FilterComponent } from 'app/share/ui/listing/filter/filter.component';
import { PaginationComponent } from 'app/share/ui/listing/pagination/pagination.component';
import { NotesRefreshService } from 'app/share/ui/notes/service/notes-refresh.service';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { scrollTop } from 'app/share/utils/common';
import { getListingTitle } from 'app/share/utils/offer';
import { ItemOf } from 'app/types/utils';
import moment from 'moment';
import { catchError, finalize, of } from 'rxjs';
import { HaulageBidListingItemComponent } from '../haulage-bid-listing-item/haulage-bid-listing-item.component';
import { ListContainerComponent } from 'app/share/ui/list-container/list-container.component';

const RATES: Record<Currency, number> = {
  [Currency.gbp]: 1,
  [Currency.usd]: 1.25,
  [Currency.eur]: 1.15,
};

export interface AdminHaulageBidFilterParams {
  skip: number;
  limit: number;
  where: {
    offerId?: number;
    searchTerm?: string;
    date?: string;
    material?: string;
    status?: string;
    state?: string;
    or?: any[];
  };
}

const PAGE_SIZE = 20;

enum HaulageBidStatus {
  Unverified = 'unverified',
  Verified = 'verified',
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Accepted = 'accepted',
  Unsuccessful = 'unsuccessful',
  Inactive = 'inactive',
  Blocked = 'blocked',
  Withdrawn = 'withdrawn',
}

@Component({
  selector: 'app-admin-haulage-bid',
  templateUrl: './admin-haulage-bid.component.html',
  styleUrls: ['./admin-haulage-bid.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    HaulageBidListingItemComponent,
    TranslateModule,
    ListContainerComponent,
  ],
  providers: [TranslatePipe, DecimalPipe],
})
export class AdminHaulageBidComponent implements OnInit {
  adminHaulageService = inject(AdminHaulageService);
  private decimal = inject(DecimalPipe);

  ngOnInit() {}

  getTransformedBid(bid: HaulageBidItem) {
    if (!bid) return null;

    const bidTotalGbp = this.getBidTotalGbp(bid);
    const finalSellerTotalGbp = bid?.financial?.finalSellerTotal ?? 0;
    const sellerOfferPerMtGbp = this.getSellerOfferPerMtGbp(bid);
    const listing = bid?.listing;

    return {
      ...bid,
      color: getStatusColor(bid.statusColor),
      buyerOffer: this.getBuyerOffer(bid),
      bidTotalGbp,
      sellerOffer: [sellerOfferPerMtGbp, this.convertGbpToEur(sellerOfferPerMtGbp)],
      haulageOffer: this.getHaulageTotalDisplay(bid),
      sellerTotal: [finalSellerTotalGbp, this.convertGbpToEur(finalSellerTotalGbp)],
      materialName: getListingTitle({
        ...listing,
        materialForm: bid?.materialForm,
        materialFinishing: bid?.materialFinishing,
        materialGrading: bid?.materialGrading,
      }),
    };
  }

  private getBuyerOffer(bid: HaulageBidItem): string {
    const amount = bid?.offer?.pricePerMetricTonne ?? 0;
    const formatted = this.decimal.transform(amount, '1.0-2');
    return `${this.currencySymbol(bid?.offer?.currency)}${formatted}/MT`;
  }

  private getHaulageTotalDisplay(bid: HaulageBidItem): string {
    const amount = bid?.haulageTotal ?? 0;
    const formatted = this.decimal.transform(amount, '1.0-2');
    return `${this.currencySymbol(bid?.currency ?? bid?.offer?.currency)}${formatted}`;
  }

  private getTotalWeight(bid: HaulageBidItem): number {
    return (bid?.quantityPerLoad ?? 0) * (bid?.numberOfLoads ?? 0);
  }

  private getBidTotalGbp(bid: HaulageBidItem): number {
    const totalWeight = this.getTotalWeight(bid);
    const pricePerMt = bid?.offer?.pricePerMetricTonne ?? 0;
    const currency = bid?.offer?.currency ?? Currency.gbp;
    return this.convertAmountToGbpWithMarkup(pricePerMt, currency) * totalWeight;
  }

  private getSellerOfferPerMtGbp(bid: HaulageBidItem): number {
    const totalWeight = this.getTotalWeight(bid);
    return totalWeight ? (bid?.financial?.finalSellerTotal ?? 0) / totalWeight : 0;
  }

  private convertAmountToGbpWithMarkup(amount: number, fromCurrency?: Currency): number {
    if (!fromCurrency || fromCurrency === Currency.gbp) return amount;
    const rate = RATES[fromCurrency] ?? 1;
    return (amount / rate) * 1.02;
  }

  private convertGbpToEur(amountGbp: number): number {
    return amountGbp * (RATES[Currency.eur] ?? 1.15);
  }

  private currencySymbol(currency?: Currency): string {
    switch (currency) {
      case Currency.eur:
        return '€';
      case Currency.usd:
        return '$';
      default:
        return '£';
    }
  }
}
