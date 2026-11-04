import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import API_URL from 'src/app/config/constants/apiUrl';

export interface SkillLevelDto {
  id: number;
  skill_id: number;
  name: string;
  rank: number;
  description: string;
  skill_code?: string;
  skill_name?: string;
  skill_description?: string;
  framework_id?: number;
}

export interface SkillDto {
  id: number;
  code: string;
  name: string;
  description: string;
  archived: boolean;
  levels: SkillLevelDto[];
}

export interface FrameworkDto {
  id: number;
  code: string;
  name: string;
  version: string;
  description: string;
  archived: boolean;
  skills: SkillDto[];
}

export type FrameworkInput = Pick<
  FrameworkDto,
  'code' | 'name' | 'version' | 'description' | 'archived'
> & {
  id?: number;
};

export type SkillInput = Pick<SkillDto, 'code' | 'name' | 'description' | 'archived'> & {
  id?: number;
};

export type SkillLevelInput = Pick<SkillLevelDto, 'name' | 'rank' | 'description'> & {
  id?: number;
};

export interface CourseDto {
  id?: number;
  code: string;
  name: string;
  description: string;
  version: string;
  kind: 'degree' | 'major' | 'minor';
  framework_ids: number[];
  unit_definition_ids: number[];
  required_skills: SkillLevelDto[];
}

export interface UnitDefinitionDto {
  id?: number;
  code: string;
  name: string;
  description: string;
  version: string;
  required_skills: SkillLevelDto[];
}

export interface SkillEvidenceDto extends SkillLevelDto {
  evidence_id: number;
  submitted_at: string;
  endorsed_at?: string;
}

export interface SkillProgressDto {
  unit_definition?: UnitDefinitionDto;
  tasks: {
    task_definition_id: number;
    abbreviation: string;
    name: string;
    task_id?: number;
    status?: string;
    skills: SkillLevelDto[];
    evidence: SkillEvidenceDto[];
  }[];
}

@Injectable({providedIn: 'root'})
export class CompetencyService {
  constructor(private http: HttpClient) {}

  frameworks(): Observable<FrameworkDto[]> {
    return this.http.get<FrameworkDto[]>(`${API_URL}/skill_frameworks`);
  }

  saveFramework(framework: FrameworkInput): Observable<FrameworkDto> {
    const {id, ...attributes} = framework;
    const body = {skill_framework: attributes};
    return id
      ? this.http.put<FrameworkDto>(`${API_URL}/skill_frameworks/${id}`, body)
      : this.http.post<FrameworkDto>(`${API_URL}/skill_frameworks`, body);
  }

  saveSkill(frameworkId: number, skill: SkillInput): Observable<SkillDto> {
    const {id, ...attributes} = skill;
    const body = {skill: attributes};
    return id
      ? this.http.put<SkillDto>(`${API_URL}/skills/${id}`, body)
      : this.http.post<SkillDto>(`${API_URL}/skill_frameworks/${frameworkId}/skills`, body);
  }

  saveSkillLevel(skillId: number, level: SkillLevelInput): Observable<SkillLevelDto> {
    const {id, ...attributes} = level;
    const body = {skill_level: attributes};
    return id
      ? this.http.put<SkillLevelDto>(`${API_URL}/skill_levels/${id}`, body)
      : this.http.post<SkillLevelDto>(`${API_URL}/skills/${skillId}/levels`, body);
  }

  courses(): Observable<CourseDto[]> {
    return this.http.get<CourseDto[]>(`${API_URL}/courses`);
  }

  unitDefinitions(): Observable<UnitDefinitionDto[]> {
    return this.http.get<UnitDefinitionDto[]>(`${API_URL}/unit_definitions`);
  }

  saveCourse(course: CourseDto, levelIds: number[]): Observable<CourseDto> {
    const body = {course: {...course, skill_level_ids: levelIds}};
    return course.id
      ? this.http.put<CourseDto>(`${API_URL}/courses/${course.id}`, body)
      : this.http.post<CourseDto>(`${API_URL}/courses`, body);
  }

  saveUnitDefinition(
    definition: UnitDefinitionDto,
    levelIds: number[],
  ): Observable<UnitDefinitionDto> {
    const body = {unit_definition: {...definition, skill_level_ids: levelIds}};
    return definition.id
      ? this.http.put<UnitDefinitionDto>(`${API_URL}/unit_definitions/${definition.id}`, body)
      : this.http.post<UnitDefinitionDto>(`${API_URL}/unit_definitions`, body);
  }

  assignUnit(unitId: number, unitDefinitionId: number): Observable<unknown> {
    return this.http.put(`${API_URL}/units/${unitId}/unit_definition`, {
      unit_definition_id: unitDefinitionId,
    });
  }

  taskMappings(unitId: number, taskDefinitionId: number): Observable<SkillLevelDto[]> {
    return this.http.get<SkillLevelDto[]>(
      `${API_URL}/units/${unitId}/task_definitions/${taskDefinitionId}/skill_mappings`,
    );
  }

  suggestions(unitId: number): Observable<SkillLevelDto[]> {
    return this.http.get<SkillLevelDto[]>(`${API_URL}/units/${unitId}/skill_suggestions`);
  }

  saveTaskMappings(
    unitId: number,
    taskDefinitionId: number,
    skillLevelIds: number[],
  ): Observable<SkillLevelDto[]> {
    return this.http.put<SkillLevelDto[]>(
      `${API_URL}/units/${unitId}/task_definitions/${taskDefinitionId}/skill_mappings`,
      {skill_level_ids: skillLevelIds},
    );
  }

  progress(projectId: number): Observable<SkillProgressDto> {
    return this.http.get<SkillProgressDto>(`${API_URL}/projects/${projectId}/skill_progress`);
  }
}
