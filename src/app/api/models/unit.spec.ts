import {describe, expect, it} from 'vitest';
import {Project, Task, TaskDefinition, Unit} from './doubtfire-model';

describe('Unit Explorer tasks', () => {
  it('shows withdrawn projects only when requested and reuses their cached tasks', () => {
    const unit = new Unit();
    const taskDefinition = new TaskDefinition(unit);
    taskDefinition.id = 10;

    const enrolledProject = new Project(unit);
    enrolledProject.id = 1;
    enrolledProject.enrolled = true;
    const withdrawnProject = new Project(unit);
    withdrawnProject.id = 2;
    withdrawnProject.enrolled = false;
    unit.studentCache.add(enrolledProject);
    unit.studentCache.add(withdrawnProject);

    const enrolledTask = new Task(enrolledProject);
    enrolledTask.id = 11;
    enrolledTask.definition = taskDefinition;
    const withdrawnTask = new Task(withdrawnProject);
    withdrawnTask.id = 12;
    withdrawnTask.definition = taskDefinition;
    withdrawnTask.status = 'complete';
    withdrawnProject.taskCache.add(withdrawnTask);

    expect(unit.fillWithUnStartedTasks([enrolledTask], taskDefinition)).toEqual([enrolledTask]);
    expect(unit.fillWithUnStartedTasks([enrolledTask], taskDefinition, true)).toEqual([
      enrolledTask,
      withdrawnTask,
    ]);
  });
});
