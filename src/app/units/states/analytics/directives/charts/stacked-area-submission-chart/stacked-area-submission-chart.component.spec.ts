import {TooltipService} from '@glitchtip/ng-charts';
import {describe, expect, it} from 'vitest';
import {ChangeDetectorRef, Injector, SimpleChange, ViewContainerRef} from '@angular/core';
import {TaskCompletionSnapshot} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {StackedAreaSubmissionChartComponent} from './stacked-area-submission-chart.component';

const snapshot: TaskCompletionSnapshot = {
  snapshot_date: '2026-03-01',
  snapshot_timestamp: '1',
  stats: {},
  submitted_task_count_student_counts: {
    task_grade_values: [0, 2],
    all: {
      Burwood: {
        __all__: {'1,2': 2, '0,1': 1},
        T1: {'1,2': 1},
      },
      WaurnPonds: {__all__: {'2,0': 1}},
    },
    target_grades: {
      '0': {
        Burwood: {__all__: {'1,2': 1}, T1: {'1,2': 1}},
        WaurnPonds: {__all__: {'2,0': 1}},
      },
      '2': {Burwood: {__all__: {'1,2': 1, '0,1': 1}}},
    },
  },
};

function chart(): StackedAreaSubmissionChartComponent {
  const component = new StackedAreaSubmissionChartComponent(
    {} as TooltipService,
    {} as ViewContainerRef,
    {get: () => ({})} as unknown as Injector,
    {markForCheck: () => {}} as ChangeDetectorRef,
  );
  component.unit = {gradeValues: [0, 2], weekNumber: () => 1} as unknown as Unit;
  component.snapshots = [snapshot];
  return component;
}

const point = (value: number, percentage: number, totalStudents: number) => ({
  name: '2026-03-01',
  value,
  extra: {percentage, totalStudents},
});

describe('StackedAreaSubmissionChartComponent', () => {
  it('counts every task grade and student when both grade filters are empty', () => {
    const component = chart();
    component.ngOnChanges({snapshots: new SimpleChange(undefined, [snapshot], true)});

    expect(component.data).toEqual([
      {name: '3 tasks', series: [point(2, 50, 4)]},
      {name: '2 tasks', series: [point(1, 25, 4)]},
      {name: '1 task', series: [point(1, 25, 4)]},
    ]);
  });

  it('combines student target grades and sums only selected task grades', () => {
    const component = chart();
    component.studentTargetGradeFilter = [0];
    component.taskGradeFilter = [2];
    component.ngOnChanges({studentTargetGradeFilter: new SimpleChange([], [0], false)});

    expect(component.data).toEqual([
      {name: '2 tasks', series: [point(1, 50, 2)]},
      {name: '0 tasks', series: [point(1, 50, 2)]},
    ]);

    component.campusFilter = 'Burwood';
    component.tutorialFilter = 'T1';
    component.ngOnChanges({tutorialFilter: new SimpleChange('all', 'T1', false)});

    expect(component.data).toEqual([{name: '2 tasks', series: [point(1, 100, 1)]}]);
  });

  it('uses each snapshot population for its tooltip percentages', () => {
    const component = chart();
    component.snapshots = [
      snapshot,
      {
        ...snapshot,
        snapshot_date: '2026-03-02',
        submitted_task_count_student_counts: {
          task_grade_values: [0, 2],
          all: {Burwood: {__all__: {'1,2': 1, '0,1': 2}}},
          target_grades: {},
        },
      },
    ];
    component.ngOnChanges({snapshots: new SimpleChange(undefined, component.snapshots, true)});

    expect(component.data.find((series) => series.name === '3 tasks')?.series).toEqual([
      point(2, 50, 4),
      {name: '2026-03-02', value: 1, extra: {percentage: 33.3, totalStudents: 3}},
    ]);
  });

  it('shows the details of the hovered point on a specific task-count band', () => {
    const component = chart();
    component.ngOnChanges({snapshots: new SimpleChange(undefined, [snapshot], true)});

    component.onPointActivate({value: {name: '3 tasks'}}, '2026-03-01');

    expect(component.hoveredPoint).toEqual({
      dateLabel: 'Sun 1st Mar 2026',
      series: '3 tasks',
      value: 2,
      percentage: 50,
      color: 'hsl(220, 65%, 50%)',
    });

    component.onPointDeactivate({value: {name: '3 tasks'}});
    expect(component.hoveredPoint).toBeNull();
  });

  it('does not label the eighth snapshot of an ordinary week as a break', () => {
    const component = chart();
    component.snapshots = Array.from({length: 8}, (_, index) => ({
      ...snapshot,
      snapshot_date: `2026-03-${String(index + 1).padStart(2, '0')}`,
    }));
    component.ngOnChanges({snapshots: new SimpleChange(undefined, component.snapshots, true)});

    expect(component.xAxisTickFormatting('2026-03-01')).toBe('Week 1');
    expect(component.xAxisTickFormatting('2026-03-08')).toBe('');
    expect(component.xAxisTicks).toEqual(['2026-03-01']);
  });

  it('labels only real week-pausing breaks and folds pre-teaching snapshots into week zero', () => {
    const component = chart();
    component.unit = {
      gradeValues: [0, 2],
      weekNumber: (date: string) => (date === '2026-02-28' ? -1 : 1),
      teachingPeriod: {
        weekPausingBreakAt: (date: string) => (date === '2026-03-02' ? {id: 1} : null),
      },
    } as unknown as Unit;
    component.snapshots = ['2026-02-28', '2026-03-01', '2026-03-02', '2026-03-03'].map(
      (snapshot_date) => ({...snapshot, snapshot_date}),
    );
    component.ngOnChanges({snapshots: new SimpleChange(undefined, component.snapshots, true)});

    expect(component.xAxisTickFormatting('2026-02-28')).toBe('Week 0');
    expect(component.xAxisTickFormatting('2026-03-01')).toBe('Week 1');
    expect(component.xAxisTickFormatting('2026-03-02')).toBe('Break');
    expect(component.xAxisTickFormatting('2026-03-03')).toBe('Week 1');
    expect(component.xAxisTicks).toEqual(['2026-02-28', '2026-03-01', '2026-03-02', '2026-03-03']);
  });
});
