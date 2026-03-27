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
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { AdminCommercialService } from 'app/services/admin/admin-commercial.service';
import { MemberRequestActionEnum } from 'app/types/requests/admin';
import { catchError, EMPTY, finalize, switchMap, tap } from 'rxjs';
import { AdminMemberRequestInforComponent } from '../../commercial/admin-member-request-infor/admin-member-request-infor.component';
import { RejectModalComponent } from '../../reject-modal/reject-modal.component';

@Component({
  selector: 'app-member-detail-actions',
  imports: [MatButtonModule, MatSnackBarModule, MatDialogModule, TranslateModule],
  providers: [TranslatePipe],
  templateUrl: './member-detail-actions.component.html',
  styleUrl: './member-detail-actions.component.scss',
})
export class MemberDetailActionsComponent {
  @Output() refresh = new EventEmitter<void>();

  dialogService = inject(MatDialog);
  translate = inject(TranslatePipe);
  snackbar = inject(MatSnackBar);
  injector = inject(Injector);
  adminCommercialService = inject(AdminCommercialService);

  user = input<any>();

  submitting = signal<'accept' | 'reject' | 'request' | undefined>(undefined);
  canAction = computed(() => (this.user().state = 'pending'));

  onApprove = () => {
    const userId = this.user().id;
    if (!userId || this.submitting()) {
      return;
    }
    this.submitting.set('accept');

    runInInjectionContext(this.injector, () => {
      this.adminCommercialService
        .callAction({
          id: userId,
          action: MemberRequestActionEnum.ACCEPT,
        })
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
    const userId = this.user().id;
    if (!userId || this.submitting()) {
      return;
    }

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

            this.submitting.set('reject');
            return this.adminCommercialService.callAction({
              id: userId,
              action: MemberRequestActionEnum.REJECT,
              ...params,
            });
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

  onRequestInfo = () => {};

  onRequestMoreInformation() {
    const userId = this.user().id;
    if (!userId || this.submitting()) {
      return;
    }

    const dataConfig: MatDialogConfig = {
      width: '100%',
      maxWidth: '960px',
    };
    const dialogRef = this.dialogService.open(AdminMemberRequestInforComponent, dataConfig);

    runInInjectionContext(this.injector, () => {
      dialogRef
        .afterClosed()
        .pipe(
          switchMap((params) => {
            if (!params) {
              return EMPTY;
            }

            this.submitting.set('request');

            return this.adminCommercialService.callAction({
              id: userId,
              action: MemberRequestActionEnum.REQUEST_INFORMATION,
              ...params,
            });
          }),
          tap(() => {
            this.refresh.emit();
            this.snackbar.open(
              this.translate.transform(localized$('The request information action was sent successfully.')),
            );
          }),
          catchError(() => {
            this.snackbar.open(
              this.translate.transform(localized$('Unable to request more information. Please try again.')),
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
  }
}
