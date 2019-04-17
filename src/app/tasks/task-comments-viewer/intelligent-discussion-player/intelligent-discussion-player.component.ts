import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatStepper } from '@angular/material';
import { BaseAudioRecorderComponent } from 'src/app/common/audio-recorder/base-audio-recorder';
import { audioRecorderService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'intelligent-discussion-player',
  templateUrl: './intelligent-discussion-player.component.html',
  styleUrls: ['./intelligent-discussion-player.component.css']
})
export class IntelligentDiscussionPlayerComponent {

  constructor(public dialog: MatDialog) { }

  beginDiscussion(): void {
    const dialogRef = this.dialog.open(IntelligentDiscussionDialog, {
      maxWidth: '800px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('The dialog was closed');
    });
  }
}


// The Dialog Component
@Component({
  selector: 'intelligent-discussion-dialog',
  templateUrl: 'intelligent-discussion-dialog.html',
  styleUrls: ['./intelligent-discussion-player.component.css']
})
export class IntelligentDiscussionDialog extends BaseAudioRecorderComponent {
  confirmed = false;
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean;

  constructor(
    public dialogRef: MatDialogRef<IntelligentDiscussionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(audioRecorderService) mediaRecorderService: any, ) {
    super(mediaRecorderService);
  }

  ngOnInit() {
    if (this.canRecord) {
      this.init();
    }
  }

  init(): void {
    super.init();
    this.canvas = <HTMLCanvasElement>document.getElementById('audio-recorder-visualiser');
    this.audio = <HTMLAudioElement>document.getElementById('audioPlayer');
    this.canvasCtx = this.canvas.getContext('2d');
  }

  sendRecording(): void { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
