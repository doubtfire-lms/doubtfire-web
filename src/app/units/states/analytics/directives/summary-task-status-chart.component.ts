import {Component, Injector, Input, OnInit, ViewContainerRef} from '@angular/core';
import {TaskService} from 'src/app/api/services/task.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {Unit} from 'src/app/api/models/unit';
import {TooltipService} from '@swimlane/ngx-charts';
import {TaskStatusEnum} from 'src/app/api/models/doubtfire-model';

type TaskCompletionSnapshot = {
  snapshot_date: string;
  captured_at: string;
  stats: CampusStats;
};

type TaskStatusCounts = {
  [status: string]: number;
  // e.g. complete?: number;
  //      not_started?: number;
  //      ready_for_feedback?: number;
};

type TaskCodeStats = {
  [taskCode: string]: TaskStatusCounts;
  // e.g. "T1": {complete: 10, not_started: 5, ready_for_feedback: 3}
};

type TutorialStats = {
  [tutorialCode: string]: TaskCodeStats;
  // e.g. "LA1-01"
};

type CampusStats = {
  [campusName: string]: TutorialStats;
  // e.g. "Online", "Burwood"
};

@Component({
  selector: 'f-summary-task-status-chart',
  templateUrl: './summary-task-status-chart.component.html',
  styleUrl: './summary-task-status-chart.component.scss',
})
export class SummaryTaskStatusChartComponent {
  @Input() unit: Unit;

  data: any[] = [];
  snapshots: TaskCompletionSnapshot[] = [];
  campuses: string[] = [];
  tutorials: string[] = [];
  // view: any[] = [700, 300];

  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Task';
  showYAxisLabel: boolean = true;
  yAxisLabel: string = 'Status';
  animations: boolean = true;

  colorScheme = {
    domain: [''],
  };

  dataSource: TaskCodeStats = {};

  private readonly statusMapping: Map<string, TaskStatusEnum[]> = new Map([
    ['Complete', ['complete']],
    ['Assess in Portfolio', ['assess_in_portfolio']],
    ['Discuss/Demonstrate', ['discuss', 'demonstrate']],
    ['Fix and Resubmit/Redo', ['redo', 'fix_and_resubmit']],
    ['Ready for Feedback', ['ready_for_feedback']],
    ['Working on It', ['working_on_it']],
    ['Need Help/Attention Required', ['need_help', 'attention_required']],
    ['Fail/Time/Feedback Exceeded', ['fail', 'feedback_exceeded', 'time_exceeded']],
    ['Not Started', ['not_started']],
  ]);

  constructor(
    private gradeService: GradeService,
    private taskService: TaskService,
    private chartToolTipService: TooltipService,
    private viewContainerRef: ViewContainerRef,
    private injectorObj: Injector,
  ) {
    // https://github.com/swimlane/ngx-charts/issues/1428#issuecomment-659237562
    this.chartToolTipService = this.injectorObj.get(TooltipService);
    this.viewContainerRef = this.injectorObj.get(ViewContainerRef);
  }

  statusLabelsArr = Array.from(this.taskService.statusLabels.entries()) as [
    TaskStatusEnum,
    string,
  ][];

  campusFilter: string = 'all';

  ngOnInit(): void {
    this.chartToolTipService.injectionService.setRootViewContainer(this.viewContainerRef);

    this.colorScheme.domain = [...this.statusMapping.values()].map(
      (labels) => this.taskService.statusColors.get(labels[0]) || '#000000',
    );
    this.loadRecentSnapshot();
  }

  refreshData() {
    const mergedData: TaskCodeStats = {};
    const recentSnapshot = this.snapshots[0]?.stats;

    if (!recentSnapshot) {
      this.data = [];
      this.campuses = [];
      return;
    }

    // combine all campuses

    this.campuses = [];
    this.tutorials = [];

    recentSnapshot &&
      Object.entries(recentSnapshot).forEach(([campus, campusData]) => {
        this.campuses.push(campus);
        Object.entries(campusData).forEach(([tutorial, tutorialData]) => {
          if (!this.tutorials.includes(tutorial)) {
            this.tutorials.push(tutorial);
          }
          Object.entries(tutorialData).forEach(([taskDef, counts]) => {
            mergedData[taskDef] = mergedData[taskDef] || {};
            Object.entries(counts).forEach(([status, value]) => {
              mergedData[taskDef][status] = (mergedData[taskDef][status] || 0) + value;
            });
          });
        });
      });

    // if a campus filter is set, use only that campus
    this.dataSource =
      this.campusFilter && this.campusFilter !== 'all' && recentSnapshot[this.campusFilter]
        ? this.aggregateCampusData(recentSnapshot[this.campusFilter])
        : mergedData;

    // build chart series
    const data = Object.entries(this.dataSource).map(([taskDef, counts]) => ({
      name: taskDef,
      series: this.groupStatuses(counts),
    }));

    this.data = data;
  }

  private aggregateCampusData(campusData: TutorialStats): TaskCodeStats {
    return Object.values(campusData).reduce((acc, tutorialData) => {
      Object.entries(tutorialData).forEach(([taskDef, counts]) => {
        acc[taskDef] = acc[taskDef] || {};
        Object.entries(counts).forEach(([status, value]) => {
          acc[taskDef][status] = (acc[taskDef][status] || 0) + value;
        });
      });
      return acc;
    }, {} as TaskCodeStats);
  }

  onSelect(event: any) {
    console.log(event);
  }

  private groupStatuses(data: TaskStatusCounts): {name: string; value: number}[] {
    const grouped = Array.from(this.statusMapping.entries()).map(([group, statuses]) => ({
      name: group,
      value: statuses.reduce((sum: number, status: string) => sum + (data[status] ?? 0), 0),
    }));
    return grouped;
  }

  loadRecentSnapshot(): void {
    this.unit.getTaskCompletionSnapshots(undefined, undefined, 1).subscribe({
      next: (data) => {
        this.snapshots = data as TaskCompletionSnapshot[];
        this.refreshData();
      },
      error: (error) => {
        console.log('Snapshot load failed', error);
      },
    });
  }

  captureNow(): void {
    this.unit.captureTaskCompletionSnapshot().subscribe({
      next: (snapshot) => {
        console.log('Snapshot captured successfully', 4000);
        this.loadRecentSnapshot();
      },
      error: (error) => {
        console.log('Snapshot capture failed', error);
      },
    });
  }
}
