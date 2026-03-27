import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferListingComponent } from './offer-listing.component';

describe('OfferListingComponent', () => {
  let component: OfferListingComponent;
  let fixture: ComponentFixture<OfferListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
