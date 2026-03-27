import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ListingMaterial } from 'app/models';
import { AuthService } from 'app/services/auth.service';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.scss'],
  imports: [MatIconModule, ProductCardComponent, TranslateModule],
})
export class ProductGridComponent implements OnInit {
  @Input() items: any[] = [];
  @Input() totalItems: number = 10;
  @Input() hideResultCount: boolean = false;
  @Input() deletable: boolean = false;
  @Output() materialInterest = new EventEmitter();
  @Output() selectItem = new EventEmitter<any>();
  @Output() delete = new EventEmitter<ListingMaterial>();

  authService = inject(AuthService);

  constructor() {}

  ngOnInit() {}

  isMaterialInterest(material: string): boolean {
    const favoriteMaterials = this.authService?.user?.company?.favoriteMaterials;
    if (favoriteMaterials?.length) {
      const isExits = favoriteMaterials.includes(material);
      return isExits;
    }
    return false;
  }
}
