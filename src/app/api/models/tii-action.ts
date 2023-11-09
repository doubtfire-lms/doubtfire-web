import { Entity, EntityCache, EntityMapping } from 'ngx-entity-service';
import { Observable } from 'rxjs';
import { Unit } from './doubtfire-model';

export class TiiAction extends Entity {
  id: number;
  type: string;
  complete: boolean;
  retries: number;
  retry: boolean;
  lastRun: Date;
  errorCode: string;
  errorMessage: string;
  log: string;

  description: string;

}
