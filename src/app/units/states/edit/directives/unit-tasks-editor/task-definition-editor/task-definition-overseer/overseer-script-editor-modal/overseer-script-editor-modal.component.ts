import {CodeModel} from '@ngstack/code-editor';
import {HttpClient} from '@angular/common/http';
import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AlertService} from 'src/app/common/services/alert.service';
import {OverseerScriptEditorModalData} from './overseer-script-editor-modal.service';

@Component({
  selector: 'f-overseer-script-editor-modal',
  templateUrl: './overseer-script-editor-modal.component.html',
  styleUrls: ['./overseer-script-editor-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class OverseerScriptEditorModalComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: OverseerScriptEditorModalData,
    public dialogRef: MatDialogRef<OverseerScriptEditorModalData>,
    private httpClient: HttpClient,
    private alertService: AlertService,
  ) {}

  public model: CodeModel = {
    language: 'shell',
    uri: 'run.sh',
    value: '',
  };

  scriptContent: string;

  loading: boolean = false;
  ngOnInit() {
    this.loading = true;
    this.httpClient
      .get(this.data.taskDefinition.taskOverseerExecutionScriptUrl)
      .subscribe((data: string) => {
        this.model.value = data;
        this.loading = false;
      });
  }

  save() {
    const scriptOriginal = this.model.value;
    const scriptEncoded = this.base64UrlEncode(scriptOriginal);

    this.httpClient
      .put(this.data.taskDefinition.taskOverseerExecutionScriptUrl, {
        script_content: scriptEncoded,
      })
      .subscribe({
        next: (_result) => {
          this.dialogRef.close();
        },
        error: (error) => {
          this.alertService.error(`Failed to save script: ${error}`, 6000);
        },
      });
  }

  private base64UrlEncode(str) {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
