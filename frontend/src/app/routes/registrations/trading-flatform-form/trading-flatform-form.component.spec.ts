/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TradingFlatformFormComponent } from './trading-flatform-form.component';

describe('TradingFlatformFormComponent', () => {
  let component: TradingFlatformFormComponent;
  let fixture: ComponentFixture<TradingFlatformFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TradingFlatformFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradingFlatformFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
