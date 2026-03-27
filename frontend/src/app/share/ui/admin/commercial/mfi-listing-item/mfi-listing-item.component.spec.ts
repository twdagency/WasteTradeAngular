/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MfiListingItemComponent } from './mfi-listing-item.component';

describe('MfiListingItemComponent', () => {
  let component: MfiListingItemComponent;
  let fixture: ComponentFixture<MfiListingItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MfiListingItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MfiListingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
