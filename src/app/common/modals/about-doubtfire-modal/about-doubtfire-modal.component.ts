//
// Modal to show Doubtfire version info
//
import { Injectable, Component, Inject } from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/constants';
import { AboutDoubtfireModalService } from '../about-doubtfire-modal/about-doubtfire-modal.service';
import { GithubProfile } from '../about-doubtfire-modal/GithubProfile';

import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';

export interface AboutDialogData {
  externalName: string
  contrubutors: GithubProfile[]
}

/**
 * The about doubtfire modal service - used to create and show the modal
 */
@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'about-modal-content',
  templateUrl: 'about-doubtfire-modal.tpl.html',
  providers: [AboutDoubtfireModalService]
})
export class AboutDoubtfireModal {
  contributors: GithubProfile[];
  constructor(public dialog: MatDialog, private constants: DoubtfireConstants, private aboutDoubtfireModalService: AboutDoubtfireModalService) {
    this.contributors = <GithubProfile[]>this.constants.mainContributors.map(c => ({
      avatar_url: '/assets/images/person-unknown.gif',
      login: c
    }));
    this.getContributorDetails();
  }

  show() {
    const dialogRef = this.dialog.open(AboutDoubtfireModalContent,
      {
        width: '900px',
        data: {
          externalName: this.constants.externalName,
          contributors: this.contributors
        }
      });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  getContributorDetails() {
    this.contributors.forEach((item: GithubProfile, i) => {
      this.aboutDoubtfireModalService.GetGithubProfiles(item.login)
        .subscribe(response => {
          this.contributors[i] =
            {
              avatar_url: response.avatar_url,
              name: response.name,
              html_url: response.html_url,
              login: response.login
            }
        })
    });
  }
}

@Component({
  selector: 'about-doubtfire-dialog',
  templateUrl: 'about-doubtfire-modal-content.tpl.html',
})
export class AboutDoubtfireModalContent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: AboutDialogData) { }
}
