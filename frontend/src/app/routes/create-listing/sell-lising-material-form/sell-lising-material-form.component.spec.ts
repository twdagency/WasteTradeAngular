import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellLisingMaterialFormComponent } from './sell-lising-material-form.component';

describe('SellLisingMaterialFormComponent', () => {
  let component: SellLisingMaterialFormComponent;
  let fixture: ComponentFixture<SellLisingMaterialFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellLisingMaterialFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellLisingMaterialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
