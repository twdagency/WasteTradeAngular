import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStatusDialogComponent } from './admin-status-dialog.component';

describe('AdminStatusDialogComponent', () => {
  let component: AdminStatusDialogComponent;
  let fixture: ComponentFixture<AdminStatusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStatusDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
