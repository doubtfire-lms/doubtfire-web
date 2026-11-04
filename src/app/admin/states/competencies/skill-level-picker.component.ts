import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {SkillDto, SkillLevelDto} from 'src/app/api/services/competency.service';

@Component({
  selector: 'f-skill-level-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './skill-level-picker.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class SkillLevelPickerComponent {
  @Input() skills: SkillDto[] = [];
  // Skill id -> level id, edited in place so the parent's save logic is unchanged.
  @Input() selection: Record<number, number | null> = {};
  // Skills listed first in the search: required ones, then suggested ones.
  @Input() requiredSkillIds: number[] = [];
  @Input() suggestedSkillIds: number[] = [];

  query: string | SkillDto = '';
  skill?: SkillDto;
  levelId: number | null = null;

  get options(): SkillDto[] {
    const query = typeof this.query === 'string' ? this.query.trim().toLowerCase() : '';
    return this.skills
      .filter(
        (skill) =>
          !query ||
          skill.code.toLowerCase().includes(query) ||
          skill.name.toLowerCase().includes(query),
      )
      .sort((a, b) => this.priority(b) - this.priority(a))
      .slice(0, 50);
  }

  tagFor(skill: SkillDto): string | undefined {
    if (this.requiredSkillIds.includes(skill.id)) {
      return 'Unit specific';
    }
    return this.suggestedSkillIds.includes(skill.id) ? 'Course specific' : undefined;
  }

  private priority(skill: SkillDto): number {
    if (this.requiredSkillIds.includes(skill.id)) {
      return 2;
    }
    return this.suggestedSkillIds.includes(skill.id) ? 1 : 0;
  }

  get chips(): {skill: SkillDto; level: SkillLevelDto}[] {
    return this.skills
      .map((skill) => ({
        skill,
        level: skill.levels.find((level) => level.id === this.selection[skill.id]),
      }))
      .filter((chip): chip is {skill: SkillDto; level: SkillLevelDto} => !!chip.level)
      .sort((a, b) => a.skill.code.localeCompare(b.skill.code));
  }

  displaySkill(skill?: SkillDto | string): string {
    if (typeof skill === 'object') {
      return `${skill.code} · ${skill.name}`;
    }
    return skill ?? '';
  }

  pickSkill(skill: SkillDto): void {
    this.skill = skill;
    this.levelId = this.selection[skill.id] ?? null;
  }

  addLevel(levelId: number): void {
    if (!this.skill) {
      return;
    }
    this.selection[this.skill.id] = levelId;
    this.query = '';
    this.skill = undefined;
    this.levelId = null;
  }

  remove(skill: SkillDto): void {
    delete this.selection[skill.id];
  }
}
