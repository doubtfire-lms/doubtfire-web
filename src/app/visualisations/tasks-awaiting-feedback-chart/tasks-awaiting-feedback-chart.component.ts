import {BoxChartSeries, LegendPosition} from '@glitchtip/ng-charts';
import {HttpClient} from '@angular/common/http';
import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription, interval, startWith, switchMap, takeWhile} from 'rxjs';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {AlertService} from 'src/app/common/services/alert.service';
import API_URL from 'src/app/config/constants/apiUrl';

interface FeedbackDayValues {
  days: number[];
  calendarDays: number[];
}

@Component({
  selector: 'f-tasks-awaiting-feedback-chart',
  templateUrl: './tasks-awaiting-feedback-chart.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TasksAwaitingFeedbackChartComponent implements OnInit, OnDestroy {
  @Input() unit: Unit;

  public data: BoxChartSeries[] = [];
  public readonly legendPosition = LegendPosition.Below;
  public isLoading = true;

  private subscription?: Subscription;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.subscription = this.unit.downloadTasksAwaitingFeedbackCsv().subscribe({
      next: (job) => {
        if (!job?.id) {
          this.showError('Could not load tasks awaiting feedback');
          return;
        }

        this.subscription?.add(
          interval(1250)
            .pipe(
              startWith(0),
              switchMap(() => this.httpClient.get<SidekiqJob>(`${API_URL}/sidekiq/${job.id}`)),
              takeWhile(
                (currentJob) => currentJob.status !== 'complete' && currentJob.status !== 'failed',
                true,
              ),
            )
            .subscribe({
              next: (completedJob) => {
                if (completedJob.status === 'failed') {
                  this.showError('Could not load tasks awaiting feedback');
                  return;
                }
                if (completedJob.status === 'complete') {
                  this.data = this.parseCsv(completedJob.result);
                  this.isLoading = false;
                }
              },
              error: () => this.showError('Could not load tasks awaiting feedback'),
            }),
        );
      },
      error: () => this.showError('Could not load tasks awaiting feedback'),
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private showError(message: string): void {
    this.isLoading = false;
    this.alertService.error(message, 6000);
  }

  private parseCsv(csv: string): BoxChartSeries[] {
    const rows = this.parseRows(csv);
    if (rows.length < 2) {
      return [];
    }

    const header = new Map(rows[0].map((value, index) => [value, index]));
    const tutorIndex = header.get('Tutor');
    const daysIndex = header.get('Days Awaiting Feedback');
    const calendarDaysIndex = header.get('Days Awaiting Feedback (Incl. Breaks)');
    if (tutorIndex === undefined || daysIndex === undefined || calendarDaysIndex === undefined) {
      this.showError('The task awaiting feedback data has an unexpected format');
      return [];
    }

    const valuesByTutor: Map<string, FeedbackDayValues> = new Map<string, FeedbackDayValues>();
    rows.slice(1).forEach((row) => {
      const days = Number(row[daysIndex]);
      const calendarDays = Number(row[calendarDaysIndex]);
      if (!Number.isFinite(days) || days <= 0 || !Number.isFinite(calendarDays)) {
        return;
      }

      const tutor = row[tutorIndex]?.trim() || 'Unassigned';
      const values = valuesByTutor.get(tutor) ?? {days: [], calendarDays: []};
      values.days.push(days);
      values.calendarDays.push(calendarDays);
      valuesByTutor.set(tutor, values);
    });

    return Array.from(valuesByTutor.entries()).flatMap(([tutor, values]) => [
      {
        name: tutor,
        series: values.days.map((value, index) => ({name: `Task ${index + 1}`, value})),
      },
      {
        name: `${tutor} (incl. breaks)`,
        series: values.calendarDays.map((value, index) => ({name: `Task ${index + 1}`, value})),
      },
    ]);
  }

  private parseRows(csv: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let quoted = false;

    for (let index = 0; index < csv.length; index += 1) {
      const character = csv[index];
      const nextCharacter = csv[index + 1];
      if (character === '"' && quoted && nextCharacter === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = !quoted;
      } else if (character === ',' && !quoted) {
        row.push(field);
        field = '';
      } else if ((character === '\n' || character === '\r') && !quoted) {
        if (character === '\r' && nextCharacter === '\n') {
          index += 1;
        }
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += character;
      }
    }

    if (field || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  }
}
