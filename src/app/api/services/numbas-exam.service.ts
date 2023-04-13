import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NumbasExamService {
  constructor(private http: HttpClient) {}

  getNumbasExamData(): Observable<any> {
    return this.http.get('/path/to/numbas-exam.json');
  }
}
