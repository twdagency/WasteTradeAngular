import {
  Component,
  computed,
  DestroyRef,
  effect,
  EventEmitter,
  inject,
  input,
  Input,
  OnInit,
  Output,
  Signal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { mapCountryCodeToName } from '@app/statics';
import { noForbiddenPatternsValidator } from '@app/validators';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { User } from 'app/models';
import { Currency } from 'app/models/currency';
import { containerTypeList } from 'app/models/haulage.model';
import { AuthService } from 'app/services/auth.service';
import { HaulageService } from 'app/services/haulage.service';
import { OfferService } from 'app/services/offer.service';
import { getListingTitle } from 'app/share/utils/offer';
import { catchError, combineLatest, debounceTime, distinctUntilChanged, EMPTY, finalize, map, startWith } from 'rxjs';

export interface HaulierUIItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  containerTypes: string[];
  companyId?: number;
  companyName?: string;
  username?: string;
  userId?: number;
  role?: string;
}

@Component({
  selector: 'app-haulier-offer-form',
  templateUrl: './haulier-offer-form.component.html',
  styleUrls: ['./haulier-offer-form.component.scss'],
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatButton,
    MatAutocompleteModule,
  ],
  providers: [OfferService, TranslatePipe],
})
export class HaulierOfferFormComponent implements OnInit {
  submitting = input<boolean>(false);

  hauliers = input<HaulierUIItem[]>([]);
  setupFilterFn = input<(hauliers: HaulierUIItem[], searchTerm: string) => HaulierUIItem[]>();
  displayFn = input<(haulier: HaulierUIItem | null) => string>();

  @Input() isAdminView = false;
  @Input() set offerDetail(value: any) {
    if (!value) return;
    this.offerDetailsSignal.set(value);
    this.offerIdSignal.set(value.offerId ?? this.offerIdSignal());
    this.bindFromValue();
    this.updateMinMaxDates();
  }
  @Input() set offerId(value: number | null) {
    this.offerIdSignal.set(value ?? null);
  }

  @Output() hasChange: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  @Output() formSubmit: EventEmitter<void> = new EventEmitter<void>();

  readonly Currency = Currency;
  ContainerTypeList = containerTypeList;
  mapCountryCodeToName = mapCountryCodeToName;
  getListingTitle = getListingTitle;

  today = new Date();
  minDate: Date | null = null;
  maxDate: Date | null = null;
  guidanceMessage: string = '';

  user: Signal<User | null | undefined>;
  offerDetailsSignal = signal<any>(null);
  saving = signal<boolean>(false);
  offerIdSignal = signal<number | null>(null);
  loading = signal<boolean>(false);
  selectedHaulier = signal<HaulierUIItem | null>(null);
  allHauliers = computed(() => this.hauliers());
  displayFunction = computed(() => {
    const fn = this.displayFn();

    if (fn) {
      return fn;
    }

    if (this.isAdminView) {
      return (haulier: HaulierUIItem | null): string => {
        if (!haulier) return '';
        return `${haulier.firstName} ${haulier.lastName} (${haulier.companyName || ''}) - ${haulier.username}`;
      };
    }

    return (haulier: HaulierUIItem | null): string => {
      if (!haulier) return '';
      return `${haulier.firstName || ''} ${haulier.lastName || ''}`;
    };
  });

  filteredOptions = computed(() => {
    const searchTerm = this.searchTermSignal();
    const currentList = this.allHauliers();
    const filterFn = this.setupFilterFn();

    if (!searchTerm) {
      return currentList;
    }
    if (!filterFn) return currentList;
    return filterFn(currentList, searchTerm);
  });

  isTeamBiding = computed(() => {
    return this.allHauliers().length > 1;
  });

  isDisabledContainer = computed(() => {
    if (this.isAdminView) {
      return this.selectedHaulier() === null;
    }
    return this.isTeamBiding() ? this.selectedHaulier() === null : false;
  });

