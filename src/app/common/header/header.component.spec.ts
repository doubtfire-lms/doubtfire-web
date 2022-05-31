import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  aboutDoubtfireModal,
  calendarModal,
  currentUser,
  userNotificationSettingsModal,
  userSettingsModal,
} from 'src/app/ajs-upgraded-providers';
import { GlobalStateService, ViewType } from 'src/app/projects/states/index/global-state.service';
import { CheckForUpdateService } from 'src/app/sessions/service-worker-updater/check-for-update.service';
import { IsActiveUnitRole } from '../pipes/is-active-unit-role.pipe';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let currentUserStub: jasmine.SpyObj<any>;
  let userSettingsModalStub: jasmine.SpyObj<any>;
  let userNotificationSettingsModalStub: jasmine.SpyObj<any>;
  let calendarModalStub: jasmine.SpyObj<any>;
  let aboutDoubtfireModalStub: jasmine.SpyObj<any>;
  let isActiveUnitRoleStub: Partial<IsActiveUnitRole>;
  let checkForUpdateServiceStub: Partial<CheckForUpdateService>;
  let globalStateServiceStub: Partial<GlobalStateService>;

  beforeEach(
    waitForAsync(() => {
      const showHideHeader = new Subject<boolean>();
      const unitRolesSubject = new BehaviorSubject<any>(null);
      const projectsSubject = new BehaviorSubject<any>(null);
      const currentViewAndEntitySubject = new BehaviorSubject<{ viewType: ViewType; entity: {} }>(null);

      currentUserStub = {
        role: 'tutor',
      };

      globalStateServiceStub = {
        showHideHeader: showHideHeader,
        unitRolesSubject: unitRolesSubject,
        projectsSubject: projectsSubject,
        currentViewAndEntitySubject: currentViewAndEntitySubject,
      };

      TestBed.configureTestingModule({
        declarations: [HeaderComponent],
        imports: [MatMenuModule],
        providers: [
          { provide: currentUser, useValue: currentUserStub },
          { provide: userSettingsModal, useValue: userSettingsModalStub },
          { provide: userNotificationSettingsModal, useValue: userNotificationSettingsModalStub },
          { provide: calendarModal, useValue: calendarModalStub },
          { provide: aboutDoubtfireModal, useValue: aboutDoubtfireModalStub },
          { provide: IsActiveUnitRole, useValue: isActiveUnitRoleStub },
          { provide: CheckForUpdateService, useValue: checkForUpdateServiceStub },
          { provide: GlobalStateService, useValue: globalStateServiceStub },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
