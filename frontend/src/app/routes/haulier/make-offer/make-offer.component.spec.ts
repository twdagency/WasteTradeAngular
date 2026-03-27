/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MakeOfferComponent } from './make-offer.component';

describe('MakeOfferComponent', () => {
  let component: MakeOfferComponent;
  let fixture: ComponentFixture<MakeOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MakeOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MakeOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
