import {AfterViewInit, Component, Inject, Input} from '@angular/core';
import {UIRouter} from '@uirouter/angular';
import {Subscription} from 'rxjs';
import {CreateNewUnitModal} from 'src/app/admin/modals/create-new-unit-modal/create-new-unit-modal.component';

@Component({
  selector: 'f-lti-deeplink',
  templateUrl: 'lti-deeplink.component.html',
  styleUrls: ['lti-deeplink.component.scss'],
})
export class LtiDeeplinkComponent implements AfterViewInit {
  constructor(private createUnitModalService: CreateNewUnitModal) {}

  selectedUnit: string;

  @Input() ltiKey: string;

  ngAfterViewInit(): void {
    // Scroll to the bottom of the page in case the header is visible
    // Ensures our action buttons are centered
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);

    console.log(this.ltiKey);
  }

  public submit(): void {
    console.log(`Selected unit is ${this.selectedUnit}`);
  }

  public createUnit(): void {
    const dialog = this.createUnitModalService.show();

    const sub = dialog.afterAllClosed.subscribe(() => {
      console.log('closed! fetching the units again...');
      // Try defaulting to the last unit created?
      sub.unsubscribe();
    });
  }
}
