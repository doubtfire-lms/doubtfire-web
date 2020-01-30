import { Component, Input } from '@angular/core';

@Component({
  selector: 'unit-tutorials-manager',
  templateUrl: 'unit-tutorials-manager.component.html'
})
export class UnitTutorialsManagerComponent {
  @Input() unit: any;

  tutorialsByStream: any[] = new Array<any>();

  constructor() {
  }

  ngOnInit() {
    // TODO: gotta handle cases where there are tutorials that don't have stream
    this.tutorialsByStream.push(
      {
        stream: null,
        tutorials: this.unit.tutorials.filter(tutorial => !tutorial.tutorial_stream)
      }
    );
    this.unit.tutorial_streams.forEach(stream => {
      this.tutorialsByStream.push(
        {
          stream: stream,
          tutorials: this.unit.tutorials.filter(tutorial => tutorial.tutorial_stream === stream.abbreviation)
        }
      );
    });
   // This is where we want to load all
   // of the data required to render each of the
   // unit tutorials lists - by stream
  }
}
