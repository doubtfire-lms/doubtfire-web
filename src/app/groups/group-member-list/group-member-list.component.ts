import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Subscription} from 'rxjs';
import {Group, UnitRole} from 'src/app/api/models/doubtfire-model';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-group-member-list',
  templateUrl: './group-member-list.component.html',
  styleUrls: ['./group-member-list.component.scss'],
})
export class GroupMemberListComponent implements OnInit, OnChanges {
  @Input() unit: Unit;
  @Input() unitRole: UnitRole;
  @Input() project: Project;
  @Input() selectedGroup: Group;
  @Input() onMembersLoaded: () => void;

  loading = false;

  canRemoveMembers = false;

  displayedColumns: string[] = ['student_id', 'name', 'target_grade', 'actions'];
  groupMembers: Project[] = [];
  dataSource = new MatTableDataSource();

  private groupMembersSub?: Subscription;

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.groupMembersSub = this.selectedGroup.projectsCache.values.subscribe((values) => {
      this.dataSource.data = values;
    });
  }

  public removeMember(member: Project) {
    this.selectedGroup.removeMember(member);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedGroup'] && this.selectedGroup) {
      this.loading = true;
      this.selectedGroup.getMembers().subscribe({
        next: (members) => {
          this.loading = false;
          this.onMembersLoaded();
          this.canRemoveMembers =
            !!this.unitRole ||
            (this.selectedGroup.groupSet.allowStudentsToManageGroups && !this.selectedGroup.locked);

          this.dataSource.data = members;

          this.groupMembersSub?.unsubscribe();
          this.groupMembersSub = this.selectedGroup.projectsCache.values.subscribe((values) => {
            this.dataSource.data = values;
          });
        },
        error: (error) => {
          this.alertService.error(`Failed to fetch group members: ${error}`, 6000);
          this.selectedGroup = null;
        },
      });
    }
  }
}
