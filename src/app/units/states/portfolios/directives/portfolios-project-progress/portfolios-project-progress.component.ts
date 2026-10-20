import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';
import {ProjectService} from 'src/app/api/services/project.service';
import {TaskService} from 'src/app/api/services/task.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';

@Component({
  selector: 'f-portfolios-project-progress',
  templateUrl: './portfolios-project-progress.component.html',
  styleUrl: './portfolios-project-progress.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PortfoliosProjectProgressComponent implements OnChanges {
  @Input() project: Project;
  @Input() unit: Unit;
  @Input() taskSelectionUrlBase: unknown[] | null = null;
  @Input() showSubmittedGrade?: boolean = false;

  @Input()
  public project$: BehaviorSubject<Project> = new BehaviorSubject(null);

  public taskStats: {numberOfTasksCompleted: number; numberOfTasksRemaining: number} = {
    numberOfTasksCompleted: 0,
    numberOfTasksRemaining: 0,
  };

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private gradeService: GradeService,
    private projectService: ProjectService,
    private alertService: AlertService,
    private taskService: TaskService,
  ) {}

  @HostListener('wheel', ['$event'])
  public prioritisePageScroll(event: WheelEvent): void {
    if (event.deltaY === 0 || !(event.target instanceof HTMLElement)) {
      return;
    }

    const projectDashboard = event.target.closest('f-project-dashboard');
    if (!projectDashboard || !this.elementRef.nativeElement.contains(projectDashboard)) {
      return;
    }

    if (event.target.closest('f-unit-task-list')) {
      return;
    }

    const innerScrollContainer = this.findInnerScrollContainer(event.target, projectDashboard);
    if (
      event.deltaY < 0 &&
      innerScrollContainer &&
      this.canScroll(innerScrollContainer, event.deltaY)
    ) {
      return;
    }

    const scrollContainer = this.findOuterScrollContainer(projectDashboard);
    if (!scrollContainer || !this.canScroll(scrollContainer, event.deltaY)) {
      return;
    }

    event.preventDefault();
    scrollContainer.scrollBy({top: event.deltaY});
  }

  ngOnChanges(): void {
    if (this.project) {
      this.project$.next(this.project);
    }
  }

  public get gradeValues() {
    return this.gradeService.gradeValuesFor(this.unit);
  }
  public get grades() {
    return Object.fromEntries(
      this.unit.gradeDefinitions.map((definition) => [definition.value, definition.label]),
    );
  }

  public gradeWord(grade) {
    return this.gradeService.gradeLabel(grade, this.unit);
  }

  updateTaskCompletionStats() {
    this.taskStats.numberOfTasksCompleted = this.project.tasksByStatus(
      this.taskService.completeStatus,
    ).length;
    this.taskStats.numberOfTasksRemaining =
      this.project.activeTasks().length - this.taskStats.numberOfTasksCompleted;
  }

  updateSubmittedGrade(newGrade: number): void {
    const previousSubmittedGrade = this.project.submittedGrade;
    this.project.submittedGrade = newGrade;

    this.projectService.update(this.project).subscribe({
      next: (project) => {
        project.refreshBurndownChartData?.();
        this.alertService.success(`Updated project's submitted grade`);
        this.updateTaskCompletionStats();
      },
      error: (error) => {
        this.project.submittedGrade = previousSubmittedGrade;
        this.alertService.error(`Failed to update submitted grade: ${error}`);
      },
    });
  }

  updatedTargetGrade(newGrade: number): void {
    const previousTargetGrade = this.project.targetGrade;
    this.project.targetGrade = newGrade;

    this.projectService.update(this.project).subscribe({
      next: (project) => {
        project.refreshBurndownChartData?.();
        this.alertService.success(`Updated project's target grade`);
        this.updateTaskCompletionStats();
      },
      error: (error) => {
        this.project.targetGrade = previousTargetGrade;
        this.alertService.error(`Failed to update target grade: ${error}`);
      },
    });
  }

  private findInnerScrollContainer(target: HTMLElement, root: Element): HTMLElement | null {
    let element: HTMLElement | null = target;

    while (element && element !== root) {
      if (this.isScrollable(element)) {
        return element;
      }

      element = element.parentElement;
    }

    return null;
  }

  private findOuterScrollContainer(projectDashboard: Element): HTMLElement {
    let parent = projectDashboard.parentElement;

    while (parent) {
      if (this.isScrollable(parent)) {
        return parent;
      }

      parent = parent.parentElement;
    }

    return document.scrollingElement as HTMLElement;
  }

  private isScrollable(element: HTMLElement): boolean {
    if (element.scrollHeight <= element.clientHeight) {
      return false;
    }

    const overflowY = getComputedStyle(element).overflowY;
    return overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
  }

  private canScroll(element: HTMLElement, deltaY: number): boolean {
    if (deltaY > 0) {
      return element.scrollTop + element.clientHeight < element.scrollHeight;
    }

    return element.scrollTop > 0;
  }
}
