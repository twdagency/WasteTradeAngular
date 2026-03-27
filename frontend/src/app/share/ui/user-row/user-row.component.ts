import { CommonModule } from '@angular/common';

import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MapRoleToName } from 'app/constants/mapping';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';

@Component({
  selector: 'app-user-row',
  imports: [TranslateModule, MatButtonModule, CommonModule],
  templateUrl: './user-row.component.html',
  styleUrl: './user-row.component.scss',
})
export class UserRowComponent {
  @Input() user!: any;
  router = inject(Router);

  readonly MapRoleToName = MapRoleToName;

  onViewDetail() {
    if (!this.user || !this.user.id) return;
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.adminDetail}/${this.user.id}`);
  }
}
