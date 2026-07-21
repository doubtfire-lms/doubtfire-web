import {NestedTreeControl} from '@angular/cdk/tree';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatTreeNestedDataSource} from '@angular/material/tree';
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
  CommunicationRulePreviewStudent,
  CommunicationRuleService,
  CommunicationSet,
  CommunicationSetPreviewResponse,
  CommunicationSetSchedule,
  CommunicationSetService,
  ProjectService,
  TaskDefinition,
  Tutorial,
  TutorialStream,
  Unit,
} from 'src/app/api/models/doubtfire-model';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {
  CommunicationScheduleModalComponent,
  CommunicationScheduleModalData,
} from './communication-schedule-modal/communication-schedule-modal.component';

interface CommunicationTreeNode {
  type: 'set' | 'rule';
  id: number;
  label: string;
  set?: CommunicationSet;
  rule?: CommunicationRule;
  children?: CommunicationTreeNode[];
}

@Component({
  selector: 'f-unit-communications-editor',
  standalone: false,
  templateUrl: './unit-communications-editor.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './unit-communications-editor.component.scss',
})
export class UnitCommunicationsEditorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() unit: Unit;

  readonly editorContext = this;
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
    'spec_con_days',
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
    'SpecConCondition',
    'TutorialEnrolmentCondition',
    'TutorialStreamEnrolmentCondition',
    'CampusCondition',
  ];
  readonly conditionTypeLabels: Record<string, string> = {
    TargetGradeCondition: 'Target Grade',
    TaskDefinitionStatusCondition: 'Task Status',
    TaskStatusCountCondition: 'Task Status Count',
    LoginStatusCondition: 'Login Status',
    SpecConCondition: 'Special Consideration Days',
    TutorialEnrolmentCondition: 'Tutorial Enrolment',
    TutorialStreamEnrolmentCondition: 'Tutorial Stream Enrolment',
    CampusCondition: 'Campus',
  };
  readonly actionTypes = [
    'EmailStudentAction',
    'EmailStaffAction',
    'ChangeTargetGradeAction',
    'TaskCommentAction',
  ];
  readonly actionTypeLabels: Record<string, string> = {
    EmailStudentAction: 'Send email to student',
    EmailStaffAction: 'Send email to staff',
    ChangeTargetGradeAction: 'Change Target Grade',
    TaskCommentAction: 'Task Comment',
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
  get targetGrades() {
    return this.unit.gradeDefinitions
      .filter((definition) => definition.value >= 0)
      .map((definition) => ({value: definition.value, label: definition.abbreviation}));
  }
  readonly emailVariables = [
    {token: '{{student.first_name}}', label: 'Student First Name'},
    {token: '{{student.last_name}}', label: 'Student Last Name'},
    {token: '{{student.preferred_name}}', label: 'Student Preferred Name'},
    {token: '{{student.full_name}}', label: 'Student Full Name'},
    {token: '{{student.username}}', label: 'Student Username'},
    {token: '{{student.student_id}}', label: 'Student ID'},
    {token: '{{affected_students_count}}', label: 'Affected Students Count'},
    {token: '{{unit.code}}', label: 'Unit Code'},
    {token: '{{unit.name}}', label: 'Unit Name'},
    {token: '{{rule.name}}', label: 'Rule Name'},
    {token: '{{target_grade}}', label: 'Target Grade'},
    // {token: '{{conditions_summary}}', label: 'Conditions Summary'},
    // {token: '{{actions_summary}}', label: 'Actions Summary'},
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
    'rediscuss',
  ];

  newConditions: Record<number, Partial<CommunicationCondition>> = {};
  conditionFormOpen: Record<number, boolean> = {};
  editingConditionId: Record<number, number | undefined> = {};
  newActions: Record<number, Partial<CommunicationAction>> = {};
  actionFormOpen: Record<number, boolean> = {};
  editingActionId: Record<number, number | undefined> = {};
  previewTabIndex: Record<number, number> = {};
  previewLoading: Record<number, boolean> = {};
  previewLoaded: Record<number, boolean> = {};
  previewStudents: Record<number, CommunicationRulePreviewStudent[]> = {};
  previewAllocations: Record<number, CommunicationRulePreviewAllocation[]> = {};
  editingSetNameId?: number;
  editingRuleNameId?: number;
  setNameDraft = '';
  ruleNameDraft = '';
  readonly treeControl: NestedTreeControl<CommunicationTreeNode> = new NestedTreeControl(
    (node) => node.children,
  );
  readonly treeDataSource: MatTreeNestedDataSource<CommunicationTreeNode> =
    new MatTreeNestedDataSource();
  private expandedSetIds: Set<number> = new Set();

  private subscriptions: Subscription[] = [];

  get currentUnitWeek(): number | null {
    return this.unit?.currentUnitWeek ?? null;
  }

  constructor(
    private ruleService: CommunicationRuleService,
    private conditionService: CommunicationConditionService,
    private actionService: CommunicationActionService,
    private setService: CommunicationSetService,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private campusService: CampusService,
    private alerts: AlertService,
    private sidekiqProgressModalService: SidekiqProgressModalService,
    private confirmationModalService: ConfirmationModalService,
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
    if (!this.unit) {
      return;
    }

    const newSet = {
      name: this.defaultSetName(),
      active: true,
    } as Pick<CommunicationSet, 'name'> & Partial<Pick<CommunicationSet, 'active'>>;

    this.setService.createForUnit(this.unit.id, newSet).subscribe({
      next: (set) => {
        this.sets.push(set);
        this.expandedSetIds.add(set.id);
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
        this.expandedSetIds.delete(set.id);
        if (this.selectedSetId === set.id) {
          this.selectedSetId = undefined;
        }
        this.selectSet();
      },
      error: (error) => this.showError(error),
    });
  }

  beginEditSetName(set: CommunicationSet): void {
    this.editingSetNameId = set.id;
    this.setNameDraft = set.name;
  }

  cancelEditSetName(): void {
    this.editingSetNameId = undefined;
    this.setNameDraft = '';
  }

  saveSetName(set: CommunicationSet): void {
    const name = this.setNameDraft.trim();
    if (!name) {
      return;
    }

    this.setService.updateForUnit(this.unit.id, set.id, {name}).subscribe({
      next: (updated) => {
        set.name = updated.name;
        const matchingSet = this.sets.find((item) => item.id === set.id);
        if (matchingSet) {
          matchingSet.name = updated.name;
        }
        this.cancelEditSetName();
        this.rebuildTree();
      },
      error: (error) => this.showError(error),
    });
  }

  confirmExecuteSet(set: CommunicationSet): void {
    this.confirmationModalService.show(
      'Execute Set?',
      'This will execute every rule in this set, in sequence. Once a student is matched by an earlier rule, they are removed from consideration for the remaining rules, so each student can only be picked up once during the set run.',
      () => this.executeSet(set),
      undefined,
      'Execute Set',
    );
  }

  executeSet(set: CommunicationSet): void {
    this.setService.executeForUnit(this.unit.id, set.id).subscribe({
      next: (job) => this.showExecutionProgress(job, `Executing ${set.name}`),
      error: (error) => this.showError(error),
    });
  }

  addSchedule(set: CommunicationSet): void {
    this.openScheduleModal(set);
  }

  editSchedule(set: CommunicationSet, schedule: CommunicationSetSchedule): void {
    this.openScheduleModal(set, schedule);
  }

  deleteSchedule(set: CommunicationSet, schedule: CommunicationSetSchedule): void {
    const updatedSchedules = (set.schedules || []).filter(
      (item) => (item.id || item.client_key) !== (schedule.id || schedule.client_key),
    );
    this.persistSchedules(set, updatedSchedules, 'Schedule removed');
  }

  scheduleTrackId(schedule: CommunicationSetSchedule): string | number {
    return (
      schedule.id ||
      schedule.client_key ||
      `${schedule.name || 'schedule'}-${schedule.anchor_week}-${schedule.anchor_day}`
    );
  }

  scheduleSummary(schedule: CommunicationSetSchedule): string {
    const cadence = this.scheduleCadence(schedule);
    const ending = this.scheduleEnding(schedule);
    return [cadence, ending].filter(Boolean).join(' | ');
  }

  scheduleAnchorSummary(schedule: CommunicationSetSchedule): string {
    return `Week ${schedule.anchor_week || 1} on ${schedule.anchor_day || 'Monday'}`;
  }

  scheduleTimeSummary(schedule: CommunicationSetSchedule): string {
    return `${this.formatTime(schedule.hour, schedule.minute)} ${schedule.timezone || 'UTC'}`;
  }

  scheduleNextRunSummary(schedule: CommunicationSetSchedule): string {
    return schedule.next_run_at ? this.dateLabel(schedule.next_run_at) : 'Not scheduled';
  }

  scheduleLastRunSummary(schedule: CommunicationSetSchedule): string {
    return schedule.last_run_at ? this.dateLabel(schedule.last_run_at) : 'Not yet run';
  }

  iceCubePreview(schedule: CommunicationSetSchedule): string {
    return JSON.stringify(schedule.ice_cube_schedule || {}, null, 2);
  }

  selectSet(): void {
    const set = this.selectedSet();
    if (set) {
      this.activateSet(set);
    } else {
      this.rules = [];
      this.selectedRuleId = undefined;
      this.rebuildTree();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  addRule(): void {
    if (!this.unit) {
      return;
    }
    const set = this.selectedSet();
    if (!set) {
      return;
    }

    const newRule = {
      name: this.defaultRuleName(),
      operator: 'and',
    } as Pick<CommunicationRule, 'name' | 'operator'>;

    this.ruleService.createForSet(this.unit.id, set.id, newRule).subscribe({
      next: (rule) => {
        this.rules.push(rule);
        set.rules = this.rules;
        this.selectedRuleId = rule.id;
        this.expandedSetIds.add(set.id);
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

  updateRule(rule: CommunicationRule): void {
    this.ruleService
      .updateForUnit(this.unit.id, rule.id, {
        name: rule.name,
        operator: rule.operator,
        send_log_to_convenors: rule.send_log_to_convenors,
      })
      .subscribe({
        next: (updated) => {
          rule.name = updated.name;
          rule.operator = updated.operator;
          rule.send_log_to_convenors = updated.send_log_to_convenors;
          const set = this.selectedSet();
          if (set) {
            set.rules = this.rules;
          }
          this.refreshPreview(rule);
        },
        error: (error) => this.showError(error),
      });
  }

  beginEditRuleName(rule: CommunicationRule): void {
    this.editingRuleNameId = rule.id;
    this.ruleNameDraft = rule.name;
  }

  cancelEditRuleName(): void {
    this.editingRuleNameId = undefined;
    this.ruleNameDraft = '';
  }

  saveRuleName(rule: CommunicationRule): void {
    const name = this.ruleNameDraft.trim();
    if (!name) {
      return;
    }

    this.ruleService
      .updateForUnit(this.unit.id, rule.id, {
        name,
        operator: rule.operator,
        send_log_to_convenors: rule.send_log_to_convenors,
      })
      .subscribe({
        next: (updated) => {
          rule.name = updated.name;
          const set = this.selectedSet();
          if (set) {
            set.rules = this.rules;
          }
          this.cancelEditRuleName();
          this.rebuildTree();
        },
        error: (error) => this.showError(error),
      });
  }

  confirmExecuteRule(rule: CommunicationRule): void {
    this.confirmationModalService.show(
      'Execute Rule?',
      'This will execute only this rule. However, any earlier rules in the set are still taken into account first, so students who would already have been matched earlier are excluded before this rule is applied.',
      () => this.executeRule(rule),
      undefined,
      'Execute Rule',
    );
  }

  executeRule(rule: CommunicationRule): void {
    this.ruleService.executeForUnit(this.unit.id, rule.id).subscribe({
      next: (job) => this.showExecutionProgress(job, `Executing ${rule.name}`),
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
        this.editingConditionId[rule.id] = undefined;
        this.refreshPreview(rule);
      },
      error: (error) => this.showError(error),
    });
  }

  updateCondition(rule: CommunicationRule): void {
    const conditionId = this.editingConditionId[rule.id];
    if (!conditionId) {
      return;
    }

    const condition = this.newConditions[rule.id] || this.blankCondition();
    this.conditionService.update(this.unit.id, rule.id, conditionId, condition).subscribe({
      next: (updated) => {
        rule.conditions = rule.conditions.map((item) => (item.id === updated.id ? updated : item));
        this.newConditions[rule.id] = this.blankCondition();
        this.conditionFormOpen[rule.id] = false;
        this.editingConditionId[rule.id] = undefined;
        this.refreshPreview(rule);
      },
      error: (error) => this.showError(error),
    });
  }

  showConditionForm(rule: CommunicationRule): void {
    this.newConditions[rule.id] = this.blankCondition();
    this.conditionFormOpen[rule.id] = true;
    this.editingConditionId[rule.id] = undefined;
  }

  cancelCondition(rule: CommunicationRule): void {
    this.newConditions[rule.id] = this.blankCondition();
    this.conditionFormOpen[rule.id] = false;
    this.editingConditionId[rule.id] = undefined;
  }

  editCondition(rule: CommunicationRule, condition: CommunicationCondition): void {
    this.newConditions[rule.id] = {
      ...condition,
      task_statuses: condition.task_statuses ? [...condition.task_statuses] : [],
    };
    this.conditionFormOpen[rule.id] = true;
    this.editingConditionId[rule.id] = condition.id;
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
        this.editingActionId[rule.id] = undefined;
      },
      error: (error) => this.showError(error),
    });
  }

  updateAction(rule: CommunicationRule): void {
    const actionId = this.editingActionId[rule.id];
    if (!actionId) {
      return;
    }

    const action = this.newActions[rule.id] || this.blankAction();
    this.actionService.update(this.unit.id, rule.id, actionId, action).subscribe({
      next: (updated) => {
        rule.actions = rule.actions.map((item) => (item.id === updated.id ? updated : item));
        this.newActions[rule.id] = this.blankAction();
        this.actionFormOpen[rule.id] = false;
        this.editingActionId[rule.id] = undefined;
      },
      error: (error) => this.showError(error),
    });
  }

  showActionForm(rule: CommunicationRule, _mode: 'standard' | 'post_execution' = 'standard'): void {
    this.newActions[rule.id] = this.blankAction();
    this.actionFormOpen[rule.id] = true;
    this.editingActionId[rule.id] = undefined;
  }

  cancelAction(rule: CommunicationRule): void {
    this.newActions[rule.id] = this.blankAction();
    this.actionFormOpen[rule.id] = false;
    this.editingActionId[rule.id] = undefined;
  }

  editAction(rule: CommunicationRule, action: CommunicationAction): void {
    this.newActions[rule.id] = {...action};
    this.actionFormOpen[rule.id] = true;
    this.editingActionId[rule.id] = action.id;
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

  hasTreeChild = (_: number, node: CommunicationTreeNode): boolean => node.type === 'set';

  isSelectedSetNode(node: CommunicationTreeNode): boolean {
    return node.type === 'set' && node.id === this.selectedSetId;
  }

  isSelectedRuleNode(node: CommunicationTreeNode): boolean {
    return node.type === 'rule' && node.id === this.selectedRuleId;
  }

  toggleSetNode(node: CommunicationTreeNode, event?: Event): void {
    event?.stopPropagation();
    if (!node.set) {
      return;
    }

    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
      this.expandedSetIds.delete(node.set.id);
    } else {
      this.treeControl.expand(node);
      this.expandedSetIds.add(node.set.id);
    }
  }

  selectSetNode(set: CommunicationSet): void {
    this.selectedSetId = set.id;
    this.expandedSetIds.add(set.id);
    this.activateSet(set);
  }

  selectRuleNode(set: CommunicationSet, rule: CommunicationRule): void {
    const setChanged = this.selectedSetId !== set.id;
    this.selectedSetId = set.id;
    this.expandedSetIds.add(set.id);

    if (setChanged) {
      this.activateSet(set, rule.id);
      return;
    }

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
      case 'SpecConCondition':
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

  actionSummary(action: CommunicationAction): string {
    switch (action.type) {
      case 'ChangeTargetGradeAction':
        return `Change student's target grade to ${this.targetGradeName(action.target_grade)}`;
      case 'EmailStudentAction':
        return 'Send email to student';
      case 'EmailStaffAction':
        return `Send email to ${this.staffAudienceLabel(action)}`;
      case 'TaskCommentAction':
        return `Add comment to ${this.taskDefinitionLabel(action.task_definition_id)}`;
      default:
        return this.actionTypeLabel(action.type);
    }
  }

  targetGradeName(targetGrade: number | undefined): string {
    if (targetGrade === undefined || targetGrade === null) {
      return '';
    }

    return this.unit.gradeLabel(targetGrade) || `${targetGrade}`;
  }

  taskDefinitionLabel(taskDefinitionId: number | undefined): string {
    if (taskDefinitionId === undefined || taskDefinitionId === null) {
      return 'Task';
    }

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

  staffAudienceLabel(action: Partial<CommunicationAction>): string {
    const audiences: string[] = [];
    if (action.email_tutors) {
      audiences.push('tutors');
    }
    if (action.email_convenors) {
      audiences.push('convenors');
    }
    return audiences.join(' and ') || 'staff';
  }

  insertActionVariable(rule: CommunicationRule, field: 'subject' | 'body', token: string): void {
    const action = this.actionFor(rule);
    const currentValue = action[field] ?? '';
    const separator =
      currentValue && !currentValue.endsWith(' ') && !currentValue.endsWith('\n') ? ' ' : '';
    action[field] = `${currentValue}${separator}${token}`;
  }

  renderTemplatePreview(value: string | undefined, rule: CommunicationRule): string {
    if (!value) {
      return '';
    }

    const escaped = this.escapeHtml(value);
    const rendered = escaped.replace(/\{\{[\w.]+\}\}/g, (token) => {
      const replacement = this.resolveTemplateVariable(token, rule) || token;
      return `<span class="rounded bg-blue-50 px-1 text-blue-800">${this.escapeHtml(replacement)}</span>`;
    });

    return rendered.replace(/\n/g, '<br />');
  }

  refreshPreview(_rule: CommunicationRule): void {
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

    if (current.type === 'SpecConCondition') {
      this.newConditions[rule.id].spec_con_days = 0;
    }
  }

  onActionTypeChange(rule: CommunicationRule): void {
    const current = this.actionFor(rule);
    this.newActions[rule.id] = {
      type: current.type || 'EmailStudentAction',
      email_tutors: false,
      email_convenors: false,
    };

    if (current.type === 'TaskCommentAction') {
      this.newActions[rule.id].body = '';
      this.newActions[rule.id].task_definition_id = this.taskDefinitions[0]?.id;
    }
  }

  private loadSets(): void {
    if (!this.unit) {
      return;
    }

    this.loading = true;
    this.setService.getForUnit(this.unit.id).subscribe({
      next: (sets) => {
        this.sets = sets;
        if (this.selectedSetId) {
          this.expandedSetIds.add(this.selectedSetId);
        }
        this.rebuildTree();
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

    if (!this.unit) {
      return;
    }

    this.taskDefinitions = this.unit.taskDefinitionCache.currentValues;
    this.tutorials = this.unit.tutorials;
    this.tutorialStreams = this.unit.tutorialStreams;
    this.subscriptions.push(
      this.unit.taskDefinitionCache.values.subscribe((taskDefinitions) => {
        this.taskDefinitions = taskDefinitions;
      }),
    );
    this.subscriptions.push(
      // TODO: use spinner until students are loaded
      this.projectService.loadStudents(this.unit, false, true).subscribe({
        error: (error) => this.showError(error),
      }),
    );
  }

  private defaultRuleName(): string {
    return `Rule ${this.rules.length + 1}`;
  }

  private defaultSetName(): string {
    return `Set ${this.sets.length + 1}`;
  }

  private defaultScheduleName(set: CommunicationSet): string {
    return `Schedule ${(set.schedules?.length || 0) + 1}`;
  }

  private activateSet(set: CommunicationSet, selectedRuleId?: number): void {
    this.rules = set.rules ?? [];
    this.selectedRuleId = selectedRuleId ?? this.rules[0]?.id;
    this.loadPreviewForSet(set);
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

  private blankSchedule(set: CommunicationSet): CommunicationSetSchedule {
    return new CommunicationSetSchedule({
      client_key: this.newScheduleClientKey(),
      communication_set_id: set.id,
      name: this.defaultScheduleName(set),
      active: true,
      anchor_week: 1,
      anchor_day: 'Monday',
      recurrence: 'none',
      interval: 1,
      timezone: 'UTC',
      hour: 8,
      minute: 0,
      ice_cube_schedule: {
        timezone: 'UTC',
        recurrence: 'none',
        rules: [{type: 'one_off'}],
      },
    });
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
    const existingSet = this.sets.find((set) => set.id === setResponse.id);
    const schedules =
      setResponse.schedules !== undefined
        ? (setResponse.schedules || []).map((schedule) => new CommunicationSetSchedule(schedule))
        : existingSet?.schedules || [];
    const updatedSet = new CommunicationSet({
      id: setResponse.id,
      unit_id: setResponse.unit_id,
      name: setResponse.name,
      active: setResponse.active,
      schedules,
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

    this.rebuildTree();
  }

  private studentsForPreviewRule(
    ruleId: number,
    preview: CommunicationRulePreviewResponse,
  ): CommunicationRulePreviewStudent[] {
    return preview.allocations.find((allocation) => allocation.rule_id === ruleId)?.students || [];
  }

  private availableStudentsForRule(rule: CommunicationRule): number {
    const totalStudents = this.unit?.students?.length ?? 0;
    if (!this.previewLoaded[rule.id]) {
      return totalStudents;
    }

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

  private openScheduleModal(set: CommunicationSet, schedule?: CommunicationSetSchedule): void {
    const dialogRef = this.dialog.open(CommunicationScheduleModalComponent, {
      width: '960px',
      maxWidth: '96vw',
      data: {
        schedule: schedule
          ? new CommunicationSetSchedule({
              ...schedule,
            })
          : this.blankSchedule(set),
        unit: this.unit,
      } satisfies CommunicationScheduleModalData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const hydrated = new CommunicationSetSchedule({
        ...result,
        client_key: schedule?.client_key || result.client_key || this.newScheduleClientKey(),
        communication_set_id: set.id,
      });

      const schedules = [...(set.schedules || [])];
      const existingIndex = schedules.findIndex(
        (item) => (item.id || item.client_key) === (schedule?.id || schedule?.client_key),
      );

      if (existingIndex >= 0) {
        schedules[existingIndex] = hydrated;
      } else {
        schedules.push(hydrated);
      }

      this.persistSchedules(set, schedules, 'Schedule saved');
    });
  }

  private persistSchedules(
    set: CommunicationSet,
    schedules: CommunicationSetSchedule[],
    successMessage: string,
  ): void {
    this.setService
      .updateForUnit(this.unit.id, set.id, {
        name: set.name,
        active: set.active,
        schedules: schedules.map((schedule) => ({
          id: schedule.id,
          name: schedule.name,
          active: schedule.active,
          anchor_week: schedule.anchor_week,
          anchor_day: schedule.anchor_day,
          hour: schedule.hour,
          minute: schedule.minute,
          timezone: schedule.timezone,
          recurrence: schedule.recurrence,
          interval: schedule.interval,
          repeat_count: schedule.repeat_count,
          until_at: schedule.until_at,
        })),
      })
      .subscribe({
        next: (updatedSet) => {
          set.schedules = updatedSet.schedules || [];
          const setIndex = this.sets.findIndex((item) => item.id === set.id);
          if (setIndex >= 0) {
            this.sets[setIndex].schedules = updatedSet.schedules || [];
          }
          this.alerts.success(successMessage);
        },
        error: (error) => this.showError(error),
      });
  }

  private showError(error): void {
    this.alerts.error(error?.message || error?.error || error || 'Communication update failed');
  }

  private showExecutionProgress(job: SidekiqJob, title: string): void {
    if (!job?.id) {
      this.alerts.error('Failed to start communication execution', 6000);
      return;
    }

    this.sidekiqProgressModalService.show(title, job.id).subscribe({
      error: (error) => this.showError(error),
    });
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
      spec_con_days: 'Special Consideration Days',
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
      return this.unit.gradeAbbreviation(value) || value.toString();
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
      case '{{affected_students_count}}':
        return this.studentsFor(rule).length.toString();
      case '{{unit.code}}':
        return this.unit?.code;
      case '{{unit.name}}':
        return this.unit?.name;
      case '{{rule.name}}':
        return rule.name;
      case '{{target_grade}}':
        return student?.target_grade !== undefined && student?.target_grade !== null
          ? this.targetGradeName(student.target_grade)
          : undefined;
      case '{{conditions_summary}}':
        return this.conditionsSummary(rule);
      case '{{actions_summary}}':
        return this.actionsSummary(rule);
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

  conditionsSummary(rule: CommunicationRule): string {
    return (rule.conditions || [])
      .map((condition) =>
        `- ${this.conditionTypeLabel(condition.type)}: ${this.labelFor(condition)}`.trim(),
      )
      .join('\n');
  }

  actionsSummary(rule: CommunicationRule): string {
    return (rule.actions || []).map((action) => `- ${this.actionSummary(action)}`).join('\n');
  }

  private titleize(value: string): string {
    return value
      ?.split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private scheduleCadence(schedule: CommunicationSetSchedule): string {
    switch (schedule.recurrence) {
      case 'daily':
        return `Daily every ${schedule.interval || 1} day(s)`;
      case 'weekly':
        return `Weekly every ${schedule.interval || 1} week(s) from ${schedule.anchor_day || 'Monday'}`;
      case 'monthly':
        return `Monthly every ${schedule.interval || 1} month(s) from Week ${schedule.anchor_week || 1} ${schedule.anchor_day || 'Monday'}`;
      default:
        return 'One-off run';
    }
  }

  private scheduleEnding(schedule: CommunicationSetSchedule): string {
    if (schedule.repeat_count) {
      return `Stops after ${schedule.repeat_count} run(s)`;
    }

    if (schedule.until_at) {
      return `Stops at ${this.dateLabel(schedule.until_at)}`;
    }

    return 'No expiry';
  }

  private formatTime(hour = 0, minute = 0): string {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  private newScheduleClientKey(): string {
    return `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private rebuildTree(): void {
    const treeData = this.sets.map((set) => ({
      type: 'set' as const,
      id: set.id,
      label: set.name,
      set,
      children: (set.rules ?? []).map((rule) => ({
        type: 'rule' as const,
        id: rule.id,
        label: rule.name,
        set,
        rule,
      })),
    }));

    this.treeDataSource.data = treeData;
    treeData.forEach((node) => {
      if (this.expandedSetIds.has(node.id) || node.id === this.selectedSetId) {
        this.treeControl.expand(node);
      }
    });
  }
}
