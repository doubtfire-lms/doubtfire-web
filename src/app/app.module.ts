import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCheckboxModule, MatDialogModule } from '@angular/material';
import { AboutDoubtfireModalService } from "src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.service"
import { AboutDoubtfireModal, AboutDoubtfireModalContent } from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component'

import { setTheme } from 'ngx-bootstrap/utils';

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
  providers: [AboutDoubtfireModal, AboutDoubtfireModalService],
  entryComponents: [AboutDoubtfireModalContent]
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) {
    setTheme('bs3'); // or 'bs4'
  }

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['doubtfire'], { strictDi: false });
  }
}
