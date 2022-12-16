import { Entity, EntityMapping } from 'ngx-entity-service';
import { TaskDefinition } from '../doubtfire-model';

export class Stage extends Entity {
  id: number;
  title: string;
  order: number;

  taskDefinition: TaskDefinition;

  constructor(td: TaskDefinition) {
    super();
    this.taskDefinition = td;
  }
}
