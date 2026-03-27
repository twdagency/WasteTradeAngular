import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingOffersDetailComponent } from './listing-offers-detail.component';

describe('ListingOffersDetailComponent', () => {
  let component: ListingOffersDetailComponent;
  let fixture: ComponentFixture<ListingOffersDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingOffersDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingOffersDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
