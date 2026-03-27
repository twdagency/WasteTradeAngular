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
import { Router } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { OfferRequestActionEnum, OfferState, OfferStatus } from 'app/models/offer';
import { AdminOfferService } from 'app/services/admin/admin-offer.service';
import { OfferDetail } from 'app/types/requests/offer';
import { catchError, EMPTY, finalize, switchMap, tap } from 'rxjs';
import { RejectModalComponent } from '../reject-modal/reject-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-offer-detail-actions',
  imports: [MatButtonModule, MatSnackBarModule, TranslateModule, MatTooltipModule],
  templateUrl: './offer-detail-actions.component.html',
  styleUrl: './offer-detail-actions.component.scss',
  providers: [TranslatePipe],
})
export class OfferDetailActionsComponent {
  offerId = input<string | undefined>(undefined);
  // todo: refactor
  offer = input<OfferDetail | undefined>(undefined);
  @Output() refresh = new EventEmitter<void>();
  submitting = signal<'accept' | 'reject' | undefined>(undefined);

  adminOfferService = inject(AdminOfferService);
  dialogService = inject(MatDialog);
  snackbar = inject(MatSnackBar);
  injector = inject(Injector);
  translate = inject(TranslatePipe);
  route = inject(Router);

  canAction = computed(() => this.offer()?.offer.state === OfferState.PENDING);
  canMakeHaulierOffer = computed(() => this.offer()?.offer.status === OfferStatus.ACCEPTED);

  onApprove = () => {
    const offerId = this.offerId();
    if (!offerId || this.submitting()) {
      return;
    }

    this.submitting.set('accept');
    runInInjectionContext(this.injector, () => {
      this.adminOfferService
        .callAction(offerId, OfferRequestActionEnum.ACCEPT, {})
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
    const offerId = this.offerId();
    if (!offerId || this.submitting()) {
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

            return this.adminOfferService.callAction(offerId, OfferRequestActionEnum.REJECT, params);
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

  makeHaulierOffer() {
    const offerId = this.offerId();
    if (!offerId || this.submitting()) {
      return;
    }
    this.route.navigate([ROUTES_WITH_SLASH.adminMakeOffer, offerId]);
  }
}
