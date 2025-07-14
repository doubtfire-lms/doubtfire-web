import {ComponentFixture, TestBed} from '@angular/core/testing';

import {StaffNotesComponent} from './staff-notes.component';

describe('StaffNotesComponent', () => {
  let component: StaffNotesComponent;
  let fixture: ComponentFixture<StaffNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffNotesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
