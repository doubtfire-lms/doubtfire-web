import {describe, expect, it} from 'vitest';
import {Project, TaskDefinition} from './doubtfire-model';
import {TaskPrerequisite} from './task-prerequisite';

describe('TaskPrerequisite', () => {
  it('treats rediscuss at the same prerequisite level as discuss', () => {
    const project = {} as Project;
    const prerequisite = new TaskPrerequisite({
      taskDefinitionId: 2,
      prerequisiteId: 1,
      taskStatus: 'ready_for_feedback',
    });

    prerequisite.prerequisite = {
      projectTask: () => ({status: 'rediscuss'}),
    } as TaskDefinition;

    expect(prerequisite.hasMetRequiredState(project)).toBe(true);

    prerequisite.taskStatus = 'discuss';

    expect(prerequisite.hasMetRequiredState(project)).toBe(true);
  });
});
