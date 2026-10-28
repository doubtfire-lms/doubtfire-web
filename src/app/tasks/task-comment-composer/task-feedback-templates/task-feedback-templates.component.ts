import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {BehaviorSubject, Observable, combineLatest, map} from 'rxjs';
import {
  FeedbackTemplate,
  FeedbackTemplateService,
  LearningOutcome,
  LearningOutcomeService,
  Task,
  TaskService,
} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'f-task-feedback-templates',
  styleUrl: './task-feedback-templates.component.scss',
  templateUrl: './task-feedback-templates.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskFeedbackTemplatesComponent implements OnInit, OnChanges {
  @Input() task: Task;
  @Output() templateSelected: EventEmitter<FeedbackTemplate> = new EventEmitter();

  categories = ['TLO', 'ULO', 'GLO'];
  selectedTemplates: FeedbackTemplate[] = [];
  hoveredTemplate: FeedbackTemplate;

  private generalTemplatesSubject: BehaviorSubject<FeedbackTemplate[]> = new BehaviorSubject([]);
  generalTemplates$ = this.generalTemplatesSubject.asObservable();

  private navigationStackSubject: BehaviorSubject<Map<number, number[]>> = new BehaviorSubject(
    new Map<number, number[]>(),
  );
  navigationStack$ = this.navigationStackSubject.asObservable();

  private searchTermSubject: BehaviorSubject<string> = new BehaviorSubject('');
  searchTerm$ = this.searchTermSubject.asObservable();

  public genTemplates$ = combineLatest([this.generalTemplates$, this.searchTerm$]).pipe(
    map(([templates, searchTerm]) =>
      templates.filter((template) =>
        template.chipText.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    ),
  );
  public tlos$: Observable<{outcome: LearningOutcome; templates: FeedbackTemplate[]}[]>;
  public ulos$: Observable<{outcome: LearningOutcome; templates: FeedbackTemplate[]}[]>;
  public glos$ = combineLatest([
    this.learningOutcomeService.cache.values,
    this.feedbackTemplateService.cache.values,
    this.navigationStack$,
    this.searchTerm$,
  ]).pipe(
    map(([outcomes, templates, navigationStack, searchTerm]) =>
      outcomes
        .filter((outcome) => outcome.contextType === null)
        .map((outcome) => ({
          outcome: outcome,
          templates: this.getTemplatesToDisplay(outcome.id, templates, navigationStack, searchTerm),
        }))
        .filter((glo) => glo.templates.length > 0),
    ),
  );

  constructor(
    private learningOutcomeService: LearningOutcomeService,
    private feedbackTemplateService: FeedbackTemplateService,
    public taskService: TaskService,
  ) {}

  ngOnInit(): void {
    const greetingTemplate = new FeedbackTemplate();
    greetingTemplate.type = 'template';
    greetingTemplate.chipText = 'Greeting';
    greetingTemplate.description = "Insert a greeting with the student's name.";

    const summaryTemplate = new FeedbackTemplate();
    summaryTemplate.type = 'template';
    summaryTemplate.chipText = 'Summarise feedback';
    summaryTemplate.description = 'Summarise the given feedback.';

    this.generalTemplatesSubject.next([greetingTemplate, summaryTemplate]);
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.selectedTemplates = [];
    this.navigationStackSubject.next(new Map<number, number[]>());
    this.searchTermSubject.next('');

    if (this.task && this.task.definition) {
      this.tlos$ = combineLatest([
        this.task.definition.learningOutcomesCache.values,
        this.feedbackTemplateService.cache.values,
        this.navigationStack$,
        this.searchTerm$,
      ]).pipe(
        map(([outcomes, templates, navigationStack, searchTerm]) =>
          outcomes
            .map((outcome) => ({
              outcome: outcome,
              templates: this.getTemplatesToDisplay(
                outcome.id,
                templates,
                navigationStack,
                searchTerm,
              ),
            }))
            .filter((tlo) => tlo.templates.length > 0),
        ),
      );
    }

    if (this.task.unit) {
      this.ulos$ = combineLatest([
        this.task.unit.learningOutcomesCache.values,
        this.feedbackTemplateService.cache.values,
        this.navigationStack$,
        this.searchTerm$,
      ]).pipe(
        map(([outcomes, templates, navigationStack, searchTerm]) =>
          outcomes
            .map((outcome) => ({
              outcome: outcome,
              templates: this.getTemplatesToDisplay(
                outcome.id,
                templates,
                navigationStack,
                searchTerm,
              ),
            }))
            .filter((ulo) => ulo.templates.length > 0),
        ),
      );
    }
  }

  private getTemplatesToDisplay(
    outcomeId: number,
    templates: FeedbackTemplate[],
    navigationStack: Map<number, number[]>,
    searchTerm: string,
  ): FeedbackTemplate[] {
    const allTemplates = templates.filter((template) => template.learningOutcomeId === outcomeId);
    let templatesToDisplay: FeedbackTemplate[] = [];

    if (navigationStack.get(outcomeId) && navigationStack.get(outcomeId).length > 0) {
      const outcomeStack = navigationStack.get(outcomeId);
      const groupId = outcomeStack[outcomeStack.length - 1];

      templatesToDisplay.push(allTemplates.find((template) => template.id === groupId));
      allTemplates.forEach((template) => {
        if (template.parentChipId === groupId) {
          templatesToDisplay.push(template);
        }
      });
    } else {
      templatesToDisplay = allTemplates.filter((template) => !template.parentChipId);
    }

    templatesToDisplay = templatesToDisplay.filter((template) =>
      template.chipText.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return templatesToDisplay;
  }

  onSearchTermChange(searchTerm: string): void {
    this.searchTermSubject.next(searchTerm);
  }

  @ViewChild('tloSection') tloSection!: ElementRef;
  @ViewChild('uloSection') uloSection!: ElementRef;
  @ViewChild('gloSection') gloSection!: ElementRef;

  scrollToSection(event: MatTabChangeEvent) {
    const sections = [this.tloSection, this.uloSection, this.gloSection];
    const selectedSection = sections[event.index];

    if (selectedSection) {
      selectedSection.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  }

  selectTemplate(template: FeedbackTemplate) {
    if (template.type === 'template') {
      if (template.chipText === 'Greeting') {
        template.commentText = `Hi ${this.task.project.student.preferredName}. `;
      } else if (template.chipText === 'Summarise feedback') {
        if (!this.selectedTemplates || this.selectedTemplates.length < 1) {
          return;
        }
        template.commentText = 'Summary of the given feedback:';
        this.selectedTemplates.forEach((t) => {
          if (!t.summaryText) {
            return;
          }
          template.commentText += '\n- ' + t.summaryText;
        });
      } else {
        this.selectedTemplates.push(template);
        this.suggestTaskStatus(template);
      }
      this.templateSelected.emit(template);
    } else {
      const updatedStack = new Map(this.navigationStackSubject.getValue());
      const outcomeStack = updatedStack.get(template.learningOutcomeId) || [];
      const index = outcomeStack.indexOf(template.id);
      if (index === -1) {
        outcomeStack.push(template.id);
      } else {
        outcomeStack.splice(index, 1);
      }
      updatedStack.set(template.learningOutcomeId, outcomeStack);
      this.navigationStackSubject.next(updatedStack);
    }
  }

  isTemplateSelected(template: FeedbackTemplate): boolean {
    return this.selectedTemplates.includes(template);
  }

  isGroupExpanded(template: FeedbackTemplate): boolean {
    const stack = this.navigationStackSubject.getValue();
    const outcomeStack = stack.get(template.learningOutcomeId) || [];
    const index = outcomeStack.indexOf(template.id);
    if (index === -1) {
      return false;
    } else {
      return true;
    }
  }

  onHoverTemplate(template: FeedbackTemplate) {
    this.hoveredTemplate = template;
  }

  private suggestTaskStatus(template: FeedbackTemplate) {
    if (template.taskStatus && this.task.suggestedTaskStatus) {
      const currentSeq = this.taskService.statusSeq.get(this.task.suggestedTaskStatus);
      const templateSeq = this.taskService.statusSeq.get(template.taskStatus);
      if (templateSeq < currentSeq) {
        this.task.suggestedTaskStatus = template.taskStatus;
      }
    } else {
      this.task.suggestedTaskStatus = template.taskStatus;
    }
  }
}
