import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompletedTestService {
  constructor(private http: HttpClient) {}

  saveCompletedTest(completedTestData: any): Observable<any> {
    return this.http.post('/api/completed-tests', completedTestData);
  }
}
