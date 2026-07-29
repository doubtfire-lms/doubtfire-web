import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NotificationGroup} from 'src/app/api/models/notification';
import {NotificationService} from 'src/app/api/services/notification.service';

@Component({
  selector: 'notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  host: {class: 'inline-flex items-center'},
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  public unreadCount = 0;
  public groups: NotificationGroup[] = [];
  public loading = false;
  public loadFailed = false;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    this.notificationService.startCountPolling();
    this.subscriptions.push(
      this.notificationService.unreadCount$.subscribe((count) => {
        this.unreadCount = count;
      }),
    );
  }

  public load(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.loadFailed = false;
    const subscription = this.notificationService
      .getNotifications({state: 'unread', page: 1, perPage: 5})
      .subscribe({
        next: (page) => {
          this.groups = page.groups;
          this.loading = false;
        },
        error: () => {
          this.loadFailed = true;
          this.loading = false;
        },
      });
    this.subscriptions.push(subscription);
  }

  public open(group: NotificationGroup): void {
    if (!group.task) {
      this.router.navigate(['/notifications']);
      return;
    }

    const task = group.task;
    const navigate = () => {
      const commands = ['/projects', task.projectId, 'dashboard', task.abbreviation];
      if (task.staffView) {
        this.router.navigate(commands, {queryParams: {tutor: true}});
      } else {
        this.router.navigate(commands);
      }
    };

    const subscription = this.notificationService.markRead(group.notificationIds).subscribe({
      next: navigate,
      error: navigate,
    });
    this.subscriptions.push(subscription);
  }

  public summaryText(group: NotificationGroup): string {
    if (!group.task) {
      return group.summary;
    }

    const separatorIndex = group.summary.indexOf(' — ');
    const text =
      separatorIndex >= 0 ? group.summary.slice(separatorIndex + ' — '.length) : group.summary;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.notificationService.stopCountPolling();
  }
}
