import { Component, Inject, Injectable, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Unit, TeachingPeriod, User, UserService, UnitService } from 'src/app/api/models/doubtfire-model';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { GlobalStateService } from 'src/app/projects/states/index/global-state.service';
import { Observable, map, startWith } from 'rxjs';

export interface TeachingPeriodUnitImportData {
  teachingPeriod: TeachingPeriod;
}

interface UnitImportData {
  unitCode: string;
  unitName?: string;
  sourceUnit: Unit;
  convenor: User;
  relatedUnits?: { value: Unit; text: string }[];
  done?: boolean;
  convenorFormControl: FormControl<User>;
  filteredStaff: Observable<User[]>;
}

@Injectable()
export class TeachingPeriodUnitImportService {
  constructor(public dialog: MatDialog) {}

  openImportUnitsDialog(teachingPeriod: TeachingPeriod): void {
    const dialogRef = this.dialog.open(TeachingPeriodUnitImportDialogComponent, {
      data: { teachingPeriod: teachingPeriod },
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }
}

/**
 * @title Dialog Overview
 * This dialog allows the user to enter a number of units to be rolled over into the a teaching period.
 */
@Component({
  selector: 'f-teaching-period-unit-import',
  templateUrl: 'teaching-period-unit-import.dialog.html',
  styleUrls: ['teaching-period-unit-import.dialog.scss'],
})
export class TeachingPeriodUnitImportDialogComponent implements OnInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<UnitImportData>;

  /**
   * The list of unit related data for the import.
   */
  public unitsToImport: UnitImportData[] = [];

  public dataSource = new MatTableDataSource(this.unitsToImport);

  public teachingStaff: User[];
  public filteredOptions: Observable<User[]>;

  public allUnits: Unit[];

  /**
   * A list of the codes to add - or an individual code
   */
  public codesToAdd: string = '';

  public displayedColumns: string[] = ['unitCode', 'sourceUnit', 'unitName', 'convenor', 'status', 'actions'];

  constructor(
    public dialogRef: MatDialogRef<TeachingPeriodUnitImportData>,
    private userService: UserService,
    private unitService: UnitService,
    private globalStateService: GlobalStateService,
    @Inject(MAT_DIALOG_DATA) public data: TeachingPeriodUnitImportData,
  ) {}

  ngOnInit(): void {
    // Listen for units to be loaded
    this.globalStateService.onLoad(() => {
      this.globalStateService.loadedUnits.values.subscribe((units) => (this.allUnits = units));
    });

    // Load all teaching staff
    this.userService.getTutors().subscribe((staff) => {
      this.teachingStaff = staff
        .filter((s) => ['Convenor', 'Admin'].includes(s.systemRole))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Load all units now we have the staff
      this.loadAllUnits();
    });
  }

  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }

  private _filter(name: string): User[] {
    const filterValue = name.toLowerCase();

    return this.teachingStaff.filter((option) => option.name.toLowerCase().includes(filterValue));
  }

  private loadAllUnits() {
    // Load all units
    this.unitService.query(undefined, { params: { include_in_active: true } }).subscribe({
      next: (success) => {
        return;
      },
      error: (failure) => {
        //TODO: Add alert
        console.log(failure);
      },
    });
  }

  public onCloseClick(): void {
    this.dialogRef.close();
  }

  public changeSourceUnit(value: UnitImportData, unit: Unit) {
    value.sourceUnit = unit;
    value.convenor = unit.mainConvenorUser;
  }

  public codeChange(code: string, value: UnitImportData) {
    value.relatedUnits = this.relatedUnits(code);
    value.sourceUnit = value.relatedUnits.length > 0 ? value.relatedUnits[0].value : null;
  }

  public relatedUnits(code: string): { value: Unit; text: string }[] {
    return this.allUnits
      .filter((u) => u.code.includes(code) || code.includes(u.code))
      .sort((a, b) => b.startDate.valueOf() - a.startDate.valueOf())
      .map((u) => {
        return { value: u, text: u.codeAndPeriod };
      });
  }

  public get teachigPeriod(): TeachingPeriod {
    return this.data.teachingPeriod;
  }

