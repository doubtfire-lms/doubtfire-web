import {AfterViewInit, Component, Inject} from '@angular/core';
import {UIRouter} from '@uirouter/angular';

@Component({
  selector: 'f-lti-deeplink',
  templateUrl: 'lti-deeplink.component.html',
  styleUrls: ['lti-deeplink.component.scss'],
})
export class LtiDeeplinkComponent implements AfterViewInit {
  constructor(@Inject(UIRouter) private router: UIRouter) {}

  selectedUnit: string;

  ngAfterViewInit(): void {
    // Scroll to the bottom of the page in case the header is visible
    // Ensures our action buttons are centered
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
  }

  public submit(): void {
    console.log(`Selected unit is ${this.selectedUnit}`);
  }
}
