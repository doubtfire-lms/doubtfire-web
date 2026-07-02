import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {Subscription} from 'rxjs';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

type TaskDefinitionSectionId =
  | 'task-details'
  | 'task-learning-outcomes'
  | 'inbox'
  | 'due-dates'
  | 'upload-requirements'
  | 'task-resources'
  | 'prerequisite-tasks'
  | 'discussion-prompts'
  | 'task-assessment-automation'
  | 'scorm-test'
  | 'optional-settings';

interface TaskDefinitionSection {
  id: TaskDefinitionSectionId;
  label: string;
}

@Component({
  selector: 'f-task-definition-editor',
  templateUrl: 'task-definition-editor.component.html',
  styleUrls: ['task-definition-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskDefinitionEditorComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() taskDefinition: TaskDefinition;
  @Input() unit: Unit;
  @ViewChild('sectionScrollContainer') sectionScrollContainer: ElementRef<HTMLElement>;
  @ViewChildren('sectionElement') sectionElements: QueryList<ElementRef<HTMLElement>>;

  public overseerEnabled: boolean = false;
  public activeSectionId: TaskDefinitionSectionId = 'task-details';
  public readonly sectionList: TaskDefinitionSection[] = [
    {id: 'task-details', label: 'Task Details'},
    {id: 'task-learning-outcomes', label: 'Task Learning Outcomes'},
    {id: 'inbox', label: 'Inbox'},
    {id: 'due-dates', label: 'Due Dates'},
    {id: 'upload-requirements', label: 'Upload Requirements'},
    {id: 'task-resources', label: 'Task Resources'},
    {id: 'prerequisite-tasks', label: 'Prerequisite Tasks'},
    {id: 'discussion-prompts', label: 'Discussion Prompts'},
    {id: 'task-assessment-automation', label: 'Task Assessment Automation'},
    {id: 'scorm-test', label: 'SCORM Test'},
    {id: 'optional-settings', label: 'Optional Settings'},
  ];

  private sectionElementMap: Map<TaskDefinitionSectionId, HTMLElement> = new Map();
  private sectionChangesSubscription?: Subscription;
  private overseerEnabledSubscription?: Subscription;
  private readonly scrollTopOffsetPx: number = 112;

  constructor(
    private taskDefinitionService: TaskDefinitionService,
    private alerts: AlertService,
    private constants: DoubtfireConstants,
  ) {}

  public ngOnInit() {
    this.overseerEnabledSubscription = this.constants.IsOverseerEnabled.subscribe((enabled) => {
      this.overseerEnabled = enabled && this.unit.overseerEnabled;
      this.ensureActiveSectionIsVisible();
      this.rebuildSectionElementMap();
    });
  }

  public ngAfterViewInit() {
    this.rebuildSectionElementMap();
    this.sectionChangesSubscription = this.sectionElements.changes.subscribe(() => {
      this.rebuildSectionElementMap();
      this.syncActiveSectionOnScroll();
    });
    queueMicrotask(() => this.syncActiveSectionOnScroll());
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.taskDefinition && !changes.taskDefinition.firstChange) {
      this.ensureActiveSectionIsVisible();
      queueMicrotask(() => this.syncActiveSectionOnScroll());
    }
  }

  public ngOnDestroy() {
    this.sectionChangesSubscription?.unsubscribe();
    this.overseerEnabledSubscription?.unsubscribe();
  }

  public get visibleSections(): TaskDefinitionSection[] {
    return this.overseerEnabled
      ? this.sectionList
      : this.sectionList.filter((section) => section.id !== 'task-assessment-automation');
  }

  public scrollToSection(sectionId: TaskDefinitionSectionId) {
    this.activeSectionId = sectionId;

    const container = this.sectionScrollContainer?.nativeElement;
    const target = this.sectionElementMap.get(sectionId);

    if (!container || !target) {
      return;
    }

    if (this.isContainerScrollable(container)) {
      const targetTop = this.getSectionTopInContainer(container, target);
      container.scrollTo({
        top: Math.max(targetTop - 8, 0),
        behavior: 'smooth',
      });
      return;
    }

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  public syncActiveSectionOnScroll() {
    const container = this.sectionScrollContainer?.nativeElement;
    if (!container) {
      return;
    }

    if (!this.isContainerScrollable(container)) {
      this.syncActiveSectionOnWindowScroll();
      return;
    }

    const scrollPosition = container.scrollTop + 48;
    let nextActiveSection = this.visibleSections[0]?.id;

    this.visibleSections.forEach((section) => {
      const sectionElement = this.sectionElementMap.get(section.id);
      if (
        sectionElement &&
        this.getSectionTopInContainer(container, sectionElement) <= scrollPosition
      ) {
        nextActiveSection = section.id;
      }
    });

    if (nextActiveSection) {
      this.activeSectionId = nextActiveSection;
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  public onWindowScroll() {
    this.syncActiveSectionOnScroll();
  }

  public save() {
    this.taskDefinition.save().subscribe({
      next: (response) => {
        this.alerts.success('Task Saved');
        response.setOriginalSaveData(this.taskDefinitionService.mapping);
      },
      error: (message) => this.alerts.error(message),
    });
  }

  private ensureActiveSectionIsVisible() {
    if (!this.visibleSections.some((section) => section.id === this.activeSectionId)) {
      this.activeSectionId = this.visibleSections[0]?.id ?? 'task-details';
    }
  }

  private rebuildSectionElementMap() {
    this.sectionElementMap.clear();

    this.sectionElements?.forEach((sectionElementRef) => {
      const nativeElement = sectionElementRef.nativeElement;
      const sectionId = nativeElement.getAttribute('data-section-id') as TaskDefinitionSectionId;

      if (sectionId) {
        this.sectionElementMap.set(sectionId, nativeElement);
      }
    });
  }

  private getSectionTopInContainer(container: HTMLElement, sectionElement: HTMLElement): number {
    const containerRect = container.getBoundingClientRect();
    const sectionRect = sectionElement.getBoundingClientRect();
    return container.scrollTop + (sectionRect.top - containerRect.top);
  }

  private syncActiveSectionOnWindowScroll() {
    const threshold = this.scrollTopOffsetPx + 12;
    let nextActiveSection = this.visibleSections[0]?.id;

    this.visibleSections.forEach((section) => {
      const sectionElement = this.sectionElementMap.get(section.id);
      if (sectionElement && sectionElement.getBoundingClientRect().top <= threshold) {
        nextActiveSection = section.id;
      }
    });

    if (nextActiveSection) {
      this.activeSectionId = nextActiveSection;
    }
  }

  private isContainerScrollable(container: HTMLElement): boolean {
    return container.scrollHeight > container.clientHeight + 1;
  }
}
