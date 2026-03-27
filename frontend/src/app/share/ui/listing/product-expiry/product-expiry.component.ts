import { Component, computed, DestroyRef, EventEmitter, inject, input, Output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { ListingState, ListingStatus } from 'app/models';
import { ListingMaterialDetail } from 'app/models/listing-material-detail.model';
import { AuthService } from 'app/services/auth.service';
import { ListingService } from 'app/services/listing.service';
import { map } from 'rxjs';
import { RenewListingComponent } from '../renew-listing/renew-listing.component';

@Component({
  selector: 'app-product-expiry',
  imports: [MatIconModule, TranslateModule],
  templateUrl: './product-expiry.component.html',
  styleUrl: './product-expiry.component.scss',
})
export class ProductExpiryComponent {
  listingDetail = input<ListingMaterialDetail | undefined>();
  auth = inject(AuthService);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  listingService = inject(ListingService);
  destroyRef = inject(DestroyRef);

  @Output() renewListing: EventEmitter<boolean> = new EventEmitter();

  userId = toSignal(this.auth.user$.pipe(map((user) => user?.userId)));
  isOwnListing = computed(() => this.userId() === this.listingDetail()?.listing.createdByUserId);

  canShow = computed(() => this.listingDetail()?.listing?.status !== 'sold');
  canManualRenew = computed(() => {
    const listing = this.listingDetail()?.listing;
    if (!listing) return false;

    const isSell = listing?.listingType === 'sell';
    const isApproved = listing?.state === ListingState.APPROVED;
    const notSold = listing?.status !== ListingStatus.SOLD;
    const ongoing = listing.listingRenewalPeriod === null;
    return isSell && isApproved && notSold && ongoing;
  });

  // Use backend expiryInfo instead of manual calculation
  expiryInfo = computed(() => this.listingDetail()?.listing?.expiryInfo);

  daysUntilExpiry = computed(() => this.expiryInfo()?.daysUntilExpiry ?? 0);

  isNearingExpiry = computed(() => this.expiryInfo()?.isNearingExpiry ?? false);

  isExpired = computed(() => this.expiryInfo()?.isExpired ?? true);

  endDate = computed(() => this.listingDetail()?.listing?.endDate ?? null);

  openRenewModal() {
    const ref = this.dialog.open(RenewListingComponent, {
      maxWidth: '900px',
      maxHeight: '85vh',
      minWidth: '800px',
      data: {
        endDate: this.endDate,
        expiryInfo: this.expiryInfo,
        listingId: this.listingDetail()?.listing.id,
      },
    });

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res) {
          this.renewListing.emit(res);
        }
      });
  }
}
