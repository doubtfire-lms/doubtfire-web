import {Injectable} from '@angular/core';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable({
  providedIn: 'root',
})
export class TestAttemptService {
  private apiBaseUrl = `${API_URL}/test_attempts`;
  private defaultValues = this.getDefaultDataStore();
  private dataStore = {...this.defaultValues};
  private testId: number = 0;

  constructor() {}

  getDefaultDataStore() {
    return {
      'cmi.completion_status': 'not attempted',
      'cmi.entry': 'ab-initio',
      'numbas.user_role': 'learner',
      'numbas.duration_extension.units': 'seconds',
      'cmi.mode': 'normal',
      'cmi.undefinedlearner_response': '1',
    };
  }

  initialize(mode: 'attempt' | 'review' = 'attempt'): string {
    const endpoint = mode === 'review' ? '/completed-latest' : '/latest';
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${this.apiBaseUrl}${endpoint}`, false);
    xhr.send();

    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      // Process the response data
      // ...

      this.testId = response.id;
      this.dataStore = {...response.data};
      return 'true';
    } else {
      console.error('Error fetching test result:', xhr.statusText);
      return 'false';
    }
  }

  getValue(element: string): string {
    return this.dataStore[element] || '';
  }

  setValue(element: string, value: unknown): void {
    if (element.startsWith('cmi.')) {
      this.dataStore[element] = value;
    }
  }

  commit(): string {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `${this.apiBaseUrl}/${this.testId}/suspend`, false);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify(this.dataStore));

    if (xhr.status === 200) {
      return 'true';
    } else {
      console.error('Error committing data:', xhr.statusText);
      return 'false';
    }
  }

  terminate(): string {
    const data = this.prepareTerminateData();
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `${this.apiBaseUrl}/${this.testId}`, false);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify(data));

    if (xhr.status === 200) {
      return 'true';
    } else {
      console.error('Error terminating test:', xhr.statusText);
      return 'false';
    }
  }

  private prepareTerminateData(): unknown {
    return {
      name: this.dataStore['name'],
      attempt_number: this.dataStore['attempt_number'],
      pass_status: this.dataStore['cmi.completion_status'] === 'passed',
      suspend_data: JSON.stringify(this.dataStore),
      completed: true,
      exam_result: this.dataStore['cmi.score.raw'],
      cmi_entry: this.dataStore['cmi.entry'],
    };
  }

  GetLastError(): string {
    //console.log('Get Last Error called');
    return '0';
  }

  GetErrorString(errorCode: string): string {
    return '';
  }

  GetDiagnostic(errorCode: string): string {
    //console.log('Get Diagnoistic called');
    return '';
  }
}
