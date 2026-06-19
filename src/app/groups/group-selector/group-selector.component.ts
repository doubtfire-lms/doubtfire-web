import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {UntypedFormControl, Validators} from '@angular/forms';
import {MatButtonToggleChange} from '@angular/material/button-toggle';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {Subscription} from 'rxjs';
import {Group, GroupSet, UnitRole, UserService} from 'src/app/api/models/doubtfire-model';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';
import {GroupService} from 'src/app/api/services/group.service';
import {EntityFormComponent} from 'src/app/common/entity-form/entity-form.component';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-group-selector',
  templateUrl: './group-selector.component.html',
  styleUrls: ['./group-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GroupSelectorComponent
  extends EntityFormComponent<Group>
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() unit: Unit;
  @Input() unitRole: UnitRole;
  @Input() project: Project;
  @Input() selectedGroup: Group;
  @Input() selectedGroupSet: GroupSet;
  @Input() onSelect: (group: Group) => void;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['name', 'tutorial', 'capacity_adjustment', 'capacity', 'actions'];
  public groups: Group[] = [];

  public newGroupName: string;
  public staffTutorialFilter: 'all' | 'mine' = 'all';

  private groupsSub?: Subscription;

  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private alertService: AlertService,
  ) {
    super(
      {
        name: new UntypedFormControl('', [Validators.required]),
        tutorial: new UntypedFormControl(null, [Validators.required]),
        capacityAdjustment: new UntypedFormControl('', [Validators.required]),
      },
      'Group',
    );
  }

  public get showGroupSetSelector() {
    return this.unit.groupSets.length > 1;
  }

  ngOnInit(): void {
    if (this.unit.groupSets.length > 0) {
      this.selectedGroupSet = this.unit.groupSets[0];
    }
  }

  selectGroupSet(groupSet: GroupSet) {
    this.selectedGroupSet = groupSet;
    this.refreshGroups();
  }

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource();
    this.dataSource.paginator = this.paginator;

    if (this.unit.groupSets.length > 0) {
      this.selectedGroupSet = this.unit.groupSets[0];
    }

    this.refreshGroups();
  }

  refreshGroups() {
    this.groupsSub?.unsubscribe();
    this.groupsSub = this.selectedGroupSet?.groupsCache.values.subscribe((values) => {
      this.groups = [...values];
    });
    this.applyFilters();
  }

  onGroupNameChange() {
    this.applyFilters();
  }

  applyFilters() {
    const filteredGroups = this.groups
      .filter(
        (g) =>
          this.staffTutorialFilter === 'all' ||
          (this.unitRole && g.tutorial.tutor.id === this.unitRole.user.id),
      )
      .filter(
        (g) => !this.newGroupName || g.name.toLowerCase().includes(this.newGroupName.toLowerCase()),
      );

    this.dataSource.data = filteredGroups.sort((a, b) => a.name.localeCompare(b.name));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedGroupSet'] && this.selectedGroupSet) {
      if (!this.dataSource) {
        this.dataSource = new MatTableDataSource();
      }
      this.refreshGroups();
    }
  }

  onTutorialFilterChange(event: MatButtonToggleChange) {
    this.staffTutorialFilter = event.value;
    this.applyFilters();
  }

  addGroup(name: string) {
    if (this.unit.tutorials.length == 0) {
      this.alertService.error(
        `Please ensure there is at least one tutorial before groups are created`,
        6000,
      );
      return;
    }
    let tutorialId;
    if (this.project) {
      tutorialId = this.project.tutorials[0].id || this.unit.tutorials[0].id;
    } else {
      const tutorName = this.unitRole?.user.name || this.userService.currentUser.name;
      tutorialId =
        this.unit.tutorials.find((t) => t.tutor?.name === tutorName)?.id ??
        this.unit.tutorials[0].id;
    }

    this.groupService
      .create(
        {
          unitId: this.unit.id,
          groupSetId: this.selectedGroupSet.id,
        },
        {
          cache: this.selectedGroupSet.groupsCache,
          constructorParams: this.unit,
          body: {
            group: {
              name,
              tutorial_id: tutorialId,
            },
          },
        },
      )
      .subscribe({
        next: (group) => {
          this.alertService.success('Successfully created group', 3000);
          this.selectedGroup = group;
          this.newGroupName = '';
          this.applyFilters();
        },
        error: (error) => {
          this.alertService.error(`Failed to create group: ${error}`);
        },
      });
  }

  isPartOfGroup(project: Project, group: Group) {
    return group && project?.inGroup(group);
  }

  joinGroup(group: Group) {
    if (!this.project) {
      return;
    }

    if (this.isPartOfGroup(this.project, group)) {
      this.alertService.error('You are already member of this group');
      return;
    }

    group.addMember(this.project, () => {
      this.selectedGroup = group;
      this.selectGroup(group);
    });
  }

  selectGroup(group: Group) {
    if (this.project && !this.project.inGroup(group)) {
      // Return because we're in the student view
      return;
    }

    if (this.editing(group)) {
      return;
    }

    this.selectedGroup = group;
    this.onSelect(group);
  }

  deleteGroup(event: Event, group: Group) {
    event.stopPropagation();

    this.groupService.delete(group, {cache: this.selectedGroupSet.groupsCache}).subscribe({
      next: () => {
        this.alertService.success('Deleted group', 3000);
        if (group.id === this.selectedGroup?.id) {
          this.selectedGroup = null;
          this.selectGroup(null);
        }
      },
      error: (error) => {
        this.alertService.error(`Failed to delete group: ${error}`, 6000);
      },
    });
  }

  toggleLocked(event: Event, group: Group) {
    event.stopPropagation();

    const originalLockedState = group.locked;
    group.locked = !group.locked;

    this.groupService.update(group).subscribe({
      next: (success) => {
        group.locked = success.locked;
        this.alertService.success(`Group has been ${!group.locked ? 'un' : ''}locked`, 3000);
      },
      error: (error) => {
        this.alertService.error(`Failed to ${!group.locked ? 'un' : ''}lock group: ${error}`, 6000);
        group.locked = originalLockedState;
      },
    });
  }

  startEditGroup(event: Event, group: Group) {
    event.stopPropagation();
    this.flagEdit(group);
  }

  cancelEditGroup(event: Event) {
    event.stopPropagation();
    this.cancelEdit();
  }

  saveEdit(event: Event) {
    event.stopPropagation();
    super.submit(this.groupService, this.alertService, this.onSuccess.bind(this));
    this.cancelEdit();
  }

  onSuccess(): void {
    this.refreshGroups();
  }
}
