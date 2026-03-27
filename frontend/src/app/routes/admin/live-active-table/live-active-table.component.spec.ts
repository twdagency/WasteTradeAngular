/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LiveActiveTableComponent } from './live-active-table.component';

describe('LiveActiveTableComponent', () => {
  let component: LiveActiveTableComponent;
  let fixture: ComponentFixture<LiveActiveTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveActiveTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveActiveTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
