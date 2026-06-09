import {GroupSet, Project} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {Component, Input} from '@angular/core';

// This component is only displayed to students (projects)
@Component({
  selector: 'f-project-groups',
  templateUrl: './project-groups.component.html',
  styleUrl: './project-groups.component.scss',
  standalone: false,
})
export class ProjectGroupsComponent {
  @Input() unit: Unit;
  @Input() project: Project;
  @Input() selectedGroupSet: GroupSet;
}
