/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WantedComponent } from './wanted.component';

describe('WantedComponent', () => {
  let component: WantedComponent;
  let fixture: ComponentFixture<WantedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WantedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WantedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
