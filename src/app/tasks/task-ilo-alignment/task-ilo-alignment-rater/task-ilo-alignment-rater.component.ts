import { Component, Input, Output, EventEmitter, forwardRef, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'task-ilo-alignment-rater',
  templateUrl: './task-ilo-alignment-rater.component.html',
  styleUrls: ['./task-ilo-alignment-rater.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TaskIloAlignmentRaterComponent),
      multi: true,
    },
  ],
})
export class TaskIloAlignmentRaterComponent implements ControlValueAccessor {
  @Input() compact: boolean = false;
  @Input() hideLabels: boolean = false;
  @Input() selectedTooltip: any;
  @Input() showTooltips: boolean = false;
  @Input() hoveringOver: number = 0;
  @Input() max: number = 5;
  @Input() readonly: boolean = false;
  @Input() tooltips: { [key: number]: string } = {};
  @Input() colorful: boolean = false;
  @Input() showZeroRating: boolean = false;
  @Input() label: string = '';
  @Input() unit: any;
  @Output() ratingChanged = new EventEmitter<any>();

  ngModel: any = { rating: 0 };



  onChange = (_: any) => {};
  onTouched = () => {};

  ngOnInit(): void {
    this.setDefaults();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setDefaults();
  }

  private setDefaults() {
    if (this.selectedTooltip === undefined) this.selectedTooltip = true;
    if (this.colorful === undefined) this.colorful = true;
    if (!this.tooltips || Object.keys(this.tooltips).length === 0) {
      this.tooltips = {
        0: 'This task is not related to this outcome at all.',
        1: 'The task is slightly related to this outcome',
        2: 'The task is related to this outcome',
        3: 'The task is a reasonable example for this outcome',
        4: 'The task is a strong example of this outcome',
        5: 'The task is the best example of this outcome'
      };
    }
    if (this.showTooltips === undefined) this.showTooltips = false;
    if (this.hideLabels === undefined) this.hideLabels = false;
    if (this.showZeroRating === undefined) this.showZeroRating = false;
    if (typeof this.readonly === 'string') {
      this.readonly = this.readonly !== 'false';
    }


    if (this.compact && this.readonly === undefined) {
      this.readonly = true;
    }
  }



  writeValue(obj: any): void {
    this.ngModel = obj ? obj : { rating: 0 };
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setHoverValue(value: number | null): void {
    if (!this.readonly) {
      this.hoveringOver = value ?? 0;
    }
  }

  onRatingChange(newRating: number): void {
    if (this.readonly) return;

    if (!this.ngModel) {
      this.ngModel = { rating: 0 };
    }


    if (this.ngModel.rating === newRating && newRating !== 0) {
      this.ngModel.rating = 0;
    } else {
      this.ngModel.rating = newRating;
    }

    this.onChange(this.ngModel);
    this.ratingChanged.emit(this.ngModel);
    this.onTouched();
  }
  getCurrentRating(): number {
    return this.hoveringOver || this.ngModel?.rating || 0;
  }
}
