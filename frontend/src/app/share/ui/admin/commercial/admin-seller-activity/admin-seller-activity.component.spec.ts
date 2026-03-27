import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSellerActivityComponent } from './admin-seller-activity.component';

describe('AdminSellerActivityComponent', () => {
  let component: AdminSellerActivityComponent;
  let fixture: ComponentFixture<AdminSellerActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSellerActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSellerActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
