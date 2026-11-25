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

describe('StackedAreaSubmissionChartComponent', () => {
  it('counts every task grade and student when both grade filters are empty', () => {
    const component = chart();
    component.ngOnChanges({snapshots: new SimpleChange(undefined, [snapshot], true)});

    expect(component.data).toEqual([
      {name: '3 tasks', series: [{name: '1-0', value: 2}]},
      {name: '2 tasks', series: [{name: '1-0', value: 1}]},
      {name: '1 tasks', series: [{name: '1-0', value: 1}]},
    ]);
  });

  it('combines student target grades and sums only selected task grades', () => {
    const component = chart();
    component.studentTargetGradeFilter = [0];
    component.taskGradeFilter = [2];
    component.ngOnChanges({studentTargetGradeFilter: new SimpleChange([], [0], false)});

    expect(component.data).toEqual([
      {name: '2 tasks', series: [{name: '1-0', value: 1}]},
      {name: '0 tasks', series: [{name: '1-0', value: 1}]},
    ]);

    component.campusFilter = 'Burwood';
    component.tutorialFilter = 'T1';
    component.ngOnChanges({tutorialFilter: new SimpleChange('all', 'T1', false)});

    expect(component.data).toEqual([{name: '2 tasks', series: [{name: '1-0', value: 1}]}]);
  });
});
