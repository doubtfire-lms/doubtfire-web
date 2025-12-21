import {Component, Input} from '@angular/core';
import {GroupSet, Project} from 'src/app/api/models/doubtfire-model';
import { Observable } from 'rxjs';

// This component is only displayed to students (projects)
@Component({
  selector: 'f-project-groups',
  templateUrl: './project-groups.component.html',
  styleUrl: './project-groups.component.scss',
})
export class ProjectGroupsComponent {
  @Input() project$: Observable<Project>;
  @Input() selectedGroupSet: GroupSet;
}
