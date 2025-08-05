import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {UIRouter} from '@uirouter/angular';

@Component({
  selector: 'f-lti-dashboard',
  templateUrl: 'lti-dashboard.component.html',
  styleUrls: ['lti-dashboard.component.scss'],
})
export class LtiDashboardComponent implements AfterViewInit {
  constructor(@Inject(UIRouter) private router: UIRouter) {}

  ngAfterViewInit(): void {
    // Scroll to the bottom of the page in case the header is visible
    // Ensures our action buttons are centered
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
  }

  public launchApplication(): void {
    window.open('http://localhost:4200/home', '_blank');
  }
}