  containerTypeSupported = computed(() => {
    const normalizeList = (list: any[]): string[] => list || [];

    const userCompany = this.user()?.company;
    const selectedHaulier = this.selectedHaulier();

    if (selectedHaulier && this.isTeamBiding()) {
      const haulierTypesRaw = selectedHaulier.containerTypes ?? [];
      const haulierContainer = haulierTypesRaw.includes('all')
        ? containerTypeList.map((t) => t.value)
        : normalizeList(haulierTypesRaw);

      const adminHaulier = this.allHauliers().find((h) => h.role === 'admin');
      const companyContainer = normalizeList(adminHaulier?.containerTypes ?? []);

      const commonContainers = this.isAdminView
        ? haulierContainer
        : companyContainer.filter((type) => haulierContainer.includes(type));

      return commonContainers;
    }

    if (!userCompany?.isHaulier) {
      return [];
    }

    if (userCompany.containerTypes?.includes('all')) {
      return containerTypeList.map((t) => t.value);
    }

    return normalizeList(userCompany.containerTypes ?? []);
  });

  tooltipMessage = computed(() => {
    return !this.isAdminView
      ? this.isTeamBiding()
        ? this.translate.transform(
            'Only container types associated with your company are enabled here. To update this please contact your company admin.',
          )
        : this.translate.transform(
            'Only container types associated with your Haulier profile are enabled here. To update your container options please update your profile.',
          )
      : this.translate.transform(
          localized$('Only container types associated with the Haulier profile are enabled here.'),
        );
  });

