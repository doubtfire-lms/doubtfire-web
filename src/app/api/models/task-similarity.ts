import { Entity } from 'ngx-entity-service';
import { AppInjector } from 'src/app/app-injector';
import { Task } from './doubtfire-model';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

export class TaskSimilarityPart {
  idx: number;
  format: string;
  description: string;
}

/**
 * Represents a similarity report for a task. Each has either one or two parts:
 * turn it in has one PDF part, while moss has two html parts.
 */
export class TaskSimilarity extends Entity {
  id: number;
  type: string;
  flagged: boolean;
  pct: number;
  parts: TaskSimilarityPart[];
  task: Task;

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
}
