import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductExpiryComponent } from './product-expiry.component';

describe('ProductExpiryComponent', () => {
  let component: ProductExpiryComponent;
  let fixture: ComponentFixture<ProductExpiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductExpiryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductExpiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
