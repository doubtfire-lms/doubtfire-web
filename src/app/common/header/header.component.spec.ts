import {MediaObserver} from 'ng-flex-layout';
import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {AuthenticationService} from 'src/app/api/models/doubtfire-model';
import {SidekiqJobService} from 'src/app/api/services/sidekiq-job.service';
import {UserService} from 'src/app/api/services/user.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {CheckForUpdateService} from 'src/app/sessions/service-worker-updater/check-for-update.service';
import {AboutDoubtfireModal} from '../modals/about-doubtfire-modal/about-doubtfire-modal.component';
import {CalendarModalService} from '../modals/calendar-modal/calendar-modal.service';
import {QrModalService} from '../modals/qr-modal/qr-modal.service';
import {SidekiqJobsModalService} from '../modals/sidekiq-jobs-modal/sidekiq-jobs-modal.service';
import {TutorNotesModalService} from '../modals/tutor-notes-modal/tutor-notes-modal.service';
import {IsActiveUnitRole} from '../pipes/is-active-unit-role.pipe';
import {HeaderComponent} from './header.component';

const emptyProvider = {};

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        {provide: CalendarModalService, useValue: emptyProvider},
        {provide: AboutDoubtfireModal, useValue: emptyProvider},
        {provide: IsActiveUnitRole, useValue: emptyProvider},
        {provide: CheckForUpdateService, useValue: emptyProvider},
        {provide: GlobalStateService, useValue: emptyProvider},
        {provide: UserService, useValue: emptyProvider},
        {provide: AuthenticationService, useValue: emptyProvider},
        {provide: MediaObserver, useValue: emptyProvider},
        {provide: DoubtfireConstants, useValue: emptyProvider},
        {provide: SidekiqJobService, useValue: emptyProvider},
        {provide: SidekiqJobsModalService, useValue: emptyProvider},
        {provide: QrModalService, useValue: emptyProvider},
        {provide: Router, useValue: emptyProvider},
        {provide: TutorNotesModalService, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(HeaderComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
