/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HaulageOfferRowComponent } from './haulage-offer-row.component';

describe('HaulageOfferRowComponent', () => {
  let component: HaulageOfferRowComponent;
  let fixture: ComponentFixture<HaulageOfferRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HaulageOfferRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HaulageOfferRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
