import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NumbasTestsService {

  //To be adjusted
  private apiEndpoint = 'https://localhost:3000/api/completed-tests';

  constructor(private http: HttpClient) {}

  saveCompletedTest(completedTestData: any): Observable<any> {
    return this.http.post<any>(this.apiEndpoint, completedTestData);
  }
}
