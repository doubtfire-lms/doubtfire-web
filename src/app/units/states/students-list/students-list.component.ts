import {ExtendedModule} from 'ng-flex-layout/extended';
import {NgxSkeletonLoaderComponent} from 'ngx-skeleton-loader';
import {NgStyle} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatButton} from '@angular/material/button';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortHeader, Sort} from '@angular/material/sort';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import {MatTooltip} from '@angular/material/tooltip';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, Subscription, finalize, first, of} from 'rxjs';
import {
  Project,
  ProjectService,
  TaskService,
  TaskStatusEnum,
  Unit,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {GradeIconComponent} from '../../../common/grade-icon/grade-icon.component';
import {UserIconComponent} from '../../../common/user-icon/user-icon.component';
import {UnitStudentEnrolmentModalService} from '../../modals/unit-student-enrolment-modal/unit-student-enrolment-modal.service';
import {StudentCampusSelectComponent} from '../edit/directives/unit-students-editor/student-campus-select/student-campus-select.component';
import {StudentTutorialSelectComponent} from '../edit/directives/unit-students-editor/student-tutorial-select/student-tutorial-select.component';

// State for both convenors and tutors to access student list
@Component({
  selector: 'f-students-list',
  templateUrl: './students-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatAutocompleteTrigger,
    FormsModule,
    MatAutocomplete,
    MatOption,
    MatButtonToggleGroup,
    MatButtonToggle,
    NgxSkeletonLoaderComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    UserIconComponent,
    MatSortHeader,
    MatTooltip,
    ExtendedModule,
    NgStyle,
    GradeIconComponent,
    MatIcon,
    StudentCampusSelectComponent,
    StudentTutorialSelectComponent,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatNoDataRow,
    MatButton,
    MatPaginator,
  ],
})
export class StudentsListComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() unit$: Observable<Unit>;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = [
    'avatar',
    'username',
    'name',
    'stats',
    'grade',
    'portfolio',
    'similarity',
    'campus',
    'tutorial',
  ];
  dataSource: MatTableDataSource<Project> = new MatTableDataSource([]);

  searchText = '';
  staffFilter: 'all' | 'mine' = 'all';
  filteredSuggestions: string[] = [];
  loadingStudents = true;
  unit: Unit;

  private subscriptions: Subscription[] = [];
  public sortState: Sort = {active: 'name', direction: 'asc'};

  constructor(
    private enrolModal: UnitStudentEnrolmentModalService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private taskService: TaskService,
    private projectService: ProjectService,
  ) {}

  ngOnInit(): void {
    this.unit$ = this.unit$ ?? of(this.route.parent.snapshot.data.unit);
    this.subscriptions.push(
      this.unit$?.pipe(first()).subscribe((unit) => {
        if (!unit) {
          this.loadingStudents = false;
          return;
        }

        this.unit = unit;
        this.staffFilter = unit.myRole === 'Tutor' ? 'mine' : 'all';

        this.subscriptions.push(
          this.unit.studentCache.values.subscribe(() => {
            this.updateSuggestions();
            this.updateDataSource();
          }),
        );

        this.updateSuggestions();
        this.updateDataSource();
        this.projectService
          .loadStudents(this.unit)
          .pipe(
            first(),
            finalize(() => {
              this.loadingStudents = false;
            }),
          )
          .subscribe();
      }),
    );
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.updateDataSource();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public onSearchChange(): void {
    this.updateSuggestions();
    this.updateDataSource(true);
  }

  public setStaffFilter(filter: 'all' | 'mine'): void {
    this.staffFilter = filter;
    this.updateDataSource(true);
  }

  public sortTableData(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      this.sortState = {active: 'name', direction: 'asc'};
    } else {
      this.sortState = sort;
    }

    this.updateDataSource();
  }

  public viewStudent(project: Project): void {
    this.router.navigate(['/projects', project.id, 'dashboard']);
  }

  public showEnrolModal(): void {
    this.enrolModal.show(this.unit);
  }

  public exportCsv(): void {
    const rows = [
      this.csvHeader(),
      ...this.filteredProjects().map((project) => this.csvRow(project)),
    ];
    const csvContent = rows
      .map((row) => row.map((value) => this.csvEscape(value)).join(','))
      .join('\n');
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = 'student-project-export.csv';
    link.click();

    URL.revokeObjectURL(link.href);
  }

  public statusColor(status: TaskStatusEnum): string {
    return this.taskService.statusColors.get(status) || '#cbd5e1';
  }

  public statusLabel(status: TaskStatusEnum): string {
    return this.taskService.statusLabels.get(status) || status;
  }

  public showBarLabel(value: number): boolean {
    return Number.isFinite(value) && value >= 10;
  }

  private updateSuggestions(): void {
    const searchValue = this.searchText.trim().toLowerCase();
    const suggestions = Array.from(new Set(this.unit?.studentFilterTypeAheadData ?? []));

    this.filteredSuggestions = suggestions
      .filter((item) => !searchValue || item.toLowerCase().includes(searchValue))
      .slice(0, 8);
  }

  private updateDataSource(resetPagination: boolean = false): void {
    if (!this.paginator) {
      return;
    }

    const students = this.filteredProjects();

    this.dataSource.data = students;

    if (resetPagination) {
      this.paginator?.firstPage();
    }
  }

  private filteredProjects(): Project[] {
    const searchValue = this.searchText.trim().toLowerCase();
    const currentUser = this.userService.currentUser;

    return [...(this.unit?.students ?? [])]
      .filter((project) => (this.staffFilter === 'mine' ? project.hasTutor(currentUser) : true))
      .filter((project) => (searchValue ? this.matchesSearch(project, searchValue) : true))
      .sort((a, b) => this.compareProjects(a, b));
  }

  private matchesSearch(project: Project, searchValue: string): boolean {
    return (
      project.matches(searchValue) || project.student.username?.toLowerCase().includes(searchValue)
    );
  }

  private compareProjects(a: Project, b: Project): number {
    const direction = this.sortState.direction === 'desc' ? -1 : 1;
    const aValue = this.sortValue(a, this.sortState.active);
    const bValue = this.sortValue(b, this.sortState.active);

    if (aValue === bValue) {
      return 0;
    }

    if (aValue == null) {
      return -1 * direction;
    }

    if (bValue == null) {
      return 1 * direction;
    }

    return aValue < bValue ? -1 * direction : 1 * direction;
  }

  private sortValue(project: Project, active: string): number | string {
    switch (active) {
      case 'username':
        return project.student.username?.toLowerCase() || '';
      case 'name':
        return project.student.name?.toLowerCase() || '';
      case 'stats':
        return project.orderScale ?? 0;
      case 'grade':
        return project.targetGrade ?? -1;
      case 'portfolio':
        return project.portfolioStatus ?? -1;
      case 'similarity':
        return project.similarityFlag ? 1 : 0;
      case 'campus':
        return project.campus?.name?.toLowerCase() || '';
      case 'tutorial':
        return project.shortTutorialDescription().toLowerCase();
      default:
        return project.student.name?.toLowerCase() || '';
    }
  }

  private csvHeader(): string[] {
    const result = ['username', 'name', 'email', 'portfolio'];

    if (this.unit.tutorialStreamsCache.size > 0) {
      this.unit.tutorialStreams.forEach((stream) => result.push(stream.abbreviation));
    } else {
      result.push('tutorial');
    }

    return result;
  }

  private csvRow(project: Project): string[] {
    const row = [
      project.student.username || '',
      project.student.name || '',
      project.student.email || '',
      String(project.portfolioStatus ?? ''),
    ];

    if (this.unit.tutorialStreamsCache.size > 0) {
      this.unit.tutorialStreams.forEach((stream) => {
        row.push(project.tutorialForStream(stream)?.abbreviation || '');
      });
    } else {
      row.push(project.tutorials[0]?.abbreviation || '');
    }

    return row;
  }

  private csvEscape(value: string): string {
    const normalized = String(value ?? '');
    if (/[",\n]/.test(normalized)) {
      return `"${normalized.replace(/"/g, '""')}"`;
    }
    return normalized;
  }
}
