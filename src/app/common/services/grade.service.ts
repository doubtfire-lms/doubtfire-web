import {Injectable} from '@angular/core';
import type {GradeDefinition} from 'src/app/api/models/unit';

interface UnitGradeConfiguration {
  gradeValues?: number[];
  gradeDefinitions?: GradeDefinition[];
}

@Injectable({
  providedIn: 'root',
})
export class GradeService {
  public readonly defaultGradeDefinitions: GradeDefinition[] = [
    {id: 'fail', value: -1, label: 'Fail', abbreviation: 'F'},
    {id: 'pass', value: 0, label: 'Pass', abbreviation: 'P'},
    {id: 'credit', value: 1, label: 'Credit', abbreviation: 'C'},
    {id: 'distinction', value: 2, label: 'Distinction', abbreviation: 'D'},
    {id: 'high-distinction', value: 3, label: 'High Distinction', abbreviation: 'HD'},
  ];

  allGradeValues = [-1, 0, 1, 2, 3];
  gradeValues = [0, 1, 2, 3];

  public grades = {
    '-1': 'Fail',
    0: 'Pass',
    1: 'Credit',
    2: 'Distinction',
    3: 'High Distinction',
  };

  public gradeIndex = {
    Fail: -1,
    Pass: 0,
    Credit: 1,
    Distinction: 2,
    'High Distinction': 3,
  };

  public gradeViewData = [
    {value: -1, viewValue: 'Fail'},
    {value: 0, viewValue: 'Pass'},
    {value: 1, viewValue: 'Credit'},
    {value: 2, viewValue: 'Distinction'},
    {value: 3, viewValue: 'High Distinction'},
  ];

  public gradeNumbers = {
    F: -1,
    P: 0,
    C: 1,
    D: 2,
    HD: 3,
  };

  public gradeAcronyms = {
    Fail: 'F',
    Pass: 'P',
    Credit: 'C',
    Distinction: 'D',
    'High Distinction': 'HD',
    '-1': 'F',
    0: 'P',
    1: 'C',
    2: 'D',
    3: 'HD',
  };

  public gradeColors = {
    // Fail
    '-1': '#808080',
    F: '#808080',
    // Pass
    0: '#FF0000',
    P: '#FF0000',
    // Credit
    1: '#FF8000',
    C: '#FF8000',
    // Distinction
    2: '#0080FF',
    D: '#0080FF',
    // High Distinction
    3: '#80FF00',
    HD: '#80FF00',
  };

  public stringToGrade(value: string, unit?: UnitGradeConfiguration): number {
    return (
      this.gradeDefinitionsFor(unit).find((definition) => definition.label === value)?.value ??
      this.gradeIndex[value]
    );
  }

  public gradeDefinitionsFor(unit?: UnitGradeConfiguration): GradeDefinition[] {
    if (unit?.gradeDefinitions?.length) {
      return unit.gradeDefinitions;
    }

    if (unit?.gradeValues?.length) {
      return this.defaultGradeDefinitions.filter(
        (definition) => definition.value === -1 || unit.gradeValues.includes(definition.value),
      );
    }

    return this.defaultGradeDefinitions;
  }

  public gradeValuesFor(unit?: UnitGradeConfiguration): number[] {
    return this.gradeDefinitionsFor(unit)
      .filter((definition) => definition.value >= 0)
      .map((definition) => definition.value);
  }

  public allGradeValuesFor(unit?: UnitGradeConfiguration): number[] {
    return [-1, ...this.gradeValuesFor(unit)];
  }

  public gradeViewDataFor(
    unit?: UnitGradeConfiguration,
    includeFail: boolean = false,
  ): {value: number; viewValue: string}[] {
    return this.gradeDefinitionsFor(unit)
      .filter((definition) => includeFail || definition.value >= 0)
      .map((definition) => ({value: definition.value, viewValue: definition.label}));
  }

  public gradeLabel(value: number, unit?: UnitGradeConfiguration): string {
    return (
      this.gradeDefinitionsFor(unit).find((definition) => definition.value === value)?.label ??
      this.grades[value]
    );
  }

  public gradeAbbreviation(value: number, unit?: UnitGradeConfiguration): string {
    return (
      this.gradeDefinitionsFor(unit).find((definition) => definition.value === value)
        ?.abbreviation ?? this.gradeAcronyms[value]
    );
  }
}
