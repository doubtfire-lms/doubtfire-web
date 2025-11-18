import {Component, Input} from '@angular/core';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';

@Component({
  selector: 'f-portfolios-project-progress',
  templateUrl: './portfolios-project-progress.component.html',
  styleUrl: './portfolios-project-progress.component.scss',
})
export class PortfoliosProjectProgressComponent {
  @Input() project: Project;
  @Input() unit: Unit;
}
