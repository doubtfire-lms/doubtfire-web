import {Component} from '@angular/core';

type EngagementType = 'attendance' | 'forum' | 'email' | 'negative';

interface EngagementStamp {
  type: EngagementType;
  label: string;
  icon: string;
}

interface EngagementWeek {
  week: number;
  stamps: EngagementStamp[];
}

interface EngagementLegendItem {
  type: EngagementType;
  label: string;
  icon: string;
}

@Component({
  selector: 'f-engagement-passport-card',
  templateUrl: './engagement-passport-card.component.html',
  styleUrl: './engagement-passport-card.component.scss',
  standalone: false,
})
export class EngagementPassportCardComponent {
  readonly currentWeek = 7;

  readonly legend: EngagementLegendItem[] = [
    {type: 'attendance', label: 'Class attendance', icon: 'groups'},
    {type: 'forum', label: 'Forum post', icon: 'forum'},
    {type: 'email', label: 'Tutor email', icon: 'mail'},
    {type: 'negative', label: 'Needs attention', icon: 'thumb_down'},
  ];

  readonly weeks: EngagementWeek[] = [
    {
      week: 1,
      stamps: [this.stamp('attendance', 'Attended the unit welcome class')],
    },
    {
      week: 2,
      stamps: [
        this.stamp('attendance', 'Attended the weekly class'),
        this.stamp('forum', 'Introduced themselves on the unit forum'),
      ],
    },
    {
      week: 3,
      stamps: [
        this.stamp('attendance', 'Discussed their task plan in class'),
        this.stamp('email', 'Followed up with their tutor by email'),
      ],
    },
    {
      week: 4,
      stamps: [
        this.stamp('attendance', 'Attended the weekly class'),
        this.stamp('forum', 'Shared a useful resource on the forum'),
        this.stamp('forum', 'Replied to another student'),
      ],
    },
    {
      week: 5,
      stamps: [
        this.stamp('attendance', 'Asked for feedback during class'),
        this.stamp('email', 'Clarified assessment feedback by email'),
      ],
    },
    {
      week: 6,
      stamps: [
        this.stamp('attendance', 'Attended the weekly class'),
        this.stamp('forum', 'Posted a progress update'),
        this.stamp('negative', 'Missed an agreed tutor check-in'),
      ],
    },
    {
      week: 7,
      stamps: [
        this.stamp('attendance', 'Attended the weekly class'),
        this.stamp('attendance', 'Joined an additional help session'),
        this.stamp('forum', 'Started a forum discussion'),
        this.stamp('forum', 'Helped answer a peer question'),
        this.stamp('email', 'Sent their tutor a project update'),
      ],
    },
    {
      week: 8,
      stamps: [
        this.stamp('attendance', 'Discussed their mid-semester progress'),
        this.stamp('email', 'Responded to a tutor check-in'),
      ],
    },
    {
      week: 9,
      stamps: [
        this.stamp('attendance', 'Attended the weekly class'),
        this.stamp('forum', 'Shared an example with the class'),
        this.stamp('negative', 'Required a reminder about participation'),
      ],
    },
    {
      week: 10,
      stamps: [
        this.stamp('attendance', 'Attended the weekly class'),
        this.stamp('forum', 'Posted a task reflection'),
      ],
    },
    {
      week: 11,
      stamps: [
        this.stamp('attendance', 'Demonstrated their work in class'),
        this.stamp('forum', 'Answered a technical forum question'),
        this.stamp('forum', 'Posted supporting screenshots'),
        this.stamp('email', 'Requested targeted tutor feedback'),
      ],
    },
    {
      week: 12,
      stamps: [
        this.stamp('attendance', 'Attended the weekly class'),
        this.stamp('attendance', 'Joined a consultation session'),
        this.stamp('email', 'Confirmed their final task plan'),
      ],
    },
    {
      week: 13,
      stamps: [
        this.stamp('attendance', 'Attended the weekly class'),
        this.stamp('attendance', 'Joined the final consultation session'),
        this.stamp('forum', 'Shared a final progress update'),
        this.stamp('forum', 'Answered a peer question'),
        this.stamp('forum', 'Posted their final reflection'),
        this.stamp('forum', 'Shared a useful revision resource'),
        this.stamp('email', 'Requested final tutor feedback'),
        this.stamp('email', 'Requested final tutor feedback'),
        this.stamp('email', 'Responded to a teaching team check-in'),
        this.stamp('negative', 'Missed an agreed progress milestone'),
      ],
    },
    {
      week: 14,
      stamps: [this.stamp('attendance', 'Completed an end-of-semester check-in')],
    },
  ];

  stampColumns(stamps: EngagementStamp[]): EngagementStamp[][] {
    const columns: EngagementStamp[][] = [];

    for (let index = 0; index < stamps.length; index += 5) {
      columns.push(stamps.slice(index, index + 5));
    }

    return columns;
  }

  weekWidth(stamps: EngagementStamp[]): number {
    const columnCount = Math.max(1, Math.ceil(stamps.length / 5));
    const stampWidth = 30;
    const columnGap = 5;
    const horizontalPadding = 16;

    return Math.max(
      58,
      columnCount * stampWidth + (columnCount - 1) * columnGap + horizontalPadding,
    );
  }

  private stamp(type: EngagementType, label: string): EngagementStamp {
    const icon = this.legend.find((item) => item.type === type)?.icon ?? 'star';
    return {type, label, icon};
  }
}
