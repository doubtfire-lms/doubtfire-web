import {HttpClient} from '@angular/common/http';
import {Component, Input, OnInit} from '@angular/core';
import {CalendarEvent} from 'angular-calendar';
import {Observable} from 'rxjs';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {UserService} from 'src/app/api/services/user.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-unit-analytics',
  templateUrl: 'unit-analytics-route.component.html',
  styleUrls: ['unit-analytics-route.component.scss'],
})
export class UnitAnalyticsComponent implements OnInit {
  @Input() unit: Unit;

  selectedUserId: number | null = null;

  viewDate = new Date();
  events = [];
  filteredEvents = [];

  tutorTimeSummaryStartDate: Date;
  tutorTimeSummaryEndDate: Date;

  constructor(
    private sidekiqProgressModalService: SidekiqProgressModalService,
    private alertsService: AlertService,
    private fileDownloaderService: FileDownloaderService,
    private userService: UserService,
  ) {}

  get role() {
    return this.unit.staff.find((s) => s.user.id === this.userService.currentUser.id)?.role;
  }

  goPreviousWeek() {
    this.viewDate = new Date(this.viewDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    this.getMarkingSesssions();
  }

  goTodayWeek() {
    this.viewDate = new Date();
    this.getMarkingSesssions();
  }
  goNextWeek() {
    this.viewDate = new Date(this.viewDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    this.getMarkingSesssions();
  }

  ngOnInit(): void {
    this.tutorTimeSummaryEndDate = new Date();
    this.tutorTimeSummaryStartDate = new Date(
      this.tutorTimeSummaryEndDate.getTime() - 7 * 24 * 60 * 60 * 1000,
    );

    this.getMarkingSesssions();
  }

  public getTaskCompletionCsv() {
    this.downloadCsv(
      this.unit.downloadTaskCompletionCsv(),
      'Task Completion Stats CSV',
      `${this.unit.code}-task-completion-stats.csv`,
    );
  }

  public getTutorAssessmentCsv() {
    this.downloadCsv(
      this.unit.downloadTutorAssessmentCsv(),
      'Tutor Assessment Stats CSV',
      `${this.unit.code}-tutor-assessment-stats.csv`,
    );
  }

  public getTasksAwaitingFeedbackCsv() {
    this.downloadCsv(
      this.unit.downloadTasksAwaitingFeedbackCsv(),
      'Tasks Awaiting Feedback CSV',
      `${this.unit.code}-tasks-awaiting-feedback.csv`,
    );
  }

  public getTaskAssessmentCountCsv() {
    this.downloadCsv(
      this.unit.downloadTaskAssessmentCountsCsv(),
      'Task Assessment Counts CSV',
      `${this.unit.code}-task-assessment-counts.csv`,
    );
  }

  public getTutorTimesSummary() {
    // const start = this.tutorTimeSummaryStartDate.toISOString().split('T')[0];
    // const end = this.tutorTimeSummaryEndDate.toISOString().split('T')[0];

    const startOfWeek = new Date(this.viewDate);
    startOfWeek.setDate(this.viewDate.getDate() - this.viewDate.getDay()); // Sunday

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    console.log(`start of week is ${startOfWeek.toString()}`);
    console.log(`end of week is ${endOfWeek.toString()}`);

    this.downloadCsv(
      this.unit.downloadTutorTimesSummaryCsv(startOfWeek, endOfWeek),
      'Tutor Times Summary CSV',
      `${this.unit.code}-tutor-times-summary-${startOfWeek}-to-${endOfWeek}.csv`,
    );
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

  public getMarkingSesssions() {
    const user = this.userService.currentUser;
    this.events = [];

    const startOfWeek = new Date(this.viewDate);
    startOfWeek.setDate(this.viewDate.getDate() - this.viewDate.getDay()); // Sunday

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    this.userService.getTutors().subscribe((tutors) => {
      console.log(tutors);
      this.unit.getUserMarkingSessions(startOfWeek, endOfWeek).subscribe({
        next: (data) => {
          this.events = data.map((row) => {
            const tutor = tutors.find((t) => t.id === row['user_id']);
            // const {primary, secondary} = this.stringToColors(tutor.name);
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
          console.error(error);
        },
      });
    });
  }

  eventClicked({event}: {event: CalendarEvent}): void {
    console.log('Event clicked', event);
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

  private downloadCsv(newJob: Observable<SidekiqJob>, title: string, filename: string) {
    newJob.subscribe({
      next: (job) => {
        if (!job || !job.id) {
          return this.alertsService.error(`Failed to download ${title}`, 6000);
        }
        this.sidekiqProgressModalService.show(`Downloading ${title}`, job.id).subscribe((job) => {
          const blob = new Blob([job.result], {type: 'text/csv'});
          const url = URL.createObjectURL(blob);

          this.fileDownloaderService.downloadBlobToFile(url, filename);
        });
      },
      error: (_error) => {
        this.alertsService.error(`Could not download ${title}`, 6000);
      },
    });
  }
}
