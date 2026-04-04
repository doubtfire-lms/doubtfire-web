import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { GradeService } from 'src/app/common/services/grade.service';
import { ProjectService } from 'src/app/api/services/project.service';
import { Unit } from 'src/app/api/models/unit';
import { Project } from 'src/app/api/models/project';
import { UnitRole } from 'src/app/api/models/unit-role';
import { User } from 'src/app/api/models/doubtfire-model';
import { UserService } from 'src/app/api/services/user.service';
import { FileDownloaderService } from 'src/app/common/file-downloader/file-downloader.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { TaskService } from 'src/app/api/services/task.service';
import { Subscription } from 'rxjs';
import { visualisations } from 'src/app/ajs-upgraded-providers';

type StudentTabKey =
  | 'selectStudent'
  | 'viewProgress'
  | 'viewStaffNotes'
  | 'viewPortfolio'
  | 'assessPortfolio';

type GradeBucket = { name: string; scores: number[] };

@Component({
  selector: 'f-portfolios',
  templateUrl: './portfolios.component.html',
  styleUrls: ['./portfolios.component.scss'],
})
export class PortfoliosComponent implements OnInit, OnChanges, OnDestroy {
  @Input() unit: Unit;
  @Input() unitRole: UnitRole;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  public tutor: User;

  public readonly tabs = {
    selectStudent: { title: 'Select Student', subtitle: 'Select the student to assess', key: 'selectStudent' as StudentTabKey },
    viewProgress: { title: 'View Progress', subtitle: 'See the progress of the student', key: 'viewProgress' as StudentTabKey },
    viewStaffNotes: {
      title: 'View Staff Notes',
      subtitle: 'See notes about the student added by staff',
      key: 'viewStaffNotes' as StudentTabKey,
    },
    viewPortfolio: { title: 'View Portfolio', subtitle: 'See the portfolio of the student', key: 'viewPortfolio' as StudentTabKey },
    assessPortfolio: { title: 'Assess Portfolio', subtitle: 'Enter a grade for the student', key: 'assessPortfolio' as StudentTabKey },
  };

  /** Tab index order must match `mat-tab` order in the template. */
  private readonly tabOrder: StudentTabKey[] = [
    'selectStudent',
    'viewProgress',
    'viewStaffNotes',
    'viewPortfolio',
    'assessPortfolio',
  ];

  public activeTab: StudentTabKey = 'selectStudent';

  public studentFilter: 'allStudents' | 'myStudents' = 'allStudents';
  public portfolioFilter: 'withPortfolio' | 'allStudents' = 'withPortfolio';
  public filterOptions: { selectedGrade: number } = { selectedGrade: -1 };

  public search = '';

  public gradeValues: number[] = [];
  public gradeServiceGrades: Record<string, string> = {};
  public gradeResults: GradeBucket[] = [];

  public selectedStudent: Project | null = null;
  public project: Project | null = null;
  public loadingProject = false;

  public readonly dataSource = new MatTableDataSource<Project>([]);

  public displayedColumns: string[] = [];
  public readonly baseDisplayedColumns: string[] = [
    'student',
    'name',
    'tutor',
    'tutorial',
    'targetGrade',
    'submittedGrade',
    'progress',
    'grade',
  ];
  public readonly hasPortfolioColumn = 'hasPortfolio';

  public sortOrder:
    | 'studentId'
    | 'name'
    | 'tutorNames'
    | 'tutorial'
    | 'targetGrade'
    | 'submittedGrade'
    | 'orderScale'
    | 'hasPortfolio'
    | 'grade' = 'name';
  public sortReverse = false;

  public pageSize = 10;
  public pageSizeOptions = [5, 10, 25];
  public pageIndex = 0;
  public totalItems = 0;
  public totalEnrolledStudents = 0;

  private subscriptions: Subscription[] = [];

  private sortedRows: Project[] = [];

  constructor(
    public gradeService: GradeService,
    private projectService: ProjectService,
    private userService: UserService,
    private fileDownloader: FileDownloaderService,
    private alerts: AlertService,
    private taskService: TaskService,
    @Optional() @Inject(visualisations) private readonly visualisationApi: { refreshAll?: () => void } | null,
  ) {}

