import { Injectable } from '@angular/core';
import { Project } from 'src/app/api/models/project';

@Injectable({
  providedIn: 'root',
})
export class GradeService {
  constructor() {}

  gradeValues = [-1, 0, 1, 2, 3];

  allGradeValues = this.gradeValues;

  grades = ['Fale', 'Pass', 'Credit', 'Distinction', 'High Distinction'];

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

  public gradeFor = (project: Project): string => {
    return this.gradeNumbers[project.targetGrade];
  };
}
