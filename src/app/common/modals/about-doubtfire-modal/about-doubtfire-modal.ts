//
// Modal to show Doubtfire version info
//
import { Injectable, Component } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import * as _ from "lodash";

import { DoubtfireConstants } from 'src/app/config/constants/constants';

/**
 * The about doubtfire modal service - used to create and show the modal
 */
@Injectable({
  providedIn: 'root',
})
export class AboutDoubtfireModal {
  constructor(
    private modal: BsModalService) {
  }

  public show() {
    // console.log(this);
    this.modal.show(AboutDoubtfireModalContent)

  }
}

@Component({
  selector: 'about-modal-content',
  templateUrl: 'about-doubtfire-modal.tpl.html'
})
export class AboutDoubtfireModalContent {
  private contributors: { avatar: string; handler: any; }[]
  private constants: DoubtfireConstants;
  constructor(private bsModalRef: BsModalRef, constants: DoubtfireConstants) {
    this.constants = constants;
    console.log(constants.externalName);
    this.contributors = this.mapContributors();
    // vm.loadContributorDetails = loadContributorDetails;

    // // Load in the contributors from GitHub
    // for (let index = 0; index < vm.contributors.length; index++)
    // {
    //   vm.loadContributorDetails(vm.contributors[index].handler, index);
    // }
  }

  public hide() {
    this.bsModalRef.hide();
  }

  // Map contributors to initial hashes - with handler and default avatar
  private mapContributors() {
    return _.map(this.constants.mainContributors, (c) =>
      ({
        avatar: '/assets/images/person-unknown.gif',
        handler: c
      })
    );
  }

  private loadContributorDetails(handler: string, index: number) {
    // $http.get(`https://api.github.com/users/${handler}`)
    //   .then( (response) =>
    //   {
    //     const { data } = response;

    //     // Include http:// if the blog entry does not include "xxxx://"
    //     if (data.blog && !data.blog.match(/^[a-zA-Z]+:\/\//))
    //     {
    //       data.blog = `http://${data.blog}`;
    //     }

    //     vm.contributors[index] = {
    //       name:     data.name,
    //       avatar:   data.avatar_url || '/assets/images/person-unknown.gif',
    //       website:  data.blog || data.html_url,
    //       github:   data.html_url,
    //       handler
    //       };
    //   }
    // );
  }
}
