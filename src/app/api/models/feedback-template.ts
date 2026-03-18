import {Entity, EntityMapping} from 'ngx-entity-service';
import {Observable, tap} from 'rxjs';
import {AppInjector} from 'src/app/app-injector';
import {FeedbackTemplateService} from '../services/feedback-template.service';

export class FeedbackTemplate extends Entity {
  id: number;
  type: 'group' | 'template';
  chipText: string;
  description: string;
  commentText: string;
  summaryText: string;
  taskStatus: 'fix_and_resubmit' | 'discuss' | 'redo' | 'complete' | 'feedback_exceeded';
  parentChipId: number;
  learningOutcomeId: number;

  public save(): Observable<FeedbackTemplate> {
    const svc = AppInjector.get(FeedbackTemplateService);

    if (this.isNew) {
      return svc
        .create({}, {entity: this, endpointFormat: FeedbackTemplateService.addEndpoint})
        .pipe(
          tap((response: FeedbackTemplate) => {
            Object.assign(this, response);
          }),
        );
    } else {
      return svc
        .update(
          {id: this.id},
          {entity: this, endpointFormat: FeedbackTemplateService.updateEndpoint},
        )
        .pipe(
          tap((response: FeedbackTemplate) => {
            Object.assign(this, response);
          }),
        );
    }
  }

  private originalSaveData: string;

  public get hasOriginalSaveData(): boolean {
    return this.originalSaveData !== undefined && this.originalSaveData !== null;
  }

  public setOriginalSaveData(mapping: EntityMapping<FeedbackTemplate>) {
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
    const svc = AppInjector.get(FeedbackTemplateService);

    return svc.delete(
      {id: this.id},
      {entity: this, endpointFormat: FeedbackTemplateService.updateEndpoint},
    );
  }
}
