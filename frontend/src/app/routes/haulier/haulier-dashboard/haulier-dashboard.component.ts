import { Component, inject, OnInit } from '@angular/core';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslatePipe } from '@ngx-translate/core';
import { HaulierLayoutComponent } from 'app/layout/haulier-layout/haulier-layout.component';
import { SeoService } from 'app/services/seo.service';

@Component({
  selector: 'app-haulier-dashboard',
  templateUrl: './haulier-dashboard.component.html',
  styleUrls: ['./haulier-dashboard.component.scss'],
  imports: [HaulierLayoutComponent],
  providers: [TranslatePipe],
})
export class HaulierDashboardComponent implements OnInit {
  private seoService = inject(SeoService);
  private translate = inject(TranslatePipe);

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Haulier Dashboard')),
      description: this.translate.transform(localized$('Haulier Dashboard')),
    });
    this.seoService.setNoIndex();
  }
}
