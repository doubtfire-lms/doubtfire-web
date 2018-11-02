import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AboutDoubtfireModal, AboutDoubtfireModalContent } from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal'

import { setTheme } from 'ngx-bootstrap/utils';

@NgModule({
  declarations: [
    AboutDoubtfireModalContent
  ],
  imports:      [
    BrowserModule,
    UpgradeModule,
    ModalModule.forRoot()
  ],
  providers: [ AboutDoubtfireModal ],
  entryComponents: [ AboutDoubtfireModalContent ]
})
export class AppModule {
  constructor(private upgrade: UpgradeModule  )
  {
    setTheme('bs3'); // or 'bs4'
  }

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['doubtfire'], { strictDi: false });
  }
}
