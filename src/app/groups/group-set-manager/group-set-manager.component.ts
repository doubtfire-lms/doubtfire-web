import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable, map, startWith} from 'rxjs';
import {Group, GroupSet, Project, Unit, UnitRole} from 'src/app/api/models/doubtfire-model';
import {GroupService} from 'src/app/api/services/group.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-group-set-manager',
  templateUrl: './group-set-manager.component.html',
  styleUrls: ['./group-set-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GroupSetManagerComponent implements OnInit {
  @Input() project: Project;
  @Input() unit: Unit;
  @Input() selectedGroupSet: GroupSet;
  @Input() showGroupSetSelector: boolean;
  @Input() unitRole: UnitRole;

  public selectedGroup: Group;

  editingGroupName = false;

  control = new FormControl('');
  projects: Project[] = [];
  filteredProjects: Observable<Project[]>;

  constructor(
    private groupService: GroupService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.filteredProjects = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value)),
    );
  }

  get groupSelectHandler() {
    return (group: Group) => this.newGroupSelected(group);
  }

  displayFn(project: Project): string {
    return project && project.student.name ? project.student.name : '';
  }

  newGroupSelected(group: Group) {
    if (this.selectedGroup) {
      this.selectedGroup.name = this.originalGroupName;
    }
    this.editingGroupName = false;
    this.selectedGroup = group;

    const students = this.unit.studentsForGroupTypeAhead(group) || [];
    this.projects = students.filter((project) => !group.projects.find((p) => project.id === p.id));

    this.originalGroupName = group.name;
  }

  private _filter(value: string | Project): Project[] {
    if (typeof value !== 'string') {
      return;
    }

    const filterValue = value.toLowerCase();
    return this.projects.filter(
      (project) =>
        project.student.name.toLowerCase().includes(filterValue.toLowerCase()) && // Find by name
        !this.selectedGroup.projects.find((p) => project.id === p.id), // Not already assigned to the group
    );
  }

  addMember(project: Project) {
    this.selectedGroup.addMember(project);
    this.control.setValue('');
  }

  private originalGroupName: string;
  startEditingGroupName() {
    this.originalGroupName = this.selectedGroup.name;
    this.editingGroupName = true;
  }

  stopEditinGroupName() {
    this.selectedGroup.name = this.originalGroupName;
    this.editingGroupName = false;
  }

  updateGroup() {
    this.editingGroupName = false;
    this.groupService
      .update(
        {
          unitId: this.unit.id,
          groupSetId: this.selectedGroup.groupSet.id,
          id: this.selectedGroup.id,
        },
        {
          entity: this.selectedGroup,
        },
      )
      .subscribe({
        next: () => {
          this.alertService.success('Successfully updated group', 3000);
        },
        error: (error) => {
          this.selectedGroup.name = this.originalGroupName;
          this.alertService.error(`Failed to update gorup: ${error}`, 6000);
        },
      });
  }
}
