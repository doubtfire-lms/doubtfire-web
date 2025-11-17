import {Component, OnInit, Injector, Input} from '@angular/core';
import {Unit} from 'src/app/api/models/unit';
import {Project} from 'src/app/api/models/project';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'f-portfolio-learning-summary-report-step',
  templateUrl: 'portfolio-learning-summary-report-step.component.html',
  styleUrls: ['portfolio-learning-summary-report-step.component.scss'],
})
export class PortfolioLearningSummaryReportStepComponent implements OnInit {
  @Input() unit: Unit;
  @Input() project: Project;

  public externalName: string = 'OnTrack';

  public learningSummaryReportFileUploadData = {
    type: {
      file0: {name: 'Learning Summary Report', type: 'document'},
    },
    payload: {
      name: 'LearningSummaryReport', // DO NOT MODIFY - case senstitive on API
      kind: 'document',
    },
  };

  public forceLSRSubmit: boolean = false;
  public acceptUploadNewLearningSummary: boolean = false;

  constructor(
    private constants: DoubtfireConstants,
    private injector: Injector,
  ) {}

  public get projectHasDraftLearningSummaryReport() {
    return (
      this.project?.usesDraftLearningSummary ||
      this.project?.portfolioFiles.find((f) => f.idx === 0)
    );
  }

  ngOnInit(): void {
    this.constants.ExternalName.subscribe((name) => {
      this.externalName = name;
    });

    console.log(`unit: `, this.unit);
    console.log(`project: `, this.project);
  }

  goNextStep() {
    // TODO: remove this once parent component is migrated
    this.injector.get('$scope').advanceActiveTab(1);
  }

  goBackStep() {
    // TODO: remove this once parent component is migrated
    this.injector.get('$scope').advanceActiveTab(-1);
  }

  addNewFile(newFile) {
    console.log('yoo', newFile);
    console.log(this);
    console.log(this.project);
    this.project.portfolioFiles.push(newFile);
    // this.injector.get('$scope').addNewFilesToPortfolio(newFile);
    this.acceptUploadNewLearningSummary = false;
    this.forceLSRSubmit = false;
  }

  // downloadLearningSummaryReport(){

  // }
}
