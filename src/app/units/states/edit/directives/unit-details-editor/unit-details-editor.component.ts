import {Component, Input, OnInit} from '@angular/core';
import {Unit} from 'src/app/api/models/unit';

@Component({
  selector: 'f-unit-details-editor',
  templateUrl: 'unit-details-editor.component.html',
  styleUrls: ['unit-details-editor.component.scss'],
})
export class UnitDetailsEditorComponent implements OnInit {
  @Input() unit: Unit;
  ngOnInit(): void {}
}
