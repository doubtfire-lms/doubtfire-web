import {ResolveFn} from '@angular/router';
import {AsyncSubject} from 'rxjs';
import {Project, ProjectService} from 'src/app/api/models/doubtfire-model';
import {GlobalStateService, ViewType} from './states/index/global-state.service';
import {inject} from '@angular/core';

export const resolveProject: ResolveFn<Project> = (route) => {
  const projectService = inject(ProjectService);
  const globalState = inject(GlobalStateService);
  const projectId = Number(route.paramMap.get('projectId'));
  const result = new AsyncSubject<Project>();

  const mappingCompleteCallback = (project: Project) => {
    globalState.setView(ViewType.PROJECT, project);
    result.next(project);
    result.complete();
  };

  globalState.onLoad(() => {
    projectService
      .get(
        {id: projectId},
        {
          cacheBehaviourOnGet: 'cacheQuery',
          mappingCompleteCallback,
        },
      )
      .subscribe();
  });

  return result;
};
