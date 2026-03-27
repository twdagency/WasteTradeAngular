/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SiteListComponent } from './site-list.component';

describe('SiteListComponent', () => {
  let component: SiteListComponent;
  let fixture: ComponentFixture<SiteListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
