import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription, of} from 'rxjs';
import {Project, ProjectService, UserService} from 'src/app/api/models/doubtfire-model';
import {CalendarModalService} from 'src/app/common/modals/calendar-modal/calendar-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {TaskPlannerComponent} from './task-planner/task-planner.component';

@Component({
  selector: 'f-project-plan',
  templateUrl: 'project-plan.component.html',
  styleUrls: ['project-plan.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ProjectPlanComponent implements OnInit, OnDestroy {
  @Input() public project$: Observable<Project>;

  public project: Project;

  @ViewChild(TaskPlannerComponent) planner!: TaskPlannerComponent;

  public get unit() {
    return this.project?.unit;
  }

  public get gradeValues() {
    return this.gradeService.gradeValuesFor(this.unit);
  }

  public get gradeAcronyms() {
    return Object.fromEntries(
      this.unit.gradeDefinitions.map((definition) => [definition.value, definition.abbreviation]),
    );
  }

  public gradeString(grade: number) {
    return this.gradeService.gradeLabel(grade, this.unit);
  }

  public selectedTargetGrade: number;

  private projectSub?: Subscription;

  constructor(
    private gradeService: GradeService,
    private projectService: ProjectService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private calendarModal: CalendarModalService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.project$ = this.project$ ?? of(this.route.parent?.snapshot.data.project as Project);

    this.projectSub = this.project$?.subscribe((project) => {
      if (!project) {
        return;
      }

      this.project = project;
      this.selectedTargetGrade = project.targetGrade;
    });
  }

  ngOnDestroy(): void {
    this.projectSub?.unsubscribe();
  }

  openCalendar(): void {
    this.calendarModal.show(null);
  }

  public get viewingOtherStudentProject(): boolean {
    const role = this.project?.unit?.myRole;
    const currentUser = this.userService.currentUser;

    return !!role && role !== 'Student' && this.project?.student?.id !== currentUser?.id;
  }

  onTargetGradeChange(event: MatSelectChange) {
    const previousTargetGrade = this.project.targetGrade;
    this.project.targetGrade = event.value;

    this.projectService.update(this.project).subscribe({
      next: () => {
        this.alertService.success(`Succesfully updated target grade`, 2000);
        this.planner.refreshItems(false);
      },
      error: (error) => {
        this.project.targetGrade = previousTargetGrade;
        this.selectedTargetGrade = previousTargetGrade;
        this.alertService.error(`Failed to update target grade: ${error}`, 6000);
      },
    });
  }
}
