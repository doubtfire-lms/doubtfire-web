import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {User, UserService} from 'src/app/api/models/doubtfire-model';

interface D3Selection {
  append(name: string): D3Selection;
  attr(
    name: string,
    value: string | number | ((datum: IconLine, index: number) => string | number),
  ): D3Selection;
  call(
    callback: (selection: D3Selection, size: number, radius: number) => void,
    size: number,
    radius: number,
  ): D3Selection;
  data(data: IconLine[]): D3Selection;
  enter(): D3Selection;
  remove(): D3Selection;
  selectAll(selector: string): D3Selection;
  style(name: string, value: string): D3Selection;
  text(value: (datum: IconLine) => string): D3Selection;
}

interface IconLine {
  width: number;
  text: string;
}

declare const d3: {
  select(element: SVGElement): D3Selection;
};

@Component({
  selector: 'user-icon',
  templateUrl: './user-icon.component.html',
  styleUrls: ['./user-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UserIconComponent implements AfterViewInit, OnChanges {
  @Input() user: User;
  @Input() unselected: boolean;
  @Input() size = 100;

  @ViewChild('svg') svg: ElementRef<SVGElement>;

  lineHeight = 12;
  usingCurrentUser: boolean;
  private renderSequence = 0;

  ngAfterViewInit(): void {
    if (this.user == null) {
      this.usingCurrentUser = true;
      this.user = this.userService.currentUser;
    }
    this.drawUserIcon();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user || changes.unselected) {
      this.drawUserIcon();
    }
  }

  constructor(private userService: UserService) {}

  private async backgroundUrl(): Promise<string> {
    const hash = await this.sha256(this.email?.trim().toLowerCase() ?? '');
    return `https://www.gravatar.com/avatar/${hash}.png?default=blank&size=${this.size * 4}`;
  }

  private async sha256(value: string): Promise<string> {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(
      '',
    );
  }

  get email(): string {
    return this.user?.email;
  }

  get initials(): string {
    const words = this.user?.name.split(' ').filter(Boolean) ?? [];
    return words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : '  ';
  }

  get words(): string[] {
    return [this.initials];
  }

  get targetWidth(): number {
    return Math.sqrt(this.measureWidth(this.initials.trim()) * this.lineHeight);
  }

  get radius(): number {
    return Math.max(this.size / 2, 4);
  }

  private generateLines(): IconLine[] {
    let line: IconLine;
    let lineWidth0 = Infinity;
    const result = [];
    for (let i = 0, n = this.words.length; i < n; ++i) {
      const lineText1 = (line ? line.text + ' ' : '') + this.words[i];
      const lineWidth1 = this.measureWidth(lineText1);
      if ((lineWidth0 + lineWidth1) / 2 < this.targetWidth) {
        line.width = lineWidth0 = lineWidth1;
        line.text = lineText1;
      } else {
        lineWidth0 = this.measureWidth(this.words[i]);
        line = {width: lineWidth0, text: this.words[i]};
        result.push(line);
      }
    }
    return result;
  }

  private generateUniqueBackgroundColor(username: string): string {
    const colors = [
      '#546E7A',
      '#D32F2F',
      '#D81B60',
      '#9C27B0',
      '#673AB7',
      '#3F51B5',
      '#1976D2',
      '#006064',
      '#00796B',
      '#2E7D32',
      '#33691E',
      '#BF360C',
      '#8D6E63',
      '#4A148C',
      '#5C6BC0',
    ];

    let sum = 0;
    for (let i = 0; i < username?.length; i++) {
      sum += username?.charCodeAt(i);
    }
    return colors[sum % colors.length];
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substring(2);
  }

  measureWidth(text: string): number {
    const context = document.createElement('canvas').getContext('2d');
    return context.measureText(text).width;
  }

  async drawUserIcon(): Promise<void> {
    const svgElement = this.svg?.nativeElement;
    if (!svgElement) {
      return;
    }

    const renderSequence = ++this.renderSequence;
    const backgroundUrl = await this.backgroundUrl();
    if (renderSequence !== this.renderSequence) {
      return;
    }

    // TODO: Consider caching SVG on a per-user basis
    // clear svg
    d3.select(svgElement).selectAll('*').remove();
    // if this.unselected is undefined or true
    if (this.unselected) {
      // hide div from DOM (but don't remove it)
      svgElement.style.display = 'none';
    } else {
      // add div to DOM
      svgElement.style.display = 'block';
    }
    const lines = this.generateLines();

    let textRadius = 0;
    for (let i = 0, n = lines.length; i < n; ++i) {
      const dy = (Math.abs(i - n / 2 + 0.5) + 0.5) * this.lineHeight;
      const dx = lines[i].width / 2;
      textRadius = Math.max(textRadius, Math.sqrt(dx ** 2 + dy ** 2));
    }

    const svg = d3
      .select(svgElement)
      .style('font', '8px sans-serif')
      .attr('width', this.size)
      .attr('shape-rendering', 'geometricPrecision')
      .attr('font-smooth', 'antialiased')
      .attr('height', this.size)
      .attr('text-anchor', 'middle');

    function appendCircle(selection: D3Selection, size: number, radius: number) {
      selection
        .append('circle')
        .attr('cx', size / 2)
        .attr('cy', size / 2)
        .attr('r', radius);
    }

    const id = this.generateUniqueId();
    const defs = svg.append('defs');

    defs
      .append('clipPath')
      .attr('id', `image-clip-${id}`)
      .call(appendCircle, this.size, this.radius);

    svg
      .append('circle')
      .attr('cx', this.size / 2)
      .attr('cy', this.size / 2)
      .attr('r', this.radius)
      .attr('fill', this.generateUniqueBackgroundColor(this.user?.name));

    svg
      .append('text')
      .attr(
        'transform',
        `translate(${this.size / 2},${this.size / 2}) scale(${this.radius / textRadius})`,
      )
      .selectAll('tspan')
      .data(lines)
      .enter()
      .append('tspan')
      .attr('x', 0)
      .attr('y', (d, i) => (i - 1 / 2 + 0.75) * this.lineHeight)
      .attr('fill', 'white')
      .text((d) => d.text);

    svg
      .append('image')
      .attr('xlink:href', backgroundUrl)
      .attr('width', this.size)
      .attr('height', this.size)
      .attr('x', 0)
      .attr('y', 0)
      .attr('clip-path', `url(#image-clip-${id})`);
  }
}
