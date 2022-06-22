import { Pipe, PipeTransform } from '@angular/core';
import { Task } from '../../api/models/doubtfire-model';

@Pipe({
  name: 'tasksInTutorials',
})
export class TasksInTutorialsPipe implements PipeTransform {
  transform(tasks: Task[], tutorialIds: number[], forceStream: boolean): Task[] {
    // Return nothing if there are no tasks
    if (!tasks) {
      return tasks;
    }

    // Return nothing if there is no tutorialIds
    if (tutorialIds.length === 0) {
      return [];
    }

    // Filter the tasks to only those where the tutorial for the task is in the list of tutorial ids
    const result = tasks?.filter((task) => {
      // Get the stream for the task... this may be nil or undefined if there are no streams in the unit
      const stream = task.definition.tutorialStream;

      const useStream = forceStream && stream;

      // If there is no stream, and the task is a group task, and there is a group for the task
      if (!useStream && task?.isGroupTask() && task.group) {
        // use the group's tutorial
        const tuteId = task.group.tutorial.id;
        return tutorialIds.includes(tuteId); // check group tutorial id is in the list of ids to include
      } else {
        // either we have a stream, or its not a group task, or the student isn't in a group

        if (useStream) {
          // Get the tutorial for the stream... this will return the only tutorial if there is no stream
          const tutorial = task?.project.tutorialForStream(stream);
          // Check it is in the list... enrolment may be null if the student is not enrolled in a tutorial
          return tutorialIds.includes(tutorial?.id);
        } else {
          const tutorials = task?.project.tutorials;
          return tutorials?.filter((tutorial) => tutorialIds.includes(tutorial.id)).length > 0;
        }
      }
    });
    return result;
  }
}
