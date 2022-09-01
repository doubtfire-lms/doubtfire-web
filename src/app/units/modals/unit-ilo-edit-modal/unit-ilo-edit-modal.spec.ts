import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { UnitIloEditModalComponent } from './unit-ilo-edit-modal.component';

describe('RolloverTeachingPeriodModalComponent', () => {
  let component: UnitIloEditModalComponent;
  let fixture: ComponentFixture<UnitIloEditModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [UnitIloEditModalComponent],
        providers: [{ provide: DoubtfireConstants }],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitIloEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
