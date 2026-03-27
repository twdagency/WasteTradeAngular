import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingState, ListingStatus } from 'app/models';
import { ListingService } from 'app/services/listing.service';
import { ListContainerComponent } from 'app/share/ui/list-container/list-container.component';
import { allFilters } from 'app/share/ui/listing/filter/constant';
import { ItemOf } from 'app/types/utils';
import { ListingDetailComponent } from './listing-detail/listing-detail.component';

const PAGE_SIZE = 20;

interface PageResult {
  results: any;
  totalCount: number;
}
@Component({
  selector: 'app-listings',
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.scss'],
  imports: [ListContainerComponent, ListingDetailComponent],
})
export class ListingsComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  listingsService = inject(ListingService);
  customOptionValues: Record<ItemOf<typeof allFilters>['value'], any> = {
    status: [
      { code: ListingStatus.PENDING, name: 'Pending' },
      { code: ListingStatus.AVAILABLE, name: 'Available' },
      { code: ListingStatus.REJECTED, name: 'Rejected' },
      {
        code: ListingStatus.SOLD,
        name: 'Sold',
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

  constructor() {}

  ngOnInit() {}
}
