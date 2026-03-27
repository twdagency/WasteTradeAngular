import { TitleCasePipe } from '@angular/common';
import { Component, effect, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { materialTypes } from '@app/statics';
import { TranslateModule } from '@ngx-translate/core';
import { User } from 'app/models';
import { AuthService } from 'app/services/auth.service';
import { PermissionDisableDirective, PermissionTooltipDirective } from 'app/share/directives';
import { EditMaterialFormComponent } from './edit-material-form/edit-material-form.component';

@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.scss'],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    FormsModule,
    TranslateModule,
    TitleCasePipe,
    PermissionTooltipDirective,
    PermissionDisableDirective,
    MatTooltipModule,
  ],
})
export class MaterialComponent {
  favoriteMaterials: string[] | undefined = [];
  otherMaterial: string | null = null;
  companyId: number | undefined;

  materialType = materialTypes;
  materials: any[] = [];
  user: Signal<User | null | undefined>;

  dialog = inject(MatDialog);
  authService = inject(AuthService);

  constructor() {
    this.user = toSignal(this.authService.user$);

    effect(() => {
      if (this.user()?.company) {
        this.favoriteMaterials = this.user()?.company?.favoriteMaterials;
        this.otherMaterial = this.user()?.company?.otherMaterial ?? null;
        this.companyId = this.user()?.company.id;

        this.showMaterial();
      }
    });
  }

  showMaterial() {
    this.materials = this.materialType
      .filter((type) => {
        return type.materials.some((material) => this.favoriteMaterials?.includes(material.code));
      })
      .map((type) => {
        return {
          code: type.code,
          name: type.name,
          materials: type.materials.filter((material) => this.favoriteMaterials?.includes(material.code)),
        };
      });
  }

  openEditMaterialForm() {
    const dataConfig: MatDialogConfig = {
      data: {
        materials: this.materials.flatMap((type) => type.materials.map((m: any) => m.code)),
        otherMaterial: this.otherMaterial,
        companyId: this.companyId,
      },
      width: '100%',
      maxWidth: '960px',
    };
    const dialogRef = this.dialog.open(EditMaterialFormComponent, dataConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.checkToken().subscribe(() => {
          this.showMaterial();
        });
      }
    });
  }

  getMaterials(type: any): string {
    return type.materials.map((m: any) => m.name).join(', ');
  }
}
