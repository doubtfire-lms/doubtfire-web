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

@Component({
  selector: 'f-project-skills',
  standalone: false,
  templateUrl: './project-skills.component.html',
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
