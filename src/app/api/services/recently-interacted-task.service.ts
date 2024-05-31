import {Injectable} from '@angular/core';
import { LocalStorageService } from './local-storage.service';

interface RecentlyInteractedTask {
  task_id: number;
  date: number;
}

interface RecentlyInteractedTasks {
  [unitId: number]: RecentlyInteractedTask[];
}

@Injectable({
  providedIn: 'root',
})
export class RecentlyInteractedTaskService {
  private recentlyInteractedTasks: RecentlyInteractedTasks = {};

  constructor(
    private localStorageService: LocalStorageService,
  ) {
    this.onInit()
  }

  private async onInit() {
    const data = await this.localStorageService.getItem('recentlyInteractedTasks')
    if (data && typeof data === 'object') this.recentlyInteractedTasks = data;
  }

  public addInteractedTask(taskId: number, unitId: number): void {
    const dateStamp = new Date().getTime();
    const recentTask = {task_id: taskId, date: dateStamp}
    // If the unit's key doesn't exist: create it.
    if (!this.recentlyInteractedTasks[unitId]) {
      this.recentlyInteractedTasks[unitId] = [recentTask]
      this.syncTaskIdsToLocalStorage();
    } else {
      const unit = this.recentlyInteractedTasks[unitId];
      if (!unit.some((task) => task.task_id === taskId)) {
        unit.push(recentTask)
        this.syncTaskIdsToLocalStorage();
      }
    }
  }

  public clearAllRecentlyInteractedTasks(): void {
    this.recentlyInteractedTasks = {};
    this.syncTaskIdsToLocalStorage();
  }

  public getRecentlyInteractedTasksIdsByUnitId(unitId): RecentlyInteractedTask[] {
    return this.recentlyInteractedTasks[unitId];
  }

  public getAllRecentlyInteractedTasksIds(): RecentlyInteractedTasks {
    return this.recentlyInteractedTasks;
  }

  private syncTaskIdsToLocalStorage(): void {
    this.localStorageService.setItem('recentlyInteractedTasks', this.recentlyInteractedTasks)
  }
}
