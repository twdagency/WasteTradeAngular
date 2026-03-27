import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Input,
  OnChanges,
  OnInit,
  Signal,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { colour, countries, finishing, materialTypes, packing } from '@app/statics';
import { FileInfo, FileUploadComponent } from '@app/ui';
import { noForbiddenPatternsValidator, pastDateValidator } from '@app/validators';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AddCompanyLocationResponse, ListingImageType, User } from 'app/models';
import { Currency } from 'app/models/currency';
import { containerTypeList } from 'app/models/haulage.model';
import { ListingMaterialDetail } from 'app/models/listing-material-detail.model';
import { EditSiteComponent } from 'app/routes/my-sites/edit-site/edit-site.component';
import { AuthService } from 'app/services/auth.service';
import { ListingService } from 'app/services/listing.service';
import { UploadService } from 'app/share/services/upload.service';
import { DialogWrapperComponent } from 'app/share/ui/dialog-wrapper/dialog-wrapper.component';
import { ResponseGetCompanyLocation } from 'app/types/requests/auth';
import { isNil } from 'lodash';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-sell-lising-material-form',
  imports: [
    MatIconModule,
    FileUploadComponent,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    TranslateModule,
  ],
  providers: [TranslatePipe],
  templateUrl: './sell-lising-material-form.component.html',
  styleUrl: './sell-lising-material-form.component.scss',
})
export class SellLisingMaterialFormComponent implements OnInit, OnChanges {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() listingId: number | null = null;

  countryOption = countries;
  materialTypes = materialTypes;
  colourOption = colour;
  finishingOption = finishing;
  packingOption = packing;
  incotermOption = ['EXW', 'FAS', 'FOB', 'CRF', 'CIF', 'DAP', 'DDP'];

  readonly Currency = Currency;
  containerTypeList = containerTypeList;

  today = new Date();
  @ViewChild('locationSelector') locationSelector!: MatSelect;

  maxFileSize = 25 * 1024 * 1024; // 25mb
  featureImageMaxSize = 50 * 1024 * 1024;
  galleryImageMaxSize = 5 * 1024 * 1024;

  cd = inject(ChangeDetectorRef);
  uploadService = inject(UploadService);
  snackBar = inject(MatSnackBar);
  listingService = inject(ListingService);
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  translate = inject(TranslatePipe);
  ref = inject(ChangeDetectorRef);
  destroyRef = inject(DestroyRef);

  user: Signal<User | null | undefined>;
  itemOption = signal<{ code: string; name: string }[]>([]);
  formOption = signal<{ code: string; name: string }[]>([]);
  gradingOption = signal<{ code: string; name: string }[]>([]);
  listingDetail = signal<ListingMaterialDetail | null>(null);

  featureImageFile = signal<FileInfo[]>([]);
  specialDataFile = signal<FileInfo[]>([]);
  galleryImageFile = signal<FileInfo[]>([]);

  additionalInformationLength = signal<number>(0);
  submitting = signal<boolean>(false);
  loading = signal<boolean>(false);
  locations = signal<ResponseGetCompanyLocation['results']>([]);
  companyId = toSignal(
    this.authService.user$.pipe(
      filter((user) => !!user),
      map((user) => user.companyId),
    ),
  );

  fileValid = computed(() => {
    return (
      !!this.featureImageFile().length &&
      (!this.hasSpecialData() || (this.hasSpecialData() && !!this.specialDataFile().length))
    );
  });

  featureImage = computed(() => {
    return (
      this.listingDetail()?.listing?.documents.filter((d) => d.documentType === ListingImageType.FEATURE_IMAGE) ?? []
    );
  });

  galleryImage = computed(() => {
    return (
      this.listingDetail()?.listing?.documents.filter((d) => d.documentType === ListingImageType.GALLERY_IMAGE) ?? []
    );
  });

  specificationData = computed(() => {
    return (
      this.listingDetail()?.listing?.documents.filter(
        (d) => d.documentType === ListingImageType.MATERIAL_SPECIFICATION_DATA,
      ) ?? []
    );
  });

