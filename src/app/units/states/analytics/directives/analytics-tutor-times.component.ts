import {Component, Input, OnInit} from '@angular/core';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {CalendarEvent} from 'angular-calendar';
import {Observable} from 'rxjs';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-analytics-tutor-times',
  templateUrl: 'analytics-tutor-times.component.html',
  styleUrls: ['analytics-tutor-times.component.scss'],
})
export class AnalyticsTutorTimesComponent implements OnInit {
  @Input() unit: Unit;

  @Input() downloadCsvFn!: (
    newJob: Observable<SidekiqJob>,
    title: string,
    filename: string,
  ) => void;

  selectedUserId: number | null = null;

  viewDate = new Date();
  events = [];
  filteredEvents = [];

  tutorTimeSummaryStartDate: Date;
  tutorTimeSummaryEndDate: Date;
  daysInWeek: number = 7;

  public canLoadSessions: boolean = false;
  public isLoading: boolean = false;

  constructor(
    private alertService: AlertService,
    private sidekiqProgressModalService: SidekiqProgressModalService,
    private fileDownloaderService: FileDownloaderService,
  ) {}

  ngOnInit(): void {
    if (!this.sidekiqProgressModalService || !this.fileDownloaderService) {
      // NOTE: Our `downloadCsvFn` callback requires these services because it calls `this` context
      console.error('Failed to load tutor times analytics');
    }

    this.tutorTimeSummaryEndDate = new Date();
    this.tutorTimeSummaryEndDate.setHours(0, 0, 0, 0);

    this.tutorTimeSummaryStartDate = new Date(this.tutorTimeSummaryEndDate);
    this.tutorTimeSummaryStartDate.setDate(this.tutorTimeSummaryEndDate.getDate() - 7);

    const startOfWeek = new Date(this.viewDate);
    startOfWeek.setDate(this.viewDate.getDate() - this.daysInWeek + 1);

    this.viewDate = startOfWeek;

    this.canLoadSessions = true;
    this.getMarkingSesssions();
  }

  goPreviousWeek() {
    this.canLoadSessions = true;
    this.viewDate = new Date(this.viewDate.getTime() - this.daysInWeek * 24 * 60 * 60 * 1000);
  }

  goNextWeek() {
    this.canLoadSessions = true;
    this.viewDate = new Date(this.viewDate.getTime() + this.daysInWeek * 24 * 60 * 60 * 1000);
  }

  goTodayWeek() {
    this.canLoadSessions = true;

    this.tutorTimeSummaryEndDate = new Date();
    this.tutorTimeSummaryStartDate = new Date(
      this.tutorTimeSummaryEndDate.getTime() - 7 * 24 * 60 * 60 * 1000,
    );
    this.daysInWeek = 7;

    this.viewDate = new Date();
    const startOfWeek = new Date();
    startOfWeek.setDate(this.viewDate.getDate() - this.daysInWeek + 1);

    this.viewDate = startOfWeek;
  }

