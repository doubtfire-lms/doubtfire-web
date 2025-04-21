import {Directive, ElementRef, HostListener, Input, forwardRef} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';

@Directive({
  selector: '[contenteditable]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ContentEditableDirective),
      multi: true,
    },
  ],
})
export class ContentEditableDirective implements ControlValueAccessor {
  @Input() ngModel: string;

  constructor(private el: ElementRef) {}

  @HostListener('blur') onBlur() {
    this.updateModel();
  }

  @HostListener('keyup') onKeyup() {
    this.updateModel();
  }

  @HostListener('change') onChangeEvent() {
    this.updateModel();
  }

  writeValue(value: string): void {
    if (value !== undefined && value !== null) {
      this.el.nativeElement.innerText = value;
    } else {
      this.el.nativeElement.innerText = '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private onChange = (_: any) => {};
  private onTouched = () => {};

  private updateModel(): void {
    const value = this.el.nativeElement.innerText;
    this.onChange(value);
  }
}
