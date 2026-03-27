import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslatePipe } from '@ngx-translate/core';
import { UnAuthLayoutComponent } from 'app/layout/un-auth-layout/un-auth-layout.component';
import { SeoService } from 'app/services/seo.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
  imports: [RouterLink, UnAuthLayoutComponent],
  providers: [TranslatePipe],
})
export class PrivacyComponent implements OnInit {
  private seoService = inject(SeoService);
  private translate = inject(TranslatePipe);

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Privacy Policy')),
      description: this.translate.transform(
        localized$(
          'WasteTrade Privacy Policy   Name: Waste Trade Holdings Limited Registered Office: Waste Trade Holdings Limited, Dunston Farm, Dunston, Stafford, ST18 9AB Email: info@www.wastetrade.com This privacy policy sets out how Waste Trade Holdings Limited uses and protects any information that you give. We adhere to the principles of the Data Protection legislation as set out in the…',
        ),
      ),
    });
  }
}
