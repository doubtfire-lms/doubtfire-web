import {Component, ElementRef, Input, ViewChild} from '@angular/core';

@Component({
  selector: 'f-jplag-report-viewer',
  templateUrl: './jplag-report-viewer.component.html',
})
export class JplagReportViewerComponent {
  @ViewChild('jplagIframe', {static: true}) jplagIframe!: ElementRef<HTMLIFrameElement>;

  @Input() hidden: boolean = false;

  public openReport(file: Blob) {
    // Send the JPlag report to load
    this.jplagIframe.nativeElement.contentWindow?.postMessage({
      type: 'upload-jplag-file',
      file: file,
      name: 'report.jplag',
    });
  }

  public setSearchFilter(searchTerm: string) {
    // Search comparisons by student username, auto load comparisons if only one is found
    this.jplagIframe.nativeElement.contentWindow?.postMessage({
      type: 'set-search-filter-value',
      filter: searchTerm,
      autoViewComparison: true,
    });
  }

  public openComparison(submissionId1: string, submissionId2: string) {
    // Open comparisons between these two submissions (student usernames)
    this.jplagIframe.nativeElement.contentWindow?.postMessage({
      type: 'open-comparison',
      submissionId1,
      submissionId2,
    });
  }
}
