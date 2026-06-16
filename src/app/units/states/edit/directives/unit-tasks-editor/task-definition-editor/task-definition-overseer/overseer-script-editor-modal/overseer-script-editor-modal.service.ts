import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {OverseerScriptEditorModalComponent} from './overseer-script-editor-modal.component';

export interface OverseerScriptEditorModalData {
  taskDefinition: TaskDefinition;
}

@Injectable({
  providedIn: 'root',
})
export class OverseerScriptEditorModalService {
  constructor(public dialog: MatDialog) {}

  public show(taskDefinition: TaskDefinition) {
    const _dialogRef = this.dialog.open<
      OverseerScriptEditorModalComponent,
      OverseerScriptEditorModalData
    >(OverseerScriptEditorModalComponent, {
      data: {
        taskDefinition: taskDefinition,
      },
      width: '100%',
      maxWidth: '1200px',
    });
  }
}
