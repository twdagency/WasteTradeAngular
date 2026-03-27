import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { CommonLayoutComponent } from '../../layout/common-layout/common-layout.component';
import { AuthService } from 'app/services/auth.service';
import { SeoService } from 'app/services/seo.service';
import { HaulierLayoutComponent } from 'app/layout/haulier-layout/haulier-layout.component';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  imports: [CommonLayoutComponent, MatIconModule, TranslateModule, HaulierLayoutComponent],
  providers: [TranslatePipe],
})
export class LandingPageComponent implements OnInit {
  authService = inject(AuthService);
  private seoService = inject(SeoService);
  private translate = inject(TranslatePipe);

  isHaulier = this.authService.isHaulierUser;
  constructor() {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Welcome')),
      description: this.translate.transform(
        localized$(
          'WasteTrade - The leading marketplace for waste materials trading. Buy and sell LDPE Film, HDPE Bottles, PET Shredded, HDPE Drums and more.'
        )
      ),
    });
  }
}