  public statusForUnit(value: UnitImportData): string {
    if (value.done) return 'Done!';
    if (value.done !== undefined && !value.done) return 'Error! - check log';
    if (!value.sourceUnit) return 'Create new unit';
    if (this.teachigPeriod.hasUnitLike(value.sourceUnit)) return 'Skip - Already in teaching period';
    if (this.unitsToImport.filter((u) => u.unitCode === value.sourceUnit.code).length > 1) {
      return 'Duplicate - Source unit appears twice';
    }

    return 'Awaiting Import';
  }

  /**
   * Remove a unit from the list to import.
   *
   * @param value The unit to remove from the list of units to import
   */
  public removeUnitToAdd(value: UnitImportData) {
    this.unitsToImport = this.unitsToImport.filter((u) => u.unitCode !== value.unitCode);
    // Ensure we use the new array object in the data source
    this.dataSource.data = this.unitsToImport;
    this.table.renderRows();
  }

  public addUnitsByCode() {
    const codes = this.codesToAdd.split(',').map((code) => code.trim());
    for (const code of codes) {
      if (code.length == 0) continue;
      if (this.unitsToImport.find((u) => u.unitCode === code)) continue;

      const relatedUnits = this.relatedUnits(code);
      const sourceUnit = relatedUnits.length > 0 ? relatedUnits[0].value : null;
      const formControl = new FormControl<User>(sourceUnit?.mainConvenor?.user || sourceUnit?.mainConvenorUser);

      this.unitsToImport.push({
        unitCode: code,
        sourceUnit: sourceUnit,
        convenor: sourceUnit?.mainConvenor?.user || sourceUnit?.mainConvenorUser,
        relatedUnits: relatedUnits,
        convenorFormControl: formControl,
        filteredStaff: formControl.valueChanges.pipe(
          startWith(''),
          map((value) => {
            const name = typeof value === 'string' ? value : value?.name;
            return name ? this._filter(name as string) : this.teachingStaff;
          }),
        ),
      });
    }

    this.codesToAdd = '';
    this.table.renderRows();
  }

  private importExistingUnit(unitToImport: UnitImportData, idx: number) {
    unitToImport.sourceUnit.rolloverTo({ teaching_period_id: this.data.teachingPeriod.id }).subscribe({
      next: (newUnit: Unit) => {
        unitToImport.done = true;
        // Employ the convenor
        if (unitToImport.convenor && unitToImport.convenor !== newUnit.mainConvenorUser) {
          newUnit.addStaff(unitToImport.convenor, 'Convenor').subscribe({
            next: (newRole) => {
              console.log(`Employed ${unitToImport.convenor.name} in ${newUnit.code}`);
              newUnit.changeMainConvenor(newRole).subscribe({
                next: () => {
                  console.log(`Set ${unitToImport.convenor.name} as main convenor in ${newUnit.code}`);
                },
                error: (failure) => {
                  console.log(failure);
                },
              });
            },
            error: (failure) => {
              console.log(failure);
            },
          });
        }
        this.importUnit(idx + 1);
      },
      error: (failure) => {
        console.log(failure);
        unitToImport.done = false;
        this.importUnit(idx + 1);
      },
    });
  }

  private createNewUnit(unitToImport: UnitImportData, idx: number) {
    this.unitService
      .create({
        unit: {
          code: unitToImport.unitCode,
          name: unitToImport.unitName,
          main_convenor_user_id: unitToImport.convenor?.id,
          teaching_period_id: this.data.teachingPeriod.id,
        },
      })
      .subscribe({
        next: (newUnit: Unit) => {
          unitToImport.done = true;
          this.importUnit(idx + 1);
        },
        error: (failure) => {
          unitToImport.done = false;
          console.log(failure);
          this.importUnit(idx + 1);
        },
      });
  }

  private importUnit(idx: number) {
    // Stop when past last unit to import
    if (idx >= this.unitsToImport.length) return;
    const unitToImport = this.unitsToImport[idx];

    const code = unitToImport.sourceUnit ? unitToImport.sourceUnit.code : unitToImport.unitCode;

    if (unitToImport.done !== undefined || this.teachigPeriod.hasUnitWithCode(code)) {
      // Skip units already done
      this.importUnit(idx + 1);
    } else {
      if (unitToImport.sourceUnit) {
        // Import existing units - if there was a source unit
        this.importExistingUnit(unitToImport, idx);
      } else {
        // Create a new unit
        this.createNewUnit(unitToImport, idx);
      }
    }
  }

  public doImport() {
    this.importUnit(0);
  }
}
