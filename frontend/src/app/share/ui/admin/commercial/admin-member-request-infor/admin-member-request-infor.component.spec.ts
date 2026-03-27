import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMemberRequestInforComponent } from './admin-member-request-infor.component';

describe('AdminMemberRequestInforComponent', () => {
  let component: AdminMemberRequestInforComponent;
  let fixture: ComponentFixture<AdminMemberRequestInforComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMemberRequestInforComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminMemberRequestInforComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
