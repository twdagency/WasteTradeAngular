/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHaulageBidRejectModalComponent } from './admin-haulage-bid-reject-modal.component';

describe('AdminHaulageBidRejectModalComponent', () => {
  let component: AdminHaulageBidRejectModalComponent;
  let fixture: ComponentFixture<AdminHaulageBidRejectModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminHaulageBidRejectModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminHaulageBidRejectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
