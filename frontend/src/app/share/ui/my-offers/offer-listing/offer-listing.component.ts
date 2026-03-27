import { TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { GaEventName } from 'app/constants/ga-event';
import { ListingStatus } from 'app/models';
import { OfferListingItem, OfferStatus } from 'app/models/offer';
import { AnalyticsService } from 'app/services/analytics.service';
import { OfferService } from 'app/services/offer.service';
import {
  getCompanyStatusColor,
  getCompanyStatusLabel,
  getCurrencySignal,
  getOfferStatusColor,
} from 'app/share/utils/offer';
import { finalize } from 'rxjs';
import { PaginationComponent } from '../../listing/pagination/pagination.component';
import { RejectReasonComponent } from '../reject-reason/reject-reason.component';

@Component({
  selector: 'app-offer-listing',
  imports: [
    PaginationComponent,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    RouterModule,
    TitleCasePipe,
    TranslateModule,
  ],
  providers: [TranslatePipe],
  templateUrl: './offer-listing.component.html',
  styleUrl: './offer-listing.component.scss',
})
export class OfferListingComponent {
  @Input() totalItems: number = 0;
  @Input() page: number = 1;
  @Input() items: OfferListingItem[] = [];
  @Output() pageChange = new EventEmitter<number>();
  @Output() refresh = new EventEmitter<void>();

  actionLoading = signal(false);
  getOfferStatusColor = getOfferStatusColor;
  getCompanyStatusColor = getCompanyStatusColor;
  getCompanyStatusLabel = getCompanyStatusLabel;
  getCurrencySignal = getCurrencySignal;

  constructor(
    private offerService: OfferService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private translate: TranslatePipe,
    private analyticsService: AnalyticsService,
  ) {}

  canAcceptReject(status: OfferStatus) {
    return status === OfferStatus.APPROVED;
  }

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }

  onAccept(item: OfferListingItem) {
    if (this.actionLoading()) {
      return;
    }

    this.actionLoading.set(true);
    this.offerService
      .acceptBid(item.id)
      .pipe(
        finalize(() => {
          this.actionLoading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.snackBar.open(this.translate.transform(localized$('Bid accepted successfully.')));
          this.analyticsService.trackEvent(GaEventName.PURCHASE, {
            transaction_id: item.id,
            value: item.value,
            currency: item.currency,
            item: item.listingId,
          });
          this.refresh.emit();
        },
        error: () => {
          this.snackBar.open(
            this.translate.transform(
              localized$('Failed to accept the bid. Please check your network connection and try again.'),
            ),
          );
        },
      });
  }

  onReject(item: OfferListingItem) {
    if (this.actionLoading()) {
      return;
    }

    this.actionLoading.set(true);
    const dialogRef = this.dialog.open(RejectReasonComponent, {
      maxWidth: '500px',
      width: '100%',
      panelClass: 'px-3',
    });

    dialogRef
      .afterClosed()
      .pipe(
        finalize(() => {
          this.actionLoading.set(false);
        }),
      )
      .subscribe((reason) => {
        if (!reason) {
          return;
        }

        this.offerService.rejectBid(item.id, reason).subscribe({
          next: () => {
            this.snackBar.open(this.translate.transform(localized$('Bid rejected successfully.')));
            this.refresh.emit();
          },
          error: () => {
            this.snackBar.open(
              this.translate.transform(localized$('Failed to reject the bid. Please try again later.')),
            );
          },
        });
      });
  }

  mappingListingStatus(status?: ListingStatus) {
    switch (status) {
      case ListingStatus.SOLD:
        return localized$('Fulfilled');
      case ListingStatus.AVAILABLE:
        return localized$('available');
      case ListingStatus.PENDING:
        return localized$('pending');
      case ListingStatus.REJECTED:
        return localized$('rejected');
      case ListingStatus.EXPIRED:
        return localized$('Expired');
      default:
        return status;
    }
  }
}
