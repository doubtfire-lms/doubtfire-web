import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AboutDoubtfireModal } from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal'

@NgModule({
  imports:      [
    BrowserModule,
    UpgradeModule,
    ModalModule.forRoot()
  ],
  providers: [ AboutDoubtfireModal ]
})
export class AppModule {
  constructor(private upgrade: UpgradeModule  ) { }

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['doubtfire'], { strictDi: false });
  }
}
