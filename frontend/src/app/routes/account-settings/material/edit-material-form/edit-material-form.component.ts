import { Component, DestroyRef, effect, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { materialTypes } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from 'app/layout/common/icon/icon.component';
import { SettingsService } from 'app/services/settings.service';
import { ConfirmModalComponent } from 'app/share/ui/confirm-modal/confirm-modal.component';
import { createMaterialSelectionController } from 'app/share/utils/material-selection';
import { scrollToFirstInvalidControl } from 'app/utils/form.utils';
import { catchError, EMPTY, finalize } from 'rxjs';

@Component({
  selector: 'app-edit-material-form',
  templateUrl: './edit-material-form.component.html',
  styleUrls: ['./edit-material-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCheckboxModule,
    IconComponent,
    MatExpansionModule,
    TranslateModule,
    MatInputModule,
  ],
  providers: [TranslatePipe],
})
export class EditMaterialFormComponent implements OnInit {
  materialType = materialTypes;
  private readonly allMaterialCodes = this.materialType
    .flatMap((group) => group.materials ?? [])
    .map((item) => item.code);
  selectAllMaterial!: WritableSignal<boolean>;
  expandAllMaterials!: WritableSignal<boolean>;
  expandedMaterialGroup!: WritableSignal<string | null>;
  toggleSelectAllMaterials!: () => void;
  onMaterialPanelToggle!: (name: string, expanded: boolean) => void;
  private updateSelectAllMaterialState!: () => void;
  submitting = signal(false);
  showOtherMaterial = signal(false);

  formGroup = new FormGroup({
    favoriteMaterials: new FormArray([], [Validators.required]),
    otherMaterial: new FormControl<string | null>(null),
  });

  readonly dialogRef = inject(MatDialogRef<string[]>);
  readonly data = inject<{ materials: string[]; otherMaterial: string | null; companyId: number }>(MAT_DIALOG_DATA);
  snackBar = inject(MatSnackBar);
  settingsService = inject(SettingsService);
  dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  translate = inject(TranslatePipe);

  get favoriteMaterials(): FormArray {
    return this.formGroup.get('favoriteMaterials') as FormArray;
  }

  constructor() {
    const materialSelection = createMaterialSelectionController({
      allMaterialCodes: this.allMaterialCodes,
      materials: this.favoriteMaterials,
      markTouchedOnSelectAll: true,
      markDirtyOnSelectAll: true,
      onSelectionChanged: () => {
        this.favoriteMaterials.markAsDirty();
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
      const { favoriteMaterials, otherMaterial } = this.formGroup.controls;
      if (this.showOtherMaterial()) {
        otherMaterial.setValidators([Validators.required]);
        favoriteMaterials.clearValidators();
      } else {
        otherMaterial.clearValidators();
        otherMaterial.setValue(null);
        otherMaterial.markAsUntouched();
        favoriteMaterials.setValidators([Validators.required]);
      }

      favoriteMaterials.updateValueAndValidity();
      otherMaterial.updateValueAndValidity();
    });
  }

  ngOnInit() {
    if (this.data.materials.length > 0) {
      this.data.materials.forEach((material) => {
        this.favoriteMaterials.push(new FormControl(material));
      });
    }
    if (this.data.otherMaterial) {
      this.formGroup.patchValue({
        otherMaterial: this.data.otherMaterial,
      });
      this.showOtherMaterial.set(true);
    }
    this.favoriteMaterials.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
    this.updateSelectAllMaterialState();
    this.expandAllMaterials.set(false);
    this.expandedMaterialGroup.set(null);
  }

  onSelectedMaterial(event: MatCheckboxChange, item: string) {
    if (event.checked) {
      this.favoriteMaterials.push(new FormControl(item));
    } else {
      const idx = this.favoriteMaterials.controls.findIndex((control) => control.value === item);
      if (idx !== -1) {
        this.favoriteMaterials.removeAt(idx);
      }
    }
    this.favoriteMaterials.markAsTouched();
    this.favoriteMaterials.markAsDirty();
    this.favoriteMaterials.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
    this.updateSelectAllMaterialState();
  }

  close() {
    if (this.formGroup.pristine) {
      this.dialogRef.close(false);
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

        this.dialogRef.close(false);
      });
  }

  submit() {
    if (this.formGroup.invalid) {
      scrollToFirstInvalidControl(this.formGroup);
      return;
    }

    const payload: any = {
      favoriteMaterials: this.favoriteMaterials.value,
      otherMaterial: this.formGroup.get('otherMaterial')?.value ?? '',
    };

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

        this.settingsService
          .updateMaterialPreferences(this.data.companyId, payload)
          .pipe(
            catchError((err) => {
              this.snackBar.open(
                this.translate.transform(localized$('Failed to save changes. Please try again.')),
                this.translate.transform(localized$('OK')),
                {
                  duration: 3000,
                },
              );
              return EMPTY;
            }),
            finalize(() => {
              this.submitting.set(false);
            }),
          )
          .subscribe((res) => {
            this.snackBar.open(
              this.translate.transform(localized$('Your material preferences have been updated successfully.')),
              this.translate.transform(localized$('OK')),
              {
                duration: 3000,
              },
            );
            this.dialogRef.close(true);
          });
      });
  }

}
