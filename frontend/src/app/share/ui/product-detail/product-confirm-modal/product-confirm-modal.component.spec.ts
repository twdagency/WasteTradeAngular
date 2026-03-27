/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ProductConfirmModalComponent } from './product-confirm-modal.component';

describe('ProductConfirmModalComponent', () => {
  let component: ProductConfirmModalComponent;
  let fixture: ComponentFixture<ProductConfirmModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProductConfirmModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
