import {Component, Injector, Input, OnInit, ViewContainerRef} from '@angular/core';
import {TaskService} from 'src/app/api/services/task.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {Unit} from 'src/app/api/models/unit';
import {TooltipService} from '@swimlane/ngx-charts';
import {AlertService} from 'src/app/common/services/alert.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {SidekiqJobService} from 'src/app/api/services/sidekiq-job.service';
import {
  TaskCompletionSnapshot,
  TaskCodeStats,
  TaskStatusCounts,
  TutorialStats,
  TaskStatusEnum,
} from 'src/app/api/models/doubtfire-model';
import {filter, map, take} from 'rxjs/operators';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';

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
    private alertService: AlertService,
    private sidekiqProgressModalService: SidekiqProgressModalService,
    private sidekiqJobService: SidekiqJobService,
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

  private extractErrorMessage(error: any, fallback: string): string {
    if (typeof error === 'string' && error.trim().length > 0) {
      return error;
    }

    return fallback;
  }

  loadRecentSnapshot(): void {
    this.unit.getTaskCompletionSnapshots(undefined, undefined, 1).subscribe({
      next: (data) => {
        this.snapshots = data as TaskCompletionSnapshot[];
        this.refreshData();
      },
      error: (error) => {
        console.log('Snapshot load failed', error);
        const errorMessage = this.extractErrorMessage(
          error,
          'Failed to load task completion snapshot.',
        );
        this.alertService.error(errorMessage, 6000);
      },
    });
  }

  captureNow(): void {
    this.unit.captureTaskCompletionSnapshot().subscribe({
      next: (job) => {
        if (!job?.id) {
          this.alertService.error('Failed to capture task completion snapshot.', 6000);
          return;
        }

        this.sidekiqProgressModalService.show(
          `Capturing task completion snapshot for ${this.unit.code}`,
          job.id,
        );

        this.sidekiqJobService.sidekiqJobsSubject
          .pipe(
            map((jobs) => jobs.find((entry) => entry.job?.id === job.id)?.job),
            filter(
              (trackedJob): trackedJob is SidekiqJob =>
                !!trackedJob &&
                ['complete', 'failed', 'stopped', 'interrupted'].includes(trackedJob.status),
            ),
            take(1),
          )
          .subscribe((trackedJob) => {
            if (trackedJob.status === 'complete') {
              this.loadRecentSnapshot();
            }
          });
      },
      error: (error) => {
        console.log('Snapshot capture failed', error);
        const errorMessage = this.extractErrorMessage(
          error,
          'Failed to capture task completion snapshot.',
        );
        this.alertService.error(errorMessage, 6000);
      },
    });
  }
}
