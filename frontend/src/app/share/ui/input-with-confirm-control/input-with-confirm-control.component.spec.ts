/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InputWithConfirmControlComponent } from './input-with-confirm-control.component';

describe('InputWithConfirmControlComponent', () => {
  let component: InputWithConfirmControlComponent;
  let fixture: ComponentFixture<InputWithConfirmControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputWithConfirmControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputWithConfirmControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
