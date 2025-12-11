import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {Project, ProjectService} from 'src/app/api/models/doubtfire-model';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {GlobalStateService} from '../index/global-state.service';
import {TaskPlannerComponent} from './task-planner/task-planner.component';

@Component({
  selector: 'f-project-plan',
  templateUrl: 'project-plan.component.html',
  styleUrls: ['project-plan.component.scss'],
})
export class ProjectPlanComponent implements OnInit {
  public project: Project;

  @ViewChild(TaskPlannerComponent) planner!: TaskPlannerComponent;

  // wherever you want to trigger it
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

  constructor(
    private globalStateService: GlobalStateService,
    private gradeService: GradeService,
    private projectService: ProjectService,
    private alertService: AlertService,
    private confirmationModalService: ConfirmationModalService,
  ) {
    this.globalStateService.currentViewAndEntitySubject$.subscribe((viewAndEntity) => {
      if (viewAndEntity.viewType === 'PROJECT' && viewAndEntity.entity) {
        this.project = viewAndEntity.entity as Project;
      }
    });
  }

  public selectedTargetGrade: number;

  ngOnInit(): void {
    this.selectedTargetGrade = this.project.targetGrade;
  }

  onTargetGradeChange(event: MatSelectChange) {
    const previousTargetGrade = this.project.targetGrade;
    this.project.targetGrade = event.value;

    this.projectService.update(this.project).subscribe({
      next: () => {
        this.alertService.success(`Succesfully updated target grade`, 2000);
        // this.refreshItems();
        this.planner.refreshItems();
      },
      error: (error) => {
        this.project.targetGrade = previousTargetGrade;
        this.selectedTargetGrade = previousTargetGrade;
        this.alertService.error(`Failed to update target grade: ${error}`, 6000);
      },
    });
  }
}
