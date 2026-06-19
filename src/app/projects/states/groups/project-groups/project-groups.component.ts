import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {GroupSet, Project} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';

// This component is only displayed to students (projects)
@Component({
  selector: 'f-project-groups',
  templateUrl: './project-groups.component.html',
  styleUrl: './project-groups.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ProjectGroupsComponent {
  @Input() unit: Unit;
  @Input() project: Project;
  @Input() selectedGroupSet: GroupSet;
}
