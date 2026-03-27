import { ChangeDetectorRef, Component, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { colour, countries, finishing, materialTypes, packing } from '@app/statics';
import { FileInfo, FileUploadComponent } from '@app/ui';
import { noForbiddenPatternsValidator, pastDateValidator } from '@app/validators';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { AuthService } from 'app/services/auth.service';
import { ListingService } from 'app/services/listing.service';
import { UploadService } from 'app/share/services/upload.service';
import { addLanguagePrefix } from 'app/utils/language.utils';
import { catchError, concatMap, filter, finalize, of, take } from 'rxjs';

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
export class ListWantedMaterialFormComponent implements OnInit {
  countryOption = countries;
  materialTypes = materialTypes;
  colourOption = colour;
  finishingOption = finishing;
  packingOption = packing;
  companyId: number | undefined;
  today = new Date();

  onGoingListing = signal<boolean | undefined>(undefined);
  itemOption = signal<{ code: string; name: string }[]>([]);
  formOption = signal<{ code: string; name: string }[]>([]);
  gradingOption = signal<{ code: string; name: string }[]>([]);
  selectedFile = signal<FileInfo[]>([]);
  additionalInformationLength = signal<number>(0);
  submitting = signal<boolean>(false);

  cd = inject(ChangeDetectorRef);
  uploadService = inject(UploadService);
  snackBar = inject(MatSnackBar);
  listingService = inject(ListingService);
  authService = inject(AuthService);
  router = inject(Router);
  translate = inject(TranslatePipe);

  formGroup = new FormGroup({
    country: new FormControl<string | null>(null, [Validators.required]),
    materialType: new FormControl<string | null>(null, [Validators.required]),
    materialItem: new FormControl<string | null>(null, [Validators.required]),
    materialForm: new FormControl<string | null>(null, [Validators.required]),
    materialGrading: new FormControl<string | null>(null, [Validators.required]),
    materialColor: new FormControl<string | null>(null, [Validators.required]),
    materialFinishing: new FormControl<string | null>(null, [Validators.required]),
    materialPacking: new FormControl<string | null>(null, [Validators.required]),
    capacityPerMonth: new FormControl<string | null>(null, [Validators.required, Validators.min(0)]),
    materialFlowIndex: new FormControl<string | null>(null, [Validators.required]),
    wasteStoration: new FormControl<string | null>(null, [Validators.required]),
    materialWeightWanted: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    weightUnit: new FormControl<string | null>(null, [Validators.required]),
    startDate: new FormControl<Date | null>(null, [Validators.required, pastDateValidator()]),

    additionalNotes: new FormControl<string | null>(null, [Validators.maxLength(1000), noForbiddenPatternsValidator()]),

    ongoingListing: new FormControl<string | null>(null, [Validators.required]),
    listingRenewalPeriod: new FormControl<string | null>(null, [Validators.required]),
    listingDuration: new FormControl<Date | null>(null),
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

    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 30);

    this.formGroup.patchValue({ listingDuration: futureDate }, { emitEvent: false });

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

  ngOnInit() {
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
  }

  handleFileReady(file: FileInfo[]) {
    if (file) {
      this.selectedFile.set(file);
    }
  }

  ongoingListingChange(event: MatRadioChange) {
    const { listingDuration, listingRenewalPeriod } = this.formGroup.controls;
    listingDuration.markAsUntouched();
    listingRenewalPeriod.markAsUntouched();
    if (event.value == 'true') {
      listingDuration.clearValidators();
      listingRenewalPeriod.setValidators(Validators.required);
    } else {
      listingDuration.setValidators([Validators.required, pastDateValidator()]);
      listingRenewalPeriod.clearValidators();
    }

    listingDuration.updateValueAndValidity();
    listingRenewalPeriod.updateValueAndValidity();
  }

  private convertToTon() {
    const { weightUnit, materialWeightWanted } = this.formGroup.value;
    if (!weightUnit || !materialWeightWanted) return null;

    return weightUnit === 'lbs'
      ? materialWeightWanted / 2204.62263
      : weightUnit === 'kg'
        ? materialWeightWanted / 1000
        : materialWeightWanted;
  }

  send() {
    if (this.formGroup.invalid) return;
    let { weightUnit, materialWeightWanted, ongoingListing, ...value } = this.formGroup.value;

    const payload: any = {
      ...value,
      listingType: 'wanted',
      companyId: this.companyId,
      materialWeightWanted: this.convertToTon(),
      startDate: value.startDate?.toISOString(),
    };

    if (!this.itemOption().length) {
      delete payload.materialItem;
    }

    if (!this.formOption().length) {
      delete payload.materialForm;
    }

    if (!this.gradingOption().length) {
      delete payload.materialGrading;
    }

    ongoingListing == 'true' ? delete payload.listingDuration : delete payload.listingRenewalPeriod;

    this.submitting.set(true);

    this.uploadService
      .uploadMultiFile(this.selectedFile().map((f) => f.file))
      .pipe(
        finalize(() => this.submitting.set(false)),
        catchError((err) => {
          this.snackBar.open(
            this.translate.transform(localized$('An error occurred while uploading the file. Please try again.')),
            this.translate.transform(localized$('Ok')),
            {
              duration: 3000,
            },
          );
          return of(null);
        }),
        concatMap((documentUrls) => {
          if (!documentUrls) return of(null);

          const documents = documentUrls.map((url) => {
            return {
              documentType: 'feature_image',
              documentUrl: url,
            };
          });

          return this.listingService.createListing({ ...payload, documents }).pipe(
            finalize(() => this.submitting.set(false)),
            catchError((err) => {
              this.snackBar.open(
                this.translate.transform(
                  localized$(`${err.error?.error?.message ?? 'Failed to submit your listing. Please try again.'}`),
                ),
                this.translate.transform(localized$('Ok')),
                {
                  duration: 3000,
                },
              );
              return of(null);
            }),
          );
        }),
      )
      .subscribe((result) => {
        if (result) {
          this.snackBar.open(
            this.translate.transform(localized$('Your listing is under review')),
            this.translate.transform(localized$('Ok')),
            {
              duration: 3000,
            },
          );
          this.router.navigate([addLanguagePrefix('/wanted')]);
        }
      });
  }
}
