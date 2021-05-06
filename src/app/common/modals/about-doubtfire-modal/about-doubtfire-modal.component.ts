//
// Modal to show Doubtfire version info
//
import { Injectable, Component, Inject } from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { AboutDoubtfireModalService } from '../about-doubtfire-modal/about-doubtfire-modal.service';
import { GithubProfile } from './github-profile';

import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AboutDialogData } from './about-dialog-data';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'about-doubtfire-dialog',
  templateUrl: 'about-doubtfire-modal-content.tpl.html',
})
export class AboutDoubtfireModalContent {
  public displayedColumns: string[] = [
    'contributor',
    'contributions',
    'api-contributions',
    'web-contributions',
    'io-contributions',
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: AboutDialogData) {}

  public sortData(sort: Sort) {
    this.data.sortData(sort);
  }
}

/**
 * The about doubtfire modal service - used to create and show the modal
 */
// tslint:disable-next-line: max-classes-per-file
@Injectable()
export class AboutDoubtfireModal {
  private loaded: boolean;
  private aboutDialogData: AboutDialogData;

  constructor(
    public dialog: MatDialog,
    private constants: DoubtfireConstants,
    private aboutDoubtfireModalService: AboutDoubtfireModalService
  ) {
    this.loaded = false;
    this.aboutDialogData = new AboutDialogData();

    this.aboutDialogData.mainContributors = this.constants.mainContributors.map((c) => ({
      avatar_url: '/assets/images/person-unknown.gif',
      login: c,
    })) as GithubProfile[];
  }

  public show(): void {
    // Make API calls only if this is first request.
    if (!this.loaded) {
      this.loaded = true;
      this.getExternalName();
      this.getMainContributorDetails();
      this.getContributorData();
    }
    // Show dialog while the data above is being fetched
    this.dialog.open(AboutDoubtfireModalContent, {
      width: '900px',
      data: this.aboutDialogData,
    });
  }

  private getExternalName(): void {
    this.constants.ExternalName.subscribe((result) => {
      this.aboutDialogData.externalName = result;
    });
  }

  private getMainContributorDetails() {
    // loop over each main contributor
    this.aboutDialogData.mainContributors.forEach((item: GithubProfile, i) => {
      // async get profile from github
      this.aboutDoubtfireModalService
        .getGithubProfiles(item.login)
        // when a response arrives... update the array with data
        .subscribe((response) => {
          this.aboutDialogData.mainContributors[i] = {
            avatar_url: response.avatar_url,
            name: response.name,
            html_url: response.html_url,
            login: response.login,
          };
        });
    });
  }

  private getContributorData() {
    this.aboutDoubtfireModalService.getAPIContributors(this.aboutDialogData);
    this.aboutDoubtfireModalService.getWebContributors(this.aboutDialogData);
    this.aboutDoubtfireModalService.getDoubtfireIOWebContributors(this.aboutDialogData);
  }
}
