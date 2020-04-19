import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tasksInTutorials'
})
export class TasksInTutorialsPipe implements PipeTransform {


  transform(tasks, tutorialIds: number[]): any[] {
    if (!tasks) { return tasks; }
    if (tutorialIds.length === 0) { return []; }
    const result = tasks.filter(task => {
      if (task.isGroupTask()) {
        if (task.group() != null) {
          let tute_id = task.group().tutorial_id;
          console.log(tute_id);
          return tutorialIds.includes(tute_id);
        }
      } else {
        const enrolments = task.project().tutorial_enrolments;
        return enrolments.filter(enrolment => tutorialIds.includes(enrolment.tutorial_id)).length > 0;
      }
    });
    return result;
  }
}
