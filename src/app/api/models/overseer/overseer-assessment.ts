import { Entity, EntityMapping } from 'ngx-entity-service';

export class OverseerAssessment extends Entity {
  id: number;
  timestamp: Date;
  timestampString: string;
  content?: [{ label: string; result: string }];
  task?: any;
  taskStatus?: any;
  submissionStatus?: any;
  createdAt?: any;
  updatedAt?: any;
  taskId?: any;

  label: string;

  constructor(task?: object) {
    super();

    if ( task ) {
      this.task = task;
    }
  }

  public override toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      overseer_assessment: super.toJson(mappingData, ignoreKeys)
    };
  }
}
