import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Input,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { colour, countries, finishing, materialTypes, packing } from '@app/statics';
import { FileInfo, FileUploadComponent } from '@app/ui';
import { noForbiddenPatternsValidator, pastDateValidator } from '@app/validators';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { AuthService } from 'app/services/auth.service';
import { ListingService } from 'app/services/listing.service';
import { UploadService } from 'app/share/services/upload.service';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { Currency } from 'app/models/currency';
import { ListingImageType } from 'app/models/listing-material.model';
import { ListingMaterialDetail } from 'app/models/listing-material-detail.model';
import { scrollToFirstInvalidControl } from 'app/utils/form.utils';
import { isNil } from 'lodash';
import moment from 'moment';
import { catchError, EMPTY, filter, finalize, map, of, switchMap, take, tap } from 'rxjs';

@Component({
  selector: 'app-list-wanted-material-form',
  templateUrl: './list-wanted-material-form.component.html',
  styleUrls: ['./list-wanted-material-form.component.scss'],
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
    TranslateModule,
  ],
  providers: [TranslatePipe],
})
export class ListWantedMaterialFormComponent implements OnInit, OnChanges {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() listingId: number | null = null;
  countryOption = countries;
  materialTypes = materialTypes;
  colourOption = colour;
  finishingOption = finishing;
  packingOption = packing;
  readonly Currency = Currency;

  companyId: number | undefined;
  today = new Date();

