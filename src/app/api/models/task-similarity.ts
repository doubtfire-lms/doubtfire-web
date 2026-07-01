import {Entity} from 'ngx-entity-service';
import {Observable} from 'rxjs';
import {AppInjector} from 'src/app/app-injector';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {Task, TaskSimilarityService, User} from './doubtfire-model';

export enum TaskSimilarityType {
  Jplag = 'JplagTaskSimilarity',
  Moss = 'MossTaskSimilarity',
  TurnItIn = 'TiiTaskSimilarity',
}

/**
 * Represents teh format for a part of a similarity report for a task.
 *
 * HTML for moss
 * PDF for TurnItIn
 * jplag for JPlag
 */
export enum TaskSimilarityPartFormat {
  Html = 'html',
  Pdf = 'pdf',
  Jplag = 'jplag',
}

export class TaskSimilarityPart {
  idx: number;
  format: TaskSimilarityPartFormat;
  description: string;
  panelOpenState?: boolean;
}

/**
 * Represents a similarity report for a task. Each has either one or two parts:
 * turn it in has one PDF part, while moss has two html parts.
 */
export class TaskSimilarity extends Entity {
  id: number;
  type: TaskSimilarityType;
  flagged: boolean;
  pct: number;
  parts: TaskSimilarityPart[];
  task: Task;
  readyForViewer: boolean = false;
  otherTask?: Task;
  otherStudent?: User;

  constructor(task: Task) {
    super();
    this.task = task;
  }

  /**
   * Returns the URL to download a part of the similarity report for this task similarity.
   *
   * @param idx The index of the part to download.
   * @returns The URL to download the similarity report part.
   */
  public fileUrl(idx: number): string {
    const constants = AppInjector.get(DoubtfireConstants);
    return `${constants.API_URL}/tasks/${this.task.id}/similarities/${this.id}/contents/${idx}`;
  }

  /**
   * Return an ovserverable that will fetch the similarity report url for this task similarity.
   */
  public fetchSimilarityReportUrl(): Observable<string> {
    return AppInjector.get(TaskSimilarityService).getSimilarityReportUrl(this.task.id, this.id);
  }

  public get friendlyTypeName(): string {
    switch (this.type) {
      case TaskSimilarityType.Jplag:
        return 'JPLAG';
      case TaskSimilarityType.Moss:
        return 'MOSS';
      case TaskSimilarityType.TurnItIn:
        return 'TurnItIn';
    }
  }
}
