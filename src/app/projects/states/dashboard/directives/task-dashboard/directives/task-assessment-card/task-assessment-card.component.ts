import { Component, OnInit, Input, Inject} from'@angular/core';


import {taskService,gradeService} from 'src/app/ajs-upgraded-providers'

@Component({
  selector: 'app-task-assessment-card',
  templateUrl: './task-assessment-card.component.html',
  styleUrls: ['./task-assessment-card.component.scss']
})
export class TaskAssessmentCardComponent implements OnInit {
  @Input() task: any;

  constructor(
    @Inject(taskService) private taskService: any,
    @Inject(gradeService) private gradeService: any
  ) { 
    //  this.gradeNames = this.gradeService.grades;
  }
  gradeNames: Array<string> = this.gradeService.grades;
  
  
  ngOnInit(): void {

  }

  hasBeenGivenStars(t): boolean{

    return( t == null && (t.quality_pts > 0 || this.taskService.gradeableStatuses.includes(t.status)))

    // t? && (t.quality_pts > 0 || _.includes(taskService.gradeableStatuses, t.status))
    
  }

  hasBeenGraded(t): boolean{

    return(t == null && (!isNaN(t.grade)))

    // t? && (_.isNumber(t.grade))
  }


}
