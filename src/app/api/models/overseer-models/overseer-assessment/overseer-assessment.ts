import { Entity } from '../../entity';

const KEYS =
  [
    'id',
    'submission_timestamp',
    'task_id',
    'result_task_status'
  ];

export class OverseerAssessment extends Entity {
  id: number;
  label: string;
  timestamp: Date;
  timestampString: string;
  content?: [{ label: string; result: string }];
  task?: any;
  taskStatus?: any;
  submissionStatus?: any;
  createdAt?: any;
  updatedAt?: any;
  taskId?: any;

  constructor(initialData: object, task: any) {
    super(); // delay update from json
    this.task = task;
    if (initialData) {
      this.updateFromJson(initialData);
    }
  }

  toJson(): any {
    return {
      overseer_assessment: super.toJsonWithKeys(KEYS)
    };
  }

  public updateFromJson(data: any): void {
    this.setFromJson(data, KEYS);
    this.submissionStatus = data['status'];
    this.timestamp = new Date(data['submission_timestamp'] * 1000);
    this.timestampString = data['submission_timestamp'];
    this.taskStatus = data['result_task_status'];
    this.submissionStatus = data['status'];
    this.createdAt = data['created_at'];
    this.updatedAt = data['updated_at'];
    this.taskId = data['task_id'];
  }

  public get key(): string {
    return this.id.toString();
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
