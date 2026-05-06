import {Entity} from 'ngx-entity-service';

export class CommunicationCondition extends Entity {
  id: number;
  type: string;
  communication_rule_id: number;
  operator: string;
  target_grade?: number;
  task_definition_id?: number;
  task_statuses?: string[];
  task_status_count?: number;
  task_target_grade?: number;
  last_sign_in_at?: string;
  tutorial_id?: number;
  tutorial_stream_id?: number;
  campus_id?: number;

  constructor(json?: Partial<CommunicationCondition>) {
    super();
    Object.assign(this, json);
  }
}

export interface CommunicationRulePreviewStudent {
  first_name?: string;
  last_name?: string;
  preferred_name?: string;
  full_name?: string;
  username?: string;
  student_id?: string;
  campus?: string;
  target_grade?: number;
  last_sign_in_at?: string;
}

export interface CommunicationRulePreviewAllocation {
  rule_id: number;
  rule_name: string;
  position: number;
  students: CommunicationRulePreviewStudent[];
}

export interface CommunicationRulePreviewResponse {
  target_rule_id: number;
  allocations: CommunicationRulePreviewAllocation[];
}

export interface CommunicationSetPreviewResponse {
  id: number;
  unit_id: number;
  name: string;
  active: boolean;
  rules: Partial<CommunicationRule>[];
  previews: CommunicationRulePreviewResponse[];
}

export class CommunicationAction extends Entity {
  id: number;
  type: string;
  communication_rule_id: number;
  subject?: string;
  body?: string;
  email_tutors?: boolean;
  email_convenors?: boolean;
  target_grade?: number;

  constructor(json?: Partial<CommunicationAction>) {
    super();
    Object.assign(this, json);
  }
}

export class CommunicationRule extends Entity {
  id: number;
  communication_set_id: number;
  name: string;
  operator: 'and' | 'or';
  position: number;
  active: boolean;
  conditions: CommunicationCondition[] = [];
  actions: CommunicationAction[] = [];

  constructor(json?: Partial<CommunicationRule>) {
    super();
    Object.assign(this, json);

    this.conditions =
      json?.conditions?.map((condition) => new CommunicationCondition(condition)) ?? [];
    this.actions = json?.actions?.map((action) => new CommunicationAction(action)) ?? [];
  }
}

export class CommunicationSet extends Entity {
  id: number;
  unit_id: number;
  name: string;
  active: boolean;
  rules: CommunicationRule[] = [];

  constructor(json?: Partial<CommunicationSet>) {
    super();
    Object.assign(this, json);

    this.rules = json?.rules?.map((rule) => new CommunicationRule(rule)) ?? [];
  }
}
