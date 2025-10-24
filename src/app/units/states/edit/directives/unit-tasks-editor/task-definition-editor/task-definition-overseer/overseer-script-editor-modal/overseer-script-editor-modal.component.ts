import {HttpClient} from '@angular/common/http';
import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CodeModel} from '@ngstack/code-editor';
import {AppInjector} from 'src/app/app-injector';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {OverseerScriptEditorModalData} from './overseer-script-editor-modal.service';

@Component({
  selector: 'f-overseer-script-editor-modal',
  templateUrl: './overseer-script-editor-modal.component.html',
  styleUrls: ['./overseer-script-editor-modal.component.scss'],
})
export class OverseerScriptEditorModalComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: OverseerScriptEditorModalData,
    public dialogRef: MatDialogRef<OverseerScriptEditorModalData>,
    private httpClient: HttpClient,
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
    // TODO: move to taskDefinition model
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.data.taskDefinition.unit.id}/task_definitions/${this.data.taskDefinition.id}/overseer_script`;
    this.httpClient.get(url).subscribe((data: string) => {
      this.model.value = data;
      this.loading = false;
    });
  }

  save() {
    console.log(this.model.value);
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.data.taskDefinition.unit.id}/task_definitions/${this.data.taskDefinition.id}/overseer_script`;

    this.httpClient.put(url, {script_content: this.model.value}).subscribe({
      next: (result) => {
        console.log(result);
        this.dialogRef.close();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
