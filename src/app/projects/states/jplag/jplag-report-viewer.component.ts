import {ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-jplag-report-viewer',
  templateUrl: './jplag-report-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class JplagReportViewerComponent {
  @ViewChild('jplagIframe', {static: true}) jplagIframe!: ElementRef<HTMLIFrameElement>;

  @Input() hidden: boolean = false;

  constructor(private alertService: AlertService) {}

  public uploadReport(file: Blob) {
    const blobUrl = URL.createObjectURL(file);
    this.jplagIframe.nativeElement.src = `/JPlag/?file=${encodeURIComponent(blobUrl)}`;
  }

  public openComparison(firstSubmissionId: string, secondSubmissionId: string) {
    const iframe = this.jplagIframe.nativeElement;

    const findLink = (doc: Document) =>
      (doc.querySelector(
        `a[href="/JPlag/comparison/${firstSubmissionId}/${secondSubmissionId}"]`,
      ) ||
        doc.querySelector(
          `a[href="/JPlag/comparison/${secondSubmissionId}/${firstSubmissionId}"]`,
        )) as HTMLElement | null;

    // If the Vue component isn't rendered yet, try to scroll down the window until we find it
    const getScroller = (doc: Document) => {
      const wrapper = doc.querySelector(
        '.vue-recycle-scroller__item-wrapper',
      ) as HTMLElement | null;
      if (!wrapper) {
        return null;
      }

      let cur = wrapper.parentElement as HTMLElement | null;
      while (cur) {
        const overflowY = getComputedStyle(cur).overflowY;
        if (
          (overflowY === 'auto' || overflowY === 'scroll') &&
          cur.scrollHeight > cur.clientHeight
        ) {
          return cur;
        }
        cur = cur.parentElement;
      }

      return doc.scrollingElement as HTMLElement | null;
    };

    let elapsed = 0;
    const interval = setInterval(() => {
      const doc = iframe.contentDocument;
      if (!doc) {
        return;
      }

      const el = findLink(doc);
      if (el) {
        el.click();
        clearInterval(interval);
        return;
      }

      getScroller(doc)?.scrollBy(0, 600);

      elapsed += 50;
      if (elapsed >= 10000) {
        clearInterval(interval);
        this.alertService.error('Could not open JPlag comparison.', 6000);
      }
    }, 50);
  }
}
