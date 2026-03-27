import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidPendingComponent } from './bid-pending.component';

describe('BidPendingComponent', () => {
  let component: BidPendingComponent;
  let fixture: ComponentFixture<BidPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidPendingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BidPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
