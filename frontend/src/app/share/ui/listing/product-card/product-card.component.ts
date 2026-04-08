import { DecimalPipe } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, Output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FallbackImageDirective } from '@app/directives';
import { mapCountryCodeToName } from '@app/statics';
import { TranslateModule } from '@ngx-translate/core';
import { ListingImageType, ListingMaterial } from 'app/models';
import { AuthService } from 'app/services/auth.service';
import { getListingTitle } from 'app/share/utils/offer';
import { map } from 'rxjs';
import { ProductStatusComponent } from '../product-status/product-status.component';

@Component({
  selector: 'app-product-card',
  imports: [
    MatIconModule,
    ProductStatusComponent,
    FallbackImageDirective,
    TranslateModule,
    DecimalPipe,
    MatTooltipModule,
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input() materialInterest = true;
  @Input({ required: true }) product: ListingMaterial | undefined;
  @Input() deletable: boolean = false;
  @Output() delete = new EventEmitter();

  auth = inject(AuthService);

  mapCountryCodeToName = mapCountryCodeToName;
  getListingTitle = getListingTitle;
  userId = toSignal(this.auth.user$.pipe(map((user) => user?.userId)));
  isOwnListing = computed(() => this.userId() === this.product?.createdByUserId);
  constructor() {}

  get featureImage() {
    return this.product?.documents?.find((i) => i.documentType === ListingImageType.FEATURE_IMAGE)?.documentUrl ?? '';
  }

  onDelete(e: MouseEvent) {
    if (this.product?.hasPendingOffer) return;

    e.preventDefault();
    e.stopPropagation();

    this.delete.emit();
  }
}
