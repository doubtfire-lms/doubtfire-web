import {Component, ElementRef, Input, ViewChild} from '@angular/core';

@Component({
  selector: 'f-jplag-report-viewer',
  templateUrl: './jplag-report-viewer.component.html',
})
export class JplagReportViewerComponent {
  @ViewChild('jplagIframe', {static: true}) jplagIframe!: ElementRef<HTMLIFrameElement>;

  @Input() hidden: boolean = false;

  public uploadReport(file: Blob) {
    // Send the JPlag report to load
    this.jplagIframe.nativeElement.contentWindow?.postMessage({
      type: 'upload-jplag-report',
      file: file,
      name: 'report.jplag',
    });
  }

  public openComparison(firstSubmissionId: string, secondSubmissionId: string) {
    // Open comparisons between these two submissions (student usernames)
    this.jplagIframe.nativeElement.contentWindow?.postMessage({
      type: 'open-comparison',
      firstSubmissionId,
      secondSubmissionId,
    });
  }
}
