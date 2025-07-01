import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TutorMarkingComponent} from './tutor-marking.component';

describe('TutorMarkingComponent', () => {
  let component: TutorMarkingComponent;
  let fixture: ComponentFixture<TutorMarkingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorMarkingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TutorMarkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
