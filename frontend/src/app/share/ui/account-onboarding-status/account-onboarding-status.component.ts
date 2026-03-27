import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AuthService } from 'app/services/auth.service';
import { addLanguagePrefix } from 'app/utils/language.utils';

@Component({
  selector: 'app-account-onboarding-status',
  templateUrl: './account-onboarding-status.component.html',
  styleUrls: ['./account-onboarding-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, RouterModule, MatButtonModule, TranslateModule],
})
export class AccountOnboardingStatusComponent implements OnInit {
  @Input() type: 'pending' | 'completed' | 'completing' = 'pending';
  @Input() showStatusOnly = false;
  @Input() isHaulier = false;

  ROUTES_WITH_SLASH = ROUTES_WITH_SLASH;

  router = inject(Router);
  authService = inject(AuthService);
  constructor() {}
  ngOnInit() {}

  goToPlatform() {
    const targetRoute = this.authService.getDefaultRouteByRole();
    this.router.navigateByUrl(targetRoute);
  }

  onBack() {
    this.router.navigateByUrl(addLanguagePrefix('/company-information'));
  }

  navigateTo(path: string) {
    this.router.navigateByUrl(addLanguagePrefix(path));
  }
}
