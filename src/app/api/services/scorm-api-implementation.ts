import { ScormAPI } from './scorm-api';
import { Injectable, Inject } from '@angular/core';
import { WINDOW } from './window-token';

// define the implementation of the ScormAPI interface
@Injectable({
  providedIn: 'root',
})
export class ScormAPIImplementation implements ScormAPI {
  private win: Window;
  private api: ScormAPI | null;

  constructor(@Inject(WINDOW) win: Window) {
    this.win = win;

    this.api = this.win.ScormAPI;

    if (!this.api) {
      console.error('ScormAPIImplementation: Failed to find SCORM API');
    } else {
      console.log('ScormAPIImplementation initialized', this.win);
    }
  }

  // implementation of LMSInitialize method
  LMSInitialize(parameter?: string): string {
    console.log('LMSInitialize called', this.win);
    return this.win.ScormAPI.LMSInitialize(parameter);
  }

  // implementation of LMSFinish method
  LMSFinish(parameter?: string): string {
    return this.win.ScormAPI.LMSFinish(parameter);
  }

  // implementation of LMSGetValue method
  LMSGetValue(parameter: string): string {
    return this.win.ScormAPI.LMSGetValue(parameter);
  }

  // implementation of LMSSetValue method
  LMSSetValue(parameter: string, value: string): string {
    return this.win.ScormAPI.LMSSetValue(parameter, value);
  }

  // implementation of LMSCommit method
  LMSCommit(parameter?: string): string {
    return this.win.ScormAPI.LMSCommit(parameter);
  }

  // implementation of LMSGetLastError method
  LMSGetLastError(): string {
    return this.win.ScormAPI.LMSGetLastError();
  }

  // implementation of LMSGetErrorString method
  LMSGetErrorString(errorCode: string): string {
    return this.win.ScormAPI.LMSGetErrorString(errorCode);
  }

  // implementation of LMSGetDiagnostic method
  LMSGetDiagnostic(errorCode: string): string {
    return this.win.ScormAPI.LMSGetDiagnostic(errorCode);
  }
}
