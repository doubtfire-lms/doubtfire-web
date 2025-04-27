import {Pipe, PipeTransform} from '@angular/core';

import {Project} from 'src/app/api/models/project';
import {Tutorial} from 'src/app/api/models/tutorial/tutorial';

@Pipe({
  name: 'tutorialCampusFilter',
})
export class TutorialCampusFilterPipe implements PipeTransform {
  transform(
    tutorials: Tutorial[] | null | undefined,
    project: Project | null | undefined,
  ): Tutorial[] {
    if (!project || !tutorials) {
      return tutorials || [];
    }

    return tutorials.filter((tutorial) => {
      const projectCampusId = project.campus?.id;
      const tutorialCampusId = tutorial.campus?.id;

      return !projectCampusId || !tutorialCampusId || projectCampusId === tutorialCampusId;
    });
  }
}
