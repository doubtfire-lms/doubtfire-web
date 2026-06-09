import {TaskCommentService} from 'src/app/api/models/doubtfire-model';
import {Injectable} from '@angular/core';

@Injectable()
export class IntelligentDiscussionPlayerService {
  constructor(private taskService: TaskCommentService) {}
}
