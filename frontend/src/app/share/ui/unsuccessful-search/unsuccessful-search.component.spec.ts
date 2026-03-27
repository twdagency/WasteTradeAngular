/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UnsuccessfulSearchComponent } from './unsuccessful-search.component';

describe('UnsuccessfulSearchComponent', () => {
  let component: UnsuccessfulSearchComponent;
  let fixture: ComponentFixture<UnsuccessfulSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnsuccessfulSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnsuccessfulSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
