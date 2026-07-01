import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {MatButtonToggleChange} from '@angular/material/button-toggle';
import {MatSelectChange} from '@angular/material/select';
import {MatTableDataSource} from '@angular/material/table';
import {Tutorial, User} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {UnitRole} from 'src/app/api/models/unit-role';
import {UnitRoleService} from 'src/app/api/services/unit-role.service';
import {UserService} from 'src/app/api/services/user.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {
  CsvResult,
  CsvResultModalService,
  CsvRow,
} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import {TutorNotesModalService} from 'src/app/common/modals/tutor-notes-modal/tutor-notes-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {BulkImportStaffModalService} from './bulk-import-staff-modal/bulk-import-staff-modal.service';

@Component({
  selector: 'unit-staff-editor',
  templateUrl: 'unit-staff-editor.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitStaffEditorComponent implements OnInit {
  @Input() unit: Unit;
  @Input() staff: User[];

  temp = [];
  users = [];
  unitStaff: UnitRole[];
  filteredStaff: User[] = []; // Filtered staff members
  searchTerm: string = ''; // Search term entered by the user

  displayedColumns: string[] = [
    'name',
    'role',
    'main-convenor',
    'observer-only',
    'overflow-marking',
    'mentor',
    'actions',
  ];
  dataSource: MatTableDataSource<UnitRole> = new MatTableDataSource();

  // Inject services here
  constructor(
    private alertService: AlertService,
    private unitRoleService: UnitRoleService,
    private userService: UserService,
    private confirmationModalService: ConfirmationModalService,
    private tutorNotesModal: TutorNotesModalService,
    private bulkImportStaffModal: BulkImportStaffModalService,
    private csvResultModal: CsvResultModalService,
  ) {}

  ngOnInit(): void {
    // Subscribe to staff cache
    this.unit.staffCache.values.subscribe((staff: UnitRole[]) => {
      this.unitStaff = staff;
      this.dataSource.data = staff;
    });
  }

  onRoleChange(unitRole: UnitRole, event: MatButtonToggleChange) {
    const role = event.value;
    if (role !== 'Tutor' && role !== 'Convenor') {
      return;
    }
    const roleId = role === 'Tutor' ? 2 : 3; // map however you like
    this.changeRole(unitRole, roleId, role);
  }
  /**
   * Changes the role of a staff member.
   *
   * @param UnitRole unitRole
   * @param number role_id
   *
   * @returns void
   */
  changeRole(unitRole: UnitRole, roleId: number, role: string) {
    const previousRoleId = unitRole.roleId;
    const previousRole = unitRole.role;

    unitRole.roleId = roleId;
    unitRole.role = role;
    this.unitRoleService.update(unitRole).subscribe({
      next: () => this.alertService.success('Role changed', 2000),
      error: (response) => {
        // Revert changes on error
        unitRole.roleId = previousRoleId;
        unitRole.role = previousRole;
        this.alertService.error(response, 6000);
      },
    });
  }

  toggleObserverOnly(unitRole: UnitRole) {
    const previousValue = unitRole.observerOnly;
    unitRole.observerOnly = !unitRole.observerOnly;
    unitRole.roleId = unitRole.role === 'Tutor' ? 2 : 3;
    this.unitRoleService.update(unitRole).subscribe({
      next: () => this.alertService.success('Observer status updated', 2000),
      error: (response) => {
        // Revert changes on error
        unitRole.observerOnly = previousValue;
        this.alertService.error(response, 6000);
      },
    });
  }

  toggleCanOverflowMark(unitRole: UnitRole) {
    const previousValue = unitRole.canMarkOverflowTasks;
    unitRole.canMarkOverflowTasks = !unitRole.canMarkOverflowTasks;
    unitRole.roleId = unitRole.role === 'Tutor' ? 2 : 3;
    this.unitRoleService.update(unitRole).subscribe({
      next: () => this.alertService.success('Overflow marking permissions updated', 2000),
      error: (response) => {
        // Revert changes on error
        unitRole.canMarkOverflowTasks = previousValue;
        this.alertService.error(response, 6000);
      },
    });
  }

  selectMentor(unitRole: UnitRole, event: MatSelectChange) {
    const previousValue = unitRole.mentorId;
    unitRole.mentorId = event.value;
    unitRole.roleId = unitRole.role === 'Tutor' ? 2 : 3;

    this.unitRoleService.update(unitRole).subscribe({
      next: () => this.alertService.success('Mentor updated', 2000),
      error: (response) => {
        // Revert changes on error
        unitRole.mentorId = previousValue;
        this.alertService.error(response, 6000);
      },
    });
  }
  /**
   * Changes who the `Main Convenor` of the unit is.
   *
   * @param UnitRole staff
   *
   * @returns void
   */
  changeMainConvenor(staff: UnitRole) {
    this.confirmationModalService.show(
      'Set Main Convenor',
      `Do you want to make ${staff.user.name} the main convenor for this unit?`,
      () => {
        this.unit.changeMainConvenor(staff).subscribe({
          next: (_response) => this.alertService.success('Main convenor changed', 2000),
          error: (response) => this.alertService.error(response, 6000),
        });
      },
    );
  }

  /**
   * Adds a staff member to the unit.
   *
   * @param User selectedStaff
   *
   * @returns void
   */
  addSelectedStaff(selectedStaff: User) {
    if (selectedStaff?.id) {
      this.unit.addStaff(selectedStaff).subscribe({
        next: () => {
          this.alertService.success('Staff member added', 2000);
          this.searchTerm = ''; // Clear the input field
          this.filterStaffList(); // Refilter the list
        },
        error: (response) => this.alertService.error(response, 6000),
      });
    } else {
      this.alertService.error(
        'Unable to add staff member. Ensure they have a tutor or convenor account in User admin first',
      );
    }
  }

  openBulkImportModal() {
    this.bulkImportStaffModal
      .show()
      .afterClosed()
      .subscribe((emailList) => {
        if (!emailList) {
          return;
        }

        this.bulkImportStaffFromEmailList(emailList);
      });
  }

  /**
   * Used in filtering the staff list. The `searchTerm` is bound to the auto-complete input in this class's template.
   *
   * @returns void
   */
  filterStaffList(): void {
    // `this.searchTerm` holds the selected staff member object from the dropdown OR the auto-complete input searchTerm (never at the same time).
    // Thus, check the type here and exit early if string filtering is not needed.
    if (typeof this.searchTerm !== 'string') {
      return;
    }
    this.filteredStaff = this.staff.filter(
      (staff) =>
        staff.matches(this.searchTerm.toLowerCase()) && // Find by name
        !this.unit.staff.find((listStaff) => staff.id === listStaff.user.id) && // Not already assigned to the unit
        // Filter out students from the staff search
        // NOTE: This is a hotfix to an issue where loading the inbox populates this.staff with students...
        staff.isStaff,
    );
  }

  /**
   * Generates a human-readable name made up of the passed-in staff member's `first` and `last` names.
   *
   * @param User staff
   *
   * @returns void
   */
  displayStaffName(staff: User): string {
    return staff ? staff.name : '';
  }

  /**
   * Removes a staff member from the unit.
   *
   * @param UnitRole staff
   *
   * @returns void
   */
  removeStaff(staff: UnitRole) {
    const assignedTutorials = this.tutorialsForUnitRole(staff);

    if (assignedTutorials.length > 0) {
      const targetRole = this.reassignmentTargetFor(staff);

      if (!targetRole) {
        this.alertService.error(
          'Unable to reassign tutorials because there is no valid staff member to receive them.',
          6000,
        );
        return;
      }

      const tutorialList = assignedTutorials.map((tutorial) => tutorial.abbreviation).join(', ');

      this.confirmationModalService.show(
        'Reassign Tutorials',
        `You cannot remove ${staff.user.name} from the unit as they tutor the following tutorials: ${tutorialList}.`,
        () => {
          this.unitRoleService
            .delete(staff, {
              cache: this.unit.staffCache,
              params: {reassign_to_unit_role_id: targetRole.id},
            })
            .subscribe({
              next: () => {
                assignedTutorials.forEach((tutorial) => {
                  tutorial.tutor = targetRole.user;
                });
                this.alertService.success('Staff member removed and tutorials reassigned', 2000);
              },
              error: (response) => this.alertService.error(response, 6000),
            });
        },
        undefined,
        'Reassign to me',
        'Cancel',
      );
      return;
    }

    this.confirmationModalService.show(
      'Remove staff member',
      `Are you sure you want to remove ${staff.user.name} from ${this.unit.code} ${this.unit.name}?`,
      () => {
        this.unitRoleService.delete(staff, {cache: this.unit.staffCache}).subscribe({
          next: () => this.alertService.success('Staff member removed', 2000),
          error: (response) => this.alertService.error(response, 6000),
        });
      },
    );
  }

  private tutorialsForUnitRole(unitRole: UnitRole): Tutorial[] {
    return this.unit.tutorials.filter((tutorial) => tutorial.tutor?.id === unitRole.user.id);
  }

  private reassignmentTargetFor(unitRole: UnitRole): UnitRole | undefined {
    const currentUserRole = this.unit.staff.find(
      (staffRole) =>
        staffRole.user.id === this.userService.currentUser.id && staffRole.id !== unitRole.id,
    );

    if (currentUserRole) {
      return currentUserRole;
    }

    if (this.unit.mainConvenor?.id && this.unit.mainConvenor.id !== unitRole.id) {
      return this.unit.mainConvenor;
    }

    return undefined;
  }

  groupSetName(id: number) {
    return this.unit.groupSetsCache.get(id).name || 'Individual Work';
  }

  openTutorNotes(unitRole: UnitRole) {
    unitRole.unit = this.unit; // HACK: ensure unit is mapped within the UnitRole
    this.tutorNotesModal.show(null, unitRole);
  }

  private bulkImportStaffFromEmailList(emailList: string): void {
    const parsedEmails = this.parseEmailList(emailList);

    if (parsedEmails.length === 0) {
      this.alertService.error('Please enter at least one valid email address.', 6000);
      return;
    }

    const existingStaffEmails: Set<string> = new Set(
      this.unit.staff
        .map((unitRole) => unitRole.user.email?.trim().toLowerCase())
        .filter((email): email is string => !!email),
    );
    const staffByEmail = new Map(
      this.staff
        .filter((staff) => staff.isStaff && staff.email)
        .map((staff) => [staff.email.trim().toLowerCase(), staff] as const),
    );

    const alreadyAssignedEmails = parsedEmails.filter((email) => existingStaffEmails.has(email));
    const matchedUsers = parsedEmails
      .filter((email) => !existingStaffEmails.has(email))
      .map((email) => staffByEmail.get(email))
      .filter((staff): staff is User => !!staff);
    const unmatchedEmails = parsedEmails.filter(
      (email) => !existingStaffEmails.has(email) && !staffByEmail.has(email),
    );
    const ignoredRows = alreadyAssignedEmails.map((email) =>
      this.csvResultRow(email, 'Staff member is already assigned to this unit'),
    );
    const unmatchedRows = unmatchedEmails.map((email) =>
      this.csvResultRow(email, 'No matching staff user was found'),
    );

    if (matchedUsers.length === 0) {
      this.csvResultModal.show(
        'Bulk staff import results',
        this.csvResultResponse([], unmatchedRows, ignoredRows),
      );
      return;
    }

    this.addStaffUsersSequentially(matchedUsers, [], [], ({addedEmails, failedEmails}) => {
      const successRows = addedEmails.map((email) =>
        this.csvResultRow(email, 'Staff member added'),
      );
      const failedRows = failedEmails.map((email) =>
        this.csvResultRow(email, 'Could not add staff member to this unit'),
      );

      this.csvResultModal.show(
        'Bulk staff import results',
        this.csvResultResponse(successRows, [...unmatchedRows, ...failedRows], ignoredRows),
      );
    });
  }

  private addStaffUsersSequentially(
    users: User[],
    addedEmails: string[],
    failedEmails: string[],
    onComplete: (result: {addedEmails: string[]; failedEmails: string[]}) => void,
  ): void {
    if (users.length === 0) {
      onComplete({addedEmails, failedEmails});
      return;
    }

    const [nextUser, ...remainingUsers] = users;

    this.unit.addStaff(nextUser).subscribe({
      next: () => {
        addedEmails.push(nextUser.email);
        this.addStaffUsersSequentially(remainingUsers, addedEmails, failedEmails, onComplete);
      },
      error: () => {
        failedEmails.push(nextUser.email);
        this.addStaffUsersSequentially(remainingUsers, addedEmails, failedEmails, onComplete);
      },
    });
  }

  private parseEmailList(emailList: string): string[] {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return Array.from(
      new Set(
        emailList
          .split(/\r?\n/)
          .map((email) => email.trim().toLowerCase())
          .filter((email) => emailPattern.test(email)),
      ),
    );
  }

  private csvResultRow(row: string, message: string): CsvRow {
    return {row, message};
  }

  private csvResultResponse(success: CsvRow[], errors: CsvRow[], ignored: CsvRow[]): CsvResult {
    return {success, errors, ignored};
  }
}