  formGroup = new FormGroup({
    locationId: new FormControl<number | null>(null, [Validators.required]),
    containerType: new FormControl<string | null>({ value: null, disabled: true }),
    hasSpecialData: new FormControl<boolean | null>(false, [Validators.required]),

    materialType: new FormControl<string | null>(null, [Validators.required]),
    materialItem: new FormControl<string | null>(null, [Validators.required]),
    materialForm: new FormControl<string | null>(null, [Validators.required]),
    materialGrading: new FormControl<string | null>(null, [Validators.required]),
    materialColor: new FormControl<string | null>(null, [Validators.required]),
    materialFinishing: new FormControl<string | null>(null, [Validators.required]),
    materialPacking: new FormControl<string | null>(null, [Validators.required]),
    materialRemainInCountry: new FormControl<boolean | null>(false, [Validators.required]),
    wasteStoration: new FormControl<string | null>(null, [Validators.required]),

    weightUnit: new FormControl<string | null>(null, [Validators.required]),
    materialWeight: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(1000000000),
    ]),
    totalWeight: new FormControl<number | null>(null, [Validators.min(3)]),
    quantity: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(1000000000),
    ]),
    weightPerLoad: new FormControl<number | null>(null),

    currency: new FormControl<string | null>(null, [Validators.required]),
    pricePerMetricTonne: new FormControl<number | null>(null, [Validators.required, Validators.max(1000000000)]),

    startDate: new FormControl<Date | null>(null, [Validators.required, pastDateValidator()]),

    ongoingListing: new FormControl<boolean | null>(false, [Validators.required]),
    listingRenewalPeriod: new FormControl<string | null>(null),
    listingDuration: new FormControl<Date | null>(null, []),

    incoterms: new FormControl<string | null>(null, []),

    description: new FormControl<string | null>(null, [Validators.maxLength(32000), noForbiddenPatternsValidator()]),
  });

  get locationId() {
    return this.formGroup.controls.locationId as FormControl;
  }

  get materialWeight() {
    return this.formGroup.controls.materialWeight as FormControl;
  }

  get weightUnit() {
    return this.formGroup.controls.weightUnit as FormControl;
  }

  get totalWeight() {
    return this.formGroup.controls.totalWeight as FormControl;
  }

  get quantity() {
    return this.formGroup.controls.quantity as FormControl;
  }

  get weightPerLoad() {
    return this.formGroup.controls.weightPerLoad as FormControl;
  }

  hasSpecialData = toSignal(this.formGroup.controls.hasSpecialData.valueChanges.pipe(map((v) => v === true)));
  hasLocation = toSignal(
    this.formGroup.controls.locationId.valueChanges.pipe(startWith(null)).pipe(map((locationId) => !!locationId)),
    {
      initialValue: false,
    },
  );

  constructor() {
    this.user = toSignal(this.authService.user$);
    this.today.setDate(this.today.getDate() - 0);
    this.formGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const { materialType, description } = value;
      if (materialType) {
        const selectedMateriaType = materialTypes.find((m) => m.code == materialType);
        if (selectedMateriaType) {
          this.itemOption.set(selectedMateriaType?.materials);
          this.formOption.set(selectedMateriaType?.form);
          this.gradingOption.set(selectedMateriaType?.grading);
        }
      }
      if (description) {
        this.additionalInformationLength.set(description?.length);
      }
    });

    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 30);

    this.formGroup.patchValue({ listingDuration: futureDate }, { emitEvent: true });

    // Control disable / enable form according has location or not
    effect(() => {
      const disableControlNames = Object.keys(this.formGroup.controls).filter((i) => !['locationId'].includes(i));

      disableControlNames.forEach((key) => {
        if (this.hasLocation()) {
          ((this.formGroup.controls as any)[key] as FormControl).enable();
        } else {
          ((this.formGroup.controls as any)[key] as FormControl).disable();
        }
      });
    });

    // Effect add, remove fields
    effect(() => {
      const { materialForm, materialGrading, materialItem } = this.formGroup.controls;
      if (this.formOption().length > 0) {
        materialForm.setValidators(Validators.required);
      } else {
        materialForm.clearValidators();
        materialForm.setValue('N/A', { emitEvent: false });
      }

      if (this.gradingOption().length > 0) {
        materialGrading.setValidators(Validators.required);
      } else {
        materialGrading.clearValidators();
        materialGrading.setValue('N/A', { emitEvent: false });
      }

      if (this.itemOption().length > 0) {
        materialItem.setValidators(Validators.required);
      } else {
        materialItem.clearValidators();
        materialItem.setValue('N/A', { emitEvent: false });
      }

      materialItem.updateValueAndValidity();
      materialForm.updateValueAndValidity();
      materialGrading.updateValueAndValidity();
      this.formGroup.updateValueAndValidity();
    });

    const locationIdSignal = toSignal(this.locationId?.valueChanges.pipe(startWith(null)));

    // auto-populate container type
    effect(() => {
      if (!this.locations().length) return;

      const selectedLocation = this.locations().find((l) => l.id === locationIdSignal());
      if (!selectedLocation?.containerType.length) return;

      const containerTypes = selectedLocation.containerType.includes('all')
        ? containerTypeList.map((c) => c.value)
        : selectedLocation.containerType;

      const containerNames = containerTypeList
        .filter((t) => containerTypes.includes(t.value))
        .map((t) => t.name)
        .join(', ');

      this.formGroup.patchValue({ containerType: containerNames });
      this.formGroup.updateValueAndValidity();
    });

    combineLatest([
      this.weightUnit.valueChanges.pipe(startWith(null)),
      this.materialWeight.valueChanges.pipe(startWith(null)),
    ])
      .pipe(
        takeUntilDestroyed(),
        distinctUntilChanged(),
        tap(([unit, weight]) => {
          const totalWeight = this.convertToTon(unit, weight);
          if (totalWeight) {
            this.totalWeight?.setValue(totalWeight);
            this.totalWeight?.markAsTouched();
            this.totalWeight.updateValueAndValidity();
          }
        }),
      )
      .subscribe();

    combineLatest([
      this.totalWeight.valueChanges.pipe(startWith(null)),
      this.quantity.valueChanges.pipe(startWith(null)),
    ])
      .pipe(
        takeUntilDestroyed(),
        distinctUntilChanged(),
        filter(([weight, quantity]) => weight !== null && quantity !== null && quantity > 0),
        tap(([weight, quantity]) => {
          const weightPerLoad = (weight / quantity).toFixed(3);
          if (weightPerLoad) {
            this.weightPerLoad.setValue(weightPerLoad);
            this.weightPerLoad.markAsTouched();
            this.formGroup.updateValueAndValidity();
          }
        }),
      )
      .subscribe();

    this.authService.companyLocations$.pipe(takeUntilDestroyed()).subscribe((data) => {
      this.locations.set(data.results);
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode'] || changes['listingId']) {
      if (this.mode === 'edit') {
        this.setup();
      }
      if (this.mode === 'create') {
        this.formGroup.reset();

        this.featureImageFile.set([]);
        this.specialDataFile.set([]);
        this.galleryImageFile.set([]);
        this.listingDetail.set(null);
      }
    }
  }

  bindFormValue() {
    if (!this.listingDetail()) return;
    this.formGroup.patchValue({
      locationId: this.listingDetail()?.listing?.locationId,
      hasSpecialData: this.specificationData().length > 0,

      materialType: this.listingDetail()?.listing?.materialType,
      materialItem: this.listingDetail()?.listing?.materialItem,
      materialForm: this.listingDetail()?.listing?.materialForm,
      materialGrading: this.listingDetail()?.listing?.materialGrading,
      materialColor: this.listingDetail()?.listing?.materialColor,
      materialFinishing: this.listingDetail()?.listing?.materialFinishing,
      materialPacking: this.listingDetail()?.listing?.materialPacking,
      materialRemainInCountry: this.listingDetail()?.listing?.materialRemainInCountry,
      wasteStoration: this.listingDetail()?.listing?.wasteStoration,

      weightUnit: this.listingDetail()?.listing.weightUnit,
      materialWeight: this.listingDetail()?.listing?.materialWeight,

      totalWeight: this.listingDetail()?.listing?.totalWeight,
      quantity: this.listingDetail()?.listing?.quantity,
      currency: this.listingDetail()?.listing?.currency,
      pricePerMetricTonne: this.listingDetail()?.listing?.pricePerMetricTonne,

      startDate: new Date(this.listingDetail()?.listing?.startDate ?? ''),
      ongoingListing: this.getOngoing(this.listingDetail()?.listing),
      listingDuration: new Date(this.listingDetail()?.listing?.listingDuration ?? ''),
      listingRenewalPeriod: this.listingDetail()?.listing?.listingRenewalPeriod,

      incoterms: this.listingDetail()?.listing?.incoterms,
      description: this.listingDetail()?.listing?.description,
    });

    this.formGroup.updateValueAndValidity();
  }

  getOngoing(listing?: { listingDuration?: any; listingRenewalPeriod?: any }): boolean {
    if (!listing) return false;
    if (listing.listingRenewalPeriod != null) return true;
    if (listing.listingDuration != null) return false;
    return false;
  }

  handleFileReady(file: FileInfo[], type: 'featureImage' | 'specialFile' | 'galleryImage') {
    if (file) {
      if (type === 'featureImage') {
        this.featureImageFile.set(file);
      }

      if (type === 'specialFile') {
        this.specialDataFile.set(file);
      }

      if (type === 'galleryImage') {
        this.galleryImageFile.set(file);
      }
    }
  }

  ongoingListingChange(event: MatRadioChange) {
    const { listingRenewalPeriod } = this.formGroup.controls;
    listingRenewalPeriod.markAsUntouched();
    if (event.value == true) {
      listingRenewalPeriod.setValidators(Validators.required);
    } else {
      listingRenewalPeriod.clearValidators();
    }

    listingRenewalPeriod.updateValueAndValidity();
  }

  private convertToTon(unit?: string, weight?: number) {
    const weightUnit = unit ?? this.formGroup.value.weightUnit;
    const materialWeight = weight ?? this.formGroup.value.materialWeight;
    if (!weightUnit || !materialWeight) return 0;

    return weightUnit === 'lbs'
      ? materialWeight / 2204.62263
      : weightUnit === 'kg'
        ? materialWeight / 1000
        : materialWeight;
  }

  private buildDocuments$() {
    const existingFeature = (this.featureImage() || []).map((d) => ({
      documentType: ListingImageType.FEATURE_IMAGE,
      documentUrl: d.documentUrl,
    }));
    const existingSpec = (this.specificationData() || []).map((d) => ({
      documentType: ListingImageType.MATERIAL_SPECIFICATION_DATA,
      documentUrl: d.documentUrl,
    }));
    const existingGallery = (this.galleryImage() || []).map((d) => ({
      documentType: ListingImageType.GALLERY_IMAGE,
      documentUrl: d.documentUrl,
    }));

    const newFeatureFiles = (this.featureImageFile() || []).filter((f) => f.file instanceof File);
    const newSpecFiles = (this.specialDataFile() || []).filter((f) => f.file instanceof File);
    const newGalleryFiles = (this.galleryImageFile() || []).filter((f) => f.file instanceof File);

    const noChanges = !newFeatureFiles.length && !newSpecFiles.length && !newGalleryFiles.length;
    if (noChanges) {
      const keepExisting = this.mode === 'edit' ? [...existingFeature, ...existingSpec, ...existingGallery] : [];
      return of(keepExisting);
    }

    const uploadJobs = [
      { files: newFeatureFiles, type: ListingImageType.FEATURE_IMAGE },
      { files: newSpecFiles, type: ListingImageType.MATERIAL_SPECIFICATION_DATA },
      { files: newGalleryFiles, type: ListingImageType.GALLERY_IMAGE },
    ].filter((j) => j.files.length > 0);

    return this.uploadService.uploadMultiFile(uploadJobs.flatMap((j) => j.files.map((f) => f.file))).pipe(
      map((urls: string[]) => {
        const docsFromUploads: { documentType: ListingImageType; documentUrl: string }[] = [];
        let cursor = 0;
        for (const job of uploadJobs) {
          const take = job.files.length;
          const bucket = urls.slice(cursor, cursor + take).map((url, i) => ({
            documentType: job.type,
            documentUrl: url,
          }));
          docsFromUploads.push(...bucket);
          cursor += take;
        }

        const keepIfNoChange = (type: ListingImageType, existing: any[]) =>
          uploadJobs.some((j) => j.type === type) ? [] : existing;

        return [
          ...keepIfNoChange(ListingImageType.FEATURE_IMAGE, existingFeature),
          ...keepIfNoChange(ListingImageType.MATERIAL_SPECIFICATION_DATA, existingSpec),
          ...keepIfNoChange(ListingImageType.GALLERY_IMAGE, existingGallery),
          ...docsFromUploads,
        ];
      }),
    );
  }

  send() {
    if (this.formGroup.invalid) return;
    let {
      containerType,
      totalWeight,
      weightPerLoad,
      quantity,
      ongoingListing,
      hasSpecialData,
      locationId,
      materialRemainInCountry,
      ...value
    } = this.formGroup.value;

    // Calculate totalWeight and weightPerLoad
    // const totalWeight = this.convertToTon();
    const numberOfLoads = quantity!;
    // const weightPerLoad = numberOfLoads > 0 ? Number((totalWeight / numberOfLoads).toFixed(3)) : null;

    const payload: any = {
      ...value,
      locationId: Number(locationId),
      materialRemainInCountry: materialRemainInCountry === true,
      quantity,
      listingType: 'sell',
      companyId: this.companyId(),
      materialWeightPerUnit: this.convertToTon() / numberOfLoads,
      totalWeight,
      numberOfLoads,
      weightPerLoad: numberOfLoads > 0 ? Number((this.convertToTon() / numberOfLoads).toFixed(3)) : null,
    };

    if (!this.itemOption().length) delete payload.materialItem;
    if (!this.formOption().length) delete payload.materialForm;
    if (!this.gradingOption().length) delete payload.materialGrading;
    ongoingListing == true ? delete payload.endDate : delete payload.listingRenewalPeriod;

    this.submitting.set(true);

    this.buildDocuments$()
      .pipe(
        switchMap((documents) => {
          const editRequest = this.listingService.editListing(this.listingId, { ...payload, documents }).pipe(
            catchError((err) => {
              this.snackBar.open(
                `${err.error?.error?.message ?? this.translate.transform(localized$('Failed to update your listing. Please try again. If the problem persists, contact support.'))}`,
              );
              return EMPTY;
            }),
          );
          const createRequest = this.listingService.createListing({ ...payload, documents }).pipe(
            catchError((err) => {
              this.snackBar.open(
                `${err.error?.error?.message ?? this.translate.transform(localized$('Failed to submit your listing. Please try again. If the problem persists, contact support.'))}`,
              );
              throw err;
            }),
          );
          return this.mode == 'create' ? createRequest : editRequest;
        }),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe((result) => {
        const message =
          this.mode == 'create'
            ? this.translate.transform(localized$('Your listing is under review'))
            : this.translate.transform(localized$('Your listing has been updated successfully'));
        this.snackBar.open(message);
        this.router.navigateByUrl(ROUTES_WITH_SLASH.buy);
      });
  }

  onAddOther() {
    this.locationId.markAsUntouched();
    this.locationId.updateValueAndValidity();

    const dialogRef = this.dialog.open(DialogWrapperComponent, {
      maxWidth: '980px',
      maxHeight: '85vh',
      width: '100%',
      data: {
        component: EditSiteComponent,
        childData: {
          dialogMode: true,
        },
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        map((data: AddCompanyLocationResponse['data']) => data?.companyLocation?.id),
        switchMap((locationId) =>
          this.authService.companyLocations$.pipe(
            map((locations) => ({
              locations,
              locationId,
            })),
          ),
        ),
        tap(({ locations, locationId }) => {
          if (locations?.results?.length && locationId) {
            this.locations.set(locations.results);
            setTimeout(() => {
              this.locationId.setValue(locationId);
              this.formGroup.updateValueAndValidity();
              this.locationSelector.close();
            }, 0);
          }
        }),
      )
      .subscribe();
  }

  setup() {
    const id = this.listingId;
    if (isNil(id)) {
      return;
    }

    this.loading.set(true);

    this.listingService
      .getDetail(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),

        tap((res) => {
          this.listingDetail.set(res.data);
        }),

        catchError((err) => {
          this.snackBar.open(
            this.translate.transform(
              localized$(`${err.error?.error?.message || 'Failed to load details. Please refresh the page.'}`),
            ),
            this.translate.transform(localized$('OK')),
            {
              duration: 3000,
            },
          );
          return EMPTY;
        }),

        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe((listingDetails) => {
        if (listingDetails) {
          const currentUserId = this.user()?.user?.id;

          if (listingDetails['data']?.listing?.createdByUserId !== currentUserId) {
            this.snackBar.open(this.translate.transform(localized$('You don’t have permission to edit this listing.')));
            this.router.navigate([ROUTES_WITH_SLASH.buy]);
          }
          this.bindFormValue();
        }
      });
  }

  private hasFileChange(): boolean {
    return (
      (this.featureImageFile()?.some((f) => f.file instanceof File) ?? false) ||
      (this.specialDataFile()?.some((f) => f.file instanceof File) ?? false) ||
      (this.galleryImageFile()?.some((f) => f.file instanceof File) ?? false)
    );
  }

  isSubmitDisabled(): boolean {
    if (this.mode === 'create') {
      return this.formGroup.invalid || !this.fileValid();
    } else {
      if (this.hasFileChange()) {
        return this.formGroup.invalid || !this.fileValid();
      } else {
        return this.formGroup.invalid || this.formGroup.pristine;
      }
    }
  }
}
