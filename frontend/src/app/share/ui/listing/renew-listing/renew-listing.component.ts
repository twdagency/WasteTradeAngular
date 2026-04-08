import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ListingService } from 'app/services/listing.service';
import { scrollToFirstInvalidControl } from 'app/utils/form.utils';
import { catchError, EMPTY, finalize } from 'rxjs';

enum RENEWAL_PERIOD {
  TWO_WEEKS = '2_weeks',
  NINETY_DAYS = '90_days',
}

@Component({
  selector: 'app-renew-listing',
  templateUrl: './renew-listing.component.html',
  styleUrls: ['./renew-listing.component.scss'],
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatRadioModule,
    MatButtonModule,
    TranslateModule,
    MatIconModule,
    DatePipe,
  ],
  providers: [TranslatePipe, DatePipe],
})
export class RenewListingComponent implements OnInit {
  RENEWAL_PERIOD = RENEWAL_PERIOD;

  readonly dialogRef = inject(MatDialogRef);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  listingService = inject(ListingService);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);
  datePipe = inject(DatePipe);

  endDate = this.data.endDate;
  expiryInfo = this.data.expiryInfo;

  isExpired = computed(() => this.expiryInfo()?.isExpired ?? true);

  newEndDate = computed(() => {
    const base = this.isExpired() ? new Date() : new Date(this.endDate());

    const twoWeeksDate = new Date(base.getTime());
    const ninetyDaysDate = new Date(base.getTime());

    return {
      twoWeeks: twoWeeksDate.setDate(twoWeeksDate.getDate() + 14),
      ninetyDays: ninetyDaysDate.setDate(ninetyDaysDate.getDate() + 90),
    };
  });
  submitting = signal(false);

  formGroup = new FormGroup({
    renewalPeriod: new FormControl<RENEWAL_PERIOD | null>(RENEWAL_PERIOD.TWO_WEEKS),
  });

  constructor() {}

  ngOnInit() {}

  close() {
    this.dialogRef.close(false);
  }

  submit() {
    if (this.formGroup.invalid) {
      scrollToFirstInvalidControl(this.formGroup);
      return;
    }

    const payload = this.formGroup.value;
    this.submitting.set(true);
    this.listingService
      .renewListing(this.data.listingId, payload)
      .pipe(
        catchError((err) => {
          if (err) {
            this.snackBar.open(
              this.translate.transform(
                'We couldn’t renew this listing right now. Please try again. If the problem persists, contact support.',
              ),
            );
            this.dialogRef.close(false);
          }
          return EMPTY;
        }),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe((res) => {
        if (res) {
          const newEndDateFormatted = this.datePipe.transform(res.data.newEndDate, 'dd/MM/yyyy');
          this.snackBar.open(
            this.translate.transform(localized$(`Listing renewed. New end date: ${newEndDateFormatted}`)),
          );
          this.dialogRef.close(true);
        }
      });
  }
}
