import {SankeyData} from '@glitchtip/ng-charts';
import {ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {TaskCompletionSnapshot} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {AlertService} from 'src/app/common/services/alert.service';
import {getLastSnapshotByWeek, shouldIncludeSnapshot} from '../chart-data-helpers';

@Component({
  selector: 'f-target-grade-sankey',
  templateUrl: './target-grade-sankey.component.html',
  standalone: false,
})
export class TargetGradeSankeyComponent implements OnChanges {
  @Input() unit: Unit;

  data: SankeyData = [];
  weeks: string[] = [];
  hasChartData = false;

  readonly colorScheme = {
    domain: ['#0079D8'],
  };

  constructor(
    private readonly alertService: AlertService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unit'] && this.unit) {
      this.loadSnapshots();
    }
  }

  private loadSnapshots(): void {
    this.unit.getTaskCompletionSnapshots().subscribe({
      next: (data) => {
        const snapshots = (data as TaskCompletionSnapshot[])
          .filter((snapshot) => shouldIncludeSnapshot(this.unit, snapshot))
          .sort(
            (left, right) => Number(left.snapshot_timestamp) - Number(right.snapshot_timestamp),
          );

        this.data = this.buildSankeyData(snapshots);
        this.hasChartData = this.data.length > 0;
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        this.alertService.error(error?.message || 'Failed to load target grade snapshots.', 6000);
      },
    });
  }

  private buildSankeyData(snapshots: TaskCompletionSnapshot[]): SankeyData {
    const snapshotsByWeek = getLastSnapshotByWeek(this.unit, snapshots);

    const weeklySnapshots = [...snapshotsByWeek.entries()].filter(
      ([, snapshot]) => snapshot.target_grade_student_counts,
    );
    this.weeks = weeklySnapshots.map(([week]) => week);
    const links: SankeyData = [];

    for (let index = 1; index < weeklySnapshots.length; index += 1) {
      const [sourceWeek, sourceSnapshot] = weeklySnapshots[index - 1];
      const [targetWeek, targetSnapshot] = weeklySnapshots[index];
      links.push(...this.buildWeekLinks(sourceWeek, sourceSnapshot, targetWeek, targetSnapshot));
    }

    return links;
  }

  private buildWeekLinks(
    sourceWeek: string,
    sourceSnapshot: TaskCompletionSnapshot,
    targetWeek: string,
    targetSnapshot: TaskCompletionSnapshot,
  ): SankeyData {
    const sourceCounts = new Map(
      Object.entries(sourceSnapshot.target_grade_student_counts ?? {}).map(([grade, count]) => [
        grade,
        Number(count),
      ]),
    );
    const targetCounts = new Map(
      Object.entries(targetSnapshot.target_grade_student_counts ?? {}).map(([grade, count]) => [
        grade,
        Number(count),
      ]),
    );
    const links: SankeyData = [];

    const remainingSource = new Map(sourceCounts);
    const remainingTarget = new Map(targetCounts);
    sourceCounts.forEach((count, grade) => {
      const unchanged = Math.min(count, targetCounts.get(grade) ?? 0);
      this.addLink(links, sourceWeek, grade, targetWeek, grade, unchanged);
      remainingSource.set(grade, count - unchanged);
      remainingTarget.set(grade, (targetCounts.get(grade) ?? 0) - unchanged);
    });

    remainingSource.forEach((sourceCount, sourceGrade) => {
      let remaining = sourceCount;
      remainingTarget.forEach((targetCount, targetGrade) => {
        if (remaining <= 0 || targetCount <= 0) {
          return;
        }

        const moved = Math.min(remaining, targetCount);
        this.addLink(links, sourceWeek, sourceGrade, targetWeek, targetGrade, moved);
        remaining -= moved;
        remainingTarget.set(targetGrade, targetCount - moved);
      });
    });

    return links;
  }

  private addLink(
    links: SankeyData,
    sourceWeek: string,
    sourceGrade: string,
    targetWeek: string,
    targetGrade: string,
    value: number,
  ): void {
    if (value > 0) {
      links.push({
        source: `${sourceWeek}|${this.gradeLabel(sourceGrade)}`,
        target: `${targetWeek}|${this.gradeLabel(targetGrade)}`,
        value,
      });
    }
  }

  formatNodeLabel = (nodeName: string): string => {
    const separatorIndex = nodeName.indexOf('|');
    return separatorIndex === -1 ? nodeName : nodeName.slice(separatorIndex + 1);
  };

  gradeLabel(grade: string): string {
    return this.unit.gradeLabel(Number(grade));
  }
}
