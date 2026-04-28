import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Injector,
  Inject,
  HostListener,
} from '@angular/core';
import {UIRouter} from '@uirouter/angular';
import {unitStudentEnrolmentModal, analyticsService} from 'src/app/ajs-upgraded-providers';
import {Project, Unit} from 'src/app/api/models/doubtfire-model';
import {UserService} from 'src/app/api/services/user.service';

type TaskStat = NonNullable<Project['taskStats']>[number];
type TaskStatusKey = TaskStat['key'];

type StoredTaskStat = {
  key: string;
  value: number;
};
type TutorInfo = {
  name?: string;
  username?: string;
};
type ProjectWithTutor = Project & {
  tutorName?: string;
  tutor?: TutorInfo;
};
type ShowStudentsFilter = (
  students: readonly Project[],
  staffFilter: 'all' | 'mine',
  tutorUser: unknown,
) => readonly Project[];
type AngularJsFilterService = (name: 'showStudents') => ShowStudentsFilter;
type NewTaskService = {
  statusClass: (key: TaskStatusKey) => string;
  statusText?: (key: TaskStatusKey) => string;
};
type AnalyticsService = {
  event: (category: string, action: string) => void;
};
type UnitStudentEnrolmentModalService = {
  show: (unit: Unit) => void;
};
type CsvCell = string | number | boolean | null | undefined;
type CsvRow = Record<string, CsvCell>;

@Component({
  selector: 'f-students-list',
  templateUrl: './students-list.component.html',
  styleUrls: ['./students-list.component.scss'],
})
export class FStudentsListComponent implements OnInit, AfterViewInit {
  @Input() unit!: Unit;

  @ViewChild('searchInput', {static: false})
  searchInput!: ElementRef<HTMLInputElement>;

  searchText = '';
  filteredTypeaheadData: string[] = [];
  showSearchOptions = false;
  staffFilter: 'all' | 'mine' = 'all';
  tableSort = {order: 'student.name', reverse: false};
  pagination = {
    currentPage: 1,
    pageSize: 15,
    maxSize: 15,
    totalSize: 0,
  };
  filteredProjects: Project[] = [];

  statusClass!: (key: TaskStatusKey) => string;

  private showStudentsFilter!: (
    students: readonly Project[],
    staffFilter: 'all' | 'mine',
    tutorUser: unknown,
  ) => readonly Project[];
  private newTaskService!: NewTaskService;

  constructor(
    @Inject(analyticsService) private analytics: AnalyticsService,
    private injector: Injector,
    private router: UIRouter,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    const $filter = this.injector.get('$filter' as unknown as AngularJsFilterService);

    this.showStudentsFilter = $filter('showStudents');
    this.newTaskService = this.injector.get('newTaskService' as unknown as NewTaskService);

    this.staffFilter = this.unit?.unitRole?.role === 'Tutor' ? 'mine' : 'all';

    this.statusClass = this.newTaskService.statusClass.bind(this.newTaskService);

    this.filteredTypeaheadData = this.unit?.studentFilterTypeAheadData || [];
    this.applyFilters();
    this.restoreLastViewed();
    this.snapshotStats();
  }

  ngAfterViewInit(): void {
    this.searchInput?.nativeElement.focus();
  }

  private readonly LAST_VIEWED_KEY = 'studentsList:lastViewedProjectId';
  private readonly LAST_VIEWED_STATS_KEY = 'studentsList:lastViewedProjectStats';

  private initialStatsByProject = new Map<number | string, TaskStat[]>();

  private snapshotStats(): void {
    for (const p of this.unit?.students || []) {
      const stats = (p.taskStats || []).map((s) => ({key: s.key, value: s.value}));
      this.initialStatsByProject.set(p.id, stats);
    }
  }

