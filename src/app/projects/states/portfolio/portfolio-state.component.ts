import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription, of} from 'rxjs';
import {Project} from 'src/app/api/models/project';
import {GlobalStateService} from '../index/global-state.service';

interface PortfolioStepTab {
  title: string;
  seq: number;
  active?: boolean;
}

@Component({
  selector: 'f-portfolio-state',
  templateUrl: './portfolio-state.component.html',
  styleUrls: ['./portfolio-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PortfolioStateComponent implements OnInit, OnDestroy {
  @Input() public project$: Observable<Project>;

  public project: Project;

  public readonly tabs: {
    welcomeStep: PortfolioStepTab;
    gradeStep: PortfolioStepTab;
    summaryStep: PortfolioStepTab;
    otherFilesStep: PortfolioStepTab;
    reviewStep: PortfolioStepTab;
  } = {
    welcomeStep: {
      title: 'Portfolio Preparation',
      seq: 1,
    },
    gradeStep: {
      title: 'Select Grade',
      seq: 2,
    },
    summaryStep: {
      title: 'Learning Summary Report',
      seq: 3,
    },
    otherFilesStep: {
      title: 'Upload Other Files',
      seq: 4,
    },
    reviewStep: {
      title: 'Review Portfolio',
      seq: 5,
    },
  };

  public readonly orderedTabs = Object.values(this.tabs).sort((a, b) => a.seq - b.seq);
  public activeTab: PortfolioStepTab = this.tabs.welcomeStep;

  private projectSub?: Subscription;

  constructor(
    private globalStateService: GlobalStateService,
    private route: ActivatedRoute,
  ) {}

  public get selectedTabIndex(): number {
    return Math.max(0, (this.activeTab?.seq ?? 1) - 1);
  }

  public get hasSubmittedGrade(): boolean {
    return this.project?.submittedGrade !== null && this.project?.submittedGrade !== undefined;
  }

  public get hasLearningSummaryReport(): boolean {
    return (
      Boolean(this.project?.usesDraftLearningSummary) ||
      (this.project?.portfolioFiles ?? []).some((file) => file.idx === 0)
    );
  }

  ngOnInit(): void {
    this.project$ = this.project$ ?? of(this.route.parent?.snapshot.data.project as Project);

    this.projectSub = this.project$?.subscribe((project) => {
      if (!project) {
        return;
      }

      this.project = project;
      this.setInitialActiveTab();
    });
  }

  ngOnDestroy(): void {
    this.projectSub?.unsubscribe();
  }

  public onSelectedTabIndexChange(index: number): void {
    const targetTab = this.orderedTabs[index];
    if (!targetTab || this.isTabDisabled(targetTab)) {
      return;
    }

    this.setActiveTab(targetTab);
  }

  public isTabDisabled(tab: PortfolioStepTab): boolean {
    if (!tab || !this.project) {
      return true;
    }

    // Keep the current tab selectable even when other steps are locked.
    if (tab.seq === this.activeTab?.seq) {
      return false;
    }

    // Portfolio is compiling or ready; review step only.
    if (this.project.portfolioAvailable || this.project.compilePortfolio) {
      return tab.seq !== this.tabs.reviewStep.seq;
    }

    // No submitted grade: allow steps 1-2.
    if (!this.hasSubmittedGrade) {
      return tab.seq > this.tabs.gradeStep.seq;
    }

    // No learning summary report: allow steps 1-3.
    if (!this.hasLearningSummaryReport) {
      return tab.seq > this.tabs.summaryStep.seq;
    }

    // Once grade + learning summary requirements are met, allow review before compilation.
    return false;
  }

  public setActiveTab(tab: PortfolioStepTab): void {
    if (!tab) {
      return;
    }

    if (this.activeTab === tab) {
      return;
    }

    this.activeTab = tab;
    this.orderedTabs.forEach((currentTab) => {
      currentTab.active = currentTab === tab;
    });
  }

  public advanceActiveTab(advanceBy: 1 | -1): void {
    const newSeq = (this.activeTab?.seq ?? 1) + advanceBy;
    const nextTab = this.orderedTabs.find((tab) => tab.seq === newSeq);

    if (nextTab) {
      this.setActiveTab(nextTab);
    }
  }

  private projectHasLearningSummaryReportFile(): boolean {
    return (this.project?.portfolioFiles ?? []).some((file) => file.idx === 0);
  }

  private setInitialActiveTab(): void {
    if (this.project.portfolioAvailable || this.project.compilePortfolio) {
      this.setActiveTab(this.tabs.reviewStep);
    } else if (!this.hasSubmittedGrade) {
      this.setActiveTab(this.tabs.welcomeStep);
    } else if (this.project.usesDraftLearningSummary) {
      this.setActiveTab(this.tabs.summaryStep);
    } else if (this.projectHasLearningSummaryReportFile()) {
      this.setActiveTab(this.tabs.otherFilesStep);
    } else {
      this.setActiveTab(this.tabs.welcomeStep);
    }
  }
}
