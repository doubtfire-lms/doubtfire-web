import {pointer} from 'd3';
import Konva from 'konva';
import {Component, DestroyRef, ElementRef, effect, inject, signal, viewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';

interface FloorPlan {
  url: string;
  image: HTMLImageElement;
  width: number;
  height: number;
}

@Component({
  selector: 'df-room-table-mapper',
  imports: [MatButtonModule],
  templateUrl: './room-table-mapper.component.html',
})
export class RoomTableMapperComponent {
  readonly plan = signal<FloorPlan | null>(null);
  readonly tables = signal<{x: number; y: number}[]>([]);
  readonly editing = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
  private readonly destroyRef = inject(DestroyRef);

  private readonly preview = viewChild<ElementRef<HTMLDivElement>>('preview');

  constructor() {
    effect((onCleanup) => {
      const host = this.preview()?.nativeElement;
      const plan = this.plan();
      if (!host || !plan) {
        return;
      }

      const stage = new Konva.Stage({container: host});
      const layer = new Konva.Layer({listening: false});
      stage.add(layer);
      layer.add(new Konva.Image({image: plan.image, opacity: 0.25}));

      const radius = plan.width * 0.03;
      this.tables().forEach((table, index) => {
        const x = table.x * plan.width;
        const y = table.y * plan.height;
        layer.add(
          new Konva.Circle({
            x,
            y,
            radius,
            fill: '#153c5c',
            stroke: 'white',
            strokeWidth: radius * 0.015,
          }),
        );
        layer.add(
          new Konva.Text({
            x: x - radius,
            y: y - radius,
            width: 2 * radius,
            height: 2 * radius,
            text: String(index + 1),
            align: 'center',
            verticalAlign: 'middle',
            fontSize: radius,
            fontStyle: 'bold',
            fill: 'white',
          }),
        );
      });

      const resize = () => {
        const width = host.clientWidth;
        const scale = width / plan.width;
        stage.size({width, height: plan.height * scale});
        layer.scale({x: scale, y: scale});
        layer.draw();
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(host);
      onCleanup(() => {
        observer.disconnect();
        stage.destroy();
      });
    });

    this.destroyRef.onDestroy(() => {
      const plan = this.plan();
      if (plan) {
        URL.revokeObjectURL(plan.url);
      }
    });
  }

  async selectPlan(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    this.error.set('');
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.error.set('Choose a PNG or JPEG floor plan.');
      return;
    }

    this.loading.set(true);
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
      if (this.destroyRef.destroyed) {
        URL.revokeObjectURL(url);
        return;
      }
      const previous = this.plan();
      this.plan.set({url, image, width: image.naturalWidth, height: image.naturalHeight});
      if (previous) {
        URL.revokeObjectURL(previous.url);
      }
      this.tables.set([]);
      this.editing.set(true);
    } catch {
      URL.revokeObjectURL(url);
      this.error.set('This image could not be opened. Choose another PNG or JPEG.');
    } finally {
      this.loading.set(false);
    }
  }

  addTable(event: MouseEvent): void {
    const plan = this.plan();
    const map = event.currentTarget;
    if (!this.editing() || !plan || !(map instanceof SVGSVGElement)) {
      return;
    }
    const [x, y] = pointer(event, map);
    this.tables.update((tables) => [...tables, {x: x / plan.width, y: y / plan.height}]);
  }

  undo(): void {
    this.tables.update((tables) => tables.slice(0, -1));
  }
}
