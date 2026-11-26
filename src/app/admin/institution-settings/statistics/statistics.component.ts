import {HttpClient} from '@angular/common/http';
import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {EMPTY, Subject, Subscription, catchError, finalize, merge, switchMap, timer} from 'rxjs';
import API_URL from 'src/app/config/constants/apiUrl';

type ActivityWindow =
  'fiveMinutes' | 'fifteenMinutes' | 'thirtyMinutes' | 'oneHour' | 'twentyFourHours' | 'sevenDays';

interface InstitutionStatistics {
  activeUsers: Record<ActivityWindow, number>;
  totalUsers: number;
  diskSpaceGb: number | null;
  sidekiq: {
    activeJobs: {jobClass: string; queue: string}[];
    queuedJobs: number;
    queues: {name: string; size: number}[];
  } | null;
  portfolioCompilation: {
    queuedProjects: number;
    waitingProjects: number;
    claimedProjects: number;
  };
}

@Component({
  selector: 'institution-statistics',
  templateUrl: 'statistics.component.html',
  styleUrls: ['statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class StatisticsComponent implements OnInit, OnDestroy {
  public readonly activityWindows: {value: ActivityWindow; label: string}[] = [
    {value: 'fiveMinutes', label: '5 min'},
    {value: 'fifteenMinutes', label: '15 min'},
    {value: 'thirtyMinutes', label: '30 min'},
    {value: 'oneHour', label: '1 hour'},
    {value: 'twentyFourHours', label: '24 hours'},
    {value: 'sevenDays', label: '7 days'},
  ];

  public selectedWindow: ActivityWindow = 'fiveMinutes';
  public statistics?: InstitutionStatistics;
  public loading = true;
  public refreshing = false;
  public error = false;

  private readonly refreshRequests: Subject<void> = new Subject();
  private subscription?: Subscription;

  constructor(private httpClient: HttpClient) {}

  public ngOnInit(): void {
    this.subscription = merge(timer(0, 30_000), this.refreshRequests)
      .pipe(
        switchMap(() => {
          this.refreshing = true;
          return this.httpClient.get<InstitutionStatistics>(`${API_URL}/admin/statistics`).pipe(
            catchError(() => {
              this.loading = false;
              this.error = true;
              return EMPTY;
            }),
            finalize(() => {
              this.refreshing = false;
            }),
          );
        }),
      )
      .subscribe((statistics) => {
        this.statistics = statistics;
        this.loading = false;
        this.error = false;
      });
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  public refresh(): void {
    this.refreshRequests.next();
  }

  public get activeUsers(): number {
    return this.statistics?.activeUsers[this.selectedWindow] ?? 0;
  }
}
