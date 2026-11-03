import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {forkJoin} from 'rxjs';
import {
  CompetencyService,
  CourseDto,
  FrameworkDto,
  SkillDto,
  UnitDefinitionDto,
} from 'src/app/api/services/competency.service';
import API_URL from 'src/app/config/constants/apiUrl';

interface UnitSummary {
  id: number;
  code: string;
  name: string;
  unit_definition_id?: number;
}

@Component({
  selector: 'f-competency-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './competency-admin.component.html',
})
export class CompetencyAdminComponent implements OnInit {
  frameworks: FrameworkDto[] = [];
  courses: CourseDto[] = [];
  unitDefinitions: UnitDefinitionDto[] = [];
  units: UnitSummary[] = [];
  course: CourseDto = this.blankCourse();
  unitDefinition: UnitDefinitionDto = this.blankUnitDefinition();
  courseLevels: Record<number, number | null> = {};
  unitLevels: Record<number, number | null> = {};
  selectedUnitId?: number;
  saving = false;
  error = '';
  message = '';

  constructor(
    private competencies: CompetencyService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  get allSkills(): SkillDto[] {
    return this.frameworks.flatMap((framework) =>
      framework.skills.filter((skill) => !skill.archived || !!this.unitLevels[skill.id]),
    );
  }

  get courseSkills(): SkillDto[] {
    return this.frameworks
      .filter((framework) => this.course.framework_ids.includes(framework.id))
      .flatMap((framework) =>
        framework.skills.filter((skill) => !skill.archived || !!this.courseLevels[skill.id]),
      );
  }

  get assignableUnits(): UnitSummary[] {
    return this.units.filter((unit) => unit.code === this.unitDefinition.code);
  }

  reload(): void {
    forkJoin({
      frameworks: this.competencies.frameworks(),
      courses: this.competencies.courses(),
      definitions: this.competencies.unitDefinitions(),
      units: this.http.get<UnitSummary[]>(`${API_URL}/units?include_in_active=true`),
    }).subscribe({
      next: ({frameworks, courses, definitions, units}) => {
        this.frameworks = frameworks;
        this.courses = courses;
        this.unitDefinitions = definitions;
        this.units = units;
      },
      error: () => (this.error = 'Could not load competency curriculum.'),
    });
  }

  selectCourse(id: number): void {
    const selected = this.courses.find((course) => course.id === id);
    if (selected) {
      this.course = {
        ...selected,
        framework_ids: [...selected.framework_ids],
        unit_definition_ids: [...selected.unit_definition_ids],
      };
      this.courseLevels = Object.fromEntries(
        selected.required_skills.map((level) => [level.skill_id, level.id]),
      );
    }
  }

  newCourse(): void {
    this.course = this.blankCourse();
    this.courseLevels = {};
  }

  saveCourse(): void {
    this.saving = true;
    this.error = '';
    const visibleSkillIds = new Set(this.courseSkills.map((skill) => skill.id));
    const levelIds = Object.entries(this.courseLevels)
      .filter(([skillId]) => visibleSkillIds.has(Number(skillId)))
      .map(([, id]) => id)
      .filter((id): id is number => id !== null);
    this.competencies.saveCourse(this.course, levelIds).subscribe({
      next: (saved) => {
        this.course = saved;
        this.message = 'Course saved.';
        this.saving = false;
        this.reload();
      },
      error: () => {
        this.error = 'Could not save course. Check its version, frameworks and skill levels.';
        this.saving = false;
      },
    });
  }

  selectUnitDefinition(id: number): void {
    const selected = this.unitDefinitions.find((definition) => definition.id === id);
    if (selected) {
      this.unitDefinition = {...selected};
      this.unitLevels = Object.fromEntries(
        selected.required_skills.map((level) => [level.skill_id, level.id]),
      );
      this.selectedUnitId = undefined;
    }
  }

  newUnitDefinition(): void {
    this.unitDefinition = this.blankUnitDefinition();
    this.unitLevels = {};
    this.selectedUnitId = undefined;
  }

  saveUnitDefinition(): void {
    this.saving = true;
    this.error = '';
    const levelIds = Object.values(this.unitLevels).filter((id): id is number => id !== null);
    this.competencies.saveUnitDefinition(this.unitDefinition, levelIds).subscribe({
      next: (saved) => {
        this.unitDefinition = saved;
        this.message = 'Unit definition saved.';
        this.saving = false;
        this.reload();
      },
      error: () => {
        this.error = 'Could not save unit definition. Check its code, version and skill levels.';
        this.saving = false;
      },
    });
  }

  assignUnit(): void {
    if (!this.selectedUnitId || !this.unitDefinition.id) {
      return;
    }
    this.competencies.assignUnit(this.selectedUnitId, this.unitDefinition.id).subscribe({
      next: () => {
        this.message = 'Offering assigned to unit definition.';
        this.reload();
      },
      error: () => (this.error = 'Could not assign offering.'),
    });
  }

  private blankCourse(): CourseDto {
    return {
      code: '',
      name: '',
      description: '',
      version: '',
      kind: 'degree',
      framework_ids: [],
      unit_definition_ids: [],
      required_skills: [],
    };
  }

  private blankUnitDefinition(): UnitDefinitionDto {
    return {code: '', name: '', description: '', version: '', required_skills: []};
  }
}
