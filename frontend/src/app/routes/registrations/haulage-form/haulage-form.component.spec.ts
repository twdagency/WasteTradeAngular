/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HaulageFormComponent } from './haulage-form.component';

describe('HaulageFormComponent', () => {
  let component: HaulageFormComponent;
  let fixture: ComponentFixture<HaulageFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HaulageFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HaulageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
