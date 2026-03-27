import { Component, inject, OnInit } from '@angular/core';
import { ListingState, ListingStatus } from 'app/models';
import { ListingService } from 'app/services/listing.service';
import { ListContainerComponent, PageResult } from 'app/share/ui/list-container/list-container.component';
import { allFilters } from 'app/share/ui/listing/filter/constant';
import { ItemOf } from 'app/types/utils';
import { Observable, of } from 'rxjs';
import { WantedDetailComponent } from './wanted-detail/wanted-detail.component';

@Component({
  selector: 'app-wanted',
  templateUrl: './wanted.component.html',
  styleUrls: ['./wanted.component.scss'],
  imports: [ListContainerComponent, WantedDetailComponent],
})
export class WantedComponent implements OnInit {
  listingsService = inject(ListingService);
  constructor() {}

  customOptionValues: Record<ItemOf<typeof allFilters>['value'], any> = {
    status: [
      { code: ListingStatus.PENDING, name: 'Pending' },
      { code: ListingStatus.AVAILABLE, name: 'Available' },
      { code: ListingStatus.REJECTED, name: 'Rejected' },
      {
        code: ListingStatus.SOLD,
        name: 'Fulfilled',
      },
    ],
    state: [
      { code: ListingState.PENDING, name: 'Pending' },
      {
        code: ListingState.APPROVED,
        name: 'Approved',
      },
      { code: ListingState.REJECTED, name: 'Rejected' },
    ],
  };

  ngOnInit() {}

  mockItem(filter: any): Observable<PageResult> {
    const result: any = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const totalCount = result.length;
    return of({ results: result, totalCount });
  }
}
