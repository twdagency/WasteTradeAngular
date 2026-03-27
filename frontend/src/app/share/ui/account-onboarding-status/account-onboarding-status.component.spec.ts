/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AccountOnboardingStatusComponent } from './account-onboarding-status.component';

describe('AccountOnboardingStatusComponent', () => {
  let component: AccountOnboardingStatusComponent;
  let fixture: ComponentFixture<AccountOnboardingStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountOnboardingStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountOnboardingStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
