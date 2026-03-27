/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HaulierFormComponent } from './haulier-form.component';

describe('HaulierFormComponent', () => {
  let component: HaulierFormComponent;
  let fixture: ComponentFixture<HaulierFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HaulierFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HaulierFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
