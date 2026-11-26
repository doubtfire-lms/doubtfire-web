import {inject} from '@angular/core';
import {ResolveFn} from '@angular/router';
import {Observable} from 'rxjs';
import {Project, ProjectService} from 'src/app/api/models/doubtfire-model';
import {GlobalStateService, ViewType} from './states/index/global-state.service';

export const resolveProject: ResolveFn<Project> = (route, state) => {
  const projectService = inject(ProjectService);
  const globalState = inject(GlobalStateService);
  const projectId = Number(route.paramMap.get('projectId'));
  const resolveProgressively = state.url.split('?')[0].includes('/dashboard');

  return new Observable<Project>((observer) => {
    const mappingCompleteCallback = (project: Project) => {
      globalState.setView(ViewType.PROJECT, project);
      if (!resolveProgressively) {
        observer.next(project);
        observer.complete();
      }
    };

    globalState.onLoad(() => {
      if (resolveProgressively) {
        observer.next(projectService.cache.getOrCreate(projectId, projectService, {id: projectId}));
        observer.complete();
        return;
      }

      projectService
        .get(
          {id: projectId},
          {
            cacheBehaviourOnGet: 'cacheQuery',
            mappingCompleteCallback,
          },
        )
        .subscribe({
          error: (error) => observer.error(error),
        });
    });
  });
};
