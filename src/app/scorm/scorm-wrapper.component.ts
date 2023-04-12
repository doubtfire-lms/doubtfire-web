import { Component, OnDestroy, OnInit } from '@angular/core';
import { ScormService } from 'pipwerks-scorm-api-wrapper';
import { NumbasTestsService } from 'src/app/api/services/numbas-tests.service';

@Component({
  selector: 'f-scorm-component',
  templateUrl: './scorm-wrapper.component.html',
  styleUrls: ['./scorm-wrapper.component.scss'],
})
export class ScormComponent implements OnInit, OnDestroy {
  test: any;
  scorm: ScormService;
  score: string;

  constructor(private numbasTestsService: NumbasTestsService) {}

  ngOnInit() {
    this.scorm = new ScormService();
    const result = this.scorm.initialize();
    if (result) {
      this.loadTestData();
    }
  }

  ngOnDestroy() {
    this.scorm.quit();
  }

  updateScore() {
    let newScore: number;
    this.score = newScore.toString();
    this.scorm.set('cmi.core.score.raw', this.score);
  }

  getScore(): string {
    return this.scorm.get('cmi.core.score.raw');
  }

  saveCompletedTest() {
    const completedTestData = {
      // Construct the completed test data object to be sent to the Rails API
      // based on the test data and user's input
    };
    this.numbasTestsService.saveCompletedTest(completedTestData).subscribe(
      (response) => {
        console.log('Completed test data saved successfully:', response);
      },
      (error) => {
        console.error('Error saving completed test data:', error);
      }
    );
  }

  private loadTestData() {
    // Load test data from JSON file or API
  }
}
