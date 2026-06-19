import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {GroupSet, Unit, UnitRole} from 'src/app/api/models/doubtfire-model';
import {GroupSetService} from 'src/app/api/services/group-set.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {
  CsvResult,
  CsvResultModalService,
} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

interface GroupSetEditModel {
  name: string;
  capacity: number | null;
  allowStudentsToCreateGroups: boolean;
  allowStudentsToManageGroups: boolean;
  keepGroupsInSameClass: boolean;
}

@Component({
  selector: 'f-unit-group-set-editor',
  templateUrl: './unit-group-set-editor.component.html',
  styleUrls: ['./unit-group-set-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitGroupSetEditorComponent implements OnInit {
  @Input() unit: Unit;
  @Input() unitRole: UnitRole;

  public selectedGroupSet: GroupSet | null = null;
  public showHelp = false;
  public isGroupCSVUploading: boolean | null = null;

  // Keep `file` key to preserve backend form field name used in legacy implementation.
  public groupCSV = {
    file: {name: 'Group CSV', type: 'csv'},
  };

  public editingGroupSetId: number | null = null;
  public editingGroupSetModel: GroupSetEditModel | null = null;

  public studentStaffOptions = [
    {value: true, text: 'Staff and Students'},
    {value: false, text: 'Staff Only'},
  ];

  public tutorialOptions = [
    {value: true, text: 'Same Tutorial'},
    {value: false, text: 'Any Tutorial'},
  ];

  constructor(
    private groupSetService: GroupSetService,
    private alertService: AlertService,
    private fileDownloaderService: FileDownloaderService,
    private csvResultModal: CsvResultModalService,
  ) {}

  ngOnInit(): void {
    if (this.unit?.groupSets?.length > 0) {
      this.selectGroupSet(this.unit.groupSets[0]);
    }
  }

  addGroupSet(): void {
    const groupSet = this.groupSetService.createInstanceFrom({}, this.unit);
    const gsCount = this.unit.groupSets.length;
    groupSet.name = gsCount === 0 ? 'Group Work' : `Group Work Set ${gsCount + 1}`;

    this.groupSetService.store(groupSet, {cache: this.unit.groupSetsCache}).subscribe({
      next: (createdGroupSet) => {
        this.alertService.success('Group set created.', 2000);
        this.selectGroupSet(createdGroupSet ?? groupSet);
      },
      error: (message) => this.alertService.error(`Failed to create group set. ${message}`, 6000),
    });
  }

  startEditGroupSet(groupSet: GroupSet): void {
    this.editingGroupSetId = groupSet.id;
    this.editingGroupSetModel = {
      name: groupSet.name,
      allowStudentsToCreateGroups: !!groupSet.allowStudentsToCreateGroups,
      allowStudentsToManageGroups: !!groupSet.allowStudentsToManageGroups,
      keepGroupsInSameClass: !!groupSet.keepGroupsInSameClass,
      capacity: groupSet.capacity ?? null,
    };
  }

  cancelEditGroupSet(): void {
    this.editingGroupSetId = null;
    this.editingGroupSetModel = null;
  }

  saveGroupSet(groupSet: GroupSet): void {
    if (!this.editingGroupSetModel) {
      return;
    }

    groupSet.name = this.editingGroupSetModel.name;
    groupSet.allowStudentsToCreateGroups = this.editingGroupSetModel.allowStudentsToCreateGroups;
    groupSet.allowStudentsToManageGroups = this.editingGroupSetModel.allowStudentsToManageGroups;
    groupSet.keepGroupsInSameClass = this.editingGroupSetModel.keepGroupsInSameClass;
    groupSet.capacity = this.editingGroupSetModel.capacity;

    this.groupSetService.update(groupSet).subscribe({
      next: () => {
        this.alertService.success('Group set updated.', 2000);
        this.cancelEditGroupSet();
      },
      error: (message) => this.alertService.error(`Failed to update group set. ${message}`, 6000),
    });
  }

  toggleLocked(groupSet: GroupSet): void {
    const originalLockedState = groupSet.locked;
    groupSet.locked = !groupSet.locked;

    this.groupSetService.update(groupSet).subscribe({
      next: (response) => {
        this.alertService.success(
          `${response.locked ? 'Locked' : 'Unlocked'} ${groupSet.name}`,
          2000,
        );
      },
      error: (message) => {
        groupSet.locked = originalLockedState;
        this.alertService.error(
          `Failed to ${groupSet.locked ? 'unlock' : 'lock'} ${groupSet.name}. ${message}`,
          6000,
        );
      },
    });
  }

  removeGroupSet(groupSet: GroupSet): void {
    this.groupSetService.delete(groupSet, {cache: this.unit.groupSetsCache}).subscribe({
      next: () => {
        if (groupSet === this.selectedGroupSet) {
          this.selectGroupSet(this.unit.groupSets[0] ?? null);
        }
        this.alertService.success('Group set deleted.', 2000);
      },
      error: (message) => this.alertService.error(`Failed to delete group set. ${message}`, 6000),
    });
  }

  selectGroupSet(groupSet: GroupSet | null): void {
    this.selectedGroupSet = groupSet;
    if (this.editingGroupSetId && groupSet?.id !== this.editingGroupSetId) {
      this.cancelEditGroupSet();
    }
  }

  groupCSVUploadUrl(): string | undefined {
    return this.selectedGroupSet?.groupCSVUploadUrl();
  }

  groupStudentCSVUploadUrl(): string | undefined {
    return this.selectedGroupSet?.groupStudentCSVUploadUrl();
  }

  onGroupCSVSuccess(response: CsvResult): void {
    this.csvResultModal.show('Group CSV upload results.', response);
    this.selectGroupSet(this.selectedGroupSet);
  }

  onGroupCSVComplete(): void {
    this.isGroupCSVUploading = null;
  }

  downloadGroupCSV(): void {
    if (!this.selectedGroupSet) {
      return;
    }

    this.fileDownloaderService.downloadFile(
      this.selectedGroupSet.groupCSVUploadUrl(),
      `${this.unit.code}-group-sets.csv`,
    );
  }

  downloadGroupStudentCSV(): void {
    if (!this.selectedGroupSet) {
      return;
    }

    this.fileDownloaderService.downloadFile(
      this.selectedGroupSet.groupStudentCSVUploadUrl(),
      `${this.unit.code}-${this.selectedGroupSet.name}-students.csv`,
    );
  }
}
