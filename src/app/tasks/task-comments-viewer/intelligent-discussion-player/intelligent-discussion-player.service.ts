import {Injectable} from '@angular/core';
import {TaskCommentService} from 'src/app/api/models/doubtfire-model';

@Injectable()
export class IntelligentDiscussionPlayerService {
  constructor(private taskService: TaskCommentService) {}
}
