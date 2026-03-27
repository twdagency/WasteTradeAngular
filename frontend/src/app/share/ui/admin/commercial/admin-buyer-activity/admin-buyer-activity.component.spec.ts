import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBuyerActivityComponent } from './admin-buyer-activity.component';

describe('AdminBuyerActivityComponent', () => {
  let component: AdminBuyerActivityComponent;
  let fixture: ComponentFixture<AdminBuyerActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBuyerActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBuyerActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
