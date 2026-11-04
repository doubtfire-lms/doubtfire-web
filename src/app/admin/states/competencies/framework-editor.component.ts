import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {
  CompetencyService,
  FrameworkDto,
  SkillDto,
  SkillLevelDto,
} from 'src/app/api/services/competency.service';
import {
  CompetencyItemDialogComponent,
  CompetencyItemDialogData,
} from './competency-item-dialog.component';

@Component({
  selector: 'f-framework-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './framework-editor.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class FrameworkEditorComponent implements OnInit {
  @Output() catalogChanged: EventEmitter<void> = new EventEmitter();

  frameworks: FrameworkDto[] = [];
  frameworkId?: number;
  skillId?: number;
  levelId?: number;
  skillFilter = '';
  error = '';

  constructor(
    private competencies: CompetencyService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  get selectedFramework(): FrameworkDto | undefined {
    return this.frameworks.find((item) => item.id === this.frameworkId);
  }

  get skills(): SkillDto[] {
    const filter = this.skillFilter.trim().toLowerCase();
    const skills = this.selectedFramework?.skills ?? [];
    if (!filter) {
      return skills;
    }
    return skills.filter(
      (skill) =>
        skill.code.toLowerCase().includes(filter) || skill.name.toLowerCase().includes(filter),
    );
  }

  get selectedSkill(): SkillDto | undefined {
    return this.selectedFramework?.skills.find((item) => item.id === this.skillId);
  }

  get levels(): SkillLevelDto[] {
    return [...(this.selectedSkill?.levels ?? [])].sort((a, b) => a.rank - b.rank);
  }

  get selectedLevel(): SkillLevelDto | undefined {
    return this.levels.find((item) => item.id === this.levelId);
  }

  get levelCount(): number {
    return (this.selectedFramework?.skills ?? []).reduce(
      (total, skill) => total + skill.levels.length,
      0,
    );
  }

  reload(): void {
    this.competencies.frameworks().subscribe({
      next: (frameworks) => (this.frameworks = frameworks),
      error: () => (this.error = 'Could not load frameworks.'),
    });
  }

  selectFramework(framework: FrameworkDto): void {
    if (this.frameworkId !== framework.id) {
      this.skillFilter = '';
    }
    this.frameworkId = framework.id;
    this.skillId = undefined;
    this.levelId = undefined;
  }

  selectSkill(skill: SkillDto): void {
    this.skillId = skill.id;
    this.levelId = undefined;
  }

  selectLevel(level: SkillLevelDto): void {
    this.levelId = level.id;
  }

  editFramework(framework?: FrameworkDto): void {
    this.openDialog(
      {
        kind: 'framework',
        item: framework
          ? {...framework}
          : {code: '', name: '', version: '', description: '', archived: false},
      },
      (saved: FrameworkDto) => this.selectFramework(saved),
    );
  }

  editSkill(skill?: SkillDto): void {
    if (!this.frameworkId) {
      return;
    }
    this.openDialog(
      {
        kind: 'skill',
        parentId: this.frameworkId,
        item: skill ? {...skill} : {code: '', name: '', description: '', archived: false},
      },
      (saved: SkillDto) => this.selectSkill(saved),
    );
  }

  editLevel(level?: SkillLevelDto): void {
    if (!this.skillId) {
      return;
    }
    const nextRank = Math.max(0, ...this.levels.map((item) => item.rank)) + 1;
    this.openDialog(
      {
        kind: 'level',
        parentId: this.skillId,
        item: level ? {...level} : {name: '', rank: nextRank, description: ''},
      },
      (saved: SkillLevelDto) => this.selectLevel(saved),
    );
  }

  private openDialog<T>(data: CompetencyItemDialogData, onSaved: (saved: T) => void): void {
    this.dialog
      .open(CompetencyItemDialogComponent, {data, width: '560px'})
      .afterClosed()
      .subscribe((saved?: T) => {
        if (saved) {
          onSaved(saved);
          this.catalogChanged.emit();
          this.reload();
        }
      });
  }
}
