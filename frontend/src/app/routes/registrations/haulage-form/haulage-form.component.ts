import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { UnAuthLayoutComponent } from 'app/layout/un-auth-layout/un-auth-layout.component';
import { SeoService } from 'app/services/seo.service';

import { HaulierFormComponent } from 'app/share/ui/haulier/haulier-form/haulier-form.component';

@Component({
  selector: 'app-haulage-form',
  templateUrl: './haulage-form.component.html',
  styleUrls: ['./haulage-form.component.scss'],
  imports: [HaulierFormComponent, UnAuthLayoutComponent, TranslateModule],
})
export class HaulageFormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly seoService = inject(SeoService);
  private translate = inject(TranslatePipe);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Create Haulier Account')),
      description: this.translate.transform(
        localized$(
          'Do you have a WasteTrade account? Login Haulier Register Haulier Signup Unique ID Personal Information asgasg Name(Required) PREFIX* Dr.MissMr.Mrs.Ms.Mx.Prof.Rev. FIRST NAME* LAST NAME* Email(Required) EMAIL* CONFIRM EMAIL* Password(Required) PASSWORD* CONFIRM PASSWORD * Company Information COULD YOU PLEASE CONFIRM THE COUNTRY WHERE YOUR VAT REGISTRATION IS LOCATED?*(Required) EU (European Union) United Kingdom Other COMPANY VAT NUMBER*(Required)COMPANY…',
        ),
      ),
    });
  }

  goLogin() {
    this.router.navigateByUrl(ROUTES_WITH_SLASH.login);
  }
}
