/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SamplesListingItemComponent } from './samples-listing-item.component';

describe('SamplesListingItemComponent', () => {
  let component: SamplesListingItemComponent;
  let fixture: ComponentFixture<SamplesListingItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SamplesListingItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SamplesListingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
