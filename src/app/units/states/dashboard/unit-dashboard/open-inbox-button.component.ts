import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import type {DashboardInboxPreset} from '../../tasks/inbox/unit-task-inbox-state.component';

@Component({
  selector: 'f-open-inbox-button',
  imports: [MatIconModule, RouterLink],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    @if (unreadMessagesCount !== undefined) {
      <p class="my-6 flex items-center justify-center gap-2">
        <mat-icon aria-hidden="true">mail_outline</mat-icon>
        {{ unreadMessagesCount === 'Unavailable' ? '—' : (unreadMessagesCount ?? '...') }}
        unread {{ unreadMessagesCount === 1 ? 'message' : 'messages' }}
      </p>
    }
    <a
      class="inline-block cursor-pointer rounded-md bg-formatif-blue px-7 py-3 text-white no-underline hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-formatif-blue"
      routerLink="../tasks/inbox"
      [queryParams]="viewAsUnitRoleId === null ? null : {viewAsUnitRoleId, students: 'mine'}"
      [state]="dashboardInboxPreset ? {dashboardInboxPreset} : undefined"
    >
      Open inbox
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenInboxButtonComponent {
  @Input() unreadMessagesCount?: number | 'Unavailable' | null;
  @Input() viewAsUnitRoleId?: number;
  @Input() dashboardInboxPreset?: DashboardInboxPreset;
}
