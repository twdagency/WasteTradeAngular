import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MapRoleToName } from 'app/constants/mapping';
@Component({
  selector: 'app-admin-profile',
  imports: [TranslateModule, CommonModule],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.scss',
})
export class AdminProfileComponent {
  @Input() adminData: any;
  @Output() editProfile = new EventEmitter<void>();

  readonly MapRoleToName = MapRoleToName;

  onEditProfile() {
    this.editProfile.emit();
  }
}
