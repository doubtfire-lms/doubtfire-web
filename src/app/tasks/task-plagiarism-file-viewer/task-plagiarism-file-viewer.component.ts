
import { Component, Inject,inject,Input, OnInit } from '@angular/core';
import { data } from 'jquery';
import * as _ from 'lodash';
import { alertService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'app-task-plagiarism-file-viewer',
  templateUrl: './task-plagiarism-file-viewer.component.html',
  styleUrls: ['./task-plagiarism-file-viewer.component.scss']
})
export class TaskPlagiarismFileViewerComponent implements OnInit {

  @Input() task: any;
  @Input() match: any;
   @Input() matchIdx:any;
  @Input() other: any;
   @Input() assessingUnitRole: any;  
  canDismiss: any;
   value:any;
  TaskSimilarity: any;
  message: any;


  constructor(@Inject(alertService) private alertService:any) { 

    if (typeof this.assessingUnitRole?.role =='string')
    this.canDismiss = _.includes(["Tutor", "Convenor"], this.assessingUnitRole.role);
     else this.canDismiss = false;
  

   }
  


  dismiss_similarity(value){
  return this.TaskSimilarity.put(this.task, this.matchIdx, this.other, this.value,((data) => {
    this.alertService.add("success", "Similarity dismiss status changed.", 4000),
    this.match.dismissed = value  }
    ), (response) => {
      this.message = response.data || response.statusText ,
      this.alertService.add("danger", "Failed to change status. #{message}") }
    );}
  
  ngOnInit(): void {
  }

}