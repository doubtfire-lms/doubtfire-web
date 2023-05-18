import { Component, Input } from '@angular/core';
import { TaskDefinition, UploadRequirement } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';

@Component({
  selector: 'f-task-definition-upload',
  templateUrl: 'task-definition-upload.component.html',
  styleUrls: ['task-definition-upload.component.scss'],
})
export class TaskDefinitionUploadComponent {
  @Input() taskDefinition: TaskDefinition;

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  public addUpReq() {
    const newLength = this.taskDefinition.uploadRequirements.length + 1;
    this.taskDefinition.uploadRequirements.push({
      key: `file${newLength - 1}`,
      type: 'code',
      name: '',
      tiiCheck: false,
      tiiPct: 30,
    });
  }

  public removeUpReq(upreq: UploadRequirement) {
    this.taskDefinition.uploadRequirements = this.taskDefinition.uploadRequirements.filter(
      (anUpReq) => anUpReq.key != upreq.key
    );
  }
}
