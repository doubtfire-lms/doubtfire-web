import {ChangeDetectionStrategy, Component, Injector, Input} from '@angular/core';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';
import {GradeService} from 'src/app/common/services/grade.service';

@Component({
  selector: 'f-portfolio-learning-summary-report-step',
  templateUrl: 'portfolio-learning-summary-report-step.component.html',
  styleUrls: ['portfolio-learning-summary-report-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PortfolioLearningSummaryReportStepComponent {
  @Input() unit: Unit;
  @Input() project: Project;
  @Input() onAdvanceActiveTab?: (index: 1 | -1) => void;

  public learningSummaryReportFileUploadData = {
    type: {
      file0: {name: 'Learning Summary Report', type: 'document'},
    },
    payload: {
      name: 'LearningSummaryReport', // DO NOT MODIFY - case sensitive on API
      kind: 'document',
    },
  };

  public forceLSRSubmit: boolean = false;
  public acceptUploadNewLearningSummary: boolean = false;

  constructor(
    private injector: Injector,
    private gradeService: GradeService,
  ) {}

  public get projectHasDraftLearningSummaryReport() {
    return (
      this.project?.usesDraftLearningSummary ||
      this.project?.portfolioFiles.find((f) => f.idx === 0)
    );
  }

  public get targetGradeLabel(): string {
    return this.gradeService.gradeLabel(this.project.targetGrade, this.unit);
  }

  advanceActiveTab(index: 1 | -1) {
    if (this.onAdvanceActiveTab) {
      this.onAdvanceActiveTab(index);
      return;
    }
  }

  addNewFile(newFile: {kind: string; name: string; idx: number}) {
    this.project.portfolioFiles.push(newFile);
    this.acceptUploadNewLearningSummary = false;
    this.forceLSRSubmit = false;
  }

  draftTaskDefinitionWasUsed(): boolean {
    const draftTaskDef = this.unit.draftTaskDefinition;
    if (draftTaskDef) {
      const task = this.project.findTaskForDefinition(draftTaskDef.id);
      if (task && task.inSubmittedState()) {
        return true;
      }
    }
    return false;
  }

  // downloadLearningSummaryReport(){}
}
