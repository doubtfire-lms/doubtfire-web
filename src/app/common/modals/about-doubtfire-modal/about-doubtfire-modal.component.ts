//
// Modal to show Doubtfire version info
//
import { Injectable, Component, Inject } from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { AboutDoubtfireModalService } from '../about-doubtfire-modal/about-doubtfire-modal.service';
import { GithubProfile } from '../about-doubtfire-modal/GithubProfile';
import {GithubProfileOthers} from '../about-doubtfire-modal/GithubProfileOthers';

import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface AboutDialogData {
  externalName: string,
  contributors: GithubProfile[],
  otherWebContributors: GithubProfileOthers[],
  otherAPIContributors: GithubProfileOthers[],
  otherTotalContributors: GithubProfileOthers[]

@Component({
  selector: 'about-doubtfire-dialog',
  templateUrl: 'about-doubtfire-modal-content.tpl.html',
})
export class AboutDoubtfireModalContent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: AboutDialogData) { }
}

/**
 * The about doubtfire modal service - used to create and show the modal
 */
@Injectable()
export class AboutDoubtfireModal {

  aboutDialogData: AboutDialogData;

  constructor(public dialog: MatDialog,
    private constants: DoubtfireConstants,
    private aboutDoubtfireModalService: AboutDoubtfireModalService) {
    this.aboutDialogData = {
      externalName: '',
      contributors: [],
      otherWebContributors: [],
      otherAPIContributors: [],
      otherTotalContributors: []
    }

    this.aboutDialogData.contributors = <GithubProfile[]>this.constants.mainContributors.map(c => ({
      avatar_url: '/assets/images/person-unknown.gif',
      login: c
    }));
  }

  show() {
    this.getContributorDetails();
    this.getExternalName();
    // Make API calls only if this is first request. 
    if(this.aboutDialogData.otherTotalContributors.length === 0) {
      this.getAPIData();
    }
    this.dialog.open(AboutDoubtfireModalContent,
      {
        width: '900px',
        data: this.aboutDialogData
      });
  }

  private getExternalName(): void {
    this.constants.ExternalName
      .subscribe(result => {
        this.aboutDialogData.externalName = result;
      });
  }

  private getContributorDetails() {
    this.aboutDialogData.contributors.forEach((item: GithubProfile, i) => {
      this.aboutDoubtfireModalService.GetGithubProfiles(item.login)
        .subscribe(response => {
          this.aboutDialogData.contributors[i] = {
            avatar_url: response.avatar_url,
            name: response.name,
            html_url: response.html_url,
            login: response.login
          };
        });
    });
  }

  private async getAPIData() {
    // Wait for the data to be retrieved.
    this.aboutDialogData.otherWebContributors = await this.aboutDoubtfireModalService.GetOtherWebContributors().toPromise();
    this.aboutDialogData.otherAPIContributors = await this.aboutDoubtfireModalService.GetOtherAPIContributors().toPromise();

    this.combineContributions();
  }

  private combineContributions() {
    this.aboutDialogData.otherTotalContributors = Array.from(this.aboutDialogData.otherAPIContributors);
    this.aboutDialogData.otherWebContributors.forEach(contributor => {
      var user = this.aboutDialogData.otherTotalContributors.find(c => c.id === contributor.id);
      if(user !== undefined) {
        user.contributions += contributor.contributions;
      } else {
        this.aboutDialogData.otherTotalContributors.push(contributor);
      }
    });
    this.aboutDialogData.otherTotalContributors.sort((a,b) => b.contributions - a.contributions);

    // Filter main contributors so that they are not shown again.
    let mainContributors: String[] = [];
    this.aboutDialogData.contributors.forEach(c => mainContributors.push(c.login));
    this.aboutDialogData.otherTotalContributors = this.aboutDialogData.otherTotalContributors.filter(user => {
      if(mainContributors.indexOf(user.login) === -1)
        return true;
      else
        return false;
    });
  }
}
