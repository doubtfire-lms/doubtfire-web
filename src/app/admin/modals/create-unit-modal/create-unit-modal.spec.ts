import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { CreateUnitModalComponent } from './create-unit-modal.component';

describe('RolloverTeachingPeriodModalComponent', () => {
  let component: CreateUnitModalComponent;
  let fixture: ComponentFixture<CreateUnitModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CreateUnitModalComponent],
        providers: [{ provide: DoubtfireConstants }],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUnitModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
