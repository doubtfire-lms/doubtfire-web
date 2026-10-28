import {Entity} from 'ngx-entity-service';

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
