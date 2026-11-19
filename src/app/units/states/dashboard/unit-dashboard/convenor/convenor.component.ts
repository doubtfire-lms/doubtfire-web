import {AsyncPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute} from '@angular/router';
import {Observable, catchError, combineLatest, map, of, startWith, switchMap} from 'rxjs';
import {ProjectService, TaskService, Unit} from 'src/app/api/models/doubtfire-model';

type WorkloadCount = number | 'Unavailable' | null;

@Component({
  selector: 'f-convenor',
  imports: [AsyncPipe, MatIconModule],
  host: {class: 'block'},
  styleUrl: './convenor.component.css',
  templateUrl: './convenor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvenorComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);

  protected readonly cards = [
    {key: 'feedback', title: 'Ready for feedback', icon: 'thumb_up_off_alt'},
    {key: 'moderation', title: 'Moderation queue', icon: 'rate_review'},
    {key: 'overflow', title: 'Overflow tasks available to claim', icon: 'more_time'},
  ] as const;

  protected readonly workload$ = this.route.parent.data.pipe(
    switchMap(({unit}: {unit?: Unit}) => (unit ? this.loadWorkload(unit) : of(null))),
  );

  private loadWorkload(unit: Unit) {
    // TaskService maps the returned tasks to projects in the unit's student cache.
    const inboxCounts$ = this.projectService.loadStudents(unit).pipe(
      switchMap(() =>
        combineLatest({
          feedback: this.loadCount(
            this.taskService
              .queryTasksForTaskInbox(unit, undefined, false)
              .pipe(
                map(
                  (tasks) =>
                    new Set(
                      tasks
                        .filter((task) => task.status === 'ready_for_feedback')
                        .map((task) => task.id),
                    ).size,
                ),
              ),
          ),
          moderation: this.loadCount(
            this.taskService.queryTasksForMentorModeration(unit).pipe(map((tasks) => tasks.length)),
          ),
        }),
      ),
      catchError(() => of({feedback: 'Unavailable', moderation: 'Unavailable'} as const)),
      startWith({feedback: null, moderation: null} as const),
    );
    return combineLatest({
      inbox: inboxCounts$,
      overflow: this.loadCount(this.taskService.getOverflowAvailableToClaimCount(unit)),
    }).pipe(map(({inbox, overflow}) => ({...inbox, overflow})));
  }

  private loadCount(count$: Observable<number>): Observable<WorkloadCount> {
    return count$.pipe(
      catchError(() => of('Unavailable' as const)),
      startWith(null),
    );
  }
}