  onDateChange(_event: MatDatepickerInputEvent<Date>) {
    if (!this.tutorTimeSummaryStartDate || !this.tutorTimeSummaryEndDate) {
      return;
    }

    // Includes both the selected start & end days
    const diffDays =
      Math.floor(
        (this.tutorTimeSummaryEndDate.getTime() - this.tutorTimeSummaryStartDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    if (diffDays > 366) {
      this.alertService.error('You cannot select more than a year', 3000);
      return;
    }
    console.log('diff days', diffDays);
    if (diffDays < 1) {
      this.tutorTimeSummaryStartDate = this.tutorTimeSummaryEndDate;
      this.alertService.error('End date must be on or after the start date');
      return;
    }
    this.canLoadSessions = true;
    this.daysInWeek = diffDays;
    this.viewDate = new Date(this.tutorTimeSummaryStartDate);
  }

  beforeViewRender(event): void {
    console.log(event.period.start);
    console.log(event.period.end);

    this.tutorTimeSummaryStartDate = event.period.start;
    this.tutorTimeSummaryEndDate = event.period.end;

    this.getMarkingSesssions();
  }

  public getTutorTimesSummary() {
    const start = `${this.tutorTimeSummaryStartDate.getFullYear()}-${(this.tutorTimeSummaryStartDate.getMonth() + 1).toString().padStart(2, '0')}-${this.tutorTimeSummaryStartDate.getDate().toString().padStart(2, '0')}`;
    const end = `${this.tutorTimeSummaryEndDate.getFullYear()}-${(this.tutorTimeSummaryEndDate.getMonth() + 1).toString().padStart(2, '0')}-${this.tutorTimeSummaryEndDate.getDate().toString().padStart(2, '0')}`;

    this.downloadCsvFn(
      this.unit.downloadTutorTimesSummaryCsv(
        this.tutorTimeSummaryStartDate,
        this.tutorTimeSummaryEndDate,
      ),
      'Tutor Times Summary CSV',
      `${this.unit.code}-tutor-times-summary-${start}-to-${end}.csv`,
    );
  }

  public getMarkingSesssions() {
    if (!this.canLoadSessions) {
      return;
    }

    this.canLoadSessions = false;
    this.isLoading = true;
    this.unit
      .getUserMarkingSessions(this.tutorTimeSummaryStartDate, this.tutorTimeSummaryEndDate)
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.canLoadSessions = false;
          this.events = data.map((row) => {
            const tutor = this.unit.staff.find((t) => t.user.id === row['user_id'])?.user;

            const primary = this.stringToHexColor(tutor.firstName);
            const secondary = this.stringToHexColor(tutor.firstName);
            return {
              start: new Date(row['start_time']),
              end: new Date(row['end_time']),
              // title: `${tutor?.firstName} (${row['duration_minutes']}m)<br/>${row['comments_added']} comments<br/>${row['assessments']} assessments<br/>${row['submissions_opened']} Submissions opened`,
              title: `${tutor?.firstName} (${row['duration_minutes']}m)`,
              color: {primary: secondary, secondary: primary},
              user_id: row['user_id'],
              comments_added: row['comments_added'],
              assessments: row['assessments'],
              submissions_opened: row['submissions_opened'],
              duration: row['duration_minutes'],
              name: tutor?.firstName,
            };
          });

          this.filteredEvents = this.events.filter(
            (row) => this.selectedUserId === null || row['user_id'] === this.selectedUserId,
          );

          console.log(data);
        },
        error: (error) => {
          this.canLoadSessions = false;

          console.error(error);
        },
      });
  }

  eventClicked({event}: {event: CalendarEvent}): void {
    if (event['user_id'] !== undefined) {
      if (this.selectedUserId === null) {
        this.selectedUserId = Number(event['user_id']);

        this.filteredEvents = this.events.filter(
          (row) => this.selectedUserId === null || row['user_id'] === this.selectedUserId,
        );
      } else {
        this.selectedUserId = null;

        this.filteredEvents = [...this.events];
        // this.getMarkingSesssions();
      }
    }
  }

  private stringToHexColor(
    name: string,
    opts?: {hue?: [number, number]; sat?: [number, number]; lit?: [number, number]},
  ): string {
    const options = {
      hue: opts?.hue || [0, 360],
      sat: opts?.sat || [40, 70], // lower saturation → softer color
      lit: opts?.lit || [75, 90], // higher lightness → pastel tone
    };

    const range = (hash: number, min: number, max: number) => {
      const diff = max - min;
      const x = ((hash % diff) + diff) % diff;
      return x + min;
    };

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }

    const h = range(hash, options.hue[0], options.hue[1]);
    const s = range(hash, options.sat[0], options.sat[1]) / 100;
    const l = range(hash, options.lit[0], options.lit[1]) / 100;

    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return Math.round(255 * color);
    };

    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
  }
}
