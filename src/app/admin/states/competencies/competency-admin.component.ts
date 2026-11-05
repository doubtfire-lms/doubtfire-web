import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {forkJoin} from 'rxjs';
import {
  CompetencyService,
  CourseDto,
  FrameworkDto,
  SkillDto,
  UnitDefinitionDto,
} from 'src/app/api/services/competency.service';
import API_URL from 'src/app/config/constants/apiUrl';
import {FrameworkEditorComponent} from './framework-editor.component';
import {SkillLevelPickerComponent} from './skill-level-picker.component';

interface UnitSummary {
  id: number;
  code: string;
  name: string;
  unit_definition_id?: number;
  start_date: string;
  end_date: string;
  active: boolean;
}

@Component({
  selector: 'f-competency-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    FrameworkEditorComponent,
    SkillLevelPickerComponent,
  ],
  templateUrl: './competency-admin.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
  selectedUnitIds: number[] = [];
  courseOpen = false;
  unitDefinitionOpen = false;
  courseFilter = '';
  unitDefinitionFilter = '';
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
      framework.skills.filter(
        (skill) => !!this.unitLevels[skill.id] || (!framework.archived && !skill.archived),
      ),
    );
  }

  get courseSkills(): SkillDto[] {
    return this.frameworks
      .filter((framework) => this.course.framework_ids.includes(framework.id))
      .flatMap((framework) =>
        framework.skills.filter(
          (skill) => !!this.courseLevels[skill.id] || (!framework.archived && !skill.archived),
        ),
      );
  }

  get filteredCourses(): CourseDto[] {
    return this.courses.filter((course) => this.matches(course, this.courseFilter));
  }

  get filteredUnitDefinitions(): UnitDefinitionDto[] {
    return this.unitDefinitions.filter((definition) =>
      this.matches(definition, this.unitDefinitionFilter),
    );
  }

  get linkedUnits(): UnitSummary[] {
    return this.unitsFor(this.unitDefinition.id);
  }

  // Offerings must share the definition's code; ones already on this version are listed above.
  get assignableUnits(): UnitSummary[] {
    return this.units.filter(
      (unit) =>
        unit.code === this.unitDefinition.code &&
        unit.unit_definition_id !== this.unitDefinition.id,
    );
  }

  unitsFor(definitionId?: number): UnitSummary[] {
    return definitionId
      ? this.units.filter((unit) => unit.unit_definition_id === definitionId)
      : [];
  }

  versionOf(unit: UnitSummary): string | undefined {
    return this.unitDefinitions.find((definition) => definition.id === unit.unit_definition_id)
      ?.version;
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
      this.courseOpen = true;
    }
  }

  newCourse(): void {
    this.course = this.blankCourse();
    this.courseLevels = {};
    this.courseOpen = true;
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
      this.selectedUnitIds = [];
      this.unitDefinitionOpen = true;
    }
  }

  newUnitDefinition(): void {
    this.unitDefinition = this.blankUnitDefinition();
    this.unitLevels = {};
    this.selectedUnitIds = [];
    this.unitDefinitionOpen = true;
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

  linkUnits(): void {
    const definitionId = this.unitDefinition.id;
    if (!this.selectedUnitIds.length || !definitionId) {
      return;
    }
    forkJoin(
      this.selectedUnitIds.map((unitId) => this.competencies.assignUnit(unitId, definitionId)),
    ).subscribe({
      next: () => {
        this.message = 'Offerings linked to this version.';
        this.selectedUnitIds = [];
        this.reload();
      },
      error: () => (this.error = 'Could not link offerings.'),
    });
  }

  unlinkUnit(unit: UnitSummary): void {
    this.competencies.unassignUnit(unit.id).subscribe({
      next: () => {
        this.message = `${unit.name} unlinked from this version.`;
        this.reload();
      },
      error: () => (this.error = 'Could not unlink offering.'),
    });
  }

  private matches(item: {code: string; name: string}, filter: string): boolean {
    const query = filter.trim().toLowerCase();
    return (
      !query || item.code.toLowerCase().includes(query) || item.name.toLowerCase().includes(query)
    );
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
