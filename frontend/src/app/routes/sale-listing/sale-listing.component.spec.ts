import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleListingComponent } from './sale-listing.component';

describe('SaleListingComponent', () => {
  let component: SaleListingComponent;
  let fixture: ComponentFixture<SaleListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
