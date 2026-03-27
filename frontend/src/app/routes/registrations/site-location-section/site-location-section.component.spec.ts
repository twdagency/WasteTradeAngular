/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SiteLocationSectionComponent } from './site-location-section.component';

describe('SiteLocationSectionComponent', () => {
  let component: SiteLocationSectionComponent;
  let fixture: ComponentFixture<SiteLocationSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteLocationSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteLocationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
