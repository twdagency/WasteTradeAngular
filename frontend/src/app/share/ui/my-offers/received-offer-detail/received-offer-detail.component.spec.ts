import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedOfferDetailComponent } from './received-offer-detail.component';

describe('ReceivedOfferDetailComponent', () => {
  let component: ReceivedOfferDetailComponent;
  let fixture: ComponentFixture<ReceivedOfferDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivedOfferDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivedOfferDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
