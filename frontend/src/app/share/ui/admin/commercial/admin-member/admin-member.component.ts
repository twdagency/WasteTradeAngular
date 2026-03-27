import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { AdminUserService } from 'app/services/admin/admin-user.service';
import { ListContainerComponent } from 'app/share/ui/list-container/list-container.component';
import { MemberRowComponent } from './member-row/member-row.component';

@Component({
  selector: 'app-admin-member',
  imports: [
    MatSnackBarModule,

    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    ListContainerComponent,
    MemberRowComponent,
  ],
  providers: [TranslatePipe],
  templateUrl: './admin-member.component.html',
  styleUrl: './admin-member.component.scss',
})
export class AdminMemberComponent {
  adminUser = inject(AdminUserService);
  constructor() {}
}
