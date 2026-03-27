/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminMakeHaulageOfferComponent } from './admin-make-haulage-offer.component';

describe('AdminMakeHaulageOfferComponent', () => {
  let component: AdminMakeHaulageOfferComponent;
  let fixture: ComponentFixture<AdminMakeHaulageOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminMakeHaulageOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminMakeHaulageOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
