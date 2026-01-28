import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {Observable} from 'rxjs';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {UserService} from 'src/app/api/services/user.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

interface SessionEvent {
  start: Date;
  end: Date;
  startHour: string;
  endHour: string;
  title: string;
  color: {
    primary: string;
    secondary: string;
  };
  userId: number;
  commentsAdded: number;
  assessments: number;
  submissionsOpened: number;
  duration: number;
  duringTutorial: boolean;
  tutorName: string;
}

@Component({
  selector: 'f-analytics-tutor-times',
  templateUrl: 'analytics-tutor-times.component.html',
  styleUrls: ['analytics-tutor-times.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
  events: SessionEvent[] = [];
  filteredEvents = [];

  // hold data for new cards and chart
  totalMinutes: number = 0;
  totalAssessments: number = 0;
  avgMinPerAssessments: number = 0;
  totalSubmissionsOpened: number = 0;
  weekChartData: {name: string; series: {name: string; value: number}[]}[] = [];

  tutorTimeSummaryStartDate: Date;
  tutorTimeSummaryEndDate: Date;
  daysInWeek: number = 7;

  hideSessionsDuringTutorials: boolean = false;

  public canLoadSessions: boolean = false;
  public isLoading: boolean = false;

  constructor(
    private alertService: AlertService,
    private sidekiqProgressModalService: SidekiqProgressModalService,
    private fileDownloaderService: FileDownloaderService,
    private userService: UserService,
  ) {}

  get role() {
    return this.unit.staff.find((s) => s.user.id === this.userService.currentUser.id)?.role;
  }

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

  public onToggleChangeHideSessionsDuringTutorial() {
    setTimeout(() => {
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredEvents = this.events.filter(
      (e) =>
        (this.selectedUserId === null || e.userId === this.selectedUserId) &&
        (!this.hideSessionsDuringTutorials || !e.duringTutorial) &&
        e.duration >= 0,
    );

    // recalcuate stats when filter sekection changes
    this.calculateAnalytics();
  }

  calculateAnalytics() {
    this.totalMinutes = 0;
    this.totalAssessments = 0;
    this.totalSubmissionsOpened = 0;

    const groupedMap = new Map<string, {time: number; count: number}>();
    const iterDate = new Date(this.tutorTimeSummaryStartDate);
    const endDate = new Date(this.tutorTimeSummaryEndDate);

    // Normalize to midnight
    iterDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Loop through the date range to create "buckets"
    while (iterDate <= endDate) {
      const label = iterDate.toLocaleDateString('en-AU', {weekday: 'short', day: 'numeric'});
      groupedMap.set(label, {time: 0, count: 0});
      iterDate.setDate(iterDate.getDate() + 1);
    }

    this.filteredEvents.forEach((event) => {
      const duration = event.duration;

      this.totalMinutes += duration;
      this.totalAssessments += event.assessments || 0;
      this.totalSubmissionsOpened += event.submissionsOpened || 0;

      const label = event.start.toLocaleDateString('en-AU', {weekday: 'short', day: 'numeric'});

      if (groupedMap.has(label)) {
        const currentVal = groupedMap.get(label)!;
        currentVal.time += duration;
        currentVal.count += event.assessments || 0;
      }
    });

    this.avgMinPerAssessments =
      this.totalAssessments > 0 ? this.totalMinutes / this.totalAssessments : 0;

    this.weekChartData = Array.from(groupedMap, ([name, data]) => ({
      name,
      series: [
        {name: 'Time (hrs)', value: data.time / 60},
        {name: 'Assessments', value: data.count},
      ],
    }));
  }

  public formatDataLabel = (value: number): string => {
    return value === 0 ? '' : value.toString();
  };

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

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.downloadCsvFn(
      this.unit.downloadTutorTimesSummaryCsv(
        this.tutorTimeSummaryStartDate,
        this.tutorTimeSummaryEndDate,
        tz,
        this.hideSessionsDuringTutorials,
      ),
      'Tutor Times Summary CSV',
      `${this.unit.code}-tutor-times-summary-${start}-to-${end}-${tz}-${!this.hideSessionsDuringTutorials ? 'incl-tutorials' : ''}.csv`,
    );
  }

  public getMyTutorTimesSessions() {
    const start = `${this.tutorTimeSummaryStartDate.getFullYear()}-${(this.tutorTimeSummaryStartDate.getMonth() + 1).toString().padStart(2, '0')}-${this.tutorTimeSummaryStartDate.getDate().toString().padStart(2, '0')}`;
    const end = `${this.tutorTimeSummaryEndDate.getFullYear()}-${(this.tutorTimeSummaryEndDate.getMonth() + 1).toString().padStart(2, '0')}-${this.tutorTimeSummaryEndDate.getDate().toString().padStart(2, '0')}`;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.downloadCsvFn(
      this.unit.downloadMyTutorTimeSessionsCsv(
        this.tutorTimeSummaryStartDate,
        this.tutorTimeSummaryEndDate,
        tz,
      ),
      'My Marking Sessions CSV',
      `${this.unit.code}-${this.userService.currentUser.name}-sessions-${start}-to-${end}-${tz}.csv`,
    );
  }

  public getMarkingSesssions() {
    if (!this.canLoadSessions) {
      return;
    }

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.canLoadSessions = false;
    this.isLoading = true;
    this.unit
      .getUserMarkingSessions(this.tutorTimeSummaryStartDate, this.tutorTimeSummaryEndDate, tz)
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.canLoadSessions = false;
          this.events = data.map((session) => {
            const tutor = this.unit.staff.find((t) => t.user.id === session.user.id);

            const primary = this.stringToHexColor(tutor.user.firstName);
            const secondary = this.stringToHexColor(tutor.user.firstName);
            return {
              start: new Date(session.startTime),
              end: new Date(session.endTime),
              startHour: new Date(session.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }),
              endHour: new Date(session.endTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }),
              title: `${tutor?.user.firstName} (${session.durationMinutes}m) ${session.duringTutorial ? '(T)' : ''}`,
              color: {primary: secondary, secondary: primary},
              userId: session.user.id,
              commentsAdded: session.commentsAdded,
              assessments: session.assessments,
              submissionsOpened: session.submissionsOpened,
              duration: session.durationMinutes,
              duringTutorial: session.duringTutorial,
              tutorName: tutor?.user.firstName,
            };
          });

          this.applyFilters();
        },
        error: (error) => {
          this.canLoadSessions = false;
          this.alertService.error(`Failed to load sessions: ${error}`, 6000);
          console.error(error);
        },
      });
  }

  eventClicked({event}: {event: SessionEvent}): void {
    if (event.userId !== undefined) {
      if (this.selectedUserId === null) {
        this.selectedUserId = Number(event.userId);
      } else {
        this.selectedUserId = null;
      }
      this.applyFilters();
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
