import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';

@Injectable({providedIn: 'root'})
export class CommentDraftService {
  private readonly PREFIX = 'df_comment_draft_'; // Prefix for localStorage keys

  getDraft(projectId: number, taskDefinitionId: number): Observable<string> {
    const key = this.generateKey(projectId, taskDefinitionId);
    const draft = localStorage.getItem(key);
    return of(draft || ''); // Return empty string if no draft exists
  }

  saveDraft(projectId: number, taskDefinitionId: number, text: string): Observable<boolean> {
    const key = this.generateKey(projectId, taskDefinitionId);
    localStorage.setItem(key, text);
    return of(true); // Simulate successful save
  }

  clearDraft(projectId: number, taskDefinitionId: number): Observable<boolean> {
    const key = this.generateKey(projectId, taskDefinitionId);
    localStorage.removeItem(key);
    return of(true); // Simulate successful deletion
  }

  private generateKey(projectId: number, taskDefinitionId: number): string {
    return `${this.PREFIX}p${projectId}_td${taskDefinitionId}`;
  }
}
