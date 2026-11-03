import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {CompetencyService, SkillProgressDto} from 'src/app/api/services/competency.service';

@Component({
  selector: 'f-project-skills',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterLink],
  templateUrl: './project-skills.component.html',
})
export class ProjectSkillsComponent implements OnInit {
  projectId: number;
  progress?: SkillProgressDto;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private competencies: CompetencyService,
  ) {
    this.projectId = Number(this.route.parent?.snapshot.paramMap.get('projectId'));
  }

  ngOnInit(): void {
    this.competencies.progress(this.projectId).subscribe({
      next: (progress) => (this.progress = progress),
      error: () => (this.error = 'Could not load skills for this unit.'),
    });
  }

  isEndorsed(task: SkillProgressDto['tasks'][number], levelId: number): boolean {
    return task.evidence.some((evidence) => evidence.id === levelId && !!evidence.endorsed_at);
  }

  isSubmitted(task: SkillProgressDto['tasks'][number], levelId: number): boolean {
    return task.evidence.some((evidence) => evidence.id === levelId);
  }

  hasEndorsedEvidenceAtLevel(skillId: number, rank: number): boolean {
    return !!this.progress?.tasks.some((task) =>
      task.evidence.some(
        (evidence) =>
          evidence.skill_id === skillId && evidence.rank >= rank && !!evidence.endorsed_at,
      ),
    );
  }

  previouslyMappedEvidence(task: SkillProgressDto['tasks'][number]) {
    const currentLevelIds = new Set(task.skills.map((level) => level.id));
    return task.evidence.filter((evidence) => !currentLevelIds.has(evidence.id));
  }
}