  ngOnInit(): void {
    this.tutor = this.userService.currentUser;

    this.gradeValues = this.gradeService.gradeValues.slice();
    this.gradeServiceGrades = this.gradeService.grades as unknown as Record<string, string>;

    // Matches the legacy template layout.
    this.gradeResults = [
      { name: 'Fail', scores: [0, 10, 20, 30, 40, 44] },
      { name: 'Pass', scores: [50, 53, 55, 57] },
      { name: 'Credit', scores: [60, 63, 65, 67] },
      { name: 'Distinction', scores: [70, 73, 75, 77] },
      { name: 'High Distinction', scores: [80, 83, 85, 87] },
      { name: 'High Distinction', scores: [90, 93, 95, 97, 100] },
    ];

    this.applyFiltersAndSort();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unit']?.currentValue) {
      const prev = changes['unit'].previousValue as Unit | undefined;
      const cur = changes['unit'].currentValue as Unit;
      if (!prev || prev.id !== cur.id) {
        cur.loadD2lMapping?.().subscribe();
      }
    }
    if (changes['unit'] || changes['unitRole']) {
      this.applyFiltersAndSort();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private updateDisplayedColumns(): void {
    const includeHasPortfolio = this.portfolioFilter === 'allStudents';
    this.displayedColumns = [...this.baseDisplayedColumns];
    if (includeHasPortfolio) {
      // Keep order aligned with the legacy table.
      this.displayedColumns = [
        'student',
        'name',
        'tutor',
        'tutorial',
        'targetGrade',
        'submittedGrade',
        'progress',
        'hasPortfolio',
        'grade',
      ];
    } else {
      this.displayedColumns = [
        'student',
        'name',
        'tutor',
        'tutorial',
        'targetGrade',
        'submittedGrade',
        'progress',
        'grade',
      ];
    }
  }

  public onTabChange(tabKey: StudentTabKey): void {
    this.activeTab = tabKey;
    if (tabKey === 'viewProgress' && this.project) {
      this.project.refreshBurndownChartData();
      // Legacy charts (nv/d3) need a refresh after the tab body is shown.
      setTimeout(() => this.visualisationApi?.refreshAll?.(), 0);
    }
  }

  public onTabChanged(index: number): void {
    const tabKey = this.tabOrder[index] ?? 'selectStudent';
    this.onTabChange(tabKey);
  }

  public onDownloadGrades(): void {
    if (!this.unit) return;
    this.fileDownloader.downloadFile(this.unit.gradesUrl, `${this.unit.code}-grades.csv`);
  }

  public onDownloadPortfolios(): void {
    if (!this.unit) return;
    this.fileDownloader.downloadFile(this.unit.portfoliosUrl, `${this.unit.code}-portfolios.zip`);
  }

  public setActiveTab(tabKey: StudentTabKey): void {
    if (this.activeTab === tabKey) return;
    this.activeTab = tabKey;
    this.onTabChange(tabKey);
  }

  public selectStudent(student: Project): void {
    this.selectedStudent = student;
    this.project = null;
    this.loadingProject = true;

    if (!this.unit || !this.selectedStudent) return;

    this.subscriptions.push(
      this.projectService.loadProject(this.selectedStudent, this.unit).subscribe({
        next: (loaded) => {
          this.project = loaded;
          this.loadingProject = false;
          // If the user already navigated to a tab that depends on the project,
          // ensure derived visuals are refreshed after load.
          if (this.activeTab === 'viewProgress') {
            this.project.refreshBurndownChartData();
          }
        },
        error: (message) => {
          this.alerts.error(message, 6000);
          this.loadingProject = false;
        },
      }),
    );
  }

  public trackByProjectId(_index: number, row: Project): number {
    return row?.id;
  }

  private normalizeSearchText(text: string): string {
    return text?.trim().toLowerCase() ?? '';
  }

  private matchesSearch(project: Project): boolean {
    const q = this.normalizeSearchText(this.search);
    if (!q) return true;
    return project.matches(q);
  }

  private applyFiltersAndSort(): void {
    if (!this.unit || !this.unit.students) {
      this.dataSource.data = [];
      this.totalItems = 0;
      this.updateDisplayedColumns();
      return;
    }

    let rows = this.unit.students.slice();
    this.totalEnrolledStudents = this.unit.students.length;

    // Portfolio filter (legacy: hasPortfolio includes in-progress portfolios too).
    rows = rows.filter((p) => {
      if (this.portfolioFilter === 'allStudents') return true;
      return (p.hasPortfolio || (p.portfolioStatus ?? 0) > 0) === true;
    });

    // Student filter.
    rows = rows.filter((p) => {
      if (this.studentFilter === 'allStudents') return true;
      return p.hasTutor(this.tutor);
    });

    // Submitted grade filter.
    rows = rows.filter((p) => {
      if (this.filterOptions.selectedGrade === -1) return true;
      return p.submittedGrade === this.filterOptions.selectedGrade;
    });

    // Search filter.
    rows = rows.filter((p) => this.matchesSearch(p));

    this.sortedRows = this.sortStudents(rows);

    this.totalItems = this.sortedRows.length;
    this.updateDisplayedColumns();

    this.pageIndex = 0;
    this.repaginateFromSorted();
  }

  private sortStudents(rows: Project[]): Project[] {
    const dir = this.sortReverse ? -1 : 1;

    const getSortValue = (p: Project): number | string => {
      switch (this.sortOrder) {
        case 'studentId':
          return p.student?.studentId || p.student?.username || '';
        case 'name':
          return p.student?.name || '';
        case 'tutorNames':
          return p.tutorNames();
        case 'tutorial':
          return p.shortTutorialDescription();
        case 'targetGrade':
          return p.targetGrade ?? -1;
        case 'submittedGrade':
          return p.submittedGrade ?? -1;
        case 'orderScale':
          return p.orderScale ?? 0;
        case 'hasPortfolio':
          return (p.hasPortfolio || (p.portfolioStatus ?? 0) > 0) ? 1 : 0;
        case 'grade':
          return p.grade ?? -1;
      }
    };

    return rows.sort((a, b) => {
      const av = getSortValue(a);
      const bv = getSortValue(b);

      if (typeof av === 'number' && typeof bv === 'number') {
        return dir * (av - bv);
      }

      return dir * String(av).localeCompare(String(bv));
    });
  }

  private repaginateFromSorted(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.dataSource.data = this.sortedRows.slice(start, end);
  }

  public pageChanged(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.repaginateFromSorted();
  }

  public toggleSort(order: typeof this.sortOrder): void {
    if (this.sortOrder === order) {
      this.sortReverse = !this.sortReverse;
    } else {
      this.sortOrder = order;
      this.sortReverse = false;
    }
    this.applyFiltersAndSort();
  }

  public gradeAcronym(grade: number): string {
    // -1..3
    return this.gradeService.gradeAcronyms[String(grade)] ?? 'G';
  }

  public gradeColor(grade: number): string {
    return this.gradeService.gradeColors[String(grade)] ?? '#808080';
  }

  public taskSegmentColor(taskStatusKey: string): string {
    return this.taskService.statusColors.get(taskStatusKey as any) ?? '#CCCCCC';
  }

  public downloadPortfolios(): void {
    // Intentionally left out: legacy button was commented out.
  }

  public saveGrade(): void {
    if (!this.project) return;
    const score = this.project.grade;
    if (score == null) return;
    if (!this.project.gradeRationale?.trim()) return;

    this.project.assignGrade(score, this.project.gradeRationale);
    this.project.refreshBurndownChartData();
  }

  public assignGradeAndRefresh(score: number): void {
    if (!this.project) return;
    if (!this.project.gradeRationale?.trim()) return;
    this.project.assignGrade(score, this.project.gradeRationale);
    this.project.refreshBurndownChartData();
  }

  public get showNoStudentMessage(): boolean {
    return this.activeTab !== 'selectStudent' && !this.selectedStudent;
  }

  public get canShowProgressAndPortfolio(): boolean {
    return !!this.project && !!this.selectedStudent;
  }

  public get selectedStudentLabel(): string {
    return this.selectedStudent?.student?.name ?? '';
  }

  public get showFilteredCountText(): boolean {
    return this.totalItems > 0 && this.totalItems < this.totalEnrolledStudents;
  }

  public onSearchChange(): void {
    this.applyFiltersAndSort();
  }

  public onPortfolioFilterChange(value: 'withPortfolio' | 'allStudents'): void {
    this.portfolioFilter = value;
    this.applyFiltersAndSort();
  }

  public onStudentFilterChange(value: 'allStudents' | 'myStudents'): void {
    this.studentFilter = value;
    this.applyFiltersAndSort();
  }

  public onSubmittedGradeChange(value: number): void {
    this.filterOptions.selectedGrade = value;
    this.applyFiltersAndSort();
  }
}

