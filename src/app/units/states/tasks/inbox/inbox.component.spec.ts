import {HotkeysService} from '@ngneat/hotkeys';
import {MediaObserver} from 'ng-flex-layout';
import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {EMPTY} from 'rxjs';
import {UserService} from 'src/app/api/services/user.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {SelectedTaskService} from 'src/app/projects/states/dashboard/selected-task.service';
import {InboxComponent} from './inbox.component';

const selectedTaskServiceStub = {
  currentPdfUrl$: EMPTY,
  selectedTask$: EMPTY,
};
const hotkeysServiceStub = {
  removeShortcuts: () => {},
};
const emptyProvider = {};

describe('InboxComponent', () => {
  let component: InboxComponent;
  let fixture: ComponentFixture<InboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InboxComponent],
      providers: [
        {provide: HotkeysService, useValue: hotkeysServiceStub},
        {provide: SelectedTaskService, useValue: selectedTaskServiceStub},
        {provide: MediaObserver, useValue: emptyProvider},
        {provide: FileDownloaderService, useValue: emptyProvider},
        {provide: Router, useValue: emptyProvider},
        {provide: MatDialog, useValue: emptyProvider},
        {provide: UserService, useValue: emptyProvider},
        {provide: DoubtfireConstants, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(InboxComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InboxComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
