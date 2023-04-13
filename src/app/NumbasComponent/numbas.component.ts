import { Component, OnDestroy, OnInit } from '@angular/core';
import { ScormService } from 'pipwerks-scorm-api-wrapper';
import { NumbasTestsService } from 'src/app/api/services/numbas-tests.service';
import JSZip from 'jszip';

declare const SCORM: any;

@Component({
  selector: 'f-numbas-component',
  templateUrl: './numbas-component.component.html',
  styleUrls: ['./numbas-component.component.scss'],
})
export class NumbasComponent implements OnInit, OnDestroy {
  test: any;
  scorm: ScormService;
  score: string;

  constructor(private numbasTestsService: NumbasTestsService) {}

  ngOnInit() {
    this.scorm = new ScormService();
    const result = this.scorm.initialize();
    if (result) {
      this.loadNumbasTest();
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
      // Construct the completed test data object to be sent to the API
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

  private loadNumbasTest() {
    // Load Numbas test from ZIP file
    fetch('numbas-test.zip')
      .then((response) => response.arrayBuffer())
      .then((zipBuffer) => {
        return JSZip.loadAsync(zipBuffer);
      })
      .then((zip) => {
        return zip.file('index.html').async('text');
      })
      .then((html) => {
        // Initialize SCORM API
        SCORM.API.LMSInitialize('');
        // Load Numbas test
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframe.contentDocument.write(html);
        // Finish SCORM API
        SCORM.API.LMSFinish('');
      })
      .catch((error) => {
        console.error('Error loading Numbas test:', error);
      });
  }
}
