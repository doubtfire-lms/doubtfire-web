import {AsyncPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input, type OnInit} from '@angular/core';
import {MatOption} from '@angular/material/autocomplete';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatSelect} from '@angular/material/select';
import {MatTooltip} from '@angular/material/tooltip';
import {Observable} from 'rxjs';
import {Project} from 'src/app/api/models/project';
import {ProjectService} from 'src/app/api/services/project.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {ProgressBurndownChartComponent} from '../../visualisations/progress-burndown-chart/progress-burndown-chart.component';
import {TaskStatusPieChartComponent} from '../../visualisations/task-status-pie-chart/task-status-pie-chart.component';

@Component({
  selector: 'f-project-progress-dashboard',
  templateUrl: './project-progress-dashboard.component.html',
  styleUrl: './project-progress-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatCard,
    MatCardContent,
    MatIcon,
    MatTooltip,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatCardHeader,
    MatCardTitle,
    ProgressBurndownChartComponent,
    TaskStatusPieChartComponent,
    AsyncPipe,
  ],
})
export class ProjectProgressDashboardComponent implements OnInit {
  @Input() project$: Observable<Project>;
  private project: Project;
  protected grades;

  constructor(
    private gradeService: GradeService,
    private projectService: ProjectService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.project$.subscribe((project) => {
      this.project = project;
      this.grades = this.gradeService.gradeViewDataFor(project.unit);
    });

    setTimeout(() => {
      console.log(this.project.taskStats);
    }, 3000);
  }

  protected targetGradeClicked(grade: number): void {
    this.project.targetGrade = grade;
    this.projectService.update(this.project).subscribe({
      next: (_project) => {
        this.alertService.success('Target grade updated');
      },
      error: (error) => {
        console.error(error);
        this.alertService.error('Error updating target grade', error);
      },
    });
  }
}
