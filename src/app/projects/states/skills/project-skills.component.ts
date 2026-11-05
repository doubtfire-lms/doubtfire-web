import {Component, OnInit, computed, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Project, Task} from 'src/app/api/models/doubtfire-model';
import {
  CompetencyService,
  SkillEvidenceDto,
  SkillLevelDto,
  SkillProgressDto,
} from 'src/app/api/services/competency.service';

type SkillTask = SkillProgressDto['tasks'][number];

interface SkillColumn {
  skillId: number;
  code: string;
  name: string;
  target?: SkillLevelDto;
}

interface SkillStamp {
  level: SkillLevelDto;
  evidence?: SkillEvidenceDto;
  earlierMapping: boolean;
}

interface SelectedStamp extends SkillStamp {
  task?: SkillTask;
  isTarget: boolean;
}

interface EvidenceProgress {
  total: number;
  pending: number;
  endorsed: number;
}

interface TargetSkillProgress {
  pass: EvidenceProgress;
  extra: EvidenceProgress;
  passEndorsedPercent: number;
  passSubmittedPercent: number;
  extraEndorsedPercent: number;
  extraSubmittedPercent: number;
}

@Component({
  selector: 'f-project-skills',
  standalone: false,
  templateUrl: './project-skills.component.html',
  styleUrls: ['./project-skills.component.scss'],
})
export class ProjectSkillsComponent implements OnInit {
  projectId: number;
  project: Project;
  progress = signal<SkillProgressDto | null>(null);
  error = signal('');
  selectedStamp = signal<SelectedStamp | null>(null);
  skillColumns = computed<SkillColumn[]>(() => {
    const progress = this.progress();
    if (!progress) {
      return [];
    }

    const columns: Map<number, SkillColumn> = new Map();
    for (const target of progress.unit_definition?.required_skills ?? []) {
      columns.set(target.skill_id, {
        skillId: target.skill_id,
        code: target.skill_code ?? '',
        name: target.skill_name ?? '',
        target,
      });
    }
    for (const task of progress.tasks) {
      for (const level of [...task.skills, ...task.evidence]) {
        if (!columns.has(level.skill_id)) {
          columns.set(level.skill_id, {
            skillId: level.skill_id,
            code: level.skill_code ?? '',
            name: level.skill_name ?? '',
          });
        }
      }
    }
    return [...columns.values()];
  });
  targetProgress = computed(() => {
    const progress = this.progress();
    const result: Map<number, TargetSkillProgress> = new Map();
    if (!progress || !this.project?.unit?.gradeValues.length) {
      return result;
    }

    const passGrade = Math.min(...this.project.unit.gradeValues);
    for (const column of this.skillColumns()) {
      if (!column.target) {
        continue;
      }

      const opportunities = progress.tasks.filter(
        (task) =>
          task.skills.some((level) => level.skill_id === column.skillId) ||
          task.evidence.some((evidence) => evidence.skill_id === column.skillId),
      );
      const passTasks = opportunities.filter((task) => this.taskGradeFor(task) === passGrade);
      const extraTasks = opportunities.filter((task) => {
        const grade = this.taskGradeFor(task);
        return grade > passGrade && grade <= this.project.targetGrade;
      });
      const pass = this.countEvidence(passTasks, column.skillId);
      const extra = this.countEvidence(extraTasks, column.skillId);
      const passEndorsedPercent = this.percent(pass.endorsed, pass.total);
      const passSubmittedPercent = this.percent(pass.endorsed + pass.pending, pass.total);
      const extraEndorsedPercent = this.percent(extra.endorsed, extra.total);
      const extraSubmittedPercent = this.percent(extra.endorsed + extra.pending, extra.total);

      result.set(column.skillId, {
        pass,
        extra,
        passEndorsedPercent,
        passSubmittedPercent,
        extraEndorsedPercent,
        extraSubmittedPercent,
      });
    }
    return result;
  });

  constructor(
    private route: ActivatedRoute,
    private competencies: CompetencyService,
  ) {
    this.projectId = Number(this.route.parent?.snapshot.paramMap.get('projectId'));
    this.project = this.route.parent?.snapshot.data.project as Project;
  }

