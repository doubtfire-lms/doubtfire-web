import {SankeyData} from '@glitchtip/ng-charts';
import {Component, Input, OnChanges} from '@angular/core';
import {TaskCompletionSnapshot} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {getLastSnapshotByWeek, shouldIncludeSnapshot} from '../chart-data-helpers';

@Component({
  selector: 'f-target-grade-sankey',
  templateUrl: './target-grade-sankey.component.html',
  standalone: false,
})
export class TargetGradeSankeyComponent implements OnChanges {
  @Input() unit: Unit;
  @Input() snapshots: TaskCompletionSnapshot[] = [];
  @Input() campusFilter: string = 'all';

  data: SankeyData = [];
  weeks: string[] = [];
  hasChartData = false;
  private readonly sourceTotals: Map<string, number> = new Map();

  readonly colorScheme = {
    domain: ['#0079D8'],
  };

  ngOnChanges(): void {
    if (!this.unit) {
      return;
    }

    const snapshots = this.snapshots
      .filter((snapshot) => !snapshot.placeholder && shouldIncludeSnapshot(this.unit, snapshot))
      .sort((left, right) => Number(left.snapshot_timestamp) - Number(right.snapshot_timestamp));
    this.data = this.buildSankeyData(snapshots);
    this.hasChartData = this.data.length > 0;
  }

  private gradeCounts(snapshot: TaskCompletionSnapshot): Record<string, number> | undefined {
    if (this.campusFilter === 'all') {
      return snapshot.target_grade_student_counts;
    }

    return Object.fromEntries(
      Object.entries(snapshot.target_grade_campus_student_counts ?? {}).map(([grade, campuses]) => [
        grade,
        campuses[this.campusFilter] ?? 0,
      ]),
    );
  }

  private buildSankeyData(snapshots: TaskCompletionSnapshot[]): SankeyData {
    const snapshotsByWeek = getLastSnapshotByWeek(this.unit, snapshots);

    const weeklySnapshots = [...snapshotsByWeek.entries()].filter(
      ([, snapshot]) => snapshot.target_grade_student_counts,
    );
    this.weeks = weeklySnapshots.map(([week]) => week);
    this.sourceTotals.clear();
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
      Object.entries(this.gradeCounts(sourceSnapshot) ?? {}).map(([grade, count]) => [
        grade,
        Number(count),
      ]),
    );
    const targetCounts = new Map(
      Object.entries(this.gradeCounts(targetSnapshot) ?? {}).map(([grade, count]) => [
        grade,
        Number(count),
      ]),
    );
    const links: SankeyData = [];

    sourceCounts.forEach((count, grade) => {
      this.sourceTotals.set(`${sourceWeek}|${this.gradeLabel(grade)}`, count);
    });

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

  formatTooltip = (model: {name?: string; source?: string; target?: string}): string => {
    if (model.source && model.target) {
      const sourceWeek = model.source.split('|')[0];
      const targetWeek = model.target.split('|')[0];
      return (
        `${this.formatNodeLabel(model.source)} (${sourceWeek}) → ` +
        `${this.formatNodeLabel(model.target)} (${targetWeek})`
      );
    }

    if (model.name) {
      const week = model.name.split('|')[0];
      return `${this.formatNodeLabel(model.name)} (${week})`;
    }

    return '';
  };

  formatTooltipPercentage = (model: {source?: string; value?: number}): string => {
    if (!model.source || model.value === undefined) {
      return '';
    }

    const sourceTotal = this.sourceTotals.get(model.source) ?? 0;
    const percentage = sourceTotal === 0 ? 0 : (model.value / sourceTotal) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  gradeLabel(grade: string): string {
    return this.unit.gradeLabel(Number(grade));
  }
}
