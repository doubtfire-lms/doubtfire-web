import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GithubProfile } from './github-profile';
import { GithubContributors } from './github-contributors';
import { ContributorData } from "./contributor-data";
import { AboutDialogData } from './about-dialog-data';

@Injectable()
export class AboutDoubtfireModalService {
  constructor(private http: HttpClient) { }

  public getGithubProfiles(handler: string) {
    return this.http.get<GithubProfile>(`https://api.github.com/users/${handler}`);
  }

  private findOrCreateContributor(data: AboutDialogData, profile: GithubContributors) : ContributorData {
    var contributor: ContributorData;
    contributor = data.allContributors.value.find( 
      c => { return c.login == profile.login; });
    if (!contributor) {
      contributor = new ContributorData(
        profile.login,
        profile.html_url,
        profile.avatar_url);

      data.addContributor(contributor);
    }
    return contributor;
  }

  private getContributors(url: string, data: AboutDialogData, key: string) {
    return this.http.get<GithubContributors[]>(url)
      .subscribe(response => {
        response.forEach( profile => {
          var contributor = this.findOrCreateContributor(data, profile);
          contributor[key] = profile.contributions;
        });
        data.sortData({active: 'contributions', direction: 'desc' });
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
