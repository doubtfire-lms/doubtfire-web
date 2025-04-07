import {Component, Input} from '@angular/core';
import {TaskDefinition} from 'src/app/api/models/task-definition';

@Component({
  selector: 'f-task-badge',
  templateUrl: './task-badge.component.html',
  styleUrl: './task-badge.component.css',
})
export class FTaskBadgeComponent {
  @Input() taskDef: TaskDefinition;
  @Input() size = 100;

  lineHeight = 12;

  get abbreviation(): string {
    // return the first 3 characters of the task abbreviation
    return this.taskDef?.abbreviation.substring(0, 4);
  }

  calculateFontSize(length: number): string {
    const baseFontSize = 1.5; // Base font size in rem
    const maxLength = 3; // Maximum length before font size reduction
    const fontSizeIncrement = -0.1; // Amount to reduce font size for each additional character

    // Calculate font size based on length
    let fontSize = baseFontSize - Math.max(0, length - maxLength) * fontSizeIncrement;

    // Ensure font size doesn't go below a minimum value
    fontSize = Math.max(fontSize, 0.8); // Adjust as needed

    return fontSize + 'rem';
  }
}
