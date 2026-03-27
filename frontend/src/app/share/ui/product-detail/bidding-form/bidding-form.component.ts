import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { FULL_PAGINATION_LIMIT } from 'app/constants/common';
import { GaEventName } from 'app/constants/ga-event';
import { IconComponent } from 'app/layout/common/icon/icon.component';
import { CompanyLocation } from 'app/models';
import { Currency } from 'app/models/currency';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { OfferService } from 'app/services/offer.service';
import { RequestCreateBidParams } from 'app/types/requests/offer';
import { catchError, finalize, map, tap } from 'rxjs';

export type BiddingFormProps = {
  listingId: number;
  availableQuantity: number;
};

const INCOTERM_REQUIRED_SHIPPING = ['FAS', 'FOB', 'CFR', 'CIF'];

@Component({
  selector: 'app-bidding-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    IconComponent,
    MatButtonModule,
    MatDatepickerModule,
    MatSnackBarModule,
    TranslateModule,
    MatDialogModule,
  ],
  providers: [OfferService, TranslatePipe],
  templateUrl: './bidding-form.component.html',
  styleUrl: './bidding-form.component.scss',
})
export class BiddingFormComponent implements OnInit {
  offerService = inject(OfferService);
  authService = inject(AuthService);
  readonly dialogRef = inject(MatDialogRef<BiddingFormComponent>);
  readonly props = inject<BiddingFormProps>(MAT_DIALOG_DATA);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslatePipe);
  private analyticsService = inject(AnalyticsService);

  readonly Currency = Currency;

  private validateRange = (group: AbstractControl): ValidationErrors | null => {
    const earliestDate = group.get('earliestDeliveryDate')?.value;
    const latestDate = group.get('latestDeliveryDate')?.value;

    if (earliestDate && latestDate) {
      const earliest = new Date(earliestDate);
      const latest = new Date(latestDate);

      if (latest < earliest) {
        return { invalidRange: true };
      }
    }
    return null;
  };

  shippingPortRequiredValidator(group: AbstractControl): ValidationErrors | null {
    const incoterms = group.get('incoterms')?.value ?? '';
    const shippingPort = group.get('shippingPort')?.value ?? '';
    if (INCOTERM_REQUIRED_SHIPPING.includes(incoterms) && !shippingPort) {
      group.get('shippingPort')?.setErrors({ required: true });
      return { shippingPortRequired: true };
    } else {
      // Remove the error if not required
      if (group.get('shippingPort')?.hasError('required')) {
        group.get('shippingPort')?.setErrors(null);
      }
    }
    return null;
  }

  formGroup = new FormGroup(
    {
      location: new FormControl<string | null>('', [Validators.required]),
      offerValidDate: new FormControl<string | null>(null, []),
      earliestDeliveryDate: new FormControl<string | null>(null, []),
      latestDeliveryDate: new FormControl<string | null>(null, []),
      loadBidOn: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(1),
        Validators.max(this.props.availableQuantity),
      ]),
      currency: new FormControl<string | null>('gbp', [Validators.required]),
      pricePerMetric: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
      incoterms: new FormControl<string | null>(null, [Validators.required]),
      shippingPort: new FormControl<string>('', [Validators.maxLength(100)]), // Removed Validators.required here
    },
    {
      validators: [this.validateRange, this.shippingPortRequiredValidator.bind(this)],
    },
  );

  todayDate = new Date();
  submitting = signal(false);
  locations = signal<CompanyLocation[]>([]);

  get isShowShippingPort() {
    return INCOTERM_REQUIRED_SHIPPING.includes(this.formGroup.get('incoterms')?.value ?? '');
  }

  ngOnInit() {
    const user = this.authService.user!;
    this.authService
      .getCompanyLocation({ companyId: user.companyId, limit: FULL_PAGINATION_LIMIT, page: 1 })
      .pipe(map((res) => res.results))
      .subscribe((locations) => {
        this.locations.set(locations);
      });

    // Re-validate when incoterms changes
    this.formGroup.get('incoterms')?.valueChanges.subscribe(() => {
      this.formGroup.updateValueAndValidity();
    });
  }

  close() {
    this.dialogRef.close(false);
  }

  submit() {
    if (this.submitting()) {
      return;
    }

    this.formGroup.markAllAsTouched();
    if (!this.formGroup.valid) {
      console.log(this.formGroup.controls);
      return;
    }

    this.submitting.set(true);
    const value = this.formGroup.value;
    const user = this.authService.user!;

    const params: RequestCreateBidParams = {
      listingType: 'sell',
      listingId: this.props.listingId,
      companyId: user.companyId,
      locationId: Number(value.location),
      createdByUserId: user.user.id,
      quantity: Number(value.loadBidOn),
      offeredPricePerUnit: Number(value.pricePerMetric),
      currency: value.currency!,
      incoterms: value.incoterms!,
      shippingPort: this.isShowShippingPort ? value.shippingPort! : undefined,
      earliestDeliveryDate: value.earliestDeliveryDate!,
      latestDeliveryDate: value.latestDeliveryDate!,
      expiresAt: value.offerValidDate!,
    };

    this.offerService
      .createBid(params)
      .pipe(
        tap(() => {
          this.analyticsService.trackEvent(GaEventName.BID_PLACED, {
            item_id: params.listingId,
            value: params.offeredPricePerUnit,
            currency: params.currency,
          });
          this.snackBar.open(this.translate.transform(localized$('Your bid has been successfully created.')));
          this.dialogRef.close();
        }),
        catchError((err) => {
          this.snackBar.open(
            this.translate.transform(
              localized$('Failed to submit your bid due to a system error. Please try again later.'),
            ),
          );
          throw err;
        }),
        finalize(() => {
          this.submitting.set(false);
        }),
      )
      .subscribe();
  }
}
