import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
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
export class GroupSetManagerComponent implements OnInit, OnChanges {
  @Input() project: Project;
  @Input() unit: Unit;
  @Input() selectedGroupSet: GroupSet;
  @Input() showGroupSetSelector: boolean;
  @Input() unitRole: UnitRole;

  public selectedGroup: Group;

  editingGroupName = false;

  readonly control = new FormControl('');
  projects: Project[] = [];
  filteredProjects: Observable<Project[]>;

  constructor(
    private readonly groupService: GroupService,
    private readonly alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.filteredProjects = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value)),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Groups belong to a group set within a unit, so a selected group cannot outlive
    // a change to either of them.
    if (changes['unit'] || changes['selectedGroupSet']) {
      // A rename in progress has already been applied to the cached group, so put it back
      // before letting go of it.
      if (this.editingGroupName && this.selectedGroup) {
        this.selectedGroup.name = this.originalGroupName;
      }

      this.selectedGroup = null;
      this.projects = [];
      this.editingGroupName = false;
      this.control.setValue('');
    }
  }

  get groupSelectHandler() {
    return (group: Group) => this.newGroupSelected(group);
  }

  displayFn(project: Project): string {
    return project?.student?.name ?? '';
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
        project.student?.name?.toLowerCase().includes(filterValue) && // Find by name
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
