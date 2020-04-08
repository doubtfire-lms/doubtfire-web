import { Component, Input, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { User } from 'src/app/api/models/user/user';
import { currentUser } from 'src/app/ajs-upgraded-providers';
import { Md5 } from 'ts-md5/dist/md5';
import * as d3 from 'd3';

@Component({
  selector: 'user-icon',
  templateUrl: './user-icon.component.html',
  styleUrls: ['./user-icon.component.scss']
})

export class UserIconComponent implements AfterViewInit {
  @Input() user: User = this.currentUser.profile;
  @Input() size: number = 100;
  @Input() email: string = this.user.email;

  @ViewChild('svg') svg;

  constructor(
    @Inject(currentUser) private currentUser: any,
  ) {

  }

  // measureWidth = {
  //   const context = document.createElement("canvas").getContext("2d");
  //   return text => context.measureText(text).width;
  // }

  measureWidth(text) {
    const context = document.createElement('canvas').getContext('2d');
    return context.measureText(text).width;
  }

  ngAfterViewInit(): void {

    const radius = Math.min(this.size, this.size) / 2 - 4;

    let initials = (this.user?.name != null) ? this.user.name.split(' ') : '  ';
    initials = (initials.length > 1) ? (`${initials[0][0]}${initials[1][0]}`).toUpperCase() : '  ';
    let words = [initials];

    const lineHeight = 12;

    const targetWidth = Math.sqrt(this.measureWidth(initials.trim()) * lineHeight);

    let line;
    let lineWidth0 = Infinity;
    const lines = [];
    for (let i = 0, n = words.length; i < n; ++i) {
      let lineText1 = (line ? line.text + ' ' : '') + words[i];
      let lineWidth1 = this.measureWidth(lineText1);
      if ((lineWidth0 + lineWidth1) / 2 < targetWidth) {
        line.width = lineWidth0 = lineWidth1;
        line.text = lineText1;
      } else {
        lineWidth0 = this.measureWidth(words[i]);
        line = { width: lineWidth0, text: words[i] };
        lines.push(line);
      }
    }

    let textRadius = 0;
    for (let i = 0, n = lines.length; i < n; ++i) {
      const dy = (Math.abs(i - n / 2 + 0.5) + 0.5) * lineHeight;
      const dx = lines[i].width / 2;
      textRadius = Math.max(textRadius, Math.sqrt(dx ** 2 + dy ** 2));
    }

    const svg = d3.select(this.svg.nativeElement)
      .style('font', '10px sans-serif')
      .style('max-width', '100%')
      .style('height', 'auto')
      .attr('text-anchor', 'middle');

    svg.append('circle')
      .attr('cx', this.size / 2)
      .attr('cy', this.size / 2)
      .attr('fill', '#ccc')
      .attr('r', radius);

    svg.append('text')
      .attr('transform', `translate(${this.size / 2},${this.size / 2}) scale(${radius / textRadius})`)
      .selectAll('tspan')
      .data(lines)
      .enter().append('tspan')
      .attr('x', 0)
      .attr('y', (d, i) => (i - 1 / 2 + 0.8) * lineHeight)
      .text(d => d.text);

    // return svg.node();

  }

}

//   get targetWidth() {
//     return Math.sqrt(this.measureWidth * this.lineHeight);
//   }

//   // this is an offscreen canvase just to see how wide the text is.
//   get measureWidth() {
//     const context = document.createElement('canvas').getContext('2d');
//     return context.measureText(this.initials.trim()).width;
//   }

//   // lines() {
//   //   let line;
//   //   let lineWidth0 = Infinity;
//   //   const lines = [];
//   //   for (let i = 0, n = this.initials.length; i < n; ++i) {
//   //     let lineText1 = (line ? line.text + ' ' : "") + this.initials[i];
//   //     let lineWidth1 = measureWidth(lineText1);
//   //     if ((lineWidth0 + lineWidth1) / 2 < targetWidth) {
//   //       line.width = lineWidth0 = lineWidth1;
//   //       line.text = lineText1;
//   //     } else {
//   //       lineWidth0 = measureWidth(this.initials[i]);
//   //       line = { width: lineWidth0, text: this.initials[i] };
//   //       lines.push(line);
//   //     }
//   //   }
//   //   return lines;
//   // }

//   calculateSVGCircle() {
//     const width = this.size;
//     const height = width;
//     const radius = Math.min(width, height) / 2 - 4;

//     const svg = d3.select(this.svg)
//       .style('font', '10px sans-serif')
//       .style('max-width', '100%')
//       .style('height', 'auto')
//       .attr('text-anchor', 'middle');

//     svg.append('circle')
//       .attr('cx', width / 2)
//       .attr('cy', height / 2)
//       .attr('fill', '#ccc')
//       .attr('r', radius);

//     svg.append('text')
//       .attr('transform', `translate(${width / 2},${height / 2}) scale(${radius / textRadius})`)
//       .selectAll('tspan')
//       .data(lines)
//       .enter().append('tspan')
//       .attr('x', 0)
//       .attr('y', (d, i) => (i - lines.length / 2 + 0.8) * lineHeight)
//       .text(d => d.text);

//     return svg.node();

//   }

//   get backgroundUrl(): string {
//     let hash = this.email != null ? Md5.hashStr(this.email.trim().toLowerCase()) : Md5.hashStr('');
//     return `https://www.gravatar.com/avatar/${hash}.png?default=blank&size=${this.size}`;
//   }

//   userBackgroundStyle(email: string): object {
//     // Gravatar hash
//     let hash = email != null ? Md5.hashStr(this.email.trim().toLowerCase()) : Md5.hashStr('');

//     let backgroundUrl = `https://www.gravatar.com/avatar/${hash}.png?default=blank&size=${this.size}`;
//     return {
//       'background-image': `url('${backgroundUrl}')`
//     };
//   }

//   get textRadius() {
//     let radius = 0;

//     const dy = (Math.abs(i - n / 2 + 0.5) + 0.5) * this.lineHeight;
//     const dx = lines[i].width / 2;
//     radius = Math.max(radius, Math.sqrt(dx ** 2 + dy ** 2));
//     return radius;
//   }

//   get componentSize() {
//     return {
//       'width.px': this.size,
//       'height.px': this.size,
//       'min.width.px': this.size,
//       'min.height.px': this.size
//     };
//   }

//   get initials() {
//     let initials = (this.user?.name != null) ? this.user.name.split(' ') : '  ';
//     return (initials.length > 1) ? (`${initials[0][0]}${initials[1][0]}`).toUpperCase() : '  ';
//   }
// }


// angular.module('doubtfire.common.user-icon', [])
// .directive('userIcon', ->
//   restrict: 'E'
//   replace: true
//   scope:
//     user: '=?'
//     size: '=?'
//     email: '=?'
//   templateUrl: 'common/user-icon/user-icon.tpl.html'
//   controller: (this, $http, currentUser, md5) ->
//     $scope.user ?= currentUser.profile
//     $scope.size ?= 100
//     $scope.email ?= $scope.user.email

//     $scope.userBackgroundStyle = (email) ->
//       # Gravatar hash
//       hash = if (email) then md5.createHash(email.trim().toLowerCase()) else md5.createHash('')
//       backgroundUrl = 'https://www.gravatar.com/avatar/#{hash}.png?default=blank&size=#{$scope.size}'
//       'background-image: url('#{backgroundUrl}')'

//     $scope.initials = (->
//       initials = if ($scope.user && $scope.user.name) then $scope.user.name.split(' ') else '  '
//       if initials.length > 1 then ('#{initials[0][0]}#{initials[1][0]}').toUpperCase() else '  '
//     )()
// )
