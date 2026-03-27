import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { CommonLayoutComponent } from 'app/layout/common-layout/common-layout.component';
import { OfferService } from 'app/services/offer.service';
import { SeoService } from 'app/services/seo.service';
import { ReceivedOfferDetailComponent } from 'app/share/ui/my-offers/received-offer-detail/received-offer-detail.component';

@Component({
  selector: 'app-my-offers-detail',
  imports: [ReceivedOfferDetailComponent, CommonLayoutComponent, TranslateModule],
  providers: [OfferService],
  templateUrl: './my-offers-detail.component.html',
  styleUrl: './my-offers-detail.component.scss',
})
export class MyOffersDetailComponent {
  offerId = signal<number | undefined>(undefined);
  seoService = inject(SeoService);
  translate = inject(TranslatePipe);

  constructor(private route: ActivatedRoute) {
    const offerId = route.snapshot.params['offerId'];
    this.offerId.set(Number(offerId));
  }

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('My Selling Offers Details')),
    });
    this.seoService.setNoIndex();
  }
}
