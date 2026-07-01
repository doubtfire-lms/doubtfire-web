import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Project} from 'src/app/api/models/project';

@Component({
  selector: 'f-portfolios-portfolio-view',
  templateUrl: './portfolios-portfolio-view.component.html',
  styleUrl: './portfolios-portfolio-view.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PortfoliosPortfolioViewComponent {
  @Input() project: Project;
}
