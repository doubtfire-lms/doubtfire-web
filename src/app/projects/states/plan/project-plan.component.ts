import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {Observable, Subscription} from 'rxjs';
import {Project, ProjectService} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {TaskPlannerComponent} from './task-planner/task-planner.component';

@Component({
  selector: 'f-project-plan',
  templateUrl: 'project-plan.component.html',
  styleUrls: ['project-plan.component.scss'],
})
export class ProjectPlanComponent implements OnInit, OnDestroy {
  @Input() public project$: Observable<Project>;

  public project: Project;

  @ViewChild(TaskPlannerComponent) planner!: TaskPlannerComponent;

  public get unit() {
    return this.project?.unit;
  }

  public get gradeValues() {
    return this.gradeService.gradeValues;
  }

  public get gradeAcronyms() {
    return this.gradeService.gradeAcronyms;
  }

  public gradeString(grade: number) {
    return this.gradeService.grades[grade];
  }

  public selectedTargetGrade: number;

  private projectSub?: Subscription;

  constructor(
    private gradeService: GradeService,
    private projectService: ProjectService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
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