  ngOnInit(): void {
    this.competencies.progress(this.projectId).subscribe({
      next: (progress) => {
        if (!Array.isArray(progress?.tasks)) {
          this.error.set('The skills response was empty. Please reload the page.');
          return;
        }
        this.progress.set(progress);
      },
      error: () => this.error.set('Could not load skills for this unit.'),
    });
  }

  sortedTasks = computed<SkillTask[]>(() => {
    const tasks = this.progress()?.tasks.slice();
    if (!tasks) {
      return [];
    }

    this.project?.calcTopTasks();
    return tasks.sort(
      (left, right) =>
        this.defaultSortWeightFor(left) - this.defaultSortWeightFor(right) ||
        this.taskSequenceFor(left) - this.taskSequenceFor(right),
    );
  });

  projectTaskFor(task: SkillTask): Task | undefined {
    return this.project?.findTaskForDefinition(task.task_definition_id);
  }

  private defaultSortWeightFor(task: SkillTask): number {
    return this.projectTaskFor(task)?.topWeight ?? this.taskSequenceFor(task);
  }

  private taskSequenceFor(task: SkillTask): number {
    return (
      this.project?.unit?.taskDefinitions.find(
        (definition) => definition.id === task.task_definition_id,
      )?.seq ?? Number.MAX_SAFE_INTEGER
    );
  }

  private taskGradeFor(task: SkillTask): number {
    return this.projectTaskFor(task)?.definition?.targetGrade ?? Number.MAX_SAFE_INTEGER;
  }

  private countEvidence(tasks: SkillTask[], skillId: number): EvidenceProgress {
    let pending = 0;
    let endorsed = 0;
    for (const task of tasks) {
      const evidence = task.evidence.filter((row) => row.skill_id === skillId);
      if (evidence.some((row) => !!row.endorsed_at)) {
        endorsed++;
      } else if (evidence.length) {
        pending++;
      }
    }
    return {total: tasks.length, pending, endorsed};
  }

  private percent(count: number, total: number): number {
    return total ? (count / total) * 100 : 0;
  }

  targetProgressLabel(level: SkillLevelDto, progress: TargetSkillProgress): string {
    const passSubmitted = progress.pass.pending + progress.pass.endorsed;
    const extraSubmitted = progress.extra.pending + progress.extra.endorsed;
    const passSummary = `Pass tasks: ${passSubmitted} of ${progress.pass.total} submitted, ${progress.pass.endorsed} endorsed.`;
    const extraSummary = progress.extra.total
      ? ` Extra higher-grade tasks: ${extraSubmitted} of ${progress.extra.total} submitted, ${progress.extra.endorsed} endorsed.`
      : '';
    return `${level.skill_code} ${level.name}. ${passSummary}${extraSummary}`;
  }

  stampsFor(task: SkillTask, skillId: number): SkillStamp[] {
    const mappedLevelIds = new Set(task.skills.map((level) => level.id));
    const mapped = task.skills
      .filter((level) => level.skill_id === skillId)
      .map((level) => ({
        level,
        evidence: task.evidence.find((row) => row.id === level.id),
        earlierMapping: false,
      }));
    const earlier = task.evidence
      .filter((evidence) => evidence.skill_id === skillId && !mappedLevelIds.has(evidence.id))
      .map((evidence) => ({level: evidence, evidence, earlierMapping: true}));
    return [...mapped, ...earlier];
  }

  evidenceLabel(evidence?: SkillEvidenceDto): string {
    if (evidence?.endorsed_at) {
      return 'Evidence endorsed';
    }
    if (evidence) {
      return 'Submitted, awaiting completion';
    }
    return 'No evidence submitted';
  }

  openStamp(stamp: SelectedStamp, dialog: HTMLDialogElement): void {
    this.selectedStamp.set(stamp);
    dialog.showModal();
  }

  hasEndorsedEvidenceAtLevel(skillId: number, rank: number): boolean {
    return !!this.progress()?.tasks.some((task) =>
      task.evidence.some(
        (evidence) =>
          evidence.skill_id === skillId && evidence.rank >= rank && !!evidence.endorsed_at,
      ),
    );
  }
}
