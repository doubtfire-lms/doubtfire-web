import {Injectable} from '@angular/core';
import {Project} from 'src/app/api/models/project';

@Injectable({
  providedIn: 'root',
})
export class GradeService {
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

  public stringToGrade(value: string): number {
    return this.gradeIndex[value];
  }
}
