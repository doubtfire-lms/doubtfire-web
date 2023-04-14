import { Component, OnDestroy, OnInit } from '@angular/core';
import { NumbasTestsService } from 'src/app/api/services/numbas-tests.service';
import JSZip from 'jszip';
import { ScormService } from 'src/app/api/services/scorm-service';

@Component({
  selector: 'f-numbas-component',
  templateUrl: './numbas.component.html',
  styleUrls: ['./numbas.component.scss'],
})
export class NumbasComponent implements OnInit, OnDestroy {
  test: any;
  score: string;

  constructor(private numbasTestsService: NumbasTestsService, private scormService: ScormService) {}

  ngOnInit() {
    const result = this.scormService.init();
    if (result) {
      this.loadNumbasTest();
    }
  }

  ngOnDestroy() {
    this.scormService.quit();
  }

  updateScore() {
    let newScore: number;
    this.score = newScore.toString();
    this.scormService.set('cmi.core.score.raw', this.score);
  }

  getScore(): string {
    return this.scormService.get('cmi.core.score.raw');
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
        // Load Numbas test
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframe.contentDocument.write(html);
      })
      .catch((error) => {
        console.error('Error loading Numbas test:', error);
      });
  }
}
