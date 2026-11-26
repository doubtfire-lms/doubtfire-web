/* eslint-disable @typescript-eslint/no-explicit-any */
import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription, of} from 'rxjs';
import {Project} from 'src/app/api/models/doubtfire-model';

interface ProjectRouteChild {
  project$?: Observable<Project>;
  taskListWidth?: number;
  taskListWidthChange?: EventEmitter<number>;
}

@Component({
  selector: 'f-project-root-state',
  templateUrl: './project-root-state.component.html',
  styleUrl: './project-root-state.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ProjectRootStateComponent implements OnDestroy {
  @Input() public project$: Observable<Project>;

  private readonly taskListExpandedWidth = 400;
  private taskListWidth = this.taskListExpandedWidth;
  private taskListWidthSub?: Subscription;

  constructor(private activatedRoute: ActivatedRoute) {
    const project = this.activatedRoute.snapshot.data.project as Project;
    this.project$ = this.project$ ?? (project ? of(project) : undefined);
  }

  onActivate(component: ProjectRouteChild): void {
    this.taskListWidthSub?.unsubscribe();

    if ('project$' in component) {
      component.project$ = this.project$;
    }

    if ('taskListWidth' in component) {
      component.taskListWidth = this.taskListWidth;
    }

    if (component.taskListWidthChange) {
      this.taskListWidthSub = component.taskListWidthChange.subscribe((width) => {
        this.taskListWidth = width;
      });
    }
  }

  ngOnDestroy(): void {
    this.taskListWidthSub?.unsubscribe();
  }
}
