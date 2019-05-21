//
// Modal to show Doubtfire version info
//
import { Injectable, Component, Inject, OnInit } from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { AboutDoubtfireModalService } from '../about-doubtfire-modal/about-doubtfire-modal.service';
import { GithubProfile } from '../about-doubtfire-modal/GithubProfile';
import {GithubProfileOthers} from '../about-doubtfire-modal/GithubProfileOthers';

import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';

export interface AboutDialogData {
  externalName: string,
  contributors: GithubProfile[],
  otherWebContributors: GithubProfileOthers[],
  otherAPIContributors: GithubProfileOthers[],
  otherContributors: GithubProfileOthers[]
}

/**
 * The about doubtfire modal service - used to create and show the modal
 */
@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'about-modal-content',
  providers: [AboutDoubtfireModalService, DoubtfireConstants],
})
export class AboutDoubtfireModal {

  aboutDialogData: AboutDialogData;

  constructor(public dialog: MatDialog,
    private constants: DoubtfireConstants,
    private aboutDoubtfireModalService: AboutDoubtfireModalService) {
    this.aboutDialogData = {
      externalName: "",
      contributors: [],
      otherWebContributors: [],
      otherAPIContributors: [],
      otherContributors: []
    }

    this.aboutDialogData.contributors = <GithubProfile[]>this.constants.mainContributors.map(c => ({
      avatar_url: '/assets/images/person-unknown.gif',
      login: c
    }));
  }

  show() {
    this.getContributorDetails();
    this.getExternalName();
    if(this.aboutDialogData.otherContributors.length === 0) {
      this.getOtherWebContributorsDetails();
      this.getOtherAPIContributorsDetails();
      setTimeout(this.combineContributions.bind(this), 2000);
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
          this.aboutDialogData.contributors[i] =
            {
              avatar_url: response.avatar_url,
              name: response.name,
              html_url: response.html_url,
              login: response.login
            }
        })
    });
  }

  private getOtherWebContributorsDetails() {
    this.aboutDoubtfireModalService.GetOtherWebContributors()
      .subscribe(response => {
        this.aboutDialogData.otherWebContributors.push(...response); 
      });
  }

  private getOtherAPIContributorsDetails() {
    this.aboutDoubtfireModalService.GetOtherAPIContributors()
      .subscribe(response => {
        this.aboutDialogData.otherAPIContributors.push(...response); 
      });
  }

  private combineContributions() {
    this.aboutDialogData.otherContributors = Array.from(this.aboutDialogData.otherAPIContributors);
    this.aboutDialogData.otherWebContributors.forEach(contributor => {
      var user = this.aboutDialogData.otherContributors.find(c => c.id === contributor.id);
      if(user !== undefined) {
        user.contributions += contributor.contributions;
      } else {
        this.aboutDialogData.otherContributors.push(contributor);
      }
    })
    this.aboutDialogData.otherContributors.sort((a,b) => b.contributions - a.contributions)
  }
}

@Component({
  selector: 'about-doubtfire-dialog',
  templateUrl: 'about-doubtfire-modal-content.tpl.html',
})
export class AboutDoubtfireModalContent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: AboutDialogData) { }
}
