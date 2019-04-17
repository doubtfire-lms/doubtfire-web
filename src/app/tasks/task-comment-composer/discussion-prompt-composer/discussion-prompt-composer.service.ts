import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { taskService } from 'src/app/ajs-upgraded-providers';

@Injectable()
export class DiscussionPromptComposerService {
  constructor(@Inject(taskService) private ts: any, ) { }

  sendDiscussionPrompt(task: any, data: any) {

  }
}
