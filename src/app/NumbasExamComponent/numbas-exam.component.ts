import { Component, OnDestroy, OnInit } from '@angular/core';
import { ScormService } from 'pipwerks-scorm-api-wrapper';
import { NumbasExamService } from '../api/services/numbas-exam.service';
import { CompletedTestService } from '../api/services/completed-test.service';

declare const Numbas: any;
@Component({
  selector: 'f-numbas-exam',
  template: ` <div id="numbas-exam-container"></div> `,
})
export class NumbasExamComponent implements OnInit, OnDestroy {
  scorm: ScormService;
  exam: any;

  constructor(private numbasExamService: NumbasExamService, private completedTestService: CompletedTestService) {}

  ngOnInit() {
    this.scorm = new ScormService();
    const result = this.scorm.initialize();
    if (result) {
      this.loadExam();
    }
  }

  ngOnDestroy() {
    this.scorm.quit();
  }

  private loadExam() {
    this.numbasExamService.getNumbasExamData().subscribe(
      (examData) => {
        Numbas.load(examData, (exam) => {
          this.exam = exam;
          exam.display({
            displayType: 'web',
            displayPaper: true,
            allowRegen: true,
            showActualMark: true,
            reviewShowScore: true,
            navigation: 'both',
            allowPrint: true,
            review: true,
            onComplete: () => {
              this.saveCompletedTest();
            },
          });
        });
      },
      (error) => {
        console.error('Error loading exam data:', error);
      }
    );
  }

  private saveCompletedTest() {
    const completedTestData = {
      // Construct the completed test data object to be sent to the server
      // based on the exam data and user's input
    };
    this.completedTestService.saveCompletedTest(completedTestData).subscribe(
      (response) => {
        console.log('Completed test data saved successfully:', response);
      },
      (error) => {
        console.error('Error saving completed test data:', error);
      }
    );
  }
}
