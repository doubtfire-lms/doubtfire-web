import JSZip from 'jszip';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-jplag-report-viewer',
  templateUrl: './jplag-report-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class JplagReportViewerComponent implements OnDestroy {
  @ViewChild('jplagIframe', {static: true}) jplagIframe!: ElementRef<HTMLIFrameElement>;

  @Input() hidden: boolean = false;

  private reportUrl: string | null = null;
  private deepLinkSupport: Promise<boolean> | null = null;

  constructor(private alertService: AlertService) {}

  /** Opens one comparison from a report, skipping the viewer's overview. */
  public async openComparison(file: Blob, firstSubmissionId: string, secondSubmissionId: string) {
    const [first, second] = await this.orderAsStoredInReport(
      file,
      firstSubmissionId,
      secondSubmissionId,
    );

    this.revokeReport();
    this.reportUrl = URL.createObjectURL(file);
    const query = `?file=${encodeURIComponent(this.reportUrl)}`;

    if (await this.supportsDeepLinks()) {
      const pair = `${encodeURIComponent(first)}/${encodeURIComponent(second)}`;
      this.navigateViewer(`/JPlag/comparison/${pair}${query}`);
      return;
    }

    this.navigateViewer(`/JPlag/${query}`);
    this.openFromOverview(first, second);
  }

  public ngOnDestroy() {
    this.revokeReport();
  }

  // Same origin, so the viewer's alerts can be shown as OnTrack's own rather than
  // as native dialogs. Armed on load, before the report finishes parsing.
  private navigateViewer(url: string) {
    const iframe = this.jplagIframe.nativeElement;

    iframe.addEventListener(
      'load',
      () => {
        const win = iframe.contentWindow;
        if (win) {
          win.alert = (message?: unknown) => this.reportViewerAlert(String(message ?? ''));
        }
      },
      {once: true},
    );

    iframe.src = url;
  }

  // Where the viewer's routes are not served, the comparison is only reachable
  // from the overview, so scroll its virtual list until the link renders.
  private openFromOverview(first: string, second: string) {
    const iframe = this.jplagIframe.nativeElement;
    let elapsed = 0;

    const interval = setInterval(() => {
      const doc = iframe.contentDocument;
      if (!doc) {
        return;
      }

      const link = (doc.querySelector(`a[href="/JPlag/comparison/${first}/${second}"]`) ||
        doc.querySelector(`a[href="/JPlag/comparison/${second}/${first}"]`)) as HTMLElement | null;
      if (link) {
        link.click();
        clearInterval(interval);
        return;
      }

      this.getScroller(doc)?.scrollBy(0, 600);

      elapsed += 50;
      if (elapsed >= 10000) {
        clearInterval(interval);
        this.reportViewerAlert('');
      }
    }, 50);
  }

  private reportViewerAlert(message: string) {
    this.alertService.error(message || 'Could not open JPlag comparison.', 6000);
  }

  // The viewer's routes only resolve where the host serves its index for them.
  // Caddy and the web image do; the Angular dev server serves OnTrack's instead.
  private supportsDeepLinks(): Promise<boolean> {
    this.deepLinkSupport ??= fetch('/JPlag/comparison/probe/probe')
      .then((response) => response.text())
      .then((html) => html.includes('/JPlag/assets/'))
      .catch(() => false);

    return this.deepLinkSupport;
  }

  private getScroller(doc: Document): HTMLElement | null {
    const wrapper = doc.querySelector('.vue-recycle-scroller__item-wrapper');
    if (!wrapper) {
      return null;
    }

    let cur = wrapper.parentElement;
    while (cur) {
      const overflowY = getComputedStyle(cur).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && cur.scrollHeight > cur.clientHeight) {
        return cur;
      }
      cur = cur.parentElement;
    }

    return doc.scrollingElement as HTMLElement | null;
  }

  // Neither alphabetical nor OnTrack's order. The viewer reads the first URL
  // submission's files against the first report submission's token index, so the
  // reversed pair fails with an unhandled error inside the viewer.
  private async orderAsStoredInReport(
    file: Blob,
    firstSubmissionId: string,
    secondSubmissionId: string,
  ): Promise<[string, string]> {
    try {
      const zip = await JSZip.loadAsync(file);
      const mappings = await this.readJson(zip, 'submissionMappings.json');
      const comparisonFile =
        mappings?.submissionIdsToComparisonFileName?.[firstSubmissionId]?.[secondSubmissionId];
      const comparison = await this.readJson(zip, `comparisons/${comparisonFile}`);

      return comparison
        ? [comparison.firstSubmissionId, comparison.secondSubmissionId]
        : [firstSubmissionId, secondSubmissionId];
    } catch {
      return [firstSubmissionId, secondSubmissionId];
    }
  }

  private async readJson(zip: JSZip, path: string) {
    const entry = zip.file(path);
    return entry ? JSON.parse(await entry.async('string')) : null;
  }

  private revokeReport() {
    if (this.reportUrl) {
      URL.revokeObjectURL(this.reportUrl);
      this.reportUrl = null;
    }
  }
}
