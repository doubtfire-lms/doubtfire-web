import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class IntelligentDiscussionPlayerService {
  constructor(private http: HttpClient) { }

  GetDiscussionFiles() {
    return this.http.get(`https://api.github.com/users/${1}`);
  }
}
