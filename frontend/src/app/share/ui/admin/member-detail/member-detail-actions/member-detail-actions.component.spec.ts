import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberDetailActionsComponent } from './member-detail-actions.component';

describe('MemberDetailActionsComponent', () => {
  let component: MemberDetailActionsComponent;
  let fixture: ComponentFixture<MemberDetailActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberDetailActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberDetailActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
