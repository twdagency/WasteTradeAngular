/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RenewListingComponent } from './renew-listing.component';

describe('RenewListingComponent', () => {
  let component: RenewListingComponent;
  let fixture: ComponentFixture<RenewListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenewListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenewListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
