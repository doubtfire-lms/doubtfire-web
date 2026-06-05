/* eslint-disable @typescript-eslint/no-explicit-any */
import {Observable, of} from 'rxjs';
import {Project} from 'src/app/api/models/doubtfire-model';
import {Component, Input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'f-project-root-state',
  templateUrl: './project-root-state.component.html',
  styleUrl: './project-root-state.component.css',
  standalone: false,
})
export class ProjectRootStateComponent {
  @Input() public project$: Observable<Project>;

  constructor(private activatedRoute: ActivatedRoute) {
    const project = this.activatedRoute.snapshot.data.project as Project;
    this.project$ = this.project$ ?? (project ? of(project) : undefined);
  }

  onActivate(component: {project$?: Observable<Project>}): void {
    if ('project$' in component) {
      component.project$ = this.project$;
    }
  }
}
