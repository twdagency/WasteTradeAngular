import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyMemberPageComponent } from './company-member-page.component';

describe('CompanyMemberPageComponent', () => {
  let component: CompanyMemberPageComponent;
  let fixture: ComponentFixture<CompanyMemberPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyMemberPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyMemberPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
