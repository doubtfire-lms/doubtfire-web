import { Component, Input } from '@angular/core';
import { SimilarityCheck, TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';

@Component({
  selector: 'f-task-definition-similarity',
  templateUrl: 'task-definition-similarity.component.html',
  styleUrls: ['task-definition-similarity.component.scss'],
})
export class TaskDefinitionSimilarityComponent {
  @Input() taskDefinition: TaskDefinition;

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  public addCheck() {
    const newLength = this.taskDefinition.plagiarismChecks.length + 1;
    this.taskDefinition.plagiarismChecks.push({
      key: `check${newLength - 1}`,
      pattern: '*.c|*.h',
      type: 'moss c',
    });
  }

  public removeCheck(check: SimilarityCheck) {
    this.taskDefinition.plagiarismChecks = this.taskDefinition.plagiarismChecks.filter(
      (otherCheck) => otherCheck.key != check.key
    );
  }
}
