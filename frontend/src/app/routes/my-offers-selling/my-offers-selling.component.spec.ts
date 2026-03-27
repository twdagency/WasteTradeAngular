import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyOffersComponent } from './my-offers-selling.component';

describe('MyOffersComponent', () => {
  let component: MyOffersComponent;
  let fixture: ComponentFixture<MyOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyOffersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