  readonly startDatePickerFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    if (d.getTime() >= t.getTime()) return true;
    if (this.mode !== 'edit') return false;
    const current = this.formGroup.get('startDate')?.value as Date | null | undefined;
    if (!current) return false;
    const c = new Date(current);
    c.setHours(0, 0, 0, 0);
    return d.getTime() === c.getTime();
  };

  featureImageMaxSize = 50 * 1024 * 1024;
  galleryImageMaxSize = 5 * 1024 * 1024;

  itemOption = signal<{ code: string; name: string }[]>([]);
  formOption = signal<{ code: string; name: string }[]>([]);
  gradingOption = signal<{ code: string; name: string }[]>([]);
  listingDetail = signal<ListingMaterialDetail | null>(null);
  featureImageFile = signal<FileInfo[]>([]);
  galleryImageFile = signal<FileInfo[]>([]);
  additionalInformationLength = signal<number>(0);
  submitting = signal<boolean>(false);
  loading = signal<boolean>(false);

  featureImage = computed(() => {
    return (
      this.listingDetail()?.listing?.documents?.filter((d) => d.documentType === ListingImageType.FEATURE_IMAGE) ??
      []
    );
  });

  galleryImage = computed(() => {
    return (
      this.listingDetail()?.listing?.documents?.filter((d) => d.documentType === ListingImageType.GALLERY_IMAGE) ?? []
    );
  });

  uploadService = inject(UploadService);
  snackBar = inject(MatSnackBar);
  listingService = inject(ListingService);
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  translate = inject(TranslatePipe);
  destroyRef = inject(DestroyRef);

  user = toSignal(this.authService.user$);

  formGroup = new FormGroup({
    country: new FormControl<string | null>(null, [Validators.required]),
    materialType: new FormControl<string | null>(null, [Validators.required]),
    materialItem: new FormControl<string | null>(null, [Validators.required]),
    materialForm: new FormControl<string | null>(null, [Validators.required]),
    materialGrading: new FormControl<string | null>(null, [Validators.required]),
    materialColor: new FormControl<string | null>(null, [Validators.required]),
    materialFinishing: new FormControl<string | null>(null, [Validators.required]),
    materialPacking: new FormControl<string | null>(null, [Validators.required]),
    materialFlowIndex: new FormControl<string | null>(null, [Validators.required]),
    wasteStoration: new FormControl<string | null>(null, [Validators.required]),

    weightUnit: new FormControl<string | null>('mt', [Validators.required]),
    materialWeight: new FormControl<number | null>(null, [Validators.required, Validators.min(0.000001)]),
    wantedFrequency: new FormControl<string | null>(null, [Validators.required]),

    currency: new FormControl<string | null>(Currency.gbp, [Validators.required]),
    pricePerMetricTonne: new FormControl<number | null>(null, [
      Validators.required,
      Validators.max(1000000000),
    ]),

    startDate: new FormControl<Date | null>(null, [Validators.required, pastDateValidator()]),

    additionalNotes: new FormControl<string | null>(null, [Validators.maxLength(1000), noForbiddenPatternsValidator()]),
  });

  constructor() {
    this.today.setDate(this.today.getDate() - 0);
    this.formGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const { materialType, additionalNotes } = value;
      if (materialType) {
        const selectedMateriaType = materialTypes.find((m) => m.code == materialType);
        if (selectedMateriaType) {
          this.itemOption.set(selectedMateriaType?.materials);
          this.formOption.set(selectedMateriaType?.form);
          this.gradingOption.set(selectedMateriaType?.grading);
        }
      }
      if (additionalNotes) {
        this.additionalInformationLength.set(additionalNotes?.length);
      }
    });

    effect(() => {
      const { materialForm, materialGrading, materialItem } = this.formGroup.controls;
      if (this.formOption().length > 0) {
        materialForm.setValidators(Validators.required);
      } else {
        materialForm.clearValidators();
        materialForm.setValue('N/A', { emitEvent: false });
      }

      if (this.gradingOption().length > 0) {
        if (materialGrading.value === 'N/A') {
          materialGrading.setValue(null);
        }
        materialGrading.setValidators(Validators.required);
      } else {
        materialGrading.clearValidators();
        materialGrading.setValue('N/A', { emitEvent: false });
      }

      if (this.itemOption().length > 0) {
        if (materialItem.value === 'N/A') {
          materialItem.setValue(null);
        }
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
  }

  ngOnInit(): void {
    this.authService.user$
      .pipe(
        filter((user) => !!user),
        take(1),
        catchError((err) => {
          if (err) {
            this.snackBar.open(
              this.translate.transform(
                localized$(
                  'An error occurred while retrieving your information. Please refresh the page or contact support if the problem persists.',
                ),
              ),
              localized$('Ok'),
              { duration: 3000 },
            );
          }
          return of(null);
        }),
      )
      .subscribe((user) => {
        if (user) {
          this.companyId = user.company?.id;
        }
      });

    if (this.isEditListingRoute()) {
      this.setup();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode'] || changes['listingId']) {
      if (this.isEditListingRoute()) {
        this.setup();
      }
      if (!this.isEditListingRoute()) {
        this.listingDetail.set(null);
        this.featureImageFile.set([]);
        this.galleryImageFile.set([]);
        this.formGroup.reset({
          weightUnit: 'mt',
          currency: Currency.gbp,
        });
        const startDateCtrl = this.formGroup.get('startDate');
        startDateCtrl?.setValidators([Validators.required, pastDateValidator()]);
        startDateCtrl?.updateValueAndValidity({ emitEvent: false });
        this.additionalInformationLength.set(0);
      }
    }
  }

  isEditListingRoute(): boolean {
    if (this.mode === 'edit') {
      return true;
    }
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute?.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    return currentRoute?.snapshot.data?.['mode'] === 'edit';
  }

  private getResolvedListingId(): number | null {
    if (!isNil(this.listingId)) {
      return Number(this.listingId);
    }
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute?.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    const rawId = currentRoute?.snapshot.paramMap.get('id');
    if (!rawId) return null;
    const parsed = Number(rawId);
    return Number.isNaN(parsed) ? null : parsed;
  }

  setup() {
    const id = this.getResolvedListingId();
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
            { duration: 3000 },
          );
          return EMPTY;
        }),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe((listingDetails) => {
        if (listingDetails) {
          const currentUserId = this.user()?.userId;
          const ownerId = listingDetails.data?.listing?.createdByUserId;
          if (ownerId != null && currentUserId != null && Number(ownerId) !== Number(currentUserId)) {
            this.snackBar.open(
              this.translate.transform(localized$('You do not have permission to edit this listing.')),
            );
            this.router.navigate([ROUTES_WITH_SLASH.buy]);
          }
          this.bindFormValue();
        }
      });
  }

  bindFormValue() {
    if (!this.listingDetail()) return;

    if (this.isEditListingRoute()) {
      this.formGroup.get('startDate')?.setValidators([Validators.required]);
    }

    const listing = this.listingDetail()!.listing;

    const renewal = listing.listingRenewalPeriod;
    const rf = renewal != null ? String(renewal).trim().toLowerCase() : '';
    const wantedFrequency = ['weekly', 'fortnightly', 'monthly'].includes(rf) ? rf : 'one_time';

    this.formGroup.patchValue({
      country: listing.country,
      materialType: listing.materialType,
      materialItem: listing.materialItem,
      materialForm: listing.materialForm,
      materialGrading: listing.materialGrading,
      materialColor: listing.materialColor,
      materialFinishing: listing.materialFinishing,
      materialPacking: listing.materialPacking,
      materialFlowIndex: listing.materialFlowIndex,
      wasteStoration: listing.wasteStoration,
      weightUnit: 'mt',
      materialWeight: listing.materialWeightWanted,
      wantedFrequency,
      currency: listing.currency ?? Currency.gbp,
      pricePerMetricTonne: listing.pricePerMetricTonne,
      startDate: listing.startDate ? new Date(listing.startDate) : null,
      additionalNotes: listing.additionalNotes,
    });

    this.formGroup.updateValueAndValidity();
  }

  private hasFeatureImageForSubmit(): boolean {
    const newFeature = this.featureImageFile().some((f) => f.file instanceof File);
    if (newFeature) return true;
    if (this.isEditListingRoute() && this.featureImage().length > 0) return true;
    return false;
  }

  private buildDocuments$() {
    const existingFeature = (this.featureImage() || []).map((d) => ({
      documentType: ListingImageType.FEATURE_IMAGE,
      documentUrl: d.documentUrl,
    }));
    const existingGallery = (this.galleryImage() || []).map((d) => ({
      documentType: ListingImageType.GALLERY_IMAGE,
      documentUrl: d.documentUrl,
    }));

    const newFeatureFiles = (this.featureImageFile() || []).filter((f) => f.file instanceof File);
    const newGalleryFiles = (this.galleryImageFile() || []).filter((f) => f.file instanceof File);

    const noChanges = !newFeatureFiles.length && !newGalleryFiles.length;
    if (noChanges) {
      const keepExisting = this.isEditListingRoute() ? [...existingFeature, ...existingGallery] : [];
      return of(keepExisting);
    }

    const uploadJobs = [
      { files: newFeatureFiles, type: ListingImageType.FEATURE_IMAGE },
      { files: newGalleryFiles, type: ListingImageType.GALLERY_IMAGE },
    ].filter((j) => j.files.length > 0);

    return this.uploadService.uploadMultiFile(uploadJobs.flatMap((j) => j.files.map((f) => f.file))).pipe(
      map((urls: string[]) => {
        const docsFromUploads: { documentType: ListingImageType; documentUrl: string }[] = [];
        let cursor = 0;
        for (const job of uploadJobs) {
          const take = job.files.length;
          const bucket = urls.slice(cursor, cursor + take).map((url) => ({
            documentType: job.type,
            documentUrl: url,
          }));
          docsFromUploads.push(...bucket);
          cursor += take;
        }

        const keepIfNoChange = (type: ListingImageType, existing: typeof existingFeature) =>
          uploadJobs.some((j) => j.type === type) ? [] : existing;

        return [
          ...keepIfNoChange(ListingImageType.FEATURE_IMAGE, existingFeature),
          ...keepIfNoChange(ListingImageType.GALLERY_IMAGE, existingGallery),
          ...docsFromUploads,
        ];
      }),
    );
  }

  handleFileReady(files: FileInfo[], kind: 'feature' | 'gallery') {
    if (!files) return;
    if (kind === 'feature') {
      this.featureImageFile.set(files);
    } else {
      this.galleryImageFile.set(files);
    }
  }

  displayTotalMetricTonnes(): string {
    const mt = this.convertToTon();
    if (mt == null) return '';
    return Number(mt.toFixed(6)).toString();
  }

  private convertToTon(): number | null {
    const { weightUnit, materialWeight } = this.formGroup.value;
    if (!weightUnit || materialWeight == null) return null;

    return weightUnit === 'lbs'
      ? materialWeight / 2204.62263
      : weightUnit === 'kg'
        ? materialWeight / 1000
        : materialWeight;
  }

  send() {
    if (this.formGroup.invalid) {
      scrollToFirstInvalidControl(this.formGroup);
      return;
    }

    if (!this.hasFeatureImageForSubmit()) {
      this.snackBar.open(this.translate.transform(localized$('Please upload at least one image before submitting.')));
      return;
    }

    const materialWeightWanted = this.convertToTon();
    if (materialWeightWanted == null || materialWeightWanted <= 0) {
      scrollToFirstInvalidControl(this.formGroup);
      return;
    }

    let {
      materialWeight: _materialWeight,
      weightUnit: _weightUnit,
      wantedFrequency,
      pricePerMetricTonne: priceRaw,
      startDate,
      ...rest
    } = this.formGroup.value;

    // PATCH body is validated against OpenAPI (strict types, additionalProperties: false).
    // Number inputs often arrive as strings; null startDate is rejected (nullable: false).
    const basePayload: Record<string, unknown> = {
      ...rest,
      listingType: 'wanted',
      ...(this.companyId != null && { companyId: Number(this.companyId) }),
      materialWeightWanted: Number(materialWeightWanted),
      ...(priceRaw !== null && priceRaw !== undefined && `${priceRaw}`.trim() !== ''
        ? { pricePerMetricTonne: Number(priceRaw) }
        : {}),
      listingRenewalPeriod:
        wantedFrequency && wantedFrequency !== 'one_time' ? wantedFrequency : undefined,
      ...(startDate
        ? { startDate: moment(startDate).format('YYYY-MM-DD') + 'T00:00:00.000Z' }
        : {}),
    };

    if (!this.itemOption().length) {
      delete basePayload['materialItem'];
    }

    if (!this.formOption().length) {
      delete basePayload['materialForm'];
    }

    if (!this.gradingOption().length) {
      delete basePayload['materialGrading'];
    }

    const resolvedEditId = this.getResolvedListingId();
    if (this.isEditListingRoute() && resolvedEditId == null) {
      this.snackBar.open(
        this.translate.transform(localized$('Could not determine listing id. Please refresh the page and try again.')),
      );
      return;
    }

    this.submitting.set(true);

    this.buildDocuments$()
      .pipe(
        switchMap((documents) => {
          const cleanDocuments = documents.filter(
            (d) =>
              !!d &&
              typeof d.documentType === 'string' &&
              d.documentType.length > 0 &&
              typeof d.documentUrl === 'string' &&
              d.documentUrl.length > 0,
          );
          const payload = { ...basePayload, documents: cleanDocuments };
          const editRequest = this.listingService.editListing(resolvedEditId, { ...payload }).pipe(
            catchError((err) => {
              this.snackBar.open(
                `${err.error?.error?.message ?? this.translate.transform(localized$('Failed to update your listing. Please try again. If the problem persists, contact support.'))}`,
              );
              return EMPTY;
            }),
          );
          const createRequest = this.listingService.createListing(payload).pipe(
            catchError((err) => {
              this.snackBar.open(
                `${err.error?.error?.message ?? this.translate.transform(localized$('Failed to submit your listing. Please try again.'))}`,
              );
              return EMPTY;
            }),
          );
          return this.isEditListingRoute() ? editRequest : createRequest;
        }),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe((result) => {
        if (result == null) return;
        const message = this.isEditListingRoute()
          ? this.translate.transform(localized$('Your listing has been updated successfully'))
          : this.translate.transform(localized$('Your listing is under review'));
        this.snackBar.open(message);
        const editId = this.getResolvedListingId();
        if (this.isEditListingRoute() && editId != null) {
          this.router.navigate([ROUTES_WITH_SLASH.wantedListingOfferDetail, editId]);
        } else {
          this.router.navigateByUrl(ROUTES_WITH_SLASH.wantedListings);
        }
      });
  }
}
