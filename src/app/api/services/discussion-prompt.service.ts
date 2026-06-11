import {CachedEntityService, RequestOptions} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  Project,
  ProjectService,
  TaskDefinition,
  Unit,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';
import {DiscussionPrompt} from '../models/discussion-prompt';

@Injectable()
export class DiscussionPromptService extends CachedEntityService<DiscussionPrompt> {
  protected readonly endpointFormat =
    'task_definitions/:task_definition_id:/discussion_prompts/:id:';

  protected readonly projectEndpointFormat = 'projects/:projectId:/discussion_prompts';
  protected readonly taskDefinitionProjectEndpointFormat =
    'projects/:projectId:/discussion_prompts';
  protected readonly taskDefinitionEndpointFormat =
    'task_definitions/:taskDefinitionId:/discussion_prompts';

  constructor(
    httpClient: HttpClient,
    private userService: UserService,
    private projectService: ProjectService,
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'content',
      'priority',
      {
        keys: ['createdBy', 'created_by_id'],
        toEntityFn: (data: object, key: string, prompt: DiscussionPrompt) => {
          if (prompt.project) {
            return prompt.project.unit.staff.find((s) => s.user.id === data['created_by_id']).user;
          } else if (prompt.taskDefinition) {
            return prompt.taskDefinition.unit.staff.find((s) => s.user.id === data['created_by_id'])
              ?.user;
          } else if (prompt.unit) {
            return prompt.unit.staff.find((s) => s.user.id === data['created_by_id'])?.user;
          }
        },
      },
      {
        keys: ['taskDefinition', 'task_definition_id'],
        toEntityFn: (data: object, key: string, entity: DiscussionPrompt) => {
          if (entity.project) {
            return entity.project.unit.taskDef(data[key]);
          } else if (entity.unit) {
            return entity.unit.taskDef(data[key]);
          }
          return entity.taskDefinition;
        },
        toJsonFn: (entity: DiscussionPrompt, _key: string) => {
          return entity.taskDefinition?.id;
        },
      },
    );

    this.mapping.addJsonKey('project', 'taskDefinition', 'unit', 'createdBy');
  }

  public createInstanceFrom(
    _json: object,
    other?: Project | Unit | TaskDefinition,
  ): DiscussionPrompt {
    return new DiscussionPrompt(other);
  }

  // TODO: loadDiscussionPromptsForProject and overload for loadTaskDefinitionDiscussionPrompts()

  public loadDiscussionPromptsForPoject(project: Project) {
    const options: RequestOptions<DiscussionPrompt> = {
      endpointFormat: this.taskDefinitionProjectEndpointFormat,
      cacheBehaviourOnGet: 'cacheQuery',
      constructorParams: project,
    };

    return super.fetchAll(
      {
        projectId: project?.id,
      },
      options,
    );
  }

  public loadDiscussionPrompts(
    project: Project,
    taskDefinition?: TaskDefinition,
    useFetch: boolean = true,
  ): Observable<DiscussionPrompt[]> {
    const options: RequestOptions<DiscussionPrompt> = {
      endpointFormat: project
        ? taskDefinition
          ? this.taskDefinitionProjectEndpointFormat
          : this.projectEndpointFormat
        : this.taskDefinitionEndpointFormat,
      cache: taskDefinition.discussionPromptsCache,
      sourceCache: taskDefinition.discussionPromptsCache,
      // cacheBehaviourOnGet: 'cacheQuery',
      constructorParams: project ? project : taskDefinition,
    };

    if (useFetch) {
      return super.fetchAll(
        {
          projectId: project?.id,
          taskDefinitionId: taskDefinition?.id,
        },
        options,
      );
    } else {
      return super.query(
        {
          projectId: project?.id,
          taskDefinitionId: taskDefinition?.id,
        },
        options,
      );
    }
  }
}
