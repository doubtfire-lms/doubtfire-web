import {NgTemplateOutlet} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {FChipComponent} from '../f-chip/chip.component';
import {UnitCodeService} from './unit-code.service';

@Component({
  selector: 'f-unit-code',
  templateUrl: './unit-code.component.html',
  styleUrls: ['./unit-code.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FChipComponent, NgTemplateOutlet],
})
export class UnitCodeComponent implements OnInit, OnDestroy {
  @Input() unit_code: string;
  @Input() width = 90;
  @Input() isDropdown = false;
  @Input() shiftBetweenBadges = true;

  currentIndex = 0; // Index of the currently displayed code part
  showState = 'in'; // Animation state
  subscription: Subscription;

  constructor(private unitCodeService: UnitCodeService) {}

  get isDualBadge() {
    return this.unit_code?.includes('/') || this.unit_code?.includes('-');
  }

  get unitCodeParts() {
    if (this.shiftBetweenBadges) {
      if (this.isDualBadge) {
        if (this.unit_code.includes('/')) {
          return this.unit_code.split('/');
        } else {
          return this.unit_code.split('-');
        }
      } else {
        return [this.unit_code];
      }
    }
    return this.unit_code;
  }

  ngOnInit(): void {
    if (this.isDropdown) {
      this.width += 24;
    }

    this.subscription = this.unitCodeService.getInterval().subscribe(() => {
      this.flip();
    });
  }

  flip() {
    this.showState = 'out'; // Trigger animation out
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.unitCodeParts.length;
      this.showState = 'in'; // Trigger animation in after a delay
    }, 200); // Delay to match the animation duration
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
