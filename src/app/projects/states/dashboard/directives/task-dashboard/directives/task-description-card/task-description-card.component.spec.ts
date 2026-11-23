import {beforeEach, describe, expect, it} from 'vitest';
import {Task, TaskDefinition, Unit} from 'src/app/api/models/doubtfire-model';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {TaskDescriptionCardComponent} from './task-description-card.component';

describe('TaskDescriptionCardComponent', () => {
  let component: TaskDescriptionCardComponent;
  let task: Task;
  let taskDef: TaskDefinition;
  let unit: Unit;
  let plannedDate: Date;
  let feedbackDate: Date;

  beforeEach(() => {
    plannedDate = new Date(2026, 10, 23, 12);
    feedbackDate = new Date(2026, 10, 30, 23, 59);
    unit = {lastTeachingDate: new Date(2026, 11, 10)} as Unit;
    taskDef = {
      requiresDiscussion: true,
      localDueDate: () => new Date(2026, 10, 20),
      gradeTargetDate: () => new Date(2026, 10, 20),
      unit,
    } as unknown as TaskDefinition;
    task = {
      project: {targetGrade: 0},
      status: 'not_started',
      inSubmittedState: () => task.status === 'ready_for_feedback' || task.status === 'complete',
      localDueDate: () => plannedDate,
      localDeadlineDate: () => feedbackDate,
    } as Task;
    component = new TaskDescriptionCardComponent(
      {grades: {}, gradeAcronyms: {}} as GradeService,
      {} as FileDownloaderService,
      'en-AU',
    );
    component.task = task;
    component.taskDef = taskDef;
    component.unit = unit;
  });

  it('warns when seven or fewer days remain to receive feedback and discuss', () => {
    expect(component.discussionTiming()).toBe('tight');

    plannedDate = new Date(2026, 10, 22, 12);
    expect(component.discussionTiming()).toBe('enough');

    plannedDate = new Date(2026, 11, 1, 12);
    expect(component.discussionTiming()).toBe('past');
  });

  it('uses the last teaching day when it precedes the feedback deadline', () => {
    feedbackDate = new Date(2026, 11, 15, 23, 59);
    unit.lastTeachingDate = new Date(2026, 10, 28);

    expect(component.discussionCutoffDate()).toBe(unit.lastTeachingDate);
    expect(component.discussionTiming()).toBe('tight');
  });

  it('assesses discussion timing for every unsubmitted task', () => {
    taskDef.requiresDiscussion = false;
    expect(component.discussionTiming()).toBe('tight');

    task.status = 'ready_for_feedback';
    expect(component.discussionTiming()).toBeNull();
  });

  it('shows the submission plan whenever the task is in a non-submitted state', () => {
    expect(component.hasNotSubmitted()).toBe(true);

    task.status = 'ready_for_feedback';
    expect(component.hasNotSubmitted()).toBe(false);

    task.status = 'fix_and_resubmit';
    task.submissionDate = new Date(2026, 10, 20);
    expect(component.hasNotSubmitted()).toBe(true);
  });

  it('treats submission on the feedback deadline as eligible', () => {
    plannedDate = new Date(2026, 10, 30, 12);
    expect(component.plannedSubmissionIsAfterFeedbackDeadline()).toBe(false);

    plannedDate = new Date(2026, 11, 1, 12);
    expect(component.plannedSubmissionIsAfterFeedbackDeadline()).toBe(true);
  });
});
