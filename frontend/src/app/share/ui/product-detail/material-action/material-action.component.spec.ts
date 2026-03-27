import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialActionComponent } from './material-action.component';

describe('MaterialActionComponent', () => {
  let component: MaterialActionComponent;
  let fixture: ComponentFixture<MaterialActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialActionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
