import {HttpClient, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AlertService} from '../services/alert.service';

@Injectable({
  providedIn: 'root',
})
export class FileDownloaderService {
  constructor(
    private httpClient: HttpClient,
    private alerts: AlertService,
  ) {}

  public downloadBlob(
    url: string,
    success: (url: string, response: HttpResponse<Blob>) => void,
    failure: (error: any) => void,
  ) {
    this.httpClient.get(url, {responseType: 'blob', observe: 'response'}).subscribe({
      next: (response) => {
        const binaryData = [];
        binaryData.push(response.body);
        // response.headers.get('content-type')
        const resourceUrl: string = window.URL.createObjectURL(
          new Blob(binaryData, {type: response.body.type}),
        );
        success(resourceUrl, response);
      },
      error: (error) => {
        if (failure) failure(error);
      },
    });
  }

  public releaseBlob(url: string): void {
    window.URL.revokeObjectURL(url);
  }

  public downloadFile(url: string, defaultFilename: string) {
    this.downloadBlob(
      url,
      (resourceUrl: string, response: HttpResponse<Blob>) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = resourceUrl;
        downloadLink.target = '_blank';
        const filenameRegex = /filename[^;=\n]*=((['']).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(response.headers.get('Content-Disposition'));
        if (matches != null && matches[1]) {
          const filename = matches[1].replace(/['']/g, '');
          downloadLink.setAttribute('download', filename);
        } else {
          downloadLink.setAttribute('download', defaultFilename);
        }

        document.body.appendChild(downloadLink);

        downloadLink.click();
        downloadLink.parentNode.removeChild(downloadLink);
      },
      (error: any) => {
        this.alerts.error(`Error downloading file - ${error}`);
      },
    );
  }
}
