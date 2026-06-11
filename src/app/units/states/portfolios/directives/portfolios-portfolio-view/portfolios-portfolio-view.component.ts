import {Project} from 'src/app/api/models/project';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'f-portfolios-portfolio-view',
  templateUrl: './portfolios-portfolio-view.component.html',
  styleUrl: './portfolios-portfolio-view.component.scss',
  standalone: false,
})
export class PortfoliosPortfolioViewComponent {
  @Input() project: Project;
}
