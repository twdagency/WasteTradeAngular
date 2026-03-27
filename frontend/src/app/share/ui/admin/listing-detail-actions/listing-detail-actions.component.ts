import {
  Component,
  computed,
  EventEmitter,
  inject,
  Injector,
  input,
  Output,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ListingState } from 'app/models';
import { AdminListingDetail } from 'app/models/admin/listing.model';
import { AdminListingService } from 'app/services/admin/admin-listing.service';
import { ListingRequestActionEnum } from 'app/types/requests/admin';
import { catchError, EMPTY, finalize, switchMap, tap } from 'rxjs';
import { RejectModalComponent } from '../reject-modal/reject-modal.component';

@Component({
  selector: 'app-listing-detail-actions',
  imports: [MatButtonModule, MatSnackBarModule, TranslateModule],
  templateUrl: './listing-detail-actions.component.html',
  styleUrl: './listing-detail-actions.component.scss',
  providers: [TranslatePipe],
})
export class ListingDetailActionsComponent {
  listingId = input<string | undefined>(undefined);
  listing = input<AdminListingDetail | undefined>(undefined);
  canRequestInformation = input<boolean>(true);
  @Output() refresh = new EventEmitter<void>();

  adminListingService = inject(AdminListingService);
  dialogService = inject(MatDialog);
  snackbar = inject(MatSnackBar);
  injector = inject(Injector);
  translate = inject(TranslatePipe);

  canAction = computed(() => this.listing()?.bidStatus.state === ListingState.PENDING);
  submitting = signal<'accept' | 'reject' | 'request' | undefined>(undefined);

  onApprove = () => {
    const listingId = this.listingId();
    if (!listingId || this.submitting()) {
      return;
    }

    this.submitting.set('accept');
    runInInjectionContext(this.injector, () => {
      this.adminListingService
        .callAction(listingId, ListingRequestActionEnum.ACCEPT, {})
        .pipe(
          tap(() => {
            this.snackbar.open(this.translate.transform(localized$('The approval action was sent successfully.')));
            this.refresh.emit();
          }),
          catchError(() => {
            this.snackbar.open(
              this.translate.transform(localized$('Unable to process the approval action. Please try again.')),
            );
            return EMPTY;
          }),
          takeUntilDestroyed(),
          finalize(() => {
            this.submitting.set(undefined);
          }),
        )
        .subscribe();
    });
  };

  onReject = () => {
    const listingId = this.listingId();
    if (!listingId || this.submitting()) {
      return;
    }

    this.submitting.set('reject');
    const dataConfig: MatDialogConfig = {
      width: '100%',
      maxWidth: '960px',
    };
    const dialogRef = this.dialogService.open(RejectModalComponent, dataConfig);

    runInInjectionContext(this.injector, () => {
      dialogRef
        .afterClosed()
        .pipe(
          switchMap((params) => {
            if (!params) {
              return EMPTY;
            }

            return this.adminListingService.callAction(listingId, ListingRequestActionEnum.REJECT, params);
          }),
          tap(() => {
            this.refresh.emit();
            this.snackbar.open(this.translate.transform(localized$('The rejection action was sent successfully.')));
          }),
          catchError(() => {
            this.snackbar.open(
              this.translate.transform(localized$('Unable to process the rejection action. Please try again.')),
            );
            return EMPTY;
          }),
          takeUntilDestroyed(),
          finalize(() => {
            this.submitting.set(undefined);
          }),
        )
        .subscribe();
    });
  };

  onRequestMoreInformation = () => {
    const listingId = this.listingId();
    if (!listingId || this.submitting()) {
      return;
    }

    this.submitting.set('request');
    runInInjectionContext(this.injector, () => {
      this.adminListingService
        .callAction(listingId, ListingRequestActionEnum.REQUEST_INFORMATION, {})
        .pipe(
          tap(() => {
            this.snackbar.open(
              this.translate.transform(localized$('The request information action was sent successfully.')),
            );
            this.refresh.emit();
          }),
          catchError(() => {
            this.snackbar.open(this.translate.transform(localized$('Unable to send the message. Please try again.')));
            return EMPTY;
          }),
          takeUntilDestroyed(),
          finalize(() => {
            this.submitting.set(undefined);
          }),
        )
        .subscribe();
    });
  };
}
