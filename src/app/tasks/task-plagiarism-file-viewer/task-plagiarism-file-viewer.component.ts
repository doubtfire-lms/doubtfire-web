import {
  Component,
  OnInit,
} from '@angular/core';
import * as _ from 'lodash';
import { Task } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'taskPlagiarismFileViewer',
  templateUrl: './task-plagiarism-file-viewer.html',
  styleUrls: ['./task-plagiarism-file-viewer.scss'],
})

export class taskPlagiarismFileViewerComponent{
  replace: boolean = true;
  task: '=task';
  match: '=match';
  matchIdx: 'matchIdx';
  other: '=other';
  assessingUnitRole;
  canDismiss;


  private similarity;
  private alert;
  private data;
  private response;
  private message;
  

  constructor(TaskSimilarity, alertService){
    this.similarity = TaskSimilarity;
    this.alert = alertService;
  }

  canAssess(){
    if (_.isString(this.assessingUnitRole.role)){
      this.canDismiss = _.includes(["Tutor, Convenor"], this.assessingUnitRole.role);
    }
    else{
      this.canDismiss = false;
    }
  }

  dismiss_similarity(value, alertService)
  {
    this.similarity.put(
      this.task, 
      this.matchIdx, 
      this.other, 
      value,
      (this.data = alertService.add("Success", "Similarity dismiss status changed.", 4000)),
      (this.response = (this.message = this.response.data || this.response.statusText), alertService.add("Danger", "Failed to change status. #{message}")) 
    )
  }



}

