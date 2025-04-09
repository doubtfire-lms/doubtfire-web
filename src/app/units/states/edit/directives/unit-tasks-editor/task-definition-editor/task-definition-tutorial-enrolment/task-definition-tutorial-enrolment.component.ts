import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {AlertService} from 'src/app/common/services/alert.service';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {TutorialStream} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'f-task-definition-tutorial-enrolment',
  templateUrl: 'task-definition-tutorial-enrolment.component.html',
  styleUrls: ['task-definition-tutorial-enrolment.component.scss'],
})
export class TaskDefinitionTutorialEnrolmentComponent implements OnInit {
  @Input() taskDefinition: TaskDefinition;

  public _tutorialStreams: TutorialStream[] = [];

  public _selectedTutorialStreams: TutorialStream[] = [];

  tutoralStreamControl =  new FormControl<TutorialStream | null>(null, Validators.required);

  public ngOnInit(): void {
    const tutorialStreams = this.taskDefinition.unit.tutorialStreamsCache.currentValues;
    console.log(tutorialStreams);
    for (const stream of tutorialStreams) {
      console.log(stream);
      this._tutorialStreams.push(stream);
    }
  }

  constructor(
    private alerts: AlertService,
    private taskDefinitionService: TaskDefinitionService,
  ) {}

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }
}
