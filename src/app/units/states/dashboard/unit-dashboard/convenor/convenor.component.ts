import {AsyncPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute} from '@angular/router';
import {Observable, catchError, combineLatest, map, of, startWith, switchMap} from 'rxjs';
import {ProjectService, TaskService, Unit} from 'src/app/api/models/doubtfire-model';
import {OpenInboxButtonComponent} from '../open-inbox-button.component';
import {OrphanedStudentsComponent} from './orphaned-students.component';
import {TaWorkloadOverviewComponent} from './ta-workload-overview.component';
import {TaskTurnaroundComponent} from './task-turnaround.component';

type WorkloadCount = number | 'Unavailable' | null;

@Component({
  selector: 'f-convenor',
  imports: [
    AsyncPipe,
    MatIconModule,
    OpenInboxButtonComponent,
    OrphanedStudentsComponent,
    TaWorkloadOverviewComponent,
    TaskTurnaroundComponent,
  ],
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
    switchMap(({unit}: {unit?: Unit}) =>
      unit ? this.loadWorkload(unit).pipe(map((workload) => ({unit, ...workload}))) : of(null),
    ),
  );

  private loadWorkload(unit: Unit) {
    // TaskService maps the returned tasks to projects in the unit's student cache.
    const inboxCounts$ = this.projectService.loadStudents(unit).pipe(
      switchMap((students) =>
        combineLatest({
          students: of(students),
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
      catchError(() =>
        of({feedback: 'Unavailable', moderation: 'Unavailable', students: 'Unavailable'} as const),
      ),
      startWith({feedback: null, moderation: null, students: null} as const),
    );
    return combineLatest({
      inbox: inboxCounts$,
      overflow: this.loadCount(this.taskService.getOverflowAvailableToClaimCount(unit)),
    }).pipe(
      map(({inbox: {students, feedback, moderation}, overflow}) => ({
        students,
        counts: {feedback, moderation, overflow},
      })),
    );
  }

  private loadCount(count$: Observable<number>): Observable<WorkloadCount> {
    return count$.pipe(
      catchError(() => of('Unavailable' as const)),
      startWith(null),
    );
  }
}
