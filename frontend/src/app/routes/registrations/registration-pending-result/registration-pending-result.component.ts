import { Component, inject, OnInit } from '@angular/core';
import { AccountOnboardingStatusComponent } from '@app/ui';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslatePipe } from '@ngx-translate/core';
import { UnAuthLayoutComponent } from 'app/layout/un-auth-layout/un-auth-layout.component';
import { AuthService } from 'app/services/auth.service';
import { SeoService } from 'app/services/seo.service';

@Component({
  selector: 'app-registration-pending-result',
  templateUrl: './registration-pending-result.component.html',
  imports: [AccountOnboardingStatusComponent, UnAuthLayoutComponent],
})
export class RegistrationPendingResultComponent implements OnInit {
  authService = inject(AuthService);
  private readonly seoService = inject(SeoService);
  private translate = inject(TranslatePipe);

  ngOnInit(): void {
    this.setupSeo();
  }

  setupSeo() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Complete your account')),
      description: this.translate.transform(
        localized$(
          'Thank you for registering! Complete your account To unlock the full features of WasteTrade and become an approved company, you need to provide some information about yourself and your company. Click COMPLETE ACCOUNT to begin setting up your company profile. Complete Account &quot;*&quot; indicates required fields 11. Company Info22. Site Location33. Documentation This field is…',
        ),
      ),
    });
  }
}
