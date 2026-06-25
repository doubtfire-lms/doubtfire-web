import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatListModule} from '@angular/material/list';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
} from '@angular/cdk/drag-drop';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
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
import {CourseMapUnitService} from 'src/app/api/services/course-map-unit.service';

type CourseUnit = Unit | UnitDefinition;

interface SlotContext {
  yearIndex: number;
  trimesterKey: 'trimester1' | 'trimester2' | 'trimester3';
  slotIndex: number;
}

interface DraggedUnitData {
  unit: CourseUnit;
  sourceContainerId: 'requiredUnits' | 'electiveUnits' | 'slot';
  sourceYearIndex?: number;
  sourceTrimesterKey?: 'trimester1' | 'trimester2' | 'trimester3';
  sourceSlotIndex?: number;
}

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
    MatMenuModule,
  ],
  providers: [
    UnitService,
    CourseService,
    CourseMapService,
    UnitDefinitionService,
    CourseMapUnitService,
  ],
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

  readonly trimesterKeys: ('trimester1' | 'trimester2' | 'trimester3')[] = [
    'trimester1',
    'trimester2',
    'trimester3',
  ];

  ngOnInit(): void {
    this.formData = {
      username: '',
      password: '',
      remember: false,
      autoLogin: localStorage.getItem('autoLogin') ? true : false,
    };
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
    });
    //temporarily create coursemap with id of 1 until database is loaded
    this.courseMapService.addCourseMap(1, 1);
    //add empty units to coursemap to initialise study periods
    this.courseMapUnitService.getCourseMapUnitsById(1).subscribe(
      (data: CourseMapUnit[]) => {
        // Pass the entire array to populateYearsArray
        this.populateYearsArray(data);
      },
      (err) => {
        this.errorMessage = 'Error fetching courseMapUnits';
        console.error('Error fetching courseMapUnits:', err);
      },
    );
  }

  populateYearsArray(courseMapUnits: CourseMapUnit[]) {
    this.years = [];

    courseMapUnits.forEach((unit) => {
      console.log('Processing unit with yearSlot:', unit.yearSlot); // Log the yearSlot value

      // Find the year object with the same yearSlot value
      let existingYear = this.years.find((y) => y.year === unit.yearSlot);

      // If no year object exists, create a new one
      if (!existingYear) {
        existingYear = {
          year: unit.yearSlot,
          trimester1: [null, null, null, null],
          trimester2: [null, null, null, null],
          trimester3: [null, null, null, null],
        };
        this.years.push(existingYear);
      }

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
      trimester1: [null, null, null, null],
      trimester2: [null, null, null, null],
      trimester3: [null, null, null, null],
    },
  ];

  maxElectiveUnits = 5;
  electiveUnits: Unit[] = [];
  allTrimesters = [this.years[0].trimester1, this.years[0].trimester2, this.years[0].trimester3];

  getTrimesterNumber(key: string): number {
    return parseInt(key.replace('trimester', ''), 10);
  }

  getTrimesterIndex(key: string): number {
    return this.trimesterKeys.indexOf(key as 'trimester1' | 'trimester2' | 'trimester3');
  }

  get remainingSlots(): number {
    const totalElectivesUsed = this.electiveUnits.length + this.countElectivesInSlots();
    const remaining = this.maxElectiveUnits - totalElectivesUsed;
    return Math.max(0, remaining);
  }

  private countElectivesInSlots(): number {
    let count = 0;
    this.years.forEach((year) => {
      ['trimester1', 'trimester2', 'trimester3'].forEach((key) => {
        const trimesterKey = key as 'trimester1' | 'trimester2' | 'trimester3';
        if (year[trimesterKey]) {
          year[trimesterKey].forEach((unit: CourseUnit | null) => {
            if (unit) {
              // Check if the unit's ID is NOT in the requiredUnits list
              const isRequired = this.requiredUnits.some((reqUnit) => reqUnit.id === unit.id);
              if (!isRequired) {
                // If it's not required, it's considered an elective for counting purposes
                count++;
              }
            }
          });
        }
      });
    });
    return count;
  }

  addYear() {
    const nextYear =
      this.years.length > 0 ? this.years[this.years.length - 1].year + 1 : new Date().getFullYear();
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
    const year = this.years[yearIndex];
    if (!year) {
      console.error(`Cannot delete trimester: Year at index ${yearIndex} not found.`);
      return;
    }

    const trimesterKey = this.trimesterKeys[trimesterIndex]; // Use the keys array
    const trimesterToDelete = year[trimesterKey];

    if (trimesterToDelete && Array.isArray(trimesterToDelete)) {
      const validUnits = trimesterToDelete.filter((unit): unit is CourseUnit => unit !== null);

      // Iterate through units in the deleted trimester
      validUnits.forEach((unit) => {
        // Check if the unit is a required unit
        const isRequired = this.requiredUnits.some((reqUnit) => reqUnit.id === unit.id);

        if (isRequired) {
          // If required, add it back to the requiredUnits list if not already present
          if (!this.requiredUnits.some((reqUnit) => reqUnit.id === unit.id)) {
            this.requiredUnits.push(unit as UnitDefinition); // Cast needed
            console.log(`Moved required unit ${unit.code} back to list from deleted trimester.`);
          }
        }
      });
    }

    year[trimesterKey] = null;
    console.log(`Deleted ${trimesterKey} from year ${yearIndex}`);
  }

  addTrimester(yearIndex: number) {
    const year = this.years[yearIndex];

    if (!year.trimester1) {
      year.trimester1 = [null, null, null, null];
    } else if (!year.trimester2) {
      year.trimester2 = [null, null, null, null];
    } else if (!year.trimester3) {
      year.trimester3 = [null, null, null, null];
    } else {
      console.log('All three trimesters already exist.');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countTrimesters(year: any): number {
    let trimesterCount = 0;
    if (year.trimester1) trimesterCount++;
    if (year.trimester2) trimesterCount++;
    if (year.trimester3) trimesterCount++;
    return trimesterCount;
  }

  drop(event: CdkDragDrop<SlotContext | CourseUnit[], CdkDrag<DraggedUnitData>, DraggedUnitData>) {
    const previousContainer = event.previousContainer;
    const currentContainer = event.container;
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    // Data of the item being dragged (from [cdkDragData])
    const draggedData = event.item.data;
    const unitToMove = draggedData.unit;

    // Data of the target container (from [cdkDropListData])
    const targetContainerData = currentContainer.data;

    if (previousContainer.id === currentContainer.id) {
      // Moving within the same list (requiredUnits or electiveUnits)
      // This check prevents reordering within a slot itself
      if (draggedData.sourceContainerId !== 'slot') {
        moveItemInArray(currentContainer.data as CourseUnit[], previousIndex, currentIndex);
      }
    } else {
      const targetIsSlot =
        typeof targetContainerData === 'object' &&
        targetContainerData !== null &&
        'slotIndex' in targetContainerData;
      const sourceIsSlot = draggedData.sourceContainerId === 'slot';

      if (targetIsSlot) {
        // Dropping onto a slot
        const targetContext = targetContainerData as SlotContext;
        const {yearIndex, trimesterKey, slotIndex} = targetContext;
        const targetTrimesterArray = this.years[yearIndex][trimesterKey];
        const existingUnitInSlot = targetTrimesterArray[slotIndex];

        if (!existingUnitInSlot) {
          // Target slot is empty
          targetTrimesterArray[slotIndex] = unitToMove; // Place item in target

          if (sourceIsSlot) {
            // Moving from another slot - empty the source slot
            this.years[draggedData.sourceYearIndex!][draggedData.sourceTrimesterKey!][
              draggedData.sourceSlotIndex!
            ] = null;
          } else {
            // Moving from a list (required or elective) - remove from source list
            const sourceList = previousContainer.data as unknown as CourseUnit[];
            sourceList.splice(previousIndex, 1);
          }
        } else {
          // Target slot is occupied
          if (sourceIsSlot) {
            // Moving from another slot - SWAP
            targetTrimesterArray[slotIndex] = unitToMove; // Place dragged item in target
            // Place target's original item in source slot
            this.years[draggedData.sourceYearIndex!][draggedData.sourceTrimesterKey!][
              draggedData.sourceSlotIndex!
            ] = existingUnitInSlot;
          } else {
            // Moving from a list to an occupied slot - Prevent drop
            console.log('Cannot drop from list onto an occupied slot.');
            // Optionally, implement swap: add existingUnitInSlot back to sourceList, remove unitToMove from sourceList
            return;
          }
        }
      } else {
        // Dropping onto a list (requiredUnits or electiveUnits)
        const targetList = targetContainerData as CourseUnit[];

        if (sourceIsSlot) {
          // Moving from a slot to a list
          targetList.splice(currentIndex, 0, unitToMove); // Add item to target list at dropped position
          // Empty the source slot
          this.years[draggedData.sourceYearIndex!][draggedData.sourceTrimesterKey!][
            draggedData.sourceSlotIndex!
          ] = null;
        } else {
          // Moving between lists
          transferArrayItem(
            previousContainer.data as unknown as CourseUnit[],
            targetList,
            previousIndex,
            currentIndex,
          );
        }
      }
    }
  }

  fetchUnitByCode(): void {
    if (!this.unitCode) {
      this.errorMessage = 'Please enter a unit code';
      return;
    }
    const trimmedCode = this.unitCode.trim().toUpperCase();

    const alreadyInList = this.electiveUnits.some((unit) => unit.code === trimmedCode);
    if (alreadyInList) {
      this.errorMessage = `Unit ${trimmedCode} already in the elective list`;
      return;
    }

    let electiveAlreadyInSlots = false;
    this.years.forEach((year) => {
      ['trimester1', 'trimester2', 'trimester3'].forEach((key) => {
        const trimesterKey = key as 'trimester1' | 'trimester2' | 'trimester3';
        if (year[trimesterKey]) {
          year[trimesterKey].forEach((unit: CourseUnit | null) => {
            if (unit?.code === trimmedCode) {
              const isRequired = this.requiredUnits.some((reqUnit) => reqUnit.id === unit.id);
              if (!isRequired) {
                electiveAlreadyInSlots = true;
              }
            }
          });
        }
      });
    });

    if (electiveAlreadyInSlots) {
      this.errorMessage = `Elective unit ${trimmedCode} already placed in the course map`;
      return;
    }

    const currentElectiveCount = this.electiveUnits.length + this.countElectivesInSlots();
    if (currentElectiveCount >= this.maxElectiveUnits) {
      this.errorMessage = `Cannot add more than ${this.maxElectiveUnits} elective units.`;
      return;
    }

    const foundUnit = this.units.find((unit) => unit.code === trimmedCode);

    if (foundUnit) {
      const isRequired = this.requiredUnits.some((reqUnit) => reqUnit.id === foundUnit.id);
      if (isRequired) {
        this.errorMessage = `Unit ${trimmedCode} is a required unit, not an elective.`;
        return;
      }

      this.electiveUnits.push(foundUnit);
      this.unitCode = '';
      this.errorMessage = null;
    } else {
      this.errorMessage = `Unit code ${trimmedCode} not found in available units`;
    }
  }
  removeUnitFromSlot(
    yearIndex: number,
    trimesterKey: 'trimester1' | 'trimester2' | 'trimester3',
    slotIndex: number,
  ): void {
    const year = this.years[yearIndex];
    if (!year || !year[trimesterKey]) {
      console.error('Cannot remove unit: Invalid year or trimester');
      return;
    }

    const unitToRemove = year[trimesterKey][slotIndex];

    if (unitToRemove) {
      year[trimesterKey][slotIndex] = null;
      console.log(
        `Removed unit ${unitToRemove.code} from slot ${yearIndex}-${trimesterKey}-${slotIndex}`,
      );

      const isRequired = this.requiredUnits.some((reqUnit) => reqUnit.id === unitToRemove.id);

      if (isRequired) {
        if (!this.requiredUnits.some((reqUnit) => reqUnit.id === unitToRemove.id)) {
          this.requiredUnits.push(unitToRemove as UnitDefinition); // Cast needed if CourseUnit type
          console.log(`Added required unit ${unitToRemove.code} back to list.`);
        }
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trackByYear(index: number, year: any): number {
    return year.year;
  }

  trackBySlotIndex(index: number): number {
    return index;
  }
}
