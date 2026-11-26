import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {UserService} from 'src/app/api/services/user.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {WelcomeComponent} from './welcome.component';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let afterAuthCallback: ((result: boolean) => void) | undefined;
  let routerStub: {navigateByUrl: ReturnType<typeof vi.fn>};
  let globalStateStub: {hideHeader: ReturnType<typeof vi.fn>};
  let userServiceStub: {currentUser: {hasRunFirstTimeSetup: boolean}};

  beforeEach(async () => {
    afterAuthCallback = undefined;
    routerStub = {
      navigateByUrl: vi.fn(),
    };
    globalStateStub = {
      hideHeader: vi.fn(),
    };
    userServiceStub = {
      currentUser: {
        hasRunFirstTimeSetup: false,
      },
    };

    await TestBed.configureTestingModule({
      declarations: [WelcomeComponent],
      providers: [
        {
          provide: DoubtfireConstants,
          useValue: {
            ExternalName: new BehaviorSubject<string>('OnTrack'),
          },
        },
        {provide: GlobalStateService, useValue: globalStateStub},
        {
          provide: AuthenticationService,
          useValue: {
            afterAuthCall: vi.fn((callback: (result: boolean) => void) => {
              afterAuthCallback = callback;
            }),
          },
        },
        {provide: Router, useValue: routerStub},
        {provide: UserService, useValue: userServiceStub},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide the header while the welcome page is active', () => {
    expect(globalStateStub.hideHeader).toHaveBeenCalled();
  });

  it('should redirect unauthenticated users to sign in', () => {
    expect(afterAuthCallback).toBeDefined();

    afterAuthCallback?.(false);

    expect(routerStub.navigateByUrl).toHaveBeenCalledWith('/sign_in');
  });

  it('should show the expected welcome heading', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Welcome to OnTrack');
  });
});
