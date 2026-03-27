/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HaulierOfferFormComponent } from './haulier-offer-form.component';

describe('HaulierOfferFormComponent', () => {
  let component: HaulierOfferFormComponent;
  let fixture: ComponentFixture<HaulierOfferFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HaulierOfferFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HaulierOfferFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
