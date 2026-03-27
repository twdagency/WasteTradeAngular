import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { mapCountryCodeToName, materialTypes } from '@app/statics';
import { TranslateModule } from '@ngx-translate/core';
import { MemberDetail } from 'app/models/admin/commercial.model';
import { getLocationAddress } from 'app/share/utils/offer';
import { ItemOf } from 'app/types/utils';
import { cloneDeep, isNil } from 'lodash';

const MAP_CONTAINER_TYPES_TO_NAME: Record<string, string> = {
  curtain_slider_standard: 'Curtain Slider Standard',
  shipping_container: 'Container',
  walking_floor: 'Walking Floor',
  tipperTrucks: 'Tipper Trucks',
};
@Component({
  selector: 'app-admin-member-location',
  imports: [MatAccordion, MatExpansionModule, MatIconModule, TranslateModule],
  templateUrl: './admin-member-location.component.html',
  styleUrl: './admin-member-location.component.scss',
})
export class AdminMemberLocationComponent implements OnInit {
  locations = input<MemberDetail['company']['locations']>();
  mapCountryCodeToName = mapCountryCodeToName;

  readonly dialogRef = inject(MatDialogRef<AdminMemberLocationComponent>, { optional: true });
  readonly data = inject(MAT_DIALOG_DATA, { optional: true });
  private readonly preferredLocations = signal<MemberDetail['company']['locations']>(this.locations() ?? []);

  hideHeadQuarter = signal<boolean>(false);

  transformedLocations = computed(() => {
    const mainLocation = this.preferredLocations()?.findIndex((location) => !!location.mainLocation);
    let newLocations = cloneDeep(this.preferredLocations() ?? []);
    if (mainLocation !== undefined && mainLocation >= 0) {
      const mainLocationItem = newLocations.splice(mainLocation, 1)[0];
      newLocations.unshift(mainLocationItem);
    }
    return newLocations;
  });

  getLocationAddress = getLocationAddress;

  private readonly materialTypes = materialTypes;

  materialAccepteds = computed(() => {
    const acceptedMaterials = (this.preferredLocations() ?? []).map((i) => i.acceptedMaterials ?? '');
    const result = acceptedMaterials.map((acceptedMaterialItem) => {
      return this.materialTypes
        .filter((type) => {
          return type.materials.some((material) => acceptedMaterialItem.includes(material.code));
        })
        .map((type) => {
          return {
            code: type.code,
            name: type.name,
            materials: type.materials.filter((material) => acceptedMaterialItem.includes(material.code)),
          };
        });
    });

    return result;
  });

  ngOnInit(): void {
    const dialogLocations = this.data && this.data.location;
    if (dialogLocations) {
      this.preferredLocations.set(dialogLocations);
      this.hideHeadQuarter.set(true);
    } else {
      this.preferredLocations.set(this.locations() ?? []);
    }
  }

  containerType(location: ItemOf<MemberDetail['company']['locations']>) {
    const types = location.containerType;

    if (!Array.isArray(types)) return [];

    const allKeysExist = types.every((type) => type in MAP_CONTAINER_TYPES_TO_NAME);

    return allKeysExist ? types.map((type) => MAP_CONTAINER_TYPES_TO_NAME[type]) : types;
  }

  toYesNo(value: boolean | null | undefined): string {
    return isNil(value) ? '-' : value ? 'Yes' : 'No';
  }

  getMaterials(type: any): string {
    return type.materials.map((m: any) => m.name).join(', ');
  }
}
