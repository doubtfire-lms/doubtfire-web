import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Project} from 'src/app/api/models/project';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';

@Component({
  selector: 'f-portfolios-portfolio-view',
  templateUrl: './portfolios-portfolio-view.component.html',
  styleUrl: './portfolios-portfolio-view.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PortfoliosPortfolioViewComponent {
  @Input() project: Project;

  constructor(private fileDownloader: FileDownloaderService) {}

  public get hasAdditionalFiles(): boolean {
    return (this.project?.portfolioFiles ?? []).some((file) => file.idx !== 0);
  }

  public downloadAdditionalFiles(): void {
    this.fileDownloader.downloadFile(
      this.project.portfolioAdditionalFilesUrl(),
      `${this.project.student.username}-additional-files.zip`,
    );
  }
}
