import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingDetailActionsComponent } from './listing-detail-actions.component';

describe('ListingDetailActionsComponent', () => {
  let component: ListingDetailActionsComponent;
  let fixture: ComponentFixture<ListingDetailActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingDetailActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingDetailActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
