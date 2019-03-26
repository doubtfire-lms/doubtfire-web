import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCheckboxModule, MatDialogModule } from '@angular/material';
import { AboutDoubtfireModalService } from "src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.service"
import { AboutDoubtfireModal, AboutDoubtfireModalContent } from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component'

import { setTheme } from 'ngx-bootstrap/utils';
import { DoubtfireConstants } from './config/constants/constants';

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
    ModalModule.forRoot()
  ],
  providers: [AboutDoubtfireModal, AboutDoubtfireModalService, DoubtfireConstants],
  entryComponents: [AboutDoubtfireModalContent]
})
export class AppModule {
  constructor(private upgrade: UpgradeModule, private constants: DoubtfireConstants, private title: Title) {
    setTheme('bs3'); // or 'bs4'

    this.constants.myBehaviorSubject
      .subscribe(result => {
        this.title.setTitle(result)
      });
  }

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['doubtfire'], { strictDi: false });
  }
}
