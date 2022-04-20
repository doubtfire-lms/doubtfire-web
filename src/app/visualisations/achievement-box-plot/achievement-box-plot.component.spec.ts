import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievementBoxPlotComponent } from './achievement-box-plot.component';

describe('AchievementBoxPlotComponent', () => {
  let component: AchievementBoxPlotComponent;
  let fixture: ComponentFixture<AchievementBoxPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AchievementBoxPlotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AchievementBoxPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
