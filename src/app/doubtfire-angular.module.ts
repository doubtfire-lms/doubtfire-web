import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCheckboxModule, MatDialogModule } from '@angular/material';

import { UIRouterUpgradeModule } from '@uirouter/angular-hybrid'

import { setTheme } from 'ngx-bootstrap/utils';

import { AboutDoubtfireModalService } from "src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.service"
import { AboutDoubtfireModal, AboutDoubtfireModalContent } from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component'
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

@NgModule({
  declarations: [
    AboutDoubtfireModalContent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    HttpClientModule,
    UpgradeModule,
    UIRouterUpgradeModule.forRoot(),
  ],
  providers: [
    AboutDoubtfireModal,
    AboutDoubtfireModalService,
    DoubtfireConstants
  ],
  entryComponents: [
    AboutDoubtfireModalContent
  ]
})
export class DoubtfireAngularModule {
  constructor(private upgrade: UpgradeModule, private constants: DoubtfireConstants, private title: Title) {
    setTheme('bs3'); // or 'bs4'

    this.constants.ExternalName
      .subscribe(result => {
        this.title.setTitle(result)
      });
  }

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['doubtfire'], { strictDi: false });
  }
}
