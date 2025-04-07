import {Component, OnInit, Input, HostListener} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {
  AuthenticationService,
  ScormPlayerContext,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {ScormAdapterService} from 'src/app/api/services/scorm-adapter.service';
import {AppInjector} from 'src/app/app-injector';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';

declare global {
  interface Window {
    API_1484_11: {
      Initialize: () => void;
      Terminate: () => void;
      GetValue: (element: string) => string;
      SetValue: (element: string, value: string) => void;
      Commit: () => void;
      GetLastError: () => string;
      GetErrorString: (errorCode: string) => string;
      GetDiagnostic: (errorCode: string) => string;
    };
  }
}

@Component({
  selector: 'f-scorm-player',
  templateUrl: './scorm-player.component.html',
  styleUrls: ['./scorm-player.component.scss'],
})
export class ScormPlayerComponent implements OnInit {
  context: ScormPlayerContext;

  @Input()
  projectId: number;

  @Input()
  taskDefId: number;

  @Input()
  mode: 'browse' | 'normal' | 'review' | 'preview';

  @Input()
  testAttemptId: number;

  iframeSrc: SafeResourceUrl;

  constructor(
    private globalState: GlobalStateService,
    private scormAdapter: ScormAdapterService,
    private userService: UserService,
    private authService: AuthenticationService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.globalState.setView(ViewType.OTHER);
    this.globalState.hideHeader();
    this.authService.getScormToken().subscribe((value: string) => this.setupScorm(value));
  }

  private setupScorm(token: string): void {
    this.scormAdapter.mode = this.mode;
    if (this.mode === 'normal') {
      this.scormAdapter.projectId = this.projectId;
      this.scormAdapter.taskDefId = this.taskDefId;
    } else if (this.mode === 'review') {
      this.scormAdapter.testAttemptId = this.testAttemptId;
    }

    if (this.mode !== 'preview') {
      window.API_1484_11 = {
        Initialize: () => this.scormAdapter.Initialize(),
        Terminate: () => this.scormAdapter.Terminate(),
        GetValue: (element: string) => this.scormAdapter.GetValue(element),
        SetValue: (element: string, value: string) => this.scormAdapter.SetValue(element, value),
        Commit: () => this.scormAdapter.Commit(),
        GetLastError: () => this.scormAdapter.GetLastError(),
        GetErrorString: (errorCode: string) => this.scormAdapter.GetErrorString(errorCode),
        GetDiagnostic: (errorCode: string) => this.scormAdapter.GetDiagnostic(errorCode),
      };
    } else {
      window.API_1484_11 = undefined;
    }

    // Encode . as %2e to avoid issue with grape treating the username as a file extension
    const username = this.userService.currentUser.username.replaceAll('.', '%2e');

    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${AppInjector.get(DoubtfireConstants).API_URL}/scorm/${this.taskDefId}/${username}/${token}/index.html`,
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(_event: Event): void {
    if (this.scormAdapter.state == 'Initialized') {
      // console.log('SCORM player closing during an initialized session, commiting DataModel');
      this.scormAdapter.Commit();
    }
  }

  @HostListener('window:unload', ['$event'])
  onUnload(_event: Event): void {
    this.scormAdapter.destroy();
  }
}
