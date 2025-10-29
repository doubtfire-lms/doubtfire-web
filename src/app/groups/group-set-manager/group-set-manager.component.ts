import {AfterViewInit, Component, Input, OnChanges, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {map, Observable, startWith} from 'rxjs';
import {Group, GroupSet, Project, Unit, UnitRole} from 'src/app/api/models/doubtfire-model';
import {EntityFormComponent} from 'src/app/common/entity-form/entity-form.component';

@Component({
  selector: 'f-group-set-manager',
  templateUrl: './group-set-manager.component.html',
  styleUrls: ['./group-set-manager.component.scss'],
})
// export class GroupSetManagerComponent extends EntityFormComponent<Group> {
export class GroupSetManagerComponent implements OnInit {
  @Input() project: Project;
  @Input() unit: Unit;
  @Input() selectedGroupSet: GroupSet;
  @Input() showGroupSetSelector: boolean;
  @Input() unitRole: UnitRole;

  public selectedGroup: Group;

  ngOnInit(): void {
    this.filteredProjects = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value)),
    );
  }
  // students: Pro

  control = new FormControl('');
  projects: Project[] = [];
  filteredProjects: Observable<Project[]>;

  get groupSelectHandler() {
    return (group: Group) => this.newGroupSelected(group);
  }

  displayFn(project: Project): string {
    return project && project.student.name ? project.student.name : '';
  }

  newGroupSelected(group: Group) {
    this.selectedGroup = group;
    const students = this.unit.studentsForGroupTypeAhead(group) || [];
    this.projects = students.filter((project) => !group.projects.find((p) => project.id === p.id));
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

  groupMembersLoaded() {}

  addMember(project: Project) {
    this.selectedGroup.addMember(project);
    this.control.setValue('');
  }
}
