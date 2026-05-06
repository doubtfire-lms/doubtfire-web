import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs';
import {
  Campus,
  CampusService,
  CommunicationAction,
  CommunicationActionService,
  CommunicationCondition,
  CommunicationConditionService,
  CommunicationRule,
  CommunicationRulePreviewAllocation,
  CommunicationRulePreviewResponse,
  CommunicationSetPreviewResponse,
  CommunicationRulePreviewStudent,
  CommunicationRuleService,
  CommunicationSet,
  CommunicationSetService,
  TaskDefinition,
  Tutorial,
  TutorialStream,
  Unit,
} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-unit-communications-editor',
  standalone: false,
  templateUrl: './unit-communications-editor.component.html',
  styleUrl: './unit-communications-editor.component.scss',
})
export class UnitCommunicationsEditorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() unit: Unit;

  sets: CommunicationSet[] = [];
  selectedSetId?: number;
  selectedRuleId?: number;
  rules: CommunicationRule[] = [];
  campuses: Campus[] = [];
  taskDefinitions: readonly TaskDefinition[] = [];
  tutorials: readonly Tutorial[] = [];
  tutorialStreams: readonly TutorialStream[] = [];
  loading = false;
  setPreviewLoading = false;
  readonly previewStudentColumns = [
    'preferred_name',
    'first_name',
    'last_name',
    'full_name',
    'username',
    'student_id',
    'campus',
    'target_grade',
    'last_sign_in_at',
  ];

  readonly logicalOperators = ['and', 'or'];
  readonly logicalOperatorOptions = [
    {value: 'and', label: 'All the following conditions'},
    {value: 'or', label: 'Any of the following conditions'},
  ] as const;
  readonly conditionTypes = [
    'TargetGradeCondition',
    'TaskDefinitionStatusCondition',
    'TaskStatusCountCondition',
    'LoginStatusCondition',
    'TutorialEnrolmentCondition',
    'TutorialStreamEnrolmentCondition',
    'CampusCondition',
  ];
  readonly conditionTypeLabels: Record<string, string> = {
    TargetGradeCondition: 'Target Grade',
    TaskDefinitionStatusCondition: 'Task Status',
    TaskStatusCountCondition: 'Task Status Count',
    LoginStatusCondition: 'Login Status',
    TutorialEnrolmentCondition: 'Tutorial Enrolment',
    TutorialStreamEnrolmentCondition: 'Tutorial Stream Enrolment',
    CampusCondition: 'Campus',
  };
  readonly actionTypes = ['EmailStudentAction', 'EmailStaffAction', 'ChangeTargetGradeAction'];
  readonly actionTypeLabels: Record<string, string> = {
    EmailStudentAction: 'Send email to student',
    EmailStaffAction: 'Send email to staff',
    ChangeTargetGradeAction: 'Change Target Grade',
  };
  readonly gradeOperators = [
    'greater_than',
    'greater_than_or_equal_to',
    'less_than',
    'less_than_or_equal_to',
    'equal_to',
    'not_equal_to',
  ];
  readonly equalityOperators = ['equal_to', 'not_equal_to'];
  readonly dateOperators = ['before', 'after'];
  readonly enrolmentOperators = ['enrolled_in', 'not_enrolled_in'];
  readonly operatorLabels: Record<string, string> = {
    greater_than: 'Greater Than',
    greater_than_or_equal_to: 'Greater Than Or Equal To',
    less_than: 'Less Than',
    less_than_or_equal_to: 'Less Than Or Equal To',
    equal_to: 'Equal To',
    not_equal_to: 'Not Equal To',
    before: 'Before',
    after: 'After',
    enrolled_in: 'Enrolled In',
    not_enrolled_in: 'Not Enrolled In',
  };
  readonly targetGrades = [
    {value: 1, label: 'P'},
    {value: 2, label: 'C'},
    {value: 3, label: 'D'},
    {value: 4, label: 'HD'},
  ];
  readonly targetGradeLabels: Record<number, string> = {
    1: 'P',
    2: 'C',
    3: 'D',
    4: 'HD',
  };
  readonly targetGradeNames: Record<number, string> = {
    1: 'Pass',
    2: 'Credit',
    3: 'Distinction',
    4: 'High Distinction',
  };
  readonly emailVariables = [
    {token: '{{student.first_name}}', label: 'Student First Name'},
    {token: '{{student.last_name}}', label: 'Student Last Name'},
    {token: '{{student.preferred_name}}', label: 'Student Preferred Name'},
    {token: '{{student.full_name}}', label: 'Student Full Name'},
    {token: '{{student.username}}', label: 'Student Username'},
    {token: '{{student.student_id}}', label: 'Student ID'},
    {token: '{{unit.code}}', label: 'Unit Code'},
    {token: '{{unit.name}}', label: 'Unit Name'},
    {token: '{{rule.name}}', label: 'Rule Name'},
    {token: '{{target_grade}}', label: 'Target Grade'},
  ];
  readonly taskStatuses = [
    'not_started',
    'complete',
    'need_help',
    'working_on_it',
    'fix_and_resubmit',
    'feedback_exceeded',
    'redo',
    'discuss',
    'ready_for_feedback',
    'demonstrate',
    'fail',
    'time_exceeded',
    'assess_in_portfolio',
    'attention_required',
  ];

  newSet = this.blankSet();
  newRule = this.blankRule();
  newConditions: Record<number, Partial<CommunicationCondition>> = {};
  conditionFormOpen: Record<number, boolean> = {};
  newActions: Record<number, Partial<CommunicationAction>> = {};
  actionFormOpen: Record<number, boolean> = {};
  previewTabIndex: Record<number, number> = {};
  previewLoading: Record<number, boolean> = {};
  previewLoaded: Record<number, boolean> = {};
  previewStudents: Record<number, CommunicationRulePreviewStudent[]> = {};
  previewAllocations: Record<number, CommunicationRulePreviewAllocation[]> = {};

  private subscriptions: Subscription[] = [];

  constructor(
    private ruleService: CommunicationRuleService,
    private conditionService: CommunicationConditionService,
    private actionService: CommunicationActionService,
    private setService: CommunicationSetService,
    private campusService: CampusService,
    private alerts: AlertService,
  ) {}

  ngOnInit(): void {
    this.campusService.query().subscribe((campuses) => {
      this.campuses = campuses;
    });
    this.refreshUnitLookups();
    this.loadSets();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.unit && this.unit) {
      this.refreshUnitLookups();
      this.loadSets();
    }
  }

  addSet(): void {
    if (!this.unit) return;

    this.setService.createForUnit(this.unit.id, this.newSet).subscribe({
      next: (set) => {
        this.sets.push(set);
        this.newSet = this.blankSet();
        this.selectedSetId = set.id;
        this.selectSet();
      },
      error: (error) => this.showError(error),
    });
  }

  deleteSet(set: CommunicationSet): void {
    this.setService.deleteForUnit(this.unit.id, set.id).subscribe({
      next: () => {
        this.sets = this.sets.filter((item) => item.id !== set.id);
        this.selectedSetId = this.sets[0]?.id;
        this.selectSet();
      },
      error: (error) => this.showError(error),
    });
  }

  selectSet(): void {
    const set = this.selectedSet();
    this.rules = set?.rules ?? [];
    this.selectedRuleId = this.rules[0]?.id;

    if (set) {
      this.loadPreviewForSet(set);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  addRule(): void {
    if (!this.unit) return;
    const set = this.selectedSet();
    if (!set) return;

    this.ruleService.createForSet(this.unit.id, set.id, this.newRule).subscribe({
      next: (rule) => {
        this.rules.push(rule);
        set.rules = this.rules;
        this.newRule = this.blankRule();
        this.selectedRuleId = rule.id;
        this.loadPreviewForSet(set);
      },
      error: (error) => this.showError(error),
    });
  }

  deleteRule(rule: CommunicationRule): void {
    this.ruleService.deleteForUnit(this.unit.id, rule.id).subscribe({
      next: () => {
        this.rules = this.rules.filter((item) => item.id !== rule.id);
        const set = this.selectedSet();
        if (set) {
          set.rules = this.rules;
          this.selectedRuleId = this.rules[0]?.id;
          this.loadPreviewForSet(set);
        }
      },
      error: (error) => this.showError(error),
    });
  }

  updateRuleOperator(rule: CommunicationRule): void {
    this.ruleService.updateForUnit(this.unit.id, rule.id, {operator: rule.operator}).subscribe({
      next: (updated) => {
        rule.operator = updated.operator;
        this.refreshPreview(rule);
      },
      error: (error) => this.showError(error),
    });
  }

  previewRule(rule: CommunicationRule, activateStudentsTab = true): void {
    if (activateStudentsTab) {
      this.previewTabIndex[rule.id] = 2;
    }
  }

  addCondition(rule: CommunicationRule): void {
    const condition = this.newConditions[rule.id] || this.blankCondition();
    this.conditionService.create(this.unit.id, rule.id, condition).subscribe({
      next: (created) => {
        rule.conditions ||= [];
        rule.conditions.push(created);
        this.newConditions[rule.id] = this.blankCondition();
        this.conditionFormOpen[rule.id] = false;
        this.refreshPreview(rule);
      },
      error: (error) => this.showError(error),
    });
  }

  showConditionForm(rule: CommunicationRule): void {
    this.newConditions[rule.id] = this.blankCondition();
    this.conditionFormOpen[rule.id] = true;
  }

  cancelCondition(rule: CommunicationRule): void {
    this.newConditions[rule.id] = this.blankCondition();
    this.conditionFormOpen[rule.id] = false;
  }

  deleteCondition(rule: CommunicationRule, condition: CommunicationCondition): void {
    this.conditionService.delete(this.unit.id, rule.id, condition.id).subscribe({
      next: () => {
        rule.conditions = rule.conditions.filter((item) => item.id !== condition.id);
        this.refreshPreview(rule);
      },
      error: (error) => this.showError(error),
    });
  }

  addAction(rule: CommunicationRule): void {
    const action = this.newActions[rule.id] || this.blankAction();
    this.actionService.create(this.unit.id, rule.id, action).subscribe({
      next: (created) => {
        rule.actions ||= [];
        rule.actions.push(created);
        this.newActions[rule.id] = this.blankAction();
        this.actionFormOpen[rule.id] = false;
      },
      error: (error) => this.showError(error),
    });
  }

  showActionForm(rule: CommunicationRule): void {
    this.newActions[rule.id] = this.blankAction();
    this.actionFormOpen[rule.id] = true;
  }

  cancelAction(rule: CommunicationRule): void {
    this.newActions[rule.id] = this.blankAction();
    this.actionFormOpen[rule.id] = false;
  }

  deleteAction(rule: CommunicationRule, action: CommunicationAction): void {
    this.actionService.delete(this.unit.id, rule.id, action.id).subscribe({
      next: () => {
        rule.actions = rule.actions.filter((item) => item.id !== action.id);
      },
      error: (error) => this.showError(error),
    });
  }

  conditionFor(rule: CommunicationRule): Partial<CommunicationCondition> {
    this.newConditions[rule.id] ||= this.blankCondition();
    return this.newConditions[rule.id];
  }

  actionFor(rule: CommunicationRule): Partial<CommunicationAction> {
    this.newActions[rule.id] ||= this.blankAction();
    return this.newActions[rule.id];
  }

  selectRule(rule: CommunicationRule): void {
    this.selectedRuleId = rule.id;
  }

  selectedRule(): CommunicationRule | undefined {
    return this.rules.find((rule) => rule.id === this.selectedRuleId);
  }

  onRuleTabChange(rule: CommunicationRule, index: number): void {
    this.previewTabIndex[rule.id] = index;
  }

  studentsFor(rule: CommunicationRule): CommunicationRulePreviewStudent[] {
    return this.previewStudents[rule.id] || [];
  }

  previewAllocationsFor(rule: CommunicationRule): CommunicationRulePreviewAllocation[] {
    return this.previewAllocations[rule.id] || [];
  }

  isTargetPreviewAllocation(
    rule: CommunicationRule,
    allocation: CommunicationRulePreviewAllocation,
  ): boolean {
    return allocation.rule_id === rule.id;
  }

  studentsTabLabel(rule: CommunicationRule): string {
    const matchedCount = this.previewLoaded[rule.id] ? this.studentsFor(rule).length : 0;
    const totalStudents = this.availableStudentsForRule(rule);

    return `Students (${matchedCount}/${totalStudents})`;
  }

  operatorsFor(conditionType: string): string[] {
    switch (conditionType) {
      case 'TargetGradeCondition':
      case 'TaskStatusCountCondition':
        return this.gradeOperators;
      case 'TaskDefinitionStatusCondition':
        return this.equalityOperators;
      case 'LoginStatusCondition':
        return this.dateOperators;
      default:
        return this.enrolmentOperators;
    }
  }

  labelFor(record: CommunicationCondition | CommunicationAction): string {
    const hiddenKeys = this.hiddenKeysForRecord(record);

    return Object.entries(record)
      .filter(
        ([key, value]) =>
          !hiddenKeys.includes(key) && value !== undefined && value !== null && value !== '',
      )
      .map(([key, value]) => `${this.prettyKey(key)}: ${this.prettyValue(key, value)}`)
      .join(', ');
  }

  conditionTypeLabel(type: string): string {
    return this.conditionTypeLabels[type] || type;
  }

  operatorLabel(operator: string): string {
    return this.operatorLabels[operator] || operator;
  }

  actionTypeLabel(type: string): string {
    return this.actionTypeLabels[type] || type;
  }

  targetGradeName(targetGrade: number | undefined): string {
    if (targetGrade === undefined || targetGrade === null) return '';

    return this.targetGradeNames[targetGrade] || `${targetGrade}`;
  }

  taskDefinitionLabel(taskDefinitionId: number): string {
    const taskDefinition = this.taskDefinitions.find((task) => task.id === taskDefinitionId);

    if (!taskDefinition) {
      return `Task ${taskDefinitionId}`;
    }

    return `Task ${taskDefinition.abbreviation} ${taskDefinition.name}`;
  }

  taskStatusLabel(taskStatus: string): string {
    return this.titleize(taskStatus);
  }

  taskStatusesLabel(taskStatuses: string[] = []): string {
    return taskStatuses.map((status) => this.taskStatusLabel(status)).join(', ');
  }

  insertActionVariable(rule: CommunicationRule, field: 'subject' | 'body', token: string): void {
    const action = this.actionFor(rule);
    const currentValue = action[field] ?? '';
    const separator =
      currentValue && !currentValue.endsWith(' ') && !currentValue.endsWith('\n') ? ' ' : '';
    action[field] = `${currentValue}${separator}${token}`;
  }

  renderTemplatePreview(value: string | undefined, rule: CommunicationRule): string {
    if (!value) return '';

    const escaped = this.escapeHtml(value);
    const rendered = escaped.replace(/\{\{[\w.]+\}\}/g, (token) => {
      const replacement = this.resolveTemplateVariable(token, rule) || token;
      return `<span class="rounded bg-blue-50 px-1 text-blue-800">${this.escapeHtml(replacement)}</span>`;
    });

    return rendered.replace(/\n/g, '<br />');
  }

  refreshPreview(rule: CommunicationRule): void {
    const set = this.selectedSet();
    if (set) {
      this.loadPreviewForSet(set);
    }
  }

  taskStatusPredicate(operator: string): string {
    return operator === 'not_equal_to' ? 'Not In' : 'In';
  }

  tutorialLabel(tutorialId: number): string {
    const tutorial = this.tutorials.find((item) => item.id === tutorialId);
    return tutorial ? `${tutorial.abbreviation} ${tutorial.description}` : `Tutorial ${tutorialId}`;
  }

  tutorialStreamLabel(tutorialStreamId: number): string {
    const tutorialStream = this.tutorialStreams.find((item) => item.id === tutorialStreamId);
    return tutorialStream
      ? `${tutorialStream.abbreviation} ${tutorialStream.name}`
      : `Tutorial Stream ${tutorialStreamId}`;
  }

  campusLabel(campusId: number): string {
    const campus = this.campuses.find((item) => item.id === campusId);
    return campus ? campus.name : `Campus ${campusId}`;
  }

  enrolmentPredicate(operator: string): string {
    return operator === 'not_enrolled_in' ? 'Not Enrolled In' : 'Enrolled In';
  }

  dateLabel(value: string): string {
    return value ? new Date(value).toLocaleString() : '';
  }

  onConditionTypeChange(rule: CommunicationRule): void {
    const current = this.conditionFor(rule);
    this.newConditions[rule.id] = {
      type: current.type,
      operator: this.operatorsFor(current.type)[0],
    };

    if (current.type === 'TaskDefinitionStatusCondition') {
      this.newConditions[rule.id].task_statuses = [];
    }

    if (current.type === 'TaskStatusCountCondition') {
      this.newConditions[rule.id].task_statuses = [];
      this.newConditions[rule.id].task_status_count = 2;
      this.newConditions[rule.id].task_target_grade = 1;
    }
  }

  onActionTypeChange(rule: CommunicationRule): void {
    const current = this.actionFor(rule);
    this.newActions[rule.id] = {
      type: current.type,
      email_tutors: false,
      email_convenors: false,
    };
  }

  private loadSets(): void {
    if (!this.unit) return;

    this.loading = true;
    this.setService.getForUnit(this.unit.id).subscribe({
      next: (sets) => {
        this.sets = sets;
        this.selectedSetId ||= sets[0]?.id;
        this.selectSet();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.showError(error);
      },
    });
  }

  private refreshUnitLookups(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];

    if (!this.unit) return;

    this.taskDefinitions = this.unit.taskDefinitionCache.currentValues;
    this.tutorials = this.unit.tutorials;
    this.tutorialStreams = this.unit.tutorialStreams;
    this.subscriptions.push(
      this.unit.taskDefinitionCache.values.subscribe((taskDefinitions) => {
        this.taskDefinitions = taskDefinitions;
      }),
    );
  }

  private blankRule(): Pick<CommunicationRule, 'name' | 'operator'> {
    return {name: '', operator: 'and'};
  }

  private blankSet(): Pick<CommunicationSet, 'name'> & Partial<Pick<CommunicationSet, 'active'>> {
    return {name: '', active: true};
  }

  selectedSet(): CommunicationSet | undefined {
    return this.sets.find((set) => set.id === this.selectedSetId);
  }

  private blankCondition(): Partial<CommunicationCondition> {
    return {
      type: 'TargetGradeCondition',
      operator: 'greater_than_or_equal_to',
    };
  }

  private blankAction(): Partial<CommunicationAction> {
    return {
      type: 'EmailStudentAction',
      email_tutors: false,
      email_convenors: false,
    };
  }

  private loadPreviewForSet(set: CommunicationSet): void {
    if (!this.unit) {
      this.setPreviewLoading = false;
      return;
    }

    this.setPreviewLoading = true;
    this.setService.getForUnitById(this.unit.id, set.id).subscribe({
      next: (setResponse) => {
        this.applySetPreviewResponse(setResponse);
        this.setPreviewLoading = false;
      },
      error: (error) => {
        this.setPreviewLoading = false;
        this.showError(error);
      },
    });
  }

  private applySetPreviewResponse(setResponse: CommunicationSetPreviewResponse): void {
    const rules = (setResponse.rules || []).map((rule) => new CommunicationRule(rule));
    const updatedSet = new CommunicationSet({
      id: setResponse.id,
      unit_id: setResponse.unit_id,
      name: setResponse.name,
      active: setResponse.active,
      rules,
    });
    const setIndex = this.sets.findIndex((set) => set.id === updatedSet.id);
    if (setIndex >= 0) {
      this.sets[setIndex] = updatedSet;
    }

    if (this.selectedSetId === updatedSet.id) {
      this.rules = rules;
      if (!this.rules.some((rule) => rule.id === this.selectedRuleId)) {
        this.selectedRuleId = this.rules[0]?.id;
      }
    }

    this.rules.forEach((rule) => {
      this.previewLoading[rule.id] = true;
    });

    setResponse.previews.forEach((preview) => {
      this.previewAllocations[preview.target_rule_id] = preview.allocations || [];
      this.previewStudents[preview.target_rule_id] = this.studentsForPreviewRule(
        preview.target_rule_id,
        preview,
      );
      this.previewLoaded[preview.target_rule_id] = true;
      this.previewLoading[preview.target_rule_id] = false;
    });

    this.rules.forEach((rule) => {
      this.previewLoading[rule.id] = false;
    });
  }

  private studentsForPreviewRule(
    ruleId: number,
    preview: CommunicationRulePreviewResponse,
  ): CommunicationRulePreviewStudent[] {
    return preview.allocations.find((allocation) => allocation.rule_id === ruleId)?.students || [];
  }

  private availableStudentsForRule(rule: CommunicationRule): number {
    const totalStudents = this.unit?.students?.length ?? 0;
    if (!this.previewLoaded[rule.id]) return totalStudents;

    const claimedByPreviousRules = this.previewAllocationsFor(rule)
      .filter((allocation) => allocation.rule_id !== rule.id)
      .reduce((sum, allocation) => sum + allocation.students.length, 0);

    return Math.max(0, totalStudents - claimedByPreviousRules);
  }

  private sampleStudentForRule(
    rule: CommunicationRule,
  ): CommunicationRulePreviewStudent | undefined {
    return this.studentsFor(rule)[0];
  }

  private showError(error: any): void {
    this.alerts.error(error?.message || error?.error || error || 'Communication update failed');
  }

  private prettyKey(key: string): string {
    const labels: Record<string, string> = {
      operator: 'Operator',
      target_grade: 'Target Grade',
      task_definition_id: 'Task',
      task_statuses: 'Task Statuses',
      task_status_count: 'Task Status Count',
      task_target_grade: 'Task Target Grade',
      last_sign_in_at: 'Last Sign In',
      tutorial_id: 'Tutorial',
      tutorial_stream_id: 'Tutorial Stream',
      campus_id: 'Campus',
      subject: 'Subject',
      body: 'Body',
      email_tutors: 'Email Tutors',
      email_convenors: 'Email Convenors',
    };

    return labels[key] || key;
  }

  private prettyValue(key: string, value: unknown): string {
    if (key === 'operator' && typeof value === 'string') {
      return this.operatorLabel(value);
    }

    if ((key === 'target_grade' || key === 'task_target_grade') && typeof value === 'number') {
      return this.targetGradeLabels[value] || value.toString();
    }

    if (key === 'task_statuses' && Array.isArray(value)) {
      return this.taskStatusesLabel(value);
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return `${value}`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private resolveTemplateVariable(token: string, rule: CommunicationRule): string | undefined {
    const student = this.sampleStudentForRule(rule);

    switch (token) {
      case '{{student.first_name}}':
        return student?.first_name;
      case '{{student.last_name}}':
        return student?.last_name;
      case '{{student.preferred_name}}':
        return student?.preferred_name || student?.first_name;
      case '{{student.full_name}}':
        return (
          student?.full_name || [student?.first_name, student?.last_name].filter(Boolean).join(' ')
        );
      case '{{student.username}}':
        return student?.username;
      case '{{student.student_id}}':
        return student?.student_id;
      case '{{unit.code}}':
        return this.unit?.code;
      case '{{unit.name}}':
        return this.unit?.name;
      case '{{rule.name}}':
        return rule.name;
      case '{{target_grade}}':
        return student?.target_grade ? this.targetGradeName(student.target_grade) : undefined;
      default:
        return undefined;
    }
  }

  private hiddenKeysForRecord(record: CommunicationCondition | CommunicationAction): string[] {
    const baseHiddenKeys = ['id', 'type', 'communication_rule_id', 'operator'];

    if (!('type' in record)) {
      return baseHiddenKeys;
    }

    switch (record.type) {
      case 'ChangeTargetGradeAction':
        return [...baseHiddenKeys, 'subject', 'body', 'email_tutors', 'email_convenors'];
      case 'EmailStudentAction':
        return [...baseHiddenKeys, 'target_grade', 'email_tutors', 'email_convenors'];
      case 'EmailStaffAction':
        return [...baseHiddenKeys, 'target_grade'];
      default:
        return baseHiddenKeys;
    }
  }

  private titleize(value: string): string {
    return value
      ?.split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
