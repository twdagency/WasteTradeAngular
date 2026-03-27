/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AuditTrailComponent } from './audit-trail.component';

describe('AuditTrailComponent', () => {
  let component: AuditTrailComponent;
  let fixture: ComponentFixture<AuditTrailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditTrailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditTrailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
