import {Component, Input} from '@angular/core';
import {Group} from 'src/app/api/models/doubtfire-model';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';

@Component({
  selector: 'f-group-member-list',
  templateUrl: './group-member-list.component.html',
  styleUrls: ['./group-member-list.component.scss'],
})
export class GroupMemberListComponent {
  @Input() unit: Unit;
  @Input() unitRole: string;
  @Input() project: Project;
  @Input() selectedGroup: Group;
  @Input() onMembersLoad: () => void;
}
