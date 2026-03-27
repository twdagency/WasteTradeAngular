import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWantedActivityComponent } from './admin-wanted-activity.component';

describe('AdminWantedActivityComponent', () => {
  let component: AdminWantedActivityComponent;
  let fixture: ComponentFixture<AdminWantedActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminWantedActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminWantedActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
