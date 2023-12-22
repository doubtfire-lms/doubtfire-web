import {Component, OnInit} from '@angular/core';
import {NumbasService} from '../../../api/services/numbas.service';
import {TestAttemptService} from '../../../api/services/test_attempt.service';

declare global {
  interface Window { API_1484_11: any; }
}

@Component({
  selector: 'app-numbas',
  templateUrl: './numbas-component.component.html',
})
export class NumbasComponent implements OnInit {
  currentMode: 'attempt' | 'review' = 'attempt';

  constructor(
    private numbasService: NumbasService,
    private testAttemptService: TestAttemptService
  ) {}

  ngOnInit(): void {
    this.interceptIframeRequests();

    // Setup SCORM API in the global window object
    window.API_1484_11 = {
      Initialize: () => this.testAttemptService.initialize(this.currentMode),
      Terminate: () => this.testAttemptService.terminate(),
      GetValue: (element: string) => this.testAttemptService.getValue(element),
      SetValue: (element: string, value: string) => this.testAttemptService.setValue(element, value),
      Commit: () => this.testAttemptService.commit(),
      GetLastError: () => this.testAttemptService.getLastErrorCode(),
      GetErrorString: (errorCode: string) => this.testAttemptService.getErrorString(errorCode),
      GetDiagnostic: (errorCode: string) => this.testAttemptService.getDiagnostic(errorCode)
    };
  }

  // Launches the Numbas test inside an iframe
  launchNumbasTest(mode: 'attempt' | 'review' = 'attempt'): void {
    this.currentMode = mode;
    const iframe = document.createElement('iframe');
    iframe.src = 'http://localhost:4201/api/numbas_api/index.html'; // Update with correct URL
    iframe.style.width = '100%';
    iframe.style.height = '800px';
    document.body.appendChild(iframe);
  }

  // Removes the Numbas test iframe from the DOM
  removeNumbasTest(): void {
    const iframe = document.getElementsByTagName('iframe')[0];
    iframe?.parentNode?.removeChild(iframe);
  }

  // Sets the mode to review and launches the test
  reviewTest(): void {
    this.launchNumbasTest('review');
  }

  // Intercepts XHR requests to the Numbas API and reroutes them through the NumbasService
  interceptIframeRequests(): void {
    const originalOpen = XMLHttpRequest.prototype.open;
    const numbasService = this.numbasService;
    XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null) {
      if (typeof url === 'string' && url.startsWith('/api/numbas_api/')) {
        const resourcePath = url.replace('/api/numbas_api/', '');
        this.abort(); // Abort the original request
        numbasService.fetchResource(resourcePath).subscribe(
          (resourceData) => {
            if (this.onload) {
              this.onload.call(this, resourceData);
            }
          },
          (error) => {
            console.error('Error fetching Numbas resource:', error);
          }
        );
      } else {
        originalOpen.call(this, method, url, async, username, password);
      }
    };
  }
}
