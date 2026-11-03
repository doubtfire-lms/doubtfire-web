import {CommonModule} from '@angular/common';
import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {forkJoin} from 'rxjs';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {
  CompetencyService,
  FrameworkDto,
  SkillDto,
  SkillLevelDto,
} from 'src/app/api/services/competency.service';

@Component({
  selector: 'f-task-definition-skills',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './task-definition-skills.component.html',
})
export class TaskDefinitionSkillsComponent implements OnChanges {
  @Input() taskDefinition: TaskDefinition;
  frameworks: FrameworkDto[] = [];
  suggestions: SkillLevelDto[] = [];
  selectedLevels: Record<number, number | null> = {};
  showAll = false;
  saving = false;
  error = '';
  message = '';

  constructor(private competencies: CompetencyService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.taskDefinition && this.taskDefinition?.id) {
      this.load();
    }
  }

  get visibleSkills(): SkillDto[] {
    const suggestedIds = new Set(this.suggestions.map((level) => level.skill_id));
    const selectedIds = new Set(Object.keys(this.selectedLevels).map(Number));
    return this.frameworks.flatMap((framework) =>
      framework.skills.filter(
        (skill) =>
          selectedIds.has(skill.id) ||
          (!skill.archived && (this.showAll || suggestedIds.has(skill.id))),
      ),
    );
  }

  load(): void {
    forkJoin({
      frameworks: this.competencies.frameworks(),
      suggestions: this.competencies.suggestions(this.taskDefinition.unit.id),
      mappings: this.competencies.taskMappings(this.taskDefinition.unit.id, this.taskDefinition.id),
    }).subscribe({
      next: ({frameworks, suggestions, mappings}) => {
        this.frameworks = frameworks;
        this.suggestions = suggestions;
        this.selectedLevels = Object.fromEntries(
          mappings.map((level) => [level.skill_id, level.id]),
        );
      },
      error: () => (this.error = 'Could not load task skills.'),
    });
  }

  saveMappings(): void {
    this.saving = true;
    this.error = '';
    const ids = Object.values(this.selectedLevels).filter((id): id is number => id !== null);
    this.competencies
      .saveTaskMappings(this.taskDefinition.unit.id, this.taskDefinition.id, ids)
      .subscribe({
        next: () => {
          this.message = 'Task skills saved.';
          this.saving = false;
        },
        error: () => {
          this.error = 'Could not save task skills.';
          this.saving = false;
        },
      });
  }

  saveStudentSelectionFlag(): void {
    this.taskDefinition.save().subscribe({
      next: () => (this.message = 'Task option saved.'),
      error: () => (this.error = 'Could not save task option.'),
    });
  }
}
