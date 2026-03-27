import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyOfferComponent } from './empty-offer.component';

describe('EmptyOfferComponent', () => {
  let component: EmptyOfferComponent;
  let fixture: ComponentFixture<EmptyOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyOfferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptyOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
