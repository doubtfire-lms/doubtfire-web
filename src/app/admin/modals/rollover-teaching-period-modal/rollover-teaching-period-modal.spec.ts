import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { RolloverTeachingPeriodModalComponent } from './rollover-teaching-period-modal.component';

describe('RolloverTeachingPeriodModalComponent', () => {
  let component: RolloverTeachingPeriodModalComponent;
  let fixture: ComponentFixture<RolloverTeachingPeriodModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [RolloverTeachingPeriodModalComponent],
        providers: [{ provide: DoubtfireConstants }],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(RolloverTeachingPeriodModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
