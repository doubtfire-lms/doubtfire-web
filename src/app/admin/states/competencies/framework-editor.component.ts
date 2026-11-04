import {CommonModule} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {
  CompetencyService,
  FrameworkDto,
  FrameworkInput,
  SkillDto,
  SkillInput,
  SkillLevelDto,
  SkillLevelInput,
} from 'src/app/api/services/competency.service';

@Component({
  selector: 'f-framework-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './framework-editor.component.html',
})
export class FrameworkEditorComponent implements OnInit {
  @Output() catalogChanged: EventEmitter<void> = new EventEmitter();

  frameworks: FrameworkDto[] = [];
  framework: FrameworkInput = this.blankFramework();
  skill: SkillInput = this.blankSkill();
  level: SkillLevelInput = this.blankLevel();
  saving = false;
  error = '';
  message = '';

  constructor(private competencies: CompetencyService) {}

  ngOnInit(): void {
    this.reload();
  }

  get selectedFramework(): FrameworkDto | undefined {
    return this.frameworks.find((item) => item.id === this.framework.id);
  }

  get skills(): SkillDto[] {
    return this.selectedFramework?.skills ?? [];
  }

  get selectedSkill(): SkillDto | undefined {
    return this.skills.find((item) => item.id === this.skill.id);
  }

  get levels(): SkillLevelDto[] {
    return this.selectedSkill?.levels ?? [];
  }

  reload(): void {
    const frameworkId = this.framework.id;
    const skillId = this.skill.id;
    const levelId = this.level.id;
    this.competencies.frameworks().subscribe({
      next: (frameworks) => {
        this.frameworks = frameworks;
        if (frameworkId) {
          this.selectFramework(frameworkId);
        }
        if (skillId) {
          this.selectSkill(skillId);
        }
        if (levelId) {
          this.selectLevel(levelId);
        }
      },
      error: () => (this.error = 'Could not load frameworks.'),
    });
  }

  selectFramework(id: number): void {
    const selected = this.frameworks.find((item) => item.id === id);
    if (selected) {
      this.framework = {
        id: selected.id,
        code: selected.code,
        name: selected.name,
        version: selected.version,
        description: selected.description,
        archived: selected.archived,
      };
      this.newSkill();
    }
  }

  newFramework(): void {
    this.framework = this.blankFramework();
    this.newSkill();
  }

  saveFramework(): void {
    this.saving = true;
    this.error = '';
    this.competencies.saveFramework(this.framework).subscribe({
      next: (saved) => {
        this.framework = saved;
        this.message = 'Framework saved.';
        this.saving = false;
        this.catalogChanged.emit();
        this.reload();
      },
      error: (error: HttpErrorResponse) => this.saveFailed(error),
    });
  }

  selectSkill(id: number): void {
    const selected = this.skills.find((item) => item.id === id);
    if (selected) {
      this.skill = {
        id: selected.id,
        code: selected.code,
        name: selected.name,
        description: selected.description,
        archived: selected.archived,
      };
      this.newLevel();
    }
  }

  newSkill(): void {
    this.skill = this.blankSkill();
    this.newLevel();
  }

  saveSkill(): void {
    if (!this.framework.id) {
      return;
    }
    this.saving = true;
    this.error = '';
    this.competencies.saveSkill(this.framework.id, this.skill).subscribe({
      next: (saved) => {
        this.skill = saved;
        this.message = 'Skill saved.';
        this.saving = false;
        this.catalogChanged.emit();
        this.reload();
      },
      error: (error: HttpErrorResponse) => this.saveFailed(error),
    });
  }

  selectLevel(id: number): void {
    const selected = this.levels.find((item) => item.id === id);
    if (selected) {
      this.level = {
        id: selected.id,
        name: selected.name,
        rank: selected.rank,
        description: selected.description,
      };
    }
  }

  newLevel(): void {
    this.level = this.blankLevel();
  }

  saveLevel(): void {
    if (!this.skill.id) {
      return;
    }
    this.saving = true;
    this.error = '';
    this.competencies.saveSkillLevel(this.skill.id, this.level).subscribe({
      next: (saved) => {
        this.level = saved;
        this.message = 'Skill level saved.';
        this.saving = false;
        this.catalogChanged.emit();
        this.reload();
      },
      error: (error: HttpErrorResponse) => this.saveFailed(error),
    });
  }

  private saveFailed(error: HttpErrorResponse): void {
    this.error = error.error?.error || 'Could not save this catalog item.';
    this.saving = false;
  }

  private blankFramework(): FrameworkInput {
    return {code: '', name: '', version: '', description: '', archived: false};
  }

  private blankSkill(): SkillInput {
    return {code: '', name: '', description: '', archived: false};
  }

  private blankLevel(): SkillLevelInput {
    return {name: '', rank: 1, description: ''};
  }
}
