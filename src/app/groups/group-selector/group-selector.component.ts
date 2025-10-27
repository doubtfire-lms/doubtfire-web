import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Subscription} from 'rxjs';
import {Group, GroupSet, UnitRole, UserService, User} from 'src/app/api/models/doubtfire-model';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';
import {AlertService} from 'src/app/common/services/alert.service';
import {GroupService} from 'src/app/api/services/group.service';
import {EntityFormComponent} from 'src/app/common/entity-form/entity-form.component';
import {UntypedFormControl, Validators} from '@angular/forms';
@Component({
  selector: 'f-group-selector',
  templateUrl: './group-selector.component.html',
  styleUrls: ['./group-selector.component.scss'],
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
  @Input() showGroupSetSelector: boolean;
  @Input() onSelect: (group: Group) => void;

  displayedColumns: string[] = ['name', 'tutorial', 'capacity_adjustment', 'capacity', 'actions'];
  groups: Group[] = [];
  // dataSource = new MatTableDataSource();

  loading = false;

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

  ngOnInit(): void {
    // this.addGroup('test4!');
    console.log();
  }

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource();

    this.groupsSub = this.selectedGroupSet.groupsCache.values.subscribe((values) => {
      this.dataSource.data = values;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedGroupSet'] && this.selectedGroupSet) {
      console.log(this.selectedGroupSet);
      if (!this.dataSource) {
        this.dataSource = new MatTableDataSource();
      }
      this.groupsSub?.unsubscribe();
      this.groupsSub = this.selectedGroupSet.groupsCache.values.subscribe((values) => {
        this.dataSource.data = values;
      });
    }
  }

  addGroup(name: string) {
    if (this.unit.tutorials.length == 0) {
      return console.error(
        'Please ensure there is at least one tutorial before groups are created',
      );
    }
    let tutorialId = -1;
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
          console.log(group);
          this.selectedGroup = group;
        },
        error: (error) => {
          console.error(error);
        },
      });

    console.log(tutorialId);
  }

  selectGroup(group: Group) {
    if (this.project && !this.project.inGroup(group)) {
      // Return because we're in the student view
      return;
    }

    this.onSelect(group);
  }

  deleteGroup(event: Event, group: Group) {
    event.stopPropagation();

    this.groupService.delete(group, {cache: this.selectedGroupSet.groupsCache}).subscribe({
      next: () => {
        this.alertService.success('Deleted group', 3000);
        console.log(group.id, this.selectedGroup);
        if (group.id === this.selectedGroup?.id) {
          this.selectedGroup = null;
          this.selectGroup(null);
        }
      },
      error: (error) => {
        console.error(error);
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

  onSuccess(_response: Group, _isNew: boolean): void {
    this.groupsSub?.unsubscribe();
    this.groupsSub = this.selectedGroupSet.groupsCache.values.subscribe((values) => {
      this.dataSource.data = values;
    });
  }
}
