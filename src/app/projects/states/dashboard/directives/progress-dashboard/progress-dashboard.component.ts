import { Component, Inject, Input, OnInit } from '@angular/core';
import { any } from '@uirouter/angular';
import { alertService, analyticsService, taskService, projectService} from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'app-progress-dashboard',
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss']
})
export class ProgressDashboardComponent implements OnInit {

  @Input() project: any= {};
  @Input() onUpdateTargetGrade: any;
  tutor:any;
  completedTasks: any;
  numberOfTasks: any;
  newGrade:any;
  gradeService: any;
  renderTaskStatusPieChart: any;

  constructor(@Inject(taskService) private taskService,
              @Inject(analyticsService) private analyticsService, 
              @Inject(alertService) private alertService,
              @Inject(projectService) private projectService)

  { 
    this.tutor = this.tutor;
  }

  ngOnInit(): void {
  }

  updateTaskCompletionValues () {  
      this.completedTasks = this.projectService.tasksByStatus(this.project, this.taskService.acronymKey.COM).length
      this.numberOfTasks = {
        completed : this.completedTasks , 
        remaining: this.projectService.tasksInTargetGrade(this.project).length - this.completedTasks }
        this.updateTaskCompletionValues();
      }
 
 
      //Expose grade names and values
     grades = {
        names: [this.taskService.gradeService.grades], 
        values:[this.taskService.gradeService.gradeValues]} ;
  updateTargetGrade(newGrade) {
        this.projectService.updateProject(this.project.project_id, { target_grade: newGrade },
          (project) => {
           this.project.burndown_chart_data = this.project.burndown_chart_data ,
           this.project.updateTaskStats(this.project.stats)
          // Update task completions and re-render task status graph
          this.updateTaskCompletionValues();
          this.projectService.renderTaskStatusPieChart();
        this.taskService.onUpdateTargetGrade();
          this.analyticsService.event("Student Project View - Progress Dashboard", "Grade Changed", this.grades.names[newGrade])
          this.alertService.add("info", "Updated target grade successfully", 2000);
        
          }, 
          (failure) =>
          this.alertService.add("danger", "Failed to update target grade", 4000)           
                 
            ); }

}
