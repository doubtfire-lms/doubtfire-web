import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatListModule} from '@angular/material/list';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {MatIconModule} from '@angular/material/icon';
import {HttpClientModule} from '@angular/common/http';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {StateService, Transition} from '@uirouter/core';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {Unit, UnitDefinition} from 'src/app/api/models/doubtfire-model';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {Course, CourseMap, CourseMapUnit} from 'src/app/api/models/doubtfire-model';
import {CourseService} from 'src/app/api/services/course.service';
import {CourseMapService} from 'src/app/api/services/course-map.service';
import {UnitDefinitionService} from 'src/app/api/services/unit-definition.service';
import { CourseMapUnitService } from 'src/app/api/services/course-map-unit.service';

type signInData =
  | {
      username: string;
      password: string;
      remember: boolean;
      autoLogin: boolean;
      auth_token?: string;
    }
  | {
      auth_token: string;
      username: string;
      remember: boolean;
      password?: string;
      autoLogin?: boolean;
    };

@Component({
  selector: 'coursemap',
  templateUrl: './coursemap.component.html',
  styleUrls: ['./coursemap.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    DragDropModule,
    MatIconModule,
    HttpClientModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [UnitService, CourseService, CourseMapService, UnitDefinitionService],
})
export class CoursemapComponent implements OnInit {
  constructor(
    private authService: AuthenticationService,
    private state: StateService,
    private constants: DoubtfireConstants,
    private http: HttpClient,
    private transition: Transition,
    private globalState: GlobalStateService,
    private alerts: AlertService,
    private unitService: UnitService,
    private courseService: CourseService,
    private courseMapService: CourseMapService,
    private unitDefinitionService: UnitDefinitionService,
    private courseMapUnitService: CourseMapUnitService,
  ) {}

  signingIn: boolean;
  showCredentials = false;
  invalidCredentials: boolean;
  api: string;
  SSOLoginUrl: unknown;
  authMethodLoaded: boolean;
  externalName: unknown;
  formData: signInData;
  unitCode = '';
  unit: Unit | null = null;
  errorMessage: string | null = null;
  units: Unit[] = [];
  requiredUnits: UnitDefinition[] = [];
  courses: Course[] = [];
  courseMapUnits: CourseMapUnit[];

  // Temporarily creating a course until database is populated with real data
  testCourse: Course = {
    id: '12345',
    name: 'Introduction to Programming',
    code: 'CS101',
    year: 2024,
    version: 'v1.0',
    url: 'http://university.edu/courses/cs101',
  };


  ngOnInit(): void {
    this.formData = {
      username: '',
      password: '',
      remember: false,
      autoLogin: localStorage.getItem('autoLogin') ? true : false,
    };
    //fetching units
    this.unitService.getUnits().subscribe({
      next: (data: Unit[]) => {
        this.units = data;
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = 'Error fetching units';
        console.error('Error fetching units:', err);
      },
    });
    //fetching courses.
    this.courseService.createCourse(this.testCourse); //temporarily creating course until database is populated with real data
    this.courseService.getCourses().subscribe({
      next: (data: Course[]) => {
        this.courses = data;
        console.log('Courses:', this.courses); // Optional: Log the courses to verify
      },
      error: (err) => {
        this.errorMessage = 'Error fetching courses';
        console.error('Error fetching courses:', err);
      },
    });
    //temporarily adding unit definition until database is populated with real data
    this.unitDefinitionService.addUnitDefinition(
      'Data Capture Technology',
      'Data capture technologies',
      'SIT115',
      '1',
    );
    this.formData = {
      username: '',
      password: '',
      remember: false,
      autoLogin: localStorage.getItem('autoLogin') ? true : false,
    };
    //fetching units
    this.unitService.getUnits().subscribe({
      next: (data: Unit[]) => {
        this.units = data;
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = 'Error fetching units';
        console.error('Error fetching units:', err);
      },
    });
    //fetching unit definitions
    this.unitDefinitionService.getDefinitions().subscribe({
      next: (data: UnitDefinition[]) => {
        this.requiredUnits = data;
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = 'Error fetching units';
        console.error('Error fetching unit definitions:', err);
      },
    })
    //temporarily create coursemap with id of 1 until database is loaded
    this.courseMapService.addCourseMap(1,1);
    //add empty units to coursemap to initialise study periods
    this.courseMapUnitService.getCourseMapUnitsById(1).subscribe(
      (data: CourseMapUnit[]) => {
        // Pass the entire array to populateYearsArray
        this.populateYearsArray(data);
      },
      (err) => {
        this.errorMessage = 'Error fetching courseMapUnits';
        console.error('Error fetching courseMapUnits:', err);
      }
    );
  }

  populateYearsArray(courseMapUnits: CourseMapUnit[]) {
    this.years = [];

    courseMapUnits.forEach(unit => {
      console.log('Processing unit with yearSlot:', unit.yearSlot); // Log the yearSlot value

      // Find the year object with the same yearSlot value
      let existingYear = this.years.find(y => y.year === unit.yearSlot);

      // If no year object exists, create a new one
      if (!existingYear) {
        existingYear = {
          year: unit.yearSlot,   // Set the year from yearSlot
          trimester1: [],        // Initialize empty array for trimester 1
          trimester2: [],        // Initialize empty array for trimester 2
          trimester3: []         // Initialize empty array for trimester 3
        };
        this.years.push(existingYear);
      }

      // Depending on the teachingPeriodSlot, push the unit to the respective trimester array
      switch (unit.teachingPeriodSlot) {
        case 1:
          if (!existingYear.trimester1.includes(unit)) {
            existingYear.trimester1.push(unit);
          }
          break;
        case 2:
          if (!existingYear.trimester2.includes(unit)) {
            existingYear.trimester2.push(unit);
          }
          break;
        case 3:
          if (!existingYear.trimester3.includes(unit)) {
            existingYear.trimester3.push(unit);
          }
          break;
        default:
          console.warn('Unknown teaching period slot:', unit.teachingPeriodSlot);
      }
    });
    console.log(this.years[0]);
  }

  years = [
    {
      year: 0,
      trimester1: [],
      trimester2: [],
      trimester3: [],
    },
  ];

  maxElectiveUnits = 5;
  electiveUnits: Unit[] = [];
  allTrimesters = [this.years[0].trimester1, this.years[0].trimester2, this.years[0].trimester3];

  get remainingSlots(): number {
    return this.maxElectiveUnits - this.electiveUnits.length;
  }

  get connectedDropLists(): string[] {
    const dropListIds: string[] = ['requiredUnits'];
    this.years.forEach((_, i) => {
      dropListIds.push(`trimester1-${i}`, `trimester2-${i}`, `trimester3-${i}`);
    });
    return dropListIds;
  }

  addYear() {
    const nextYear = this.years.length > 0 ? this.years[this.years.length - 1].year + 1 : new Date().getFullYear();
    const newYear = {
      year: nextYear,
      trimester1: [],
      trimester2: [],
      trimester3: [],
    };
    this.years.push(newYear);
  }

  deleteYear(index: number) {
    this.years.splice(index, 1);
  }

  deleteTrimester(yearIndex: number, trimesterIndex: number) {
    const trimesters = ['trimester1', 'trimester2', 'trimester3'];
    const trimesterToDelete = this.years[yearIndex][trimesters[trimesterIndex]];

    // Move all units from the trimester to the requiredUnits array
    this.requiredUnits.push(...trimesterToDelete);

    // Set the trimester to null to remove it
    this.years[yearIndex][trimesters[trimesterIndex]] = null;
  }

  addTrimester(yearIndex: number) {
    const year = this.years[yearIndex];

    if (!year.trimester1) {
      year.trimester1 = [];
    } else if (!year.trimester2) {
      year.trimester2 = [];
    } else if (!year.trimester3) {
      year.trimester3 = [];
    } else {
      // Optional: Alert or handle the case where all three trimesters already exist
      console.log('All three trimesters already exist.');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countTrimesters(year: any): number {
    let trimesterCount = 0;
    if (year.trimester1 && year.trimester1.length > 0) trimesterCount++;
    if (year.trimester2 && year.trimester2.length > 0) trimesterCount++;
    if (year.trimester3 && year.trimester3.length > 0) trimesterCount++;
    return trimesterCount;
  }

  drop(event: CdkDragDrop<UnitDefinition[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );


    }

  }

  fetchUnitByCode(): void {
    if (!this.unitCode) {
      this.errorMessage = 'Please enter a unit code';
      return;
    }

    const alreadyAdded = this.electiveUnits.some(unit => unit.code === this.unitCode);

    if (alreadyAdded) {
      this.errorMessage = 'Unit already added';
      return;
    }

    const foundUnit = this.units.find(unit => unit.code === this.unitCode);

    if (foundUnit) {
      this.electiveUnits.push(foundUnit);
      this.unit = foundUnit;
      this.errorMessage = null;
    } else {
      this.errorMessage = 'Unit not found';
      this.unit = null;
    }
  }

}
