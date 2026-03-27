import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';

@Component({
  selector: 'app-listing-footer',
  templateUrl: './listing-footer.component.html',
  styleUrls: ['./listing-footer.component.scss'],
  imports: [MatButtonModule, RouterModule, TranslateModule],
})
export class ListingFooterComponent {
  readonly ROUTES_WITH_SLASH = ROUTES_WITH_SLASH;
}
