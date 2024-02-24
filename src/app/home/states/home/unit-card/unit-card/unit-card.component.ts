import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'f-unit-card',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>unit-card works!</p>`,
  styleUrl: './unit-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitCardComponent { }
