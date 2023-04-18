// declare the interface of window object to add the ScormAPI property
declare global {
  interface Window {
    ScormAPI: ScormAPI;
  }
}

// define the interface for the ScormAPI
export interface ScormAPI {
  LMSInitialize(parameter?: string): string;
  LMSFinish(parameter?: string): string;
  LMSGetValue(parameter: string): string;
  LMSSetValue(parameter: string, value: string): string;
  LMSCommit(parameter?: string): string;
  LMSGetLastError(): string;
  LMSGetErrorString(errorCode: string): string;
  LMSGetDiagnostic(errorCode: string): string;
}

// check if the ScormAPI object is available on the parent or opener window
let api: ScormAPI | null = null;
if (!api && window.parent && window.parent != window) {
  api = window.parent.ScormAPI;
}
if (!api && window.opener) {
  api = window.opener.ScormAPI;
}

// if the ScormAPI is not found, log an error
if (!api) {
  console.error("Failed to find SCORM API");
}

// export the found ScormAPI or an empty object if not found
export const SCORM_API = api || ({} as ScormAPI);
