import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslatePipe } from '@ngx-translate/core';
import { UnAuthLayoutComponent } from 'app/layout/un-auth-layout/un-auth-layout.component';
import { SeoService } from 'app/services/seo.service';

@Component({
  selector: 'app-term',
  templateUrl: './term.component.html',
  styleUrls: ['./term.component.scss'],
  imports: [RouterLink, UnAuthLayoutComponent],
  providers: [TranslatePipe],
})
export class TermComponent implements OnInit {
  private seoService = inject(SeoService);
  private translate = inject(TranslatePipe);

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Terms and Conditions')),
      description: this.translate.transform(
        localized$(
          'WasteTrade is a marketplace platform for plastics, including but not limited to: Acrylic, ABS, EPS, HDPE, LDPE, PC, PET, Polyethylene, PP, PS, PVC.',
        ),
      ),
    });
  }
}
