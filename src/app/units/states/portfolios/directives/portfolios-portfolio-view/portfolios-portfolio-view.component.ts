import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {Project} from 'src/app/api/models/project';
import {fPdfViewerComponent} from '../../../../../common/pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'f-portfolios-portfolio-view',
  templateUrl: './portfolios-portfolio-view.component.html',
  styleUrl: './portfolios-portfolio-view.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [fPdfViewerComponent, MatIcon],
})
export class PortfoliosPortfolioViewComponent {
  @Input() project: Project;
}
