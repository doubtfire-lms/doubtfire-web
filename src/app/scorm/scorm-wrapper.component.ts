import { Component, OnDestroy, OnInit } from '@angular/core';
import { ScormService } from 'pipwerks-scorm-api-wrapper';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'f-scorm-component',
  templateUrl: './scorm-wrapper.component.html',
  styleUrls: ['./scorm-wrapper.component.scss'],
})
export class ScormComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  test: any;
  scorm: ScormService;
  score: string; // Declare the 'score' variable

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Initialize the SCORM API
    this.scorm = new ScormService();
    const result = this.scorm.initialize();
    if (result) {
      // Make an HTTP request to retrieve the test data from the JSON file
      this.http.get('assets/test-data.json').subscribe((data) => {
        this.test = data;
      });
    }
  }

  ngOnDestroy() {
    // Terminate the SCORM session when the component is destroyed
    this.scorm.quit();
  }

  updateScore() {}

  getScore(): string {
    // Call the LMSGetValue method to retrieve the score
    return this.scorm.get('cmi.core.score.raw');
  }

  saveCompletedTest() {
    // Implement your logic to send the completed test data to the Rails API
    // using an HTTP POST request
    const completedTestData = {
      // Construct the completed test data object to be sent to the Rails API
      // based on the test data and user's input
    };
    // Example post will use service in final edition
    this.http.post('https://localhost:3000/api/completed-tests', completedTestData).subscribe(
      (response) => {
        // Handle the success response from the Rails API
        console.log('Completed test data saved successfully:', response);
      },
      (error) => {
        // Handle the error response from the Rails API
        console.error('Error saving completed test data:', error);
      }
    );
  }
}
