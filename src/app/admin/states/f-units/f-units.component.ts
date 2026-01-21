import {Component, AfterViewInit, ViewChild, Input, OnInit} from '@angular/core';
import {Unit} from 'src/app/api/models/unit';
import {UnitRole} from 'src/app/api/models/unit-role';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {MatSort, Sort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {CreateNewUnitModal} from '../../modals/create-new-unit-modal/create-new-unit-modal.component';
import {Project} from 'src/app/api/models/project';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {User} from 'src/app/api/models/user/user';
import {UnitService} from 'src/app/api/services/unit.service';

type IUnitOrProject = {
  id: number;
  unit_code: string;
  code: string;
  name: string;
  unit_role?: string;
  teaching_period: string;
  start_date: Date;
  end_date: Date;
  active: boolean;
  user?: User;
  unit?: Unit;
  student?: User;
  matchesTutorialEnrolments?: (filter: string) => boolean;
  matchesGroup?: (filter: string) => boolean;
  matches: (filter: string) => boolean;
};

@Component({
  selector: 'f-units',
  templateUrl: './f-units.component.html',
  styleUrls: ['./f-units.component.scss'],
})
export class FUnitsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable, {static: false}) table: MatTable<Unit>;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  @Input({required: true}) mode: 'admin' | 'tutor' | 'student';

  displayedColumns: string[] = [
    'unit_code',
    'name',
    'unit_role',
    'teaching_period',
    'start_date',
    'end_date',
    'active',
  ];

  // the datasource of the table
  dataSource: MatTableDataSource<IUnitOrProject> = new MatTableDataSource([]);

  title: string;

  shouldShowUnitRoleColumn(): boolean {
    return this.mode === 'admin' || this.mode === 'tutor';
  }

  constructor(
    private createUnitDialog: CreateNewUnitModal,
    private globalStateService: GlobalStateService,
    private unitService: UnitService,
  ) {}

  units: IUnitOrProject[] = [];

  ngOnInit(): void {
    if (this.mode === 'tutor') {
      this.title = 'View all units you teach';

      this.globalStateService.onLoad(() => {
        this.globalStateService.loadedUnitRoles.values.subscribe({
          next: (unitRoles) => {
            this.dataSource.data = this.mapUnitOrProjectsToColumns(unitRoles);
          },
        });
      });
    }
    if (this.mode === 'admin') {
      this.title = 'Administer units';

      this.globalStateService.onLoad(() => {
        this.unitService.query(undefined, {params: {include_in_active: true}}).subscribe({
          next: (units) => {
            this.globalStateService.loadedUnits.values.subscribe(
              (loadedUnits) =>
                (this.dataSource.data = this.mapUnitOrProjectsToColumns(loadedUnits)),
            );
          },
        });

        this.globalStateService.loadedUnits.values.subscribe(
          (units) => (this.dataSource.data = this.mapUnitOrProjectsToColumns(units)),
        );
      });
    } else if (this.mode === 'student') {
      this.title = 'View all your units';

      this.globalStateService.onLoad(() => {
        this.globalStateService.currentUserProjects.values.subscribe(
          (projects) => (this.dataSource.data = this.mapUnitOrProjectsToColumns(projects)),
        );
      });
    }
  }

  mapUnitSourceToColumn(unitOrProject: Unit | Project | UnitRole): IUnitOrProject {
    if (unitOrProject instanceof Unit) {
      return {
        id: unitOrProject.id,
        unit_code: unitOrProject.code,
        code: unitOrProject.code,
        name: unitOrProject.name,
        unit_role: unitOrProject.myRole,
        teaching_period: unitOrProject.teachingPeriod?.name || 'Custom',
        start_date: unitOrProject.startDate,
        end_date: unitOrProject.endDate,
        active: unitOrProject.active,
        matches: unitOrProject.matches,
      };
    } else if (unitOrProject instanceof Project) {
      return {
        id: unitOrProject.id,
        unit_code: unitOrProject.unit.code,
        code: unitOrProject.unit.code,
        name: unitOrProject.unit.name,
        teaching_period: unitOrProject.unit.teachingPeriod?.name,
        start_date: unitOrProject.unit.startDate,
        end_date: unitOrProject.unit.endDate,
        active: unitOrProject.unit.active,
        student: unitOrProject.student,
        matchesTutorialEnrolments: unitOrProject.matchesTutorialEnrolments,
        matchesGroup: unitOrProject.matchesGroup,
        matches: (filter: string) => {
          return (
            unitOrProject.unit.matches(filter) ||
            unitOrProject.student.matches(filter) ||
            unitOrProject.matchesTutorialEnrolments(filter) ||
            unitOrProject.matchesGroup(filter)
          );
        },
      };
    } else if (unitOrProject instanceof UnitRole) {
      return {
        id: unitOrProject.unit.id,
        unit_code: unitOrProject.unit.code,
        code: unitOrProject.unit.code,
        name: unitOrProject.unit.name,
        unit_role: unitOrProject.role,
        teaching_period: unitOrProject.unit.teachingPeriod?.name,
        start_date: unitOrProject.unit.startDate,
        end_date: unitOrProject.unit.endDate,
        active: unitOrProject.unit.active,
        user: unitOrProject.user,
        unit: unitOrProject.unit,
        matches: unitOrProject.matches,
      };
    }
  }

  mapUnitOrProjectsToColumns(unitOrProjects: readonly (Unit | Project | UnitRole)[]) {
    // copy the array of units/projects/unitRole and map each unit through the mapUnitSourceToColumn function
    return [...unitOrProjects].map((unitOrProject) => this.mapUnitSourceToColumn(unitOrProject));
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data, filter: string) => data.matches(filter);
  }

  createUnit() {
    this.createUnitDialog.show();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private sortCompare(aValue: number | string, bValue: number | string, isAsc: boolean) {
    return (aValue < bValue ? -1 : 1) * (isAsc ? 1 : -1);
  }

  sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      switch (sort.active) {
        case 'unit_code':
          return this.sortCompare(a.unit_code, b.unit_code, sort.direction === 'asc');
        case 'name':
          return this.sortCompare(a.name, b.name, sort.direction === 'asc');
        case 'unit_role':
          return this.sortCompare(a.unit_role, b.unit_role, sort.direction === 'asc');
        case 'teaching_period': {
          return this.sortCompare(a.teaching_period, b.teaching_period, sort.direction === 'asc');
        }
        case 'start_date': {
          return this.sortCompare(
            a.start_date.getTime(),
            b.start_date.getTime(),
            sort.direction === 'asc',
          );
        }
        case 'end_date': {
          return this.sortCompare(
            a.end_date.getTime(),
            b.end_date.getTime(),
            sort.direction === 'asc',
          );
        }
        case 'active':
          return this.sortCompare(+!!a.active, +!!b.active, sort.direction === 'asc');
        default:
          return 0;
      }
    });
  }
}
