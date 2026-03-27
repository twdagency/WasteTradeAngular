import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { getCurrencySignal, getLocationAddress, getOfferStatusColor } from 'app/share/utils/offer';
import { OfferDetail } from 'app/types/requests/offer';

@Component({
  selector: 'app-bid-pending',
  imports: [DatePipe, DecimalPipe, MatButtonModule, TranslateModule],
  templateUrl: './bid-pending.component.html',
  styleUrl: './bid-pending.component.scss',
})
export class BidPendingComponent {
  router = inject(Router);

  offer = input<OfferDetail | undefined>(undefined);
  getLocationAddress = getLocationAddress;
  getOfferStatusColor = getOfferStatusColor;
  getCurrencySignal = getCurrencySignal;

  onFindNew() {
    this.router.navigateByUrl(ROUTES_WITH_SLASH.buy);
  }
}