  route = inject(ActivatedRoute);
  offerService = inject(OfferService);
  authService = inject(AuthService);
  haulageService = inject(HaulageService);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);
  router = inject(Router);
  destroyRef = inject(DestroyRef);

  formGroup = new FormGroup({
    haulier: new FormControl<string | null>(null, [Validators.required]),
    trailerContainerType: new FormControl<string | null>(null, Validators.required),
    completingCustomsClearance: new FormControl<boolean>(false),
    numOfLoads: new FormControl<number | null>(null),
    quantityPerLoad: new FormControl<number | null>(null, [Validators.min(1)]),
    haulageCostPerLoad: new FormControl<number | null>(null, [Validators.required, Validators.max(999999999999999)]),
    currency: new FormControl<string | null>(null, Validators.required),
    haulageTotal: new FormControl<number>(0),
    transportProvider: new FormControl<string | null>(null, Validators.required),
    suggestedCollectionDate: new FormControl<string | null>(null, Validators.required),
    expectedTransitTime: new FormControl<string | null>(null, Validators.required),
    demurrageAtDestination: new FormControl<number | null>(null, [Validators.required, Validators.min(21)]),
    notes: new FormControl<string | null>(null, [Validators.maxLength(32000), noForbiddenPatternsValidator()]),
  });

  searchTermSignal = toSignal(
    this.formGroup.get('haulier')!.valueChanges.pipe(
      debounceTime(200),
      map((value) => {
        if (typeof value === 'object' && value !== null) {
          return '';
        }
        return typeof value === 'string' ? value.toLowerCase().trim() : '';
      }),
    ),
    { initialValue: '' },
  );

  get trailerContainerType() {
    return this.formGroup.controls.trailerContainerType as FormControl;
  }

  get completingCustomsClearance() {
    return this.formGroup.controls.completingCustomsClearance as FormControl;
  }

  get numOfLoads() {
    return this.formGroup.controls.numOfLoads as FormControl;
  }

  get haulageCostPerLoad() {
    return this.formGroup.controls.haulageCostPerLoad as FormControl;
  }

  get currency() {
    return this.formGroup.controls.currency as FormControl;
  }

  get haulageTotal() {
    return this.formGroup.controls.haulageTotal as FormControl;
  }

  get transportProvider() {
    return this.formGroup.controls.transportProvider as FormControl;
  }

  get suggestedCollectionDate() {
    return this.formGroup.controls.suggestedCollectionDate as FormControl;
  }

  get expectedTransitTime() {
    return this.formGroup.controls.expectedTransitTime as FormControl;
  }

  get demurrageAtDestination() {
    return this.formGroup.controls.demurrageAtDestination as FormControl;
  }

  get notes() {
    return this.formGroup.controls.notes as FormControl;
  }

  readonly dialogRef = inject(MatDialogRef<HaulierOfferFormComponent>, { optional: true });
  dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  isDialog = !!this.dialogData?.dialogMode;
  haulierOfferDetail = this.dialogData?.offerDetail;

  constructor() {
    this.user = toSignal(this.authService.user$);

    effect(() => {
      if (this.offerDetailsSignal()) {
        this.bindFromValue();
        this.updateMinMaxDates();
      }
    });

    const customsFeeMap: Record<Currency, number> = {
      [Currency.gbp]: 200,
      [Currency.eur]: 230,
      [Currency.usd]: 250,
    };

    const numOfLoads$ = this.numOfLoads.valueChanges.pipe(
      startWith(this.numOfLoads.value),
      map((v) => +v || 0),
      distinctUntilChanged(),
    );

    const haulageCostPerLoad$ = this.haulageCostPerLoad.valueChanges.pipe(
      startWith(this.haulageCostPerLoad.value),
      map((v) => +v || 0),
      distinctUntilChanged(),
    );

    const completingCustomsClearance$ = this.completingCustomsClearance.valueChanges.pipe(
      startWith(!!this.completingCustomsClearance.value),
      distinctUntilChanged(),
    );

    const currency$ = this.currency.valueChanges.pipe(startWith(this.currency.value), distinctUntilChanged());

    const totalCost$ = combineLatest([numOfLoads$, haulageCostPerLoad$]).pipe(
      map(([n, c]) => n * c),
      distinctUntilChanged(),
    );

    combineLatest([totalCost$, completingCustomsClearance$, currency$])
      .pipe(
        map(([total, completing, cur]) => total + (completing ? 0 : customsFeeMap[cur as Currency] || 0)),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((total) => {
        this.haulageTotal.setValue(total, { emitEvent: false });
        this.haulageTotal.updateValueAndValidity({ emitEvent: false });
      });

    if (this.isDialog && this.dialogData?.offerDetail) {
      this.offerDetailsSignal.set(this.dialogData.offerDetail);
      this.offerIdSignal.set(this.dialogData.offerDetail.id ?? null);
    }

    this.formGroup.valueChanges.pipe(takeUntilDestroyed(), distinctUntilChanged()).subscribe(() => {
      this.hasChange.emit(!this.formGroup.pristine);
    });

    effect(
      () => {
        const haulier = this.selectedHaulier();

        if (this.isAdminView) {
          this.trailerContainerType.reset(null);
        }
      },
      { allowSignalWrites: true },
    );

    effect(() => {
      if (this.isTeamBiding() || this.isDialog || !this.isAdminView) {
        this.formGroup.get('haulier')?.clearValidators();
        this.formGroup.get('haulier')?.updateValueAndValidity();
      }
    });
  }

  ngOnInit() {
    if (this.offerDetail && this.offerId) {
      this.offerDetailsSignal.set(this.offerDetail);
      this.offerIdSignal.set(this.offerId);
    }

    this.guidanceMessage = !this.isAdminView
      ? this.translate.transform(localized$('Only approved hauliers within your company are shown here.'))
      : this.translate.transform(
          localized$(
            'Only approved hauliers are shown here. Please approve a haulier in order to make a bid on their behalf.',
          ),
        );

    this.setupFilterFn();
  }

  private updateMinMaxDates(): void {
    const earliest = new Date(this.offerDetailsSignal()?.offer?.earliestDeliveryDate ?? '');
    const latest = new Date(this.offerDetailsSignal()?.offer?.latestDeliveryDate ?? '');

    const min = new Date(Math.max(this.today.getTime(), earliest.getTime()));
    const max = latest;

    this.minDate = min > max ? max : min;
    this.maxDate = max;

    if (this.minDate && this.maxDate && this.minDate.getTime() === this.maxDate.getTime()) {
      if (!this.suggestedCollectionDate.value && this.minDate.toString() !== 'Invalid Date') {
        this.suggestedCollectionDate.setValue(this.minDate.toISOString());
      }
    }
  }

  bindFromValue() {
    if (!this.isDialog) {
      this.formGroup.patchValue({
        numOfLoads: this.offerDetailsSignal()?.offer.quantity,
        quantityPerLoad: this.offerDetailsSignal()?.listing?.materialWeightPerUnit,
      });
    } else {
      this.formGroup.patchValue({
        trailerContainerType: this.offerDetailsSignal()?.trailerContainerType,
        completingCustomsClearance: this.offerDetailsSignal()?.completingCustomsClearance,
        numOfLoads: this.offerDetailsSignal()?.offer.quantity,
        quantityPerLoad: Number(this.offerDetailsSignal()?.quantityPerLoad),
        haulageCostPerLoad: Number(this.offerDetailsSignal()?.haulageCostPerLoad),
        currency: this.offerDetailsSignal()?.currency,
        transportProvider: this.offerDetailsSignal()?.transportProvider,
        suggestedCollectionDate: this.offerDetailsSignal()?.suggestedCollectionDate,
        expectedTransitTime: this.offerDetailsSignal()?.expectedTransitTime,
        demurrageAtDestination: this.offerDetailsSignal()?.demurrageAtDestination,
        notes: this.offerDetailsSignal()?.notes,
      });
    }
    this.formGroup.get('quantityPerLoad')?.markAsTouched();
    this.formGroup.updateValueAndValidity();
  }

  submit() {
    if (this.formGroup.invalid) return;
    let payload: any = this.formGroup.value;

    delete payload.numOfLoads;
    delete payload.quantityPerLoad;
    delete payload.haulageTotal;
    delete payload.haulier;

    if (!this.notes.value) delete payload.notes;

    if (this.isAdminView) {
      payload = {
        ...payload,
        haulierUserId: this.selectedHaulier()?.id!,
        haulierCompanyId: this.selectedHaulier()?.companyId!,
      };
      this.formSubmit.emit(payload);
      return;
    }

    if (this.isTeamBiding()) {
      payload = {
        ...payload,
        haulierUserId: this.selectedHaulier()?.id!,
      };
    }

    this.saving.set(true);

    if (!this.isDialog) {
      this.makeOffer(payload);
    } else {
      this.editOffer(payload);
    }
  }

  makeOffer(payload: any) {
    payload.offerId = this.offerIdSignal();
    this.haulageService
      .makeOffer(payload)
      .pipe(
        catchError(() => {
          this.snackBar.open(
            this.translate.transform(
              localized$(
                'We couldn’t submit your offer right now. Please try again. If the problem persists, contact support.',
              ),
            ),
          );
          return EMPTY;
        }),
        finalize(() => {
          this.saving.set(false);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.snackBar.open(this.translate.transform(localized$('Your haulage offer has been submitted for review.')));
          this.router.navigate([ROUTES_WITH_SLASH.currentOffers]);
        }
      });
  }

  editOffer(payload: any) {
    if (!this.offerIdSignal()) return;
    this.haulageService
      .updateOffer(this.offerIdSignal(), payload)
      .pipe(
        catchError(() => {
          this.snackBar.open(
            this.translate.transform(
              localized$(
                'We couldn’t submit your offer right now. Please try again. If the problem persists, contact support.',
              ),
            ),
          );
          return EMPTY;
        }),
        finalize(() => {
          this.saving.set(false);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.snackBar.open(this.translate.transform(localized$('Your haulage offer has been updated successfully.')));
          this.dialogRef?.close(true);
        }
      });
  }

  onHaulierSelected(event: MatAutocompleteSelectedEvent) {
    const selectedHaulier = event.option.value as HaulierUIItem;
    this.selectedHaulier.set(selectedHaulier);
  }
}
