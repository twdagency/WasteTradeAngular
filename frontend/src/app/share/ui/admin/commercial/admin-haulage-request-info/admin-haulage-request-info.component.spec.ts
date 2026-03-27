/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminHaulageRequestInfoComponent } from './admin-haulage-request-info.component';

describe('AdminHaulageRequestInfoComponent', () => {
  let component: AdminHaulageRequestInfoComponent;
  let fixture: ComponentFixture<AdminHaulageRequestInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminHaulageRequestInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminHaulageRequestInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
