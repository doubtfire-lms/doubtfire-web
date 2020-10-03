import { Component, Input, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { User } from 'src/app/api/models/user/user';
import { currentUser } from 'src/app/ajs-upgraded-providers';
import { Md5 } from 'ts-md5/dist/md5';
import * as d3 from 'd3';

@Component({
  selector: 'user-icon',
  templateUrl: './user-icon.component.html',
  styleUrls: ['./user-icon.component.scss'],
})
export class UserIconComponent implements AfterViewInit {
  @Input() user: User = this.currentUserRef.profile;
  @Input() size: number = 100;
  @Input() email: string = this.user.email;

  @ViewChild('svg') svg;

  lineHeight = 12;

  constructor(@Inject(currentUser) private currentUserRef: any) {}

  get backgroundUrl(): string {
    const hash = this.email != null ? Md5.hashStr(this.email.trim().toLowerCase()) : Md5.hashStr('');
    return `https://www.gravatar.com/avatar/${hash}.png?default=blank&size=${this.size * 4}`;
  }

  get initials(): string {
    const result = this.user?.name != null ? this.user.name.split(' ') : '  ';
    return result.length > 1 ? `${result[0][0]}${result[1][0]}`.toUpperCase() : '  ';
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

  private generateLines(): any[] {
    let line;
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
        line = { width: lineWidth0, text: this.words[i] };
        result.push(line);
      }
    }
    return result;
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substring(2);
  }

  measureWidth(text: string): number {
    const context = document.createElement('canvas').getContext('2d');
    return context.measureText(text).width;
  }

  ngAfterViewInit(): void {
    const lines = this.generateLines();

    let textRadius = 0;
    for (let i = 0, n = lines.length; i < n; ++i) {
      const dy = (Math.abs(i - n / 2 + 0.5) + 0.5) * this.lineHeight;
      const dx = lines[i].width / 2;
      textRadius = Math.max(textRadius, Math.sqrt(dx ** 2 + dy ** 2));
    }

    const svg = d3
      .select(this.svg.nativeElement)
      .style('font', '10px sans-serif')
      .attr('width', this.size)
      .attr('height', this.size)
      .attr('text-anchor', 'middle');

    function appendCircle(selection, size, radius) {
      selection
        .append('circle')
        .attr('cx', size / 2)
        .attr('cy', size / 2)
        .attr('r', radius);
    }

    const id = this.generateUniqueId();
    const defs = svg.append('defs');

    defs.append('clipPath').attr('id', `image-clip-${id}`).call(appendCircle, this.size, this.radius);

    svg
      .append('circle')
      .attr('cx', this.size / 2)
      .attr('cy', this.size / 2)
      .attr('r', this.radius)
      .attr('fill', '#9e9e9e');

    svg
      .append('text')
      .attr('transform', `translate(${this.size / 2},${this.size / 2}) scale(${this.radius / textRadius})`)
      .selectAll('tspan')
      .data(lines)
      .enter()
      .append('tspan')
      .attr('x', 0)
      .attr('y', (d, i) => (i - 1 / 2 + 0.8) * this.lineHeight)
      .attr('fill', 'white')
      .text((d) => d.text);

    svg
      .append('image')
      .attr('xlink:href', this.backgroundUrl)
      .attr('width', this.size)
      .attr('height', this.size)
      .attr('x', 0)
      .attr('y', 0)
      .attr('clip-path', `url(#image-clip-${id})`);
  }
}
