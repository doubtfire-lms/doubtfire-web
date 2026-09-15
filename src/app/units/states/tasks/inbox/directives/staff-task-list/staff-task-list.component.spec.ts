import {HotkeysService} from '@ngneat/hotkeys';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {of} from 'rxjs';
import {Task, TaskStatusEnum, UserService} from 'src/app/api/models/doubtfire-model';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {CsvResultModalService} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import {CsvUploadModalService} from 'src/app/common/modals/csv-upload-modal/csv-upload-modal.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {SelectedTaskService} from 'src/app/projects/states/dashboard/selected-task.service';
import {StaffTaskListComponent} from './staff-task-list.component';

const daysFromNow = (days: number): Date => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const buildTask = (
  overrides: Partial<{
    status: TaskStatusEnum;
    studentName: string;
    deadline: Date;
    submissionDate: Date;
    pinned: boolean;
  }> = {},
): Task => {
  const deadline = overrides.deadline ?? daysFromNow(30);

  return {
    status: overrides.status ?? 'ready_for_feedback',
    numNewComments: 0,
    similarityFlag: false,
    similaritiesDetected: false,
    hasExtensions: false,
    pinned: overrides.pinned ?? false,
    submissionDate: overrides.submissionDate ?? daysFromNow(-1),
    project: {student: {name: overrides.studentName ?? 'Student'}},
    definition: {id: 1, seq: 1, dueDate: deadline},
    localDeadlineDate: () => deadline,
  } as unknown as Task;
};

const hotkeysServiceStub = {
  removeShortcuts: () => {},
};
const emptyProvider = {};
const routerStub = {
  navigate: vi.fn(),
};

describe('StaffTaskListComponent', () => {
  let component: StaffTaskListComponent;
  let fixture: ComponentFixture<StaffTaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StaffTaskListComponent],
      providers: [
        {provide: SelectedTaskService, useValue: emptyProvider},
        {provide: AlertService, useValue: emptyProvider},
        {provide: FileDownloaderService, useValue: emptyProvider},
        {provide: MatDialog, useValue: emptyProvider},
        {provide: CsvUploadModalService, useValue: emptyProvider},
        {provide: CsvResultModalService, useValue: emptyProvider},
        {provide: UserService, useValue: emptyProvider},
        {provide: HotkeysService, useValue: hotkeysServiceStub},
        {provide: Router, useValue: routerStub},
        {provide: ActivatedRoute, useValue: emptyProvider},
        {provide: TaskDefinitionService, useValue: emptyProvider},
        {provide: SidekiqProgressModalService, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(StaffTaskListComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    routerStub.navigate.mockReset();
    fixture = TestBed.createComponent(StaffTaskListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('redirects an inbox permalink missing from the inbox to the all-students explorer', () => {
    component.unit = {id: 20} as never;
    component.viewType = 'inbox';
    component.filters = {tutorialIdSelected: 'mine'};
    component.taskData = {
      source: () => of([]),
      selectedTask: null,
      taskKey: {studentId: 6431, taskDefAbbr: 'P2'},
      onSelectedTaskChange: () => {},
      taskDefMode: false,
    };

    (component as unknown as {refreshData: () => void}).refreshData();

    expect(routerStub.navigate).toHaveBeenCalledWith(['/units', 20, 'tasks', 'definition'], {
      queryParams: {
        students: 'all',
        studentId: 6431,
        taskDefAbbr: 'P2',
      },
      replaceUrl: true,
    });
  });

  describe('view preferences', () => {
    beforeEach(() => {
      component.unit = {id: 20} as never;
      component.viewType = 'inbox';
      component.filters = {};
      component.taskData = {
        source: () => of([]),
        selectedTask: null,
        taskKey: null,
        onSelectedTaskChange: () => {},
        taskDefMode: false,
      };
    });

    it('keeps only tasks within a week of their feedback deadline', () => {
      const closeToDeadline = buildTask({deadline: daysFromNow(3)});
      component.tasks = [closeToDeadline, buildTask({deadline: daysFromNow(30)})];

      component.toggleFilter('nearFeedbackDeadline', true);

      expect(component.filteredTasks).toEqual([closeToDeadline]);
    });

    it('keeps tasks whose feedback deadline has already passed', () => {
      const pastDeadline = buildTask({deadline: daysFromNow(-2)});
      component.tasks = [pastDeadline, buildTask({deadline: daysFromNow(30)})];

      component.toggleFilter('nearFeedbackDeadline', true);

      expect(component.filteredTasks).toEqual([pastDeadline]);
    });

    it('filters to the selected statuses and counts what each status holds', () => {
      const discuss = buildTask({status: 'discuss'});
      component.tasks = [buildTask({status: 'ready_for_feedback'}), discuss];

      component.applyFilters();
      expect(component.statusOptions.map((option) => [option.status, option.count])).toEqual([
        ['ready_for_feedback', 1],
        ['discuss', 1],
      ]);

      component.toggleStatus('discuss');

      expect(component.filteredTasks).toEqual([discuss]);
    });

    it('names the direction of a date sort rather than showing an arrow', () => {
      component.tasks = [];
      const submissionSort = component.sortOptions.find(
        (option) => option.value === 'submissionDate',
      );

      component.setSortBy('submissionDate');
      expect(component.sortDirectionLabelFor(submissionSort)).toBe('Oldest first');

      component.setSortBy('submissionDate');
      expect(component.sortDirectionLabelFor(submissionSort)).toBe('Newest first');
    });

    it('sorts by feedback deadline and flips direction when the sort is reselected', () => {
      const first = buildTask({deadline: daysFromNow(2)});
      const last = buildTask({deadline: daysFromNow(20)});
      component.tasks = [last, first];

      component.setSortBy('feedbackDeadline');
      expect(component.filteredTasks).toEqual([first, last]);

      component.setSortBy('feedbackDeadline');
      expect(component.filteredTasks).toEqual([last, first]);
    });

    it('clears every active preference on reset', () => {
      component.tasks = [buildTask({status: 'discuss'})];
      component.toggleFilter('similaritiesDetected', true);
      component.toggleStatus('discuss');
      component.setSortBy('submissionDate');
      expect(component.activeViewPreferenceCount).toBe(3);

      component.resetViewPreferences();

      expect(component.activeViewPreferenceCount).toBe(0);
      expect(component.viewPreferences.sortBy).toBe('default');
    });

    it('keeps preferences out of storage so a refresh starts from the default order', () => {
      const setItem = vi.spyOn(Storage.prototype, 'setItem');
      component.tasks = [];

      component.toggleFilter('similaritiesDetected', true);
      component.setSortBy('submissionDate');

      expect(setItem).not.toHaveBeenCalled();
      setItem.mockRestore();
    });
  });

  it('does not redirect again when a permalink is missing from the explorer', () => {
    component.unit = {id: 20} as never;
    component.viewType = 'explorer';
    component.filters = {tutorialIdSelected: 'all'};
    component.taskData = {
      source: () => of([]),
      selectedTask: null,
      taskKey: {studentId: 6431, taskDefAbbr: 'P2'},
      onSelectedTaskChange: () => {},
      taskDefMode: true,
    };

    (component as unknown as {refreshData: () => void}).refreshData();

    expect(routerStub.navigate).not.toHaveBeenCalled();
  });
});
