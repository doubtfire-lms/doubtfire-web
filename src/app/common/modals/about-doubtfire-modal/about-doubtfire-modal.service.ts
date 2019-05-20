import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GithubProfile } from '../about-doubtfire-modal/GithubProfile';

@Injectable()
export class AboutDoubtfireModalService {
  constructor(private http: HttpClient) { }

  GetGithubProfiles(handler: string) {
    return this.http.get<GithubProfile>(`https://api.github.com/users/${handler}`);
  }

  GetOtherContributors() {
    return this.http.get<GithubProfile>("https://api.github.com/repos/doubtfire-lms/doubtfire-web/contributors");
  }
}
