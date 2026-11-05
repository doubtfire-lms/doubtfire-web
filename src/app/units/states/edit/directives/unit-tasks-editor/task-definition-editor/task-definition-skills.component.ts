import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {forkJoin} from 'rxjs';
import {SkillLevelPickerComponent} from 'src/app/admin/states/competencies/skill-level-picker.component';
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
  imports: [CommonModule, FormsModule, MatCheckboxModule, SkillLevelPickerComponent],
  templateUrl: './task-definition-skills.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TaskDefinitionSkillsComponent implements OnChanges {
  @Input() taskDefinition: TaskDefinition;
  frameworks: FrameworkDto[] = [];
  suggestions: SkillLevelDto[] = [];
  selectedLevels: Record<number, number | null> = {};
  private savedLevels: Record<number, number | null> = {};
  saving = false;
  error = '';
  message = '';

  constructor(private competencies: CompetencyService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.taskDefinition && this.taskDefinition?.id) {
      this.load();
    }
  }

  get skills(): SkillDto[] {
    return this.frameworks.flatMap((framework) =>
      framework.skills.filter(
        (skill) => !!this.selectedLevels[skill.id] || (!framework.archived && !skill.archived),
      ),
    );
  }

  get requiredSkillIds(): number[] {
    return this.suggestions
      .filter((level) => level.source === 'unit_definition')
      .map((level) => level.skill_id);
  }

  get suggestedSkillIds(): number[] {
    return this.suggestions
      .filter((level) => level.source !== 'unit_definition')
      .map((level) => level.skill_id);
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
        this.savedLevels = {...this.selectedLevels};
      },
      error: () => (this.error = 'Could not load task skills.'),
    });
  }

  saveMappings(): void {
    if (this.saving) {
      return;
    }
    this.saving = true;
    this.error = '';
    this.message = '';
    const ids = Object.values(this.selectedLevels).filter((id): id is number => id !== null);
    this.competencies
      .saveTaskMappings(this.taskDefinition.unit.id, this.taskDefinition.id, ids)
      .subscribe({
        next: (mappings) => {
          this.savedLevels = Object.fromEntries(
            mappings.map((level) => [level.skill_id, level.id]),
          );
          this.selectedLevels = {...this.savedLevels};
          this.message = 'Task skills saved.';
          this.saving = false;
        },
        error: () => {
          this.selectedLevels = {...this.savedLevels};
          this.error = 'Could not save task skills. The change was reverted; please try again.';
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
