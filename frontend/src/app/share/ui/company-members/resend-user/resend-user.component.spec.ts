import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendUserComponent } from './resend-user.component';
describe('ResendUserComponent', () => {
  let component: ResendUserComponent;
  let fixture: ComponentFixture<ResendUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResendUserComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResendUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
