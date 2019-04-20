import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { BaseAudioRecorderComponent } from 'src/app/common/audio-recorder/audio/base-audio-recorder';
import { audioRecorderService } from 'src/app/ajs-upgraded-providers';
import { timer, Observable } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'intelligent-discussion-player',
  templateUrl: './intelligent-discussion-player.component.html',
  styleUrls: ['./intelligent-discussion-player.component.css']
})
export class IntelligentDiscussionPlayerComponent extends BaseAudioRecorderComponent {
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean;
  constructor(public dialog: MatDialog, @Inject(audioRecorderService) mediaRecorderService: any, ) {
    super(mediaRecorderService);
  }

  ngOnInit() {

  }

  init() {
    super.init();
  }

  sendRecording(): void { }

  beginDiscussion(): void {
    const dialogRef = this.dialog.open(IntelligentDiscussionDialog, {
      maxWidth: '800px',
      data: {
        isSending: this.isSending,
        canRecord: this.canRecord
      }
    });

    dialogRef.afterOpened().subscribe((result: any) => {
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
export class IntelligentDiscussionDialog {
  confirmed = false;
  timerText: string = '';
  ticks: number = 0;
  startedDiscussion = false;
  inDiscussion = false;
  count: number = 3 * 60 * 1000; // 3 minutes

  constructor(
    public dialogRef: MatDialogRef<IntelligentDiscussionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any, ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  oberserableTimer() {
    if (!this.startedDiscussion) {
      // start the discussion
      this.startedDiscussion = true;
      this.inDiscussion = true;

      // get the cutoff date from the server
      // For now this is stubbed as 4 minutes from now.
      let discussionCutoff = moment().add(4, 'minutes');

      let counter = timer(0, 1000).subscribe(val => {
        let difference = discussionCutoff.diff(moment());
        this.timerText = moment.utc(difference).format('mm:ss');
        this.ticks = val;
      });
    }
  }
}
