import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NotificationGroup} from 'src/app/api/models/notification';
import {NotificationService} from 'src/app/api/services/notification.service';
import {NotificationActionsService} from 'src/app/notifications/notification-actions.service';

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
  public markingAllRead = false;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private notificationActions: NotificationActionsService,
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
    this.notificationActions.open(group);
  }

  public markAllRead(): void {
    if (this.unreadCount === 0 || this.markingAllRead) {
      return;
    }

    this.markingAllRead = true;
    const subscription = this.notificationService.markAllRead().subscribe({
      next: () => {
        this.groups = [];
        this.unreadCount = 0;
        this.markingAllRead = false;
      },
      error: () => {
        this.markingAllRead = false;
      },
    });
    this.subscriptions.push(subscription);
  }

  public summaryText(group: NotificationGroup): string {
    // The task is already shown beside the text, so only the detail is needed.
    return group.task ? group.detail : group.summary;
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.notificationService.stopCountPolling();
  }
}
