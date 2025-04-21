import {Injectable} from '@angular/core';
import {CachedEntityService} from 'ngx-entity-service';
import API_URL from 'src/app/config/constants/apiURL';
import {Task, TestAttempt} from 'src/app/api/models/doubtfire-model';
import {Observable} from 'rxjs';
import {AppInjector} from 'src/app/app-injector';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {AlertService} from 'src/app/common/services/alert.service';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class TestAttemptService extends CachedEntityService<TestAttempt> {
  protected readonly endpointFormat =
    'projects/:project_id:/task_def_id/:task_def_id:/test_attempts';
  protected readonly latestCompletedEndpoint =
    this.endpointFormat + '/latest?completed=:completed:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'terminated',
      'completionStatus',
      'successStatus',
      'scoreScaled',
      'cmiDatamodel',
      'attemptedTime',
    );
  }

  public override createInstanceFrom(_json: object, constructorParams: Task): TestAttempt {
    return new TestAttempt(constructorParams);
  }

  public getLatestCompletedAttempt(task: Task): Observable<TestAttempt> {
    return this.get(
      {
        project_id: task.project.id,
        task_def_id: task.taskDefId,
        completed: true,
      },
      {
        endpointFormat: this.latestCompletedEndpoint,
        constructorParams: task,
      },
    );
  }

  public overrideSuccessStatus(testAttemptId: number, successStatus: boolean): void {
    const http = AppInjector.get(HttpClient);

    http
      .patch(
        `${AppInjector.get(DoubtfireConstants).API_URL}/test_attempts/${testAttemptId}?success_status=${successStatus}`,
        {},
      )
      .subscribe({
        next: (_data) => {
          (AppInjector.get(AlertService) as AlertService).success(
            'Attempt pass status successfully overridden.',
            6000,
          );
        },
        error: (message) => {
          (AppInjector.get(AlertService) as AlertService).error(message, 6000);
        },
      });
  }

  public deleteAttempt(testAttemptId: number): void {
    const http = AppInjector.get(HttpClient);

    http
      .delete(`${AppInjector.get(DoubtfireConstants).API_URL}/test_attempts/${testAttemptId}`, {})
      .subscribe({
        next: (_data) => {
          (AppInjector.get(AlertService) as AlertService).success(
            'Attempt successfully deleted.',
            6000,
          );
        },
        error: (message) => {
          (AppInjector.get(AlertService) as AlertService).error(message, 6000);
        },
      });
  }
}
