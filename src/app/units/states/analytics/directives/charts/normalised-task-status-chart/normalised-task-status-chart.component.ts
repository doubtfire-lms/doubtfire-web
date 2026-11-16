import {MultiSeries, TooltipService} from '@glitchtip/ng-charts';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import {TaskCodeStats, TaskCompletionSnapshot} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {TaskService} from 'src/app/api/services/task.service';
import {
  countStudentsFromSnapshot,
  formatSnapshotLabel,
  getEmptySnapshotTaskStats,
  getTaskPopulationStats,
  isEmptySnapshot,
  statusMapping,
} from '../chart-data-helpers';

@Component({
  selector: 'f-normalised-task-status-chart',
  templateUrl: './normalised-task-status-chart.component.html',
  standalone: false,
})
export class NormalisedTaskStatusChartComponent implements OnChanges, OnInit {
  @Input() unit: Unit;
  @Input() snapshots: TaskCompletionSnapshot[] = [];
  @Input() campusFilter: string = 'all';
  @Input() tutorialFilter: string = 'all';
  @Input() taskGradeFilter: number[] = [];
  @Input() studentTargetGradeFilter: number[] = [];
  @Input() selectedSnapshotIndex: number = 0;

  data: MultiSeries = [];
  hasChartData: boolean = false;
  colorScheme = {domain: ['']};

  XAxisLabel: string = 'Task';
  YAxisLabel: string = 'Percentage of Students';

  constructor(
    private readonly taskService: TaskService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly chartToolTipService: TooltipService,
    private readonly injectorObj: Injector,
    private readonly viewContainerRef: ViewContainerRef,
  ) {
    this.chartToolTipService = this.injectorObj.get(TooltipService);
  }

  get selectedSnapshot(): TaskCompletionSnapshot | undefined {
    return this.snapshots[this.selectedSnapshotIndex];
  }

  get selectedSnapshotDate(): string {
    return formatSnapshotLabel(this.unit, this.selectedSnapshot?.snapshot_date, 'long');
  }

  get snapshotStudentCount(): number {
    const snapshot = this.selectedSnapshot;
    if (!snapshot || snapshot.placeholder) {
      return 0;
    }

    if (this.tutorialFilter !== 'all' || this.studentTargetGradeFilter.length > 0) {
      const targetGradeCount = this.targetGradeStudentCount(snapshot);
      if (targetGradeCount !== undefined) {
        return targetGradeCount;
      }

      return countStudentsFromSnapshot({
        filtered: {
          selected: getTaskPopulationStats(
            snapshot,
            this.campusFilter,
            this.tutorialFilter,
            [],
            this.studentTargetGradeFilter,
            this.unit,
          ),
        },
      });
    }

    const exactCount =
      this.campusFilter === 'all'
        ? snapshot.student_count
        : snapshot.campus_student_counts?.[this.campusFilter];
    if (exactCount !== undefined) {
      return exactCount;
    }

    const snapshotData =
      this.campusFilter !== 'all' && snapshot.stats[this.campusFilter]
        ? {[this.campusFilter]: snapshot.stats[this.campusFilter]}
        : snapshot.stats;

    return countStudentsFromSnapshot(snapshotData);
  }

  private targetGradeStudentCount(snapshot: TaskCompletionSnapshot): number | undefined {
    if (this.tutorialFilter !== 'all' || this.studentTargetGradeFilter.length === 0) {
      return undefined;
    }

    if (this.campusFilter === 'all' && snapshot.target_grade_student_counts) {
      return this.studentTargetGradeFilter.reduce(
        (total, targetGrade) =>
          total + (snapshot.target_grade_student_counts?.[targetGrade.toString()] ?? 0),
        0,
      );
    }

    if (this.campusFilter !== 'all' && snapshot.target_grade_campus_student_counts) {
      return this.studentTargetGradeFilter.reduce(
        (total, targetGrade) =>
          total +
          (snapshot.target_grade_campus_student_counts?.[targetGrade.toString()]?.[
            this.campusFilter
          ] ?? 0),
        0,
      );
    }

    return undefined;
  }

  ngOnInit(): void {
    this.chartToolTipService.injectionService.setRootViewContainer(this.viewContainerRef);

    this.colorScheme.domain = statusMapping.map(
      (status) => this.taskService.statusColors.get(status) || '#000000',
    );
    this.refreshData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['unit'] ||
      changes['snapshots'] ||
      changes['campusFilter'] ||
      changes['tutorialFilter'] ||
      changes['taskGradeFilter'] ||
      changes['studentTargetGradeFilter'] ||
      changes['selectedSnapshotIndex']
    ) {
      this.refreshData();
      this.changeDetectorRef.markForCheck();
    }
  }

  /**
   * Rebuild the bars for the selected snapshot. This runs on every slider tick, so
   * it must only touch the one snapshot the slider is pointing at.
   */
  private refreshData(): void {
    const selectedSnapshot = this.selectedSnapshot;

    if (!selectedSnapshot) {
      this.data = [];
      this.hasChartData = false;
      return;
    }

    const emptySnapshot = isEmptySnapshot(selectedSnapshot);
    this.data = this.unit
      ? this.buildChartData(
          emptySnapshot
            ? getEmptySnapshotTaskStats(this.unit, this.taskGradeFilter)
            : getTaskPopulationStats(
                selectedSnapshot,
                this.campusFilter,
                this.tutorialFilter,
                this.taskGradeFilter,
                this.studentTargetGradeFilter,
                this.unit,
              ),
          emptySnapshot,
        )
      : [];

    this.hasChartData = !!this.unit && this.snapshots.length > 0;
  }

  private buildChartData(taskStats: TaskCodeStats, emptySnapshot: boolean): MultiSeries {
    const orderByCode = new Map(
      this.unit.taskDefinitions.map((taskDefinition) => [
        taskDefinition.abbreviation,
        {
          target: taskDefinition.targetDate?.valueOf() ?? Number.MAX_SAFE_INTEGER,
          seq: taskDefinition.seq,
        },
      ]),
    );

    // A task definition that has since been removed still shows up in older snapshots.
    const unknown = {target: Number.MAX_SAFE_INTEGER, seq: Number.MAX_SAFE_INTEGER};

    return Object.entries(taskStats)
      .sort(([taskCodeA], [taskCodeB]) => {
        const a = orderByCode.get(taskCodeA) ?? unknown;
        const b = orderByCode.get(taskCodeB) ?? unknown;
        return a.target - b.target || a.seq - b.seq;
      })
      .map(([taskDef, counts]) => {
        const total = statusMapping.reduce((sum, status) => sum + (counts[status] || 0), 0);

        return {
          name: taskDef,
          series: statusMapping.map((status) => {
            const value = counts[status] || 0;
            return {
              name: this.taskService.statusLabels.get(status) || status,
              value,
              extra: {
                percentage: total > 0 ? ((value / total) * 100).toFixed(2) : '0.00',
                emptySnapshot,
              },
            };
          }),
        };
      });
  }
}
