import { UpperCasePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { countries, materialTypes } from '@app/statics';
import { FileInfo, FileUploadComponent } from '@app/ui';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { CompanyDocumentType, CompanyLocationDetail, User } from 'app/models';
import { IDocument } from 'app/models/listing-material-detail.model';
import { AuthService } from 'app/services/auth.service';
import { LocationService } from 'app/services/location.service';
import { UploadService } from 'app/share/services/upload.service';
import { ConfirmDeleteLocationModalComponent } from 'app/share/ui/confirm-delete-location-modal/confirm-delete-location-modal.component';
import { ConfirmModalComponent } from 'app/share/ui/confirm-modal/confirm-modal.component';
import { createMaterialSelectionController } from 'app/share/utils/material-selection';
import moment from 'moment';
import { catchError, EMPTY, finalize, retry } from 'rxjs';
import { TelephoneFormControlComponent } from '../../../share/ui/telephone-form-control/telephone-form-control.component';
import { TimeInputFormControlComponent } from '../../../share/ui/time-input-form-control/time-input-form-control.component';
import { ContainerTypeList } from 'app/models/location.model';
import { scrollToFirstInvalidControl } from 'app/utils/form.utils';

@Component({
  selector: 'app-edit-site',
  templateUrl: './edit-site.component.html',
  styleUrls: ['./edit-site.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    TelephoneFormControlComponent,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    TimeInputFormControlComponent,
    FileUploadComponent,
    MatExpansionModule,
    UpperCasePipe,
    TranslateModule,
  ],
  providers: [TranslatePipe],
})
export class EditSiteComponent implements OnInit, AfterViewInit {
  mode: 'add' | 'edit' = 'add';
  location: CompanyLocationDetail | undefined = undefined;
  countryList = countries;
  CompanyDocumentType = CompanyDocumentType;
  wasteCarrierLicenseDocuments: IDocument[] = [];
  materialTypes = materialTypes;
  private readonly allMaterialCodes = this.materialTypes
    .flatMap((group) => group.materials ?? [])
    .map((item) => item.code);
  user: Signal<User | null | undefined>;
  containerTypes = ContainerTypeList;
  containerTypeList = ContainerTypeList;

  showOtherMaterial = signal(false);
  selectAllMaterial!: WritableSignal<boolean>;
  expandAllMaterials!: WritableSignal<boolean>;
  expandedMaterialGroup!: WritableSignal<string | null>;
  toggleSelectAllMaterials!: () => void;
  onMaterialPanelToggle!: (name: string, expanded: boolean) => void;
  private updateSelectAllMaterialState!: () => void;
  submitting = signal<boolean>(false);
  showAccessRestriction = signal<boolean>(false);
  selectAllContainerTypes = signal<boolean>(false);
  selectedFiles = signal<any[]>([]);
  wasteLicenceValid = signal<boolean>(false);
  loading = signal(false);

  formGroup = new FormGroup({
    locationName: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(100)]),
    prefix: new FormControl<string | null>('mr', [Validators.required]),
    firstName: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(100)]),
    lastName: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(100)]),
    positionInCompany: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    phoneNumber: new FormControl<string | null>(null, [Validators.required]),

    street: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(150)]),
    addressLine: new FormControl<string | null>(null, []),
    postcode: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(150)]),
    city: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(150)]),
    country: new FormControl<string | null>(null, [Validators.required]),
    stateProvince: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(150)]),
    officeOpenTime: new FormControl<string | null>(null, [Validators.required]),
    officeCloseTime: new FormControl<string | null>(null, [Validators.required]),

    loadingRamp: new FormControl<boolean | null>(null, [Validators.required]),
    weighbridge: new FormControl<boolean | null>(null, [Validators.required]),
    containerType: new FormArray<FormControl<string | null>>([], [Validators.required]),
    selfLoadUnLoadCapability: new FormControl<boolean | null>(null, [Validators.required]),
    haveAccessRestrictions: new FormControl<boolean | null>(null, [Validators.required]),
    accessRestrictions: new FormControl<string | null>(null, []),
    wasteLicence: new FormControl<boolean | null>(null, [Validators.required]),
    acceptedMaterials: new FormArray<FormControl<string | null>>([], [Validators.required]),
    otherMaterial: new FormControl<string | null>(null, [Validators.maxLength(100)]),
  });

  router = inject(Router);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  locationService = inject(LocationService);
  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);
  uploadService = inject(UploadService);
  cd = inject(ChangeDetectorRef);
  translate = inject(TranslatePipe);

  // Dialog mode
  readonly dialogRef = inject(MatDialogRef<EditSiteComponent>, { optional: true });
  dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  isDialog = !!this.dialogData;

  constructor() {
    this.user = toSignal(this.authService.user$);
    const materialSelection = createMaterialSelectionController({
      allMaterialCodes: this.allMaterialCodes,
      materials: this.materials,
      markTouchedOnSelectAll: true,
      markDirtyOnSelectAll: true,
      onSelectionChanged: () => {
        this.formGroup.markAsDirty();
        this.formGroup.updateValueAndValidity();
      },
    });

    this.selectAllMaterial = materialSelection.selectAllMaterial;
    this.expandAllMaterials = materialSelection.expandAllMaterials;
    this.expandedMaterialGroup = materialSelection.expandedMaterialGroup;
    this.toggleSelectAllMaterials = materialSelection.toggleSelectAllMaterials;
    this.onMaterialPanelToggle = materialSelection.onMaterialPanelToggle;
    this.updateSelectAllMaterialState = materialSelection.updateSelectAllMaterialState;

    effect(() => {
      if (this.selectAllContainerTypes()) {
        this.containerType.clear();
        this.containerTypeList.forEach((type) => {
          this.containerType.push(new FormControl(type.value));
        });
      } else {
        this.containerType.clear();
      }
      this.formGroup.markAsDirty();
      this.containerType.updateValueAndValidity();
    });

    effect(() => {
      const { acceptedMaterials, otherMaterial } = this.formGroup.controls;
      if (this.showOtherMaterial()) {
        otherMaterial.setValidators([Validators.required]);
        acceptedMaterials.clearValidators();
      } else {
        otherMaterial.clearValidators();
        otherMaterial.setValue(null);
        otherMaterial.markAsUntouched();
        acceptedMaterials.setValidators([Validators.required]);
      }

      acceptedMaterials.updateValueAndValidity();
      otherMaterial.updateValueAndValidity();
    });

    effect(() => {
      if (this.showAccessRestriction()) {
        this.formGroup.get('accessRestrictions')?.setValidators([Validators.required, Validators.maxLength(200)]);
      } else {
        this.formGroup.get('accessRestrictions')?.clearValidators();
        this.formGroup.get('accessRestrictions')?.markAsUntouched();
      }
      this.formGroup.get('accessRestrictions')?.updateValueAndValidity();
    });

    this.route.params.pipe(takeUntilDestroyed()).subscribe((params) => {
      if (params['id']) {
        this.refresh(parseInt(params['id']));
      }
    });
  }

  ngOnInit() {
    const currentPath = this.route.snapshot.routeConfig?.path;
    this.mode = currentPath === 'add' ? 'add' : 'edit';
  }

  ngAfterViewInit(): void {
    this.bindMaterialAndContainerTye();
  }

  get containerType() {
    return this.formGroup.get('containerType') as FormArray;
  }

  onBack() {
    const currentLocationId = this.location?.id ?? this.route.snapshot.params['id'];
    const targetRoutes = currentLocationId ? [ROUTES_WITH_SLASH.sites, currentLocationId] : [ROUTES_WITH_SLASH.sites];

    if (this.mode === 'edit' && currentLocationId) {
      this.router.navigate(targetRoutes);
      return;
    }

    if (this.formGroup.pristine) {
      this.router.navigate(targetRoutes);
      return;
    }

    this.dialog
      .open(ConfirmModalComponent, {
        maxWidth: '500px',
        width: '100%',
        panelClass: 'px-3',
        data: {
          title: 'You have unsaved changes. Are you sure you want to close without saving?',
          confirmLabel: 'Confirm',
          cancelLabel: 'Cancel',
        },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((close) => {
        if (!close) return;

        this.router.navigate(targetRoutes);
      });
  }

  onDeleteLocation() {
    this.dialog.open(ConfirmDeleteLocationModalComponent, {
      maxWidth: '400px',
      width: '100%',
      panelClass: 'px-3',
      data: {
        location: this.location,
      },
    });
  }

  onSelectedItem(event: MatCheckboxChange, item: string) {
    if (event.checked) {
      this.containerType.push(new FormControl(item));
    } else {
      const idx = this.containerType.controls.findIndex((control) => control.value === item);
      if (idx !== -1) {
        this.containerType.removeAt(idx);
      }
    }
    this.containerType.updateValueAndValidity();
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
  }

  get materials() {
    return this.formGroup.get('acceptedMaterials') as FormArray;
  }

  onSelectedMaterial(event: MatCheckboxChange, item: string) {
    if (event.checked) {
      this.materials.push(new FormControl(item));
    } else {
      const idx = this.materials.controls.findIndex((control) => control.value === item);
      if (idx !== -1) {
        this.materials.removeAt(idx);
      }
    }
    this.materials.markAsTouched();
    this.materials.updateValueAndValidity();
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
    this.updateSelectAllMaterialState();
  }

  onLicenceChange(event: MatRadioChange) {
    this.selectedFiles.set([]);
  }

  handleFileReady(file: FileInfo[] | null) {
    this.selectedFiles.set(file ?? []);
  }

  refresh(id: number) {
    this.loading.set(true);
    this.locationService
      .getLocationDetail(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        retry(3),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe((location) => {
        if (location) {
          this.location = location;
          this.bindValueToForm();
        }
      });
  }

  bindMaterialAndContainerTye() {
    if (this.location) {
      const { containerType, acceptedMaterials } = this.location;
      if (containerType.length > 0) {
        this.containerType.clear();
        containerType.forEach((type: string) => {
          this.containerType.push(new FormControl(type));
        });
        if (containerType.includes('all')) {
          this.containerTypeList.forEach((type) => {
            this.containerType.push(new FormControl(type.value));
          });
        }
        this.containerType.markAsPristine();
        this.containerType.updateValueAndValidity();
      }

      if (acceptedMaterials?.length) {
        this.materials.clear();
        const materialWithoutType = materialTypes.flatMap((t) => t.materials);
        let other: string[] = [];
        acceptedMaterials.forEach((material) => {
          const found = materialWithoutType.find((m) => m.code === material);
          if (found) {
            this.materials.push(new FormControl(material));
          } else {
            other.push(material);
          }
        });

        if (other.length) {
          this.showOtherMaterial.set(true);
          this.formGroup.patchValue({ otherMaterial: other.join(', ') });
        }
        this.materials.markAsPristine();
        this.materials.updateValueAndValidity();
      }
      this.updateSelectAllMaterialState();
      this.expandAllMaterials.set(false);
      this.expandedMaterialGroup.set(null);
    }
  }

  bindValueToForm() {
    if (this.location) {
      const {
        locationName,
        firstName,
        lastName,
        prefix,
        positionInCompany,
        phoneNumber,
        addressLine,
        street,
        postcode,
        city,
        country,
        stateProvince,
        officeOpenTime,
        officeCloseTime,
        loadingRamp,
        weighbridge,
        selfLoadUnLoadCapability,
        accessRestrictions,
        companyLocationDocuments,
      } = this.location;

      if (accessRestrictions != 'N/a') {
        this.showAccessRestriction.set(true);
        this.formGroup.patchValue({
          accessRestrictions,
          haveAccessRestrictions: true,
        });
      } else {
        this.formGroup.patchValue({
          haveAccessRestrictions: false,
          accessRestrictions: null,
        });
      }

      this.formGroup.patchValue({
        locationName,
        firstName,
        lastName,
        prefix,
        positionInCompany,
        phoneNumber,
        addressLine,
        street,
        postcode,
        city,
        country,
        stateProvince,
        officeOpenTime: officeOpenTime,
        officeCloseTime: officeCloseTime,
        loadingRamp,
        weighbridge,
        selfLoadUnLoadCapability,
        wasteLicence: companyLocationDocuments?.length > 0,
      });

      this.wasteCarrierLicenseDocuments = companyLocationDocuments;
      this.bindMaterialAndContainerTye();
      this.formGroup.markAsUntouched();
      this.formGroup.markAsPristine();
      this.formGroup.updateValueAndValidity();
    }
  }

  private isDocumentsChanged(originalDocs: IDocument[], selectedFiles: any[]): boolean {
    const originalMap = new Map(originalDocs.map((d) => [d.id, d]));
    const { wasteLicence } = this.formGroup.value;

    for (const file of selectedFiles) {
      const orig = originalMap.get(file.fileId ?? file.id);

      if (!orig) return true;
      const expiryOrig = orig.expiryDate
        ? moment(orig.expiryDate, ['YYYY-MM-DD', 'DD/MM/YYYY', moment.ISO_8601]).format('YYYY-MM-DD')
        : null;

      let expirySel: string | null = null;
      if (file.expiryDate) {
        expirySel = moment.isMoment(file.expiryDate)
          ? file.expiryDate.format('YYYY-MM-DD')
          : moment(file.expiryDate).format('YYYY-MM-DD');
      }

      if (expiryOrig !== expirySel) {
        return true;
      }
    }

    if (!wasteLicence) {
      return true;
    }

    if (originalDocs.length !== selectedFiles.length) return true;

    return false;
  }

  get isSubmitDisabled(): boolean {
    return (
      (this.formGroup.value.wasteLicence && this.selectedFiles().length === 0) ||
      !(this.formGroup.dirty || this.isDocumentsChanged(this.wasteCarrierLicenseDocuments, [...this.selectedFiles()]))
    );
  }

  submit() {
    if (this.formGroup.invalid) {
      scrollToFirstInvalidControl(this.formGroup);
      return;
    }

    this.dialog
      .open(ConfirmModalComponent, {
        maxWidth: '500px',
        width: '100%',
        panelClass: 'px-3',
        data: {
          title: 'Are you sure you want to save these changes?',
          confirmLabel: 'Confirm',
          cancelLabel: 'Cancel',
        },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((shouldSaveChange) => {
        if (!shouldSaveChange) return;
        this.submitting.set(true);

        const { haveAccessRestrictions, wasteLicence, ...rest } = this.formGroup.value;
        const payload: Record<string, any> = { ...rest };
        payload['companyId'] = this.user()?.companyId;
        if (!haveAccessRestrictions) {
          payload['accessRestrictions'] = 'N/a';
        }

        const licenceFiles = this.selectedFiles().map((f) => ({
          ...f,
          documentType: CompanyDocumentType.WasteCarrierLicense,
        }));
        const fileUpload = licenceFiles.filter((f) => f.file instanceof File);

        if (payload['otherMaterial']) {
          const rawOther = payload['otherMaterial'] as string;
          const others = rawOther.includes(',')
            ? rawOther
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [rawOther.trim()];

          payload['acceptedMaterials'] = payload['acceptedMaterials'] ?? [];
          payload['acceptedMaterials'].push(...others);
          delete payload['otherMaterial'];
        }

        if (fileUpload.length) {
          this.uploadService
            .uploadMultiFile(fileUpload.map((f) => f.file))
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              catchError((err) => {
                this.snackBar.open(
                  this.translate.transform(localized$('An error occurred while uploading the file. Please try again.')),
                  this.translate.transform(localized$('OK')),
                  {
                    duration: 3000,
                  },
                );
                return EMPTY;
              }),
            )
            .subscribe((documentUrls) => {
              if (!documentUrls) return;

              const documents = documentUrls.map((url, index) => {
                const file = fileUpload[index];
                if (file.expiryDate) {
                  return {
                    documentType: file.documentType,
                    documentUrl: url,
                    documentName: fileUpload[index].file.name,
                    expiryDate: moment(file.expiryDate).format('DD/MM/YYYY'),
                  };
                }

                return {
                  documentType: file.documentType,
                  documentName: fileUpload[index].file.name,
                  documentUrl: url,
                };
              });
              const companyLocationDocuments = [...documents, ...licenceFiles.filter((l) => !l.file)];
              this.doAction({ ...payload, companyLocationDocuments });
            });
        } else {
          const companyLocationDocuments = this.wasteCarrierLicenseDocuments
            .filter((doc) =>
              this.selectedFiles()
                .filter((f) => !(f.file instanceof File))
                .some((f) => f.documentType === CompanyDocumentType.WasteCarrierLicense && f.fileId === doc.id),
            )
            .map((doc) => {
              const selectedFile = this.selectedFiles().find((f) => f.fileId === doc.id);
              if (selectedFile && selectedFile.expiryDate) {
                return {
                  ...doc,
                  expiryDate: moment(selectedFile.expiryDate).format('DD/MM/YYYY'),
                };
              }
              if (!doc.expiryDate) delete doc.expiryDate;
              return doc;
            });
          this.doAction({ ...payload, companyLocationDocuments });
        }
      });
  }

  doAction(payload: any) {
    let request;
    if (this.mode === 'edit' && this.location?.id) {
      request = this.locationService.updateLocation(this.location.id, payload);
    } else {
      request = this.locationService.addLocation(payload);
    }

    const errorMessage =
      this.mode == 'edit'
        ? this.translate.transform(localized$('Failed to save changes, please check your input and try again.'))
        : this.translate.transform(localized$('Failed to add new location. Please check your input and try again.'));
    const successMessage =
      this.mode == 'edit'
        ? this.translate.transform(localized$('Location updated successfully.'))
        : this.translate.transform(localized$('Location added successfully.'));

    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.submitting.set(false);
        }),
        catchError((err) => {
          this.snackBar.open(errorMessage, localized$('Ok'), {
            duration: 3000,
          });
          return EMPTY;
        }),
      )
      .subscribe((res) => {
        if (this.mode == 'add' && !res) {
          this.snackBar.open(errorMessage, localized$('Ok'), {
            duration: 3000,
          });

          return;
        }
        this.snackBar.open(successMessage, localized$('OK'), { duration: 3000 });

        if (this.isDialog) {
          this.dialogRef?.close(res);
          return;
        }

        const next =
          this.mode === 'edit' && this.location?.id
            ? [ROUTES_WITH_SLASH.sites, this.location.id]
            : [ROUTES_WITH_SLASH.sites, 'add', 'success'];
        this.locationService.getLocations().subscribe();
        this.router.navigate(next);
      });
  }

  closeDialog() {
    this.dialogRef?.close();
  }
}
