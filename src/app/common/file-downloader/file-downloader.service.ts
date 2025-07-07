import {HttpClient, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AlertService} from '../services/alert.service';

interface FileDownloaderData {
  url: string;
  response: HttpResponse<Blob>;
  success: (url: string, response: HttpResponse<Blob>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  failure: (error: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  binaryData: Blob[];
}

@Injectable({
  providedIn: 'root',
})
export class FileDownloaderService {
  constructor(
    private httpClient: HttpClient,
    private alerts: AlertService,
  ) {}

  private processPartialBlob(data: FileDownloaderData) {
    // We now need to ask for the next part of the file
    const range = data.response.headers.get('Content-Range');
    if (range) {
      // The range header is in the format "bytes start-end/totalSize"
      const parts = range.split('/');

      // Split into the range and the total size
      if (parts.length === 2) {
        // Parse the total size and the range
        const totalSize = parseInt(parts[1], 10);

        // Extract the range after the "bytes" part
        const contentRange = parts[0].split(' ')[1];

        // Extract the parts of the range
        const contentRangeParts = contentRange.split('-');

        // If we have two parts, we have a valid range and size
        if (contentRangeParts.length === 2) {
          const start = parseInt(contentRangeParts[0], 10);
          const end = parseInt(contentRangeParts[1], 10);

          // Check the start is the same as the length of the binary data received
          if (start !== data.binaryData.map((value) => value.size).reduce((pv, cv) => pv + cv, 0)) {
            console.log('Error: start != oldLen');
            this.alerts.error('Error downloading file part received out of order');
          }
          data.binaryData.push(data.response.body);

          // If the end is less than the total size, we need to request the next part
          if (end + 1 < totalSize) {
            const rangeHeader = {Range: `bytes=${end + 1}-${totalSize}`};
            this.httpClient
              .get(data.url, {responseType: 'blob', observe: 'response', headers: rangeHeader})
              .subscribe({
                next: (response2) => {
                  data.response = response2;
                  this.processHttpResponse(data);
                },
                error: (error) => {
                  if (data.failure) data.failure(error);
                },
              });
            return;
          } else {
            // we have all of the data, so we can report success
            this.reportSuccess(data);
          }
        }
      }
    } else {
      // no range... so we can't do anything!
      console.log('Error reading response from server - no range with 206 response');
      if (data.failure) data.failure('Unable to read data from server');
    }
  }

  private processHttpResponse(data: FileDownloaderData) {
    // Check if we have a partial content response
    if (data.response.status === 206) {
      this.processPartialBlob(data);
    } else {
      // Save the binary data we have received so far
      data.binaryData.push(data.response.body);
      this.reportSuccess(data);
    }
  }

  private reportSuccess(data: FileDownloaderData) {
    const resourceUrl: string = window.URL.createObjectURL(
      new Blob(data.binaryData, {type: data.response.body.type}),
    );
    data.success(resourceUrl, data.response);
  }

  public downloadBlob(
    url: string,
    success: (url: string, response: HttpResponse<Blob>) => void,
    failure: (error) => void,
  ) {
    // Declare binary data outside of the subscription so that it can be accessed in the second requests when partial content is returned
    const binaryData = [];

    this.httpClient.get(url, {responseType: 'blob', observe: 'response'}).subscribe({
      next: (response) => {
        this.processHttpResponse({
          url: url,
          response: response,
          success: success,
          failure: failure,
          binaryData: binaryData,
        });
      },
      error: (error) => {
        if (failure) failure(error);
      },
    });
  }

  public releaseBlob(url: string): void {
    window.URL.revokeObjectURL(url);
  }

  /**
   * Download or save a blob to a file. This will trigger the user to "download"
   * the blob, with the suggested filename.
   *
   * @param blobUrl the url of the blob to download/save to file
   * @param filename the name of the file
   */
  public downloadBlobToFile(blobUrl: string, filename: string): void {
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.target = '_blank';
    downloadLink.setAttribute('download', filename);
    document.body.appendChild(downloadLink);

    downloadLink.click();
    downloadLink.parentNode.removeChild(downloadLink);
  }

  public downloadFile(url: string, defaultFilename: string) {
    this.downloadBlob(
      url,
      (resourceUrl: string, response: HttpResponse<Blob>) => {
        const filenameRegex = /filename[^;=\n]*=((['']).*?\2|[^;\n]*)/;

        const matches = filenameRegex.exec(response.headers.get('Content-Disposition'));
        let filename: string;

        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['']/g, '');
        } else {
          filename = defaultFilename;
        }

        this.downloadBlobToFile(resourceUrl, filename);
      },
      (error) => {
        this.alerts.error(`Error downloading file - ${error}`);
      },
    );
  }
}
