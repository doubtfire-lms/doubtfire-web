import {CommonModule} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Observable} from 'rxjs';
import {
  CompetencyService,
  FrameworkInput,
  SkillInput,
  SkillLevelInput,
} from 'src/app/api/services/competency.service';

export type CompetencyItemDialogData =
  | {kind: 'framework'; item: FrameworkInput}
  | {kind: 'skill'; parentId: number; item: SkillInput}
  | {kind: 'level'; parentId: number; item: SkillLevelInput};

@Component({
  selector: 'f-competency-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './competency-item-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class CompetencyItemDialogComponent {
  code = '';
  name = '';
  version = '';
  description = '';
  rank = 1;
  archived = false;
  saving = false;
  error = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CompetencyItemDialogData,
    private dialogRef: MatDialogRef<CompetencyItemDialogComponent>,
    private competencies: CompetencyService,
  ) {
    const item: Partial<FrameworkInput & SkillLevelInput> = data.item;
    this.code = item.code ?? '';
    this.name = item.name ?? '';
    this.version = item.version ?? '';
    this.description = item.description ?? '';
    this.rank = item.rank ?? 1;
    this.archived = item.archived ?? false;
  }

  get isNew(): boolean {
    return !this.data.item.id;
  }

  get title(): string {
    const noun = {framework: 'framework', skill: 'skill', level: 'skill level'}[this.data.kind];
    return `${this.isNew ? 'New' : 'Edit'} ${noun}`;
  }

  save(): void {
    this.saving = true;
    this.error = '';
    this.request().subscribe({
      next: (saved) => this.dialogRef.close(saved),
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.error || 'Could not save this item.';
        this.saving = false;
      },
    });
  }

  private request(): Observable<unknown> {
    const {id} = this.data.item;
    const {code, name, version, description, rank, archived} = this;
    switch (this.data.kind) {
      case 'framework':
        return this.competencies.saveFramework({id, code, name, version, description, archived});
      case 'skill':
        return this.competencies.saveSkill(this.data.parentId, {
          id,
          code,
          name,
          description,
          archived,
        });
      case 'level':
        return this.competencies.saveSkillLevel(this.data.parentId, {id, name, rank, description});
    }
  }
}
