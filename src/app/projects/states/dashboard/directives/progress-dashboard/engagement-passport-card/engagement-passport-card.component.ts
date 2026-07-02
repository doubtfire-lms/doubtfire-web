import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {
  Engagement,
  EngagementService,
  Project,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {AddEngagementDialogComponent} from './add-engagement-dialog/add-engagement-dialog.component';
import {EngagementDetailDialogComponent} from './engagement-detail-dialog/engagement-detail-dialog.component';

interface EngagementPresentation {
  label: string;
  icon: string;
  classes: string;
}

interface EngagementStamp {
  engagement: Engagement;
  type: string;
  label: string;
  icon: string;
  classes: string;
}

interface EngagementWeek {
  week: number;
  stamps: EngagementStamp[];
}

interface EngagementLegendItem extends EngagementPresentation {
  type: string;
}

@Component({
  selector: 'f-engagement-passport-card',
  templateUrl: './engagement-passport-card.component.html',
  styleUrl: './engagement-passport-card.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class EngagementPassportCardComponent implements OnChanges {
  @Input() project: Project;

  loading = false;
  loadFailed = false;
  weeks: EngagementWeek[] = [];

  private readonly fallbackPresentation: EngagementPresentation = {
    label: 'Other engagement',
    icon: 'star',
    classes: 'border-gray-300 bg-gray-50 text-gray-700',
  };

  private readonly presentations: Record<string, EngagementPresentation> = {
    attendance: {
      label: 'Class attendance',
      icon: 'groups',
      classes: 'border-green-300 bg-green-50 text-green-700',
    },
    discussion: {
      label: 'Discussion',
      icon: 'record_voice_over',
      classes: 'border-cyan-300 bg-cyan-50 text-cyan-700',
    },
    forum: {
      label: 'Forum post',
      icon: 'forum',
      classes: 'border-blue-300 bg-blue-50 text-blue-700',
    },
    email: {
      label: 'Tutor email',
      icon: 'mail',
      classes: 'border-violet-300 bg-violet-50 text-violet-700',
    },
    attention: {
      label: 'Needs attention',
      icon: 'feedback',
      classes: 'border-yellow-300 bg-yellow-50 text-yellow-700',
    },
  };

  readonly legend: EngagementLegendItem[] = Object.entries(this.presentations).map(
    ([type, presentation]) => ({type, ...presentation}),
  );

  constructor(
    private engagementService: EngagementService,
    private dialog: MatDialog,
    private userService: UserService,
  ) {}

  get currentWeek(): number | null {
    return this.project?.unit?.currentUnitWeek ?? null;
  }

  get currentUserCanAddEngagement(): boolean {
    const currentUserId = this.userService.currentUser?.id;
    return (
      currentUserId !== undefined &&
      this.project?.unit?.staff.some((unitRole) => unitRole.user.id === currentUserId)
    );
  }

  ngOnChanges(): void {
    if (!this.project?.id) {
      return;
    }

    const cachedEngagements = this.project.engagementCache.currentValues;
    this.buildWeeks(cachedEngagements);
    this.loading = cachedEngagements.length === 0;
    this.loadFailed = false;

    this.engagementService.loadEngagements(this.project, true).subscribe({
      next: (engagements) => {
        this.buildWeeks(engagements);
        this.loading = false;
      },
      error: () => {
        this.loadFailed = true;
        this.loading = false;
      },
    });
  }

  stampColumns(stamps: EngagementStamp[]): EngagementStamp[][] {
    const columns: EngagementStamp[][] = [];

    for (let index = 0; index < stamps.length; index += 5) {
      columns.push(stamps.slice(index, index + 5));
    }

    return columns;
  }

  weekWidth(stamps: EngagementStamp[]): number {
    const columnCount = Math.max(1, Math.ceil(stamps.length / 5));
    const stampWidth = 35;
    const columnGap = 5;
    const horizontalPadding = 16;

    return Math.max(
      58,
      columnCount * stampWidth + (columnCount - 1) * columnGap + horizontalPadding,
    );
  }

  openAddEngagementDialog(): void {
    const dialogRef = this.dialog.open(AddEngagementDialogComponent, {
      data: {project: this.project},
      width: 'calc(100vw - 32px)',
      maxWidth: '640px',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((engagement?: Engagement) => {
      if (engagement) {
        this.buildWeeks(this.project.engagementCache.currentValues);
      }
    });
  }

  openEngagement(engagement: Engagement): void {
    this.dialog.open(EngagementDetailDialogComponent, {
      data: {engagement},
      width: 'calc(100vw - 32px)',
      maxWidth: '900px',
      autoFocus: false,
    });
  }

  private buildWeeks(engagements: readonly Engagement[]): void {
    const totalWeeks = Math.max(1, this.project.unit.totalWeeks);
    this.weeks = Array.from({length: totalWeeks}, (_, index) => ({
      week: index + 1,
      stamps: [],
    }));

    for (const engagement of engagements) {
      const weekNumber = this.project.unit.weekNumber(engagement.occurredAt);
      if (weekNumber === null || weekNumber < 1 || weekNumber > totalWeeks) {
        continue;
      }

      const type = this.normalizeEngagementType(engagement.engagementType);
      const presentation = this.presentations[type] ?? this.fallbackPresentation;
      this.weeks[weekNumber - 1].stamps.push({
        engagement,
        type,
        label: engagement.note,
        icon: presentation.icon,
        classes: presentation.classes,
      });
    }
  }

  private normalizeEngagementType(engagementType: string): string {
    const type = engagementType?.trim().toLowerCase();
    return type === 'discuss' ? 'discussion' : type;
  }
}
