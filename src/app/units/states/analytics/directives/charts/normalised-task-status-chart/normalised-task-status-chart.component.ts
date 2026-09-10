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
  getTaskStats,
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
    if (!this.selectedSnapshot || this.selectedSnapshot.placeholder) {
      return 0;
    }

    const exactCount =
      this.campusFilter === 'all'
        ? this.selectedSnapshot.student_count
        : this.selectedSnapshot.campus_student_counts?.[this.campusFilter];
    if (exactCount !== undefined) {
      return exactCount;
    }

    const snapshotData =
      this.campusFilter !== 'all' && this.selectedSnapshot.stats[this.campusFilter]
        ? {[this.campusFilter]: this.selectedSnapshot.stats[this.campusFilter]}
        : this.selectedSnapshot.stats;

    return countStudentsFromSnapshot(snapshotData);
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

    this.data =
      this.unit && selectedSnapshot
        ? this.buildChartData(getTaskStats(selectedSnapshot, this.campusFilter))
        : [];

    // Padded week 0 days carry no stats - show the chart empty rather than falling back
    // to the loading spinner.
    this.hasChartData = !!this.unit && this.snapshots.length > 0;
  }

  private buildChartData(taskStats: TaskCodeStats): MultiSeries {
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
      .map(([taskDef, counts]) => ({
        name: taskDef,
        series: statusMapping.map((status) => ({
          name: this.taskService.statusLabels.get(status) || status,
          value: counts[status] || 0,
        })),
      }));
  }
}
