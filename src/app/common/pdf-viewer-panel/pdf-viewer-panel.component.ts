import { Component, OnInit, Input, Inject } from '@angular/core';
import { analyticsService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'pdf-viewer-panel',
  templateUrl: './pdf-viewer-panel.component.html',
  styleUrls: ['./pdf-viewer-panel.component.scss'],
})
export class PdfViewerPanelComponent implements OnInit {
  @Input() pdfUrl: string;
  @Input() footerText: string;
  @Input() resourcesUrl: string;
  @Input() hideFooter: boolean;
  constructor(@Inject(analyticsService) private AnalyticsService: any) {}

  ngOnInit(): void {}

  downloadEvent(type: string) {
    this.AnalyticsService.event('Task Sheet', `Downloaded ${type}`);
  }

  // #$scope.$watch 'pdfUrl', (newUrl) ->
  //   #       $scope.showViewer = newUrl?
}
