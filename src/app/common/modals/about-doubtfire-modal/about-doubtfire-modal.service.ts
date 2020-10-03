import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GithubProfile } from './github-profile';
import { ContributorData } from './contributor-data';
import { AboutDialogData } from './about-dialog-data';

interface GithubContributors {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  contributions: number;
}

@Injectable()
export class AboutDoubtfireModalService {
  constructor(private http: HttpClient) {}

  public getGithubProfiles(handler: string) {
    return this.http.get<GithubProfile>(`https://api.github.com/users/${handler}`);
  }

  private findOrCreateContributor(data: AboutDialogData, profile: GithubContributors): ContributorData {
    let contributor: ContributorData;
    contributor = data.allContributors.value.find((c) => {
      return c.login === profile.login;
    });
    if (!contributor) {
      contributor = new ContributorData(profile.login, profile.html_url, profile.avatar_url);

      data.addContributor(contributor);
    }
    return contributor;
  }

  private getContributors(url: string, data: AboutDialogData, key: string) {
    return this.http.get<GithubContributors[]>(url).subscribe((response) => {
      response.forEach((profile) => {
        const contributor = this.findOrCreateContributor(data, profile);
        contributor[key] = profile.contributions;
      });
      data.sortData({ active: 'contributions', direction: 'desc' });
    });
  }

  public getDoubtfireIOWebContributors(data: AboutDialogData) {
    this.getContributors(
      'https://api.github.com/repos/doubtfire-lms/doubtfire.io/contributors',
      data,
      'ioContributions'
    );
  }

  public getWebContributors(data: AboutDialogData) {
    this.getContributors(
      'https://api.github.com/repos/doubtfire-lms/doubtfire-web/contributors',
      data,
      'webContributions'
    );
  }

  public getAPIContributors(data: AboutDialogData) {
    this.getContributors(
      'https://api.github.com/repos/doubtfire-lms/doubtfire-api/contributors',
      data,
      'apiContributions'
    );
  }
}
