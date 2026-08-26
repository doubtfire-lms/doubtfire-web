import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {Router} from '@angular/router';
import {Subscription, combineLatest} from 'rxjs';
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
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {NotificationActionsService} from './notification-actions.service';

@Component({
  selector: 'f-notifications',
  templateUrl: './notifications.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class NotificationsComponent implements OnInit, OnDestroy {
  public readonly categories: {kind: NotificationKind; label: string}[] = [
    {kind: 'new_task_comment', label: 'Feedback and messages'},
    {kind: 'task_status_changed', label: 'Task status changes'},
    {kind: 'overseer_failed', label: 'Automated assessment failures'},
    {kind: 'pdf_generation_failed', label: 'PDF generation failures'},
    {kind: 'discuss_warning', label: 'Discussion deadline warnings'},
    {kind: 'discuss_expired', label: 'Discussion deadline expiries'},
    {kind: 'moderation_note_added', label: 'Moderation notes added'},
    {kind: 'moderation_note_reply', label: 'Moderation note replies'},
    {kind: 'moderation_note_from_mentee', label: 'Notes from staff you mentor'},
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

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private unitService: UnitService,
    private tutorNotesModal: TutorNotesModalService,
    private notificationActions: NotificationActionsService,
    private globalState: GlobalStateService,
    private alerts: AlertService,
  ) {}

  public ngOnInit(): void {
    this.notificationService.startCountPolling();
    this.loadNotifications();

    this.subscriptions.push(
      combineLatest([
        this.globalState.unitRolesSubject,
        this.globalState.projectsSubject,
      ]).subscribe(([unitRoles, projects]) => {
        const units: Map<number, NotificationUnit> = new Map();
        for (const unit of [
          ...(unitRoles ?? []).map((unitRole) => unitRole.unit),
          ...(projects ?? []).map((project) => project.unit),
        ]) {
          if (unit) {
            units.set(unit.id, {id: unit.id, code: unit.code, name: unit.name});
          }
        }

        this.units = [...units.values()].sort((a, b) => a.code.localeCompare(b.code));
      }),
    );
  }

  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
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
    this.notificationActions.open(group);
  }

  public openTutorNotes(group: NotificationGroup): void {
    this.notificationActions.openTutorNotes(group).subscribe({
      next: () => this.loadNotifications(),
      error: () => this.alerts.error('Unable to load tutor notes', 4000),
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

  public count(group: NotificationGroup, kind: NotificationKind): number {
    return group.counts[kind] ?? 0;
  }

  public moderationCount(group: NotificationGroup): number {
    return (
      this.count(group, 'moderation_note_added') +
      this.count(group, 'moderation_note_reply') +
      this.count(group, 'moderation_note_from_mentee')
    );
  }
}
