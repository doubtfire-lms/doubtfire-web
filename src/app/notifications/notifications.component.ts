import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {Router} from '@angular/router';
import {
  NotificationGroup,
  NotificationKind,
  NotificationState,
  NotificationUnit,
} from 'src/app/api/models/notification';
import {NotificationService} from 'src/app/api/services/notification.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {TutorNotesModalService} from 'src/app/common/modals/tutor-notes-modal/tutor-notes-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-notifications',
  templateUrl: './notifications.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class NotificationsComponent implements OnInit {
  public readonly categories: {kind: NotificationKind; label: string}[] = [
    {kind: 'feedback_left', label: 'Feedback and messages'},
    {kind: 'task_status_changed', label: 'Task status changes'},
    {kind: 'overseer_failed', label: 'Automated assessment failures'},
    {kind: 'pdf_generation_failed', label: 'PDF generation failures'},
    {kind: 'discuss_warning', label: 'Discussion deadline warnings'},
    {kind: 'discuss_expired', label: 'Discussion deadline expiries'},
    {kind: 'tutor_note', label: 'Tutor notes'},
  ];

  public groups: NotificationGroup[] = [];
  public units: NotificationUnit[] = [];
  public loading = true;
  public loadFailed = false;
  public state: NotificationState = 'all';
  public selectedUnitId?: number;
  public selectedKinds: NotificationKind[] = [];
  public search = '';
  public page = 1;
  public perPage = 25;
  public total = 0;
  public unreadCount = 0;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private unitService: UnitService,
    private tutorNotesModal: TutorNotesModalService,
    private alerts: AlertService,
  ) {}

  public ngOnInit(): void {
    this.notificationService.startCountPolling();
    this.loadNotifications();
    this.loadUnits();
  }

  public loadNotifications(): void {
    this.loading = true;
    this.loadFailed = false;
    this.notificationService
      .getNotifications({
        state: this.state,
        unitId: this.selectedUnitId,
        kinds: this.selectedKinds,
        query: this.search.trim(),
        page: this.page,
        perPage: this.perPage,
      })
      .subscribe({
        next: (result) => {
          this.groups = result.groups;
          this.total = result.total;
          this.unreadCount = result.unreadCount;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.loadFailed = true;
          this.alerts.error('Unable to load notifications', 5000);
        },
      });
  }

  public applyFilters(): void {
    this.page = 1;
    this.loadNotifications();
  }

  public pageChanged(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.perPage = event.pageSize;
    this.loadNotifications();
  }

  public openTask(group: NotificationGroup): void {
    if (!group.task) {
      return;
    }

    const navigate = () => {
      const task = group.task;
      if (!task) {
        return;
      }

      const commands = ['/projects', task.projectId, 'dashboard', task.abbreviation];
      if (task.staffView) {
        this.router.navigate(commands, {queryParams: {tutor: true}});
      } else {
        this.router.navigate(commands);
      }
    };

    if (group.read) {
      navigate();
      return;
    }

    this.notificationService.markRead(group.notificationIds).subscribe({
      next: navigate,
      error: () => this.alerts.error('Unable to mark this notification as read', 4000),
    });
  }

  public openTutorNotes(group: NotificationGroup): void {
    if (!group.tutorNoteUnitRoleId) {
      return;
    }

    this.notificationService.markRead(group.tutorNoteNotificationIds).subscribe({
      next: () => {
        this.unitService.get(group.unit.id).subscribe({
          next: (unit) => {
            const unitRole = unit.staff.find((role) => role.id === group.tutorNoteUnitRoleId);
            if (!unitRole) {
              this.alerts.error('Unable to find the tutor notes for this notification', 4000);
              return;
            }

            this.tutorNotesModal.show(undefined, unitRole, group.tutorNoteIds.at(-1));
            this.loadNotifications();
          },
          error: () => this.alerts.error('Unable to load tutor notes', 4000),
        });
      },
      error: () => this.alerts.error('Unable to mark the tutor note notification as read', 4000),
    });
  }

  public markGroupRead(group: NotificationGroup): void {
    this.notificationService.markRead(group.notificationIds).subscribe({
      next: () => this.loadNotifications(),
      error: () => this.alerts.error('Unable to mark this notification as read', 4000),
    });
  }

  public markAllRead(): void {
    this.notificationService.markAllRead(this.selectedUnitId).subscribe({
      next: () => this.loadNotifications(),
      error: () => this.alerts.error('Unable to mark notifications as read', 4000),
    });
  }

  /** Units for the filter dropdown. Settings live on their own page. */
  public loadUnits(): void {
    this.notificationService.getPreferences().subscribe({
      next: (preferences) => (this.units = preferences.map((preference) => preference.unit)),
      error: () => undefined,
    });
  }

  public count(group: NotificationGroup, kind: NotificationKind): number {
    return group.counts[kind] ?? 0;
  }
}
