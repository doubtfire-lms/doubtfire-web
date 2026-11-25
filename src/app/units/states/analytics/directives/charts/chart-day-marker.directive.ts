import {
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';

// ng-charts places ordinal x values with a d3 point scale using this outer padding.
const POINT_SCALE_PADDING = 0.1;
// ng-charts pads its clip rect by 5px on every side of the plot.
const CLIP_RECT_PADDING = 10;

/** x offset of point `index` of `count` across `width`, matching d3's scalePoint. */
export function pointScaleOffset(index: number, count: number, width: number): number {
  const step = width / Math.max(1, count - 1 + POINT_SCALE_PADDING * 2);
  return (width - step * (count - 1)) / 2 + index * step;
}

/**
 * Index the left/right arrow keys move to from `current` (or the latest point when nothing is
 * marked yet), or null for any other key.
 */
export function steppedPointIndex(
  event: KeyboardEvent,
  current: number | null,
  count: number,
): number | null {
  const step = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
  if (!step || count === 0) {
    return null;
  }

  event.preventDefault();
  return Math.min(Math.max((current ?? count - 1) + step, 0), count - 1);
}

/**
 * Draws a vertical marker over an ng-charts area chart at one of its ordinal x values.
 * The chart has no API for this, so the plot is measured from its rendered SVG.
 */
@Directive({
  selector: '[fChartDayMarker]',
  standalone: false,
})
export class ChartDayMarkerDirective implements OnInit, OnChanges, OnDestroy {
  /** Index of the marked x value, or null for no marker. */
  @Input() fChartDayMarker: number | null = null;
  @Input() markerPointCount = 0;
  @Input() markerLabel = '';

  private marker: HTMLElement;
  private label: HTMLElement;
  private frame?: number;
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    private readonly ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.marker = this.renderer.createElement('div');
    this.marker.className =
      'pointer-events-none absolute z-[1] hidden border-l-2 border-dashed border-slate-900/20';
    this.label = this.renderer.createElement('div');
    this.label.className =
      'absolute -top-6 left-0 -translate-x-1/2 px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap text-slate-900';
    this.renderer.appendChild(this.marker, this.label);
    this.renderer.appendChild(this.host.nativeElement, this.marker);

    // The chart redraws itself on resize and data changes, so follow its SVG rather than inputs alone.
    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => this.schedule());
      this.resizeObserver.observe(this.host.nativeElement);
      this.mutationObserver = new MutationObserver(() => this.schedule());
      this.mutationObserver.observe(this.host.nativeElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['transform', 'width', 'height'],
      });
    });
    this.schedule();
  }

  ngOnChanges(): void {
    this.schedule();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    if (this.frame) {
      cancelAnimationFrame(this.frame);
    }
  }

  private schedule(): void {
    if (!this.marker || this.frame) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.frame = requestAnimationFrame(() => {
        this.frame = undefined;
        this.position();
      });
    });
  }

  private position(): void {
    const host = this.host.nativeElement;
    const plot = host.querySelector<SVGGElement>('g.area-chart');
    const clipRect = host.querySelector<SVGRectElement>('clipPath rect');
    // The browser has already parsed the plot's translate(x, y); e and f are its offsets.
    const offset = plot?.transform.baseVal.consolidate()?.matrix;
    const index = this.fChartDayMarker;

    if (
      !plot?.ownerSVGElement ||
      !clipRect ||
      !offset ||
      index === null ||
      index < 0 ||
      index >= this.markerPointCount
    ) {
      this.marker.classList.add('hidden');
      return;
    }

    const width = clipRect.width.baseVal.value - CLIP_RECT_PADDING;
    const height = clipRect.height.baseVal.value - CLIP_RECT_PADDING;
    const hostRect = host.getBoundingClientRect();
    const svgRect = plot.ownerSVGElement.getBoundingClientRect();
    const left =
      svgRect.left -
      hostRect.left +
      offset.e +
      pointScaleOffset(index, this.markerPointCount, width);
    const top = svgRect.top - hostRect.top + offset.f;

    this.marker.style.left = `${left - 1}px`;
    this.marker.style.top = `${top}px`;
    this.marker.style.height = `${height}px`;
    this.label.textContent = this.markerLabel;
    this.label.classList.toggle('hidden', !this.markerLabel);
    this.marker.classList.remove('hidden');
  }
}
