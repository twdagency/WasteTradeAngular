/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListWantedMaterialFormComponent } from './list-wanted-material-form.component';

describe('ListWantedMaterialFormComponent', () => {
  let component: ListWantedMaterialFormComponent;
  let fixture: ComponentFixture<ListWantedMaterialFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListWantedMaterialFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListWantedMaterialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
