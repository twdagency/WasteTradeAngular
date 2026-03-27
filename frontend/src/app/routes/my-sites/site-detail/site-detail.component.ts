import { TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { mapCountryCodeToName, materialTypes } from '@app/statics';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { CompanyLocationDetail, ContainerTypeList } from 'app/models/location.model';
import { AuthService } from 'app/services/auth.service';
import { LocationService } from 'app/services/location.service';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { finalize, retry } from 'rxjs';
import { DocumentComponent } from '../../account-settings/document/document.component';

const MAP_CONTAINER_TYPES_TO_NAME: Record<string, string> = {
  curtain_slider_standard: 'Curtain Slider Standard',
  shipping_container: 'Container',
  walking_floor: 'Walking Floor',
  tipperTrucks: 'Tipper Trucks',
};

@Component({
  selector: 'app-site-detail',
  templateUrl: './site-detail.component.html',
  styleUrls: ['./site-detail.component.scss'],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    DocumentComponent,
    SpinnerComponent,
    TitleCasePipe,
    TranslateModule,
  ],
})
export class SiteDetailComponent implements OnInit {
  loading = signal(false);

  materialTypes = materialTypes;
  containerList = ContainerTypeList;
  newMaterials: any[] = [];
  containerManage: string = '';
  mapCountryCodeToName = mapCountryCodeToName;
  location: CompanyLocationDetail | undefined = undefined;
  router = inject(Router);
  route = inject(ActivatedRoute);
  locationService = inject(LocationService);
  snackBar = inject(MatSnackBar);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);

  // Dialog mode
  readonly dialogRef = inject(MatDialogRef<SiteDetailComponent>, { optional: true });
  dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  isDialog = !!this.dialogData?.dialogMode;

  constructor() {
    effect(() => {
      this.refresh();
    });
  }

  ngOnInit() {}

  openEditLocation() {
    this.router.navigate([ROUTES_WITH_SLASH.sites, 'edit', this.location?.id]);
  }

  addNewLocation() {
    this.router.navigate([ROUTES_WITH_SLASH.sites, 'add']);
  }

  refresh() {
    let locationId: number;
    if (!this.isDialog) {
      this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
        locationId = Number(params['id']);
        this.getLocationDetail(locationId);
      });
    } else {
      const locationFormDialog = this.dialogData?.location;
      if (locationFormDialog) {
        // this.getLocationDetail(locationId);
        this.setLocationDetail(locationFormDialog);
      }
    }
  }

  getLocationDetail(locationId: number) {
    this.loading.set(true);
    this.locationService
      .getLocationDetail(locationId)
      .pipe(
        retry(3),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((loc) => {
        if (loc) {
          this.setLocationDetail(loc);
        }
      });
  }

  countryCodeToName(code: string | undefined): string {
    if (!code) {
      return '';
    }
    return this.mapCountryCodeToName[code];
  }

  private setLocationDetail(loc: any) {
    this.location = loc;

    let containerManageResult: string[];

    if (loc.containerType.length === 1 && loc.containerType.includes('all')) {
      containerManageResult = this.containerList.map((c) => c.name);
    } else {
      const types = loc.containerType;

      if (!Array.isArray(types)) {
        containerManageResult = [];
      } else {
        const allKeysExist = types.every((type) => type in MAP_CONTAINER_TYPES_TO_NAME);
        containerManageResult = allKeysExist ? types.map((type) => MAP_CONTAINER_TYPES_TO_NAME[type]) : types;
      }
    }

    this.containerManage = containerManageResult.join(', ');

    const materialWithoutType = materialTypes.flatMap((t) => t.materials);

    this.newMaterials = materialTypes
      .filter((type) => type.materials.some((m) => loc.acceptedMaterials?.includes(m.code)))
      .map((type) => {
        return {
          code: type.code,
          name: type.name,
          materials: type.materials.filter((m) => loc.acceptedMaterials?.includes(m.code)).map((m) => m.name) || [],
        };
      });
  }
}
