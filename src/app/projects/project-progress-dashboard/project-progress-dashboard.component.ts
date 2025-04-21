import {Component, Input, type OnInit} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Project} from 'src/app/api/models/project';
import {ProjectService} from 'src/app/api/services/project.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';

@Component({
  selector: 'f-project-progress-dashboard',
  templateUrl: './project-progress-dashboard.component.html',
  styleUrl: './project-progress-dashboard.component.scss',
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
    });

    this.grades = this.gradeService.gradeViewData.slice(1);

    setTimeout(() => {
      console.log(this.project.taskStats);
    }, 3000);
  }

  protected targetGradeClicked(grade: number): void {
    this.project.targetGrade = grade;
    this.projectService.update(this.project).subscribe({
      next: (project) => {
        this.alertService.success('Target grade updated');
      },
      error: (error) => {
        console.error(error);
        this.alertService.error('Error updating target grade', error);
      },
    });
  }
}
