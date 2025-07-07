import {Entity, EntityMapping} from 'ngx-entity-service';
import {Observable, tap} from 'rxjs';
import {AppInjector} from 'src/app/app-injector';
import {LearningOutcomeService, TaskDefinition, Unit} from './doubtfire-model';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

export class LearningOutcome extends Entity {
  id: number;
  contextType: string;
  contextId: number;
  abbreviation: string;
  shortDescription: string;
  fullOutcomeDescription: string;
  linkedOutcomeIds: number[] = [];

  context?: TaskDefinition | Unit;

  private readonly contextTypePath = {
    'Unit': 'units',
    'TaskDefinition': 'task_definitions',
    'Course': 'courses',
  };

  public save(): Observable<LearningOutcome> {
    const svc = AppInjector.get(LearningOutcomeService);

    if (this.context) {
      if (this.isNew) {
        return svc
          .create(
            {
              contextType: this.contextTypePath[this.contextType],
              contextId: this.contextId,
            },
            {
              entity: this,
              cache: this.context.learningOutcomesCache,
            },
          )
          .pipe(
            tap((response: LearningOutcome) => {
              Object.assign(this, response);
            }),
          );
      } else {
        return svc
          .update(
            {
              contextType: this.contextTypePath[this.contextType],
              contextId: this.contextId,
              id: this.id,
            },
            {
              entity: this,
              cache: this.context.learningOutcomesCache,
              endpointFormat: LearningOutcomeService.updateEndpoint,
            },
          )
          .pipe(
            tap((response: LearningOutcome) => {
              Object.assign(this, response);
            }),
          );
      }
    } else {
      // GLO
      if (this.isNew) {
        return svc
          .create({}, {entity: this, endpointFormat: LearningOutcomeService.globalEndpoint})
          .pipe(
            tap((response: LearningOutcome) => {
              Object.assign(this, response);
            }),
          );
      } else {
        return svc
          .update(
            {
              id: this.id,
            },
            {
              entity: this,
              endpointFormat: LearningOutcomeService.updateGlobalEndpoint,
            },
          )
          .pipe(
            tap((response: LearningOutcome) => {
              Object.assign(this, response);
            }),
          );
      }
    }
  }

  private originalSaveData: string;

  public get hasOriginalSaveData(): boolean {
    return this.originalSaveData !== undefined && this.originalSaveData !== null;
  }

  /**
   * To check if things have changed, we need to get the initial save data... as it
   * isn't empty by default. We can then use
   * this to check if there are changes.
   *
   * @param mapping the mapping to get changes
   */
  public setOriginalSaveData(mapping: EntityMapping<LearningOutcome>) {
    this.originalSaveData = JSON.stringify(this.toJson(mapping));
  }

  public hasChanges<T extends Entity>(mapping: EntityMapping<T>): boolean {
    if (!this.originalSaveData) {
      return false;
    }

    return this.originalSaveData != JSON.stringify(this.toJson(mapping));
  }

  public get isNew(): boolean {
    return !this.id;
  }

  public delete(): Observable<unknown> {
    const svc = AppInjector.get(LearningOutcomeService);

    if (this.context) {
      return svc.delete(
        {
          contextType: this.contextTypePath[this.contextType],
          contextId: this.contextId,
          id: this.id,
        },
        {
          entity: this,
          cache: this.context.learningOutcomesCache,
          endpointFormat: LearningOutcomeService.updateEndpoint,
        },
      );
    } else {
      // GLO
      return svc.delete(
        {
          id: this.id,
        },
        {
          entity: this,
          endpointFormat: LearningOutcomeService.updateGlobalEndpoint,
        },
      );
    }
  }

  public getFeedbackTemplateBatchUploadUrl(): string {
    const constants = AppInjector.get(DoubtfireConstants);
    return `${constants.API_URL}/${this.contextTypePath[this.contextType]}/${this.contextId}/outcomes/${this.id}/feedback_chips/csv`;
  }
}
