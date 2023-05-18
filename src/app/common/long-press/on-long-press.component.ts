import { Directive, ElementRef, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
// imports necessary dependencies from the '@angular/core' module
@Directive({
  selector: '[onLongPress]', // Selector to match the element that this directive will be applied to for HTML button element
})
export class OnLongPressDirective implements OnInit, OnDestroy {
  private timeoutId: number; // Identifier for the setTimeout function used to detect a long press
  private isLongPressing = false; // Flag to keep track of whether a long press is currently happening

  @Output() // Declare event emitters for the on-long-press and on-touch-end events
  onLongPress = new EventEmitter<void>();
  @Output()
  onTouchEnd = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    const element = this.elementRef.nativeElement; // Get a reference to the element that this directive is attached to

    // Add a touchstart event listener to detect when the user starts pressing on the element
    element.addEventListener('touchstart', (event) => {
      // Set a timeout for 600ms to detect a long press
      this.timeoutId = window.setTimeout(() => {
        // If the user is still pressing on the element after 600ms and we haven't emitted the on-long-press event yet, emit it now
        if (!this.isLongPressing) {
          this.isLongPressing = true; // Set the flag to indicate that a long press is happening
          this.onLongPress.emit(); // Emit the on-long-press event
        }
      }, 600);
    });

    // Add a touchend event listener to detect when the user lifts their finger off the element
    element.addEventListener('touchend', (event) => {
      // If the setTimeout function hasn't been triggered yet (i.e. the user hasn't been pressing on the element for 600ms), cancel it
      if (this.timeoutId) {
        window.clearTimeout(this.timeoutId);
        this.timeoutId = undefined;
      }
      // If a long press was happening, reset the flag and emit the on-touch-end event
      if (this.isLongPressing) {
        this.isLongPressing = false;
      }
      this.onTouchEnd.emit();
    });
  }

  ngOnDestroy() {
    const element = this.elementRef.nativeElement; // Get a reference to the element that this directive is attached to
    // Remove the event listeners when the directive is destroyed to avoid memory leaks
    element.removeEventListener('touchstart');
    element.removeEventListener('touchend');
  }
}
