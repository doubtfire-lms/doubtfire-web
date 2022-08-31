import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { UnitStudentEnrolmentModalComponent } from './unit-student-enrolment-modal.component';

describe('RolloverTeachingPeriodModalComponent', () => {
  let component: UnitStudentEnrolmentModalComponent;
  let fixture: ComponentFixture<UnitStudentEnrolmentModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [UnitStudentEnrolmentModalComponent],
        providers: [{ provide: DoubtfireConstants }],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitStudentEnrolmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
