import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { mapCountryCodeToName } from '@app/statics';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { User } from 'app/models/admin/user.model';
import { AssignAdminComponent } from 'app/share/ui/assign-admin/assign-admin.component';
import { NotesBtnComponent } from 'app/share/ui/notes/notes-btn/notes-btn.component';
import { AdminNoteDataType } from 'app/share/ui/notes/types/notes';
import {
  MapOnboardingStatusToColor,
  MapOnboardingStatusToLabel,
  MapOverallStatusToLabel,
  MapRegistrationStatusToLabel,
  MapUserStatusToColor,
} from 'app/share/utils/admin';
import { AdminUser, AssignAdminDataType } from '../assign-type/asign-type';

@Component({
  selector: 'app-member-row',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    TranslatePipe,
    TranslateModule,
    CommonModule,
    MatButtonModule,
    FormsModule,
    NotesBtnComponent,
    AssignAdminComponent,
  ],
  templateUrl: './member-row.component.html',
  styleUrl: './member-row.component.scss',
})
export class MemberRowComponent {
  @Input() user!: User;
  @Input() dataType: AssignAdminDataType = AssignAdminDataType.USERS;
  private router = inject(Router);
  readonly AdminNoteDataType = AdminNoteDataType;

  assignees: AdminUser[] = [];
  selectedAdminId: number | null = null;

  readonly mapCountryCodeToName = mapCountryCodeToName;
  readonly MapOverallStatusToLabel = MapOverallStatusToLabel;
  readonly MapRegistrationStatusToLabel = MapRegistrationStatusToLabel;
  readonly MapOnboardingStatusToLabel = MapOnboardingStatusToLabel;
  readonly MapOnboardingStatusToColor = MapOnboardingStatusToColor;
  readonly MapUserStatusToColor = MapUserStatusToColor as any;

  openDetail() {
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.adminMemberDetail}/${this.user.userId}`);
  }
}
