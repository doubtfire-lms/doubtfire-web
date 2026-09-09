import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, Subscription, distinctUntilChanged, finalize, first, map} from 'rxjs';
import {
  Project,
  ProjectService,
  TaskService,
  TaskStatusEnum,
  Unit,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {UnitStudentEnrolmentModalService} from '../../modals/unit-student-enrolment-modal/unit-student-enrolment-modal.service';

// State for both convenors and tutors to access student list
@Component({
  selector: 'f-students-list',
  templateUrl: './students-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
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
  private studentCacheSubscription: Subscription;
  private studentLoadSubscription: Subscription;
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
    // The route reuses this component when switching between units, so follow the resolved
    // unit rather than reading it once from the route snapshot.
    const unit$ = this.unit$ ?? this.route.parent.data.pipe(map((data) => data.unit as Unit));

    this.subscriptions.push(
      unit$
        .pipe(distinctUntilChanged((previous, current) => previous?.id === current?.id))
        .subscribe((unit) => this.showUnit(unit)),
    );
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.updateDataSource();
  }

  ngOnDestroy(): void {
    this.studentCacheSubscription?.unsubscribe();
    this.studentLoadSubscription?.unsubscribe();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private showUnit(unit: Unit): void {
    this.studentCacheSubscription?.unsubscribe();
    this.studentLoadSubscription?.unsubscribe();
    this.unit = unit;
    this.searchText = '';

    if (!unit) {
      this.loadingStudents = false;
      this.filteredSuggestions = [];
      this.updateDataSource(true);
      return;
    }

    this.staffFilter = unit.myRole === 'Tutor' ? 'mine' : 'all';

    this.studentCacheSubscription = unit.studentCache.values.subscribe(() => {
      this.updateSuggestions();
      this.updateDataSource();
    });

    this.updateSuggestions();
    this.updateDataSource(true);

    // Students already in the cache can be shown while the current details load, but they may
    // have been cached in another view minutes ago - so always ask the server for them again.
    this.loadingStudents = unit.activeStudents.length === 0;
    this.studentLoadSubscription = this.projectService
      .loadStudents(unit, false, true)
      .pipe(
        first(),
        finalize(() => {
          // A request for the unit we have moved on from must not clear this unit's skeleton.
          if (this.unit === unit) {
            this.loadingStudents = false;
          }
        }),
      )
      .subscribe();
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
      .filter((item) => !searchValue || item?.toLowerCase().includes(searchValue))
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

    return [...(this.unit?.activeStudents ?? [])]
      .filter((project) => (this.staffFilter === 'mine' ? project.hasTutor(currentUser) : true))
      .filter((project) => (searchValue ? project.matches(searchValue) : true))
      .sort((a, b) => this.compareProjects(a, b));
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
        return project.student?.username?.toLowerCase() || '';
      case 'name':
        return project.student?.name?.toLowerCase() || '';
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
        return project.student?.name?.toLowerCase() || '';
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
      project.student?.username || '',
      project.student?.name || '',
      project.student?.email || '',
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
