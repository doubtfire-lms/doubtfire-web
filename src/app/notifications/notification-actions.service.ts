import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, map, of, tap} from 'rxjs';
import {NotificationGroup} from 'src/app/api/models/notification';
import {NotificationService} from 'src/app/api/services/notification.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {TutorNotesModalService} from 'src/app/common/modals/tutor-notes-modal/tutor-notes-modal.service';
import {DashboardViews} from 'src/app/projects/states/dashboard/selected-task.service';

/**
 * Where a notification takes you when it is opened.
 *
 * Most land on the task, but some have somewhere more useful to go: a failed
 * overseer run opens its report, and a moderation note opens the tab it was
 * written on. The task dashboard reads these off the query string, so the
 * destination survives the navigation and the task loading afterwards.
 */
@Injectable({providedIn: 'root'})
export class NotificationActionsService {
  constructor(
    private notificationService: NotificationService,
    private unitService: UnitService,
    private tutorNotesModal: TutorNotesModalService,
    private router: Router,
  ) {}

  public open(group: NotificationGroup): void {
    if (group.counts?.communication_email) {
      const navigate = () =>
        this.router.navigate(['/notifications'], {
          queryParams: {expanded: group.notificationIds[0]},
        });

      if (group.read) {
        navigate();
      } else {
        this.notificationService.markRead(group.notificationIds).subscribe({
          next: navigate,
          error: navigate,
        });
      }
      return;
    }

    // The task's Mod Notes tab shows its own tutor's thread, so a note about
    // anyone else opens as a thread of its own.
    if (group.tutorNoteNotificationIds.length && !group.tutorNoteOnTaskTutor) {
      this.openTutorNotes(group).subscribe();
      return;
    }

    if (
      !group.task &&
      group.projectId &&
      (group.counts.portfolio_ready || group.counts.portfolio_failed)
    ) {
      const projectId = group.projectId;
      const navigate = () => this.router.navigate(['/projects', projectId, 'portfolio']);

      if (group.read) {
        navigate();
      } else {
        this.notificationService.markRead(group.notificationIds).subscribe({
          next: navigate,
          error: navigate,
        });
      }
      return;
    }

    if (!group.task) {
      this.router.navigate(['/notifications']);
      return;
    }

    const navigate = () =>
      this.router.navigate(this.commandsFor(group), {
        queryParams: this.queryParamsFor(group),
      });

    if (group.read) {
      void navigate();
      return;
    }

    // Only consume a task notification once its destination has opened. This
    // keeps it unread when navigation is cancelled or fails.
    void navigate()
      .then((opened) => {
        if (opened) {
          this.notificationService.markRead(group.notificationIds).subscribe({
            error: () => undefined,
          });
        }
      })
      .catch(() => undefined);
  }

  /**
   * Opens the moderation notes for a group, focused on its most recent note. The
   * notification stays unread until the note itself is marked as read.
   */
  public openTutorNotes(group: NotificationGroup): Observable<void> {
    if (!group.tutorNoteUnitRoleId) {
      return of(undefined);
    }

    return this.unitService.get(group.unit.id).pipe(
      map((unit) => {
        const unitRole = unit.staff.find((role) => role.id === group.tutorNoteUnitRoleId);
        if (unitRole) {
          unitRole.unit = unit;
        }
        return unitRole;
      }),
      tap((unitRole) => {
        if (unitRole) {
          this.tutorNotesModal.show(undefined, unitRole, group.tutorNoteIds.at(-1));
        }
      }),
      map(() => undefined),
    );
  }

  private commandsFor(group: NotificationGroup): unknown[] {
    return ['/projects', group.task.projectId, 'dashboard', group.task.abbreviation];
  }

  private queryParamsFor(group: NotificationGroup): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    if (group.task.staffView) {
      params.tutor = true;
    }

    if (group.overseerAssessmentId) {
      params.overseerAssessmentId = group.overseerAssessmentId;
    } else if (group.tutorNoteNotificationIds.length) {
      params.view = DashboardViews[DashboardViews.tutor_notes];
    }

    return params;
  }
}
