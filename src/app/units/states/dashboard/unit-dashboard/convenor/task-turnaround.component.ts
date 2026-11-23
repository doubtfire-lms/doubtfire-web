import {AsyncPipe, DecimalPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {ReplaySubject, catchError, map, of, startWith, switchMap} from 'rxjs';
import {Unit} from 'src/app/api/models/doubtfire-model';

const taskCodeOrder = new Intl.Collator('en', {numeric: true, sensitivity: 'base'});

@Component({
  selector: 'f-task-turnaround',
  imports: [AsyncPipe, DecimalPipe],
  templateUrl: './task-turnaround.component.html',
  host: {class: 'block'},
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTurnaroundComponent implements OnChanges {
  @Input({required: true}) unit: Unit;
  private readonly units$: ReplaySubject<Unit> = new ReplaySubject(1);

  protected readonly report$ = this.units$.pipe(
    switchMap((unit) =>
      unit.getTaskTurnaround().pipe(
        map(({task_definitions}) => ({
          status: 'ready' as const,
          rows: task_definitions
            .filter(
              (row) =>
                row.feedback_wait.average_seconds !== null ||
                row.estimated_marking_time.average_seconds !== null,
            )
            .sort((a, b) => {
              const gradeA = unit.taskDef(a.task_definition_id)?.targetGrade ?? Infinity;
              const gradeB = unit.taskDef(b.task_definition_id)?.targetGrade ?? Infinity;
              return gradeA === gradeB
                ? taskCodeOrder.compare(a.abbreviation, b.abbreviation)
                : gradeA - gradeB;
            }),
        })),
        catchError(() => of({status: 'error' as const})),
        startWith({status: 'loading' as const}),
      ),
    ),
  );

  ngOnChanges(): void {
    this.units$.next(this.unit);
  }

  protected duration(seconds: number | null): string {
    if (seconds === null) {
      return '—';
    }
    const minutes = Math.round(seconds / 60);
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor(minutes / 60) % 24;
    return `${days}d ${hours}h ${minutes % 60}m`;
  }
}
