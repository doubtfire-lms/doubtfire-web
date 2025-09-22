import {Component, Input, OnInit} from '@angular/core';
import {AlertService} from 'src/app/common/services/alert.service';
import {UnitRoleService} from 'src/app/api/services/unit-role.service';
import {Unit} from 'src/app/api/models/unit';
import {User} from 'src/app/api/models/doubtfire-model';
import {UnitRole} from 'src/app/api/models/unit-role';

@Component({
  selector: 'unit-staff-editor',
  templateUrl: 'unit-staff-editor.component.html',
})
export class UnitStaffEditorComponent implements OnInit {
  @Input() unit: Unit;
  @Input() staff: User[];

  temp = [];
  users = [];
  unitStaff: UnitRole[];
  filteredStaff: User[] = []; // Filtered staff members
  searchTerm: string = ''; // Search term entered by the user

  // Inject services here
  constructor(
    private alertService: AlertService,
    private unitRoleService: UnitRoleService,
  ) {}

  ngOnInit(): void {
    // Subscribe to staff cache
    this.unit.staffCache.values.subscribe((staff: UnitRole[]) => {
      this.unitStaff = staff;
    });
  }

  /**
   * Changes the role of a staff member.
   *
   * @param UnitRole unitRole
   * @param number role_id
   *
   * @returns void
   */
  changeRole(unitRole: UnitRole, role_id: number) {
    unitRole.roleId = role_id;
    this.unitRoleService.update(unitRole).subscribe({
      next: (response) => this.alertService.success('Role changed', 2000),
      error: (response) => this.alertService.error(response, 6000),
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
    this.unit.changeMainConvenor(staff).subscribe({
      next: (response) => this.alertService.success('Main convenor changed', 2000),
      error: (response) => this.alertService.error(response, 6000),
    });
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
        staff.name.toLowerCase().includes(this.searchTerm.toLowerCase()) && // Find by name
        !this.unit.staff.find((listStaff) => staff.id === listStaff.user.id), // Not already assigned to the unit
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
    this.unitRoleService.delete(staff, {cache: this.unit.staffCache}).subscribe({
      next: (response) => this.alertService.success('Staff member removed', 2000),
      error: (response) => this.alertService.error(response, 6000),
    });
  }

  groupSetName(id: number) {
    this.unit.groupSetsCache.get(id).name || 'Individual Work';
  }
}
