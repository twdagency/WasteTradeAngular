/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HaulageBidListingItemComponent } from './haulage-bid-listing-item.component';

describe('HaulageBidListingItemComponent', () => {
  let component: HaulageBidListingItemComponent;
  let fixture: ComponentFixture<HaulageBidListingItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HaulageBidListingItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HaulageBidListingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
