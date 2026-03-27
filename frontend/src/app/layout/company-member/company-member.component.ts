import { Component, inject } from '@angular/core';
import { CompanyMemberPageComponent } from 'app/layout/company-member/company-member-page/company-member-page.component';
import { AuthService } from 'app/services/auth.service';
import { CommonLayoutComponent } from '../common-layout/common-layout.component';
import { HaulierLayoutComponent } from '../haulier-layout/haulier-layout.component';

@Component({
  selector: 'app-company-member',
  imports: [CommonLayoutComponent, HaulierLayoutComponent, CompanyMemberPageComponent],
  templateUrl: './company-member.component.html',
  styleUrl: './company-member.component.scss',
})
export class CompanyMemberComponent {
  authService = inject(AuthService);
}