  private restoreLastViewed(): void {
    const id = sessionStorage.getItem(this.LAST_VIEWED_KEY);
    if (!id) return;

    const target = (this.unit?.students || []).find((s) => String(s.id) === id);
    if (!target) return;

    const raw = sessionStorage.getItem(this.LAST_VIEWED_STATS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredTaskStat[];
        target.taskStats = (parsed || []).map((s) => ({
          key: s.key as TaskStatusKey,
          value: s.value,
        }));
      } catch {
        const snap = this.initialStatsByProject.get(target.id);
        if (snap)
          target.taskStats = snap.map((s) => ({key: s.key as TaskStatusKey, value: s.value}));
      }
    } else {
      const snap = this.initialStatsByProject.get(target.id);
      if (snap) target.taskStats = snap.map((s) => ({key: s.key as TaskStatusKey, value: s.value}));
    }

    sessionStorage.removeItem(this.LAST_VIEWED_STATS_KEY);
  }

  private restoreBlankStats(): void {
    for (const p of this.unit?.students || []) {
      const stats = p.taskStats || [];
      const noStats = !stats.length;
      const hasNonNumbers = stats.some(
        (s) => s == null || typeof s.value !== 'number' || Number.isNaN(s.value),
      );
      const total = stats.reduce((acc, s) => acc + (typeof s.value === 'number' ? s.value : 0), 0);
      const looksBlank = noStats || hasNonNumbers || total === 0;

      if (looksBlank) {
        const snap = this.initialStatsByProject.get(p.id);
        if (snap) {
          p.taskStats = snap.map((s) => ({key: s.key, value: s.value}));
        }
      }
    }
  }
  onSearchTextChange(value: string): void {
    this.searchText = value;
    const term = value.trim().toLowerCase();
    this.filteredTypeaheadData = this.unit.studentFilterTypeAheadData
      .filter((t) => t.toLowerCase().includes(term))
      .slice(0, 8);
    this.applyFilters();
  }
  @HostListener('window:popstate')
  onPopState(): void {
    this.restoreLastViewed();
    this.restoreBlankStats();
    this.applyFilters();
  }

  staffFilterChanged(newFilter: 'all' | 'mine'): void {
    this.staffFilter = newFilter;
    this.applyFilters();
  }

  private getAllFiltered(): Project[] {
    let projects = this.showStudentsFilter(
      this.unit?.students || [],
      this.staffFilter,
      this.userService.currentUser,
    ) as Project[];

    if (this.searchText.trim()) {
      const term = this.searchText.trim().toLowerCase();
      projects = projects.filter((p) => {
        const studentMatch =
          p.student.username.toLowerCase().includes(term) ||
          p.student.name.toLowerCase().includes(term);
        let tutorMatch = false;
        const projectWithTutor = p as ProjectWithTutor;

        if (
          projectWithTutor.tutorName &&
          (projectWithTutor.tutorName as string).toLowerCase().includes(term)
        ) {
          tutorMatch = true;
        }
        if (
          projectWithTutor.tutor &&
          projectWithTutor.tutor.name &&
          (projectWithTutor.tutor.name as string).toLowerCase().includes(term)
        ) {
          tutorMatch = true;
        }
        if (
          projectWithTutor.tutor &&
          projectWithTutor.tutor.username &&
          (projectWithTutor.tutor.username as string).toLowerCase().includes(term)
        ) {
          tutorMatch = true;
        }
        return studentMatch || tutorMatch;
      });
    }

    return this.sortProjects(projects);
  }

  applyFilters(): void {
    const all = this.getAllFiltered();
    this.pagination.totalSize = all.length;
    const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
    this.filteredProjects = all.slice(start, start + this.pagination.pageSize);
  }

  private sortProjects(list: Project[]): Project[] {
    const {order, reverse} = this.tableSort;

    return [...list].sort((a, b) => {
      let va: string | number | boolean | Array<string | number | boolean>;
      let vb: string | number | boolean | Array<string | number | boolean>;

      if (order === 'similarityFlag') {
        va = [a.similarityFlag ? 1 : 0, a.student.name];
        vb = [b.similarityFlag ? 1 : 0, b.student.name];
      } else if (order === 'portfolioStatus') {
        va = [a.portfolioStatus ?? '', a.student.name];
        vb = [b.portfolioStatus ?? '', b.student.name];
      } else if (order === 'tutorial.abbreviation') {
        va = a.tutorials?.[0]?.abbreviation ?? '';
        vb = b.tutorials?.[0]?.abbreviation ?? '';
      } else {
        const getValue = (obj: Project, path: string): string | number | boolean => {
          const value = path.split('.').reduce<unknown>((current, key) => {
            if (current && typeof current === 'object' && key in current) {
              return (current as Record<string, unknown>)[key];
            }
            return undefined;
          }, obj);

          if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean'
          ) {
            return value;
          }

          return '';
        };
        va = getValue(a, order);
        vb = getValue(b, order);
      }

      if (va < vb) return reverse ? 1 : -1;
      if (va > vb) return reverse ? -1 : 1;
      return 0;
    });
  }

  sortTableBy(column: string): void {
    if (column === 'flags') {
      this.showSearchOptions = true;
      setTimeout(() => this.searchInput.nativeElement.focus(), 500);
      return;
    }
    if (this.tableSort.order === column) {
      this.tableSort.reverse = !this.tableSort.reverse;
    } else {
      this.tableSort.order = column;
      this.tableSort.reverse = false;
    }
    this.applyFilters();
  }

  totalProgress(project: Project): number {
    return (project.taskStats || []).reduce((sum, bar) => sum + bar.value, 0);
  }

  getCSVHeader(): string[] {
    const header = ['username', 'name', 'email', 'portfolio'];
    if (this.unit.tutorialStreamsCache.size > 0) {
      this.unit.tutorialStreams.forEach((ts) => header.push(ts.abbreviation));
    } else {
      header.push('tutorial');
    }
    return header;
  }

  private getCSVRows(projects: Project[]): CsvRow[] {
    return projects.map((project) => {
      const row: CsvRow = {
        username: project.student.username,
        name: project.student.name,
        email: project.student.email,
        portfolio: project.portfolioStatus,
      };
      if (this.unit.tutorialStreamsCache.size > 0) {
        this.unit.tutorialStreams.forEach((ts) => {
          row[ts.abbreviation] = project.tutorialForStream(ts)?.abbreviation || '';
        });
      } else {
        row['tutorial'] = project.tutorials[0]?.abbreviation || '';
      }
      return row;
    });
  }

  downloadCSV(): void {
    const header = this.getCSVHeader();
    const rows = this.getCSVRows(this.getAllFiltered());
    const csvArray = [
      header.join(','),
      ...rows.map((r) =>
        header.map((h) => `"${String(r[h] ?? '')}`.replace(/"/g, '""') + '"').join(','),
      ),
    ];
    const csvContent = csvArray.join('\r\n');
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${this.unit.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  showEnrolModal(): void {
    this.analytics.event('Teacher View - Students Tab', 'Enrol Student');
    const svc = this.injector.get(
      unitStudentEnrolmentModal as unknown as UnitStudentEnrolmentModalService,
    );
    svc.show(this.unit);
  }

  viewStudent(project: Project): void {
    sessionStorage.setItem(this.LAST_VIEWED_KEY, String(project.id));
    const snap = (project.taskStats || []).map((s) => ({key: s.key, value: s.value}));
    sessionStorage.setItem(this.LAST_VIEWED_STATS_KEY, JSON.stringify(snap));
    this.router.stateService.go('projects/dashboard', {
      projectId: project.id,
      tutor: true,
      taskAbbr: '',
    });
  }

  hasActiveProgress(project: Project): boolean {
    return project.taskStats?.some(
      (bar) =>
        this.statusClass(bar.key) !== 'default' && this.statusClass(bar.key) !== 'not-started',
    );
  }
  isInactiveProgress(key: string): boolean {
    return key === 'not_started' || key === 'not-started';
  }

  visibleTaskStats(project: Project): TaskStat[] {
    const stats = project.taskStats || [];
    const notStartedBar = stats.find((bar) => bar.key === 'not_started');
    const activeBars = stats.filter((bar) => bar.key !== 'not_started' && bar.value > 0);

    if (notStartedBar && notStartedBar.value === 100 && activeBars.length > 0) {
      return activeBars;
    }

    return stats.filter((bar) => bar.value > 0);
  }

  showProgressText(bar: TaskStat): boolean {
    return bar.value >= 10;
  }
}
