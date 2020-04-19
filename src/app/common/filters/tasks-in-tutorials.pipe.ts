import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tasksInTutorials'
})
export class TasksInTutorialsPipe implements PipeTransform {

  transform(tasks, tutorialIds: number[]): any[] {
    if (!tasks) { return tasks; }
    if (tutorialIds.length === 0) { return []; }
    tasks.filter(task => {
      if (task.isGroupTask()) {
        if (task.group() != null) {
          return tutorialIds.includes(task.group()?.tutorial_id);
        } else {
          return task.project().tutorial_enrolments.filter(enrolment => tutorialIds.includes(enrolment.tutorial_id)).length > 0;
        }
      }
    });
  }
}
