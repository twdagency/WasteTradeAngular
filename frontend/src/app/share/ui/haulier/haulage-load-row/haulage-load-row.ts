import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import moment from 'moment';
@Component({
  selector: 'app-haulage-load-row',
  templateUrl: './haulage-load-row.html',
  styleUrls: ['./haulage-load-row.scss'],
  imports: [TranslateModule, MatButtonModule, CommonModule, MatTooltipModule, TranslateModule, DecimalPipe],
})
export class HaulageLoadRowComponent {
  item = input<any>();
  @Input() isApproved: boolean | undefined = undefined;

  route = inject(Router);

  isExpired = computed(() => {
    return !this.item().expiresAt ? false : moment(this.item().expiresAt).isBefore(new Date());
  });

  goToPage(offerId: string) {
    this.route.navigateByUrl(`${ROUTES_WITH_SLASH.makeOffer}?listing_id=${this.item().listingId}&bid_id=${offerId}`);
  }
}
