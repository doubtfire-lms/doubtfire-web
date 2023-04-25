import { Component, OnDestroy, OnInit } from '@angular/core';
import { NumbasTestsService } from 'src/app/api/services/numbas-tests.service';
import JSZip from 'jszip';
import { ScormService } from 'src/app/api/services/scorm-service';
import { ScormAPIImplementation } from 'src/app/api/services/scorm-api-implementation';

@Component({
  selector: 'f-numbas-component',
  template: `
    <div class="numbas-wrapper">
      <h1>Numbas Test</h1>
      <iframe id="numbas-iframe" src="" frameborder="0"></iframe>
    </div>
  `,
  styleUrls: ['./numbas.component.scss'],
})
export class NumbasComponent implements OnInit, OnDestroy {
  test: any; // placeholder for the Numbas test object
  score: string; // variable to hold the user's score

  constructor(private numbasTestsService: NumbasTestsService, private scormService: ScormService) {}

  ngOnInit() {
    this.loadNumbasTest();
  }

  ngOnDestroy() {
    // terminate SCORM API when the component is destroyed
    const terminated = this.scormService.quit(); // returns true if termination was successful
    if (!terminated) {
      console.error('Failed to terminate SCORM API');
    }
  }

  updateScore() {
    // retrieve the score from the Numbas test and save it to the SCORM API
    const iframe = document.getElementById('numbas-iframe') as HTMLIFrameElement;
    const win = iframe.contentWindow as any;
    const score = win.nb.quiz.score();
    this.score = score.toString();
    this.scormService.set('cmi.core.score.raw', this.score);
  }

  getScore(): string {
    // retrieve the score from the SCORM API
    const score = this.scormService.get('cmi.core.score.raw');
    return score !== null && score !== undefined ? score.toString() : '';
  }

