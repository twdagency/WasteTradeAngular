import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesBtnComponent } from './notes-btn.component';

describe('NotesBtnComponent', () => {
  let component: NotesBtnComponent;
  let fixture: ComponentFixture<NotesBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesBtnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotesBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
