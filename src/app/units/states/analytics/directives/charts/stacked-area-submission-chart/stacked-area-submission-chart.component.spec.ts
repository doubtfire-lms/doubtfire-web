import {ComponentFixture, TestBed} from '@angular/core/testing';
import {StackedAreaSubmissionChartComponent} from './stacked-area-submission-chart.component';

describe('StackedAreaSubmissionChartComponent', () => {
  let component: StackedAreaSubmissionChartComponent;
  let fixture: ComponentFixture<StackedAreaSubmissionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackedAreaSubmissionChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StackedAreaSubmissionChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
