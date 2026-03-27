import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountStatusWarningComponent } from './account-status-warning.component';

describe('AccountStatusWarningComponent', () => {
  let component: AccountStatusWarningComponent;
  let fixture: ComponentFixture<AccountStatusWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountStatusWarningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountStatusWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
