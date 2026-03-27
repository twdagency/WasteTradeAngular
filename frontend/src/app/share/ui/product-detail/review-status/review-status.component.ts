import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ListingState } from 'app/models';

@Component({
  selector: 'app-review-status',
  templateUrl: './review-status.component.html',
  styleUrls: ['./review-status.component.scss'],
  imports: [MatIconModule, TranslateModule],
})
export class ReviewStatusComponent {
  @Input() state: string = '';
  ListingState = ListingState;
}