  saveCompletedTest() {
    // save completed test data to the server
    const completedTestData = {
      cmi_core_lesson_status: this.scormService.get('cmi.core.lesson_status'),
      cmi_core_score_raw: this.scormService.get('cmi.core.score.raw'),
      // Add other SCORM variables as necessary
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

  // private loadNumbasTest() {
  //   // load the Numbas test into the iframe
  //   fetch('assets/numbas-test.zip')
  //     .then((response) => response.arrayBuffer())
  //     .then((zipBuffer) => {
  //       return JSZip.loadAsync(zipBuffer);
  //     })
  //     .then((zip) => {
  //       // extract the files from the zip archive
  //       const promises: Promise<[string, string]>[] = [];
  //       zip.forEach((relativePath, zipEntry) => {
  //         if (!zipEntry.dir) {
  //           promises.push(
  //             zipEntry.async('text').then((content) => {
  //               return [relativePath, content];
  //             })
  //           );
  //         }
  //       });
  //       return Promise.all(promises);
  //     })
  //     .then((fileContents) => {
  //       const iframe = document.getElementById('numbas-iframe') as HTMLIFrameElement;
  //       const doc = iframe.contentDocument;
  //       const baseURI = new URL('index.html', iframe.src).href;
  //       const baseTag = doc.createElement('base');
  //       baseTag.href = baseURI;
  //       doc.head.appendChild(baseTag);
  //       fileContents.forEach(([relativePath, content]) => {
  //         const elementType = this.getElementType(relativePath);
  //         if (elementType) {
  //           const filePathParts = relativePath.split('/');
  //           let parentElement = doc.head;
  //           for (let i = 0; i < filePathParts.length - 1; i++) {
  //             const dirName = filePathParts[i];
  //             let dirElement = parentElement.querySelector(`[data-dir="${dirName}"]`) as HTMLElement;
  //             if (!dirElement) {
  //               dirElement = doc.createElement('div');
  //               dirElement.setAttribute('data-dir', dirName);
  //               parentElement.appendChild(dirElement);
  //             }
  //             parentElement = dirElement;
  //           }
  //           const element = doc.createElement(elementType);
  //           element.setAttribute('src', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
  //           parentElement.appendChild(element);
  //         }
  //       });
  //       const win = iframe.contentWindow as any;
  //       const api = this.scormService.getScormAPI();
  //       win.API = api;
  //       win.API_1484_11 = api;
  //     })
  //     .catch((error) => {
  //       console.error('Error loading Numbas test:', error);
  //     });
  // }
  // private loadNumbasTest() {
  //   // load the Numbas test into the iframe
  //   fetch('assets/numbas-test.zip')
  //     .then((response) => response.arrayBuffer())
  //     .then((zipBuffer) => {
  //       return JSZip.loadAsync(zipBuffer);
  //     })
  //     .then((zip) => {
  //       // extract the files from the zip archive
  //       const promises: Promise<[string, string]>[] = [];
  //       zip.forEach((relativePath, zipEntry) => {
  //         if (!zipEntry.dir) {
  //           promises.push(
  //             zipEntry.async('text').then((content) => {
  //               return [relativePath, content];
  //             })
  //           );
  //         }
  //       });
  //       return Promise.all(promises);
  //     })
  //     .then((fileContents) => {
  //       const iframe = document.getElementById('numbas-iframe') as HTMLIFrameElement;
  //       const doc = iframe.contentDocument;
  //       const baseURI = new URL('index.html', iframe.src).href;
  //       const baseTag = doc.createElement('base');
  //       baseTag.href = baseURI;
  //       doc.head.appendChild(baseTag);

  //       // Open and close the iframe document
  //       doc.open();
  //       doc.close();

  //       fileContents.forEach(([relativePath, content]) => {
  //         const elementType = this.getElementType(relativePath);
  //         if (elementType) {
  //           const element = doc.createElement(elementType);
  //           switch (elementType) {
  //             case 'iframe':
  //             case 'img':
  //             case 'video':
  //             case 'audio':
  //               element.setAttribute('src', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
  //               break;
  //             case 'style':
  //               (element as HTMLStyleElement).textContent = content;
  //               break;
  //             case 'script':
  //               (element as HTMLScriptElement).text = content;
  //               break;
  //           }
  //           doc.body.appendChild(element);
  //         }
  //       });

  //       const win = iframe.contentWindow as any;
  //       const api = this.scormService.getScormAPI();
  //       win.API = api;
  //       win.API_1484_11 = api;
  //     })
  //     .catch((error) => {
  //       console.error('Error loading Numbas test:', error);
  //     });
  // }
  private loadNumbasTest() {
    // load the Numbas test into the iframe
    fetch('assets/numbas-test.zip')
      .then((response) => response.arrayBuffer())
      .then((zipBuffer) => {
        return JSZip.loadAsync(zipBuffer);
      })
      .then((zip) => {
        // extract the files from the zip archive
        const promises: Promise<[string, string]>[] = [];
        zip.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir) {
            promises.push(
              zipEntry.async('text').then((content) => {
                return [relativePath, content];
              })
            );
          }
        });
        return Promise.all(promises);
      })
      .then((fileContents) => {
        console.log('File contents:', fileContents);
        const iframe = document.getElementById('numbas-iframe') as HTMLIFrameElement;
        const doc = new DOMParser().parseFromString('<!DOCTYPE html><html><head></head><body></body></html>', 'text/html');
        const baseURI = new URL('index.html', iframe.src).href;
        const baseTag = doc.createElement('base');
        baseTag.href = baseURI;
        doc.head.appendChild(baseTag);
  
        fileContents.forEach(([relativePath, content]) => {
          const elementType = this.getElementType(relativePath);
          if (elementType) {
            const element = doc.createElement(elementType);
            switch (elementType) {
              case 'iframe':
              case 'img':
              case 'video':
              case 'audio':
                element.setAttribute('srcdoc', content);
                break;
              case 'style':
                (element as HTMLStyleElement).textContent = content;
                break;
              case 'script':
                (element as HTMLScriptElement).textContent = content;
                break;
            }
            doc.body.appendChild(element);
          }
        });
  
        iframe.srcdoc = new XMLSerializer().serializeToString(doc);
        const win = iframe.contentWindow as any;
        const api = this.scormService.getScormAPI();
        win.API = api;
        win.API_1484_11 = api;
      })
      .catch((error) => {
        console.error('Error loading Numbas test:', error);
      });
  }
  
  

  private getElementType(path: string): string | null {
    const ext = path.substring(path.lastIndexOf('.') + 1).toLowerCase();
    switch (ext) {
      case 'html':
        return 'iframe';
      case 'css':
        return 'style';
      case 'js':
        return 'script';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return 'img';
      case 'mp4':
      case 'ogg':
      case 'webm':
        return 'video';
      case 'mp3':
      case 'wav':
        return 'audio';
      default:
        return null;
    }
  }
}
