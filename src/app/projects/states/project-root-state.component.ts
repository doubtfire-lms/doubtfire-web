/* eslint-disable @typescript-eslint/no-explicit-any */
import {Component, Input} from '@angular/core';
import {AsyncSubject, Observable, Subscriber, first} from 'rxjs';
import {Project, ProjectService} from 'src/app/api/models/doubtfire-model';
import {AppInjector} from 'src/app/app-injector';
import {NgHybridStateDeclaration} from '@uirouter/angular-hybrid';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';

@Component({
  selector: 'f-project-root-state',
  templateUrl: './project-root-state.component.html',
  styleUrl: './project-root-state.component.css',
})
export class ProjectRootStateComponent {
  @Input() public project$: Observable<Project>;
}

export const ProjectRootState: NgHybridStateDeclaration = {
  name: 'projects2',
  url: '/projects2/:projectId',
  abstract: true,
  data: {
    pageTitle: 'Unit Studied',
  },
  views: {
    main: {
      component: ProjectRootStateComponent,
    },
  },
  resolve: {
    project$: function ($stateParams) {
      const projectService = AppInjector.get(ProjectService);
      const globalState = AppInjector.get(GlobalStateService);
      const projectId = parseInt($stateParams.projectId);

      const result = new AsyncSubject<Project>();

      const mappingCompleteCallback = (entity: Project) => {
        result.next(entity);
        result.complete();
      }

      // Async call to load the project
      globalState.onLoad(() => {
        projectService.get({id: projectId}, {cacheBehaviourOnGet: 'cacheQuery', mappingCompleteCallback: mappingCompleteCallback}).subscribe({
          next: (_project: Project) => {
            // Do nothing - the mappingCompleteCallback will be called when complete
          },
        });
      });

      return result;
    },
  },
};
