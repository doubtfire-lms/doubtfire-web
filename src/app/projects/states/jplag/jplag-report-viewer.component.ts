import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-jplag-report-viewer',
  templateUrl: './jplag-report-viewer.component.html',
})
export class JplagReportViewerComponent {
  @ViewChild('jplagIframe', {static: true}) jplagIframe!: ElementRef<HTMLIFrameElement>;

  @Input() hidden: boolean = false;

  constructor(private alertService: AlertService) {}

  public uploadReport(file: Blob) {
    const blobUrl = URL.createObjectURL(file);
    this.jplagIframe.nativeElement.src = `/JPlag/?file=${encodeURIComponent(blobUrl)}`;
  }

  public openComparison(first: string, second: string) {
    const iframe = this.jplagIframe.nativeElement;

    const tryClick = () => {
      const doc = iframe.contentDocument;
      if (!doc) return false;

      const el =
        doc.querySelector(`a[href="/JPlag/comparison/${first}/${second}"]`) ||
        doc.querySelector(`a[href="/JPlag/comparison/${second}/${first}"]`);

      if (el) {
        (el as HTMLElement).click();
        return true;
      }

      return false;
    };

    // Attempt to find the Vue component for 5 seconds
    let elapsed = 0;
    const interval = setInterval(() => {
      if (tryClick()) {
        clearInterval(interval);
        return;
      }

      elapsed += 50;

      if (elapsed >= 5000) {
        clearInterval(interval);
        this.alertService.error('Could not open JPlag comparison.', 6000);
      }
    }, 50);
  }
}
