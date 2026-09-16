import {HotkeysService} from '@ngneat/hotkeys';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {of} from 'rxjs';
import {UserService} from 'src/app/api/models/doubtfire-model';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {CsvResultModalService} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import {CsvUploadModalService} from 'src/app/common/modals/csv-upload-modal/csv-upload-modal.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {SelectedTaskService} from 'src/app/projects/states/dashboard/selected-task.service';
import {StaffTaskListComponent} from './staff-task-list.component';

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
