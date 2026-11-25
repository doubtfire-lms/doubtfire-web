import {MultiSeries, TooltipService} from '@glitchtip/ng-charts';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import {TaskCompletionSnapshot} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {TaskService} from 'src/app/api/services/task.service';
import {
  formatSnapshotLabel,
  getLastSnapshotByWeek,
  getTaskPopulationStats,
  statusMapping,
} from '../chart-data-helpers';

@Component({
  selector: 'f-stacked-area-status-chart',
  templateUrl: './stacked-area-status-chart.component.html',
  standalone: false,
})
export class StackedAreaStatusChartComponent implements OnChanges {
  @Input() unit: Unit;
  @Input() snapshots: TaskCompletionSnapshot[] = [];
  @Input() campusFilter: string = 'all';
  @Input() tutorialFilter: string = 'all';
  @Input() taskGradeFilter: number[] = [];
  @Input() studentTargetGradeFilter: number[] = [];
  @Input() selectedDate?: string;
  @Output() daySelect: EventEmitter<string> = new EventEmitter();

  weeklyData: MultiSeries = [];
  weeks: string[] = [];
  private lastDateByWeek: Map<string, string> = new Map();
  colorScheme = {domain: ['']};

  XAxisLabel: string = 'Week';
  YAxisLabel: string = 'Tasks';

  constructor(
    private readonly taskService: TaskService,
    private readonly chartToolTipService: TooltipService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly injectorObj: Injector,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
    // https://github.com/swimlane/ngx-charts/issues/1428#issuecomment-659237562
    this.chartToolTipService = this.injectorObj.get(TooltipService);
    this.viewContainerRef = this.injectorObj.get(ViewContainerRef);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['unit'] ||
      changes['snapshots'] ||
      changes['campusFilter'] ||
      changes['tutorialFilter'] ||
      changes['taskGradeFilter'] ||
      changes['studentTargetGradeFilter']
    ) {
      this.colorScheme.domain = statusMapping.map(
        (status) => this.taskService.statusColors.get(status) || '#000000',
      );
      this.weeklyData = this.unit && this.snapshots.length ? this.buildWeeklyChartData() : [];
      this.changeDetectorRef.markForCheck();
    }
  }

  get markerIndex(): number | null {
    if (!this.selectedDate || !this.unit) {
      return null;
    }

    const index = this.weeks.indexOf(formatSnapshotLabel(this.unit, this.selectedDate, 'short'));
    return index === -1 ? null : index;
  }

  get markerLabel(): string {
    return this.unit ? formatSnapshotLabel(this.unit, this.selectedDate) : '';
  }

  // A week stands for its last snapshot, the one its point is drawn from.
  onChartClick(hoveredWeek: string | undefined): void {
    const date = hoveredWeek && this.lastDateByWeek.get(hoveredWeek);
    if (date) {
      this.daySelect.emit(date);
    }
  }

  private buildWeeklyChartData(): MultiSeries {
    const snapshotsByWeek = getLastSnapshotByWeek(this.unit, this.snapshots);
    this.weeks = [...snapshotsByWeek.keys()];
    this.lastDateByWeek = new Map(
      [...snapshotsByWeek.entries()].map(([week, snapshot]) => [week, snapshot.snapshot_date]),
    );
    const weeks = [...snapshotsByWeek.entries()].map(([name, snapshot]) => ({
      name,
      taskStats: getTaskPopulationStats(
        snapshot,
        this.campusFilter,
        this.tutorialFilter,
        this.taskGradeFilter,
        this.studentTargetGradeFilter,
        this.unit,
      ),
    }));

    return statusMapping.map((status) => ({
      name: this.taskService.statusLabels.get(status) || status,
      series: weeks.map((week) => ({
        name: week.name,
        value: Object.values(week.taskStats).reduce(
          (total, taskCounts) => total + (taskCounts[status] || 0),
          0,
        ),
      })),
    }));
  }
}
