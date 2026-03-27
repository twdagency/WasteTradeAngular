import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { CommonLayoutComponent } from 'app/layout/common-layout/common-layout.component';
import { OfferService } from 'app/services/offer.service';
import { SeoService } from 'app/services/seo.service';
import { BuyingOfferDetailComponent } from 'app/share/ui/my-offers/buying-offers/buying-offer-detail/buying-offer-detail.component';

@Component({
  selector: 'app-my-offer-buying-detail',
  imports: [BuyingOfferDetailComponent, CommonLayoutComponent, TranslateModule],
  providers: [OfferService],
  templateUrl: './my-offer-buying-detail.component.html',
  styleUrl: './my-offer-buying-detail.component.scss',
})
export class MyOfferBuyingDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  offerId = this.route.snapshot.params['offerId'];
  seoService = inject(SeoService);
  translate = inject(TranslatePipe);

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('My Buying Offers Details')),
    });
    this.seoService.setNoIndex();
  }
}
